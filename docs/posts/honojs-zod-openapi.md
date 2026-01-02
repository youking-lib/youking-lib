---
title: 构建类型安全的 API 接口 - OpenAPI 自动生成 TS 接口文件
date: 2024-12-26
tags: [honojs, zod, openapi]
---

# 构建类型安全的 API 接口

## 方案

- [Honojs](https://hono.dev/docs/getting-started/basic) 轻量服务框架，支持运行在各种平台，如 Cloudflare Worker、Vercel，支持继承到 Nextjs；
- [@hono/zod-openapi](https://hono.dev/examples/zod-openapi) 基于 Zodjs 定义 Swagger 接口
- [@hono/swagger-ui](https://hono.dev/examples/swagger-ui) 生成 Swagger 接口文档
- 使用 [swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) 生成 ts 接口文件

## 优势

- 输出规范的 Swagger 接口文档，支持代码生成；
- 基于 zodjs 生成的 schema，自动的数据校验与类型推导；
- 基于轻量级的 Honojs 框架，相同的代码支持在所有平台运行；

## 实现

### 1. 使用 zod-openapi 定义一个 OpenAPI 路由

```typescript
// route.schema.ts
export const ShopProfile = z.object({
  id: z.string(),
  shop: z.string(),
  title: z.string()
}).openapi('ShopProfileVo', {
  description: '商店详情'
});

export const GetShopProfileRoute = createRoute({
  tags: ['Shop'],
  method: 'get',
  path: '/shop/{shopId}',
  request: {
    params: z.object({
      shopId: z.string()
    })
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: ShopProfile
        }
      },
      description: 'GetShopProfileRoute'
    }
  }
});
```

### 2. 根据路由 Schema 实现路由

```typescript
import { OpenAPIHono } from '@hono/zod-openapi'
import { GetShopProfileRoute } from './route.schema.ts'

const api = new OpenAPIHono();

api.openapi(GetShopProfileRoute, async c => {
    const { shopId } = c.valid('params');

    const shopProfile = await prisma.ShopProfile.findUnique({
        where: {
            id: shopId
        }
    })

    return c.json(shopProfile, 200)
})
```

### 3. 生成 Swagger 文件

```typescript
api.doc('/swagger/doc', (c) => {
    return {
        openapi: '3.1.0',
        servers: [
            {
                url: new URL(c.req.url).origin,
                description: 'Current environment',
            },
        ],
        info: {
            version: '0.0.1',
            title: 'asp-api',
            description: 'asp-api swagger',
        },
    }
})
```

### 4. [可选] 使用 swagger-ui 渲染接口文档

```typescript

api.get('/swagger/ui', swaggerUI({
    url: '/api/swagger/doc',
    persistAuthorization: true
}))
```

### 5. 使用 swagger-typescript-api 生成 ts 接口文件

```typescript
// generate.ts
// tsx ./generate.ts
import { generateApi } from 'swagger-typescript-api'

gen();

async function gen() {
    await generateApi({
        name: 'index.ts',
        output: path.resolve(__dirname, 'gen', './api'),
        url: 'http://127.0.0.1:3010/api/swagger/doc',
    })
}
```

