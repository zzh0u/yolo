package tests

import (
	"net/http/httptest"
	"testing"
	"yolo/utils"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// TestGetUserIDFromContext 测试从上下文获取用户ID
func TestGetUserIDFromContext(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// 创建测试上下文
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)

	// 测试没有设置用户ID的情况
	userID := utils.GetUserIDFromContext(c)
	assert.Equal(t, uuid.Nil, userID)

	// 设置用户ID
	testUserID := uuid.New()
	c.Set("userID", testUserID)

	// 测试获取用户ID
	userID = utils.GetUserIDFromContext(c)
	assert.Equal(t, testUserID, userID)
}

// TestGetPageFromQuery 测试从查询参数获取页码
func TestGetPageFromQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// 测试默认页码
	w1 := httptest.NewRecorder()
	c1, _ := gin.CreateTestContext(w1)
	c1.Request = httptest.NewRequest("GET", "/", nil)
	page := utils.GetPageFromQuery(c1)
	assert.Equal(t, 1, page)

	// 测试有效页码
	w2 := httptest.NewRecorder()
	c2, _ := gin.CreateTestContext(w2)
	c2.Request = httptest.NewRequest("GET", "/?page=5", nil)
	page = utils.GetPageFromQuery(c2)
	assert.Equal(t, 5, page)

	// 测试无效页码
	w3 := httptest.NewRecorder()
	c3, _ := gin.CreateTestContext(w3)
	c3.Request = httptest.NewRequest("GET", "/?page=invalid", nil)
	page = utils.GetPageFromQuery(c3)
	assert.Equal(t, 1, page)

	// 测试负数页码
	w4 := httptest.NewRecorder()
	c4, _ := gin.CreateTestContext(w4)
	c4.Request = httptest.NewRequest("GET", "/?page=-1", nil)
	page = utils.GetPageFromQuery(c4)
	assert.Equal(t, 1, page)
}

// TestGetLimitFromQuery 测试从查询参数获取限制数量
func TestGetLimitFromQuery(t *testing.T) {
	gin.SetMode(gin.TestMode)

	// 测试默认限制
	w1 := httptest.NewRecorder()
	c1, _ := gin.CreateTestContext(w1)
	c1.Request = httptest.NewRequest("GET", "/", nil)
	limit := utils.GetLimitFromQuery(c1)
	assert.Equal(t, 20, limit)

	// 测试有效限制
	w2 := httptest.NewRecorder()
	c2, _ := gin.CreateTestContext(w2)
	c2.Request = httptest.NewRequest("GET", "/?limit=50", nil)
	limit = utils.GetLimitFromQuery(c2)
	assert.Equal(t, 50, limit)

	// 测试无效限制
	w3 := httptest.NewRecorder()
	c3, _ := gin.CreateTestContext(w3)
	c3.Request = httptest.NewRequest("GET", "/?limit=invalid", nil)
	limit = utils.GetLimitFromQuery(c3)
	assert.Equal(t, 20, limit)

	// 测试超出最大限制
	w4 := httptest.NewRecorder()
	c4, _ := gin.CreateTestContext(w4)
	c4.Request = httptest.NewRequest("GET", "/?limit=200", nil)
	limit = utils.GetLimitFromQuery(c4)
	assert.Equal(t, 20, limit)

	// 测试负数限制
	w5 := httptest.NewRecorder()
	c5, _ := gin.CreateTestContext(w5)
	c5.Request = httptest.NewRequest("GET", "/?limit=-1", nil)
	limit = utils.GetLimitFromQuery(c5)
	assert.Equal(t, 20, limit)
}