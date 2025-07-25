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
		c.JSON(200, gin.H{"status": "ok", "message": "YOLO API is running"})
	})
	
	// API版本分组
	v1 := router.Group("/api/v1")
	
	// 公开路由（无需认证）
	public := v1.Group("/")
	{
		// 用户认证相关
		public.POST("/auth/register", controllers.Register)
		public.POST("/auth/login", controllers.Login)
		
		// 公开的代币信息
		public.GET("/tokens", controllers.GetAllTokens)
		public.GET("/tokens/:symbol", controllers.GetTokenBySymbol)
		public.GET("/tokens/:symbol/price-history", controllers.GetTokenPriceHistory)
		
		// 公开的Web3查询
		public.GET("/web3/price", controllers.GetTokenPrice)
		public.POST("/web3/balance", controllers.GetBalance)
	}
	
	// 需要认证的路由
	protected := v1.Group("/")
	protected.Use(middleware.AuthMiddleware())
	{
		// 用户相关
		protected.GET("/user/profile", controllers.GetUserProfile)
		protected.PUT("/user/profile", controllers.UpdateUserProfile)
		protected.GET("/user/balance", controllers.GetUserBalance)
		protected.GET("/user/holdings", controllers.GetUserHoldings)
		
		// 代币管理
		protected.POST("/tokens", controllers.CreateToken)
		protected.PUT("/tokens/:symbol", controllers.UpdateToken)
		protected.POST("/tokens/:symbol/list", controllers.ListToken) // 上市代币
		
		// Web3交易相关
		protected.POST("/web3/deploy-token", controllers.DeployToken)
		protected.POST("/web3/swap", controllers.SwapTokens)
		protected.POST("/web3/add-liquidity", controllers.AddLiquidity)
		protected.POST("/web3/transfer", controllers.TransferTokens)
		
		// 赠送功能（TODO: 可延后开发）
		protected.POST("/gifts/send", controllers.SendGift)
		protected.GET("/gifts/received", controllers.GetReceivedGifts)
		protected.GET("/gifts/sent", controllers.GetSentGifts)
	}
	
	return router
}