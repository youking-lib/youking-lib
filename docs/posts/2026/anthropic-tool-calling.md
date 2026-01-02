---
title: Anthropic 提示词学习指南 - 2 工具调用设计模式
date: 2026-01-02
tags: [AI, Prompt]
---

# 工具调用设计模式

## 概述

Anthropic 的提示词中包含了丰富的工具调用（Function Calling）设计模式。这些模式展示了如何定义工具、指导模型选择工具、以及处理工具调用结果。

## 1. 工具定义规范

### 1.1 工具定义结构

每个工具定义包含以下元素：

```json
{
  "name": "工具名称",
  "description": "工具功能描述",
  "parameters": {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["必需参数"],
    "properties": {
      "参数名": {
        "type": "参数类型",
        "description": "参数说明"
      }
    }
  }
}
```

### 1.2 实际工具定义示例

从 `calude_code_cli_tools.md` 提取的 Read 工具定义：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "additionalProperties": false,
  "required": ["file_path"],
  "properties": {
    "file_path": {
      "type": "string",
      "description": "The absolute path to the file to read"
    },
    "offset": {
      "type": "number",
      "description": "The line number to start reading from. Only provide if the file is too large to read at once"
    },
    "limit": {
      "type": "number",
      "description": "The number of lines to read. Only provide if the file is too large to read at once."
    }
  }
}
```

### 1.3 工具描述最佳实践

1. **说明用途**: 工具能做什么
2. **说明限制**: 什么情况下不能用
3. **说明参数**: 每个参数的含义和取值
4. **说明输出**: 返回什么样的结果

示例（web_search 工具描述）：
```
Claude has access to web_search and other tools for info retrieval. 
The web_search tool uses a search engine, which returns the top 10 
most highly ranked results from the web. Use web_search when you 
need current information you don't have, or when information may 
have changed since the knowledge cutoff.
```

## 2. 工具选择决策框架

### 2.1 决策树模式

Anthropic 使用决策树来指导工具选择：

```
IF 时间引用被提及 → recent_chats
ELSE IF 特定主题被提及 → conversation_search
ELSE IF 同时有时间和主题 →
    IF 有具体时间范围 → recent_chats
    ELSE IF 有2+关键词 → conversation_search
    ELSE → recent_chats
ELSE IF 引用模糊 → 询问澄清
ELSE → 不使用工具
```

### 2.2 查询复杂度分类

搜索功能根据查询复杂度决定调用次数：

| 类别 | 工具调用次数 | 示例 |
|------|--------------|------|
| 永不搜索 | 0 | 基础知识、历史事实 |
| 不搜索但提供 | 0 + 提议 | 年度统计数据 |
| 单次搜索 | 1 | 实时数据、近期事件 |
| 研究型 | 2-20 | 复杂分析、报告生成 |

### 2.3 工具优先级

```
优先级 1: 内部工具 (Google Drive, Slack, Calendar)
         用于个人/公司数据

优先级 2: 网络工具 (web_search, web_fetch)
         用于外部信息

优先级 3: 组合使用
         用于比较性查询 (我们的表现 vs 行业)
```

## 3. 工具调用行为规范

### 3.1 调用前检查

```xml
<before_using_tool>
1. 是否真的需要工具？能否直接回答？
2. 使用哪个工具最合适？
3. 参数是否完整？
4. 是否需要多个工具配合？
</before_using_tool>
```

### 3.2 并行调用

当多个工具调用相互独立时，应该并行执行：

```xml
<parallel_tool_calls>
如果要调用多个工具且调用之间没有依赖关系，
在同一个 function_calls 块中发起所有独立调用。

示例场景：
- 读取 3 个不同的文件
- 同时搜索网络和内部文档
- 获取多个独立的 API 数据
</parallel_tool_calls>
```

### 3.3 调用后处理

```xml
<after_tool_response>
1. 验证结果是否回答了问题
2. 如果结果不足，考虑：
   - 使用不同参数重试
   - 使用其他工具补充
   - 告知用户限制
3. 综合结果生成响应
4. 引用来源（如适用）
</after_tool_response>
```

## 4. 特定工具设计模式

### 4.1 搜索工具模式

**关键设计要素**：

1. **查询简洁**: 1-6 个词最佳
2. **渐进细化**: 先广泛后具体
3. **避免重复**: 不重复相似查询
4. **使用 web_fetch**: 获取完整网页内容

```xml
<web_search_pattern>
第一次搜索: 广泛关键词 (1-2 个词)
    ↓
检查结果
    ↓
如果不足 → 添加限定词细化
    ↓
如果需要详情 → 使用 web_fetch 获取完整页面
</web_search_pattern>
```

### 4.2 文件操作工具模式

```xml
<file_tool_pattern>
<!-- 读取前 -->
1. 验证文件存在
2. 检查是否已在上下文中

<!-- 写入前 -->
1. 确认目标目录存在
2. 检查是否会覆盖重要文件

<!-- 操作后 -->
1. 验证操作成功
2. 运行 lint/typecheck（如适用）
</file_tool_pattern>
```

### 4.3 记忆/历史工具模式

```xml
<memory_tool_pattern>
触发条件检测:
- 显式引用: "我们之前讨论过..."
- 时间引用: "昨天聊的那个..."
- 隐式信号: "那个项目", "继续那个"

工具选择:
- 话题搜索 → conversation_search
- 时间过滤 → recent_chats
- 两者都有 → 根据具体情况选择

结果处理:
- 自然地整合信息
- 不要直接引用片段
- 提供对话链接
</memory_tool_pattern>
```

## 5. 工具使用禁令

### 5.1 禁止的命令

```
被禁止的命令（安全原因）:
- curl, wget, axel (网络下载)
- nc, telnet (网络连接)
- chrome, firefox, safari (浏览器)
- alias (别名定义)
```

### 5.2 工具使用限制

```xml
<tool_restrictions>
1. 不要用 cat/head/tail 读文件 → 使用专用读取工具
2. 不要用 sed/awk 编辑文件 → 使用专用编辑工具
3. 不要用 grep/find 搜索 → 使用语义搜索工具
4. 不要在 shell 中输出内容与用户沟通 → 直接响应
</tool_restrictions>
```

## 6. 错误处理模式

### 6.1 工具调用失败

```xml
<error_handling>
如果工具调用失败:
1. 检查错误类型
   - 权限问题 → 请求所需权限
   - 参数错误 → 修正后重试
   - 资源不存在 → 告知用户
   
2. 尝试替代方案
   - 使用其他工具
   - 修改查询策略
   
3. 优雅降级
   - 告知限制
   - 提供可行的替代建议
</error_handling>
```

### 6.2 结果不足

```xml
<insufficient_results>
如果搜索结果不足:
1. 使用不同关键词重试
2. 扩大或缩小搜索范围
3. 使用 web_fetch 获取更多详情
4. 告知用户当前信息限制

如果超过合理尝试次数:
- 总结已获得的信息
- 建议使用高级研究功能
</insufficient_results>
```

## 7. 实践练习

### 练习 1: 决策框架设计

为以下场景设计工具选择决策框架：
- 用户查询可能需要代码执行
- 有多个代码执行环境可选（Python, Node.js, Shell）
- 某些操作需要用户确认

### 练习 2: 工具定义

定义一个"数据库查询"工具：
- 需要指定数据库、表、查询条件
- 支持分页
- 限制返回结果数量

### 练习 3: 错误处理

设计一个文件编辑工具的完整错误处理流程：
- 文件不存在
- 权限不足
- 内容冲突
- 磁盘空间不足

## 8. 关键要点

1. **工具定义要完整**: 包含名称、描述、参数、限制
2. **决策框架要清晰**: 使用 IF-ELSE 结构指导选择
3. **调用要高效**: 并行独立调用，避免重复
4. **错误要处理**: 考虑各种失败场景
5. **安全要优先**: 遵守工具使用限制

---

下一模块：[模块 3: 安全边界与约束设计](/posts/2026/anthropic-safety-boundaries)

