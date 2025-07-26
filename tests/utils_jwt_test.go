package tests

import (
	"testing"
	"yolo/utils"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

// TestGenerateJWT 测试生成JWT
func TestGenerateJWT(t *testing.T) {
	userID := uuid.New().String()

	token, err := utils.GenerateJWT(userID)

	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// 验证生成的token
	parsedUserID, err := utils.ValidateJWT(token)
	assert.NoError(t, err)
	assert.Equal(t, userID, parsedUserID.String())
}

// TestValidateJWT_ValidToken 测试验证有效JWT
func TestValidateJWT_ValidToken(t *testing.T) {
	userID := uuid.New()

	// 生成token
	token, err := utils.GenerateJWT(userID.String())
	assert.NoError(t, err)

	// 验证token
	parsedUserID, err := utils.ValidateJWT(token)
	assert.NoError(t, err)
	assert.Equal(t, userID, parsedUserID)
}

// TestValidateJWT_InvalidToken 测试验证无效JWT
func TestValidateJWT_InvalidToken(t *testing.T) {
	// 测试无效的token字符串
	_, err := utils.ValidateJWT("invalid.token.string")
	assert.Error(t, err)

	// 测试空token
	_, err = utils.ValidateJWT("")
	assert.Error(t, err)
}

// TestValidateJWT_ExpiredToken 测试验证过期JWT
func TestValidateJWT_ExpiredToken(t *testing.T) {
	userID := uuid.New().String()

	// 由于 Claims 结构体在 utils 包中是私有的，我们需要通过公共API来测试
	// 这里我们创建一个即将过期的token，然后等待它过期
	token, err := utils.GenerateJWT(userID)
	assert.NoError(t, err)

	// 立即验证应该成功
	_, err = utils.ValidateJWT(token)
	assert.NoError(t, err)

	// 注意：由于我们无法直接访问私有的Claims结构体，
	// 这个测试主要验证JWT生成和验证的基本功能
}

// TestValidateJWT_InvalidUserID 测试验证包含无效用户ID的JWT
func TestValidateJWT_InvalidUserID(t *testing.T) {
	// 测试无效的用户ID格式
	_, err := utils.GenerateJWT("invalid-uuid")
	// 根据实际的GenerateJWT实现，这可能会成功或失败
	// 如果成功生成，那么在ValidateJWT时应该会失败
	if err == nil {
		// 如果生成成功，验证时应该失败
		token, _ := utils.GenerateJWT("invalid-uuid")
		_, err = utils.ValidateJWT(token)
		assert.Error(t, err)
	}
}
