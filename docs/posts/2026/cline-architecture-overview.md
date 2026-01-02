---
title: Cline 源码学习 - 1 架构概述
date: 2026-01-08
tags: [AI, Cline, 源码学习]
---

# Cline 架构概述

## 1. 总体架构

Cline 是一个 VS Code AI 编程助手扩展，其核心架构如下：

```
Extension Entry (extension.ts)
    ↓
WebviewProvider (UI 管理)
    ↓
Controller (消息处理与任务管理)
    ↓
Task (API 请求与工具执行)
```

### 核心目录结构

```
src/core/
├── webview/          # WebView 生命周期管理
├── controller/       # 处理 WebView 消息和任务管理
├── task/             # 执行 API 请求和工具操作
│   ├── tools/        # 工具处理器
│   └── focus-chain/  # 焦点链管理
├── prompts/          # System Prompt 构建
├── context/          # 上下文管理
├── mentions/         # @提及解析
├── assistant-message/ # 消息解析
├── storage/          # 状态持久化
├── hooks/            # Hook 系统
└── workspace/        # 工作区管理
```

## 2. 核心流程

### 2.1 用户发送消息到 AI 响应

```
用户输入
    ↓
解析 @mentions (parseMentions) → 获取文件/URL/终端等上下文
    ↓
构建 System Prompt (PromptRegistry) → 包含工具定义、规则等
    ↓
构建完整的 API 消息 (apiConversationHistory)
    ↓
调用大模型 API (ApiHandler.createMessage)
    ↓
流式解析响应 (parseAssistantMessageV2)
    ↓
执行工具 (ToolExecutor) / 显示文本
    ↓
将工具结果追加到用户消息
    ↓
继续下一轮对话 (agentic loop)
```

### 2.2 核心类职责

| 类名 | 职责 |
|------|------|
| `Task` | 管理整个任务生命周期，包括消息循环、API 请求、工具执行 |
| `ToolExecutor` | 协调工具执行，管理工具处理器 |
| `ContextManager` | 管理对话上下文、处理 Token 限制、上下文压缩 |
| `PromptRegistry` | 管理 System Prompt 模板和变体 |
| `DiffViewProvider` | 处理代码编辑的 Diff 视图 |
| `StateManager` | 管理全局设置和状态 |
| `MessageStateHandler` | 管理对话消息状态 |

## 3. 消息处理流程

### 3.1 启动任务 (startTask)

```typescript
// 1. 初始化
this.messageStateHandler.setClineMessages([])
this.messageStateHandler.setApiConversationHistory([])

// 2. 构建用户内容
const userContent: ClineUserContent[] = [
  { type: "text", text: `<task>\n${task}\n</task>` },
  ...imageBlocks,
]

// 3. 运行 Hook (可选)
const taskStartResult = await executeHook({ hookName: "TaskStart", ... })

// 4. 进入任务循环
await this.initiateTaskLoop(userContent)
```

### 3.2 任务循环 (initiateTaskLoop)

```typescript
private async initiateTaskLoop(userContent: ClineContent[]): Promise<void> {
  let nextUserContent = userContent
  
  while (!this.taskState.abort) {
    // 执行一轮 API 请求
    const didEndLoop = await this.recursivelyMakeClineRequests(nextUserContent)
    
    if (didEndLoop) {
      break
    } else {
      // 如果 AI 没有使用任何工具，提示继续
      nextUserContent = [{
        type: "text",
        text: formatResponse.noToolsUsed(this.useNativeToolCalls),
      }]
    }
  }
}
```

### 3.3 API 请求 (attemptApiRequest)

```typescript
async *attemptApiRequest(previousApiReqIndex: number): ApiStream {
  // 1. 等待 MCP 服务器连接
  await pWaitFor(() => this.mcpHub.isConnecting !== true)
  
  // 2. 构建 System Prompt 上下文
  const promptContext: SystemPromptContext = {
    cwd: this.cwd,
    providerInfo,
    supportsBrowserUse,
    mcpHub: this.mcpHub,
    globalClineRulesFileInstructions,
    localClineRulesFileInstructions,
    // ... 更多配置
  }
  
  // 3. 获取 System Prompt 和工具定义
  const { systemPrompt, tools } = await getSystemPrompt(promptContext)
  
  // 4. 获取上下文管理后的对话历史
  const contextManagementMetadata = await this.contextManager.getNewContextMessagesAndMetadata(
    this.messageStateHandler.getApiConversationHistory(),
    // ...
  )
  
  // 5. 调用 API
  const stream = this.api.createMessage(
    systemPrompt,
    contextManagementMetadata.truncatedConversationHistory,
    tools
  )
  
  yield* stream
}
```

## 4. 工具系统

### 4.1 工具注册

Cline 使用协调器模式管理工具：

```typescript
// ToolExecutor.registerToolHandlers()
this.coordinator.register(new ListFilesToolHandler(validator))
this.coordinator.register(new ReadFileToolHandler(validator))
this.coordinator.register(new WriteToFileToolHandler(validator))
this.coordinator.register(new SearchFilesToolHandler(validator))
this.coordinator.register(new ExecuteCommandToolHandler(validator))
// ... 更多工具
```

### 4.2 工具处理器接口

```typescript
interface IFullyManagedTool {
  readonly name: ClineDefaultTool
  
  getDescription(block: ToolUse): string
  
  // 处理流式部分块 (用于 UI 更新)
  handlePartialBlock(block: ToolUse, uiHelpers: StronglyTypedUIHelpers): Promise<void>
  
  // 执行完整工具操作
  execute(config: TaskConfig, block: ToolUse): Promise<ToolResponse>
}
```

### 4.3 内置工具列表

| 工具名 | 功能 |
|--------|------|
| `read_file` | 读取文件内容 |
| `write_to_file` | 创建/覆写文件 |
| `replace_in_file` | 使用 SEARCH/REPLACE 块编辑文件 |
| `search_files` | 正则搜索文件 |
| `list_files` | 列出目录内容 |
| `execute_command` | 执行终端命令 |
| `browser_action` | 浏览器自动化 |
| `ask_followup_question` | 向用户提问 |
| `attempt_completion` | 完成任务 |
| `use_mcp_tool` | 使用 MCP 工具 |

## 5. 消息解析

### 5.1 AI 响应解析 (parseAssistantMessageV2)

Cline 使用自定义 XML 格式解析 AI 响应：

```xml
<read_file>
<path>src/main.ts</path>
</read_file>
```

解析器将其转换为结构化对象：

```typescript
type ToolUse = {
  type: "tool_use"
  name: ClineDefaultTool
  params: Record<ToolParamName, string>
  partial: boolean  // 是否为流式部分块
}
```

### 5.2 流式处理

```typescript
// 解析流式响应
const assistantMessage: AssistantMessageContent[] = parseAssistantMessageV2(accumulatedContent)

// 逐块处理
for (const block of assistantMessage) {
  if (block.type === "tool_use") {
    if (block.partial) {
      // 更新 UI 预览
      await handler.handlePartialBlock(block, uiHelpers)
    } else {
      // 执行完整工具
      await this.toolExecutor.executeTool(block)
    }
  } else if (block.type === "text") {
    // 显示文本
    await this.say("text", block.content)
  }
}
```

## 6. 状态管理

### 6.1 TaskState

```typescript
class TaskState {
  abort: boolean = false
  isStreaming: boolean = false
  didRejectTool: boolean = false
  didAlreadyUseTool: boolean = false
  consecutiveMistakeCount: number = 0
  userMessageContent: ClineContent[] = []
  assistantMessageContent: AssistantMessageContent[] = []
  // ...
}
```

### 6.2 消息持久化

```typescript
// 保存到磁盘
await this.messageStateHandler.saveClineMessagesAndUpdateHistory()
await this.messageStateHandler.overwriteApiConversationHistory(apiHistory)

// 从磁盘加载
const savedClineMessages = await getSavedClineMessages(this.taskId)
const savedApiHistory = await getSavedApiConversationHistory(this.taskId)
```

## 7. 下一步学习

- [02-context-and-file-retrieval.md](/posts/2026/cline-context-and-file-retrieval) - 上下文关联与代码文件获取
- [03-code-generation-and-editing.md](/posts/2026/cline-code-generation-and-editing) - 代码生成与编辑执行
- [04-core-components.md](/posts/2026/cline-core-components) - 核心组件详解

