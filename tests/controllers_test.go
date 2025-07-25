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
	"yolo/utils"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

// ControllersTestSuite 控制器测试套件
type ControllersTestSuite struct {
	suite.Suite
	router *gin.Engine
	db     *gorm.DB
}

// SetupSuite 测试套件初始化
func (suite *ControllersTestSuite) SetupSuite() {
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

// TearDownSuite 测试套件清理
func (suite *ControllersTestSuite) TearDownSuite() {
	sqlDB, _ := suite.db.DB()
	sqlDB.Close()
}

// SetupTest 每个测试前的准备
func (suite *ControllersTestSuite) SetupTest() {
	suite.db.Exec("DELETE FROM users")
	suite.db.Exec("DELETE FROM user_tokens")
	suite.db.Exec("DELETE FROM user_holdings")
}

// ==================== 认证测试 ====================

// TestRegister_Success 测试成功注册
func (suite *ControllersTestSuite) TestRegister_Success() {
	reqBody := controllers.RegisterRequest{
		Username: "testuser",
		Email:    "test@example.com",
		Password: "password123",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var response controllers.AuthResponse
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), response.Token)
	assert.Equal(suite.T(), "testuser", response.User.Username)
	assert.Equal(suite.T(), "test@example.com", response.User.Email)
	assert.Empty(suite.T(), response.User.PasswordHash)
}

// TestRegister_DuplicateUsername 测试重复用户名注册
func (suite *ControllersTestSuite) TestRegister_DuplicateUsername() {
	user := &models.User{
		Username:     "testuser",
		Email:        "existing@example.com",
		PasswordHash: "hashedpassword",
	}
	suite.db.Create(user)

	reqBody := controllers.RegisterRequest{
		Username: "testuser",
		Email:    "new@example.com",
		Password: "password123",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/auth/register", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusConflict, w.Code)

	var response map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &response)
	assert.Equal(suite.T(), "Username already exists", response["error"])
}

// TestLogin_Success 测试成功登录
func (suite *ControllersTestSuite) TestLogin_Success() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	reqBody := controllers.LoginRequest{
		Username: "testuser",
		Password: "password123",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req, _ := http.NewRequest("POST", "/api/v1/auth/login", bytes.NewBuffer(jsonBody))
	req.Header.Set("Content-Type", "application/json")

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response controllers.AuthResponse
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)
	assert.NotEmpty(suite.T(), response.Token)
	assert.Equal(suite.T(), user.ID, response.User.ID)
}

// ==================== 用户测试 ====================

// createAuthenticatedRequest 创建带认证的请求
func (suite *ControllersTestSuite) createAuthenticatedRequest(method, url string, body []byte, userID string) *http.Request {
	req, _ := http.NewRequest(method, url, bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")

	token, _ := utils.GenerateJWT(userID)
	req.Header.Set("Authorization", "Bearer "+token)
	return req
}

// TestGetUserProfile_Success 测试获取用户资料成功
func (suite *ControllersTestSuite) TestGetUserProfile_Success() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	req := suite.createAuthenticatedRequest("GET", "/api/v1/user/profile", nil, user.ID.String())

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	userResp := response["user"].(map[string]interface{})
	assert.Equal(suite.T(), "testuser", userResp["username"])
	assert.Equal(suite.T(), "test@example.com", userResp["email"])
}

// TestUpdateUserProfile_Success 测试更新用户资料成功
func (suite *ControllersTestSuite) TestUpdateUserProfile_Success() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	reqBody := controllers.UpdateProfileRequest{
		Email: "newemail@example.com",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req := suite.createAuthenticatedRequest("PUT", "/api/v1/user/profile", jsonBody, user.ID.String())

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	userResp := response["user"].(map[string]interface{})
	assert.Equal(suite.T(), "newemail@example.com", userResp["email"])
}

// ==================== 代币测试 ====================

// TestCreateToken_Success 测试创建代币成功
func (suite *ControllersTestSuite) TestCreateToken_Success() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	reqBody := controllers.CreateTokenRequest{
		TokenSymbol: "TEST",
		TokenName:   "Test Token",
		TotalSupply: 1000000.0,
		Description: "A test token",
	}

	jsonBody, _ := json.Marshal(reqBody)
	req := suite.createAuthenticatedRequest("POST", "/api/v1/tokens", jsonBody, user.ID.String())

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusCreated, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	token := response["token"].(map[string]interface{})
	assert.Equal(suite.T(), "TEST", token["token_symbol"])
	assert.Equal(suite.T(), "Test Token", token["token_name"])
	assert.Equal(suite.T(), 1000000.0, token["total_supply"])
}

// TestGetAllTokens_Success 测试获取所有代币成功
func (suite *ControllersTestSuite) TestGetAllTokens_Success() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	_, err = services.TokenService.CreateToken(user.ID, "TEST1", "Test Token 1", 1000000.0, "Test token 1")
	suite.Require().NoError(err)
	_, err = services.TokenService.CreateToken(user.ID, "TEST2", "Test Token 2", 2000000.0, "Test token 2")
	suite.Require().NoError(err)

	req, _ := http.NewRequest("GET", "/api/v1/tokens", nil)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	tokens := response["tokens"].([]interface{})
	assert.Len(suite.T(), tokens, 2)
}

// TestGetTokenBySymbol_Success 测试根据符号获取代币成功
func (suite *ControllersTestSuite) TestGetTokenBySymbol_Success() {
	user, err := services.UserService.CreateUser("testuser", "test@example.com", "password123")
	suite.Require().NoError(err)

	createdToken, err := services.TokenService.CreateToken(user.ID, "TEST", "Test Token", 1000000.0, "A test token")
	suite.Require().NoError(err)

	req, _ := http.NewRequest("GET", "/api/v1/tokens/TEST", nil)

	w := httptest.NewRecorder()
	suite.router.ServeHTTP(w, req)

	assert.Equal(suite.T(), http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(suite.T(), err)

	token := response["token"].(map[string]interface{})
	assert.Equal(suite.T(), createdToken.TokenSymbol, token["token_symbol"])
	assert.Equal(suite.T(), createdToken.TokenName, token["token_name"])
}

// TestControllersTestSuite 运行控制器测试套件
func TestControllersTestSuite(t *testing.T) {
	suite.Run(t, new(ControllersTestSuite))
}
