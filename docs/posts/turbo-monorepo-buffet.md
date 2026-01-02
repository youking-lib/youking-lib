---
title: 基于 turbo、pnpm、nextjs、tsup 的 monorepo 方案
date: 2024-12-25
tags: [tsup, commonjs, bundle, monorepo]
---

# 基于 turbo、pnpm、nextjs、tsup 的 monorepo 方案

## 方案 & 优势

方案有以下优势：

- 使用 [turbo](https://turbo.build/repo/docs) 进行依赖任务构建；
- 使用 [pnpm](https://pnpm.io/installation) 快速高效的链接多个 Package；
- 使用 [Nextjs](https://nextjs.org/docs) 全方位提升 React 开发体验，并提供轻量级的 API 服务；
- 使用 [tsup](https://tsup.egoist.dev/#install) 处理特殊场景的打包构建，如构建符合 commonjs 规范的包（Package）或捆绑文件（Bundle File）等。

模版可以直接通过 turbo 的生成：

```shell
pnpm dlx create-turbo@latest
```

## 关键行动

### 使用 turbo 进行依赖任务构建

Nodejs 的依赖是一个有向无环图结构，使用 pnpm 以 monorepo 的方式组织源代码不可避免的出现依赖构建问题，以下方目录以及形成的依赖关系为例：

- 构建 `apps/api` 之前先要构建 `packages/b`
- 修改 `packages/b` 要重新构建 `apps/api`

```
project
├── apps
│   ├── api
│   └── web
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── packages
│   ├── a
│   └── b
└── turbo.json

# 依赖关系
web/node_modules/a/node_modues/b
api/node_modules/a/node_modues/b
```

turbo 解决构建依赖问题仅需执行 `trubo run build --filter=api...` 这一简单命令。

### 使用 tsup 处理特殊场景的打包构建

需要单独打包的场景很多，本文主要介绍其中常见的两种，也是笔者经常使用 tsup 进行处理的：

- 需要独立发布、部署的 JS Bundle 文件，如 SDK 等；
- 遇到必须使用的旧版本 Package，要求必须在 Commonjs 规范的上下文；

#### 竞品对比

| 对比项 | TSUP | Vite | Webpack |
| --- | --- | --- | --- |
| 构建速度 | 基于 Esbuild，速度极快，处理中小项目瞬间完成 | 开发模式下冷启动快，利用浏览器原生 ES 模块，热更新迅速 | 相对较慢，需要分析整个项目模块，有优化策略可提升速度 |
| 开发体验 | 侧重于打包，简单直接，开发服务器功能少 | 热更新功能强大，开发服务器支持多种配置，如代理，方便处理跨域 | 配置插件和开发服务器后体验不错，但配置复杂，学习成本高 |
| 生态系统和插件支持 | 生态系统相对小，插件支持有限，能满足基本打包需求 | 生态系统不断壮大，针对不同框架有插件，还有性能优化和开发体验相关插件 | 生态系统庞大，几乎能找到满足任何需求的插件 |
| 适用场景 | 适用于简单 TypeScript 项目，如注重快速打包的工具库、小型命令行工具等 | 现代前端开发，基于 Vue、React 等框架的应用，对开发效率和热更新速度要求高 | 复杂大型前端项目，需精细控制打包、深度优化和大量使用插件，对旧浏览器兼容性要求高 |

#### 生成 Commonjs 规范的 Package

```
project
├── packages
│   └── cjs-pkg
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
└── turbo.json
```

如以上的目录结构所示，使用 tsup 单独为 `cjs-pkg` 生成 Commonjs 规范的代码：

**1. 定义 Commonjs 的 Package**

```json
// project/packages/cjs-pkg/package.json
{
  "name": "vector-store",
  "type": "commonjs",
  "main": "./dist/index.js",
  "types": "./src/index.ts",
  "scripts": {
    "dev": "tsup --watch",
    "build": "tsup",
  },
  "devDependencies": {
      "tsup": "^8.3.0",
  }
}
```

**2. 编写 tsup 的配置文件**

```typescript
// // project/packages/cjs-pkg/tsup.config.ts
import { defineConfig, Options } from 'tsup'

export default defineConfig((options: Options) => ({
  entry: ['src/index.ts'],
  format: ['cjs'],
  target: 'node18',
  dts: false,
  shims: true,
  silent: true,
  sourcemap: true,
  ...options,
}))
```

**3. 运行 dev/build 命令编译输出结果**

#### 使用 tsup 打包构建 SDK

例如在 Shopify 的开发场景中，通常会提供一个 JS 的 SDK 包嵌入商店网站，使用 tsup 可以简单处理这种问题；

**1. 目录结构**

以下面的目录结构为例，期望把 `packages/sdk` 打包为一个独立的 iife 文件

```
project
├── packages
│   └── sdk
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── tsup.config.ts
└── turbo.json
```

**2. 编写 tsup 配置文件**

```typescript
// 导入环境变量
import 'dotenv/config';

export default defineConfig((options: Options) => ({
  entry: {
    index: './src/index.ts',
    seed: './src/seed.ts'
  },
  outDir: './dist,
  metafile: true,
  format: ['iife'],
  esbuildOptions(options) {
    options.banner = {
      js: '"use client"'
    };
  },
  env: {
    NODE_ENV: 'production',
  },
  minify: true,
  ...options
}));
```

tsup 的打包方案可以 Cover 住笔者的这两种经常用到的场景，如果有进一步需要定制的打包方案，可以考虑引入 Vite、Webpack。

