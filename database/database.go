package database

import (
	"fmt"
	"log"
	"os"
	"strings"
	"yolo/models"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// InitDatabase 初始化数据库连接
func InitDatabase() error {
	// 检查是否为测试环境
	dbType := os.Getenv("DB_TYPE")
	if dbType == "sqlite" {
		return initSQLiteDatabase()
	}
	return initPostgresDatabase()
}

// initSQLiteDatabase 初始化SQLite数据库（用于测试）
func initSQLiteDatabase() error {
	dbConnection := os.Getenv("DB_CONNECTION")
	if dbConnection == "" {
		dbConnection = ":memory:"
	}

	var err error
	DB, err = gorm.Open(sqlite.Open(dbConnection), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent), // 测试时静默日志
	})

	if err != nil {
		return fmt.Errorf("failed to connect to SQLite database: %w", err)
	}

	log.Println("SQLite database connected successfully")
	return nil
}

// initPostgresDatabase 初始化PostgreSQL数据库（用于生产）
func initPostgresDatabase() error {
	// 从环境变量获取数据库配置
	host := os.Getenv("DB_HOST")
	if host == "" {
		host = "localhost"
	}

	port := os.Getenv("DB_PORT")
	if port == "" {
		port = "5432"
	}

	user := os.Getenv("DB_USER")
	if user == "" {
		user = "postgres"
	}

	password := os.Getenv("DB_PASSWORD")
	if password == "" {
		password = "password"
	}

	dbname := os.Getenv("DB_NAME")
	if dbname == "" {
		dbname = "yolo_db"
	}

	sslmode := os.Getenv("DB_SSLMODE")
	if sslmode == "" {
		sslmode = "disable"
	}

	// 构建数据库连接字符串 - 移除时区设置
	dsn := fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=%s",
		host, user, password, dbname, port, sslmode)

	// 连接数据库
	var err error
	DB, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})

	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	// 测试连接
	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get database instance: %w", err)
	}

	if err := sqlDB.Ping(); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("PostgreSQL database connected successfully")
	return nil
}

// AutoMigrate 自动迁移数据库表 - 仅迁移用户管理相关表
func AutoMigrate() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	// 仅迁移用户和帖子模型
	err := DB.AutoMigrate(
		&models.User{},
		&models.Post{},
	)

	if err != nil {
		// 检查是否是约束相关的错误，如果是则忽略
		errStr := err.Error()
		if strings.Contains(errStr, "constraint") && strings.Contains(errStr, "does not exist") {
			log.Printf("Warning: Constraint error ignored during migration: %v", err)
			log.Println("Database migration completed with warnings")
			return nil
		} else {
			return fmt.Errorf("failed to migrate database: %w", err)
		}
	}

	log.Println("Database migration completed successfully - User Management Only")
	return nil
}

// ==================== 以下功能已停用 ====================
// 如果将来需要恢复交易功能，可以取消注释以下代码：
/*
// AutoMigrateAll 迁移所有表（包括交易相关）
func AutoMigrateAll() error {
	if DB == nil {
		return fmt.Errorf("database not initialized")
	}

	err := DB.AutoMigrate(
		&models.User{},
		&models.Post{},
		&models.Stock{},
		&models.UserHolding{},
		&models.Trade{},
		&models.ChartData{},
		&models.GiftRecord{},
	)

	if err != nil {
		errStr := err.Error()
		if strings.Contains(errStr, "constraint") && strings.Contains(errStr, "does not exist") {
			log.Printf("Warning: Constraint error ignored during migration: %v", err)
			log.Println("Database migration completed with warnings")
			return nil
		} else {
			return fmt.Errorf("failed to migrate database: %w", err)
		}
	}

	log.Println("Full database migration completed successfully")
	return nil
}
*/

// GetDB 获取数据库实例
func GetDB() *gorm.DB {
	return DB
}

// CloseDB 关闭数据库连接
func CloseDB() error {
	if DB == nil {
		return nil
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}

	return sqlDB.Close()
}
