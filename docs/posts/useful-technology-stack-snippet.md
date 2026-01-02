---
title: 独立开发技术栈 2024 年度总结
date: 2024-12-27
tags: [Fullstack, 独立开发]
---

# 独立开发技术栈 2024 年度总结

## 前言

你有没有那么一天突然灵光一现，脑海里出现一个非常有意思的 Idea，并且想要将它实现出来；

然后你满怀激情的筹备时，却发现这个过程并不顺利。首当其冲的就是手头没有趁手的工具，或是花费大量时间学习新工具，却遇到各种各样的难点和坑点；

于是这个 Idea 就被搁置，像是掩埋在尘埃里的一颗种子...

以上是笔者曾经 "无数次成为独立开发者" 的心路历程，因此本文记录一下迈过这个阶段之后的总结与沉淀。

## 如何选择适合自己的技术栈？

参考以下几个角度：

- 技术选型的目的或原则是降本提效，脱离这个原则的选型都是不负责任的；
- 从自身角度选择自己最熟悉的技术栈，减少学习成本、时间成本，聚焦于快速实现产品功能；
- 从社区角度选取成熟稳定的产品服务，选择成本较低的方案；

时间和钱是最大的成本，以下是几个反例：

- 产品还没发布上线，已经重构了好几遍；
- 还没实现功能，先买了一堆域名；
- 产品没有几个用户已经考虑优化极致的网络体验；

笔者也是踩了很多坑才总结出一套当下自己趁手的工具，后续也会持续更新，毕竟这只是当下的教训反思，看似完美的工具罢了 🤡。

## 整体方案

前端
- 框架：[React](https://react.dev/)
- 打包编译：[Nextjs](https://nextjs.org/docs)、[tsup](https://tsup.egoist.dev/#install)
- 包管理：[pnpm](https://pnpm.io/installation)、[turbo](https://turbo.build/repo/docs)
- UI： [@radix-ui](https://www.radix-ui.com/themes/docs/overview/getting-started)、[tailwind](https://tailwindcss.com/docs/installation)、[shacn-ui](https://ui.shadcn.com/)
- 状态管理：[use-immer](https://immerjs.github.io/immer/zh-CN/example-setstate)

后端：
- 框架：[Honojs](https://hono.dev/docs/getting-started/basic)、[Nextjs](https://nextjs.org/docs)
- OpenAPI：@hono/zod-openapi、@hono/swagger-ui、swagger-typescript-api（TS 接口文件生成），[查看方案 OpenAPI 实现方案](/posts/honojs-zod-openapi)
- 数据库：[Prisma](https://www.prisma.io/docs/orm/overview/introduction/what-is-prisma)、[Cloudflare D1](https://developers.cloudflare.com/d1/)
- 邮件
    - 国外：[Plunk（开源）](https://www.useplunk.com/)、[Resend](https://resend.com/)
    - 国内：飞书邮件 + [nodemailer](https://www.nodemailer.com/) + [react-email（邮件模版）](https://react.email/docs/introduction)
- 统计：[umami（开源）](https://umami.is/)、[Google Analytics](https://marketingplatform.google.com/about/analytics/)
- 鉴权：[Clerk SAAS](https://clerk.com/)、[jose JWT](https://www.npmjs.com/package/jose) 

AI：
- SDK：[Vercel AI SDK](https://sdk.vercel.ai/docs/introduction)
- Provider：[Azure OpenAI](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/openai-service/#pricing)、[Cloudflare AI](https://developers.cloudflare.com/workers-ai/)、[Ali 通义（国内）](https://help.aliyun.com/zh/model-studio/getting-started/what-is-model-studio?spm=5176.29619931.J_AHgvE-XDhTWrtotIBlDQQ.13.7efa59fceyn3Vq#1a407ae2caj33)
- Vector DB：[Cloudlfare Vector](https://developers.cloudflare.com/vectorize/)、[Milvus](https://milvus.io/docs/architecture_overview.md)

运维：
- 部署：[Cloudlare Worker/Pages](https://developers.cloudflare.com/pages/)、[PM2](https://pm2.keymetrics.io/docs/usage/quick-start/)、[Docker](https://docs.docker.com/engine/install/)
- HTTPS：[Caddy](https://caddyserver.com/docs/install)
- 域名 DNS：[Cloudlfare](https://www.cloudflare.com/)

> 基于成本考量，服务部署首选 Cloudflare Worker，如受限于技术问题 Worker 无法支持，可以选择一个低成本的服务器，用于部署 PM2、Docker 等服务

Docker 服务，参考 [使用 Docker Compose 快速部署常用的服务](/posts/usefull-docker-compose-configs) 
- [SAAS] Dify https://dify.ai/
- [SAAS] Umami https://umami.is/
- [SAAS] Flowise AI https://flowiseai.com/
- [SAAS] Firecrawl 爬虫  https://www.firecrawl.dev/
- [数据库] Mysql
- [数据库] MongoDB
- [数据库] Milvus
- [数据库] Neo4j
- [中间件] Kafka

Common Package：
- [zodjs](https://zod.dev/)：数据校验、TS 类型推导；
- [tsx](https://tsx.is/)：直接运行 ts/tsx 文件，快速 debug；
- [vitest](https://vitest.dev/)：单元测试框架 jest 的完美替代 ，再也不用关心 ES 模块与 TS 编译问题；
- [nanoid](https://github.com/ai/nanoid)：UUID 生成；

## 前端

### 基于 trubo、pnpm、nextjs、tsup 的多包方案

一整年下来，最趁手的就是该多包方案：

- 使用 [turbo](https://turbo.build/repo/docs) 自动的进行依赖任务构建；
- 使用 [pnpm](https://pnpm.io/installation) 快速高效的链接多个 Pakcage；
- 使用 [Nextjs](https://nextjs.org/docs) 提升全方面提升 React 开发体验，并提供轻量级的 API 服务；
- 使用 [tsup](https://tsup.egoist.dev/#install) 处理特殊场景的打包构建，如构建符合 commonjs 规范的包（Package）、打包文件（Bundle File）；

参考 [基于 trubo、pnpm、nextjs、tsup 的 monorepo 放题](/posts/turbo-monorepo-buffet) 深入了解。

### UI 库的最佳实践

UI 库的选型优先选择自己最熟悉擅长的轮子，如果想想要尝鲜或突破，可参考以下选型：

- 首选 [@radix-ui](https://www.radix-ui.com/themes/docs/overview/getting-started) 不需要额外配置，安装包后直接使用；
- 对于较为复杂的排版场景、AI 生成的代码模版，使用 [tailwind](https://tailwindcss.com/docs/installation)；
- @radix-ui 提供的组件并不算丰富，还可以选择 [shacn-ui](https://ui.shadcn.com/)、[chakraui](https://www.chakra-ui.com/) 等

绝大部分场景可以直接使用 @radix-ui 组件提供的 props 进行排版：

```typescript
function RadixUI() {
    return (
        <Flex mt="2"><Flex>
    )
}

function TailwindUI() {
    return (
        <div className="flex mt-2"></div>
    )
}
```

参考：
- [@radix-ui 与 tailwind 组合使用](https://github.com/radix-ui/themes/issues/109#issuecomment-1747345743)

### 史上最简单高效的状态管理

在 Nextjs 环境中，完全脱离状态管理库（SWR、Server Action 等方案）又不是很方便，而引入 zustand、redux 等库又太重。

使用 user-immer 渐进式的解决简单组件内部状态管理、复杂的业务组件状态管理，甚至是整个应用的状态管理，优势如下：

- [接近原生 JS 的开发体验] 使用接近 js 原生对象的风格操作不可变数据，引入的概念少；
- [与 React 无缝结合] 与 react 结合，状态变更可预测，调试友好，diff 变更时不会造成心智负担；
- [灵活拓展] 按需拓展场景，如 Selector、Mutation 等，状态流转白盒化；

体验示例如下，可以参考 [史上最简单高效的状态管理](/posts/use-immer-state-manager) 了解更多：

```typescript
function Lists() {
    const posts = useSelector(getPosts);
    const dispatch = useDispatch();

    useEffect(() => {
        getAllPosts().then(posts => {
            dispatch(draft => setPosts(draft, posts))
        })
    }, [])
}
```

## 后端

### 构建类型安全的 API 接口 - OpenAPI 自动成 TS 接口文件

1. 方案

- [Honojs](https://hono.dev/docs/getting-started/basic) 轻量服务框架，支持运行在各种平台，如 Cloudflare Worker、Vercel，支持集成到 Nextjs；
- [@hono/zod-openapi](https://hono.dev/examples/zod-openapi) 基于 Zodjs 定义 Swagger 接口
- [@hono/swagger-ui](https://hono.dev/examples/swagger-ui) 生成 Swagger 接口文档
- [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) 生成 ts 接口文件

2. 优势

- 输出规范的 Swagger 接口文档，支持代码生成；
- 基于 zodjs 生成的 schema，自动的数据校验与类型推导；
- 基于轻量级的 Honojs 框架，相同的代码支持在所有平台运行；

参考 [构建类型安全的 API 接口 - OpenAPI 自动成 TS 接口文件](/posts/honojs-zod-openapi) 了解具体实现

### ORM 为什么选择 Prisma？

prisma 的优势如下：

1. 基于面向对象的查询接口，灵活且流畅，TS 类型推导非常严谨安全；
2. 支持多种数据库，如 MySQL、PostgreSQL、CloudFlare D1、MongoDB 等，完美适应不同团队、项目的选型偏好，即使你没有 SQL 语法的使用经验；
3. 清晰的数据模型定义 DSL、完整的迁移同步工具、丰富的文档与强大的社区；
4. 支持 Cloudflare D1！

以下是 Prisma 的使用场景，感受一下 Prisma 的便捷性：

1. 关联数据创建场景：初始化项目以及项目的管理员

```typescript
const project = await prisma.project.create({
    data: {
        title: 'default project',
        owner: {
            create: {
                username: '管理员'
            }
        }
    }
})
```

2. 关联查询场景：查询项目详情并关联出管理员信息

```typescript
// 关联查询
function getProject(id: string) {
    return prisma.project.findUnique({
        where: {
            id
        },
        include: {
            owner: true,
        }
    })
}
```

Prisma 还支持 Cloudflare D1 以及 自动生成 zodjs 文件，参考这篇文章 [ORM 为什么选择 Prismajs](/posts/prisma-guide)

### 零成本定制邮件模块

有两种常用邮件发送的方式：

1. 域名解析到邮件 Saas 服务，如 [Resend](https://resend.com/)、[Plunk](https://www.useplunk.com/) 等，推荐 Plunk，开源且支持独立部署；
2. SMTP + nodemailer

笔者使用的是方式二，因为已经将邮件托管到了飞书，选择自己写了一个独立的邮件 OpenAPI 服务，参考 [结合 react-email 零成本定制邮件系统](/posts/send-email)

### [AI] 比 langchainjs 更好用的 AI SDK

如果深入用过的 langchainjs 的话，你肯定也会骂它很多遍，很多包不面向源代码编程，是跑不起来的，因此只适合参考实现逻辑；

体验最好的是 Vercel 家的 [SDK](https://sdk.vercel.ai/docs/introduction)，优势如下：

- 支持不同的模型提供商，如 Azure、Cloudflare 等；
- 使用 zodjs 约定模型输入输出的数据模型，完善的类型推导；
- 完善的流式传输支持

配置 Nextjs 实现大模型的调用、Function Call 功能以及流式传输，只需要几行代码：

```typescript
// nextjs api/chat/route.ts
export async function POST() {
    cosnt res = await streamText({
        model,
        prompt: '提醒我明天上午上班',
        tools: {
            createTool
        }
    })

    return res.toDataStreamResponse();
}
```

更多请参考这篇文章 [比 langchainjs 更好用的 AI SDK](/posts/ai-sdk-guide)

## 运维

### Caddy - 轻松代替 Nginx

Caddy 的优势体现在：

- 安装使用非常简单，配置文件简洁易读
- 自动 HTTPS，证书自动更新

HTTPS 证书的自动化是最省心的功能，安装 Caddy 之后，你只需要作如下的配置，就可以实现 HTTPS 无忧了：

```yml
# Caddyfile
app.domain.com {
        reverse_proxy :3000 {
                header_up Host {host} # redundant
        }
}
```

详细用法参考这篇文章：[使用 Caddy 轻松代替 Nginx，实现 HTTPS 自动续杯！](/posts/caddy-guide)

### 使用 Docker Compose 快速部署常用的服务

虽然 Cloudflare 已经提供了大部分免费服务，但仍有一些业务无法支持，比如想要部署一个 mysql 服务、独立部署一套开源的 SAAS 服务

详细请参考这篇文章：[使用 Docker Compose 快速部署常用的服务](/posts/usefull-docker-compose-configs) 安装如下你可能会用到的容器服务：

- [SAAS] Dify https://dify.ai/
- [SAAS] Umami https://umami.is/
- [SAAS] Flowise AI https://flowiseai.com/
- [SAAS] Firecrawl 爬虫  https://www.firecrawl.dev/
- [数据库] Mysql
- [数据库] MongoDB
- [数据库] Milvus
- [数据库] Neo4j
- [中间件] Kafka

