const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("开始部署 YoloStockFactory 合约...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);

    // 获取账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("部署者余额:", ethers.formatEther(balance), "ETH");

    // 读取 YoloToken 部署信息
    const deploymentsDir = path.join(__dirname, '../deployments');
    const yoloTokenPath = path.join(deploymentsDir, 'yolotoken.json');
    
    let yoloTokenAddress;
    if (fs.existsSync(yoloTokenPath)) {
        const yoloTokenInfo = JSON.parse(fs.readFileSync(yoloTokenPath, 'utf8'));
        yoloTokenAddress = yoloTokenInfo.address;
        console.log("找到已部署的 YoloToken 地址:", yoloTokenAddress);
    } else {
        console.log("未找到 YoloToken 部署信息，正在部署...");
        const deployYoloToken = require('./deploy-yolotoken.js');
        yoloTokenAddress = await deployYoloToken();
        console.log("YoloToken 部署完成，地址:", yoloTokenAddress);
    }

    console.log("\n部署参数:");
    console.log("- YOLO Token 地址:", yoloTokenAddress);

    // 获取合约工厂
    const YoloStockFactory = await ethers.getContractFactory("YoloStockFactory");

    // 部署合约
    console.log("\n正在部署 YoloStockFactory 合约...");
    const yoloStockFactory = await YoloStockFactory.deploy(yoloTokenAddress);

    // 等待部署完成
    await yoloStockFactory.waitForDeployment();
    const factoryAddress = await yoloStockFactory.getAddress();

    console.log("\n✅ YoloStockFactory 部署成功!");
    console.log("合约地址:", factoryAddress);
    console.log("交易哈希:", yoloStockFactory.deploymentTransaction().hash);

    // 验证部署
    console.log("\n验证部署结果...");
    const tokenAddress = await yoloStockFactory.yoloTokenAddress();
    const stockCount = await yoloStockFactory.getStockCount();

    console.log("- YOLO Token 地址:", tokenAddress);
    console.log("- 当前股票数量:", stockCount.toString());

    // 保存部署信息到文件
    const deploymentInfo = {
        network: "injEVM",
        contractName: "YoloStockFactory",
        address: factoryAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        constructorArgs: {
            yoloTokenAddress: yoloTokenAddress
        }
    };

    // 确保 deployments 目录存在
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // 保存部署信息
    fs.writeFileSync(
        path.join(deploymentsDir, 'yolostockfactory.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 部署信息已保存到 deployments/yolostockfactory.json");
    console.log("\n🎉 YoloStockFactory 部署完成!");
    
    return factoryAddress;
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