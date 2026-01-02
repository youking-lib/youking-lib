---
layout: home
title: Youking
titleTemplate: 温故而知新

hero:
  name: Youking
  text: 温故而知新
  tagline: 聚焦于前端领域的独立开发
  image:
    src: /avatar.png
    alt: Youking
  actions:
    - theme: brand
      text: 开始阅读
      link: /pages/archives
    - theme: alt
      text: 关于我
      link: /pages/about

features:
  - icon: 🚀
    title: 独立开发技术栈
    details: 2024 年度总结，涵盖前端、后端、AI、运维等技术选型
    link: /posts/useful-technology-stack-snippet
  - icon: 🤖
    title: AI 提示词工程
    details: 深入分析 Anthropic 提示词架构与工具调用设计模式
    link: /posts/2026/anthropic-prompt-architecture
  - icon: 💻
    title: AI Coding 原理
    details: Cline 源码学习指南，深入理解 AI 编程助手的架构设计与实现原理
    link: /posts/2026/cline-source-learning-guide
---

<style>
:root {
  --vp-home-hero-name-color: transparent;
  --vp-home-hero-name-background: -webkit-linear-gradient(120deg, #bd34fe 30%, #41d1ff);
  --vp-home-hero-image-background-image: linear-gradient(-45deg, #bd34fe 50%, #47caff 50%);
  --vp-home-hero-image-filter: blur(44px);
}

@media (min-width: 640px) {
  :root {
    --vp-home-hero-image-filter: blur(56px);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-home-hero-image-filter: blur(68px);
  }
}
</style>
