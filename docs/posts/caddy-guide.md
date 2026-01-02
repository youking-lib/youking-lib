---
title: 使用 Caddy 轻松代替 Nginx，实现 HTTPS 自动续杯！
date: 2024-12-26
tags: [caddy, DevOps]
---

# 使用 Caddy 轻松代替 Nginx

## 优势

- 安装使用非常简单，配置文件简洁易读
- 自动 HTTPS，证书自动更新

## 用法

### 1. 安装 Caddy

按照 [官方文档](https://caddyserver.com/docs/install)，选择对应的服务器版本安装 Caddy

### 2. 编写配置文件

反向代理运行在 3000 端口的服务

```yaml
# Caddyfile
app.domain.com {
        reverse_proxy :3000 {
                header_up Host {host} # redundant
                header_up X-Real-IP {remote}
                header_up X-Forwarded-Port {server_port} # redundant
        }
}
```

### 3. 启动

```shell
caddy adapt -c ./Caddyfile
caddy run
```

### 4. 代理 OpenAI 的 API 接口

```yaml
openai-api-proxy.domain.com {
    reverse_proxy /* https://api.openai.com {
        header_up -*
        header_up Host api.openai.com
        header_up Authorization {http.request.header.authorization}
        header_up Content-Type {http.request.header.content-type}
        header_up X-Forwarded-Proto {scheme}
        header_up X-Forwarded-For {remote}    
    }
}
```

### 5. 更新配置

```shell
caddy adapt -c ./Caddyfile
caddy reload
```

