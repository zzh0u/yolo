# YOLO 人生股票系统

YOLO 人生股票系统允许每个用户创建自己的"人生股票"，并与他人分享。这是一个基于区块链的系统，让您可以将自己的未来"代币化"，让支持者投资您的潜力。

## 系统概述

系统由以下主要组件组成：

1. **YoloToken (YOLO)** - 平台的基础代币
2. **YoloStock** - 个人的"人生股票"代币合约
3. **YoloStockFactory** - 用于创建和管理人生股票的工厂合约

## 功能特点

- 每个用户可以创建自己的人生股票，设定名称、符号和描述
- 创建股票时可以指定初始分配比例，将股票分配给支持者
- 股票创建者可以增发或销毁自己的股票
- 所有股票可以在平台上被发现和交易

## 使用指南

### 准备工作

1. 确保已安装所有依赖：
```
npm install
```

2. 确保 `.env` 文件包含必要的环境变量：
```
INJ_EVM_RPC_URL="https://k8s.testnet.json-rpc.injective.network/"
PRIVATE_KEY="你的私钥"
```

### 部署系统

部署 YOLO 人生股票系统：

```
npx hardhat run scripts/deploy-yolostock-factory.js --network injEVM
```

部署成功后，会输出 YoloToken 地址和 YoloStockFactory 地址，请记录这些地址。

### 创建自己的人生股票

使用工厂合约创建自己的人生股票：

```
npx hardhat run scripts/create-yolostock.js --network injEVM -- --factory <工厂合约地址>
```

默认会创建一个示例人生股票。您可以修改 `create-yolostock.js` 文件中的信息来创建自定义的人生股票：

```javascript
const stockInfo = {
  name: "您的名字 的人生股票",
  symbol: "您的股票代码",
  creatorName: "您的名字",
  description: "关于您自己和未来计划的描述",
  initialSupply: ethers.parseEther("1000000"), // 初始供应量
};

// 初始分配地址和比例
const initialDistribution = [
  deployer.address, // 您自己
  "0x...", // 朋友1的地址
  "0x..."  // 朋友2的地址
];

const distributionShares = [
  70, // 您保留70%
  20, // 朋友1获得20%
  10  // 朋友2获得10%
];
```

### 查看所有人生股票

查看平台上所有已创建的人生股票：

```
npx hardhat run scripts/list-yolostocks.js --network injEVM -- --factory <工厂合约地址>
```

### 与人生股票交互

您可以使用 Hardhat 控制台与您的人生股票交互：

```bash
npx hardhat console --network injEVM
```

然后在控制台中：

```javascript
// 连接到工厂合约
const YoloStockFactory = await ethers.getContractFactory("YoloStockFactory");
const factory = await YoloStockFactory.attach("工厂合约地址");

// 获取您的人生股票地址
const [signer] = await ethers.getSigners();
const myStockAddress = await factory.getStockByCreator(signer.address);

// 连接到您的人生股票
const YoloStock = await ethers.getContractFactory("YoloStock");
const myStock = await YoloStock.attach(myStockAddress);

// 查询信息
const info = await myStock.getStockInfo();
console.log("股票名称:", info[0]);
console.log("股票符号:", info[1]);
console.log("创建者名称:", info[2]);
console.log("描述:", info[3]);
console.log("总供应量:", ethers.formatEther(info[5]));

// 增发股票
await myStock.mint(signer.address, ethers.parseEther("10000"));

// 转账给朋友
await myStock.transfer("朋友的地址", ethers.parseEther("5000"));

// 销毁部分股票
await myStock.burn(signer.address, ethers.parseEther("1000"));

// 更新描述
await myStock.updateDescription("我的新描述，分享我最新的成就和计划");
```

## 测试系统

运行测试：

```
npx hardhat test test/YoloStockFactory.test.js
```

## 技术细节

### YoloStock 合约

YoloStock 是一个 ERC20 代币，代表一个人的"人生股票"。它包含以下主要功能：

- 基本的 ERC20 功能：转账、查询余额等
- 铸造新代币（仅限所有者）
- 销毁代币（所有者可以销毁任何人的代币，持有者只能销毁自己的）
- 更新个人描述（仅限所有者）

### YoloStockFactory 合约

YoloStockFactory 用于创建和管理人生股票。它包含以下主要功能：

- 创建新的人生股票
- 初始分配股票给指定地址
- 查询已创建的股票
- 通过创建者地址、股票符号或索引获取股票

## 注意事项

- 每个用户只能创建一个人生股票
- 股票符号必须唯一
- 初始分配比例总和必须为100%
- 请勿将包含私钥的 `.env` 文件提交到版本控制系统中 