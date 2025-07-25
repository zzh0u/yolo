package main

import (
	"log"
	"yolo/config"
	"yolo/database"
	"yolo/routes"
	"yolo/services"
)

func main() {
	// 初始化数据库连接
	if err := database.InitDatabase(); err != nil {
		log.Fatal("Failed to initialize database:", err)
	}

	// 初始化Web3连接
	if err := config.InitWeb3(); err != nil {
		log.Fatal("Failed to initialize Web3:", err)
	}

	// 自动迁移数据库表
	if err := database.AutoMigrate(); err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// 初始化服务
	services.InitServices()

	// 设置路由
	router := routes.SetupRoutes()

	// 启动服务器
	log.Println("Starting YOLO API server on :8080")
	if err := router.Run(":8080"); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
