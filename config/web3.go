package config

import (
	"context"
	"crypto/ecdsa"
	"log"
	"math/big"
	"os"

	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// Web3Config Web3配置结构
type Web3Config struct {
	Client     *ethclient.Client
	ChainID    *big.Int
	PrivateKey *ecdsa.PrivateKey
	Auth       *bind.TransactOpts
	RpcURL     string
}

var Web3 *Web3Config

// InitWeb3 初始化Web3连接
func InitWeb3() error {
	// 检查是否跳过Web3初始化（测试环境）
	if os.Getenv("SKIP_WEB3_INIT") == "true" {
		log.Println("Skipping Web3 initialization for testing")
		return nil
	}

	// 从环境变量获取配置
	rpcURL := os.Getenv("INJ_EVM_RPC_URL")
	if rpcURL == "" {
		rpcURL = "https://testnet.sentry.tm.injective.network:443" // 默认测试网
	}

	privateKeyHex := os.Getenv("PRIVATE_KEY")
	if privateKeyHex == "" {
		log.Fatal("PRIVATE_KEY environment variable is required")
	}

	// 连接到区块链网络
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return err
	}

	// 获取链ID
	chainID, err := client.NetworkID(context.Background())
	if err != nil {
		return err
	}

	// 解析私钥
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return err
	}

	// 创建交易授权
	auth, err := bind.NewKeyedTransactorWithChainID(privateKey, chainID)
	if err != nil {
		return err
	}

	// 设置Gas配置
	auth.GasPrice = big.NewInt(160000000) // 160 Gwei
	auth.GasLimit = uint64(1000000)       // 1M gas

	Web3 = &Web3Config{
		Client:     client,
		ChainID:    chainID,
		PrivateKey: privateKey,
		Auth:       auth,
		RpcURL:     rpcURL,
	}

	log.Printf("Web3 initialized successfully. Chain ID: %s", chainID.String())
	return nil
}

// GetAuth 获取交易授权（用于发送交易）
func (w *Web3Config) GetAuth() *bind.TransactOpts {
	return w.Auth
}

// GetCallOpts 获取调用选项（用于只读调用）
func (w *Web3Config) GetCallOpts() *bind.CallOpts {
	return &bind.CallOpts{
		Context: context.Background(),
	}
}
