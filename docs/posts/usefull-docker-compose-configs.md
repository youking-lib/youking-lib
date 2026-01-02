---
title: 使用 Docker Compose 快速部署常用的服务
date: 2024-12-26
tags: [docker, caddy, docker-compose]
---

# 使用 Docker Compose 快速部署常用的服务

## 前言

### 1. 安装 Docker

按照 [官方文档](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) 安装 docker

```shell
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
```

### 2. 安装图形化的管理面板

[安装图形化的管理面板 portainer](https://docs.portainer.io/start/install/server/docker/linux)

## 常用指令

### 1. 启动服务

```shell
cd ~/apps/mysql/docker-compose.yml
docker compose up -d
```

### 2. 停用服务

```shell
cd ~/apps/mysql/docker-compose.yml
docker down
```

### 3. 查看容器日志

```shell
docker container ls
docker logs [id]
```

### 4. 进入容器

```shell
docker exec [id] -it /bin/bash
```

## 常用配置一览

笔者习惯将 Volume 目录放到 `docker-compose.yml` 同级目录下，方便管理，因此会作形如下面的配置：

```yml
services:
  db:
    image: mysql:5.7
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mysql/confs:/etc/mysql
```

## [SAAS] Dify

1. [部署文档](https://docs.dify.ai/zh-hans/getting-started/install-self-hosted/docker-compose)
2. 修改 `.env` 文件，部署监听在非 80 端口

```env
EXPOSE_NGINX_PORT=8001
```

3. 使用 Caddy 方向代理

```yml
dify.yourdomain.com {
        reverse_proxy :8001 {
                header_up Host {host} # redundant
                header_up X-Real-IP {remote}
                header_up X-Forwarded-Port {server_port} # redundant
        }
}
```

## [SAAS] Umami

### 配置文件

```yml
# apps/umami/docker-compose.yml
services:
  umami:
    image: ghcr.io/umami-software/umami:postgresql-latest
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://umami:umami@db:5432/umami
      DATABASE_TYPE: postgresql
      APP_SECRET: replace-me-with-a-random-string
    depends_on:
      db:
        condition: service_healthy
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "curl http://localhost:3000/api/heartbeat"]
      interval: 5s
      timeout: 5s
      retries: 5
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: umami
      POSTGRES_USER: umami
      POSTGRES_PASSWORD: umami
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/umami/data:/var/lib/postgresql/data
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $${POSTGRES_USER} -d $${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 5
volumes:
  umami-db-data
```

### 使用 Caddy 反向代理

```yml
umami.yourdomain.com {
        reverse_proxy :3000 {
                header_up Host {host} # redundant
        }
}
```

## [SAAS] Flowise AI

```yml
# apps/flowise/docker-compose.yml
services:
    flowise:
        image: flowiseai/flowise
        restart: always
        environment:
            - PORT=${PORT}
            - CORS_ORIGINS=${CORS_ORIGINS}
            - IFRAME_ORIGINS=${IFRAME_ORIGINS}
            - FLOWISE_USERNAME=${FLOWISE_USERNAME}
            - FLOWISE_PASSWORD=${FLOWISE_PASSWORD}
            - FLOWISE_FILE_SIZE_LIMIT=${FLOWISE_FILE_SIZE_LIMIT}
            - DEBUG=${DEBUG}
            - DATABASE_PATH=${DATABASE_PATH}
            - DATABASE_TYPE=${DATABASE_TYPE}
            - DATABASE_PORT=${DATABASE_PORT}
            - DATABASE_HOST=${DATABASE_HOST}
            - DATABASE_NAME=${DATABASE_NAME}
            - DATABASE_USER=${DATABASE_USER}
            - DATABASE_PASSWORD=${DATABASE_PASSWORD}
            - DATABASE_SSL=${DATABASE_SSL}
            - DATABASE_SSL_KEY_BASE64=${DATABASE_SSL_KEY_BASE64}
            - APIKEY_PATH=${APIKEY_PATH}
            - SECRETKEY_PATH=${SECRETKEY_PATH}
            - FLOWISE_SECRETKEY_OVERWRITE=${FLOWISE_SECRETKEY_OVERWRITE}
            - LOG_LEVEL=${LOG_LEVEL}
            - LOG_PATH=${LOG_PATH}
            - BLOB_STORAGE_PATH=${BLOB_STORAGE_PATH}
            - DISABLE_FLOWISE_TELEMETRY=${DISABLE_FLOWISE_TELEMETRY}
            - MODEL_LIST_CONFIG_JSON=${MODEL_LIST_CONFIG_JSON}
        ports:
            - '${PORT}:${PORT}'
        volumes:
            - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/flowise:/root/.flowise
        entrypoint: /bin/sh -c "sleep 3; flowise start"
```

## [数据库] Mysql

```yml
# apps/mysql/docker-compose.yml
services:
  db:
    image: mysql:5.7
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: xxx_PASSWORD
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mysql/confs:/etc/mysql
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mysql/logs:/var/log/mysql
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mysql/data:/var/lib/mysql
    ports:
      - 3306:3306
```

## [数据库] MongoDB

```yml
# apps/mongo/docker-compose.yml
services:
  mongo:
    image: 'mongo:7.0.5'
    ports:
      - 27017:27017
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/mongo:/var/lib/mongodb/data

  mongo-express:
    image: 'mongo-express:1.0.2'
    ports:
      - 8081:8081
    environment:
      ME_CONFIG_BASICAUTH_USERNAME: admin
      ME_CONFIG_BASICAUTH_PASSWORD: admin
```

## [数据库] Milvus

```yml
# apps/milvus/docker-compose.yml
services:
  etcd:
    container_name: milvus-etcd
    restart: always
    image: quay.io/coreos/etcd:v3.5.14
    environment:
      - ETCD_AUTO_COMPACTION_MODE=revision
      - ETCD_AUTO_COMPACTION_RETENTION=1000
      - ETCD_QUOTA_BACKEND_BYTES=4294967296
      - ETCD_SNAPSHOT_COUNT=50000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/etcd:/etcd
    command: etcd -advertise-client-urls=http://127.0.0.1:2379 -listen-client-urls http://0.0.0.0:2379 --data-dir /etcd
    healthcheck:
      test: ["CMD", "etcdctl", "endpoint", "health"]
      interval: 30s
      timeout: 20s
      retries: 3

  minio:
    container_name: milvus-minio
    restart: always
    image: minio/minio:RELEASE.2023-03-20T20-16-18Z
    environment:
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
    ports:
      - "9001:9001"
      - "19000:9000"
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/minio:/minio_data
    command: minio server /minio_data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

  standalone:
    container_name: milvus-standalone
    image: milvusdb/milvus:v2.4.11
    command: ["milvus", "run", "standalone"]
    security_opt:
    - seccomp:unconfined
    environment:
      ETCD_ENDPOINTS: etcd:2379
      MINIO_ADDRESS: minio:9000
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/milvus:/var/lib/milvus
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9091/healthz"]
      interval: 30s
      start_period: 90s
      timeout: 20s
      retries: 3
    ports:
      - "19530:19530"
      - "9091:9091"
    depends_on:
      - "etcd"
      - "minio"
  attu:
    container_name: attu
    image: zilliz/attu:latest
    environment:
      MILVUS_URL: milvus-standalone:19530
    ports:
      - "9002:3000"
    depends_on:
      - "standalone"

networks:
  default:
    name: milvus
```

## [数据库] Neo4j

```yml
# apps/neo4j/docker-compose.yml
services:
  neo4j:
    image: neo4j:4.4.38
    restart: always
    environment:
      - NEO4J_AUTH=neo4j/neo4j_passowrd
      - NEO4J_apoc_export_file_enabled=true
      - NEO4J_apoc_import_file_enabled=true
      - NEO4J_apoc_import_file_use__neo4j__config=true
      - NEO4J_dbms_connector_bolt_listen__address=7688
      - NEO4J_dbms_connector_bolt_advertised__address=7688
      - NEO4J_PLUGINS=["apoc", "graph-data-science"]
    volumes:
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/neo4j/data:/data
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/neo4j/logs:/logs
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/neo4j/config:/config
      - ${DOCKER_VOLUME_DIRECTORY:-.}/volumes/neo4j/plugins:/plugins
    ports: 
      - 7474:7474
      - 7687:7687
```

## [中间件] Kafka

```yml
# apps/kafka/docker-compose.yml
services:
  zookeeper:
    image: 'bitnami/zookeeper:latest'
    restart: always
    ports:
      - 2181:2181
    environment:
      ALLOW_ANONYMOUS_LOGIN: "yes"
  kafka:
    image: 'bitnami/kafka:latest'
    restart: always
    ports:
      - 9092:9092
    environment:
      KAFKA_CFG_ZOOKEEPER_CONNECT: zookeeper:2181
      ALLOW_PLAINTEXT_LISTENER: "yes"
      KAFKA_ADVERTISED_HOST_NAME: 101.43.207.38                  ## 修改:宿主机IP
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://101.43.207.38:9092    ## 修改:宿主机IP
      KAFKA_ZOOKEEPER_CONNECT: "101.43.207.38:2181"
      KAFKA_ADVERTISED_PORT: 9092
      KAFKA_BROKER_ID: 1
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
    depends_on:
      - zookeeper
  kafka-ui:
    container_name: kafka-ui
    image: provectuslabs/kafka-ui:latest
    ports:
      - 8888:8080
    environment:
      - KAFKA_CLUSTERS_0_NAME=dev_cluster
      - KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS=101.43.207.38:9092
```

