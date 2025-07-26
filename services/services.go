package services

import (
	"fmt"
	"log"
	"time"
	"yolo/database"
	"yolo/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// 全局服务实例 - 仅保留用户管理相关服务
var (
	UserService *userService
	PostService *postService
	// ==================== 以下服务已停用 ====================
	// StockService     *stockService
	// HoldingService   *holdingService
	// ChartDataService *chartDataService
	// TradeService     *tradeService
	// GiftService      *giftService
)

// InitServices 初始化服务 - 仅初始化用户管理相关服务
func InitServices() {
	UserService = &userService{}
	PostService = &postService{}
	// ==================== 以下服务已停用 ====================
	// StockService = &stockService{}
	// HoldingService = &holdingService{}
	// ChartDataService = &chartDataService{}
	// TradeService = &tradeService{}
	// GiftService = &giftService{}

	log.Println("User management services initialized successfully")
}

// ==================== User Service ====================

type userService struct{}

// IsUsernameExists 检查用户名是否存在
func (s *userService) IsUsernameExists(username string) bool {
	var count int64
	database.DB.Model(&models.User{}).Where("username = ?", username).Count(&count)
	return count > 0
}

// IsEmailExists 检查邮箱是否存在
func (s *userService) IsEmailExists(email string) bool {
	var count int64
	database.DB.Model(&models.User{}).Where("email = ?", email).Count(&count)
	return count > 0
}

// CreateUser 创建普通用户
func (s *userService) CreateUser(name, username, email, password string) (*models.User, error) {
	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Name:         name,
		Username:     username,
		Email:        email,
		PasswordHash: string(hashedPassword),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
		// ==================== 以下字段已停用 ====================
		// YoloStockValue: 0.00,
		// Balance:        8000.00, // 默认赠送8000 token
		// IsListed:       false,
	}

	if err := database.DB.Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// CreateGoogleUser 创建Google用户
func (s *userService) CreateGoogleUser(name, email, googleID, avatar string) (*models.User, error) {
	user := &models.User{
		Name:      name,
		Username:  email, // 使用邮箱作为用户名
		Email:     email,
		GoogleID:  &googleID,
		Avatar:    &avatar,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
		// ==================== 以下字段已停用 ====================
		// YoloStockValue: 0.00,
		// Balance:        8000.00,
		// IsListed:       false,
	}

	if err := database.DB.Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create google user: %w", err)
	}

	return user, nil
}

// ValidateUser 验证用户凭据
func (s *userService) ValidateUser(username, password string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// 检查密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	return &user, nil
}

// GetUserByID 根据ID获取用户
func (s *userService) GetUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

// GetUserByEmail 根据邮箱获取用户
func (s *userService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

// GetUserByUsername 根据用户名获取用户信息
func (s *userService) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

// UpdateUserProfile 更新用户资料
func (s *userService) UpdateUserProfile(userID uuid.UUID, name, email string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if name != "" {
		user.Name = name
	}
	if email != "" {
		user.Email = email
	}
	user.UpdatedAt = time.Now()

	if err := database.DB.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return &user, nil
}

// ==================== 以下用户功能已停用 ====================
/*
// ListUser 上市用户 - 已停用
func (s *userService) ListUser(userID uuid.UUID) error {
	return database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_listed":  true,
		"updated_at": time.Now(),
	}).Error
}
*/

// ==================== Post Service ====================

type postService struct{}

// CreatePost 创建新帖子
func (s *postService) CreatePost(userID uuid.UUID, content string) (*models.Post, error) {
	post := &models.Post{
		UserID:    userID,
		Content:   content,
		Timestamp: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.DB.Create(post).Error; err != nil {
		return nil, fmt.Errorf("failed to create post: %w", err)
	}

	// 预加载用户信息
	if err := database.DB.Preload("User").First(post, post.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load post with user: %w", err)
	}

	return post, nil
}

// GetTimeline 获取时间线帖子
func (s *postService) GetTimeline(page, limit int) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	// 计算总数
	database.DB.Model(&models.Post{}).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("User").
		Order("timestamp DESC").
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get timeline: %w", err)
	}

	return posts, total, nil
}

// GetUserPosts 获取用户的帖子
func (s *postService) GetUserPosts(userID uuid.UUID, page, limit int) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	// 计算总数
	database.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("User").
		Where("user_id = ?", userID).
		Order("timestamp DESC").
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get user posts: %w", err)
	}

	return posts, total, nil
}

// ==================== 以下服务已全部停用 ====================
/*
// ==================== Stock Service ====================
// ==================== Holding Service ====================
// ==================== Chart Data Service ====================
// ==================== Trade Service ====================
// ==================== Gift Service ====================
*/
