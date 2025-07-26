"use client"
import { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Edit2, Save, X, Home, PlusCircle, User, LogOut, 
  TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Wallet, BarChart3, Star, BadgeCheck, Eye
} from "lucide-react";
import GlassSurface from "@/components/react-bits/glass-surface";
import TextPressure from "@/components/react-bits/text-pressure";
import Orb from "@/components/react-bits/orb";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StockService } from "@/service/stockService";
import { UserProfileService } from "@/service/userProfileService";

// 定义数据接口
interface UserHolding {
  id: string;
  shares: number;
  average_price: number;
  total_investment: number;
  stock: {
    id: string;
    name: string;
    symbol: string;
    image_url: string;
    price: number;
    supply: number;
    owners: number;
  };
  current_value: number;
  profit_loss: number;
  profit_loss_percentage: number;
}

interface UserStock {
  id: string;
  name: string;
  symbol: string;
  image_url: string;
  price: number;
  supply: number;
  owners: number;
  created_at: string;
  market_cap: number;
  total_volume: number;
}

export default function Profile() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  
  // 个人信息状态
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [tempNickname, setTempNickname] = useState(nickname);
  const [tempBio, setTempBio] = useState(bio);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // 数据状态
  const [userBalance, setUserBalance] = useState(8000);
  const [holdings, setHoldings] = useState<UserHolding[]>([]);
  const [myStocks, setMyStocks] = useState<UserStock[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // 加载用户数据
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // 获取用户余额
      const balance = await StockService.getUserBalance(user.id);
      setUserBalance(balance.balance);

      // 获取用户持仓
      const userHoldings = await StockService.getUserHoldings(user.id);
      const processedHoldings = userHoldings.map((holding: any) => {
        const currentValue = holding.shares * holding.stock.price;
        const profitLoss = currentValue - holding.total_investment;
        const profitLossPercentage = holding.total_investment > 0 
          ? (profitLoss / holding.total_investment) * 100 
          : 0;
        
        return {
          ...holding,
          current_value: currentValue,
          profit_loss: profitLoss,
          profit_loss_percentage: profitLossPercentage
        };
      });
      setHoldings(processedHoldings);

      // 获取用户创建的股票
      const createdStocks = await StockService.getUserStocks(user.id);
      const processedStocks = createdStocks.map((stock: any) => ({
        ...stock,
        market_cap: stock.price * stock.supply,
        total_volume: stock.price * stock.supply * 0.1 // 模拟交易量
      }));
      setMyStocks(processedStocks);

      // 获取用户资料
      const profile = await UserProfileService.getUserProfile(user.id);
      if (profile) {
        setBio(profile.description || "");
        setTempBio(profile.description || "");
        setUserProfile(profile);
      } else {
        setBio("");
        setTempBio("");
      }
      
      // 设置用户昵称（从 user metadata 或 email 获取）
      const displayName = user.user_metadata?.full_name || 
                         user.user_metadata?.name || 
                         user.email?.split('@')[0] || 
                         "用户";
      setNickname(displayName);
      setTempNickname(displayName);
    } catch (error) {
      console.error('加载用户数据失败:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#141416]">
        <div className="text-gray-300">Loading...</div>
      </div>
    );
  }

  const handleEdit = () => {
    setTempNickname(nickname);
    setTempBio(bio);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (user) {
      try {
        await UserProfileService.upsertUserProfile(user.id, {
          description: tempBio
        });
        setNickname(tempNickname);
        setBio(tempBio);
        setIsEditing(false);
      } catch (error) {
        console.error('保存用户资料失败:', error);
      }
    }
  };

  const handleCancel = () => {
    setTempNickname(nickname);
    setTempBio(bio);
    setIsEditing(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M YOLO`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K YOLO`;
    }
    return `${value.toFixed(2)} YOLO`;
  };

  const formatSupply = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    return value.toFixed(8).replace(/\.?0+$/, '');
  };

  // 计算总持仓价值和盈亏
  const totalHoldingValue = holdings.reduce((sum, holding) => sum + holding.current_value, 0);
  const totalInvestment = holdings.reduce((sum, holding) => sum + holding.total_investment, 0);
  const totalProfitLoss = totalHoldingValue - totalInvestment;
  const totalProfitLossPercentage = totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#141416] text-gray-300 relative">
      {/* Orb 背景 */}
      <div className="fixed inset-0 z-0 opacity-30">
        <Orb 
          hue={240} 
          hoverIntensity={0.3}
          rotateOnHover={true}
          forceHoverState={false}
        />
      </div>
      
      {/* 内容层 */}
      <div className="relative z-10 pointer-events-auto">{/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/20 backdrop-blur-md border-white/20">
            <TabsTrigger value="profile" className="data-[state=active]:bg-white/20">
              <User className="w-4 h-4 mr-2" />
              个人信息
            </TabsTrigger>
            <TabsTrigger value="holdings" className="data-[state=active]:bg-white/20">
              <Wallet className="w-4 h-4 mr-2" />
              我的持仓
            </TabsTrigger>
            <TabsTrigger value="stocks" className="data-[state=active]:bg-white/20">
              <BarChart3 className="w-4 h-4 mr-2" />
              我的股票
            </TabsTrigger>
          </TabsList>

          {/* 个人信息标签页 */}
          <TabsContent value="profile" className="mt-6">
            <div className="flex justify-center">
              <Card className="w-full max-w-md bg-black/20 backdrop-blur-md border-white/20 p-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* 头像 */}
                  <div className="relative">
                    <Avatar className="size-32 border-4 border-gray-600">
                      <AvatarImage src={user?.user_metadata?.avatar_url || user?.user_metadata?.picture || "/img/sam.png"} />
                      <AvatarFallback className="text-2xl bg-gray-700">
                        {nickname ? nickname.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* 用户信息 */}
                  <div className="w-full space-y-4">
                    {/* 昵称 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">昵称</label>
                      {isEditing ? (
                        <Input
                          value={tempNickname}
                          onChange={(e) => setTempNickname(e.target.value)}
                          className="bg-transparent border-gray-600 focus:border-blue-500 text-center"
                          placeholder="输入昵称"
                        />
                      ) : (
                        <div className="text-xl font-bold text-center text-white">
                          {nickname}
                        </div>
                      )}
                    </div>

                    {/* 邮箱 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">邮箱</label>
                      <div className="text-center text-gray-300">
                        {user?.email || "未登录"}
                      </div>
                    </div>

                    {/* 个人简介 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">个人简介</label>
                      {isEditing ? (
                        <Input
                          value={tempBio}
                          onChange={(e) => setTempBio(e.target.value)}
                          className="bg-transparent border-gray-600 focus:border-blue-500 text-center"
                          placeholder="输入个人简介"
                        />
                      ) : (
                        <div className="text-center text-gray-300">
                          {bio}
                        </div>
                      )}
                    </div>

                    {/* 余额显示 */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-400">余额</label>
                      <div className="text-center text-green-400 font-semibold">
                        {formatCurrency(userBalance)}
                      </div>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="w-full space-y-3">
                    {isEditing ? (
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSave}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Save size={16} className="mr-2" />
                          保存
                        </Button>
                        <Button
                          onClick={handleCancel}
                          variant="outline"
                          className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          <X size={16} className="mr-2" />
                          取消
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={handleEdit}
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                      >
                        <Edit2 size={16} className="mr-2" />
                        编辑资料
                      </Button>
                    )}

                    <Button
                      onClick={handleSignOut}
                      variant="destructive"
                      className="w-full"
                    >
                      <LogOut size={16} className="mr-2" />
                      退出登录
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* 我的持仓标签页 */}
          <TabsContent value="holdings" className="mt-6">
            <div className="space-y-6">
              {/* 持仓概览 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-black/20 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">总持仓价值</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(totalHoldingValue)}</p>
                    </div>
                    <Wallet className="h-8 w-8 text-blue-400" />
                  </div>
                </Card>
                
                <Card className="bg-black/20 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">总投资金额</p>
                      <p className="text-2xl font-bold text-white">{formatCurrency(totalInvestment)}</p>
                    </div>
                    <BarChart3 className="h-8 w-8 text-purple-400" />
                  </div>
                </Card>
                
                <Card className="bg-black/20 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">总盈亏</p>
                      <p className={`text-2xl font-bold ${totalProfitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss)}
                      </p>
                    </div>
                    {totalProfitLoss >= 0 ? 
                      <TrendingUp className="h-8 w-8 text-green-400" /> : 
                      <TrendingDown className="h-8 w-8 text-red-400" />
                    }
                  </div>
                </Card>
                
                <Card className="bg-black/20 backdrop-blur-md border-white/20 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">盈亏比例</p>
                      <p className={`text-2xl font-bold ${totalProfitLossPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {totalProfitLossPercentage >= 0 ? '+' : ''}{totalProfitLossPercentage.toFixed(2)}%
                      </p>
                    </div>
                    {totalProfitLossPercentage >= 0 ? 
                      <ArrowUpRight className="h-8 w-8 text-green-400" /> : 
                      <ArrowDownRight className="h-8 w-8 text-red-400" />
                    }
                  </div>
                </Card>
              </div>

              {/* 持仓列表 */}
              <Card className="bg-black/20 backdrop-blur-md border-white/20">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">持仓详情</h3>
                  {loadingData ? (
                    <div className="text-center py-8 text-gray-400">加载中...</div>
                  ) : holdings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="text-lg mb-2">暂无持仓</div>
                      <div className="text-sm">去探索页面发现优质股票</div>
                      <Link href="/explore">
                        <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                          去探索
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {holdings.map((holding) => (
                        <div 
                          key={holding.id} 
                          className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-lg hover:bg-white/20 cursor-pointer transition-colors"
                          onClick={() => router.push(`/explore/${holding.stock.symbol}`)}
                        >
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={holding.stock.image_url || "/img/sam.png"} />
                              <AvatarFallback>{holding.stock.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-white">{holding.stock.name}</h4>
                                <BadgeCheck className="h-4 w-4 text-blue-400" />
                              </div>
                              <p className="text-sm text-gray-400">{holding.stock.symbol}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="flex items-center space-x-4">
                              <div>
                                <p className="text-sm text-gray-400">持有数量</p>
                                <p className="font-semibold text-white">{formatSupply(holding.shares)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">当前价值</p>
                                <p className="font-semibold text-white">{formatCurrency(holding.current_value)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-gray-400">盈亏</p>
                                <p className={`font-semibold ${holding.profit_loss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {holding.profit_loss >= 0 ? '+' : ''}{formatCurrency(holding.profit_loss)}
                                  <span className="text-xs ml-1">
                                    ({holding.profit_loss_percentage >= 0 ? '+' : ''}{holding.profit_loss_percentage.toFixed(2)}%)
                                  </span>
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/explore/${holding.stock.symbol}`);
                                }}
                              >
                                交易
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* 我的股票标签页 */}
          <TabsContent value="stocks" className="mt-6">
            <Card className="bg-black/20 backdrop-blur-md border-white/20">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-white">我创建的股票</h3>
                  <Link href="/create">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      创建新股票
                    </Button>
                  </Link>
                </div>
                
                {loadingData ? (
                  <div className="text-center py-8 text-gray-400">加载中...</div>
                ) : myStocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-lg mb-2">还没有创建任何股票</div>
                    <div className="text-sm">创建你的第一个股票，开始你的投资之旅</div>
                    <Link href="/create">
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        创建股票
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myStocks.map((stock) => (
                      <Card 
                        key={stock.id} 
                        className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 cursor-pointer transition-colors"
                        onClick={() => router.push(`/explore/${stock.symbol}`)}
                      >
                        <div className="p-6">
                          <div className="flex items-center space-x-4 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={stock.image_url || "/img/sam.png"} />
                              <AvatarFallback>{stock.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold text-white">{stock.name}</h4>
                                <BadgeCheck className="h-4 w-4 text-blue-400" />
                              </div>
                              <p className="text-sm text-gray-400">{stock.symbol}</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">当前价格</span>
                              <span className="font-semibold text-white">{formatCurrency(stock.price)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">市值</span>
                              <span className="font-semibold text-white">{formatCurrency(stock.market_cap)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">持有人数</span>
                              <span className="font-semibold text-white">{stock.owners}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-400">发行量</span>
                              <span className="font-semibold text-white">{formatSupply(stock.supply)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <Button 
                              className="w-full bg-blue-600 hover:bg-blue-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/explore/${stock.symbol}`);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>

      {/* 固定在右下角的导航按钮 */}
      <div className="fixed bottom-6 right-6 z-50">
        <GlassSurface 
          className="w-auto h-16 rounded-full bg-black/20 backdrop-blur-md border-white/20"
          brightness={150}
        >
          <div className="flex flex-row items-center justify-evenly gap-4 px-6 text-white">
            <Link href="/" className="flex flex-row items-center gap-2 px-3 hover:bg-white/20 rounded-full transition-colors">
              <Home size={18} />
              <span>Intro</span>
            </Link>
            <Link href="/create" className="flex flex-row items-center gap-2 px-3 hover:bg-white/20 rounded-full transition-colors">
              <PlusCircle size={18} />
              <span>Create</span>
            </Link>
            <Link href="/profile" className="flex flex-row items-center gap-2 px-3 bg-white/30 rounded-full">
              <User size={18} />
              <span>Me</span>
            </Link>
          </div>
        </GlassSurface>
      </div>
    </div>
  );
}