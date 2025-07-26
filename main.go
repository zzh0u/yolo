package main

import (
	"log"
	"yolo/database"
	"yolo/routes"
	"yolo/services"
)

func main() {
	// 初始化数据库连接
	if err := database.InitDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// Web3功能已完全停用
	log.Println("Web3/Blockchain features are disabled")

	// 自动迁移数据库表 - 仅迁移用户管理相关表
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 初始化服务 - 仅初始化用户管理相关服务
	services.InitServices()

	// 设置路由
	router := routes.SetupRoutes()

	// 启动服务器
	log.Println("Starting YOLO API server on 0.0.0.0:8080")
	log.Println("✅ Available features: User Authentication, User Management, Posts")
	log.Println("❌ Disabled features: Stock Trading, Blockchain/Web3 transactions, User Holdings, Gift System")

	if err := router.Run("0.0.0.0:8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
