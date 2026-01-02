---
title: Anthropic 提示词学习指南 - 5 产品级提示词案例
date: 2026-01-05
tags: [AI, Prompt]
---

# 产品级提示词案例

## 概述

本模块深入分析 Anthropic 为具体产品设计的提示词，包括 Claude Code (CLI 工具)、文档处理系统等。这些案例展示了如何将通用原则应用于特定产品场景。

## 1. Claude Code 提示词分析

### 1.1 角色定义

```xml
<role_definition>
You are an interactive CLI tool that helps users with 
software engineering tasks. Use the instructions below 
and the tools available to you to assist the user.
</role_definition>
```

**设计要点**：
- 明确身份：CLI 工具
- 明确职责：软件工程任务
- 明确资源：工具和指令

### 1.2 风格规范

```xml
<tone_and_style>
核心要求:
1. 简洁、直接、切中要点
2. 运行非平凡命令时解释原因
3. 使用 GitHub 风格 Markdown
4. 输出显示在命令行界面

响应长度:
- 除非用户要求详情，否则少于 4 行
- 单词回答最佳
- 避免不必要的前言/后语
</tone_and_style>
```

### 1.3 简洁响应示例

```
用户: 2 + 2
助手: 4

用户: 11 是质数吗？
助手: true

用户: 列出目录文件的命令是什么？
助手: ls

用户: 多少个高尔夫球能装进一辆捷达？
助手: 150000
```

### 1.4 任务执行流程

```xml
<task_workflow>
软件工程任务推荐步骤:

1. 理解阶段
   - 使用搜索工具理解代码库
   - 并行和顺序地广泛使用搜索

2. 实现阶段
   - 使用所有可用工具实现解决方案
   
3. 验证阶段
   - 使用测试验证（不假设测试框架）
   - 检查 README 或搜索测试方法
   
4. 检查阶段
   - 运行 lint 和 typecheck 命令
   - 如果找不到命令，询问用户
   - 建议写入 CLAUDE.md 以便下次使用
</task_workflow>
```

### 1.5 Git 提交规范

```xml
<git_commit_workflow>
创建 git 提交的步骤:

1. 单条消息包含三个 tool_use 块:
   - git status (查看未跟踪文件)
   - git diff (查看更改)
   - git log (查看最近提交风格)

2. 分析所有暂存更改:
   <commit_analysis>
   - 列出更改的文件
   - 总结更改性质
   - 思考更改目的
   - 评估影响
   - 检查敏感信息
   - 起草提交消息
   </commit_analysis>

3. 提交消息格式:
   [消息内容]
   
   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>

4. 使用 HEREDOC 确保格式正确:
   git commit -m "$(cat <<'EOF'
   Commit message here.
   
   🤖 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"
</git_commit_workflow>
```

## 2. 文档处理提示词

### 2.1 技能系统设计

```xml
<skills_system>
设计理念:
- 为不同文档类型准备专门的技能
- 每个技能包含最佳实践指南
- 使用前必须先阅读 SKILL.md

技能列表:
- /mnt/skills/public/docx/SKILL.md (Word 文档)
- /mnt/skills/public/pdf/SKILL.md (PDF 文件)
- /mnt/skills/public/xlsx/SKILL.md (Excel 表格)
- /mnt/skills/public/pptx/SKILL.md (PowerPoint)
</skills_system>
```

### 2.2 文档处理工作流

```xml
<docx_workflow>
Word 文档工作流决策树:

读取/分析内容
├── 使用 pandoc 转换为 markdown
└── 或解包读取原始 XML

创建新文档
├── 必须先阅读 docx-js.md
├── 使用 docx-js 库
└── 用 Packer.toBuffer() 导出

编辑现有文档
├── 自己的文档 + 简单修改 → 基础 OOXML 编辑
├── 他人的文档 → 红线修订工作流
└── 法律/学术/商业文档 → 红线修订工作流（必需）
</docx_workflow>
```

### 2.3 红线修订流程

```xml
<redlining_workflow>
全面跟踪修改工作流:

1. 获取 markdown 表示:
   pandoc --track-changes=all doc.docx -o current.md

2. 创建修订清单:
   - 所有任务以 [ ] 开始
   - 使用节/段落标识符定位
   - 不要使用 markdown 行号

3. 设置跟踪修改基础设施:
   python setup_redlining.py <directory>
   - 创建 people.xml
   - 添加 trackRevisions 设置
   - 生成 RSID

4. 系统性应用修改:
   - 逐一处理清单项
   - 使用 grep 定位文本
   - 应用跟踪修改
   - 使用一致的 RSID

5. 验证和完成:
   - 转换并验证每个修改
   - 标记完成的项目 [x]
   - 确保 100% 完成

6. 最终打包:
   - 验证: python validate.py
   - 打包: python pack.py
</redlining_workflow>
```

## 3. 计算机使用提示词

### 3.1 文件处理规则

```xml
<file_handling>
文件位置:

1. 用户上传:
   位置: /mnt/user-data/uploads
   操作: 用 view 查看可用文件

2. 工作目录:
   位置: /home/claude
   用途: 所有临时工作
   注意: 用户看不到此目录

3. 最终输出:
   位置: /mnt/user-data/outputs
   用途: 仅用于最终交付物
   关键: 必须移动到此处用户才能看到
</file_handling>
```

### 3.2 输出创建策略

```xml
<output_strategy>
短内容 (<100 行):
- 单次工具调用创建完整文件
- 直接保存到 /mnt/user-data/outputs/

长内容 (>100 行):
- 使用迭代编辑
- 先创建大纲/结构
- 逐节添加内容
- 审查和完善
- 复制到 /mnt/user-data/outputs/
</output_strategy>
```

### 3.3 文件分享规范

```xml
<file_sharing>
正确的分享方式:
[View your report](computer:///mnt/user-data/outputs/report.docx)

关键要点:
1. 简洁（无不必要的后语）
2. 使用 "view" 而不是 "download"
3. 提供 computer:// 链接
4. 不要过度解释文档内容

错误示例:
"Here's the report I created. It contains 5 sections 
covering the key findings. The first section discusses..."

正确示例:
[View your report](computer:///mnt/user-data/outputs/report.docx)
</file_sharing>
```

## 4. 搜索提示词设计

### 4.1 查询简洁原则

```xml
<search_queries>
保持查询简洁: 1-6 个词效果最佳

演变策略:
第一次: 宽泛关键词 (1-2 个词)
    ↓
检查结果
    ↓
如果不足 → 添加限定词细化
    ↓
如果需要详情 → 使用 web_fetch

示例:
用户问题: "告诉我关于百里香的信息"
第一次搜索: "thyme"
如果结果不够: "thyme cooking uses"
如果需要详情: web_fetch 获取完整页面
</search_queries>
```

### 4.2 研究型查询处理

```xml
<research_queries>
复杂查询需要 5-20 次工具调用:

流程:
1. 规划阶段:
   - 制定研究计划
   - 确定需要的工具
   
2. 研究循环:
   - 至少 5 次工具调用
   - 根据结果推理下一步
   - 约 15 次调用后停止
   
3. 答案构建:
   - 选择最佳格式
   - 粗体标记关键事实
   - 包含 TL;DR
   - 避免冗余

超大规模研究 (需要 20+ 调用):
- 提供最佳可能答案
- 建议使用高级研究功能
</research_queries>
```

## 5. Artifact 系统设计

### 5.1 Artifact 类型

```xml
<artifact_types>
代码: application/vnd.ant.code
文档: text/markdown
HTML: text/html
SVG: image/svg+xml
Mermaid: application/vnd.ant.mermaid
React: application/vnd.ant.react
</artifact_types>
```

### 5.2 React Artifact 规范

```xml
<react_artifact>
要求:
- HTML、JS、CSS 放在单文件中
- 使用 Tailwind 核心工具类
- 不使用 Tailwind 编译器
- 提供默认 props 或无必需 props

可用库:
- lucide-react@0.263.1
- recharts
- MathJS
- lodash
- d3
- Plotly
- Three.js (r128)
- Papaparse
- SheetJS
- shadcn/ui
- Chart.js
- Tone
- mammoth
- tensorflow

禁止:
- 永远不要使用 localStorage/sessionStorage
- 使用 React state 代替
</react_artifact>
```

## 6. 产品提示词设计原则

### 6.1 场景特化

```
通用原则 → 产品场景 → 具体行为

示例:
通用: "响应要简洁"
CLI 产品: "少于 4 行，单词回答最佳"
```

### 6.2 工作流标准化

```
每个产品场景定义标准工作流:
1. 触发条件
2. 执行步骤
3. 验证方法
4. 输出格式
```

### 6.3 错误处理

```
每个关键操作包含:
1. 预检查
2. 执行
3. 后验证
4. 错误恢复
```

## 7. 实践练习

### 练习 1: CLI 工具提示词

为一个"数据库管理 CLI"设计提示词：
- 定义角色和职责
- 设计响应风格规范
- 创建任务执行工作流

### 练习 2: 文档处理流程

为一个"合同审阅助手"设计工作流：
- 读取阶段
- 分析阶段
- 修订建议阶段
- 输出阶段

### 练习 3: 技能系统

设计一个"图表生成"技能：
- SKILL.md 结构
- 支持的图表类型
- 最佳实践指南

## 8. 关键要点

1. **角色要明确**: 清晰定义身份、职责、资源
2. **风格要适配**: CLI 极简、对话更友好
3. **工作流要标准化**: 定义清晰的步骤
4. **技能要模块化**: 每个能力独立封装
5. **输出要规范**: 明确的格式和位置
6. **验证要到位**: 每个关键步骤后检查

---

下一模块：[模块 6: 最佳实践总结](/posts/2026/anthropic-best-practices)

