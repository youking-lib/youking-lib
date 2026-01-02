---
title: 结合 react-email 零成本定制邮件系统
date: 2024-12-26
tags: [react-email, node, nodemailer]
---

# 结合 react-email 零成本定制邮件系统

## 前言

有两种常用的方式：

1. 域名解析到邮件 Saas 服务，如 [Resend](https://resend.com/)、[Plunk](https://www.useplunk.com/) 等，推荐 Plunk，开源且支持独立部署；
2. SMTP + nodemailer

方式1 比较简单，但依赖自己的域名 TXT 等记录解析，可以直接参考官方文档进行配置。

由于笔者已经将邮件托管到了飞书，因此选择第二种方式。

## 使用 nodemailer 发送邮件

### 1. 获取邮件的 SMTP 配置

邮件管理界面获取邮件的 SMTP

```
# .env
EMAIL_HOST=smtp.feishu.cn
EMAIL_PORT=465
EMAIL_USER=support@domain.com
EMAIL_PASS=your smtp pass
EMAILDEFAULT_FROM=support@domain.com
```

```typescript
export const emailConstants = {
  HOST: process.env.EMAIL_HOST!,
  PORT: Number(process.env.EMAIL_PORT!),
  USER: process.env.EMAIL_USER!,
  PASS: process.env.EMAIL_PASS!,
  EMAILDEFAULT_FROM: process.env.EMAILDEFAULT_FROM!
};
```

### 2. 使用 nodemailer 发送邮件

```typescript
import nodemailer from 'nodemailer';
import { emailConstants } from './constants';

export type CreateEmailSenderOptions = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
};
export type SendMailOptions = {
  from?: string;
  to: string;
  body: string;
  subject: string;
};
const transporter = nodemailer.createTransport({
  host: emailConstants.HOST,
  port: emailConstants.PORT,
  secure: true,
  auth: {
    user: emailConstants.USER,
    pass: emailConstants.PASS
  }
});

export async function sendEmail({ from, to, body, subject }: SendMailOptions) {
  return transporter.sendMail({
    to,
    subject,
    from: from || emailConstants.EMAILDEFAULT_FROM,
    html: body
  });
}
```

## 使用 react-email 定制邮件模版

> 受限于 Cloudflare Worker 的运行时，nodemailer 还不支持运行在 Cloudlfare Worker 上，[参考 Issue](https://github.com/nodemailer/nodemailer/issues/1623#issuecomment-1976024001)

### 1. 推荐先使用 nextjs 初始化一个项目

### 2. 手动安装 react-email

参考 [react-email 官方文档](https://react.email/docs/getting-started/manual-setup)

```json
{
  "name": "email-app",
  "scripts": {
    "dev:email": "email dev",
  },
  "devDependencies": {
    "react-email": "^3.0.1",
  }
}
```

### 3. 编写邮件模版

### 4. 测试发送模版

```typescript
import { render } from '@react-email/components';
import { sendEmail } from '@/libs/email';

const html = await render(<WelcomeEmail />)

sendEmail({
    to: 'youremail@gmail.com',
    subject: 'Welcome!',
    body: html
});
```

## 使用 OpenAPI 构建独立的邮件服务

### 1. 定义发送邮件路由

```typescript
export const SendEmailRoute = createRoute({
  tags: ['Email'],
  method: 'post',
  path: '/send-email',
  request: {
    body: {
      content: {
        'application/json': {
          schema: z.object({
            from: z.string().optional(),
            to: z.string(),
            subject: z.string(),
            body: z.string()
          })
        }
      }
    }
  },
  responses: {
    200: {
      content: {
        'application/json': {
          schema: z.object({
            success: z.boolean()
          })
        }
      },
      description: 'SendEmailRoute'
    }
  }
});
```

### 2. 路由实现

```typescript
export function email(api: OpenAPIHono) {
  api.openapi(SendEmailRoute, async c => {
    const body = c.req.valid('json');

    await sendEmail({
      from: body.from,
      to: body.to,
      subject: body.subject,
      body: body.body
    });

    return c.json(
      {
        success: true
      },
      200
    );
  });
}
```

## 参考

- [react-email template](https://demo.react.email/preview/notifications/vercel-invite-user)
- [dub.com 项目的邮件模版](https://github.com/dubinc/dub/tree/main/apps/web/emails)

