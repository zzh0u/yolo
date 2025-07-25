package tests

import (
	"os"
	"yolo/database"
	"yolo/models"
	"yolo/services"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// SetupTestEnvironment 设置测试环境
func SetupTestEnvironment() (*gorm.DB, error) {
	// 设置测试环境变量
	os.Setenv("GIN_MODE", "test")
	os.Setenv("DB_TYPE", "sqlite")
	os.Setenv("DB_CONNECTION", ":memory:")
	os.Setenv("JWT_SECRET", "test-secret-key-for-testing")
	os.Setenv("SKIP_WEB3_INIT", "true")

	gin.SetMode(gin.TestMode)

	// 初始化内存数据库
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	// 设置全局数据库实例
	database.DB = db

	// 自动迁移
	err = db.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Stock{},
		&models.UserHolding{},
		&models.Trade{},
		&models.ChartData{},
		&models.GiftRecord{},
	)
	if err != nil {
		return nil, err
	}

	// 初始化服务
	services.InitServices()

	return db, nil
}

// CleanupTestEnvironment 清理测试环境
func CleanupTestEnvironment(db *gorm.DB) {
	if db != nil {
		sqlDB, _ := db.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}
}
