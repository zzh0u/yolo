package controllers

import (
	"net/http"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// UpdateProfileRequest 更新用户资料请求
type UpdateProfileRequest struct {
	Name  string `json:"name" binding:"omitempty,min=1,max=100"`
	Email string `json:"email" binding:"omitempty,email"`
}

// UserPublicInfo 用户公开信息响应
type UserPublicInfo struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Avatar         *string `json:"avatar"`
	YoloStockValue float64 `json:"yoloStockValue"`
}

// PostResponse 帖子响应结构
type PostResponse struct {
	ID        string         `json:"id"`
	User      UserPublicInfo `json:"user"`
	Content   string         `json:"content"`
	Timestamp string         `json:"timestamp"`
}

// PostsResponse 帖子列表响应
type PostsResponse struct {
	Posts    []PostResponse `json:"posts"`
	PageInfo PageInfo       `json:"pageInfo"`
}

// PageInfo 分页信息
type PageInfo struct {
	CurrentPage int   `json:"currentPage"`
	TotalPages  int   `json:"totalPages"`
	TotalPosts  int64 `json:"totalPosts"`
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

// GetUserByID 获取特定用户的公开信息 (/users/{userId})
func GetUserByID(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	user, err := services.UserService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// 返回公开信息
	response := UserPublicInfo{
		ID:     user.ID.String(),
		Name:   user.Name,
		Avatar: user.Avatar,
		// YoloStockValue: user.YoloStockValue,
	}

	c.JSON(http.StatusOK, response)
}

// GetUserPosts 获取特定用户发布的内容 (/users/{userId}/posts)
func GetUserPosts(c *gin.Context) {
	userIDStr := c.Param("userId")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid user ID",
		})
		return
	}

	// 获取分页参数
	page := utils.GetPageFromQuery(c)
	limit := utils.GetLimitFromQuery(c)

	posts, total, err := services.PostService.GetUserPosts(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get user posts",
			"details": err.Error(),
		})
		return
	}

	// 转换为响应格式
	var postResponses []PostResponse
	for _, post := range posts {
		postResponses = append(postResponses, PostResponse{
			ID: post.ID.String(),
			User: UserPublicInfo{
				ID:     post.User.ID.String(),
				Name:   post.User.Name,
				Avatar: post.User.Avatar,
				// YoloStockValue: post.User.YoloStockValue,
			},
			Content:   post.Content,
			Timestamp: post.Timestamp.Format("2006-01-02T15:04:05Z"),
		})
	}

	// 计算总页数
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := PostsResponse{
		Posts: postResponses,
		PageInfo: PageInfo{
			CurrentPage: page,
			TotalPages:  totalPages,
			TotalPosts:  total,
		},
	}

	c.JSON(http.StatusOK, response)
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

	user, err := services.UserService.UpdateUserProfile(userID, req.Name, req.Email)
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

	_, err := services.UserService.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token_type":  "YOLO", // 平台基础token
		"description": "Platform base tokens for trading",
	})
}

// // GetUserHoldings 获取用户持仓
// func GetUserHoldings(c *gin.Context) {
// 	userID := utils.GetUserIDFromContext(c)

// 	holdings, err := services.HoldingService.GetUserHoldings(userID)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"error":   "Failed to get holdings",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"holdings": holdings,
// 	})
// }

// // SendGiftRequest 发送赠送请求
// type SendGiftRequest struct {
// 	RecipientID string  `json:"recipient_id" binding:"required"`
// 	StockID     string  `json:"stock_id" binding:"required"`
// 	Quantity    float64 `json:"quantity" binding:"required,gt=0"`
// 	Message     string  `json:"message" binding:"omitempty,max=500"`
// }

// // GiftResponse 赠送响应结构
// type GiftResponse struct {
// 	ID        string         `json:"id"`
// 	Sender    UserPublicInfo `json:"sender"`
// 	Recipient UserPublicInfo `json:"recipient"`
// 	Stock     StockInfo      `json:"stock"`
// 	Quantity  float64        `json:"quantity"`
// 	Message   *string        `json:"message"`
// 	CreatedAt string         `json:"created_at"`
// }

// // StockInfo 股票信息
// type StockInfo struct {
// 	ID     string  `json:"id"`
// 	Name   string  `json:"name"`
// 	Symbol string  `json:"symbol"`
// 	Price  float64 `json:"price"`
// }

// // GiftsResponse 赠送列表响应
// type GiftsResponse struct {
// 	Gifts    []GiftResponse `json:"gifts"`
// 	PageInfo PageInfo       `json:"pageInfo"`
// }

// // SendGift 发送赠送
// func SendGift(c *gin.Context) {
// 	userID := utils.GetUserIDFromContext(c)

// 	var req SendGiftRequest
// 	if err := c.ShouldBindJSON(&req); err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"error":   "Invalid request data",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	// 解析UUID
// 	recipientID, err := uuid.Parse(req.RecipientID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"error": "Invalid recipient ID",
// 		})
// 		return
// 	}

// 	stockID, err := uuid.Parse(req.StockID)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"error": "Invalid stock ID",
// 		})
// 		return
// 	}

// 	// 检查是否给自己发送赠送
// 	if userID == recipientID {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"error": "Cannot send gift to yourself",
// 		})
// 		return
// 	}

// 	// 发送赠送
// 	giftRecord, err := services.GiftService.SendGift(userID, recipientID, stockID, req.Quantity, req.Message)
// 	if err != nil {
// 		c.JSON(http.StatusBadRequest, gin.H{
// 			"error":   "Failed to send gift",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	// 转换为响应格式
// 	response := GiftResponse{
// 		ID: giftRecord.ID.String(),
// 		Sender: UserPublicInfo{
// 			ID:             giftRecord.Sender.ID.String(),
// 			Name:           giftRecord.Sender.Name,
// 			Avatar:         giftRecord.Sender.Avatar,
// 			YoloStockValue: giftRecord.Sender.YoloStockValue,
// 		},
// 		Recipient: UserPublicInfo{
// 			ID:             giftRecord.Recipient.ID.String(),
// 			Name:           giftRecord.Recipient.Name,
// 			Avatar:         giftRecord.Recipient.Avatar,
// 			YoloStockValue: giftRecord.Recipient.YoloStockValue,
// 		},
// 		Stock: StockInfo{
// 			ID:     giftRecord.Stock.ID.String(),
// 			Name:   giftRecord.Stock.Name,
// 			Symbol: giftRecord.Stock.Symbol,
// 			Price:  giftRecord.Stock.Price,
// 		},
// 		Quantity:  giftRecord.Quantity,
// 		Message:   giftRecord.Message,
// 		CreatedAt: giftRecord.CreatedAt.Format("2006-01-02T15:04:05Z"),
// 	}

// 	c.JSON(http.StatusCreated, gin.H{
// 		"message": "Gift sent successfully",
// 		"gift":    response,
// 	})
// }

// // GetReceivedGifts 获取收到的赠送
// func GetReceivedGifts(c *gin.Context) {
// 	userID := utils.GetUserIDFromContext(c)

// 	// 获取分页参数
// 	page := utils.GetPageFromQuery(c)
// 	limit := utils.GetLimitFromQuery(c)

// 	gifts, total, err := services.GiftService.GetReceivedGifts(userID, page, limit)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"error":   "Failed to get received gifts",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	// 转换为响应格式
// 	var giftResponses []GiftResponse
// 	for _, gift := range gifts {
// 		giftResponses = append(giftResponses, GiftResponse{
// 			ID: gift.ID.String(),
// 			Sender: UserPublicInfo{
// 				ID:             gift.Sender.ID.String(),
// 				Name:           gift.Sender.Name,
// 				Avatar:         gift.Sender.Avatar,
// 				YoloStockValue: gift.Sender.YoloStockValue,
// 			},
// 			Recipient: UserPublicInfo{
// 				ID:             gift.Recipient.ID.String(),
// 				Name:           gift.Recipient.Name,
// 				Avatar:         gift.Recipient.Avatar,
// 				YoloStockValue: gift.Recipient.YoloStockValue,
// 			},
// 			Stock: StockInfo{
// 				ID:     gift.Stock.ID.String(),
// 				Name:   gift.Stock.Name,
// 				Symbol: gift.Stock.Symbol,
// 				Price:  gift.Stock.Price,
// 			},
// 			Quantity:  gift.Quantity,
// 			Message:   gift.Message,
// 			CreatedAt: gift.CreatedAt.Format("2006-01-02T15:04:05Z"),
// 		})
// 	}

// 	// 计算总页数
// 	totalPages := int((total + int64(limit) - 1) / int64(limit))

// 	response := GiftsResponse{
// 		Gifts: giftResponses,
// 		PageInfo: PageInfo{
// 			CurrentPage: page,
// 			TotalPages:  totalPages,
// 			TotalPosts:  total,
// 		},
// 	}

// 	c.JSON(http.StatusOK, response)
// }

// // GetSentGifts 获取发送的赠送
// func GetSentGifts(c *gin.Context) {
// 	userID := utils.GetUserIDFromContext(c)

// 	// 获取分页参数
// 	page := utils.GetPageFromQuery(c)
// 	limit := utils.GetLimitFromQuery(c)

// 	gifts, total, err := services.GiftService.GetSentGifts(userID, page, limit)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"error":   "Failed to get sent gifts",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	// 转换为响应格式
// 	var giftResponses []GiftResponse
// 	for _, gift := range gifts {
// 		giftResponses = append(giftResponses, GiftResponse{
// 			ID: gift.ID.String(),
// 			Sender: UserPublicInfo{
// 				ID:             gift.Sender.ID.String(),
// 				Name:           gift.Sender.Name,
// 				Avatar:         gift.Sender.Avatar,
// 				YoloStockValue: gift.Sender.YoloStockValue,
// 			},
// 			Recipient: UserPublicInfo{
// 				ID:             gift.Recipient.ID.String(),
// 				Name:           gift.Recipient.Name,
// 				Avatar:         gift.Recipient.Avatar,
// 				YoloStockValue: gift.Recipient.YoloStockValue,
// 			},
// 			Stock: StockInfo{
// 				ID:     gift.Stock.ID.String(),
// 				Name:   gift.Stock.Name,
// 				Symbol: gift.Stock.Symbol,
// 				Price:  gift.Stock.Price,
// 			},
// 			Quantity:  gift.Quantity,
// 			Message:   gift.Message,
// 			CreatedAt: gift.CreatedAt.Format("2006-01-02T15:04:05Z"),
// 		})
// 	}

// 	// 计算总页数
// 	totalPages := int((total + int64(limit) - 1) / int64(limit))

// 	response := GiftsResponse{
// 		Gifts: giftResponses,
// 		PageInfo: PageInfo{
// 			CurrentPage: page,
// 			TotalPages:  totalPages,
// 			TotalPosts:  total,
// 		},
// 	}

// 	c.JSON(http.StatusOK, response)
// }

// // GetUserTrades 获取用户交易记录
// func GetUserTrades(c *gin.Context) {
// 	userID := utils.GetUserIDFromContext(c)

// 	// 获取查询参数
// 	page := utils.GetPageFromQuery(c)
// 	limit := utils.GetLimitFromQuery(c)

// 	trades, total, err := services.TradeService.GetUserTrades(userID, page, limit)
// 	if err != nil {
// 		c.JSON(http.StatusInternalServerError, gin.H{
// 			"error":   "Failed to get trades",
// 			"details": err.Error(),
// 		})
// 		return
// 	}

// 	c.JSON(http.StatusOK, gin.H{
// 		"trades": trades,
// 		"pagination": gin.H{
// 			"page":  page,
// 			"limit": limit,
// 			"total": total,
// 		},
// 	})
// }

// GetUserPublicInfo 根据用户名获取用户公开信息 (GET /users/:username)
func GetUserPublicInfo(c *gin.Context) {
	username := c.Param("username")
	if username == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Username is required",
		})
		return
	}

	user, err := services.UserService.GetUserByUsername(username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// 返回公开信息
	response := UserPublicInfo{
		ID:             user.ID.String(),
		Name:           user.Name,
		Avatar:         user.Avatar,
		// YoloStockValue: user.YoloStockValue,
	}

	c.JSON(http.StatusOK, response)
}
