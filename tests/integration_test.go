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

	err = db.AutoMigrate(&models.User{}, &models.UserToken{}, &models.UserHolding{}, &models.PriceHistory{}, &models.GiftRecord{})
	suite.Require().NoError(err)

	services.InitServices()
	suite.router = routes.SetupRoutes()
}

// SetupTest 每个测试前的准备
func (suite *IntegrationTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM users")
	suite.db.Exec("DELETE FROM user_tokens")
	suite.db.Exec("DELETE FROM user_holdings")
}

// TestUserRegistrationAndTokenCreationFlow 测试用户注册和代币创建流程
func (suite *IntegrationTestSuite) TestUserRegistrationAndTokenCreationFlow() {
	// 1. 用户注册
	registerReq := controllers.RegisterRequest{
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

	// 2. 使用token创建代币
	createTokenReq := controllers.CreateTokenRequest{
		TokenSymbol: "MYTOKEN",
		TokenName:   "My Token",
		TotalSupply: 1000000.0,
		Description: "My awesome token",
	}

	jsonBody, _ = json.Marshal(createTokenReq)
	req, _ = http.NewRequest("POST", "/api/v1/tokens", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authResponse.Token)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var tokenResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &tokenResponse)
	assert.NoError(suite.T(), err)

	token := tokenResponse["token"].(map[string]interface{})
	assert.Equal(suite.T(), "MYTOKEN", token["token_symbol"])
	assert.Equal(suite.T(), "My Token", token["token_name"])

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

// TestLoginAndTokenManagementFlow 测试登录和代币管理流程
func (suite *IntegrationTestSuite) TestLoginAndTokenManagementFlow() {
	// 1. 先注册用户
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
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
	assert.Equal(suite.T(), user.ID, authResponse.User.ID)

	// 3. 创建代币
	createTokenReq := controllers.CreateTokenRequest{
		TokenSymbol: "TEST",
		TokenName:   "Test Token",
		TotalSupply: 500000.0,
		Description: "Test description",
	}

	jsonBody, _ = json.Marshal(createTokenReq)
	req, _ = http.NewRequest("POST", "/api/v1/tokens", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authResponse.Token)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	// 4. 获取代币信息
	req, _ = http.NewRequest("GET", "/api/v1/tokens/TEST", nil)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var tokenResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &tokenResponse)
	assert.NoError(suite.T(), err)

	token := tokenResponse["token"].(map[string]interface{})
	assert.Equal(suite.T(), "TEST", token["token_symbol"])
	assert.Equal(suite.T(), "Test Token", token["token_name"])

	// 5. 更新代币信息
	updateTokenReq := controllers.UpdateTokenRequest{
		TokenName:   "Updated Test Token",
		Description: "Updated description",
	}

	jsonBody, _ = json.Marshal(updateTokenReq)
	req, _ = http.NewRequest("PUT", "/api/v1/tokens/TEST", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+authResponse.Token)

	w = httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)
	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var updatedTokenResponse map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &updatedTokenResponse)
	assert.NoError(suite.T(), err)

	updatedToken := updatedTokenResponse["token"].(map[string]interface{})
	assert.Equal(suite.T(), "Updated Test Token", updatedToken["token_name"])
}

// TestIntegrationTestSuite 运行集成测试套件
func TestIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}
