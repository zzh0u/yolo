#!/bin/bash

# YOLO项目测试脚本
# 设置测试环境变量并运行所有测试

echo "🧪 Running YOLO Project Tests..."
echo "================================="

# 设置测试环境变量
export GIN_MODE=test
export DB_TYPE=sqlite
export DB_CONNECTION=:memory:
export JWT_SECRET=test-secret-key-for-testing
export SKIP_WEB3_INIT=true

# 运行所有测试
echo "📋 Running all tests..."
go test ./tests/... -v

echo ""
echo "📊 Running tests with coverage..."
go test ./tests/... -v -coverprofile=coverage.out

echo ""
echo "📈 Generating coverage report..."
go tool cover -html=coverage.out -o coverage.html

echo ""
echo "🎯 Test coverage summary:"
go tool cover -func=coverage.out

echo ""
echo "✅ Tests completed! Check coverage.html for detailed coverage report."