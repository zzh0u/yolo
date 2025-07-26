// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title YoloStock
 * @dev 代表一个人的"人生股票"，可以由任何人创建和交易
 */
contract YoloStock is ERC20, Ownable, ReentrancyGuard {
    // 股票的额外信息
    string public creatorName;
    string public description;
    uint256 public launchTimestamp; // 上市时间戳
    
    // YOLO代币合约地址
    address public yoloTokenAddress;
    
    // 交易相关变量
    uint256 public basePrice; // 基础价格 (以 YOLO 代币计价)
    uint256 public constant PRICE_MULTIPLIER = 1000; // 价格乘数，用于精确计算
    
    // 流动性池
    uint256 public yoloReserve; // YOLO 代币储备
    uint256 public stockReserve; // 股票储备
    
    // 交易事件
    event Trade(
        address indexed trader,
        bool isBuy,
        uint256 stockAmount,
        uint256 yoloAmount,
        uint256 newPrice
    );
    
    event LiquidityAdded(
        address indexed provider,
        uint256 stockAmount,
        uint256 yoloAmount
    );
    
    event PriceUpdated(uint256 oldPrice, uint256 newPrice);
    
    // 铸造事件
    event TokensMinted(
        address indexed minter,
        uint256 minterAmount,
        address indexed liquidityPool,
        uint256 liquidityAmount,
        uint256 totalStockAmount
    );
    
    /**
     * @dev 构造函数
     * @param name 代币名称
     * @param symbol 代币符号
     * @param _creatorName 创建者名称
     * @param _description 个人描述
     * @param _yoloTokenAddress YOLO代币合约地址
     * @param initialOwner 初始所有者
     * @param initialSupply 初始供应量
     * @param _basePrice 基础价格 (以 YOLO 代币计价)
     */
    constructor(
        string memory name,
        string memory symbol,
        string memory _creatorName,
        string memory _description,
        address _yoloTokenAddress,
        address initialOwner,
        uint256 initialSupply,
        uint256 _basePrice
    ) ERC20(name, symbol) Ownable(initialOwner) {
        require(_yoloTokenAddress != address(0), "YoloStock: YOLO token address cannot be zero");
        require(_basePrice > 0, "YoloStock: base price must be greater than zero");
        
        creatorName = _creatorName;
        description = _description;
        yoloTokenAddress = _yoloTokenAddress;
        basePrice = _basePrice;
        launchTimestamp = block.timestamp;
        
        // 铸造初始供应量 - 全部给项目方（合约所有者）
        _mint(initialOwner, initialSupply);
        
        // 初始化流动性池为空，等待后续添加
        stockReserve = 0;
        yoloReserve = 0;
    }
    
    /**
     * @dev 铸造新代币 - 用户投入 YOLO 代币，20% 股票给铸造者，80% 股票和 YOLO 投入流动性池
     * @param stockAmount 要铸造的股票数量
     * @param yoloAmount 投入的 YOLO 代币数量
     */
    function mint(uint256 stockAmount, uint256 yoloAmount) external nonReentrant {
        require(stockAmount > 0, "YoloStock: stock amount must be greater than zero");
        require(yoloAmount > 0, "YoloStock: YOLO amount must be greater than zero");
        
        // 转移 YOLO 代币到合约
        IERC20(yoloTokenAddress).transferFrom(msg.sender, address(this), yoloAmount);
        
        // 计算分配比例
        uint256 minterShare = (stockAmount * 20) / 100; // 20% 给铸造者
        uint256 liquidityShare = stockAmount - minterShare; // 80% 投入流动性池
        
        // 铸造股票
        _mint(msg.sender, minterShare); // 20% 给铸造者
        _mint(address(this), liquidityShare); // 80% 给合约（用于流动性池）
        
        // 将 80% 的股票和对应的 YOLO 代币投入流动性池
        stockReserve += liquidityShare;
        yoloReserve += yoloAmount;
        
        emit TokensMinted(msg.sender, minterShare, address(this), liquidityShare, stockAmount);
        emit LiquidityAdded(msg.sender, liquidityShare, yoloAmount);
    }
    
    /**
     * @dev 项目方专用铸造函数 (只有所有者可以调用)
     * @param to 接收代币的地址
     * @param amount 铸造的代币数量
     */
    function mintTo(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "YoloStock: mint to the zero address");
        _mint(to, amount);
    }
    
    /**
     * @dev 销毁代币
     * @param from 销毁代币的地址
     * @param amount 销毁的代币数量
     */
    function burn(address from, uint256 amount) external {
        require(from == msg.sender || msg.sender == owner(), "YoloStock: only token owner or contract owner can burn");
        _burn(from, amount);
    }
    
    /**
     * @dev 更新个人描述
     * @param _description 新的个人描述
     */
    function updateDescription(string memory _description) external onlyOwner {
        description = _description;
    }
    
    /**
     * @dev 获取股票的基本信息
     * @return _name 代币名称
     * @return _symbol 代币符号
     * @return _creatorName 创建者名称
     * @return _description 个人描述
     * @return _launchTimestamp 上市时间戳
     * @return _totalSupply 总供应量
     */
    function getStockInfo() external view returns (
        string memory _name,
        string memory _symbol,
        string memory _creatorName,
        string memory _description,
        uint256 _launchTimestamp,
        uint256 _totalSupply
    ) {
        return (
            name(),
            symbol(),
            creatorName,
            description,
            launchTimestamp,
            totalSupply()
        );
    }
    
    /**
     * @dev 计算当前股票价格 (基于 AMM 模型)
     * @return 当前价格 (以 YOLO 代币计价)
     */
    function getCurrentPrice() public view returns (uint256) {
        if (stockReserve == 0 || yoloReserve == 0) {
            return basePrice;
        }
        return (yoloReserve * PRICE_MULTIPLIER) / stockReserve;
    }
    
    /**
     * @dev 计算购买指定数量股票需要的 YOLO 代币数量
     * @param stockAmount 要购买的股票数量
     * @return yoloAmount 需要的 YOLO 代币数量
     */
    function calculateBuyPrice(uint256 stockAmount) public view returns (uint256 yoloAmount) {
        require(stockAmount > 0, "YoloStock: stock amount must be greater than zero");
        require(stockReserve > 0, "YoloStock: no liquidity available, please add liquidity first");
        require(stockAmount < stockReserve, "YoloStock: insufficient stock reserve");
        
        // 使用 AMM 公式计算价格: x * y = k
        uint256 newStockReserve = stockReserve - stockAmount;
        uint256 newYoloReserve = (yoloReserve * stockReserve) / newStockReserve;
        yoloAmount = newYoloReserve - yoloReserve;
    }
    
    /**
     * @dev 计算出售指定数量股票能获得的 YOLO 代币数量
     * @param stockAmount 要出售的股票数量
     * @return yoloAmount 能获得的 YOLO 代币数量
     */
    function calculateSellPrice(uint256 stockAmount) public view returns (uint256 yoloAmount) {
        require(stockAmount > 0, "YoloStock: stock amount must be greater than zero");
        require(yoloReserve > 0, "YoloStock: no liquidity available, please add liquidity first");
        
        // 使用 AMM 公式计算价格: x * y = k
        uint256 newStockReserve = stockReserve + stockAmount;
        uint256 newYoloReserve = (yoloReserve * stockReserve) / newStockReserve;
        yoloAmount = yoloReserve - newYoloReserve;
        
        require(yoloAmount > 0, "YoloStock: insufficient YOLO reserve");
    }
    
    /**
     * @dev 购买股票
     * @param stockAmount 要购买的股票数量
     * @param maxYoloAmount 最大愿意支付的 YOLO 代币数量 (滑点保护)
     */
    function buyStock(uint256 stockAmount, uint256 maxYoloAmount) external nonReentrant {
        require(stockAmount > 0, "YoloStock: stock amount must be greater than zero");
        
        uint256 yoloAmount = calculateBuyPrice(stockAmount);
        require(yoloAmount <= maxYoloAmount, "YoloStock: price exceeds maximum");
        
        // 转移 YOLO 代币
        IERC20(yoloTokenAddress).transferFrom(msg.sender, address(this), yoloAmount);
        
        // 更新储备
        stockReserve -= stockAmount;
        yoloReserve += yoloAmount;
        
        // 转移股票给买家
        _transfer(address(this), msg.sender, stockAmount);
        
        emit Trade(msg.sender, true, stockAmount, yoloAmount, getCurrentPrice());
    }
    
    /**
     * @dev 出售股票
     * @param stockAmount 要出售的股票数量
     * @param minYoloAmount 最小期望获得的 YOLO 代币数量 (滑点保护)
     */
    function sellStock(uint256 stockAmount, uint256 minYoloAmount) external nonReentrant {
        require(stockAmount > 0, "YoloStock: stock amount must be greater than zero");
        require(balanceOf(msg.sender) >= stockAmount, "YoloStock: insufficient stock balance");
        
        uint256 yoloAmount = calculateSellPrice(stockAmount);
        require(yoloAmount >= minYoloAmount, "YoloStock: price below minimum");
        
        // 转移股票到合约
        _transfer(msg.sender, address(this), stockAmount);
        
        // 更新储备
        stockReserve += stockAmount;
        yoloReserve -= yoloAmount;
        
        // 转移 YOLO 代币给卖家
        IERC20(yoloTokenAddress).transfer(msg.sender, yoloAmount);
        
        emit Trade(msg.sender, false, stockAmount, yoloAmount, getCurrentPrice());
    }
    
    /**
     * @dev 添加流动性 (只有所有者可以调用)
     * @param stockAmount 要添加的股票数量
     * @param yoloAmount 要添加的 YOLO 代币数量
     */
    function addLiquidity(uint256 stockAmount, uint256 yoloAmount) external onlyOwner {
        require(stockAmount > 0 && yoloAmount > 0, "YoloStock: amounts must be greater than zero");
        
        // 转移代币到合约
        _transfer(msg.sender, address(this), stockAmount);
        IERC20(yoloTokenAddress).transferFrom(msg.sender, address(this), yoloAmount);
        
        // 更新储备
        stockReserve += stockAmount;
        yoloReserve += yoloAmount;
        
        emit LiquidityAdded(msg.sender, stockAmount, yoloAmount);
    }
    
    /**
     * @dev 更新基础价格 (只有所有者可以调用)
     * @param _basePrice 新的基础价格
     */
    function updateBasePrice(uint256 _basePrice) external onlyOwner {
        require(_basePrice > 0, "YoloStock: base price must be greater than zero");
        uint256 oldPrice = basePrice;
        basePrice = _basePrice;
        emit PriceUpdated(oldPrice, _basePrice);
    }
    
    /**
     * @dev 获取交易信息
     * @return currentPrice 当前价格
     * @return _stockReserve 股票储备
     * @return _yoloReserve YOLO 代币储备
     */
    function getTradingInfo() external view returns (
        uint256 currentPrice,
        uint256 _stockReserve,
        uint256 _yoloReserve
    ) {
        return (
            getCurrentPrice(),
            stockReserve,
            yoloReserve
        );
    }
}