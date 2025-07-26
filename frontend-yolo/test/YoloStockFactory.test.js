const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YoloStockFactory", function () {
  let YoloToken;
  let yoloToken;
  let YoloStockFactory;
  let yoloStockFactory;
  let YoloStock;
  let owner;
  let user1;
  let user2;
  let user3;

  beforeEach(async function () {
    // 获取合约工厂和签名者
    YoloToken = await ethers.getContractFactory("YoloToken");
    YoloStockFactory = await ethers.getContractFactory("YoloStockFactory");
    YoloStock = await ethers.getContractFactory("YoloStock");
    [owner, user1, user2, user3] = await ethers.getSigners();

    // 部署 YoloToken
    const initialHolders = [owner.address];
    const initialAmounts = [ethers.parseEther("1000000")];
    yoloToken = await YoloToken.deploy(
      "YOLO Token",
      "YOLO",
      initialHolders,
      initialAmounts
    );
    
    // 部署工厂合约
    yoloStockFactory = await YoloStockFactory.deploy(await yoloToken.getAddress());
  });

  describe("部署", function () {
    it("应该正确设置YOLO代币地址", async function () {
      expect(await yoloStockFactory.yoloTokenAddress()).to.equal(await yoloToken.getAddress());
    });

    it("初始股票数量应该为0", async function () {
      expect(await yoloStockFactory.getStockCount()).to.equal(0);
    });
  });

  describe("创建人生股票", function () {
    it("用户应该能够创建自己的人生股票", async function () {
      const stockInfo = {
        name: "Alice的人生股票",
        symbol: "ALICE",
        creatorName: "Alice",
        description: "投资Alice的未来",
        initialSupply: ethers.parseEther("1000")
      };
      
      // 创建人生股票
      await yoloStockFactory.connect(user1).createStock(
        stockInfo.name,
        stockInfo.symbol,
        stockInfo.creatorName,
        stockInfo.description,
        stockInfo.initialSupply,
        [user1.address], // 初始分配只给创建者
        [100] // 100%给创建者
      );

      // 验证股票数量
      expect(await yoloStockFactory.getStockCount()).to.equal(1);

      // 验证创建者的股票地址
      const stockAddress = await yoloStockFactory.getStockByCreator(user1.address);
      expect(stockAddress).to.not.equal(ethers.ZeroAddress);

      // 验证股票符号
      const symbolAddress = await yoloStockFactory.getStockBySymbol("ALICE");
      expect(symbolAddress).to.equal(stockAddress);

      // 验证股票合约
      const stock = YoloStock.attach(stockAddress);
      const info = await stock.getStockInfo();
      
      expect(info[0]).to.equal(stockInfo.name); // 名称
      expect(info[1]).to.equal(stockInfo.symbol); // 符号
      expect(info[2]).to.equal(stockInfo.creatorName); // 创建者名称
      expect(info[3]).to.equal(stockInfo.description); // 描述
      expect(info[5]).to.equal(stockInfo.initialSupply); // 总供应量
      
      // 验证创建者余额
      const userBalance = await stock.balanceOf(user1.address);
      expect(userBalance).to.equal(stockInfo.initialSupply);
    });

    it("应该能够创建人生股票并进行初始分配", async function () {
      const stockInfo = {
        name: "Bob的人生股票",
        symbol: "BOB",
        creatorName: "Bob",
        description: "投资Bob的未来",
        initialSupply: ethers.parseEther("1000")
      };
      
      // 初始分配
      const initialDistribution = [user2.address, user1.address, user3.address];
      const distributionShares = [60, 25, 15]; // 60% 给创建者，25% 给 user1，15% 给 user3
      
      // 创建人生股票
      await yoloStockFactory.connect(user2).createStock(
        stockInfo.name,
        stockInfo.symbol,
        stockInfo.creatorName,
        stockInfo.description,
        stockInfo.initialSupply,
        initialDistribution,
        distributionShares
      );

      // 获取股票地址
      const stockAddress = await yoloStockFactory.getStockByCreator(user2.address);
      const stock = YoloStock.attach(stockAddress);
      
      // 验证余额分配
      const user2Balance = await stock.balanceOf(user2.address);
      const user1Balance = await stock.balanceOf(user1.address);
      const user3Balance = await stock.balanceOf(user3.address);
      
      expect(user2Balance).to.equal(stockInfo.initialSupply * BigInt(60) / BigInt(100));
      expect(user1Balance).to.equal(stockInfo.initialSupply * BigInt(25) / BigInt(100));
      expect(user3Balance).to.equal(stockInfo.initialSupply * BigInt(15) / BigInt(100));
    });

    it("不应该允许同一个用户创建多个人生股票", async function () {
      // 创建第一个股票
      await yoloStockFactory.connect(user1).createStock(
        "First Stock",
        "FIRST",
        "User One",
        "First stock description",
        ethers.parseEther("1000"),
        [user1.address],
        [100]
      );

      // 尝试创建第二个股票
      await expect(
        yoloStockFactory.connect(user1).createStock(
          "Second Stock",
          "SECOND",
          "User One Again",
          "Second stock description",
          ethers.parseEther("2000"),
          [user1.address],
          [100]
        )
      ).to.be.revertedWith("YoloStockFactory: creator already has a stock");
    });

    it("不应该允许创建重复符号的股票", async function () {
      // 创建第一个股票
      await yoloStockFactory.connect(user1).createStock(
        "User1 Stock",
        "SAME",
        "User One",
        "First stock with SAME symbol",
        ethers.parseEther("1000"),
        [user1.address],
        [100]
      );

      // 尝试创建相同符号的股票
      await expect(
        yoloStockFactory.connect(user2).createStock(
          "User2 Stock",
          "SAME",
          "User Two",
          "Second stock with SAME symbol",
          ethers.parseEther("2000"),
          [user2.address],
          [100]
        )
      ).to.be.revertedWith("YoloStockFactory: symbol already exists");
    });

    it("应该验证分配比例总和为100", async function () {
      // 尝试创建分配比例总和不为100的股票
      await expect(
        yoloStockFactory.connect(user1).createStock(
          "Invalid Stock",
          "INVALID",
          "Invalid User",
          "Invalid distribution",
          ethers.parseEther("1000"),
          [user1.address, user2.address],
          [80, 10] // 总和为90，不是100
        )
      ).to.be.revertedWith("YoloStockFactory: distribution shares must sum to 100");
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      // 创建几个股票用于测试
      await yoloStockFactory.connect(user1).createStock(
        "User1 Stock",
        "USER1",
        "User One",
        "User1's stock",
        ethers.parseEther("1000"),
        [user1.address],
        [100]
      );
      
      await yoloStockFactory.connect(user2).createStock(
        "User2 Stock",
        "USER2",
        "User Two",
        "User2's stock",
        ethers.parseEther("2000"),
        [user2.address],
        [100]
      );
    });

    it("应该能够获取所有股票地址", async function () {
      const stocks = await yoloStockFactory.getAllStocks();
      expect(stocks.length).to.equal(2);
      
      // 验证股票地址不为零
      expect(stocks[0]).to.not.equal(ethers.ZeroAddress);
      expect(stocks[1]).to.not.equal(ethers.ZeroAddress);
    });

    it("应该能够通过创建者获取股票地址", async function () {
      const user1Stock = await yoloStockFactory.getStockByCreator(user1.address);
      const user2Stock = await yoloStockFactory.getStockByCreator(user2.address);
      
      expect(user1Stock).to.not.equal(ethers.ZeroAddress);
      expect(user2Stock).to.not.equal(ethers.ZeroAddress);
      expect(user1Stock).to.not.equal(user2Stock);
    });

    it("应该能够通过符号获取股票地址", async function () {
      const user1Stock = await yoloStockFactory.getStockBySymbol("USER1");
      const user2Stock = await yoloStockFactory.getStockBySymbol("USER2");
      
      expect(user1Stock).to.not.equal(ethers.ZeroAddress);
      expect(user2Stock).to.not.equal(ethers.ZeroAddress);
      expect(user1Stock).to.not.equal(user2Stock);
    });

    it("应该能够通过索引获取股票地址", async function () {
      const stock0 = await yoloStockFactory.getStockByIndex(0);
      const stock1 = await yoloStockFactory.getStockByIndex(1);
      
      expect(stock0).to.not.equal(ethers.ZeroAddress);
      expect(stock1).to.not.equal(ethers.ZeroAddress);
    });

    it("应该在索引越界时抛出错误", async function () {
      await expect(
        yoloStockFactory.getStockByIndex(2)
      ).to.be.revertedWith("YoloStockFactory: index out of bounds");
    });
  });
}); 