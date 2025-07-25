# YOLO项目 Makefile

.PHONY: build run test test-coverage clean dev

# 构建项目
build:
	@echo "🔨 Building YOLO project..."
	go build -o bin/yolo main.go

# 运行项目
run:
	@echo "🚀 Starting YOLO server..."
	go run main.go

# 运行开发模式
dev:
	@echo "🔧 Starting YOLO in development mode..."
	GIN_MODE=debug go run main.go

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

# 显示帮助信息
help:
	@echo "YOLO Project Makefile Commands:"
	@echo "  build         - 构建项目"
	@echo "  run           - 运行项目"
	@echo "  dev           - 开发模式运行"
	@echo "  test          - 运行测试"
	@echo "  test-coverage - 运行测试并生成覆盖率报告"
	@echo "  clean         - 清理构建文件"
	@echo "  deps          - 安装依赖"
	@echo "  fmt           - 格式化代码"
	@echo "  lint          - 运行代码检查"
	@echo "  help          - 显示此帮助信息"