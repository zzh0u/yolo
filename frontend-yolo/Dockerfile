# 多阶段构建 - 依赖安装阶段
FROM node:18-alpine AS deps

# 接收构建参数
ARG NEXT_PUBLIC_API_URL

RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制 package 文件
COPY package*.json ./
# 安装所有依赖（包括devDependencies，构建时需要）
RUN npm ci

# 构建阶段
FROM node:18-alpine AS builder

# 接收构建参数
ARG NEXT_PUBLIC_API_URL

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置构建时环境变量
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# 构建应用
RUN npm run build

# 生产依赖安装阶段
FROM node:18-alpine AS prod-deps

WORKDIR /app
COPY package*.json ./
# 只安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 运行阶段
FROM node:18-alpine AS runner

# 接收构建参数
ARG APP_USER_ID=1001
ARG APP_GROUP_ID=1001

WORKDIR /app
ENV NODE_ENV=production

# 创建非root用户（使用环境变量中的ID）
RUN addgroup --system --gid ${APP_GROUP_ID} nodejs && \
    adduser --system --uid ${APP_USER_ID} nextjs --ingroup nodejs

# 复制生产依赖
COPY --from=prod-deps /app/node_modules ./node_modules

# 复制构建产物
COPY --from=builder /app/public ./public

# 检查是否存在 standalone 目录，如果不存在则复制整个 .next 目录
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 更改文件所有者
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]