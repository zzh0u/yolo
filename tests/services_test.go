package tests

import (
	"testing"
	"yolo/database"
	"yolo/models"
	"yolo/services"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// ServicesTestSuite 服务测试套件
type ServicesTestSuite struct {
	suite.Suite
	db *gorm.DB
}

// SetupSuite 测试套件初始化
func (suite *ServicesTestSuite) SetupSuite() {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	suite.Require().NoError(err)

	database.DB = db
	suite.db = db

	err = db.AutoMigrate(&models.User{}, &models.UserToken{}, &models.UserHolding{}, &models.PriceHistory{}, &models.GiftRecord{})
	suite.Require().NoError(err)

	services.InitServices()
}

// SetupTest 每个测试前的准备
func (suite *ServicesTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM users")
	suite.db.Exec("DELETE FROM user_tokens")
	suite.db.Exec("DELETE FROM user_holdings")
}

// TestUserService_CreateUser 测试创建用户
func (suite *ServicesTestSuite) TestUserService_CreateUser() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), user)
	assert.Equal(suite.T(), "testuser", user.Username)
	assert.Equal(suite.T(), "test@example.com", user.Email)
	assert.Equal(suite.T(), 8000.0, user.Balance)
	assert.False(suite.T(), user.IsListed)
	assert.NotEmpty(suite.T(), user.PasswordHash)
}

// TestUserService_IsUsernameExists 测试检查用户名是否存在
func (suite *ServicesTestSuite) TestUserService_IsUsernameExists() {
	// 创建用户
	_, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	// 检查存在的用户名
	exists := services.UserService.IsUsernameExists("testuser")
	assert.True(suite.T(), exists)

	// 检查不存在的用户名
	exists = services.UserService.IsUsernameExists("nonexistent")
	assert.False(suite.T(), exists)
}

// TestUserService_ValidateUser 测试验证用户凭据
func (suite *ServicesTestSuite) TestUserService_ValidateUser() {
	// 创建用户
	createdUser, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	// 验证正确的凭据
	user, err := services.UserService.ValidateUser("testuser", "password123")
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), createdUser.ID, user.ID)

	// 验证错误的密码
	_, err = services.UserService.ValidateUser("testuser", "wrongpassword")
	assert.Error(suite.T(), err)

	// 验证不存在的用户
	_, err = services.UserService.ValidateUser("nonexistent", "password123")
	assert.Error(suite.T(), err)
}

// TestTokenService_CreateToken 测试创建代币
func (suite *ServicesTestSuite) TestTokenService_CreateToken() {
	// 先创建用户
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	// 创建代币
	token, err := services.TokenService.CreateToken(user.ID, "TEST", "Test Token", 1000000.0, "A test token")

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), token)
	assert.Equal(suite.T(), user.ID, token.UserID)
	assert.Equal(suite.T(), "TEST", token.TokenSymbol)
	assert.Equal(suite.T(), "Test Token", token.TokenName)
	assert.Equal(suite.T(), 1000000.0, token.TotalSupply)
	assert.Equal(suite.T(), 1.0, token.CurrentPrice)
	assert.NotNil(suite.T(), token.Description)
	assert.Equal(suite.T(), "A test token", *token.Description)
}

// TestTokenService_IsTokenSymbolExists 测试检查代币符号是否存在
func (suite *ServicesTestSuite) TestTokenService_IsTokenSymbolExists() {
	// 先创建用户和代币
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	_, err = services.TokenService.CreateToken(user.ID, "TEST", "Test Token", 1000000.0, "A test token")
	suite.Require().NoError(err)

	// 检查存在的代币符号
	exists := services.TokenService.IsTokenSymbolExists("TEST")
	assert.True(suite.T(), exists)

	// 检查不存在的代币符号
	exists = services.TokenService.IsTokenSymbolExists("NONEXISTENT")
	assert.False(suite.T(), exists)
}

// TestTokenService_GetTokenBySymbol 测试根据符号获取代币
func (suite *ServicesTestSuite) TestTokenService_GetTokenBySymbol() {
	// 先创建用户和代币
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	createdToken, err := services.TokenService.CreateToken(user.ID, "TEST", "Test Token", 1000000.0, "A test token")
	suite.Require().NoError(err)

	// 获取代币
	token, err := services.TokenService.GetTokenBySymbol("TEST")
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), createdToken.ID, token.ID)
	assert.Equal(suite.T(), createdToken.TokenSymbol, token.TokenSymbol)

	// 获取不存在的代币
	_, err = services.TokenService.GetTokenBySymbol("NONEXISTENT")
	assert.Error(suite.T(), err)
}

// TestServicesTestSuite 运行服务测试套件
func TestServicesTestSuite(t *testing.T) {
	suite.Run(t, new(ServicesTestSuite))
}