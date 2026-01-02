---
title: ORM 为什么选择 Prismajs
date: 2024-12-26
tags: [prisma, cloudflare-d1]
---

# ORM 为什么选择 Prismajs

## 优势

1. 基于面向对象的查询接口，灵活且流畅，TS 类型推导非常严谨安全；
2. 支持多种数据库，如 MySQL、PostgreSQL、CloudFlare D1、MongoDB 等，完美适应不同团队、项目的选型偏好，即使你没有 SQL 语法的使用经验；
3. 清晰的数据模型定义 DSL、完整的迁移同步工具、丰富的文档与强大的社区；
4. 支持 Cloudflare D1！

## 与 Drizzle 的对比

| 比较项目| Prisma |Drizzle|
| ------------- |-------------------------------- | --------------------------------------------------- |
| **定义方式**      | 使用 Prisma Schema（`.prisma`文件）来定义数据模型，通过类似于 DSL（领域特定语言）的语法定义表、列、关系等。| 在代码中直接使用 JavaScript 或 TypeScript 来定义数据库架构，通常是通过函数调用和对象字面量的方式。|
| **数据库迁移**     | Prisma 提供了一套完整的迁移工具，通过`prisma migrate`命令。它可以自动生成迁移文件，并将数据库结构的变更应用到数据库中。| Drizzle 的迁移相对来说更加灵活，它可以通过编写自定义的 SQL 脚本或者利用一些社区提供的轻量级迁移工具来实现数据库迁移。|
| **查询构建**      | Prisma 提供了一种流畅的、面向对象的查询构建方式。支持复杂的关联查询，并且能够自动处理关系数据的加载和解析。| Drizzle 的查询构建更接近 SQL 的思维方式，在代码中会看到更多 SQL 语法的影子。|
| **类型安全**      | Prisma 在类型安全方面表现出色，它会根据定义的`.prisma`文件自动生成类型定义文件（`.d.ts`），在代码编辑器中能够提供很好的类型提示。| Drizzle 也注重类型安全，它通过使用 TypeScript 的类型系统，结合自身的类型定义，为数据库操作提供类型支持。|
| **性能**        | Prisma 在性能方面做了很多优化，尤其是在处理大量数据和复杂查询时，它能够有效地利用数据库连接池，减少不必要的数据库请求。| Drizzle 由于其更接近底层 SQL 的操作方式，在性能优化方面可能具有一定的灵活性。|
| **生态系统和社区支持** | Prisma 拥有较大的社区和丰富的文档资源，许多流行的框架和工具都有与之集成的案例和插件。| Drizzle 相对来说是一个较新的工具，社区规模较小，但正在逐渐发展壮大。|

## Prisma 实用技巧

以下是 Prisma 的使用场景，感受以下 Prisma 的便捷性：

### 1. 关联数据创建场景

初始化项目以及项目的管理员

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

### 2. 关联查询场景

查询项目详情并关联出管理员信息

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

## Cloudflare D1 支持 

- Cloudlfare D1 提供足够的免费额度，开发者也不需要为数据库的运维费心思
- 基于 sqlite 的 D1 数据类型支持的不多，比如无法支持枚举类型

参考 [Prsimajs 官方文档](https://www.prisma.io/docs/orm/overview/databases/cloudflare-d1)

## 使用 zod-prisma 自动生成校验文件

1. 安装 `zod-prisma`；
2. 配置 schema.prisma 文件；

```prisma
generator zod {
  provider = "zod-prisma"
  output   = "./zods"
}
```

3. 运行 prisma generate 时，会自动根据数据库的定义生成 zod 文件；

