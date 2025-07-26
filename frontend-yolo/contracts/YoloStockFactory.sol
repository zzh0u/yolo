// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./YoloStock.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title YoloStockFactory
 * @dev 允许任何人创建自己的"人生股票"
 */
contract YoloStockFactory {
    // YOLO代币合约地址
    address public yoloTokenAddress;
    
    // 创建者地址到其股票地址的映射
    mapping(address => address) public creatorToStock;
    
    // 股票符号到股票地址的映射
    mapping(string => address) public symbolToStock;
    
    // 所有已创建的股票地址
    address[] public allStocks;
    
    // 事件
    event StockCreated(
        address indexed creator,
        string symbol, 
        address stockAddress, 
        string creatorName, 
        uint256 initialSupply
    );
    
    /**
     * @dev 构造函数
     * @param _yoloTokenAddress YOLO代币合约地址
     */
    constructor(address _yoloTokenAddress) {
        require(_yoloTokenAddress != address(0), "YoloStockFactory: YOLO token address cannot be zero");
        yoloTokenAddress = _yoloTokenAddress;
    }
    
    /**
     * @dev 创建新的人生股票
     * @param name 代币名称
     * @param symbol 代币符号
     * @param creatorName 创建者名称
     * @param description 个人描述
     * @param initialSupply 初始供应量
     * @param basePrice 基础价格 (以 YOLO 代币计价)
     * @return 新创建的人生股票地址
     */
    function createStock(
        string memory name,
        string memory symbol,
        string memory creatorName,
        string memory description,
        uint256 initialSupply,
        uint256 basePrice
    ) external returns (address) {
        // 确保创建者还没有创建过股票
        require(creatorToStock[msg.sender] == address(0), "YoloStockFactory: creator already has a stock");
        
        // 确保股票符号唯一
        require(symbolToStock[symbol] == address(0), "YoloStockFactory: symbol already exists");
        
        // 确保基础价格有效
        require(basePrice > 0, "YoloStockFactory: base price must be greater than zero");
        
        // 创建新的人生股票
        YoloStock newStock = new YoloStock(
            name,
            symbol,
            creatorName,
            description,
            yoloTokenAddress,
            msg.sender,
            initialSupply,
            basePrice
        );
        
        address stockAddress = address(newStock);
        
        // 记录新创建的股票
        creatorToStock[msg.sender] = stockAddress;
        symbolToStock[symbol] = stockAddress;
        allStocks.push(stockAddress);
        
        // 触发事件
        emit StockCreated(
            msg.sender,
            symbol, 
            stockAddress, 
            creatorName, 
            initialSupply
        );
        
        return stockAddress;
    }
    
    /**
     * @dev 获取已创建的股票数量
     * @return 股票数量
     */
    function getStockCount() external view returns (uint256) {
        return allStocks.length;
    }
    
    /**
     * @dev 获取指定索引的股票地址
     * @param index 索引
     * @return 股票地址
     */
    function getStockByIndex(uint256 index) external view returns (address) {
        require(index < allStocks.length, "YoloStockFactory: index out of bounds");
        return allStocks[index];
    }
    
    /**
     * @dev 获取创建者的股票地址
     * @param creator 创建者地址
     * @return 股票地址
     */
    function getStockByCreator(address creator) external view returns (address) {
        return creatorToStock[creator];
    }
    
    /**
     * @dev 获取指定符号的股票地址
     * @param symbol 股票符号
     * @return 股票地址
     */
    function getStockBySymbol(string memory symbol) external view returns (address) {
        return symbolToStock[symbol];
    }
    
    /**
     * @dev 获取所有股票地址
     * @return 股票地址数组
     */
    function getAllStocks() external view returns (address[] memory) {
        return allStocks;
    }
}