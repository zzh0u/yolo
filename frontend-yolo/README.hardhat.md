# Hardhat 智能合约部署

这个目录包含了使用 Hardhat 部署智能合约到 Injective EVM 测试网的配置和脚本。

## 准备工作

1. 确保已安装所有依赖：
```
npm install
```

2. 确保 `.env` 文件包含必要的环境变量：
```
INJ_EVM_RPC_URL="https://k8s.testnet.json-rpc.injective.network/"
PRIVATE_KEY="你的私钥"
```

## 编译合约

```
npx hardhat compile
```

## 测试合约

### 测试 YoloToken 合约

运行 YoloToken 合约的测试：

```
npx hardhat test test/YoloToken.test.js
```

### 测试 StockTokenFactory 合约

运行 StockTokenFactory 合约的测试：

```
npx hardhat test test/StockTokenFactory.test.js
```

## 查询余额

查询指定地址的 INJ 余额：

```
npx hardhat run scripts/check-balance.js --network injEVM
```

## 部署合约

### 部署 YoloToken 合约

将 YoloToken 合约部署到 Injective EVM 测试网：

```
npx hardhat run scripts/deploy-yolotoken.js --network injEVM
```

### 部署 BankToken 合约

将 BankToken 合约部署到 Injective EVM 测试网：

```
npx hardhat run scripts/deploy-erc20.js --network injEVM
```

### 部署 StockTokenFactory 合约

将 StockTokenFactory 合约部署到 Injective EVM 测试网：

```
npx hardhat run scripts/deploy-stock-factory.js --network injEVM
```

## 股票代币系统使用指南

股票代币系统由 StockTokenFactory 和 StockToken 两个合约组成，允许创建和管理多个股票代币。

### 1. 部署工厂合约

首先部署 StockTokenFactory 合约：

```
npx hardhat run scripts/deploy-stock-factory.js --network injEVM
```

部署成功后，会输出工厂合约地址，请记录此地址。

### 2. 创建股票代币

使用工厂合约创建股票代币：

```
npx hardhat run scripts/create-stock.js --network injEVM -- --factory <工厂合约地址>
```

默认会创建一个 Tesla (TSLA) 股票代币。您可以修改 `create-stock.js` 文件中的股票信息来创建其他股票。

### 3. 列出所有股票

查看已创建的所有股票：

```
npx hardhat run scripts/list-stocks.js --network injEVM -- --factory <工厂合约地址>
```

## 与合约交互

部署合约后，您可以使用 Hardhat 控制台与合约交互:

```bash
npx hardhat console --network injEVM
```

示例交互:

```javascript
// 获取已部署的 YoloToken 合约
const YoloToken = await ethers.getContractFactory("YoloToken");
const yoloToken = await YoloToken.attach("已部署合约地址");

// 查询总供应量
const totalSupply = await yoloToken.totalSupply();
console.log("Total Supply:", ethers.formatEther(totalSupply));

// 查询账户余额
const [signer] = await ethers.getSigners();
const balance = await yoloToken.balanceOf(signer.address);
console.log("Balance:", ethers.formatEther(balance));

// 转账代币
const tx = await yoloToken.transfer("接收地址", ethers.parseEther("10"));
await tx.wait();

// 铸造新代币（仅限合约拥有者）
const mintTx = await yoloToken.mint("接收地址", ethers.parseEther("100"));
await mintTx.wait();
```

### 与股票工厂合约交互

```javascript
// 连接到工厂合约
const StockTokenFactory = await ethers.getContractFactory("StockTokenFactory");
const factory = await StockTokenFactory.attach("工厂合约地址");

// 获取股票数量
const count = await factory.getStockCount();
console.log("股票数量:", count.toString());

// 创建新股票
const tx = await factory.createStock(
  "Amazon.com, Inc.",
  "AMZN",
  "Amazon.com, Inc.",
  "亚马逊是一家美国跨国科技公司，专注于电子商务、云计算、数字流媒体和人工智能。",
  ethers.parseEther("0.015"),
  ethers.parseEther("500000")
);
await tx.wait();

// 获取股票地址
const amznAddress = await factory.getStockAddress("AMZN");
console.log("AMZN 合约地址:", amznAddress);

// 连接到股票合约
const StockToken = await ethers.getContractFactory("StockToken");
const amznToken = await StockToken.attach(amznAddress);

// 获取股票信息
const info = await amznToken.getStockInfo();
console.log("股票名称:", info[0]);
console.log("股票符号:", info[1]);
console.log("公司名称:", info[2]);
console.log("描述:", info[3]);
console.log("初始价格:", ethers.formatEther(info[4]), "ETH");
```

## 验证合约

部署后，可以使用以下命令验证合约：

```
npx hardhat verify --network injEVM 已部署的合约地址 "构造函数参数"
```

例如验证 YoloToken:

```
npx hardhat verify --network injEVM 已部署合约地址 "YOLO Token" "YOLO" ["初始持有者地址"] ["初始金额"]
```

验证 StockTokenFactory:

```
npx hardhat verify --network injEVM 已部署合约地址 "部署者地址"
```

## 注意事项

- 请确保您的账户中有足够的 INJ 代币用于支付 gas 费用。
- 请勿将包含私钥的 `.env` 文件提交到版本控制系统中。 