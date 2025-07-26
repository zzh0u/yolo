# 多阶段构建 - 构建阶段
FROM golang:1.23-alpine AS builder

# 安装必要的工具
RUN apk add --no-cache git wget

# 设置工作目录
WORKDIR /app

# 复制 go mod 文件
COPY go.mod go.sum ./

# 下载依赖
RUN go mod download

# 复制源代码
COPY . .

# 构建应用
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# 运行阶段
FROM alpine:latest

# 接收构建参数
ARG APP_USER_ID=1001
ARG APP_GROUP_ID=1001

# 安装 ca-certificates 和 wget (用于健康检查)
RUN apk --no-cache add ca-certificates wget

# 创建非root用户（使用环境变量中的ID）
RUN addgroup -g ${APP_GROUP_ID} -S appgroup && \
    adduser -S appuser -u ${APP_USER_ID} -G appgroup

WORKDIR /app

# 从构建阶段复制二进制文件
COPY --from=builder /app/main .

# 更改文件所有者
RUN chown appuser:appgroup main && \
    chmod +x main

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# 运行应用
CMD ["./main"]