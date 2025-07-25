package tests

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"yolo/controllers"
	"yolo/database"
	"yolo/models"
	"yolo/routes"
	"yolo/services"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// IntegrationTestSuite 集成测试套件
type IntegrationTestSuite struct {
	suite.Suite
	router *gin.Engine
	db     *gorm.DB
}

// SetupSuite 测试套件初始化
func (suite *IntegrationTestSuite) SetupSuite() {
	gin.SetMode(gin.TestMode)

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	suite.Require().NoError(err)

	database.DB = db
	suite.db = db

	err = db.AutoMigrate(&models.User{}, &models.Post{}, &models.Stock{}, &models.UserHolding{}, &models.Trade{}, &models.ChartData{}, &models.GiftRecord{})
	suite.Require().NoError(err)

	services.InitServices()
	suite.router = routes.SetupRoutes()
}

// SetupTest 每个测试前的准备
func (suite *IntegrationTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM users")
	suite.db.Exec("DELETE FROM posts")
	suite.db.Exec("DELETE FROM stocks")
	suite.db.Exec("DELETE FROM user_holdings")
	suite.db.Exec("DELETE FROM trades")
	suite.db.Exec("DELETE FROM chart_data")
}

// TestUserRegistrationAndStockCreationFlow 测试用户注册和股票创建流程
func (suite *IntegrationTestSuite) TestUserRegistrationAndStockCreationFlow() {
	// 1. 用户注册
	registerReq := controllers.RegisterRequest{
		Name:     "Test User",
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}

	jsonBody, _ := json.Marshal(registerReq)
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var authResponse controllers.AuthResponse
	err := json.Unmarshal(w.Body.Bytes(), &authResponse)
	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), authResponse.Token)

	// 2. 使用token创建股票 - 修正：直接使用 User.ID
	stock, err := services.StockService.CreateStock(authResponse.User.ID, "MYSTOCK", "My Stock", 1000000.0, "My awesome stock")
	suite.Require().NoError(err)

	assert.Equal(suite.T(), "MYSTOCK", stock.Symbol)
	assert.Equal(suite.T(), "My Stock", stock.Name)

	// 3. 获取用户资料验证
	req, _ = http.NewRequest("GET", "/api/v1/user/profile", nil)
	req.Header.Set("Authorization", "Bearer "+authResponse.Token)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var profileResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &profileResponse)
	assert.NoError(suite.T(), err)

	user := profileResponse["user"].(map[string]interface{})
	assert.Equal(suite.T(), "testuser", user["username"])
	assert.Equal(suite.T(), 8000.0, user["balance"]) // 默认余额
}

// TestLoginAndStockManagementFlow 测试登录和股票管理流程
func (suite *IntegrationTestSuite) TestLoginAndStockManagementFlow() {
	// 1. 先注册用户
	user, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	// 2. 用户登录
	loginReq := controllers.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	jsonBody, _ := json.Marshal(loginReq)
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var authResponse controllers.AuthResponse
	err = json.Unmarshal(w.Body.Bytes(), &authResponse)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), user.ID.String(), authResponse.User.ID.String()) // 修正：比较字符串形式

	// 3. 创建股票
	stock, err := services.StockService.CreateStock(user.ID, "TEST", "Test Stock", 500000.0, "Test description")
	suite.Require().NoError(err)

	// 4. 获取股票信息
	req, _ = http.NewRequest("GET", "/api/v1/stocks/TEST", nil)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	// 修正：使用正确的响应结构和字段名
	var stockResponse controllers.StockDetailResponse
	err = json.Unmarshal(w.Body.Bytes(), &stockResponse)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "TEST", stockResponse.StockResponse.Symbol)
	assert.Equal(suite.T(), "Test Stock", stockResponse.StockResponse.Name)

	// 5. 执行交易 - 修正：移除 UserID 字段，使用正确的 API 路径
	tradeReq := controllers.TradeRequest{
		Type:   "buy",
		Amount: 100.0,
	}

	jsonBody, _ = json.Marshal(tradeReq)
	req, _ = http.NewRequest("POST", "/api/v1/stocks/"+stock.ID.String()+"/trade", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authResponse.Token)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var tradeResponse controllers.TradeResponse
	err = json.Unmarshal(w.Body.Bytes(), &tradeResponse)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), true, tradeResponse.Success)
}

// TestPostCreationAndTimelineFlow 测试帖子创建和时间线流程
func (suite *IntegrationTestSuite) TestPostCreationAndTimelineFlow() {
	// 1. 先注册用户
	_, err := services.UserService.CreateUser("Test User", "testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	// 2. 用户登录
	loginReq := controllers.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	jsonBody, _ := json.Marshal(loginReq)
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var authResponse controllers.AuthResponse
	err = json.Unmarshal(w.Body.Bytes(), &authResponse)
	assert.NoError(suite.T(), err)

	// 3. 创建帖子
	createPostReq := controllers.CreatePostRequest{
		Content: "This is my first post!",
	}

	jsonBody, _ = json.Marshal(createPostReq)
	req, _ = http.NewRequest("POST", "/api/v1/posts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authResponse.Token)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var postResponse controllers.CreatePostResponse
	err = json.Unmarshal(w.Body.Bytes(), &postResponse)
	assert.NoError(suite.T(), err)
	assert.Equal(suite.T(), "This is my first post!", postResponse.Content)

	// 4. 获取时间线
	req, _ = http.NewRequest("GET", "/api/v1/posts/timeline", nil)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	// 修正：使用正确的响应结构
	var timelineResponse controllers.PostsResponse
	err = json.Unmarshal(w.Body.Bytes(), &timelineResponse)
	assert.NoError(suite.T(), err)
	assert.Len(suite.T(), timelineResponse.Posts, 1)
	assert.Equal(suite.T(), "This is my first post!", timelineResponse.Posts[0].Content)
}

// TestIntegrationTestSuite 运行集成测试套件
func TestIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}
