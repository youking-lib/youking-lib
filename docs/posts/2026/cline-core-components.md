---
title: Cline 源码学习 - 4 核心组件详解
date: 2026-01-08
tags: [AI, Cline, 源码学习]
---

# 核心组件详解

## 1. System Prompt 系统

### 1.1 架构概览

```
PromptRegistry (单例)
    ↓
PromptBuilder (构建器)
    ↓
TemplateEngine (模板引擎)
    ↓
Components (组件函数)
```

### 1.2 PromptRegistry

管理不同模型的 Prompt 变体：

```typescript
// 位置: src/core/prompts/system-prompt/registry/PromptRegistry.ts

export class PromptRegistry {
  private static instance: PromptRegistry
  private variants: Map<string, PromptVariant> = new Map()
  private components: ComponentRegistry = {}
  
  static getInstance(): PromptRegistry {
    if (!PromptRegistry.instance) {
      PromptRegistry.instance = new PromptRegistry()
    }
    return PromptRegistry.instance
  }
  
  async get(context: SystemPromptContext): Promise<string> {
    await this.load()
    
    // 根据模型找到匹配的变体
    const family = this.getModelFamily(context)
    const variant = this.variants.get(family)
    
    // 构建 Prompt
    const builder = new PromptBuilder(variant, context, this.components)
    return await builder.build()
  }
  
  getModelFamily(context: SystemPromptContext): ModelFamily {
    for (const [_, variant] of this.variants.entries()) {
      if (variant.matcher(context)) {
        return variant.family
      }
    }
    return ModelFamily.GENERIC  // 默认
  }
}
```

### 1.3 PromptVariant

定义模型特定的 Prompt 配置：

```typescript
// 位置: src/core/prompts/system-prompt/types.ts

interface PromptVariant {
  id: string
  family: ModelFamily
  version: number
  
  // 匹配函数
  matcher: (context: SystemPromptContext) => boolean
  
  // 基础模板
  baseTemplate: string
  
  // 组件顺序
  componentOrder: string[]
  
  // 工具列表
  tools?: ClineDefaultTool[]
  
  // 占位符
  placeholders: Record<string, unknown>
  
  // 标签
  tags: string[]
  labels: Record<string, string>
}
```

### 1.4 组件示例

```typescript
// 位置: src/core/prompts/system-prompt/components/

// agent_role.ts - 定义 AI 角色
export async function agentRole(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
  return `You are Cline, a highly skilled software engineer with extensive knowledge in many programming languages, frameworks, design patterns, and best practices.`
}

// capabilities.ts - 定义能力
export async function capabilities(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
  let caps = `
## CAPABILITIES

- You can read and analyze code in any programming language
- You can write code, fix bugs, and implement features
- You can execute terminal commands
- You can interact with web browsers
`
  
  if (context.supportsBrowserUse) {
    caps += `- You can automate browser actions for testing\n`
  }
  
  return caps
}

// rules.ts - 加载规则
export async function rules(variant: PromptVariant, context: SystemPromptContext): Promise<string> {
  let rules = ""
  
  if (context.globalClineRulesFileInstructions) {
    rules += `\n## Global Rules\n${context.globalClineRulesFileInstructions}\n`
  }
  
  if (context.localClineRulesFileInstructions) {
    rules += `\n## Project Rules\n${context.localClineRulesFileInstructions}\n`
  }
  
  return rules
}
```

### 1.5 PromptBuilder

```typescript
// 位置: src/core/prompts/system-prompt/registry/PromptBuilder.ts

export class PromptBuilder {
  private templateEngine: TemplateEngine
  
  async build(): Promise<string> {
    // 1. 构建所有组件
    const componentSections = await this.buildComponents()
    
    // 2. 准备占位符
    const placeholderValues = this.preparePlaceholders(componentSections)
    
    // 3. 解析模板
    const prompt = this.templateEngine.resolve(
      this.variant.baseTemplate,
      this.context,
      placeholderValues
    )
    
    // 4. 后处理 (清理空行等)
    return this.postProcess(prompt)
  }
  
  private async buildComponents(): Promise<Record<string, string>> {
    const sections: Record<string, string> = {}
    
    for (const componentId of this.variant.componentOrder) {
      const componentFn = this.components[componentId]
      const result = await componentFn(this.variant, this.context)
      if (result?.trim()) {
        sections[componentId] = result
      }
    }
    
    return sections
  }
  
  // 构建工具 Prompt
  static async getToolsPrompts(variant: PromptVariant, context: SystemPromptContext) {
    const enabledTools = this.getEnabledTools(variant, context)
    return Promise.all(enabledTools.map(tool => this.tool(tool.config, context)))
  }
  
  static tool(config: ClineToolSpec, context: SystemPromptContext): string {
    const title = `## ${config.id}`
    const description = `Description: ${config.description}`
    
    // 参数列表
    const paramList = config.parameters.map(p => {
      const requiredText = p.required ? "required" : "optional"
      return `- ${p.name}: (${requiredText}) ${p.instruction}`
    })
    
    // 使用示例
    const usage = [
      `<${config.id}>`,
      ...config.parameters.map(p => `<${p.name}>${p.usage || ""}</${p.name}>`),
      `</${config.id}>`,
    ]
    
    return [title, description, "Parameters:", ...paramList, "Usage:", ...usage].join("\n")
  }
}
```

## 2. API Handler 系统

### 2.1 Provider 抽象

```typescript
// 位置: src/core/api/providers/

// 基础接口
interface ApiHandler {
  createMessage(
    systemPrompt: string,
    messages: MessageParam[],
    tools?: ClineTool[]
  ): AsyncGenerator<ApiStreamEvent>
  
  getModel(): { id: string; info: ModelInfo }
}

// Anthropic 实现
export class AnthropicHandler implements ApiHandler {
  async *createMessage(systemPrompt, messages, tools): ApiStream {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: this.maxTokens,
      system: systemPrompt,
      messages: this.formatMessages(messages),
      tools: tools ? this.formatTools(tools) : undefined,
      stream: true,
    })
    
    for await (const event of response) {
      if (event.type === "content_block_delta") {
        yield { type: "text", text: event.delta.text }
      }
      // ... 处理其他事件
    }
  }
}

// OpenAI 实现
export class OpenAIHandler implements ApiHandler {
  async *createMessage(systemPrompt, messages, tools): ApiStream {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        ...this.formatMessages(messages),
      ],
      tools: tools ? this.formatTools(tools) : undefined,
      stream: true,
    })
    
    for await (const chunk of response) {
      if (chunk.choices[0]?.delta?.content) {
        yield { type: "text", text: chunk.choices[0].delta.content }
      }
    }
  }
}
```

### 2.2 工具格式转换

```typescript
// 位置: src/core/api/transform/

// Anthropic 格式
export function toAnthropicTools(tools: ClineTool[]): Anthropic.Tool[] {
  return tools.map(tool => ({
    name: tool.name,
    description: tool.description,
    input_schema: tool.input_schema,
  }))
}

// OpenAI 格式
export function toOpenAITools(tools: ClineTool[]): OpenAI.ChatCompletionTool[] {
  return tools.map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.input_schema,
    },
  }))
}
```

### 2.3 重试机制

```typescript
// 位置: src/core/api/retry.ts

export async function* withRetry<T>(
  generator: () => AsyncGenerator<T>,
  options: RetryOptions
): AsyncGenerator<T> {
  let lastError: Error | undefined
  
  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      yield* generator()
      return
    } catch (error) {
      lastError = error
      
      if (!isRetryableError(error) || attempt === options.maxRetries) {
        throw error
      }
      
      const delay = calculateDelay(attempt, options)
      
      if (options.onRetryAttempt) {
        await options.onRetryAttempt(attempt + 1, options.maxRetries, delay, error)
      }
      
      await sleep(delay)
    }
  }
  
  throw lastError
}

function isRetryableError(error: any): boolean {
  const status = error?.status || error?.response?.status
  return status === 429 || status === 500 || status === 503
}
```

## 3. 工具执行系统

### 3.1 ToolExecutorCoordinator

```typescript
// 位置: src/core/task/tools/ToolExecutorCoordinator.ts

export class ToolExecutorCoordinator {
  private handlers: Map<ClineDefaultTool, IToolHandler> = new Map()
  
  register(handler: IToolHandler): void {
    this.handlers.set(handler.name, handler)
  }
  
  has(toolName: ClineDefaultTool): boolean {
    return this.handlers.has(toolName)
  }
  
  getHandler(toolName: ClineDefaultTool): IToolHandler | undefined {
    return this.handlers.get(toolName)
  }
  
  async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
    const handler = this.handlers.get(block.name)
    if (!handler) {
      throw new Error(`Unknown tool: ${block.name}`)
    }
    
    if ("execute" in handler) {
      return await handler.execute(config, block)
    }
    
    throw new Error(`Handler ${block.name} does not support execute`)
  }
}
```

### 3.2 工具处理器接口

```typescript
// 基础接口
interface IToolHandler {
  readonly name: ClineDefaultTool
  getDescription(block: ToolUse): string
}

// 部分块处理器
interface IPartialBlockHandler {
  handlePartialBlock(block: ToolUse, uiHelpers: UIHelpers): Promise<void>
}

// 完整工具处理器
interface IFullyManagedTool extends IToolHandler, IPartialBlockHandler {
  execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse>
}
```

### 3.3 ToolValidator

```typescript
// 位置: src/core/task/tools/ToolValidator.ts

export class ToolValidator {
  constructor(private clineIgnoreController: ClineIgnoreController) {}
  
  assertRequiredParams(block: ToolUse, ...paramNames: string[]): ValidationResult {
    for (const paramName of paramNames) {
      if (!block.params[paramName]) {
        return { ok: false, error: `Missing required parameter: ${paramName}` }
      }
    }
    return { ok: true }
  }
  
  checkClineIgnorePath(relPath: string): ValidationResult {
    if (this.clineIgnoreController.isPathIgnored(relPath)) {
      return { ok: false, error: `Path is ignored by .clineignore: ${relPath}` }
    }
    return { ok: true }
  }
}
```

## 4. 状态管理

### 4.1 StateManager

```typescript
// 位置: src/core/storage/StateManager.ts

export class StateManager {
  constructor(private context: vscode.ExtensionContext) {}
  
  // 全局设置
  getGlobalSettingsKey<K extends keyof GlobalSettings>(key: K): GlobalSettings[K] {
    return this.context.globalState.get(`settings.${key}`, DEFAULT_SETTINGS[key])
  }
  
  async setGlobalSettingsKey<K extends keyof GlobalSettings>(
    key: K,
    value: GlobalSettings[K]
  ): Promise<void> {
    await this.context.globalState.update(`settings.${key}`, value)
  }
  
  // API 配置
  getApiConfiguration(): ApiConfiguration {
    return {
      actModeApiProvider: this.getGlobalSettingsKey("actModeApiProvider"),
      planModeApiProvider: this.getGlobalSettingsKey("planModeApiProvider"),
      apiKey: this.getSecret("apiKey"),
      // ...
    }
  }
}
```

### 4.2 MessageStateHandler

```typescript
// 位置: src/core/task/message-state.ts

export class MessageStateHandler {
  private clineMessages: ClineMessage[] = []
  private apiConversationHistory: ClineStorageMessage[] = []
  
  // 添加消息
  async addToClineMessages(message: ClineMessage): Promise<void> {
    this.clineMessages.push(message)
    await this.saveClineMessagesAndUpdateHistory()
  }
  
  // 更新消息
  async updateClineMessage(index: number, updates: Partial<ClineMessage>): Promise<void> {
    if (index >= 0 && index < this.clineMessages.length) {
      Object.assign(this.clineMessages[index], updates)
    }
  }
  
  // 保存到磁盘
  async saveClineMessagesAndUpdateHistory(): Promise<void> {
    await this.saveClineMessages()
    await this.updateTaskHistory({
      id: this.taskId,
      ulid: this.ulid,
      clineMessages: this.clineMessages,
      // ...
    })
  }
  
  // API 历史
  getApiConversationHistory(): ClineStorageMessage[] {
    return this.apiConversationHistory
  }
  
  async overwriteApiConversationHistory(history: ClineStorageMessage[]): Promise<void> {
    this.apiConversationHistory = history
    await this.saveApiConversationHistory()
  }
}
```

## 5. MCP (Model Context Protocol) 集成

### 5.1 McpHub

```typescript
// 位置: src/services/mcp/McpHub.ts

export class McpHub {
  private servers: Map<string, McpServer> = new Map()
  
  async connectServer(name: string, config: McpServerConfig): Promise<void> {
    const server = new McpServer(name, config)
    await server.connect()
    this.servers.set(name, server)
  }
  
  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const server = this.servers.get(serverName)
    if (!server) {
      throw new Error(`Server not found: ${serverName}`)
    }
    
    return await server.callTool(toolName, args)
  }
  
  async getResources(serverName: string): Promise<McpResource[]> {
    const server = this.servers.get(serverName)
    return await server?.listResources() ?? []
  }
  
  getConnectedServers(): string[] {
    return Array.from(this.servers.keys())
  }
}
```

### 5.2 MCP 工具处理

```typescript
// 位置: src/core/task/tools/handlers/UseMcpToolHandler.ts

export class UseMcpToolHandler implements IFullyManagedTool {
  readonly name = ClineDefaultTool.USE_MCP_TOOL
  
  async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
    const serverName = block.params.server_name
    const toolName = block.params.tool_name
    const args = JSON.parse(block.params.arguments || "{}")
    
    // 调用 MCP 工具
    const result = await config.services.mcpHub.callTool(serverName, toolName, args)
    
    return JSON.stringify(result, null, 2)
  }
}
```

## 6. 检查点系统

### 6.1 CheckpointManager

```typescript
// 位置: src/integrations/checkpoints/CheckpointTracker.ts

export class CheckpointTracker implements ICheckpointManager {
  private shadow: ShadowGit
  
  async saveCheckpoint(isCompletion?: boolean): Promise<void> {
    // 1. 收集变更文件
    const changedFiles = await this.getChangedFiles()
    
    // 2. 创建 Git 提交
    const commitHash = await this.shadow.commit(
      changedFiles,
      `Checkpoint: ${new Date().toISOString()}`
    )
    
    // 3. 记录检查点
    this.checkpoints.push({
      hash: commitHash,
      timestamp: Date.now(),
      isCompletion,
    })
  }
  
  async restoreCheckpoint(hash: string): Promise<void> {
    // 恢复到指定检查点
    await this.shadow.checkout(hash)
    
    // 通知 UI
    await this.postStateToWebview()
  }
  
  async getCheckpointDiff(hash: string): Promise<string> {
    return await this.shadow.diff(hash)
  }
}
```

## 7. Hook 系统

### 7.1 支持的 Hook

| Hook 名称 | 触发时机 | 用途 |
|-----------|----------|------|
| TaskStart | 任务开始 | 初始化设置 |
| TaskResume | 任务恢复 | 恢复上下文 |
| TaskCancel | 任务取消 | 清理资源 |
| PreToolUse | 工具执行前 | 验证/修改 |
| PostToolUse | 工具执行后 | 日志/后处理 |
| UserPromptSubmit | 用户提交 | 输入预处理 |
| PreCompact | 上下文压缩前 | 保存重要信息 |

### 7.2 Hook 执行

```typescript
// 位置: src/core/hooks/hook-executor.ts

export async function executeHook(options: HookExecutionOptions): Promise<HookResult> {
  const { hookName, hookInput, isCancellable } = options
  
  // 1. 发现 Hook 脚本
  const hookScripts = await discoverHooks(hookName)
  
  if (hookScripts.length === 0) {
    return { executed: false }
  }
  
  // 2. 显示 Hook 消息
  await options.say("hook", JSON.stringify({ hookName, status: "running" }))
  
  // 3. 执行脚本
  const process = new HookProcess(hookScripts[0], hookInput)
  
  if (isCancellable) {
    options.setActiveHookExecution({
      hookName,
      abortController: process.abortController,
    })
  }
  
  try {
    const result = await process.execute()
    
    // 4. 处理结果
    if (result.cancel) {
      return { cancel: true, wasCancelled: result.wasCancelled }
    }
    
    return { contextModification: result.output }
  } finally {
    if (isCancellable) {
      await options.clearActiveHookExecution()
    }
  }
}
```

## 8. 浏览器自动化

### 8.1 BrowserSession

```typescript
// 位置: src/services/browser/BrowserSession.ts

export class BrowserSession {
  private browser?: Browser
  private page?: Page
  
  async launch(): Promise<void> {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: this.viewport,
    })
    this.page = await this.browser.newPage()
  }
  
  async navigate(url: string): Promise<void> {
    await this.page?.goto(url)
  }
  
  async click(selector: string): Promise<void> {
    await this.page?.click(selector)
  }
  
  async type(selector: string, text: string): Promise<void> {
    await this.page?.type(selector, text)
  }
  
  async screenshot(): Promise<string> {
    const buffer = await this.page?.screenshot({ encoding: "base64" })
    return `data:image/png;base64,${buffer}`
  }
  
  async dispose(): Promise<void> {
    await this.browser?.close()
    this.browser = undefined
    this.page = undefined
  }
}
```

## 9. 终端执行

### 9.1 CommandExecutor

```typescript
// 位置: src/integrations/terminal/CommandExecutor.ts

export class CommandExecutor {
  async execute(command: string, timeout?: number): Promise<[boolean, ToolResponse]> {
    // 1. 创建或复用终端
    const terminal = await this.terminalManager.getOrCreateTerminal(this.cwd)
    
    // 2. 执行命令
    await terminal.sendText(command)
    
    // 3. 等待输出
    const output = await this.waitForOutput(terminal, timeout)
    
    // 4. 检查是否还在运行
    if (this.isStillRunning(terminal)) {
      return [true, output]  // 后台运行
    }
    
    return [false, output]  // 已完成
  }
  
  async cancelBackgroundCommand(): Promise<boolean> {
    if (this.activeProcess) {
      this.activeProcess.kill("SIGTERM")
      return true
    }
    return false
  }
}
```

## 10. 扩展性

### 10.1 添加新工具

```typescript
// 1. 定义工具规格 (src/core/prompts/system-prompt/tools/my_tool.ts)
export const myToolSpec: ClineToolSpec = {
  id: ClineDefaultTool.MY_TOOL,
  description: "描述工具功能",
  parameters: [
    {
      name: "param1",
      required: true,
      instruction: "参数说明",
    },
  ],
}

// 2. 实现处理器 (src/core/task/tools/handlers/MyToolHandler.ts)
export class MyToolHandler implements IFullyManagedTool {
  readonly name = ClineDefaultTool.MY_TOOL
  
  async execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse> {
    const param1 = block.params.param1
    // 实现逻辑
    return "结果"
  }
}

// 3. 注册 (src/core/task/ToolExecutor.ts)
this.coordinator.register(new MyToolHandler())
```

### 10.2 添加新 Provider

```typescript
// 1. 实现 Handler (src/core/api/providers/my_provider.ts)
export class MyProviderHandler implements ApiHandler {
  async *createMessage(systemPrompt, messages, tools): ApiStream {
    // 实现 API 调用
  }
  
  getModel(): ModelInfo {
    return { id: "my-model", info: { ... } }
  }
}

// 2. 注册 (src/core/api/index.ts)
export function buildApiHandler(config: ApiConfiguration): ApiHandler {
  switch (config.provider) {
    case "my-provider":
      return new MyProviderHandler(config)
    // ...
  }
}
```

## 总结

Cline 的核心架构设计精良，具有良好的模块化和可扩展性：

1. **System Prompt 系统** - 模板化设计，支持多模型变体
2. **API Handler** - 统一抽象，支持多 Provider
3. **工具系统** - 协调器模式，易于扩展
4. **状态管理** - 清晰的状态流转和持久化
5. **上下文管理** - 智能的 Token 管理和优化
6. **Hook 系统** - 灵活的扩展点

这些设计使 Cline 成为一个功能强大且易于维护的 AI 编程助手。

