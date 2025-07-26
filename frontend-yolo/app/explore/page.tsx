"use client"
import { CollectionTable } from "@/components/explore/collection-table";
import Timeline from "@/components/explore/timeline";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Home, PlusCircle, User, LogOut } from "lucide-react";
import GlassSurface from "@/components/react-bits/glass-surface";
import TextPressure from "@/components/react-bits/text-pressure";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { StockService } from "@/service/stockService";
import { Stock } from "@/app/create/types";

// 定义股票数据接口，匹配 CollectionTable 的需求
interface StockData {
  id: string;
  name: string;
  symbol: string;
  image_url?: string;
  price: number;
  supply: number; // 流通量，支持小数精度（DECIMAL(20,8)）
  owners: number;
  created_at: string;
  user_id: string;
  // 计算字段
  marketCap: number;
  dailyChange: number;
  dailyVolume: number;
  status: "idea" | "prototype" | "demo" | "fundraising";
  chartData: { value: number }[];
}

// 定义用户余额接口
interface UserBalance {
  balance: number;
  maxInvestment: number;
}

export default function DiscoverPage() {
  const { user, loading, signOut } = useAuth()
  
  // 状态管理
  const [stocks, setStocks] = useState<StockData[]>([])
  const [filteredStocks, setFilteredStocks] = useState<StockData[]>([])
  const [userBalance, setUserBalance] = useState<UserBalance>({ balance: 8000, maxInvestment: 8000 })
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("top")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 添加调试信息
  console.log('DiscoverPage - loading:', loading, 'user:', user)

  // 获取所有股票数据并计算真实市场数据
  const fetchStocks = useCallback(async () => {
    try {
      setIsLoadingData(true);
      setError(null);
      
      // 获取基础股票数据
      const stockList = await StockService.getAllStocks();
      
      // 获取增强的股票数据（包含真实的市场数据）
      const enhancedStocks = await StockService.getEnhancedStockData(stockList);
      
      setStocks(enhancedStocks);
      setFilteredStocks(enhancedStocks);
    } catch (error) {
      console.error('获取股票数据失败:', error);
      setError('获取股票数据失败，请稍后重试');
    } finally {
      setIsLoadingData(false);
    }
  }, [])

  // 获取用户余额
  const fetchUserBalance = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const balance = await StockService.getUserBalance(user.id);
      setUserBalance(balance);
    } catch (error) {
      console.error('获取用户余额失败:', error);
      // 使用默认余额，不显示错误
    }
  }, [user?.id])

  // 搜索功能
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredStocks(stocks);
      return;
    }
    
    const filtered = stocks.filter(stock => 
      stock.name.toLowerCase().includes(query.toLowerCase()) ||
      stock.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredStocks(filtered);
  }, [stocks])

  // 榜单筛选
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
    
    let sortedStocks = [...stocks];
    
    switch (tab) {
      case "top":
        // 按市值排序
        sortedStocks.sort((a, b) => b.marketCap - a.marketCap);
        break;
      case "trending":
        // 按日变化率排序
        sortedStocks.sort((a, b) => b.dailyChange - a.dailyChange);
        break;
      case "watchlist":
        // 如果用户已登录，显示用户创建的股票
        if (user?.id) {
          sortedStocks = sortedStocks.filter(stock => stock.user_id === user.id);
        } else {
          sortedStocks = [];
        }
        break;
      default:
        break;
    }
    
    setFilteredStocks(sortedStocks);
  }, [stocks, user?.id])

  // 初始化数据
  useEffect(() => {
    if (!loading) {
      fetchStocks();
      if (user?.id) {
        fetchUserBalance();
      }
    }
  }, [loading, user?.id, fetchStocks, fetchUserBalance])

  // 搜索查询变化时重新筛选
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch])

  // 定期刷新数据（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && user?.id) {
        fetchUserBalance();
        // 可以选择性地刷新股票数据
        // fetchStocks();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, user?.id, fetchUserBalance])

  // 如果正在加载认证状态，显示加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141416]">
        <div className="text-gray-300">Loading...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // 获取显示的用户信息
  const getUserDisplayInfo = () => {
    if (user?.email) {
      return user.email
    }
    return "加载中..."
  }

  // 格式化余额显示
  const formatBalance = (balance: number) => {
    return balance.toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 2 
    });
  }

  return (
    <div className="flex flex-col h-auto w-screen bg-[#141416] text-gray-300">
      <div className="w-full h-42 flex items-center justify-center px-24">
        <TextPressure 
          text="You Only Live Once" 
          scale={false}
          italic={true}
        />
      </div>

    <div className="flex font-sans h-full">

      {/* 左侧 */}
      <Timeline />

      {/* 右侧 */}
      <div className="flex-1 flex flex-col p-6 py-12">
        <header className="flex justify-between items-center mb-6">
          <div className="flex items-center justify-between gap-4 w-full">
            {/* 搜索框 */}
            {/* <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20}/>
              <Input 
                placeholder="Search stocks..." 
                className="w-80 pl-10 bg-transparent border-gray-700 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div> */}

            {/* 榜单选择 */}
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList>
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="trending">Trending</TabsTrigger>
                <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 用户信息和余额 */}
            <div className="flex items-center gap-4" >
              <div className="flex items-center border border-gray-700 rounded-full px-4 py-2">
                <span className="text-gray-500">
                  My Balance: {formatBalance(userBalance.balance)} YOLO
                </span>
              </div>
              
              {/* 用户邮箱和登出按钮 */}
              <div className="flex items-center gap-2 border border-gray-700 rounded-full px-4 py-2">
                <Link href="/profile" className="text-gray-300 text-sm hover:text-white">
                  {getUserDisplayInfo()}
                </Link>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white p-1 h-auto"
                >
                  <LogOut size={16} />
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        {/* 错误提示 */}
        {error && (
          <div className="mb-4 p-4 bg-red-900/20 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}
        
        {/* 数据加载状态 */}
        {isLoadingData ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-400">Loading stocks...</div>
          </div>
        ) : (
          <CollectionTable stocks={filteredStocks} />
        )}
      </div>
      
      {/* 固定在右下角的按钮 */}
      <div className="fixed bottom-6 right-6 z-50 bg-gray-200 rounded-full text-black">
        <GlassSurface 
          className="w-auto h-16 rounded-full"

        >
          <div className="flex flex-row items-center justify-evenly gap-4 px-6">
            <Link href="/" className="flex flex-row items-center gap-2 px-3">
              <Home size={18} />
              <span>Intro</span>
            </Link>
            <Link href="/create" className="flex flex-row items-center gap-2 px-3">
              <PlusCircle size={18} />
              <span>Create</span>
            </Link>
            <Link href="/profile" className="flex flex-row items-center gap-2 px-3">
              <User size={18} />
              <span>Me</span>
            </Link>
          </div>
        </GlassSurface>
      </div>
    </div>
    </div>
  );
}
