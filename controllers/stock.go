package controllers

import (
	"fmt"
	"net/http"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// StockResponse 股票响应结构
type StockResponse struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Symbol      string  `json:"symbol"`
	Image       *string `json:"img"`
	Status      string  `json:"status"`
	Price       float64 `json:"price"`
	DailyChange float64 `json:"dailyChange"`
	DailyVolume float64 `json:"dailyVolume"`
	MarketCap   float64 `json:"marketCap"`
	Owners      int     `json:"owners"`
	Supply      float64 `json:"supply"`
}

// StockDetailResponse 股票详情响应结构
type StockDetailResponse struct {
	StockResponse
	Description *string                        `json:"description"`
	ChartData   map[string][]ChartDataResponse `json:"chartData"`
}

// ChartDataResponse K线图数据响应
type ChartDataResponse struct {
	Time  int64   `json:"time"`
	Value float64 `json:"value"`
}

// TradeRequest 交易请求结构
type TradeRequest struct {
	UserID int     `json:"userId" binding:"required"`
	Type   string  `json:"type" binding:"required,oneof=buy sell"`
	Amount float64 `json:"amount" binding:"required,gt=0"`
}

// TradeResponse 交易响应结构
type TradeResponse struct {
	Success       bool   `json:"success"`
	TransactionID string `json:"transactionId"`
	Message       string `json:"message"`
}

// GetStocks 获取项目列表 (GET /stocks)
func GetStocks(c *gin.Context) {
	// 获取查询参数
	category := c.Query("category")
	sortBy := c.Query("sortBy")
	order := c.Query("order")

	stocks, err := services.StockService.GetAllStocks(category, sortBy, order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get stocks",
			"details": err.Error(),
		})
		return
	}

	// 转换为响应格式
	var stockResponses []StockResponse
	for _, stock := range stocks {
		stockResponses = append(stockResponses, StockResponse{
			ID:          stock.ID.String(),
			Name:        stock.Name,
			Symbol:      stock.Symbol,
			Image:       stock.Image,
			Status:      stock.Status,
			Price:       stock.Price,
			DailyChange: stock.DailyChange,
			DailyVolume: stock.DailyVolume,
			MarketCap:   stock.MarketCap,
			Owners:      stock.Owners,
			Supply:      stock.Supply,
		})
	}

	c.JSON(http.StatusOK, stockResponses)
}

// GetStockByID 获取单个项目详情 (GET /stocks/{stockId})
func GetStockByID(c *gin.Context) {
	stockIDStr := c.Param("stockId")
	stockID, err := uuid.Parse(stockIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid stock ID",
		})
		return
	}

	stock, err := services.StockService.GetStockByID(stockID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Stock not found",
		})
		return
	}

	// 获取K线图数据
	chartData := make(map[string][]ChartDataResponse)
	timeframes := []string{"day", "week", "month", "year"}

	for _, timeframe := range timeframes {
		data, err := services.ChartDataService.GetStockChartData(stockID, timeframe, 100)
		if err == nil {
			var chartResponses []ChartDataResponse
			for _, item := range data {
				chartResponses = append(chartResponses, ChartDataResponse{
					Time:  item.Time,
					Value: item.Value,
				})
			}
			chartData[timeframe] = chartResponses
		} else {
			chartData[timeframe] = []ChartDataResponse{}
		}
	}

	// 构建响应
	response := StockDetailResponse{
		StockResponse: StockResponse{
			ID:          stock.ID.String(),
			Name:        stock.Name,
			Symbol:      stock.Symbol,
			Image:       stock.Image,
			Status:      stock.Status,
			Price:       stock.Price,
			DailyChange: stock.DailyChange,
			DailyVolume: stock.DailyVolume,
			MarketCap:   stock.MarketCap,
			Owners:      stock.Owners,
			Supply:      stock.Supply,
		},
		Description: stock.Description,
		ChartData:   chartData,
	}

	c.JSON(http.StatusOK, response)
}

// TradeStock 交易操作 (POST /stocks/{stockId}/trade)
func TradeStock(c *gin.Context) {
	stockIDStr := c.Param("stockId")
	stockID, err := uuid.Parse(stockIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid stock ID",
		})
		return
	}

	var req TradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 从JWT获取实际用户ID（忽略请求中的userID）
	userID := utils.GetUserIDFromContext(c)

	// 执行交易
	trade, err := services.TradeService.ExecuteTrade(stockID, userID, req.Type, req.Amount)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Trade failed",
			"details": err.Error(),
		})
		return
	}

	// 获取股票信息用于响应消息
	stock, _ := services.StockService.GetStockByID(stockID)
	var message string
	if req.Type == "buy" {
		message = fmt.Sprintf("Successfully purchased %.2f units of %s.", req.Amount, stock.Name)
	} else {
		message = fmt.Sprintf("Successfully sold %.2f units of %s.", req.Amount, stock.Name)
	}

	response := TradeResponse{
		Success:       true,
		TransactionID: trade.TransactionID,
		Message:       message,
	}

	c.JSON(http.StatusOK, response)
}

// GetStockDetail 根据股票符号获取股票详情 (GET /stocks/:symbol)
func GetStockDetail(c *gin.Context) {
	symbol := c.Param("symbol")
	if symbol == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Stock symbol is required",
		})
		return
	}

	stock, err := services.StockService.GetStockBySymbol(symbol)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Stock not found",
		})
		return
	}

	// 获取K线图数据
	chartData := make(map[string][]ChartDataResponse)
	timeframes := []string{"day", "week", "month", "year"}

	for _, timeframe := range timeframes {
		data, err := services.ChartDataService.GetStockChartData(stock.ID, timeframe, 100)
		if err == nil {
			var chartResponses []ChartDataResponse
			for _, item := range data {
				chartResponses = append(chartResponses, ChartDataResponse{
					Time:  item.Time,
					Value: item.Value,
				})
			}
			chartData[timeframe] = chartResponses
		} else {
			chartData[timeframe] = []ChartDataResponse{}
		}
	}

	// 构建响应
	response := StockDetailResponse{
		StockResponse: StockResponse{
			ID:          stock.ID.String(),
			Name:        stock.Name,
			Image:       stock.Image,
			Status:      stock.Status,
			Price:       stock.Price,
			DailyChange: stock.DailyChange,
			DailyVolume: stock.DailyVolume,
			MarketCap:   stock.MarketCap,
			Owners:      stock.Owners,
			Supply:      stock.Supply,
		},
		Description: stock.Description,
		ChartData:   chartData,
	}

	c.JSON(http.StatusOK, response)
}
