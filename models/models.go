package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User 用户模型
type User struct {
	ID             uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	Name           string    `json:"name" gorm:"not null;size:100"`                   // 用户显示名称
	Username       string    `json:"username" gorm:"uniqueIndex;not null;size:50"`    // 用户名（用于登录）
	Email          string    `json:"email" gorm:"uniqueIndex;not null;size:255"`      // 邮箱
	PasswordHash   string    `json:"-" gorm:"size:255"`                               // 密码哈希，Google用户可以为空
	GoogleID       *string   `json:"google_id,omitempty" gorm:"uniqueIndex;size:255"` // Google用户ID
	Avatar         *string   `json:"avatar,omitempty" gorm:"size:500"`                // 用户头像URL
	YoloStockValue float64   `json:"yoloStockValue" gorm:"default:0.00"`              // 用户股票价值
	Balance        float64   `json:"balance" gorm:"default:8000.00"`                  // 平台代币余额
	IsListed       bool      `json:"is_listed" gorm:"default:false"`                  // 是否已上市
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`

	// 关联关系
	Posts      []Post        `json:"posts,omitempty" gorm:"foreignKey:UserID"`
	Stocks     []Stock       `json:"stocks,omitempty" gorm:"foreignKey:UserID"`
	Holdings   []UserHolding `json:"holdings,omitempty" gorm:"foreignKey:UserID"`
	BuyTrades  []Trade       `json:"buy_trades,omitempty" gorm:"foreignKey:BuyerID"`
	SellTrades []Trade       `json:"sell_trades,omitempty" gorm:"foreignKey:SellerID"`
}

// Post 帖子模型（用于时间线）
type Post struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`
	Content   string    `json:"content" gorm:"type:text;not null"` // 帖子内容
	Timestamp time.Time `json:"timestamp" gorm:"not null"`         // 发布时间
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// 关联关系
	User User `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// Stock 股票/项目模型（原UserToken）
type Stock struct {
	ID          uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	UserID      uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`         // 项目创建者
	Name        string    `json:"name" gorm:"not null;size:100"`                 // 项目名称
	Symbol      string    `json:"symbol" gorm:"uniqueIndex;not null;size:10"`    // 股票符号
	Image       *string   `json:"img,omitempty" gorm:"size:500"`                 // 项目图片URL
	Status      string    `json:"status" gorm:"not null;size:20;default:'demo'"` // 项目状态：demo, fundraising, live
	Price       float64   `json:"price" gorm:"default:1.00"`                     // 当前价格
	DailyChange float64   `json:"dailyChange" gorm:"default:0.00"`               // 日变化百分比
	DailyVolume float64   `json:"dailyVolume" gorm:"default:0.00"`               // 日交易量
	MarketCap   float64   `json:"marketCap" gorm:"default:0.00"`                 // 市值
	Owners      int       `json:"owners" gorm:"default:0"`                       // 持有者数量
	Supply      float64   `json:"supply" gorm:"default:1000000.00"`              // 流通量
	Description *string   `json:"description,omitempty" gorm:"type:text"`        // 项目描述
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// 关联关系
	User      User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Holdings  []UserHolding `json:"holdings,omitempty" gorm:"foreignKey:StockID"`
	Trades    []Trade       `json:"trades,omitempty" gorm:"foreignKey:StockID"`
	ChartData []ChartData   `json:"chartData,omitempty" gorm:"foreignKey:StockID"`
}

// UserHolding 用户持仓模型
type UserHolding struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`
	StockID   uuid.UUID `json:"stock_id" gorm:"type:char(36);not null"` // 改为StockID
	Quantity  float64   `json:"quantity" gorm:"default:0.00"`           // 持有数量
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// 关联关系
	User  User  `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Stock Stock `json:"stock,omitempty" gorm:"foreignKey:StockID"`
}

// Trade 交易记录模型
type Trade struct {
	ID            uuid.UUID  `json:"id" gorm:"type:char(36);primary_key"`
	StockID       uuid.UUID  `json:"stock_id" gorm:"type:char(36);not null"`              // 交易的股票ID
	BuyerID       uuid.UUID  `json:"buyer_id" gorm:"type:char(36);not null"`              // 买方用户ID
	SellerID      *uuid.UUID `json:"seller_id,omitempty" gorm:"type:char(36)"`            // 卖方用户ID（可为空，表示从系统购买）
	Type          string     `json:"type" gorm:"not null;size:10"`                        // 交易类型：buy, sell
	Amount        float64    `json:"amount" gorm:"not null"`                              // 交易数量
	Price         float64    `json:"price" gorm:"not null"`                               // 交易价格
	TotalValue    float64    `json:"total_value" gorm:"not null"`                         // 交易总价值
	TransactionID string     `json:"transaction_id" gorm:"uniqueIndex;not null;size:100"` // 交易ID
	Status        string     `json:"status" gorm:"not null;size:20;default:'completed'"`  // 交易状态
	CreatedAt     time.Time  `json:"created_at"`

	// 关联关系
	Stock  Stock `json:"stock,omitempty" gorm:"foreignKey:StockID"`
	Buyer  User  `json:"buyer,omitempty" gorm:"foreignKey:BuyerID"`
	Seller *User `json:"seller,omitempty" gorm:"foreignKey:SellerID"`
}

// ChartData K线图数据模型（原PriceHistory）
type ChartData struct {
	ID         uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	StockID    uuid.UUID `json:"stock_id" gorm:"type:char(36);not null"`
	Timeframe  string    `json:"timeframe" gorm:"not null;size:10"` // 时间框架：day, week, month, year
	Time       int64     `json:"time" gorm:"not null"`              // Unix时间戳
	Value      float64   `json:"value" gorm:"not null"`             // 价格值
	OpenPrice  float64   `json:"open_price" gorm:"not null"`        // 开盘价
	HighPrice  float64   `json:"high_price" gorm:"not null"`        // 最高价
	LowPrice   float64   `json:"low_price" gorm:"not null"`         // 最低价
	ClosePrice float64   `json:"close_price" gorm:"not null"`       // 收盘价
	Volume     float64   `json:"volume" gorm:"default:0.00"`        // 交易量
	TradeCount int       `json:"trade_count" gorm:"default:0"`      // 交易次数
	CreatedAt  time.Time `json:"created_at"`

	// 关联关系
	Stock Stock `json:"stock,omitempty" gorm:"foreignKey:StockID"`
}

// GiftRecord 赠送记录模型（保持不变）
type GiftRecord struct {
	ID          uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	SenderID    uuid.UUID `json:"sender_id" gorm:"type:char(36);not null"`
	RecipientID uuid.UUID `json:"recipient_id" gorm:"type:char(36);not null"`
	StockID     uuid.UUID `json:"stock_id" gorm:"type:char(36);not null"` // 改为StockID
	Quantity    float64   `json:"quantity" gorm:"not null"`
	Message     *string   `json:"message,omitempty" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`

	// 关联关系
	Sender    User  `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
	Recipient User  `json:"recipient,omitempty" gorm:"foreignKey:RecipientID"`
	Stock     Stock `json:"stock,omitempty" gorm:"foreignKey:StockID"`
}

// BeforeCreate 钩子函数 - 自动生成UUID
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (p *Post) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}

func (s *Stock) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

func (uh *UserHolding) BeforeCreate(tx *gorm.DB) error {
	if uh.ID == uuid.Nil {
		uh.ID = uuid.New()
	}
	return nil
}

func (t *Trade) BeforeCreate(tx *gorm.DB) error {
	if t.ID == uuid.Nil {
		t.ID = uuid.New()
	}
	return nil
}

func (cd *ChartData) BeforeCreate(tx *gorm.DB) error {
	if cd.ID == uuid.Nil {
		cd.ID = uuid.New()
	}
	return nil
}

func (gr *GiftRecord) BeforeCreate(tx *gorm.DB) error {
	if gr.ID == uuid.Nil {
		gr.ID = uuid.New()
	}
	return nil
}

// TableName 指定表名
func (User) TableName() string {
	return "users"
}

func (Post) TableName() string {
	return "posts"
}

func (Stock) TableName() string {
	return "stocks"
}

func (UserHolding) TableName() string {
	return "user_holdings"
}

func (Trade) TableName() string {
	return "trades"
}

func (ChartData) TableName() string {
	return "chart_data"
}

func (GiftRecord) TableName() string {
	return "gift_records"
}
