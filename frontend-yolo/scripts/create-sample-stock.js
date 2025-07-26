const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("开始创建示例股票...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("操作者地址:", deployer.address);

    // 创建随机钱包用于不同的创建者
    const randomWallet1 = ethers.Wallet.createRandom().connect(ethers.provider);
    const randomWallet2 = ethers.Wallet.createRandom().connect(ethers.provider);
    
    console.log("随机创建者地址1:", randomWallet1.address);
    console.log("随机创建者地址2:", randomWallet2.address);

    // 读取 YoloStockFactory 部署信息
    const deploymentsDir = path.join(__dirname, '../deployments');
    const factoryPath = path.join(deploymentsDir, 'yolostockfactory.json');
    
    if (!fs.existsSync(factoryPath)) {
        console.error("❌ 未找到 YoloStockFactory 部署信息");
        console.log("请先运行: npx hardhat run scripts/deploy-all.js --network injEVM");
        process.exit(1);
    }

    const factoryInfo = JSON.parse(fs.readFileSync(factoryPath, 'utf8'));
    const factoryAddress = factoryInfo.address;
    console.log("YoloStockFactory 地址:", factoryAddress);

    // 连接到已部署的工厂合约
    const YoloStockFactory = await ethers.getContractFactory("YoloStockFactory");
    const factory = YoloStockFactory.attach(factoryAddress);

    // 示例股票参数
    const sampleStocks = [
        {
            name: "LynnLong",
            symbol: "LL",
            creatorName: "Lynn",
            description: "Learn to change the world.",
            basePrice: ethers.parseEther("1"), // 1 YOLO
            initialSupply: ethers.parseEther("2000"), // 2000 股
            creatorWallet: randomWallet1 // 使用随机地址1
        },
        {
            name: "Tao Lin",
            symbol: "TAO",
            creatorName: "Leo",
            description: "A passionate lover of life.",
            basePrice: ethers.parseEther("1"), // 1 YOLO
            initialSupply: ethers.parseEther("2000"), // 2000 股
            creatorWallet: randomWallet2 // 使用随机地址2
        },
    ];

    console.log("\n准备创建", sampleStocks.length, "个示例股票...");

    // 给随机钱包转账一些 ETH 用于支付 gas 费用
    const gasAmount = ethers.parseEther("0.1"); // 0.1 ETH
    
    console.log("\n💰 给随机钱包转账 gas 费用...");
    await deployer.sendTransaction({
        to: randomWallet1.address,
        value: gasAmount
    });
    console.log(`✅ 已向 ${randomWallet1.address} 转账 ${ethers.formatEther(gasAmount)} ETH`);
    
    await deployer.sendTransaction({
        to: randomWallet2.address,
        value: gasAmount
    });
    console.log(`✅ 已向 ${randomWallet2.address} 转账 ${ethers.formatEther(gasAmount)} ETH`);

    const createdStocks = [];

    for (let i = 0; i < sampleStocks.length; i++) {
        const stock = sampleStocks[i];
        console.log(`\n创建第 ${i + 1} 个股票: ${stock.name} (${stock.symbol})...`);
        console.log(`创建者地址: ${stock.creatorWallet.address}`);
        
        try {
            // 使用随机钱包连接到工厂合约
            const factoryWithCreator = factory.connect(stock.creatorWallet);
            
            // 创建股票
            const tx = await factoryWithCreator.createStock(
                stock.name,
                stock.symbol,
                stock.creatorName,
                stock.description,
                stock.initialSupply,
                stock.basePrice
            );

            console.log("交易已发送，等待确认...");
            const receipt = await tx.wait();
            
            // 从事件中获取新创建的股票地址
            const stockCreatedEvent = receipt.logs.find(
                log => log.fragment && log.fragment.name === 'StockCreated'
            );
            
            if (stockCreatedEvent) {
                const stockAddress = stockCreatedEvent.args[0];
                console.log("✅ 股票创建成功!");
                console.log("   股票地址:", stockAddress);
                console.log("   交易哈希:", tx.hash);
                
                createdStocks.push({
                    ...stock,
                    address: stockAddress,
                    transactionHash: tx.hash,
                    creatorAddress: stock.creatorWallet.address // 添加真实的创建者地址
                });
            } else {
                console.log("⚠️ 股票创建成功，但无法获取地址");
            }

        } catch (error) {
            console.error(`❌ 创建股票 ${stock.symbol} 失败:`, error.message);
        }
    }

    console.log("\n" + "=".repeat(50));
    console.log("示例股票创建完成");
    console.log("=".repeat(50));

    console.log(`✅ 成功创建 ${createdStocks.length} 个股票:`);
    createdStocks.forEach((stock, index) => {
        console.log(`${index + 1}. ${stock.name} (${stock.symbol})`);
        console.log(`   地址: ${stock.address}`);
        console.log(`   创建者: ${stock.creatorAddress}`);
        console.log(`   基础价格: ${ethers.formatEther(stock.basePrice)} YOLO`);
        console.log(`   初始供应量: ${ethers.formatEther(stock.initialSupply)} 股`);
        console.log("");
    });

    // 获取工厂合约的统计信息
    const totalStocks = await factory.getStockCount();
    console.log("📊 工厂合约统计:");
    console.log("- 总股票数量:", totalStocks.toString());

    // 保存示例股票信息
    const sampleStocksInfo = {
        network: "injEVM",
        factoryAddress: factoryAddress,
        creationTime: new Date().toISOString(),
        creator: deployer.address,
        stocks: createdStocks.map(stock => ({
            name: stock.name,
            symbol: stock.symbol,
            creatorName: stock.creatorName,
            description: stock.description,
            basePrice: stock.basePrice.toString(),
            initialSupply: stock.initialSupply.toString(),
            address: stock.address,
            creatorAddress: stock.creatorAddress,
            transactionHash: stock.transactionHash
        }))
    };

    fs.writeFileSync(
        path.join(deploymentsDir, 'sample-stocks.json'),
        JSON.stringify(sampleStocksInfo, null, 2)
    );

    console.log("📄 示例股票信息已保存到 deployments/sample-stocks.json");
    console.log("\n🎉 示例股票创建完成!");
    console.log("💡 现在可以在前端应用中测试这些股票的交易功能了!");

    return createdStocks;
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("创建示例股票失败:", error);
            process.exit(1);
        });
}

module.exports = main;