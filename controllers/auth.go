package controllers

import (
	"net/http"
	"yolo/models"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
)

// RegisterRequest 注册请求结构
type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=1,max=100"`
	Username string `json:"username" binding:"required,min=3,max=50"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginRequest 登录请求结构
type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// GoogleAuthRequest Google登录请求结构
type GoogleAuthRequest struct {
	Name     string `json:"name" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	GoogleID string `json:"google_id" binding:"required"`
	Avatar   string `json:"avatar"`
}

// AuthResponse 认证响应结构
type AuthResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// UserResponse 用户响应结构（用于/auth/me接口）
type UserResponse struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Avatar         *string `json:"avatar"`
	Email          string  `json:"email"`
	YoloStockValue float64 `json:"yoloStockValue,omitempty"`
}

// Register 用户注册
func Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 检查用户名是否已存在
	if services.UserService.IsUsernameExists(req.Username) {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Username already exists",
		})
		return
	}

	// 检查邮箱是否已存在
	if services.UserService.IsEmailExists(req.Email) {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Email already exists",
		})
		return
	}

	// 创建用户
	user, err := services.UserService.CreateUser(req.Name, req.Username, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create user",
			"details": err.Error(),
		})
		return
	}

	// 生成JWT token
	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	// 隐藏密码
	user.PasswordHash = ""

	c.JSON(http.StatusCreated, AuthResponse{
		Token: token,
		User:  *user,
	})
}

// Login 用户登录
func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 验证用户凭据
	user, err := services.UserService.ValidateUser(req.Username, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Invalid username or password",
		})
		return
	}

	// 生成JWT token
	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	// 隐藏密码
	user.PasswordHash = ""

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  *user,
	})
}

// GoogleAuth Google登录
func GoogleAuth(c *gin.Context) {
	var req GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 检查用户是否已存在
	user, err := services.UserService.GetUserByEmail(req.Email)
	if err != nil {
		// 用户不存在，创建新用户
		user, err = services.UserService.CreateGoogleUser(req.Name, req.Email, req.GoogleID, req.Avatar)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error":   "Failed to create user",
				"details": err.Error(),
			})
			return
		}
	}

	// 生成JWT token
	token, err := utils.GenerateJWT(user.ID.String())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to generate token",
		})
		return
	}

	// 隐藏密码
	user.PasswordHash = ""

	c.JSON(http.StatusOK, AuthResponse{
		Token: token,
		User:  *user,
	})
}

// GetCurrentUser 获取当前用户信息 (/auth/me)
func GetCurrentUser(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	user, err := services.UserService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// 返回符合API文档格式的用户信息
	response := UserResponse{
		ID:     user.ID.String(),
		Name:   user.Name,
		Avatar: user.Avatar,
		Email:  user.Email,
	}

	c.JSON(http.StatusOK, response)
}
