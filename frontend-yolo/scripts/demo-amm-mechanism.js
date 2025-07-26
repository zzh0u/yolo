const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 演示 AMM 铸造和交易机制");
    console.log("=" * 50);
    
    // 获取账户
    const [deployer, user1, user2] = await ethers.getSigners();
    console.log("📋 账户信息:");
    console.log(`部署者: ${deployer.address}`);
    console.log(`用户1: ${user1.address}`);
    console.log(`用户2: ${user2.address}`);
    console.log();
    
    // 读取部署信息
    const deploymentPath = path.join(__dirname, "../deployments");
    
    // 读取 YoloToken 部署信息
    const yoloTokenPath = path.join(deploymentPath, "yolotoken.json");
    if (!fs.existsSync(yoloTokenPath)) {
        console.error("❌ YoloToken 部署信息不存在，请先运行部署脚本");
        return;
    }
    const yoloTokenInfo = JSON.parse(fs.readFileSync(yoloTokenPath, "utf8"));
    
    // 读取示例股票信息
    const sampleStocksPath = path.join(deploymentPath, "sample-stocks.json");
    if (!fs.existsSync(sampleStocksPath)) {
        console.error("❌ 示例股票信息不存在，请先运行 create-sample-stock.js");
        return;
    }
    const sampleStocks = JSON.parse(fs.readFileSync(sampleStocksPath, "utf8"));
    
    // 连接到合约
    const YoloToken = await ethers.getContractFactory("YoloToken");
    const yoloToken = YoloToken.attach(yoloTokenInfo.address);
    
    const YoloStock = await ethers.getContractFactory("YoloStock");
    const stockContract = YoloStock.attach(sampleStocks.stocks[0].address);
    
    console.log("📊 合约信息:");
    console.log(`YoloToken 地址: ${yoloTokenInfo.address}`);
    console.log(`示例股票地址: ${sampleStocks.stocks[0].address}`);
    console.log(`股票名称: ${sampleStocks.stocks[0].name}`);
    console.log();
    
    // 给用户分发一些 YOLO 代币用于测试
    console.log("💰 分发测试 YOLO 代币...");
    const testAmount = ethers.parseEther("10000"); // 10,000 YOLO
    
    await yoloToken.connect(deployer).transfer(user1.address, testAmount);
    await yoloToken.connect(deployer).transfer(user2.address, testAmount);
    
    console.log(`✅ 已向 ${user1.address} 转账 ${ethers.formatEther(testAmount)} YOLO`);
    console.log(`✅ 已向 ${user2.address} 转账 ${ethers.formatEther(testAmount)} YOLO`);
    console.log();
    
    // 用户1进行铸造操作
    console.log("🏭 用户1 进行铸造操作");
    console.log("-" * 30);
    
    const stockAmountToMint = ethers.parseEther("1000"); // 1000 股票
    const yoloAmountToInvest = ethers.parseEther("2000"); // 2000 YOLO
    
    console.log(`铸造股票数量: ${ethers.formatEther(stockAmountToMint)}`);
    console.log(`投入 YOLO 数量: ${ethers.formatEther(yoloAmountToInvest)}`);
    
    // 授权股票合约使用 YOLO 代币
    await yoloToken.connect(user1).approve(stockContract.target, yoloAmountToInvest);
    console.log("✅ 已授权股票合约使用 YOLO 代币");
    
    // 记录铸造前的余额
    const user1StockBefore = await stockContract.balanceOf(user1.address);
    const user1YoloBefore = await yoloToken.balanceOf(user1.address);
    const tradingInfoBefore = await stockContract.getTradingInfo();
    
    console.log("📊 铸造前状态:");
    console.log(`用户1 股票余额: ${ethers.formatEther(user1StockBefore)}`);
    console.log(`用户1 YOLO 余额: ${ethers.formatEther(user1YoloBefore)}`);
    console.log(`流动性池 - 股票储备: ${ethers.formatEther(tradingInfoBefore._stockReserve)}`);
    console.log(`流动性池 - YOLO 储备: ${ethers.formatEther(tradingInfoBefore._yoloReserve)}`);
    console.log();
    
    // 执行铸造
    const mintTx = await stockContract.connect(user1).mint(stockAmountToMint, yoloAmountToInvest);
    await mintTx.wait();
    console.log("✅ 铸造交易已确认");
    
    // 记录铸造后的余额
    const user1StockAfter = await stockContract.balanceOf(user1.address);
    const user1YoloAfter = await yoloToken.balanceOf(user1.address);
    const tradingInfoAfter = await stockContract.getTradingInfo();
    
    console.log("📊 铸造后状态:");
    console.log(`用户1 股票余额: ${ethers.formatEther(user1StockAfter)}`);
    console.log(`用户1 YOLO 余额: ${ethers.formatEther(user1YoloAfter)}`);
    console.log(`流动性池 - 股票储备: ${ethers.formatEther(tradingInfoAfter._stockReserve)}`);
    console.log(`流动性池 - YOLO 储备: ${ethers.formatEther(tradingInfoAfter._yoloReserve)}`);
    console.log(`当前股票价格: ${ethers.formatEther(tradingInfoAfter.currentPrice)} YOLO/股票`);
    
    // 验证分配比例
    const stockReceived = user1StockAfter - user1StockBefore;
    const expectedMinterShare = (stockAmountToMint * 20n) / 100n;
    const expectedLiquidityShare = stockAmountToMint - expectedMinterShare;
    
    console.log();
    console.log("🔍 分配验证:");
    console.log(`用户1 实际获得股票: ${ethers.formatEther(stockReceived)}`);
    console.log(`预期用户1 获得股票 (20%): ${ethers.formatEther(expectedMinterShare)}`);
    console.log(`流动性池获得股票 (80%): ${ethers.formatEther(expectedLiquidityShare)}`);
    console.log(`分配比例正确: ${stockReceived === expectedMinterShare ? "✅" : "❌"}`);
    console.log();
    
    // 用户2进行交易测试
    console.log("💱 用户2 进行交易测试");
    console.log("-" * 30);
    
    // 计算购买价格
    const stockToBuy = ethers.parseEther("100"); // 购买 100 股票
    const buyPrice = await stockContract.calculateBuyPrice(stockToBuy);
    
    console.log(`要购买的股票数量: ${ethers.formatEther(stockToBuy)}`);
    console.log(`需要支付的 YOLO: ${ethers.formatEther(buyPrice)}`);
    
    // 授权并购买
    await yoloToken.connect(user2).approve(stockContract.target, buyPrice);
    
    const user2StockBefore = await stockContract.balanceOf(user2.address);
    const user2YoloBefore = await yoloToken.balanceOf(user2.address);
    
    const buyTx = await stockContract.connect(user2).buyStock(stockToBuy, buyPrice);
    await buyTx.wait();
    console.log("✅ 购买交易已确认");
    
    const user2StockAfter = await stockContract.balanceOf(user2.address);
    const user2YoloAfter = await yoloToken.balanceOf(user2.address);
    const tradingInfoAfterBuy = await stockContract.getTradingInfo();
    
    console.log("📊 购买后状态:");
    console.log(`用户2 股票余额: ${ethers.formatEther(user2StockAfter)}`);
    console.log(`用户2 YOLO 余额: ${ethers.formatEther(user2YoloAfter)}`);
    console.log(`实际支付 YOLO: ${ethers.formatEther(user2YoloBefore - user2YoloAfter)}`);
    console.log(`获得股票: ${ethers.formatEther(user2StockAfter - user2StockBefore)}`);
    console.log(`新的股票价格: ${ethers.formatEther(tradingInfoAfterBuy.currentPrice)} YOLO/股票`);
    console.log();
    
    // 用户2出售一部分股票
    console.log("💸 用户2 出售股票测试");
    console.log("-" * 30);
    
    const stockToSell = ethers.parseEther("50"); // 出售 50 股票
    const sellPrice = await stockContract.calculateSellPrice(stockToSell);
    
    console.log(`要出售的股票数量: ${ethers.formatEther(stockToSell)}`);
    console.log(`预期获得的 YOLO: ${ethers.formatEther(sellPrice)}`);
    
    const sellTx = await stockContract.connect(user2).sellStock(stockToSell, sellPrice);
    await sellTx.wait();
    console.log("✅ 出售交易已确认");
    
    const user2StockFinal = await stockContract.balanceOf(user2.address);
    const user2YoloFinal = await yoloToken.balanceOf(user2.address);
    const tradingInfoFinal = await stockContract.getTradingInfo();
    
    console.log("📊 出售后状态:");
    console.log(`用户2 股票余额: ${ethers.formatEther(user2StockFinal)}`);
    console.log(`用户2 YOLO 余额: ${ethers.formatEther(user2YoloFinal)}`);
    console.log(`实际获得 YOLO: ${ethers.formatEther(user2YoloFinal - user2YoloAfter)}`);
    console.log(`最终股票价格: ${ethers.formatEther(tradingInfoFinal.currentPrice)} YOLO/股票`);
    console.log();
    
    // 总结
    console.log("📈 AMM 机制总结");
    console.log("=" * 50);
    console.log("✅ 铸造机制: 用户投入 YOLO，获得 20% 股票，80% 自动投入流动性池");
    console.log("✅ 交易机制: 基于 AMM 模型，价格随供需自动调整");
    console.log("✅ 流动性: 每次铸造都会增加流动性，促进交易");
    console.log("✅ 去中心化: 无需中心化做市商，完全自动化运行");
    
    console.log();
    console.log("🎯 演示完成！");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 演示过程中发生错误:", error);
        process.exit(1);
    });