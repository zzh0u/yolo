// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YoloToken is ERC20, Ownable {
    constructor(
        string memory name, 
        string memory symbol, 
        address[] memory initialHolders, 
        uint256[] memory initialAmounts
    ) ERC20(name, symbol) Ownable(msg.sender) {
        require(initialHolders.length == initialAmounts.length, "YoloToken: arrays length mismatch");
        
        for (uint256 i = 0; i < initialHolders.length; i++) {
            require(initialHolders[i] != address(0), "YoloToken: zero address");
            _mint(initialHolders[i], initialAmounts[i]);
        }
    }
    
    /**
     * @dev 增发代币，只有合约拥有者可以调用
     * @param to 接收新代币的地址
     * @param amount 增发的代币数量
     */
    function mint(address to, uint256 amount) public onlyOwner {
        require(to != address(0), "YoloToken: mint to the zero address");
        _mint(to, amount);
    }
    
    /**
     * @dev 销毁代币，只有合约拥有者可以调用
     * @param from 销毁代币的地址
     * @param amount 销毁的代币数量
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }
    
    /**
     * @dev 允许用户销毁自己的代币
     * @param amount 销毁的代币数量
     */
    function burnOwn(uint256 amount) public {
        _burn(msg.sender, amount);
    }
}