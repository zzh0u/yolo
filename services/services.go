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

// 全局服务实例
var (
	UserService         *userService
	TokenService        *tokenService
	HoldingService      *holdingService
	PriceHistoryService *priceHistoryService
	TradeService        *tradeService
)

// InitServices 初始化所有服务
func InitServices() {
	UserService = &userService{}
	TokenService = &tokenService{}
	HoldingService = &holdingService{}
	PriceHistoryService = &priceHistoryService{}
	TradeService = &tradeService{}

	log.Println("All services initialized successfully")
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
func (s *userService) CreateUser(username, email, password string) (*models.User, error) {
	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Username:     username,
		Email:        email,
		PasswordHash: string(hashedPassword),
		Balance:      8000.00, // 默认赠送8000 token
		IsListed:     false,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if err := database.DB.Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
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

// UpdateUserProfile 更新用户资料
func (s *userService) UpdateUserProfile(userID uuid.UUID, email string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
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

// ListUser 上市用户
func (s *userService) ListUser(userID uuid.UUID) error {
	return database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_listed":  true,
		"updated_at": time.Now(),
	}).Error
}

// ==================== Token Service ====================

type tokenService struct{}

// IsTokenSymbolExists 检查token符号是否存在
func (s *tokenService) IsTokenSymbolExists(symbol string) bool {
	var count int64
	database.DB.Model(&models.UserToken{}).Where("token_symbol = ?", symbol).Count(&count)
	return count > 0
}

// CreateToken 创建用户token
func (s *tokenService) CreateToken(userID uuid.UUID, symbol, name string, totalSupply float64, description string) (*models.UserToken, error) {
	token := &models.UserToken{
		UserID:       userID,
		TokenSymbol:  symbol,
		TokenName:    name,
		TotalSupply:  totalSupply,
		CurrentPrice: 1.00, // 默认价格
		CreatedAt:    time.Now(),
	}

	if description != "" {
		token.Description = &description
	}

	if err := database.DB.Create(token).Error; err != nil {
		return nil, fmt.Errorf("failed to create token: %w", err)
	}

	return token, nil
}

// GetAllTokens 获取所有token列表
func (s *tokenService) GetAllTokens(page, limit int) ([]models.UserToken, int64, error) {
	var tokens []models.UserToken
	var total int64

	// 计算总数
	database.DB.Model(&models.UserToken{}).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("User").Offset(offset).Limit(limit).Find(&tokens).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get tokens: %w", err)
	}

	return tokens, total, nil
}

// GetTokenBySymbol 根据符号获取token
func (s *tokenService) GetTokenBySymbol(symbol string) (*models.UserToken, error) {
	var token models.UserToken
	if err := database.DB.Preload("User").Where("token_symbol = ?", symbol).First(&token).Error; err != nil {
		return nil, fmt.Errorf("token not found: %w", err)
	}
	return &token, nil
}

// UpdateToken 更新token信息
func (s *tokenService) UpdateToken(symbol, name, description string) (*models.UserToken, error) {
	var token models.UserToken
	if err := database.DB.Where("token_symbol = ?", symbol).First(&token).Error; err != nil {
		return nil, fmt.Errorf("token not found: %w", err)
	}

	if name != "" {
		token.TokenName = name
	}
	if description != "" {
		token.Description = &description
	}

	if err := database.DB.Save(&token).Error; err != nil {
		return nil, fmt.Errorf("failed to update token: %w", err)
	}

	return &token, nil
}

// ==================== Holding Service ====================

type holdingService struct{}

// GetUserHoldings 获取用户持仓
func (s *holdingService) GetUserHoldings(userID uuid.UUID) ([]models.UserHolding, error) {
	var holdings []models.UserHolding
	if err := database.DB.Preload("Token").Preload("User").Where("user_id = ?", userID).Find(&holdings).Error; err != nil {
		return nil, fmt.Errorf("failed to get holdings: %w", err)
	}
	return holdings, nil
}

// ==================== Price History Service ====================

type priceHistoryService struct{}

// GetTokenPriceHistory 获取token价格历史
func (s *priceHistoryService) GetTokenPriceHistory(tokenID uuid.UUID, timeframe string, limit int) ([]models.PriceHistory, error) {
	var priceHistory []models.PriceHistory
	if err := database.DB.Where("token_id = ? AND timeframe = ?", tokenID, timeframe).
		Order("timestamp DESC").
		Limit(limit).
		Find(&priceHistory).Error; err != nil {
		return nil, fmt.Errorf("failed to get price history: %w", err)
	}
	return priceHistory, nil
}

// ==================== Trade Service ====================

type tradeService struct{}

// GetUserTrades 获取用户交易记录
func (s *tradeService) GetUserTrades(userID uuid.UUID, page, limit int) ([]interface{}, int64, error) {
	// 这里返回空数组，因为还没有实现交易表
	// 在实际项目中需要创建Trade模型和相关逻辑
	return []interface{}{}, 0, nil
}
