package services

import (
	"fmt"
	"log"
	"time"
	"yolo/database"
	"yolo/models"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

// 全局服务实例
var (
	UserService      *userService
	PostService      *postService
	StockService     *stockService
	HoldingService   *holdingService
	ChartDataService *chartDataService
	TradeService     *tradeService
	GiftService      *giftService
)

// InitServices 初始化所有服务
func InitServices() {
	UserService = &userService{}
	PostService = &postService{}
	StockService = &stockService{}
	HoldingService = &holdingService{}
	ChartDataService = &chartDataService{}
	TradeService = &tradeService{}
	GiftService = &giftService{}

	log.Println("All services initialized successfully")
}

// ==================== User Service ====================

type userService struct{}

// IsUsernameExists 检查用户名是否存在
func (s *userService) IsUsernameExists(username string) bool {
	var count int64
	database.DB.Model(&models.User{}).Where("username = ?", username).Count(&count)
	return count > 0
}

// IsEmailExists 检查邮箱是否存在
func (s *userService) IsEmailExists(email string) bool {
	var count int64
	database.DB.Model(&models.User{}).Where("email = ?", email).Count(&count)
	return count > 0
}

// CreateUser 创建普通用户
func (s *userService) CreateUser(name, username, email, password string) (*models.User, error) {
	// 加密密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	user := &models.User{
		Name:           name,
		Username:       username,
		Email:          email,
		PasswordHash:   string(hashedPassword),
		YoloStockValue: 0.00,
		Balance:        8000.00, // 默认赠送8000 token
		IsListed:       false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := database.DB.Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	return user, nil
}

// CreateGoogleUser 创建Google用户
func (s *userService) CreateGoogleUser(name, email, googleID, avatar string) (*models.User, error) {
	user := &models.User{
		Name:           name,
		Username:       email, // 使用邮箱作为用户名
		Email:          email,
		GoogleID:       &googleID,
		Avatar:         &avatar,
		YoloStockValue: 0.00,
		Balance:        8000.00,
		IsListed:       false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := database.DB.Create(user).Error; err != nil {
		return nil, fmt.Errorf("failed to create google user: %w", err)
	}

	return user, nil
}

// ValidateUser 验证用户凭据
func (s *userService) ValidateUser(username, password string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}

	// 检查密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, fmt.Errorf("invalid password")
	}

	return &user, nil
}

// GetUserByID 根据ID获取用户
func (s *userService) GetUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

// GetUserByEmail 根据邮箱获取用户
func (s *userService) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

// GetUserByUsername 根据用户名获取用户信息
func (s *userService) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	err := database.DB.Where("username = ?", username).First(&user).Error
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}
	return &user, nil
}

// UpdateUserProfile 更新用户资料
func (s *userService) UpdateUserProfile(userID uuid.UUID, name, email string) (*models.User, error) {
	var user models.User
	if err := database.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if name != "" {
		user.Name = name
	}
	if email != "" {
		user.Email = email
	}
	user.UpdatedAt = time.Now()

	if err := database.DB.Save(&user).Error; err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	return &user, nil
}

// ListUser 上市用户
func (s *userService) ListUser(userID uuid.UUID) error {
	return database.DB.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"is_listed":  true,
		"updated_at": time.Now(),
	}).Error
}

// ==================== Post Service ====================

type postService struct{}

// CreatePost 创建新帖子
func (s *postService) CreatePost(userID uuid.UUID, content string) (*models.Post, error) {
	post := &models.Post{
		UserID:    userID,
		Content:   content,
		Timestamp: time.Now(),
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.DB.Create(post).Error; err != nil {
		return nil, fmt.Errorf("failed to create post: %w", err)
	}

	// 预加载用户信息
	if err := database.DB.Preload("User").First(post, post.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load post with user: %w", err)
	}

	return post, nil
}

// GetTimeline 获取时间线帖子
func (s *postService) GetTimeline(page, limit int) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	// 计算总数
	database.DB.Model(&models.Post{}).Count(&total)

	// 分页查询，按时间倒序
	offset := (page - 1) * limit
	if err := database.DB.Preload("User").
		Order("timestamp DESC").
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get timeline: %w", err)
	}

	return posts, total, nil
}

// GetUserPosts 获取用户发布的帖子
func (s *postService) GetUserPosts(userID uuid.UUID, page, limit int) ([]models.Post, int64, error) {
	var posts []models.Post
	var total int64

	// 计算总数
	database.DB.Model(&models.Post{}).Where("user_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("User").
		Where("user_id = ?", userID).
		Order("timestamp DESC").
		Offset(offset).
		Limit(limit).
		Find(&posts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get user posts: %w", err)
	}

	return posts, total, nil
}

// ==================== Stock Service ====================

type stockService struct{}

// IsStockSymbolExists 检查股票符号是否存在
func (s *stockService) IsStockSymbolExists(symbol string) bool {
	var count int64
	database.DB.Model(&models.Stock{}).Where("symbol = ?", symbol).Count(&count)
	return count > 0
}

// IsSymbolExists 检查股票符号是否存在（别名函数，用于测试兼容性）
func (s *stockService) IsSymbolExists(symbol string) bool {
	return s.IsStockSymbolExists(symbol)
}

// CreateStock 创建股票
func (s *stockService) CreateStock(userID uuid.UUID, symbol, name string, supply float64, description string) (*models.Stock, error) {
	var descPtr *string
	if description != "" {
		descPtr = &description
	}

	stock := &models.Stock{
		UserID:      userID,
		Name:        name,
		Symbol:      symbol,
		Status:      "demo",
		Price:       1.00, // 默认价格
		DailyChange: 0.00,
		DailyVolume: 0.00,
		MarketCap:   supply, // 初始市值等于供应量
		Owners:      0,
		Supply:      supply,
		Description: descPtr,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := database.DB.Create(stock).Error; err != nil {
		return nil, fmt.Errorf("failed to create stock: %w", err)
	}

	// 预加载用户信息
	if err := database.DB.Preload("User").First(stock, stock.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load stock with user: %w", err)
	}

	return stock, nil
}

// GetAllStocks 获取所有股票列表
func (s *stockService) GetAllStocks(category, sortBy, order string) ([]models.Stock, error) {
	var stocks []models.Stock
	query := database.DB.Preload("User")

	// 添加排序
	if sortBy != "" {
		orderClause := sortBy
		if order == "desc" {
			orderClause += " DESC"
		} else {
			orderClause += " ASC"
		}
		query = query.Order(orderClause)
	} else {
		query = query.Order("market_cap DESC") // 默认按市值降序
	}

	if err := query.Find(&stocks).Error; err != nil {
		return nil, fmt.Errorf("failed to get stocks: %w", err)
	}

	return stocks, nil
}

// GetStockByID 根据ID获取股票详情
func (s *stockService) GetStockByID(stockID uuid.UUID) (*models.Stock, error) {
	var stock models.Stock
	if err := database.DB.Preload("User").Where("id = ?", stockID).First(&stock).Error; err != nil {
		return nil, fmt.Errorf("stock not found: %w", err)
	}
	return &stock, nil
}

// GetStockBySymbol 根据符号获取股票
func (s *stockService) GetStockBySymbol(symbol string) (*models.Stock, error) {
	var stock models.Stock
	if err := database.DB.Preload("User").Where("symbol = ?", symbol).First(&stock).Error; err != nil {
		return nil, fmt.Errorf("stock not found: %w", err)
	}
	return &stock, nil
}

// UpdateStock 更新股票信息
func (s *stockService) UpdateStock(stockID uuid.UUID, name, description string, price float64) (*models.Stock, error) {
	var stock models.Stock
	if err := database.DB.Where("id = ?", stockID).First(&stock).Error; err != nil {
		return nil, fmt.Errorf("stock not found: %w", err)
	}

	if name != "" {
		stock.Name = name
	}
	if description != "" {
		stock.Description = &description
	}
	if price > 0 {
		stock.Price = price
		stock.MarketCap = price * stock.Supply // 更新市值
	}
	stock.UpdatedAt = time.Now()

	if err := database.DB.Save(&stock).Error; err != nil {
		return nil, fmt.Errorf("failed to update stock: %w", err)
	}

	return &stock, nil
}

// ==================== Holding Service ====================

type holdingService struct{}

// GetUserHoldings 获取用户持仓
func (s *holdingService) GetUserHoldings(userID uuid.UUID) ([]models.UserHolding, error) {
	var holdings []models.UserHolding
	if err := database.DB.Preload("Stock").Preload("User").Where("user_id = ?", userID).Find(&holdings).Error; err != nil {
		return nil, fmt.Errorf("failed to get holdings: %w", err)
	}
	return holdings, nil
}

// CreateOrUpdateHolding 创建或更新持仓
func (s *holdingService) CreateOrUpdateHolding(userID, stockID uuid.UUID, quantity float64) error {
	var holding models.UserHolding

	// 查找现有持仓
	err := database.DB.Where("user_id = ? AND stock_id = ?", userID, stockID).First(&holding).Error
	if err != nil {
		// 创建新持仓
		holding = models.UserHolding{
			UserID:    userID,
			StockID:   stockID,
			Quantity:  quantity,
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		}
		return database.DB.Create(&holding).Error
	} else {
		// 更新现有持仓
		holding.Quantity += quantity
		holding.UpdatedAt = time.Now()
		return database.DB.Save(&holding).Error
	}
}

// ==================== Chart Data Service ====================

type chartDataService struct{}

// GetStockChartData 获取股票K线图数据
func (s *chartDataService) GetStockChartData(stockID uuid.UUID, timeframe string, limit int) ([]models.ChartData, error) {
	var chartData []models.ChartData
	if err := database.DB.Where("stock_id = ? AND timeframe = ?", stockID, timeframe).
		Order("time DESC").
		Limit(limit).
		Find(&chartData).Error; err != nil {
		return nil, fmt.Errorf("failed to get chart data: %w", err)
	}
	return chartData, nil
}

// CreateChartData 创建K线图数据
func (s *chartDataService) CreateChartData(stockID uuid.UUID, timeframe string, time int64, value, open, high, low, close, volume float64) (*models.ChartData, error) {
	chartData := &models.ChartData{
		StockID:    stockID,
		Timeframe:  timeframe,
		Time:       time,
		Value:      value,
		OpenPrice:  open,
		HighPrice:  high,
		LowPrice:   low,
		ClosePrice: close,
		Volume:     volume,
		TradeCount: 1,
	}

	if err := database.DB.Create(chartData).Error; err != nil {
		return nil, fmt.Errorf("failed to create chart data: %w", err)
	}

	return chartData, nil
}

// ==================== Trade Service ====================

type tradeService struct{}

// CreateTrade 创建交易记录
func (s *tradeService) CreateTrade(stockID, buyerID uuid.UUID, sellerID *uuid.UUID, tradeType string, amount, price float64) (*models.Trade, error) {
	totalValue := amount * price
	transactionID := fmt.Sprintf("txn-%d-%s", time.Now().Unix(), uuid.New().String()[:8])

	trade := &models.Trade{
		StockID:       stockID,
		BuyerID:       buyerID,
		SellerID:      sellerID,
		Type:          tradeType,
		Amount:        amount,
		Price:         price,
		TotalValue:    totalValue,
		TransactionID: transactionID,
		Status:        "completed",
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(trade).Error; err != nil {
		return nil, fmt.Errorf("failed to create trade: %w", err)
	}

	return trade, nil
}

// GetUserTrades 获取用户交易记录
func (s *tradeService) GetUserTrades(userID uuid.UUID, page, limit int) ([]models.Trade, int64, error) {
	var trades []models.Trade
	var total int64

	// 计算总数（买入和卖出）
	database.DB.Model(&models.Trade{}).Where("buyer_id = ? OR seller_id = ?", userID, userID).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("Stock").Preload("Buyer").Preload("Seller").
		Where("buyer_id = ? OR seller_id = ?", userID, userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&trades).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get user trades: %w", err)
	}

	return trades, total, nil
}

// ExecuteTrade 执行交易
func (s *tradeService) ExecuteTrade(stockID, userID uuid.UUID, tradeType string, amount float64) (*models.Trade, error) {
	// 获取股票信息
	stock, err := StockService.GetStockByID(stockID)
	if err != nil {
		return nil, err
	}

	// 获取用户信息
	user, err := UserService.GetUserByID(userID)
	if err != nil {
		return nil, err
	}

	totalValue := amount * stock.Price

	if tradeType == "buy" {
		// 检查用户余额
		if user.Balance < totalValue {
			return nil, fmt.Errorf("insufficient balance")
		}

		// 扣除用户余额
		user.Balance -= totalValue
		if err := database.DB.Save(user).Error; err != nil {
			return nil, fmt.Errorf("failed to update user balance: %w", err)
		}

		// 更新持仓
		if err := HoldingService.CreateOrUpdateHolding(userID, stockID, amount); err != nil {
			return nil, fmt.Errorf("failed to update holding: %w", err)
		}

		// 创建交易记录
		return s.CreateTrade(stockID, userID, nil, tradeType, amount, stock.Price)
	} else if tradeType == "sell" {
		// 检查持仓
		holdings, err := HoldingService.GetUserHoldings(userID)
		if err != nil {
			return nil, err
		}

		var userHolding *models.UserHolding
		for _, holding := range holdings {
			if holding.StockID == stockID {
				userHolding = &holding
				break
			}
		}

		if userHolding == nil || userHolding.Quantity < amount {
			return nil, fmt.Errorf("insufficient holdings")
		}

		// 增加用户余额
		user.Balance += totalValue
		if err := database.DB.Save(user).Error; err != nil {
			return nil, fmt.Errorf("failed to update user balance: %w", err)
		}

		// 更新持仓
		if err := HoldingService.CreateOrUpdateHolding(userID, stockID, -amount); err != nil {
			return nil, fmt.Errorf("failed to update holding: %w", err)
		}

		// 创建交易记录
		return s.CreateTrade(stockID, userID, &userID, tradeType, amount, stock.Price)
	}

	return nil, fmt.Errorf("invalid trade type")
}

// ==================== Gift Service ====================

type giftService struct{}

// SendGift 发送赠送
func (s *giftService) SendGift(senderID, recipientID, stockID uuid.UUID, quantity float64, message string) (*models.GiftRecord, error) {
	// 检查发送者是否有足够的持仓
	holdings, err := HoldingService.GetUserHoldings(senderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get sender holdings: %w", err)
	}

	var senderHolding *models.UserHolding
	for _, holding := range holdings {
		if holding.StockID == stockID {
			senderHolding = &holding
			break
		}
	}

	if senderHolding == nil || senderHolding.Quantity < quantity {
		return nil, fmt.Errorf("insufficient holdings to send gift")
	}

	// 检查接收者是否存在
	_, err = UserService.GetUserByID(recipientID)
	if err != nil {
		return nil, fmt.Errorf("recipient not found: %w", err)
	}

	// 检查股票是否存在
	_, err = StockService.GetStockByID(stockID)
	if err != nil {
		return nil, fmt.Errorf("stock not found: %w", err)
	}

	// 开始事务
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// 减少发送者持仓
	if err := HoldingService.CreateOrUpdateHolding(senderID, stockID, -quantity); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update sender holding: %w", err)
	}

	// 增加接收者持仓
	if err := HoldingService.CreateOrUpdateHolding(recipientID, stockID, quantity); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to update recipient holding: %w", err)
	}

	// 创建赠送记录
	var messagePtr *string
	if message != "" {
		messagePtr = &message
	}

	giftRecord := &models.GiftRecord{
		SenderID:    senderID,
		RecipientID: recipientID,
		StockID:     stockID,
		Quantity:    quantity,
		Message:     messagePtr,
		CreatedAt:   time.Now(),
	}

	if err := tx.Create(giftRecord).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create gift record: %w", err)
	}

	// 提交事务
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// 预加载关联数据
	if err := database.DB.Preload("Sender").Preload("Recipient").Preload("Stock").First(giftRecord, giftRecord.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load gift record with relations: %w", err)
	}

	return giftRecord, nil
}

// GetReceivedGifts 获取收到的赠送
func (s *giftService) GetReceivedGifts(userID uuid.UUID, page, limit int) ([]models.GiftRecord, int64, error) {
	var gifts []models.GiftRecord
	var total int64

	// 计算总数
	database.DB.Model(&models.GiftRecord{}).Where("recipient_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("Sender").Preload("Recipient").Preload("Stock").
		Where("recipient_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&gifts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get received gifts: %w", err)
	}

	return gifts, total, nil
}

// GetSentGifts 获取发送的赠送
func (s *giftService) GetSentGifts(userID uuid.UUID, page, limit int) ([]models.GiftRecord, int64, error) {
	var gifts []models.GiftRecord
	var total int64

	// 计算总数
	database.DB.Model(&models.GiftRecord{}).Where("sender_id = ?", userID).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("Sender").Preload("Recipient").Preload("Stock").
		Where("sender_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&gifts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get sent gifts: %w", err)
	}

	return gifts, total, nil
}

// GetGiftHistory 获取用户的完整赠送历史（发送和接收）
func (s *giftService) GetGiftHistory(userID uuid.UUID, page, limit int) ([]models.GiftRecord, int64, error) {
	var gifts []models.GiftRecord
	var total int64

	// 计算总数
	database.DB.Model(&models.GiftRecord{}).Where("sender_id = ? OR recipient_id = ?", userID, userID).Count(&total)

	// 分页查询
	offset := (page - 1) * limit
	if err := database.DB.Preload("Sender").Preload("Recipient").Preload("Stock").
		Where("sender_id = ? OR recipient_id = ?", userID, userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(limit).
		Find(&gifts).Error; err != nil {
		return nil, 0, fmt.Errorf("failed to get gift history: %w", err)
	}

	return gifts, total, nil
}

// CreateHolding 创建持仓（用于测试兼容性）
func (s *holdingService) CreateHolding(userID, stockID uuid.UUID, quantity, averagePrice float64) (*models.UserHolding, error) {
	holding := &models.UserHolding{
		UserID:    userID,
		StockID:   stockID,
		Quantity:  quantity,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := database.DB.Create(holding).Error; err != nil {
		return nil, fmt.Errorf("failed to create holding: %w", err)
	}

	// 预加载关联数据
	if err := database.DB.Preload("User").Preload("Stock").First(holding, holding.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load holding with relations: %w", err)
	}

	return holding, nil
}
