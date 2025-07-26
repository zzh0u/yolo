const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("YoloToken", function () {
  let YoloToken;
  let yoloToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    // 获取合约工厂和签名者
    YoloToken = await ethers.getContractFactory("YoloToken");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署合约，初始分配1000个代币给owner
    const initialHolders = [owner.address];
    const initialAmounts = [ethers.parseEther("1000")];
    
    yoloToken = await YoloToken.deploy(
      "YOLO Token",
      "YOLO",
      initialHolders,
      initialAmounts
    );
  });

  describe("部署", function () {
    it("应该设置正确的名称和符号", async function () {
      expect(await yoloToken.name()).to.equal("YOLO Token");
      expect(await yoloToken.symbol()).to.equal("YOLO");
    });

    it("应该将所有代币分配给所有者", async function () {
      const ownerBalance = await yoloToken.balanceOf(owner.address);
      expect(await yoloToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("交易", function () {
    it("应该能够转账代币", async function () {
      // 转账100个代币给addr1
      await yoloToken.transfer(addr1.address, ethers.parseEther("100"));
      const addr1Balance = await yoloToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("100"));
    });

    it("应该在余额不足时失败", async function () {
      const initialOwnerBalance = await yoloToken.balanceOf(owner.address);
      // 尝试转账超过余额的代币
      await expect(
        yoloToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWithCustomError(yoloToken, "ERC20InsufficientBalance");
    });

    it("应该更新余额", async function () {
      const initialOwnerBalance = await yoloToken.balanceOf(owner.address);
      
      // 转账100个代币给addr1
      await yoloToken.transfer(addr1.address, ethers.parseEther("100"));
      
      // 转账50个代币给addr2
      await yoloToken.transfer(addr2.address, ethers.parseEther("50"));

      // 检查余额
      const finalOwnerBalance = await yoloToken.balanceOf(owner.address);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance - ethers.parseEther("150"));
      
      const addr1Balance = await yoloToken.balanceOf(addr1.address);
      expect(addr1Balance).to.equal(ethers.parseEther("100"));
      
      const addr2Balance = await yoloToken.balanceOf(addr2.address);
      expect(addr2Balance).to.equal(ethers.parseEther("50"));
    });
  });

  describe("铸造和销毁", function () {
    it("只有所有者可以铸造代币", async function () {
      await yoloToken.mint(addr1.address, ethers.parseEther("50"));
      expect(await yoloToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
      
      // 非所有者尝试铸造代币应该失败
      await expect(
        yoloToken.connect(addr1).mint(addr2.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(yoloToken, "OwnableUnauthorizedAccount");
    });

    it("只有所有者可以销毁他人的代币", async function () {
      // 先给addr1一些代币
      await yoloToken.transfer(addr1.address, ethers.parseEther("100"));
      
      // 所有者销毁addr1的代币
      await yoloToken.burn(addr1.address, ethers.parseEther("50"));
      expect(await yoloToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
      
      // 非所有者尝试销毁代币应该失败
      await expect(
        yoloToken.connect(addr1).burn(owner.address, ethers.parseEther("50"))
      ).to.be.revertedWithCustomError(yoloToken, "OwnableUnauthorizedAccount");
    });

    it("用户可以销毁自己的代币", async function () {
      // 先给addr1一些代币
      await yoloToken.transfer(addr1.address, ethers.parseEther("100"));
      
      // addr1销毁自己的代币
      await yoloToken.connect(addr1).burnOwn(ethers.parseEther("50"));
      expect(await yoloToken.balanceOf(addr1.address)).to.equal(ethers.parseEther("50"));
    });
  });
}); 