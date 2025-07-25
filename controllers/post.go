package controllers

import (
	"net/http"
	"yolo/services"
	"yolo/utils"

	"github.com/gin-gonic/gin"
)

// CreatePostRequest 创建帖子请求
type CreatePostRequest struct {
	Content string `json:"content" binding:"required,min=1,max=1000"`
}

// CreatePostResponse 创建帖子响应
type CreatePostResponse struct {
	ID        string         `json:"id"`
	User      UserPublicInfo `json:"user"`
	Content   string         `json:"content"`
	Timestamp string         `json:"timestamp"`
}

// TimelineResponse 时间线响应
type TimelineResponse struct {
	Posts    []PostResponse `json:"posts"`
	PageInfo PageInfo       `json:"pageInfo"`
}

// CreatePost 创建新帖子 (POST /posts)
func CreatePost(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	var req CreatePostRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	// 创建帖子
	post, err := services.PostService.CreatePost(userID, req.Content)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to create post",
			"details": err.Error(),
		})
		return
	}

	// 构建响应
	response := CreatePostResponse{
		ID: post.ID.String(),
		User: UserPublicInfo{
			ID:             post.User.ID.String(),
			Name:           post.User.Name,
			Avatar:         post.User.Avatar,
			YoloStockValue: post.User.YoloStockValue,
		},
		Content:   post.Content,
		Timestamp: post.Timestamp.Format("2006-01-02T15:04:05Z"),
	}

	c.JSON(http.StatusCreated, response)
}

// GetTimeline 获取内容时间线 (GET /posts/timeline)
func GetTimeline(c *gin.Context) {
	// 获取分页参数
	page := utils.GetPageFromQuery(c)
	limit := utils.GetLimitFromQuery(c)

	posts, total, err := services.PostService.GetTimeline(page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   "Failed to get timeline",
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
				ID:             post.User.ID.String(),
				Name:           post.User.Name,
				Avatar:         post.User.Avatar,
				YoloStockValue: post.User.YoloStockValue,
			},
			Content:   post.Content,
			Timestamp: post.Timestamp.Format("2006-01-02T15:04:05Z"),
		})
	}

	// 计算总页数
	totalPages := int((total + int64(limit) - 1) / int64(limit))

	response := TimelineResponse{
		Posts: postResponses,
		PageInfo: PageInfo{
			CurrentPage: page,
			TotalPages:  totalPages,
			TotalPosts:  total,
		},
	}

	c.JSON(http.StatusOK, response)
}
