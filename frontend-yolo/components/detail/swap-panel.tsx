import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import GlassSurface from "@/components/react-bits/glass-surface";
import { StockService } from '@/service/stockService';
import { useAuth } from '@/contexts/AuthContext';

interface SwapPanelProps {
  stockId?: string;
  stockSymbol?: string;
  stockName?: string;
  stockImageUrl?: string;
}

const SwapPanel: React.FC<SwapPanelProps> = ({ 
  stockId, 
  stockSymbol = 'CHD', 
  stockName = 'Cohol',
  stockImageUrl 
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buy');
  const [payAmount, setPayAmount] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 用户数据
  const [userBalance, setUserBalance] = useState(0);
  const [userStockBalance, setUserStockBalance] = useState(0);
  
  // 市场数据
  const [currentPrice, setCurrentPrice] = useState(0);
  const [liquidityPool, setLiquidityPool] = useState<any>(null);
  const [priceImpact, setPriceImpact] = useState(0);

  // 加载用户数据和市场数据
  useEffect(() => {
    if (user && stockId) {
      loadUserData();
      loadMarketData();
    }
  }, [user, stockId]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // 获取用户YOLO余额
      const balance = await StockService.getUserBalance(user.id);
      setUserBalance(balance.balance);

      // 获取用户持股
      if (stockId) {
        const holding = await StockService.getUserStockHolding(user.id, stockId);
        setUserStockBalance(holding?.shares || 0);
      }
    } catch (error) {
      console.error('加载用户数据失败:', error);
    }
  };

  const loadMarketData = async () => {
    if (!stockId) return;
    
    try {
      // 获取当前市场价格
      const price = await StockService.getCurrentMarketPrice(stockId);
      setCurrentPrice(price);

      // 获取流动性池信息
      const pool = await StockService.getLiquidityPool(stockId);
      setLiquidityPool(pool);
    } catch (error) {
      console.error('加载市场数据失败:', error);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPayAmount('');
    setReceiveAmount('');
    setPriceImpact(0);
    setError(null);
  };

  const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || isNaN(Number(value))) {
      setPayAmount('');
      setReceiveAmount('');
      setPriceImpact(0);
      return;
    }

    const numericValue = parseFloat(value);
    setPayAmount(value);

    if (!liquidityPool) {
      // 如果没有流动性池，使用固定价格
      if (activeTab === 'buy') {
        setReceiveAmount((numericValue / currentPrice).toFixed(6));
      } else {
        setReceiveAmount((numericValue * currentPrice).toFixed(2));
      }
      setPriceImpact(0);
      return;
    }

    // 使用AMM计算
    if (activeTab === 'buy') {
      const result = StockService.calculateBuyPrice(
        liquidityPool.yolo_reserve,
        liquidityPool.stock_reserve,
        numericValue
      );
      setReceiveAmount(result.stockAmount.toFixed(6));
      setPriceImpact(result.priceImpact);
    } else {
      const result = StockService.calculateSellPrice(
        liquidityPool.yolo_reserve,
        liquidityPool.stock_reserve,
        numericValue
      );
      setReceiveAmount(result.yoloAmount.toFixed(2));
      setPriceImpact(result.priceImpact);
    }
  };

  const handleMaxClick = () => {
    if (activeTab === 'buy') {
      setPayAmount(userBalance.toString());
      handlePayAmountChange({ target: { value: userBalance.toString() } } as any);
    } else {
      setPayAmount(userStockBalance.toString());
      handlePayAmountChange({ target: { value: userStockBalance.toString() } } as any);
    }
  };

  const handleTrade = async () => {
    if (!user || !stockId || !payAmount || parseFloat(payAmount) <= 0) {
      setError('请输入有效的交易金额');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result;
      if (activeTab === 'buy') {
        result = await StockService.executeBuyTransaction(
          user.id,
          stockId,
          parseFloat(payAmount)
        );
      } else {
        result = await StockService.executeSellTransaction(
          user.id,
          stockId,
          parseFloat(payAmount)
        );
      }

      if (result.success) {
        // 交易成功，重新加载数据
        await loadUserData();
        await loadMarketData();
        setPayAmount('');
        setReceiveAmount('');
        setPriceImpact(0);
        
        // 可以添加成功提示
        alert(result.message);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('交易失败:', error);
      setError('交易执行失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toFixed(2);
  };

  const getPriceImpactColor = () => {
    // 对于买入：正价格影响（价格上涨）显示红色，负价格影响（价格下跌）显示绿色
    // 对于卖出：正价格影响（价格下跌）显示红色，负价格影响（价格上涨）显示绿色
    const isNegativeImpact = (activeTab === 'buy' && priceImpact > 0) || (activeTab === 'sell' && priceImpact > 0);
    
    if (Math.abs(priceImpact) < 1) return 'text-gray-400';
    if (Math.abs(priceImpact) < 3) return isNegativeImpact ? 'text-yellow-400' : 'text-yellow-400';
    return isNegativeImpact ? 'text-red-400' : 'text-green-400';
  };

  if (!user) {
    return (
      <GlassSurface className="rounded-xl h-full" brightness={120}>
        <div className="p-5 flex flex-col h-full items-center justify-center">
          <p className="text-gray-400 text-center">请先登录以进行交易</p>
        </div>
      </GlassSurface>
    );
  }
    
  return (
    <GlassSurface className="rounded-xl h-full" brightness={120}>
      <div className="p-5 flex flex-col h-full">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full flex flex-col flex-grow">
            <div className="flex justify-center items-center mb-6">
                <TabsList className="bg-black/20 p-1">
                    <TabsTrigger value="buy" className="data-[state=active]:bg-gray-700/80 rounded-md">Buy</TabsTrigger>
                    <TabsTrigger value="sell" className="data-[state=active]:bg-gray-700/80 rounded-md">Sell</TabsTrigger>
                </TabsList>
            </div>
            
            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            {/* 价格影响提示 */}
            {priceImpact !== 0 && Math.abs(priceImpact) > 1 && (
              <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg flex items-center gap-2">
                {/* 买入时：priceImpact > 0 表示价格上涨，卖出时：priceImpact > 0 表示价格下跌 */}
                {(activeTab === 'buy' && priceImpact > 0) || (activeTab === 'sell' && priceImpact < 0) ? 
                  <TrendingUp size={16} /> : <TrendingDown size={16} />}
                <span className={`text-sm ${getPriceImpactColor()}`}>
                  价格影响: {activeTab === 'buy' ? 
                    (priceImpact > 0 ? '+' : '') + priceImpact.toFixed(2) + '% (价格上涨)' :
                    (priceImpact > 0 ? '-' : '+') + Math.abs(priceImpact).toFixed(2) + '% (价格下跌)'
                  }
                </span>
              </div>
            )}
            
            <TabsContent value="buy" className="flex flex-col flex-grow">
                <div className="flex flex-col gap-3">
                    {/* Pay Section */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>You pay</span>
                            <div className="flex items-center gap-1.5">
                                <span>Balance: {formatNumber(userBalance)}</span>
                                <Button onClick={handleMaxClick} variant="link" className="text-blue-500 text-xs h-auto p-0">Use Max</Button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <Input 
                                type="text" 
                                placeholder="0" 
                                className="bg-transparent border-none text-3xl p-0 h-auto focus:ring-0 text-white font-light" 
                                value={payAmount}
                                onChange={handlePayAmountChange}
                                disabled={loading}
                            />
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="/img/YOLO_logo.png" alt="YOLO" />
                                    <AvatarFallback>YOLO</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base">YOLO</span>
                            </div>
                        </div>
                    </div>

                    {/* Receive Section */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>You receive</span>
                            {currentPrice > 0 && (
                              <span>Price: {currentPrice.toFixed(4)} YOLO</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <Input 
                                type="text" 
                                placeholder="0" 
                                className="bg-transparent border-none text-3xl p-0 h-auto focus:ring-0 text-white font-light" 
                                value={receiveAmount}
                                readOnly
                            />
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={stockImageUrl} alt={stockSymbol} />
                                    <AvatarFallback>{stockSymbol.slice(0, 3)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base">{stockSymbol}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button 
                      onClick={handleTrade}
                      disabled={loading || !payAmount || parseFloat(payAmount) <= 0}
                      className="w-full bg-gradient-to-br from-green-500 to-green-600 text-white py-6 text-lg font-bold rounded-lg disabled:opacity-50"
                    >
                        {loading ? '交易中...' : `Buy ${stockSymbol}`}
                    </Button>
                </div>
            </TabsContent>

            <TabsContent value="sell" className="flex flex-col flex-grow">
                <div className="flex flex-col gap-3">
                    {/* Pay Section */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>You sell</span>
                            <div className="flex items-center gap-1.5">
                                <span>Balance: {formatNumber(userStockBalance)}</span>
                                <Button onClick={handleMaxClick} variant="link" className="text-blue-500 text-xs h-auto p-0">Use Max</Button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <Input 
                                type="text" 
                                placeholder="0" 
                                className="bg-transparent border-none text-3xl p-0 h-auto focus:ring-0 text-white font-light" 
                                value={payAmount}
                                onChange={handlePayAmountChange}
                                disabled={loading}
                            />
                             <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={stockImageUrl} alt={stockSymbol} />
                                    <AvatarFallback>{stockSymbol.slice(0, 3)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base">{stockSymbol}</span>
                            </div>
                        </div>
                    </div>

                    {/* Receive Section */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>You receive</span>
                            {currentPrice > 0 && (
                              <span>Price: {currentPrice.toFixed(4)} YOLO</span>
                            )}
                        </div>
                        <div className="flex justify-between items-center">
                            <Input 
                                type="text" 
                                placeholder="0" 
                                className="bg-transparent border-none text-3xl p-0 h-auto focus:ring-0 text-white font-light" 
                                value={receiveAmount}
                                readOnly
                            />
                            <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="/img/YOLO_logo.png" alt="YOLO" />
                                    <AvatarFallback>YOLO</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base">YOLO</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button 
                      onClick={handleTrade}
                      disabled={loading || !payAmount || parseFloat(payAmount) <= 0 || userStockBalance <= 0}
                      className="w-full bg-gradient-to-br from-red-500 to-red-600 text-white py-6 text-lg font-bold rounded-lg disabled:opacity-50"
                    >
                        {loading ? '交易中...' : `Sell ${stockSymbol}`}
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
    </div>
    </GlassSurface>
  );
};

export default SwapPanel;


