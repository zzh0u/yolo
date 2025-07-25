package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User 用户模型（简化版）
type User struct {
	ID           uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	Username     string    `json:"username" gorm:"uniqueIndex;not null;size:50"`
	Email        string    `json:"email" gorm:"uniqueIndex;not null;size:255"`
	PasswordHash string    `json:"-" gorm:"size:255"`                               // Google用户可以为空
	GoogleID     *string   `json:"google_id,omitempty" gorm:"uniqueIndex;size:255"` // Google用户ID，仅用于存储，不再做Google登录相关逻辑
	Avatar       *string   `json:"avatar,omitempty" gorm:"size:500"`                // 用户头像URL，可为空
	Balance      float64   `json:"balance" gorm:"default:8000.00"`                  // 平台代币余额
	IsListed     bool      `json:"is_listed" gorm:"default:false"`
	CreatedAt    time.Time `json:"created_at"`

	// 关联关系
	UserTokens []UserToken   `json:"user_tokens,omitempty" gorm:"foreignKey:UserID"`
	Holdings   []UserHolding `json:"holdings,omitempty" gorm:"foreignKey:UserID"`
	UpdatedAt  time.Time     `json:"updated_at"`
}

// UserToken 用户代币模型（简化版）
type UserToken struct {
	ID           uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	UserID       uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`
	TokenSymbol  string    `json:"token_symbol" gorm:"uniqueIndex;not null;size:10"`
	TokenName    string    `json:"token_name" gorm:"not null;size:100"`
	TotalSupply  float64   `json:"total_supply" gorm:"default:1000000.00"`
	CurrentPrice float64   `json:"current_price" gorm:"default:1.00"`
	Description  *string   `json:"description" gorm:"type:text"`
	CreatedAt    time.Time `json:"created_at"`

	// 关联关系
	User         User           `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Holdings     []UserHolding  `json:"holdings,omitempty" gorm:"foreignKey:TokenID"`
	PriceHistory []PriceHistory `json:"price_history,omitempty" gorm:"foreignKey:TokenID"`
}

// UserHolding 用户持仓模型（简化版）
type UserHolding struct {
	ID        uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	UserID    uuid.UUID `json:"user_id" gorm:"type:char(36);not null"`
	TokenID   uuid.UUID `json:"token_id" gorm:"type:char(36);not null"`
	Quantity  float64   `json:"quantity" gorm:"default:0.00"`
	CreatedAt time.Time `json:"created_at"`

	// 关联关系
	User  User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Token UserToken `json:"token,omitempty" gorm:"foreignKey:TokenID"`
}

// PriceHistory K线数据模型
type PriceHistory struct {
	ID         uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	TokenID    uuid.UUID `json:"token_id" gorm:"type:char(36);not null"`
	Timeframe  string    `json:"timeframe" gorm:"not null;size:10"` // '1m', '5m', '1h', '1d'
	OpenPrice  float64   `json:"open_price" gorm:"not null"`
	HighPrice  float64   `json:"high_price" gorm:"not null"`
	LowPrice   float64   `json:"low_price" gorm:"not null"`
	ClosePrice float64   `json:"close_price" gorm:"not null"`
	Volume     float64   `json:"volume" gorm:"default:0.00"`
	TradeCount int       `json:"trade_count" gorm:"default:0"`
	Timestamp  time.Time `json:"timestamp" gorm:"not null"`
	CreatedAt  time.Time `json:"created_at"`

	// 关联关系
	Token UserToken `json:"token,omitempty" gorm:"foreignKey:TokenID"`
}

// GiftRecord 赠送记录模型（TODO: 可延后开发）
type GiftRecord struct {
	ID          uuid.UUID `json:"id" gorm:"type:char(36);primary_key"`
	SenderID    uuid.UUID `json:"sender_id" gorm:"type:char(36);not null"`
	RecipientID uuid.UUID `json:"recipient_id" gorm:"type:char(36);not null"`
	TokenID     uuid.UUID `json:"token_id" gorm:"type:char(36);not null"`
	Quantity    float64   `json:"quantity" gorm:"not null"`
	Message     *string   `json:"message" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at"`

	// 关联关系
	Sender    User      `json:"sender,omitempty" gorm:"foreignKey:SenderID"`
	Recipient User      `json:"recipient,omitempty" gorm:"foreignKey:RecipientID"`
	Token     UserToken `json:"token,omitempty" gorm:"foreignKey:TokenID"`
}

// BeforeCreate 钩子函数
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

func (ut *UserToken) BeforeCreate(tx *gorm.DB) error {
	if ut.ID == uuid.Nil {
		ut.ID = uuid.New()
	}
	return nil
}

func (uh *UserHolding) BeforeCreate(tx *gorm.DB) error {
	if uh.ID == uuid.Nil {
		uh.ID = uuid.New()
	}
	return nil
}

func (ph *PriceHistory) BeforeCreate(tx *gorm.DB) error {
	if ph.ID == uuid.Nil {
		ph.ID = uuid.New()
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

func (UserToken) TableName() string {
	return "user_tokens"
}

func (UserHolding) TableName() string {
	return "user_holdings"
}

func (PriceHistory) TableName() string {
	return "price_history"
}

func (GiftRecord) TableName() string {
	return "gift_records"
}
