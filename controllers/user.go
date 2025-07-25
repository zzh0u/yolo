package controllers

import (
	"net/http"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
)

// UpdateProfileRequest 更新用户资料请求
type UpdateProfileRequest struct {
	Email string `json:"email" binding:"omitempty,email"`
}

// GetUserProfile 获取用户资料
func GetUserProfile(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	user, err := services.UserService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// 隐藏敏感信息
	user.PasswordHash = ""

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

// UpdateUserProfile 更新用户资料
func UpdateUserProfile(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	user, err := services.UserService.UpdateUserProfile(userID, req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update profile",
			"details": err.Error(),
		})
		return
	}

	// 隐藏敏感信息
	user.PasswordHash = ""

	c.JSON(http.StatusOK, gin.H{
		"user": user,
	})
}

// GetUserBalance 获取用户token余额
func GetUserBalance(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	user, err := services.UserService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"balance":     user.Balance,
		"token_type":  "YOLO", // 平台基础token
		"description": "Platform base tokens for trading",
	})
}

// GetUserHoldings 获取用户持仓
func GetUserHoldings(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	holdings, err := services.HoldingService.GetUserHoldings(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get holdings",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"holdings": holdings,
	})
}

// SendGift 发送赠送（TODO: 可延后开发）
func SendGift(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Gift functionality not implemented yet",
	})
}

// GetReceivedGifts 获取收到的赠送（TODO: 可延后开发）
func GetReceivedGifts(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Gift functionality not implemented yet",
	})
}

// GetSentGifts 获取发送的赠送（TODO: 可延后开发）
func GetSentGifts(c *gin.Context) {
	c.JSON(http.StatusNotImplemented, gin.H{
		"error": "Gift functionality not implemented yet",
	})
}

// GetUserTrades 获取用户交易记录
func GetUserTrades(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// 获取查询参数
	page := utils.GetPageFromQuery(c)
	limit := utils.GetLimitFromQuery(c)

	trades, total, err := services.TradeService.GetUserTrades(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get trades",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"trades": trades,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}
