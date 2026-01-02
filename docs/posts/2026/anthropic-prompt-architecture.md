---
title: Anthropic 提示词学习指南 - 1 提示词架构分析
date: 2026-01-01
tags: [AI, Prompt]
---

# 提示词架构分析

## 概述

Anthropic 的提示词采用高度结构化的设计方法，以 XML 标签为核心组织手段，形成清晰的层级结构和功能区块。本模块将深入分析这种架构设计的原理和实践方法。

## 1. XML 标签系统

### 1.1 为什么使用 XML 标签

XML 标签在 Anthropic 提示词中扮演着核心角色，原因如下：

1. **清晰的边界定义**: 明确标记指令的开始和结束
2. **层级嵌套**: 支持复杂的逻辑组织
3. **语义化命名**: 标签名本身传达意图
4. **模型友好**: Claude 对 XML 结构有良好的理解能力

### 1.2 常见标签类型

#### 功能性标签
```xml
<citation_instructions>
  引用规则和格式要求
</citation_instructions>

<search_instructions>
  搜索行为指导
</search_instructions>

<artifacts_info>
  Artifact 创建规则
</artifacts_info>
```

#### 约束性标签
```xml
<mandatory_copyright_requirements>
  版权合规的强制要求
</mandatory_copyright_requirements>

<hard_limits>
  不可违反的硬性限制
</hard_limits>

<critical_notes>
  关键注意事项
</critical_notes>
```

#### 示例性标签
```xml
<examples>
  行为示例
</examples>

<good_example>
  正确做法示例
</good_example>

<bad_example>
  错误做法示例
</bad_example>
```

#### 环境性标签
```xml
<env>
  环境信息（工作目录、日期等）
</env>

<available_skills>
  可用技能列表
</available_skills>
```

## 2. 层级嵌套模式

### 2.1 三层嵌套结构

Anthropic 提示词通常采用三层嵌套：

```xml
<!-- 第一层：功能模块 -->
<computer_use>
  
  <!-- 第二层：子功能 -->
  <skills>
    技能系统说明
  </skills>
  
  <file_handling_rules>
    <!-- 第三层：具体规则 -->
    <notes_on_user_uploaded_files>
      文件处理细节
    </notes_on_user_uploaded_files>
  </file_handling_rules>
  
  <producing_outputs>
    输出规则
  </producing_outputs>
  
</computer_use>
```

### 2.2 实际案例分析

从 `claude-4.5-sonnet.md` 中提取的实际结构：

```xml
<past_chats_tools>
  
  <tool_selection>
    工具选择指南
  </tool_selection>
  
  <conversation_search_tool_parameters>
    对话搜索参数说明
  </conversation_search_tool_parameters>
  
  <recent_chats_tool_parameters>
    最近对话参数说明
  </recent_chats_tool_parameters>
  
  <decision_framework>
    决策框架
  </decision_framework>
  
  <trigger_patterns>
    触发模式
  </trigger_patterns>
  
  <response_guidelines>
    响应指南
  </response_guidelines>
  
  <examples>
    使用示例
  </examples>
  
  <critical_notes>
    关键提醒
  </critical_notes>
  
</past_chats_tools>
```

## 3. 功能区块划分

### 3.1 标准功能区块

一个完整的功能模块通常包含以下区块：

| 区块 | 作用 | 标签示例 |
|------|------|----------|
| 概述 | 说明功能目的 | `<overview>` |
| 使用场景 | 何时使用 | `<when_to_use>` |
| 参数说明 | 输入输出定义 | `<parameters>` |
| 决策框架 | 行为逻辑 | `<decision_framework>` |
| 示例 | 正反例演示 | `<examples>` |
| 约束 | 限制和边界 | `<constraints>` |
| 提醒 | 关键注意点 | `<critical_notes>` |

### 3.2 搜索功能的区块划分

以 `search_instructions` 为例：

```xml
<search_instructions>
  
  <!-- 区块1: 核心行为 -->
  <core_search_behaviors>
    1. 何时搜索
    2. 搜索规模控制
    3. 工具选择
  </core_search_behaviors>
  
  <!-- 区块2: 使用指南 -->
  <search_usage_guidelines>
    搜索技巧和响应规则
  </search_usage_guidelines>
  
  <!-- 区块3: 版权合规 -->
  <CRITICAL_COPYRIGHT_COMPLIANCE>
    <core_copyright_principle>...</core_copyright_principle>
    <mandatory_copyright_requirements>...</mandatory_copyright_requirements>
    <hard_limits>...</hard_limits>
    <self_check_before_responding>...</self_check_before_responding>
  </CRITICAL_COPYRIGHT_COMPLIANCE>
  
  <!-- 区块4: 查询分类 -->
  <query_complexity_categories>
    <never_search_category>...</never_search_category>
    <do_not_search_but_offer_category>...</do_not_search_but_offer_category>
    <single_search_category>...</single_search_category>
    <research_category>
      <research_process>...</research_process>
    </research_category>
  </query_complexity_categories>
  
</search_instructions>
```

## 4. 命名规范

### 4.1 标签命名规则

1. **小写蛇形命名**: `<tool_selection>`, `<decision_framework>`
2. **语义化**: 标签名直接表达内容
3. **层级一致性**: 同级标签命名风格统一

### 4.2 强调级别命名

| 强调级别 | 命名模式 | 示例 |
|----------|----------|------|
| 普通 | 小写 | `<guidelines>` |
| 重要 | 前缀 critical | `<critical_notes>` |
| 强制 | 大写 | `<CRITICAL_COPYRIGHT_COMPLIANCE>` |
| 禁止 | 含 forbidden/never | `<forbidden_phrases>` |

## 5. 设计原则

### 5.1 模块化原则

每个 XML 标签块应该是**自包含**的：
- 独立阅读时可理解
- 可单独更新而不影响其他模块
- 有明确的职责边界

### 5.2 渐进细化原则

从抽象到具体的信息组织：

```xml
<memory_system>
  <!-- 第1层：概念介绍 -->
  <overview>
    Claude 拥有记忆系统，可以记住与用户的历史对话...
  </overview>
  
  <!-- 第2层：应用指南 -->
  <application_instructions>
    选择性应用记忆，基于相关性...
  </application_instructions>
  
  <!-- 第3层：具体规则 -->
  <forbidden_phrases>
    永远不要说 "I remember..."
    永远不要说 "Based on your memories..."
  </forbidden_phrases>
  
  <!-- 第4层：示例 -->
  <examples>
    Good: "Your book club meets on Thursdays."
    Bad: "I can see in my memories that..."
  </examples>
</memory_system>
```

### 5.3 冗余强调原则

关键规则会在多处重复强调：

```xml
<!-- 在概述中提及 -->
<overview>
  ...NEVER reproduce copyrighted content...
</overview>

<!-- 在专门的约束区块中详述 -->
<copyright_requirements>
  CRITICAL: Never quote more than 15 words...
</copyright_requirements>

<!-- 在示例中演示 -->
<examples>
  Bad: Reproducing a full paragraph from source
  Good: Paraphrasing in your own words
</examples>

<!-- 在检查清单中提醒 -->
<self_check>
  Before responding, verify: No verbatim quotes over 15 words?
</self_check>
```

## 6. 实践练习

### 练习 1: 结构分析

阅读 `claude-code.md`，找出：
1. 有多少个顶级 XML 标签？
2. 最深的嵌套层级是多少？
3. 哪些规则被重复强调？

### 练习 2: 标签设计

为一个"代码审查助手"设计 XML 结构：
- 需要包含：角色定义、审查规则、输出格式
- 使用层级嵌套
- 添加示例区块

### 练习 3: 重构练习

将以下非结构化提示词重构为 XML 格式：

原始：
```
你是一个翻译助手。翻译时要保持原意，不要加入自己的理解。
如果遇到专业术语，保留原文并在括号中给出翻译。
翻译结果直接输出，不要添加解释。
```

目标：设计合适的 XML 结构来组织这些规则。

## 7. 关键要点

1. **XML 标签是组织核心**: 用于创建清晰的结构边界
2. **层级嵌套表达复杂性**: 通过嵌套实现从抽象到具体
3. **功能区块标准化**: 概述 → 规则 → 示例 → 约束
4. **命名要语义化**: 标签名应直接表达内容
5. **关键规则要冗余强调**: 重要约束在多处重复

---

上一模块：[概述](/posts/2025/anthropic-prompt-guide)

下一模块：[模块 2: 工具调用设计模式](/posts/2026/anthropic-tool-calling)

