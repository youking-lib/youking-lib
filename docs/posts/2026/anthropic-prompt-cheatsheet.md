---
title: Anthropic 提示词学习指南 - 速查表
date: 2026-01-07
tags: [AI, Prompt]
---

# Anthropic 提示词设计速查表

> 快速参考指南，适合在设计提示词时随时查阅

## XML 标签速查

### 功能性标签

```xml
<role_definition>角色定义</role_definition>
<overview>功能概述</overview>
<capabilities>能力范围</capabilities>
<instructions>操作指南</instructions>
<guidelines>使用准则</guidelines>
<workflow>工作流程</workflow>
```

### 约束性标签

```xml
<constraints>约束条件</constraints>
<hard_limits>硬性限制</hard_limits>
<forbidden_phrases>禁止表达</forbidden_phrases>
<critical_notes>关键提醒</critical_notes>
<CRITICAL_SECTION>极重要内容（全大写）</CRITICAL_SECTION>
```

### 工具相关标签

```xml
<tool_selection>工具选择指南</tool_selection>
<tool_parameters>参数说明</tool_parameters>
<decision_framework>决策框架</decision_framework>
<before_using_tool>调用前检查</before_using_tool>
<after_tool_response>结果处理</after_tool_response>
```

### 示例性标签

```xml
<examples>示例集合</examples>
<good_example>正确示例</good_example>
<bad_example>错误示例</bad_example>
<code_example>代码示例</code_example>
```

### 环境标签

```xml
<env>环境信息</env>
<available_skills>可用技能</available_skills>
<user_preferences>用户偏好</user_preferences>
```

---

## 强调词层级

| 层级 | 关键词 | 含义 | 使用场景 |
|------|--------|------|----------|
| L1 | `NEVER` | 绝对禁止 | 安全红线 |
| L1 | `CRITICAL` | 极其重要 | 核心规则 |
| L2 | `MUST` | 必须 | 强制要求 |
| L2 | `ALWAYS` | 总是 | 无例外规则 |
| L3 | `IMPORTANT` | 重要 | 应遵守 |
| L4 | `should` | 应该 | 建议 |
| L4 | `prefer` | 偏好 | 推荐 |

---

## 决策树模板

```
IF [条件A]
    → [行为1]
ELSE IF [条件B]
    → [行为2]
ELSE IF [条件A] AND [条件B]
    → [优先级更高的行为]
ELSE IF [不确定]
    → [询问澄清]
ELSE
    → [默认行为]
```

---

## 工具调用清单

### 调用前 ✅

- [ ] 确认需要工具（能否直接回答？）
- [ ] 选择最合适的工具
- [ ] 参数完整正确
- [ ] 检查能否并行调用

### 调用后 ✅

- [ ] 结果是否回答了问题
- [ ] 是否需要后续调用
- [ ] 如何综合呈现
- [ ] 是否需要引用来源

---

## 响应风格速查

### CLI 环境

```
- 少于 4 行
- 单词回答最佳
- 无前言后语
- Markdown 格式
```

### 对话环境

```
- 自然语言
- 适度礼貌
- 结构化信息用列表
```

### 拒绝场景

```
❌ "I cannot help because it could lead to..."
✅ "I can't help with that. Would you like..."
✅ "I can't do that, but I can help you with..."
```

---

## 版权合规速查

### 硬性限制

| 限制 | 规则 |
|------|------|
| 引用长度 | ≤15 词 |
| 引用次数 | 每源最多 1 次 |
| 完整作品 | 永不复制 |

### 自检

- [ ] 有超过 15 词的引用吗？
- [ ] 同一来源引用多次了吗？
- [ ] 复制了完整作品吗？
- [ ] 是否只是删除引号来"伪装"？

---

## 记忆系统速查

### 禁止表达

```
❌ "I can see..."
❌ "I remember..."
❌ "Based on my memories..."
❌ "According to your data..."
```

### 正确用法

```
✅ 直接使用信息，不做元评论
✅ "Your book club meets on Thursdays."
✅ "Here's a draft for [manager]..."
```

### 触发词识别

```
显式: "我们之前讨论过..."
时间: "昨天我们..."
隐式: "那个项目", "继续那个"
```

---

## 安全层级

```
┌─────────────────────────────────────┐
│  L1: 硬性禁止 (NEVER)               │ ← 不可违反
├─────────────────────────────────────┤
│  L2: 强制要求 (MUST)                │ ← 极少例外
├─────────────────────────────────────┤
│  L3: 标准指南 (should)              │ ← 可调整
├─────────────────────────────────────┤
│  L4: 偏好建议 (prefer)              │ ← 灵活
└─────────────────────────────────────┘
```

---

## 标准模块结构

```xml
<feature_name>
  <overview>功能简介</overview>
  
  <when_to_use>使用场景</when_to_use>
  
  <core_rules>
    核心规则列表
  </core_rules>
  
  <decision_framework>
    IF-ELSE 决策树
  </decision_framework>
  
  <examples>
    <good_example>...</good_example>
    <bad_example>...</bad_example>
  </examples>
  
  <constraints>约束条件</constraints>
  
  <critical_notes>关键提醒</critical_notes>
</feature_name>
```

---

## 工作流模板

### 任务执行

```
1. 理解 → 搜索/分析理解需求
2. 规划 → 制定执行计划
3. 执行 → 使用工具完成任务
4. 验证 → 检查结果正确性
5. 交付 → 格式化输出
```

### 工具选择

```
优先级 1: 内部工具 (Drive, Calendar, Slack)
优先级 2: 网络工具 (web_search, web_fetch)
优先级 3: 组合使用
```

### 搜索策略

```
简单问题 → 1 次搜索
中等问题 → 3-5 次搜索
复杂研究 → 5-20 次搜索
超大规模 → 建议使用高级研究功能
```

---

## 环境变量模板

```xml
<env>
  Working directory: {{working_directory}}
  Platform: {{platform}}
  Current date: {{current_date}}
  User timezone: {{user_timezone}}
  User location: {{user_location}}
  Model: {{model_name}}
</env>
```

---

## 快速设计清单

### 开始前

- [ ] 明确角色和职责
- [ ] 确定核心能力
- [ ] 识别安全边界

### 设计中

- [ ] 使用 XML 结构
- [ ] 定义决策框架
- [ ] 准备正反示例
- [ ] 设置约束层级

### 完成后

- [ ] 检查嵌套层级 (≤3)
- [ ] 验证关键规则冗余
- [ ] 测试边界情况
- [ ] 文档版本信息

---

## 常见模式代码片段

### 角色定义

```xml
<role_definition>
You are a [角色名称] that helps users with [职责范围].
Use the instructions below and the tools available to you 
to assist the user.
</role_definition>
```

### 约束块

```xml
<constraints>
NEVER:
- [禁止行为1]
- [禁止行为2]

MUST:
- [必须行为1]
- [必须行为2]

IMPORTANT:
- [重要注意1]
</constraints>
```

### 示例块

```xml
<examples>
**Example 1: [场景名]**
User: "[用户输入]"
Action: [执行的行为]
Response: "[响应内容]"

**Example 2: [场景名]**
...
</examples>
```

### 决策框架

```xml
<decision_framework>
1. [条件1]? → [工具/行为1]
2. [条件2]? → [工具/行为2]
3. Both [条件1] AND [条件2]? →
   IF [子条件A] → [行为A]
   ELSE → [行为B]
4. Unclear? → Ask for clarification
5. No trigger? → Don't use tools
</decision_framework>
```

---

## 参考链接

- [概述](/posts/2025/anthropic-prompt-guide)
- [模块 1: 架构分析](/posts/2026/anthropic-prompt-architecture)
- [模块 2: 工具调用](/posts/2026/anthropic-tool-calling)
- [模块 3: 安全边界](/posts/2026/anthropic-safety-boundaries)
- [模块 4: 上下文管理](/posts/2026/anthropic-context-management)
- [模块 5: 产品案例](/posts/2026/anthropic-product-prompts)
- [模块 6: 最佳实践](/posts/2026/anthropic-best-practices)

---

*基于 Anthropic 提示词分析 | 学习笔记 v1.0*

