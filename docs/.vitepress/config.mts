import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Youking",
  description: "温故而知新",
  lang: 'zh-CN',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    // Google Analytics
    ['script', { async: '', src: 'https://www.googletagmanager.com/gtag/js?id=G-LQ7BTC5440' }],
    ['script', {}, `window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-LQ7BTC5440');`
    ]
  ],

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/avatar.png',
    
    nav: [
      { text: '首页', link: '/' },
      { text: '归档', link: '/pages/archives' },
      { text: '标签', link: '/pages/tags' },
      { text: '关于', link: '/pages/about' }
    ],

    sidebar: {
      '/posts/': [
        {
          text: '2026/AICoding 原理',
          collapsed: false,
          items: [
            { text: '学习指南', link: '/posts/2026/cline-source-learning-guide' },
            { text: '1 架构概述', link: '/posts/2026/cline-architecture-overview' },
            { text: '2 上下文关联与代码文件获取', link: '/posts/2026/cline-context-and-file-retrieval' },
            { text: '3 代码生成与编辑执行', link: '/posts/2026/cline-code-generation-and-editing' },
            { text: '4 核心组件详解', link: '/posts/2026/cline-core-components' },
          ]
        },
        {
          text: '2026/Anthropic Prompt',
          collapsed: false,
          items: [
            { text: '概述', link: '/posts/2026/anthropic-prompt-overview' },
            { text: '1 提示词架构分析', link: '/posts/2026/anthropic-prompt-architecture' },
            { text: '2 工具调用设计模式', link: '/posts/2026/anthropic-tool-calling' },
            { text: '3 安全边界与约束设计', link: '/posts/2026/anthropic-safety-boundaries' },
            { text: '4 上下文与记忆管理', link: '/posts/2026/anthropic-context-management' },
            { text: '5 产品级提示词案例', link: '/posts/2026/anthropic-product-prompts' },
            { text: '6 最佳实践总结', link: '/posts/2026/anthropic-best-practices' },
            { text: '速查表', link: '/posts/2026/anthropic-prompt-cheatsheet' },
          ]
        },
        {
          text: '2024',
          collapsed: false,
          items: [
            { text: '独立开发技术栈 2024 年度总结', link: '/posts/useful-technology-stack-snippet' },
            { text: '史上最简单高效的状态管理', link: '/posts/use-immer-state-manager' },
            { text: '构建类型安全的 API 接口 - OpenAPI', link: '/posts/honojs-zod-openapi' },
            { text: 'ORM 为什么选择 Prismajs', link: '/posts/prisma-guide' },
            { text: '结合 react-email 零成本定制邮件系统', link: '/posts/send-email' },
            { text: '比 langchainjs 更好用的 AI SDK', link: '/posts/ai-sdk-guide' },
            { text: '使用 Caddy 轻松代替 Nginx', link: '/posts/caddy-guide' },
            { text: '使用 Docker Compose 快速部署常用的服务', link: '/posts/usefull-docker-compose-configs' },
            { text: '基于 turbo、pnpm、nextjs、tsup 的 monorepo 方案', link: '/posts/turbo-monorepo-buffet' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/youking-lib' }
    ],

    footer: {
      message: 'Powered by VitePress',
      copyright: '© 2024 Youking'
    },

    outline: {
      label: '目录',
      level: [2, 3]
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: {
            buttonText: '搜索文档',
            buttonAriaLabel: '搜索文档'
          },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: {
              selectText: '选择',
              navigateText: '切换'
            }
          }
        }
      }
    }
  }
})
