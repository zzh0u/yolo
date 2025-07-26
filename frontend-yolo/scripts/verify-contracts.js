const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("开始验证合约...");

    // 读取部署信息
    const deploymentsDir = path.join(__dirname, '../deployments');
    
    // 验证 YoloToken
    const yoloTokenPath = path.join(deploymentsDir, 'yolotoken.json');
    if (fs.existsSync(yoloTokenPath)) {
        const yoloTokenInfo = JSON.parse(fs.readFileSync(yoloTokenPath, 'utf8'));
        console.log("\n验证 YoloToken...");
        
        try {
            await hre.run("verify:verify", {
                address: yoloTokenInfo.address,
                constructorArguments: [
                    yoloTokenInfo.constructorArgs.name,
                    yoloTokenInfo.constructorArgs.symbol,
                    yoloTokenInfo.constructorArgs.initialHolders,
                    yoloTokenInfo.constructorArgs.initialAmounts
                ]
            });
            console.log("✅ YoloToken 验证成功");
        } catch (error) {
            console.log("⚠️ YoloToken 验证失败:", error.message);
        }
    }

    // 验证 YoloStockFactory
    const factoryPath = path.join(deploymentsDir, 'yolostockfactory.json');
    if (fs.existsSync(factoryPath)) {
        const factoryInfo = JSON.parse(fs.readFileSync(factoryPath, 'utf8'));
        console.log("\n验证 YoloStockFactory...");
        
        try {
            await hre.run("verify:verify", {
                address: factoryInfo.address,
                constructorArguments: [
                    factoryInfo.constructorArgs.yoloTokenAddress
                ]
            });
            console.log("✅ YoloStockFactory 验证成功");
        } catch (error) {
            console.log("⚠️ YoloStockFactory 验证失败:", error.message);
        }
    }

    console.log("\n🎉 合约验证完成!");
}

// 如果直接运行此脚本
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error("验证失败:", error);
            process.exit(1);
        });
}

module.exports = main;