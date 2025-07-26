# YOLO项目 Makefile

.PHONY: build run test test-coverage clean dev docker-build docker-up docker-down docker-logs

# 构建项目
build:
	@echo "🔨 Building YOLO project..."
	go build -o bin/yolo main.go

# 运行项目（本地开发）
run:
	@echo "🚀 Starting YOLO server locally..."
	@if [ -f .env.local ]; then \
		export $$(cat .env.local | xargs) && go run main.go; \
	else \
		echo "⚠️  .env.local not found, using default environment"; \
		go run main.go; \
	fi

# 运行开发模式（本地）
dev:
	@echo "🔧 Starting YOLO in development mode..."
	@if [ -f .env.local ]; then \
		export $$(cat .env.local | xargs) && GIN_MODE=debug go run main.go; \
	else \
		GIN_MODE=debug go run main.go; \
	fi

# Docker 相关命令
docker-build:
	@echo "🐳 Building Docker images..."
	docker-compose build

docker-up:
	@echo "🚀 Starting Docker services..."
	docker-compose up -d

docker-down:
	@echo "🛑 Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "📋 Showing Docker logs..."
	docker-compose logs -f

docker-restart:
	@echo "🔄 Restarting Docker services..."
	docker-compose down && docker-compose up -d

# 运行测试
test:
	@echo "🧪 Running tests..."
	@bash ./scripts/run_tests.sh

# 运行测试并生成覆盖率报告
test-coverage:
	@echo "📊 Running tests with coverage..."
	@export GIN_MODE=test DB_TYPE=sqlite DB_CONNECTION=:memory: JWT_SECRET=test-secret-key-for-testing SKIP_WEB3_INIT=true && \
	go test ./tests/... -v -coverprofile=coverage.out && \
	go tool cover -html=coverage.out -o coverage.html && \
	go tool cover -func=coverage.out

# 清理构建文件
clean:
	@echo "🧹 Cleaning up..."
	rm -f bin/yolo
	rm -f coverage.out
	rm -f coverage.html
	docker-compose down -v
	docker system prune -f

# 安装依赖
deps:
	@echo "📦 Installing dependencies..."
	go mod download
	go mod tidy

# 格式化代码
fmt:
	@echo "✨ Formatting code..."
	go fmt ./...

# 运行代码检查
lint:
	@echo "🔍 Running linter..."
	golangci-lint run

# 初始化项目
init:
	@echo "🎯 Initializing project..."
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✅ Created .env from template"; \
	fi
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		sed -i '' 's/DB_HOST=postgres/DB_HOST=localhost/' .env.local; \
		sed -i '' 's/GIN_MODE=release/GIN_MODE=debug/' .env.local; \
		sed -i '' 's/NODE_ENV=production/NODE_ENV=development/' .env.local; \
		echo "✅ Created .env.local for local development"; \
	fi

# 显示帮助信息
help:
	@echo "YOLO Project Makefile Commands:"
	@echo "  build         - 构建项目"
	@echo "  run           - 运行项目（本地开发）"
	@echo "  dev           - 开发模式运行（本地）"
	@echo "  docker-build  - 构建Docker镜像"
	@echo "  docker-up     - 启动Docker服务"
	@echo "  docker-down   - 停止Docker服务"
	@echo "  docker-logs   - 查看Docker日志"
	@echo "  docker-restart- 重启Docker服务"
	@echo "  test          - 运行测试"
	@echo "  test-coverage - 运行测试并生成覆盖率报告"
	@echo "  clean         - 清理构建文件和Docker资源"
	@echo "  deps          - 安装依赖"
	@echo "  fmt           - 格式化代码"
	@echo "  lint          - 运行代码检查"
	@echo "  init          - 初始化项目配置"
	@echo "  help          - 显示此帮助信息"