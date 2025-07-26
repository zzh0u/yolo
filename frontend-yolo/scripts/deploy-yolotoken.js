const { ethers } = require("hardhat");

async function main() {
    console.log("开始部署 YoloToken 合约...");

    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log("部署者地址:", deployer.address);

    // 获取账户余额
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("部署者余额:", ethers.formatEther(balance), "ETH");

    // YoloToken 构造函数参数
    const tokenName = "YOLO Token";
    const tokenSymbol = "YOLO";
    
    // 初始持有者和数量 (可以根据需要修改)
    const initialHolders = [
        deployer.address, // 部署者获得初始代币
    ];
    const initialAmounts = [
        ethers.parseEther("32000"), // 32000 YOLO 代币
    ];

    console.log("部署参数:");
    console.log("- 代币名称:", tokenName);
    console.log("- 代币符号:", tokenSymbol);
    console.log("- 初始持有者:", initialHolders);
    console.log("- 初始数量:", initialAmounts.map(amount => ethers.formatEther(amount)));

    // 获取合约工厂
    const YoloToken = await ethers.getContractFactory("YoloToken");

    // 部署合约
    console.log("\n正在部署 YoloToken 合约...");
    const yoloToken = await YoloToken.deploy(
        tokenName,
        tokenSymbol,
        initialHolders,
        initialAmounts
    );

    // 等待部署完成
    await yoloToken.waitForDeployment();
    const tokenAddress = await yoloToken.getAddress();

    console.log("\n✅ YoloToken 部署成功!");
    console.log("合约地址:", tokenAddress);
    console.log("交易哈希:", yoloToken.deploymentTransaction().hash);

    // 验证部署
    console.log("\n验证部署结果...");
    const name = await yoloToken.name();
    const symbol = await yoloToken.symbol();
    const totalSupply = await yoloToken.totalSupply();
    const deployerBalance = await yoloToken.balanceOf(deployer.address);

    console.log("- 代币名称:", name);
    console.log("- 代币符号:", symbol);
    console.log("- 总供应量:", ethers.formatEther(totalSupply));
    console.log("- 部署者余额:", ethers.formatEther(deployerBalance));

    // 保存部署信息到文件
    const deploymentInfo = {
        network: "injEVM",
        contractName: "YoloToken",
        address: tokenAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        constructorArgs: {
            name: tokenName,
            symbol: tokenSymbol,
            initialHolders: initialHolders,
            initialAmounts: initialAmounts.map(amount => amount.toString())
        }
    };

    const fs = require('fs');
    const path = require('path');
    
    // 确保 deployments 目录存在
    const deploymentsDir = path.join(__dirname, '../deployments');
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    // 保存部署信息
    fs.writeFileSync(
        path.join(deploymentsDir, 'yolotoken.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("\n📄 部署信息已保存到 deployments/yolotoken.json");
    console.log("\n🎉 YoloToken 部署完成!");
    
    return tokenAddress;
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