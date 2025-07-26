# 合约部署脚本使用指南

本目录包含了 YOLO 项目的合约部署脚本。

## 脚本说明

### 1. `deploy-yolotoken.js`
部署 YoloToken (ERC20) 合约
- 创建 YOLO 代币
- 设置初始持有者和数量
- 保存部署信息到 `deployments/yolotoken.json`

### 2. `deploy-yolostockfactory.js`
部署 YoloStockFactory 合约
- 需要 YoloToken 地址作为参数
- 如果 YoloToken 未部署，会自动先部署
- 保存部署信息到 `deployments/yolostockfactory.json`

### 3. `deploy-all.js`
一键部署所有合约
- 按顺序部署 YoloToken 和 YoloStockFactory
- 生成部署摘要到 `deployments/deployment-summary.json`

### 4. `create-sample-stock.js`
创建示例股票
- 使用已部署的工厂合约创建测试股票
- 保存示例股票信息到 `deployments/sample-stocks.json`

### 5. `demo-amm-mechanism.js`
演示完整的 AMM 铸造和交易机制
- 展示用户投入 YOLO 代币铸造股票的过程
- 验证 20% 给铸造者，80% 投入流动性池的分配机制
- 演示基于 AMM 的买卖交易功能

### 6. `verify-contracts.js`
验证合约源码
- 在区块链浏览器上验证合约
- 需要先部署合约

## 使用方法

### 环境准备
确保 `.env` 文件包含以下配置：
```
INJ_EVM_RPC_URL=https://testnet.sentry.tm.injective.network:443
PRIVATE_KEY=你的私钥
```

### 部署命令

1. **一键部署所有合约**（推荐）
```bash
npx hardhat run scripts/deploy-all.js --network injEVM
```

2. **分步部署**
```bash
# 先部署 YoloToken
npx hardhat run scripts/deploy-yolotoken.js --network injEVM

# 再部署 YoloStockFactory
npx hardhat run scripts/deploy-yolostockfactory.js --network injEVM
```

3. **创建示例股票**
```bash
npx hardhat run scripts/create-sample-stock.js --network injEVM
```

4. **演示 AMM 铸造和交易机制**
```bash
npx hardhat run scripts/demo-amm-mechanism.js --network injEVM
```

5. **验证合约**
```bash
npx hardhat run scripts/verify-contracts.js --network injEVM
```

## 🎯 AMM 去中心化交易机制

### 核心特性
- **投入铸造**: 用户投入 YOLO 代币来铸造股票
- **自动分配**: 20% 股票给铸造者，80% 股票和全部 YOLO 投入流动性池
- **AMM 交易**: 基于恒定乘积公式 (x * y = k) 的自动做市
- **价格发现**: 交易价格根据供需自动调整

### 工作原理
1. **铸造阶段**:
   - 用户调用 `mint(stockAmount, yoloAmount)` 函数
   - 用户投入指定数量的 YOLO 代币
   - 合约铸造指定数量的股票
   - 20% 股票分配给铸造者
   - 80% 股票 + 全部 YOLO 代币投入流动性池

2. **交易阶段**:
   - 用户可以通过 `buyStock()` 购买股票
   - 用户可以通过 `sellStock()` 出售股票
   - 价格基于 AMM 公式自动计算
   - 每次交易都会影响流动性池和价格

### 示例场景
假设用户投入 **2000 YOLO** 创建 **1000 A-Stock**：
- 用户获得：200 A-Stock (20%)
- 流动性池获得：800 A-Stock + 2000 YOLO (80%)
- 其他用户可以在流动性池中自由交易

### 与传统机制的区别
| 特性 | 传统项目方机制 | AMM 去中心化机制 |
|------|----------------|------------------|
| 铸造成本 | 免费或固定费用 | 需要投入 YOLO 代币 |
| 流动性来源 | 项目方手动添加 | 铸造时自动添加 |
| 交易深度 | 依赖项目方 | 随铸造自动增长 |
| 价格机制 | 人工定价 | 市场自动定价 |
| 去中心化程度 | 低 | 高 |

## 部署信息

部署完成后，合约信息会保存在 `deployments/` 目录下：

- `yolotoken.json` - YoloToken 合约信息
- `yolostockfactory.json` - YoloStockFactory 合约信息
- `deployment-summary.json` - 部署摘要
- `sample-stocks.json` - 示例股票信息

## 注意事项

1. 确保账户有足够的 INJ 代币支付 gas 费用
2. 部署前请检查网络配置是否正确
3. 私钥请妥善保管，不要提交到代码仓库
4. 测试网部署建议先在本地测试

## 故障排除

如果部署失败，请检查：
1. 网络连接是否正常
2. 私钥是否正确
3. 账户余额是否充足
4. 合约代码是否有语法错误

## 合约地址查看

部署完成后，可以通过以下方式查看合约地址：
```bash
cat deployments/deployment-summary.json
```