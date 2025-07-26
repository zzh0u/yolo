const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StockTokenFactory", function () {
  let StockTokenFactory;
  let stockFactory;
  let StockToken;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async function () {
    // 获取合约工厂和签名者
    StockTokenFactory = await ethers.getContractFactory("StockTokenFactory");
    StockToken = await ethers.getContractFactory("StockToken");
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署工厂合约
    stockFactory = await StockTokenFactory.deploy(owner.address);
  });

  describe("部署", function () {
    it("应该将所有者设置为部署者", async function () {
      expect(await stockFactory.owner()).to.equal(owner.address);
    });

    it("初始股票数量应该为0", async function () {
      expect(await stockFactory.getStockCount()).to.equal(0);
    });
  });

  describe("创建股票", function () {
    it("所有者应该能够创建股票", async function () {
      const stockInfo = {
        name: "Apple Inc.",
        symbol: "AAPL",
        companyName: "Apple Inc.",
        description: "Apple Inc. 是一家美国跨国技术公司，设计、开发和销售消费电子产品、计算机软件和在线服务。",
        initialPrice: ethers.parseEther("0.02"),
        initialSupply: ethers.parseEther("1000000")
      };

      // 创建股票
      await stockFactory.createStock(
        stockInfo.name,
        stockInfo.symbol,
        stockInfo.companyName,
        stockInfo.description,
        stockInfo.initialPrice,
        stockInfo.initialSupply
      );

      // 验证股票数量
      expect(await stockFactory.getStockCount()).to.equal(1);

      // 验证股票符号
      expect(await stockFactory.getStockSymbolByIndex(0)).to.equal("AAPL");

      // 获取股票地址
      const stockAddress = await stockFactory.getStockAddress("AAPL");
      expect(stockAddress).to.not.equal(ethers.ZeroAddress);

      // 验证股票合约
      const stockToken = StockToken.attach(stockAddress);
      const info = await stockToken.getStockInfo();
      
      expect(info[0]).to.equal(stockInfo.name); // 名称
      expect(info[1]).to.equal(stockInfo.symbol); // 符号
      expect(info[2]).to.equal(stockInfo.companyName); // 公司名称
      expect(info[3]).to.equal(stockInfo.description); // 描述
      expect(info[4]).to.equal(stockInfo.initialPrice); // 初始价格
      expect(info[6]).to.equal(stockInfo.initialSupply); // 总供应量
      
      // 验证所有者余额
      const ownerBalance = await stockToken.balanceOf(owner.address);
      expect(ownerBalance).to.equal(stockInfo.initialSupply);
    });

    it("非所有者不应该能够创建股票", async function () {
      await expect(
        stockFactory.connect(addr1).createStock(
          "Microsoft",
          "MSFT",
          "Microsoft Corporation",
          "Microsoft Corporation 是一家美国跨国技术公司。",
          ethers.parseEther("0.01"),
          ethers.parseEther("1000000")
        )
      ).to.be.revertedWithCustomError(stockFactory, "OwnableUnauthorizedAccount");
    });

    it("不应该允许创建重复符号的股票", async function () {
      // 创建第一个股票
      await stockFactory.createStock(
        "Google",
        "GOOGL",
        "Alphabet Inc.",
        "Google 的母公司。",
        ethers.parseEther("0.03"),
        ethers.parseEther("500000")
      );

      // 尝试创建相同符号的股票
      await expect(
        stockFactory.createStock(
          "Google Class A",
          "GOOGL",
          "Alphabet Inc. Class A",
          "Google 的母公司的 A 类股。",
          ethers.parseEther("0.03"),
          ethers.parseEther("500000")
        )
      ).to.be.revertedWith("StockTokenFactory: stock symbol already exists");
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      // 创建几个股票用于测试
      await stockFactory.createStock(
        "Apple Inc.",
        "AAPL",
        "Apple Inc.",
        "苹果公司。",
        ethers.parseEther("0.02"),
        ethers.parseEther("1000000")
      );
      
      await stockFactory.createStock(
        "Microsoft Corporation",
        "MSFT",
        "Microsoft Corporation",
        "微软公司。",
        ethers.parseEther("0.01"),
        ethers.parseEther("2000000")
      );
    });

    it("应该能够获取所有股票符号", async function () {
      const symbols = await stockFactory.getAllStockSymbols();
      expect(symbols.length).to.equal(2);
      expect(symbols[0]).to.equal("AAPL");
      expect(symbols[1]).to.equal("MSFT");
    });

    it("应该能够通过索引获取股票符号", async function () {
      expect(await stockFactory.getStockSymbolByIndex(0)).to.equal("AAPL");
      expect(await stockFactory.getStockSymbolByIndex(1)).to.equal("MSFT");
    });

    it("应该在索引越界时抛出错误", async function () {
      await expect(
        stockFactory.getStockSymbolByIndex(2)
      ).to.be.revertedWith("StockTokenFactory: index out of bounds");
    });

    it("应该能够通过符号获取股票地址", async function () {
      const aaplAddress = await stockFactory.getStockAddress("AAPL");
      const msftAddress = await stockFactory.getStockAddress("MSFT");
      
      expect(aaplAddress).to.not.equal(ethers.ZeroAddress);
      expect(msftAddress).to.not.equal(ethers.ZeroAddress);
      expect(aaplAddress).to.not.equal(msftAddress);
    });

    it("不存在的股票符号应该返回零地址", async function () {
      const nonExistentAddress = await stockFactory.getStockAddress("NONEXISTENT");
      expect(nonExistentAddress).to.equal(ethers.ZeroAddress);
    });
  });
}); 