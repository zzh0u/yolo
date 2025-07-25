package controllers

import (
	"math/big"
	"net/http"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
)

// DeployTokenRequest 部署代币请求
type DeployTokenRequest struct {
	Name       string `json:"name" binding:"required,min=1,max=100"`
	Symbol     string `json:"symbol" binding:"required,min=1,max=10"`
	Receiver   string `json:"receiver" binding:"required"`
	InitialEth string `json:"initial_eth"`
}

// SwapTokenRequest 交换代币请求
type SwapTokenRequest struct {
	TokenAAddress string `json:"token_a_address" binding:"required"`
	TokenBAddress string `json:"token_b_address" binding:"required"`
	AmountA       string `json:"amount_a" binding:"required"`
}

// AddLiquidityRequest 添加流动性请求
type AddLiquidityRequest struct {
	TokenAAddress string `json:"token_a_address" binding:"required"`
	TokenBAddress string `json:"token_b_address" binding:"required"`
	AmountA       string `json:"amount_a" binding:"required"`
	AmountB       string `json:"amount_b" binding:"required"`
}

// GetBalanceRequest 获取余额请求
type GetBalanceRequest struct {
	ContractAddress string `json:"contract_address" binding:"required"`
	UserAddress     string `json:"user_address" binding:"required"`
}

// TransferTokenRequest 转移代币请求
type TransferTokenRequest struct {
	ContractAddress string `json:"contract_address" binding:"required"`
	ToAddress       string `json:"to_address" binding:"required"`
	Amount          string `json:"amount" binding:"required"`
}

// DeployToken 部署新的代币合约
func DeployToken(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req DeployTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 调用合约服务部署代币
	deployReq := services.DeployStockRequest{
		Name:       req.Name,
		Symbol:     req.Symbol,
		Receiver:   req.Receiver,
		InitialEth: req.InitialEth,
	}

	result, err := services.ContractServiceInstance.DeployStock(userID, deployReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to deploy token",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Token deployed successfully",
		"data":    result,
	})
}

// SwapTokens 执行代币交换
func SwapTokens(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req SwapTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 调用合约服务执行交换
	swapReq := services.SwapRequest{
		TokenAAddress: req.TokenAAddress,
		TokenBAddress: req.TokenBAddress,
		AmountA:       req.AmountA,
	}

	result, err := services.ContractServiceInstance.SwapTokens(userID, swapReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to swap tokens",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tokens swapped successfully",
		"data":    result,
	})
}

// GetTokenPrice 获取代币价格
func GetTokenPrice(c *gin.Context) {
	tokenAAddress := c.Query("token_a")
	tokenBAddress := c.Query("token_b")

	if tokenAAddress == "" || tokenBAddress == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "token_a and token_b parameters are required",
		})
		return
	}

	price, err := services.ContractServiceInstance.GetTokenPrice(tokenAAddress, tokenBAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get token price",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token_a": tokenAAddress,
		"token_b": tokenBAddress,
		"price":   price.String(),
	})
}

// AddLiquidity 添加流动性
func AddLiquidity(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req AddLiquidityRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 解析数量
	amountA, ok := new(big.Int).SetString(req.AmountA, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid amount_a",
		})
		return
	}

	amountB, ok := new(big.Int).SetString(req.AmountB, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid amount_b",
		})
		return
	}

	// 调用合约服务添加流动性
	tx, err := services.ContractServiceInstance.AddLiquidity(userID, req.TokenAAddress, req.TokenBAddress, amountA, amountB)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to add liquidity",
			"details": err.Error(),
		})
		return
	}

	var txHash string
	if tx != nil {
		txHash = tx.Hash().Hex()
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Liquidity added successfully",
		"transaction_hash": txHash,
	})
}

// GetBalance 获取代币余额
func GetBalance(c *gin.Context) {
	var req GetBalanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	balance, err := services.ContractServiceInstance.GetContractBalance(req.ContractAddress, req.UserAddress)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get balance",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"contract_address": req.ContractAddress,
		"user_address":     req.UserAddress,
		"balance":          balance.String(),
	})
}

// TransferTokens 转移代币
func TransferTokens(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req TransferTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 解析数量
	amount, ok := new(big.Int).SetString(req.Amount, 10)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid amount",
		})
		return
	}

	// 调用合约服务转移代币
	tx, err := services.ContractServiceInstance.TransferTokens(userID, req.ContractAddress, req.ToAddress, amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to transfer tokens",
			"details": err.Error(),
		})
		return
	}

	var txHash string
	if tx != nil {
		txHash = tx.Hash().Hex()
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Tokens transferred successfully",
		"transaction_hash": txHash,
	})
}
