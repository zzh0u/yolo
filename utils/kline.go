package utils

import (
	"time"
	"yolo/models"
)

// KlineData K线数据结构（用于前端图表）
type KlineData struct {
	Timestamp int64   `json:"timestamp"`
	Open      float64 `json:"open"`
	High      float64 `json:"high"`
	Low       float64 `json:"low"`
	Close     float64 `json:"close"`
	Volume    float64 `json:"volume"`
}

// ConvertToKlineData 将ChartData转换为前端K线数据格式
func ConvertToKlineData(chartData []models.ChartData) []KlineData {
	var klineData []KlineData

	for _, cd := range chartData {
		klineData = append(klineData, KlineData{
			Timestamp: cd.Time * 1000, // 修正：使用 Time 字段而不是 Timestamp
			Open:      cd.OpenPrice,
			High:      cd.HighPrice,
			Low:       cd.LowPrice,
			Close:     cd.ClosePrice,
			Volume:    cd.Volume,
		})
	}

	return klineData
}

// GenerateTimeframes 生成时间框架列表
func GenerateTimeframes() []string {
	return []string{"1m", "5m", "15m", "1h", "4h", "1d"}
}

// GetTimeframeDuration 获取时间框架对应的时间间隔
func GetTimeframeDuration(timeframe string) time.Duration {
	switch timeframe {
	case "1m":
		return time.Minute
	case "5m":
		return 5 * time.Minute
	case "15m":
		return 15 * time.Minute
	case "1h":
		return time.Hour
	case "4h":
		return 4 * time.Hour
	case "1d":
		return 24 * time.Hour
	default:
		return time.Hour // 默认1小时
	}
}
