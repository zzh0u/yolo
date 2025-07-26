package tests

// import (
// 	"testing"
// 	"yolo/database"
// 	"yolo/models"
// 	"yolo/services"

// 	"github.com/stretchr/testify/assert"
// 	"github.com/stretchr/testify/suite"
// 	"gorm.io/driver/sqlite"
// 	"gorm.io/gorm"
// )

// // ServicesTestSuite 服务测试套件
// type ServicesTestSuite struct {
// 	suite.Suite
// 	db *gorm.DB
// }

// // SetupSuite 测试套件初始化
// func (suite *ServicesTestSuite) SetupSuite() {
// 	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
// 	suite.Require().NoError(err)

// 	database.DB = db
// 	suite.db = db

// 	err = db.AutoMigrate(&models.User{}, &models.Post{}, &models.Stock{}, &models.UserHolding{}, &models.Trade{}, &models.ChartData{}, &models.GiftRecord{})
// 	suite.Require().NoError(err)

// 	services.InitServices()
// }

// // SetupTest 每个测试前的准备
// func (suite *ServicesTestSuite) SetupTest() {
// 	suite.db.Exec("DELETE FROM users")
// 	suite.db.Exec("DELETE FROM posts")
// 	suite.db.Exec("DELETE FROM stocks")
// 	suite.db.Exec("DELETE FROM user_holdings")
// 	suite.db.Exec("DELETE FROM trades")
// 	suite.db.Exec("DELETE FROM chart_data")
// }

// // TestUserService_CreateUser 测试创建用户
// func (suite *ServicesTestSuite) TestUserService_CreateUser() {
// 	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")

// 	assert.NoError(suite.T(), err)
// 	assert.NotNil(suite.T(), user)
// 	assert.Equal(suite.T(), "Test User", user.Name)
// 	assert.Equal(suite.T(), "testuser", user.Username)
// 	assert.Equal(suite.T(), "test@example.com", user.Email)
// 	assert.Equal(suite.T(), 8000.0, user.Balance)
// 	assert.False(suite.T(), user.IsListed)
// 	assert.NotEmpty(suite.T(), user.PasswordHash)
// }

// // TestUserService_IsUsernameExists 测试检查用户名是否存在
// func (suite *ServicesTestSuite) TestUserService_IsUsernameExists() {
// 	// 创建用户
// 	_, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	// 检查存在的用户名
// 	exists := services.UserService.IsUsernameExists("testuser")
// 	assert.True(suite.T(), exists)

// 	// 检查不存在的用户名
// 	exists = services.UserService.IsUsernameExists("nonexistent")
// 	assert.False(suite.T(), exists)
// }

// // TestUserService_ValidateUser 测试验证用户凭据
// func (suite *ServicesTestSuite) TestUserService_ValidateUser() {
// 	// 创建用户
// 	createdUser, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	// 验证正确的凭据
// 	user, err := services.UserService.ValidateUser("testuser", "password123")
// 	assert.NoError(suite.T(), err)
// 	assert.Equal(suite.T(), createdUser.ID, user.ID)

// 	// 验证错误的密码
// 	_, err = services.UserService.ValidateUser("testuser", "wrongpassword")
// 	assert.Error(suite.T(), err)

// 	// 验证不存在的用户
// 	_, err = services.UserService.ValidateUser("nonexistent", "password123")
// 	assert.Error(suite.T(), err)
// }

// // TestPostService_CreatePost 测试创建帖子
// func (suite *ServicesTestSuite) TestPostService_CreatePost() {
// 	// 先创建用户
// 	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	// 创建帖子
// 	post, err := services.PostService.CreatePost(user.ID, "This is a test post")

// 	assert.NoError(suite.T(), err)
// 	assert.NotNil(suite.T(), post)
// 	assert.Equal(suite.T(), user.ID, post.UserID)
// 	assert.Equal(suite.T(), "This is a test post", post.Content)
// 	// 移除不存在的字段检查
// 	// assert.Equal(suite.T(), 0, post.LikesCount)
// 	// assert.Equal(suite.T(), 0, post.CommentsCount)
// }

// // TestStockService_CreateStock 测试创建股票
// func (suite *ServicesTestSuite) TestStockService_CreateStock() {
// 	// 先创建用户
// 	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	// 创建股票
// 	stock, err := services.StockService.CreateStock(user.ID, "TEST", "Test Stock", 1000000.0, "A test stock")

// 	assert.NoError(suite.T(), err)
// 	assert.NotNil(suite.T(), stock)
// 	assert.Equal(suite.T(), user.ID, stock.UserID)
// 	assert.Equal(suite.T(), "TEST", stock.Symbol)
// 	assert.Equal(suite.T(), "Test Stock", stock.Name)
// 	assert.Equal(suite.T(), 1000000.0, stock.Supply) // 使用Supply而不是TotalSupply
// 	assert.Equal(suite.T(), 1.0, stock.Price)        // 使用Price而不是CurrentPrice
// 	assert.NotNil(suite.T(), stock.Description)
// 	assert.Equal(suite.T(), "A test stock", *stock.Description)
// }

// // TestHoldingService_CreateHolding 测试创建持仓
// func (suite *ServicesTestSuite) TestHoldingService_CreateHolding() {
// 	// 先创建用户和股票
// 	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	stock, err := services.StockService.CreateStock(user.ID, "TEST", "Test Stock", 1000000.0, "A test stock")
// 	suite.Require().NoError(err)

// 	// 创建持仓
// 	holding, err := services.HoldingService.CreateHolding(user.ID, stock.ID, 100.0, 10.0)

// 	assert.NoError(suite.T(), err)
// 	assert.NotNil(suite.T(), holding)
// 	assert.Equal(suite.T(), user.ID, holding.UserID)
// 	assert.Equal(suite.T(), stock.ID, holding.StockID)
// 	assert.Equal(suite.T(), 100.0, holding.Quantity)
// 	// 移除AveragePrice字段检查，因为当前模型中没有这个字段
// 	// assert.Equal(suite.T(), 10.0, holding.AveragePrice)
// }

// // TestStockService_IsSymbolExists 测试检查股票符号是否存在
// func (suite *ServicesTestSuite) TestStockService_IsSymbolExists() {
// 	// 先创建用户和股票
// 	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	_, err = services.StockService.CreateStock(user.ID, "TEST", "Test Stock", 1000000.0, "A test stock")
// 	suite.Require().NoError(err)

// 	// 检查存在的股票符号
// 	exists := services.StockService.IsSymbolExists("TEST")
// 	assert.True(suite.T(), exists)

// 	// 检查不存在的股票符号
// 	exists = services.StockService.IsSymbolExists("NONEXISTENT")
// 	assert.False(suite.T(), exists)
// }

// // TestStockService_GetStockBySymbol 测试根据符号获取股票
// func (suite *ServicesTestSuite) TestStockService_GetStockBySymbol() {
// 	// 先创建用户和股票
// 	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
// 	suite.Require().NoError(err)

// 	createdStock, err := services.StockService.CreateStock(user.ID, "TEST", "Test Stock", 1000000.0, "A test stock")
// 	suite.Require().NoError(err)

// 	// 获取股票
// 	stock, err := services.StockService.GetStockBySymbol("TEST")
// 	assert.NoError(suite.T(), err)
// 	assert.Equal(suite.T(), createdStock.ID, stock.ID)
// 	assert.Equal(suite.T(), createdStock.Symbol, stock.Symbol)

// 	// 获取不存在的股票
// 	_, err = services.StockService.GetStockBySymbol("NONEXISTENT")
// 	assert.Error(suite.T(), err)
// }

// // TestServicesTestSuite 运行服务测试套件
// func TestServicesTestSuite(t *testing.T) {
// 	suite.Run(t, new(ServicesTestSuite))
// }
