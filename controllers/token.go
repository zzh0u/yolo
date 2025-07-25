package controllers

import (
	"net/http"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
)

// CreateTokenRequest 创建代币请求
type CreateTokenRequest struct {
	TokenSymbol string  `json:"token_symbol" binding:"required,min=1,max=10"`
	TokenName   string  `json:"token_name" binding:"required,min=1,max=100"`
	TotalSupply float64 `json:"total_supply" binding:"required,gt=0"`
	Description string  `json:"description"`
}

// UpdateTokenRequest 更新代币请求
type UpdateTokenRequest struct {
	TokenName   string `json:"token_name" binding:"omitempty,min=1,max=100"`
	Description string `json:"description"`
}

// CreateToken 创建用户代币
func CreateToken(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req CreateTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 检查代币符号是否已存在
	if services.TokenService.IsTokenSymbolExists(req.TokenSymbol) {
		c.JSON(http.StatusConflict, gin.H{
			"error": "Token symbol already exists",
		})
		return
	}

	// 创建代币
	token, err := services.TokenService.CreateToken(userID, req.TokenSymbol, req.TokenName, req.TotalSupply, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
	})
}

// GetAllTokens 获取所有代币列表
func GetAllTokens(c *gin.Context) {
	page := utils.GetPageFromQuery(c)
	limit := utils.GetLimitFromQuery(c)

	tokens, total, err := services.TokenService.GetAllTokens(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get tokens",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tokens": tokens,
		"pagination": gin.H{
			"page":  page,
			"limit": limit,
			"total": total,
		},
	})
}

// GetTokenBySymbol 根据符号获取代币信息
func GetTokenBySymbol(c *gin.Context) {
	symbol := c.Param("symbol")

	token, err := services.TokenService.GetTokenBySymbol(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Token not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
	})
}

// UpdateToken 更新代币信息
func UpdateToken(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	symbol := c.Param("symbol")

	var req UpdateTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 检查代币是否属于当前用户
	token, err := services.TokenService.GetTokenBySymbol(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Token not found",
		})
		return
	}

	if token.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You don't have permission to update this token",
		})
		return
	}

	// 更新代币
	updatedToken, err := services.TokenService.UpdateToken(symbol, req.TokenName, req.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to update token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": updatedToken,
	})
}

// ListToken 用户选择上市自己的token
func ListToken(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)
	symbol := c.Param("symbol")

	// 检查token是否属于当前用户
	token, err := services.TokenService.GetTokenBySymbol(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Token not found",
		})
		return
	}

	if token.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{
			"error": "You don't have permission to list this token",
		})
		return
	}

	// 上市用户（设置is_listed为true）
	err = services.UserService.ListUser(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to list user token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Your token has been listed successfully and is now available for trading",
		"token":   token,
	})
}

// GetTokenPriceHistory 获取代币价格历史
func GetTokenPriceHistory(c *gin.Context) {
	symbol := c.Param("symbol")
	timeframe := c.DefaultQuery("timeframe", "1h")
	limit := utils.GetLimitFromQuery(c)

	// 获取代币信息
	token, err := services.TokenService.GetTokenBySymbol(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Token not found",
		})
		return
	}

	// 获取价格历史
	priceHistory, err := services.PriceHistoryService.GetTokenPriceHistory(token.ID, timeframe, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get price history",
			"details": err.Error(),
		})
		return
	}

	// 转换为K线数据格式
	klineData := utils.ConvertToKlineData(priceHistory)

	c.JSON(http.StatusOK, gin.H{
		"symbol":    symbol,
		"timeframe": timeframe,
		"data":      klineData,
	})
}
