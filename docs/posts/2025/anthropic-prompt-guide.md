---
title: Anthropic 提示词学习指南 - 概述
date: 2025-12-31
tags: [AI, Prompt]
---

# Anthropic 提示词学习指南

## 简介

本指南基于 Anthropic 公开泄露的系统提示词，系统分析其设计模式、架构思想和最佳实践。这些提示词代表了业界顶级 AI 公司在 Prompt Engineering 领域的专业积累，是学习专业级提示词设计的珍贵资料。

## 资料索引

### 核心系统提示词

| 文件 | 说明 | 规模 |
|------|------|------|
| `claude-4.5-sonnet.md` | Claude 4.5 Sonnet 完整系统提示词 | 140KB, 2753 行 |
| `claude-4.1-opus-thinking.md` | Claude 4.1 Opus 思考模式提示词 | 104KB, 1307 行 |
| `claude-sonnet-4.md` | Claude Sonnet 4 系统提示词 | 99KB, 654 行 |
| `claude-opus-4.5` | Claude Opus 4.5 系统提示词 | 90KB, 1206 行 |
| `claude.txt` | Claude.ai 基础系统提示词 | 110KB, 1109 行 |

### 专用产品提示词

| 文件 | 说明 | 规模 |
|------|------|------|
| `claude-code.md` | Claude Code CLI 工具提示词 | 38KB, 667 行 |
| `calude_code_cli_tools.md` | Claude Code 工具技术文档 | 49KB, 1397 行 |
| `claude-ai-memory-system.md` | 记忆系统设计 | 17KB, 311 行 |
| `claude-code-plan-mode.md` | 计划模式提示词 | 1KB, 10 行 |

### 功能模块提示词

| 文件 | 说明 | 规模 |
|------|------|------|
| `search_instructions` | 网络搜索指南 | 22KB, 223 行 |
| `past_chats_tools.md` | 历史对话检索 | 9.6KB, 177 行 |
| `end-conversation-tool.md` | 结束对话工具 | 2.8KB, 26 行 |

### 文档处理提示词

| 文件 | 说明 | 规模 |
|------|------|------|
| `pdf.md` | PDF 处理技能 | 7KB, 298 行 |
| `docx.md` | Word 文档处理 | 9.2KB, 176 行 |
| `xlsx.md` | Excel 处理 | 10KB, 288 行 |
| `pptx.md` | PowerPoint 处理 | 19KB, 416 行 |

## 学习模块

### 模块 1: 提示词架构分析
**文件**: [提示词架构分析](/posts/2026/anthropic-prompt-architecture)

学习目标：
- 理解 XML 标签系统的设计原理
- 掌握层级嵌套模式
- 学会功能区块划分

### 模块 2: 工具调用设计模式
**文件**: [工具调用设计模式](/posts/2026/anthropic-tool-calling)

学习目标：
- Function Calling 规范设计
- 工具选择决策框架
- 参数约束与验证模式

### 模块 3: 安全边界与约束设计
**文件**: [安全边界与约束设计](/posts/2026/anthropic-safety-boundaries)

学习目标：
- 版权合规规则设计
- 内容限制与敏感话题处理
- 拒绝响应的优雅模式

### 模块 4: 上下文与记忆管理
**文件**: [上下文与记忆管理](/posts/2026/anthropic-context-management)

学习目标：
- 记忆系统设计原理
- 对话历史检索策略
- 上下文优先级管理

### 模块 5: 产品级提示词案例
**文件**: [产品级提示词案例](/posts/2026/anthropic-product-prompts)

学习目标：
- CLI 工具提示词设计
- 代码生成规范
- 开发者体验优化

### 模块 6: 最佳实践总结
**文件**: [最佳实践总结](/posts/2026/anthropic-best-practices)

学习目标：
- 提示词设计原则
- 常见模式与反模式
- 可复用模板

### 速查表
**文件**: [速查表](/posts/2026/anthropic-prompt-cheatsheet)

快速参考：
- 常用 XML 标签
- 设计模式速查
- 代码片段模板

## 学习路径

```
模块 1 (架构分析)
       ↓
  ┌────┴────┐
  ↓         ↓
模块 2    模块 3    模块 4
(工具)    (安全)    (上下文)
  │         │
  └────┬────┘
       ↓
    模块 5
  (产品案例)
       ↓
    模块 6
  (最佳实践)
       ↓
    速查表
```

## 学习建议

### 初学者路径 (预计 8-10 小时)
1. 阅读本概述了解整体结构
2. 完成模块 1-3，建立基础认知
3. 阅读速查表，掌握常用模式

### 进阶路径 (预计 15-20 小时)
1. 完成全部 6 个模块
2. 对照原始文件深入研究
3. 尝试设计自己的提示词系统

### 实践项目
- 设计一个带工具调用的 AI 助手提示词
- 实现一个多步骤任务的提示词系统
- 构建带安全边界的内容生成提示词

## 核心发现预览

### 1. XML 标签是结构化的核心
Anthropic 大量使用 XML 标签来组织提示词，形成清晰的层级结构：
```xml
<system_prompt>
  <role_definition>...</role_definition>
  <capabilities>
    <tool_usage>...</tool_usage>
    <constraints>...</constraints>
  </capabilities>
</system_prompt>
```

### 2. 决策框架模式
通过条件逻辑指导模型行为：
```
IF 条件 A → 执行行为 1
ELSE IF 条件 B → 执行行为 2
ELSE → 默认行为
```

### 3. 示例驱动设计
每个规则配套正反面示例：
```
Good Response: ...
Bad Response: ...
```

### 4. 安全优先原则
安全约束使用 `CRITICAL`、`NEVER`、`MUST` 等强调词：
```
CRITICAL: Never reproduce copyrighted content
NEVER: Include personal identifying information
MUST: Follow safety guidelines at all times
```

---

开始学习：[模块 1: 提示词架构分析](/posts/2026/anthropic-prompt-architecture)

