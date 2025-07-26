const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("开始部署所有合约...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);

    // 获取账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("部署者余额:", ethers.formatEther(balance), "ETH");

    console.log("\n" + "=".repeat(50));
    console.log("第一步: 部署 YoloToken");
    console.log("=".repeat(50));

    // 部署 YoloToken
    const deployYoloToken = require('./deploy-yolotoken.js');
    const yoloTokenAddress = await deployYoloToken();

    console.log("\n" + "=".repeat(50));
    console.log("第二步: 部署 YoloStockFactory");
    console.log("=".repeat(50));

    // 部署 YoloStockFactory
    const deployYoloStockFactory = require('./deploy-yolostockfactory.js');
    const factoryAddress = await deployYoloStockFactory();

    console.log("\n" + "=".repeat(50));
    console.log("部署完成总结");
    console.log("=".repeat(50));

    console.log("✅ 所有合约部署成功!");
    console.log("📋 部署摘要:");
    console.log("- YoloToken 地址:", yoloTokenAddress);
    console.log("- YoloStockFactory 地址:", factoryAddress);
    console.log("- 部署者地址:", deployer.address);
    console.log("- 网络: injEVM (Chain ID: 1439)");

    // 创建总体部署摘要
    const deploymentSummary = {
        network: "injEVM",
        chainId: 1439,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        contracts: {
            YoloToken: yoloTokenAddress,
            YoloStockFactory: factoryAddress
        }
    };

    // 保存部署摘要
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    fs.writeFileSync(
        path.join(deploymentsDir, 'deployment-summary.json'),
        JSON.stringify(deploymentSummary, null, 2)
    );

    console.log("\n📄 部署摘要已保存到 deployments/deployment-summary.json");
    
    console.log("\n🎉 所有合约部署完成!");
    console.log("💡 下一步可以:");
    console.log("   1. 运行 'npx hardhat run scripts/create-sample-stock.js --network injEVM' 创建示例股票");
    console.log("   2. 在前端应用中使用这些合约地址");
    console.log("   3. 验证合约 (如果需要)");

    return {
        yoloToken: yoloTokenAddress,
        factory: factoryAddress
    };
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("部署失败:", error);
            process.exit(1);
        });
}

module.exports = main;