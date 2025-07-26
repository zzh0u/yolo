// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract SimpleSwap {
    address public tokenA;
    address public tokenB;
    uint256 public reserveA;
    uint256 public reserveB;

    constructor(address _tokenA, address _tokenB) {
        tokenA = _tokenA;
        tokenB = _tokenB;
    }

    // 添加流动性
    function addLiquidity(uint256 amountA, uint256 amountB) external {
        require(amountA > 0 && amountB > 0, "Invalid amounts");
        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transferFrom(msg.sender, address(this), amountB);
        reserveA += amountA;
        reserveB += amountB;
    }

    // 交换代币（tokenA -> tokenB） token B 视作 stablecoin
    function swapAtoB(uint256 amountA) external returns (uint256 amountB) {
        require(amountA > 0, "Invalid amount");
        require(reserveA > 0 && reserveB > 0, "No liquidity");

        // 使用恒定乘积公式计算输出数量
        // a * b = const k
        // (a + ain) * (b - bout) = k
        // a * b - a * bout + ain * b - ain * bout = k
        // ain * b - a * bout = ain * bout
        // ain * b - ain * bout = a * bout
        // bout * (a + ain) = ain * b
        // bout = (ain * b) / (a + ain)
        uint256 amountBOut = (amountA * reserveB) / (reserveA + amountA);
        require(amountBOut <= reserveB, "Insufficient liquidity");

        IERC20(tokenA).transferFrom(msg.sender, address(this), amountA);
        IERC20(tokenB).transfer(msg.sender, amountBOut);

        reserveA += amountA;
        reserveB -= amountBOut;

        return amountBOut;
    }

    // 获取当前价格 (tokenA -> tokenB) 可以将 B 视作价格单位， 所以swapAtoB 是 卖出操作， 而我们的输出是 A 目前的单价
    function getPriceAtoB() external view returns (uint256) {
        require(reserveA > 0 && reserveB > 0, "No liquidity");
        return (reserveB * 1e18) / reserveA; // 返回 tokenB/tokenA 的价格
    }
}