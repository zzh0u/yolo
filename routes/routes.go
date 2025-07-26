package routes

import (
	"yolo/controllers"
	"yolo/middleware"

	"github.com/gin-gonic/gin"
)

// SetupRoutes 设置所有API路由
func SetupRoutes() *gin.Engine {
	// 设置Gin模式
	gin.SetMode(gin.ReleaseMode)

	router := gin.Default()

	// 添加CORS中间件
	router.Use(middleware.CORSMiddleware())

	// 健康检查
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "message": "YOLO API is running - User Management Only"})
	})

	// API版本分组
	v1 := router.Group("/api/v1")

	// 公开路由（无需认证）
	public := v1.Group("/")
	{
		// 用户认证相关
		public.POST("/auth/register", controllers.Register)
		public.POST("/auth/login", controllers.Login)
		public.POST("/auth/google", controllers.GoogleAuth)

		// 公开的用户信息
		public.GET("/users/:username", controllers.GetUserPublicInfo)
		public.GET("/users/:username/posts", controllers.GetUserPosts)

		// 公开的帖子信息（如果需要保留）
		public.GET("/posts/timeline", controllers.GetTimeline)
	}

	// 需要认证的路由
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// 用户相关
		protected.GET("/auth/me", controllers.GetCurrentUser)
		protected.GET("/user/profile", controllers.GetUserProfile)
		protected.PUT("/user/profile", controllers.UpdateUserProfile)

		// 帖子管理（如果需要保留）
		protected.POST("/posts", controllers.CreatePost)

		// ==================== 以下功能已停用 ====================
		// 股票相关功能已停用
		// protected.GET("/stocks", controllers.GetStocks)
		// protected.GET("/stocks/:symbol", controllers.GetStockDetail)
		// protected.POST("/stocks/trade", controllers.TradeStock)
		
		// 用户交易相关功能已停用
		// protected.GET("/user/balance", controllers.GetUserBalance)
		// protected.GET("/user/holdings", controllers.GetUserHoldings)
		// protected.GET("/user/trades", controllers.GetUserTrades)

		// Web3交易相关功能已停用
		// protected.POST("/web3/deploy-token", controllers.DeployToken)
		// protected.POST("/web3/swap", controllers.SwapTokens)
		// protected.POST("/web3/add-liquidity", controllers.AddLiquidity)
		// protected.POST("/web3/transfer", controllers.TransferTokens)

		// 赠送功能已停用
		// protected.POST("/gifts/send", controllers.SendGift)
		// protected.GET("/gifts/received", controllers.GetReceivedGifts)
		// protected.GET("/gifts/sent", controllers.GetSentGifts)
	}

	return router
}
