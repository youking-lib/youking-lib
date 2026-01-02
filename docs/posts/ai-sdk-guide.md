---
title: 比 langchainjs 更好用的 AI SDK
date: 2024-12-26
tags: [AI, Vercel, SDK]
---

# 比 langchainjs 更好用的 AI SDK

## 优势

- 支持不同的模型提供商，如 Azure、Cloudflare 等；
- 使用 zodjs 约定模型输入输出的数据模型，完善的类型推导；
- 完善的流式传输支持

## 1. 支持不同的模型提供商

```typescript
import { createAzure } from '@ai-sdk/azure'
import { createOpenAI } from '@ai-sdk/openai'

import { LanguageModelV1, EmbeddingModel } from 'ai'

const azure = createAzure({
  apiKey: '[KEY]',
  baseURL: 'https:/[DEPLOYMENT].openai.azure.com/openai/deployments',
})

export const openai = createOpenAI({
  apiKey: 'xxx',
})
```

## 2. 流式传输支持

### Nextjs 示例

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

### Hono 示例

```typescript
// hono
app.post('/api/chat', async c => {
    cosnt res = await streamText({
        model,
        prompt: '提醒我明天上午上班',
        tools: {
            createTool
        }
    })

    return res.toDataStreamResponse();
})
```

## 3. 支持生成结构化数据

```typescript
const { object } = await generateObject({
  model: azure('gpt-4o'),
  schema: z.object({
    username: z.string(),
  }),
  prompt: '提取用户名称.',
});

console.log(object.username)
```

## 4. 基于 zodjs，严格约定大模型 Function Call 的返回结果

```typescript
const createTodo = tool({
    description: '添加待办提醒',
    parameters: z.object({
      title: z.string().describe('待办的内容，尽量保存用户的原始输入，不要做任何处理'),
      expiredAt: z.string().optional().describe('待办到期时间，如果，格式为 YYYY-MM-DD HH:mm:ss'),
    }),
    async execute(params) {
        console.log(params.title, params.expiredAt)
    }
})
```

## 相关

- [AI] RAG 技术方案
- [AI] 提升 AI 记忆的常用方案

