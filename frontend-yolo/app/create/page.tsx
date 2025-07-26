'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Stepper, { Step } from './components/Stepper';
import CardSwap, { Card } from './components/CardSwap';
import Beams from './components/Beams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StockService } from '@/service/stockService';
import { StockFormData, UserBalance } from './types';
import { cn } from '@/lib/utils';

const center = 'flex items-center justify-center';

export default function CreatePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  
  // 表单数据
  const [formData, setFormData] = useState<StockFormData>({
    name: '',
    symbol: '',
    story: '',
    supply: 1000,
    price: 0.1
  });

  // 用户余额信息
  const [userBalance, setUserBalance] = useState<UserBalance>({
    balance: 8000,
    maxInvestment: 1600 // 20% of 8000
  });

  // 状态管理
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolExists, setSymbolExists] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // 获取用户余额
  useEffect(() => {
    if (user) {
      StockService.getUserBalance(user.id)
        .then(setUserBalance)
        .catch(console.error);
    }
  }, [user]);

  // 检查交易代号是否存在
  const checkSymbol = async (symbol: string) => {
    if (symbol.length >= 2) {
      try {
        const exists = await StockService.checkSymbolExists(symbol);
        setSymbolExists(exists);
      } catch (error) {
        console.error('检查交易代号失败:', error);
      }
    } else {
      setSymbolExists(false);
    }
  };

  // 计算投资相关数据
  const totalStockValue = formData.price * formData.supply; // 股票总价值
  const userShares = formData.supply * 0.35; // 用户获得35%股份，支持小数
  const actualInvestment = formData.price * userShares; // 用户实际支付金额
  const investmentPercentage = (actualInvestment / userBalance.balance) * 100;

  // 表单验证
  const validateStep1 = () => {
    return formData.name.trim().length >= 2 && 
           formData.symbol.trim().length >= 2 && 
           !symbolExists;
  };

  const validateStep2 = () => {
      return formData.supply > 0 && 
            formData.price > 0 && 
            actualInvestment <= userBalance.balance; // 只检查余额是否足够
    };

  // 处理创建
  const handleCreate = async () => {
    if (!user) return;

    setIsCreating(true);
    setError(null);

    try {
      // 使用默认头像
      const imageUrl = StockService.generateDefaultAvatar(formData.name);

      // 创建股票
      await StockService.createStock({
        name: formData.name,
        symbol: formData.symbol,
        image_url: imageUrl,
        supply: formData.supply,
        price: formData.price
      }, user.id);

      // 显示成功提示
      setShowSuccess(true);
      
      // 2秒后跳转到探索页面
      setTimeout(() => {
        router.push('/explore');
      }, 2000);
    } catch (error) {
      console.error('创建失败:', error);
      setError(error instanceof Error ? error.message : '创建失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-white">加载中...</div>
    </div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen text-white">
      {/* 主要内容区域 - 响应式布局 */}
      <div className="min-h-screen flex flex-col xl:flex-row">
        
        {/* 左侧 Stepper - 响应式 */}
        <div className={cn(center,'flex-1 xl:flex-none xl:w-[40%] relative overflow-hidden') }>
          {/* 左侧 3D 背景 */}
          <div className="absolute inset-0 z-0">
            <Beams beamWidth={1.2} beamHeight={18} beamNumber={8} lightColor="#ffffff" speed={1.2} noiseIntensity={1.2} scale={0.22} rotation={0} />
          </div>

          {/* Stepper 前景 */}
          <div className="relative z-10 w-full max-w-xl p-8 lg:p-14">
            <Stepper
              initialStep={1}
              onStepChange={(step) => console.log(step)}
              onFinalStepCompleted={handleCreate}
              backButtonText="上一步"
              nextButtonText="下一步"
            >
              {/* Step 1: 基本信息 */}
              <Step>
                <h2 className="text-2xl font-extrabold mb-6">1. 基本信息</h2>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white mb-2 block">股票名称</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="例如：YOLO科技"
                      className="bg-background text-foreground"
                    />
                  </div>

                  <div>
                    <Label htmlFor="symbol" className="text-white mb-2 block">交易代号</Label>
                    <Input
                      id="symbol"
                      value={formData.symbol}
                      onChange={(e) => {
                        const value = e.target.value.toUpperCase();
                        setFormData(prev => ({ ...prev, symbol: value }));
                        checkSymbol(value);
                      }}
                      placeholder="例如：YOLO"
                      className="bg-background text-foreground"
                      maxLength={10}
                    />
                    {symbolExists && (
                      <p className="text-red-400 text-sm mt-1">该交易代号已存在</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="story" className="text-white mb-2 block">项目描述</Label>
                    <textarea
                      id="story"
                      value={formData.story}
                      onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                      rows={4}
                      placeholder="描述你的项目愿景和价值..."
                      className="w-full px-3 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    />
                    <p className="text-sm text-gray-400 mt-1">{formData.story.length}/500</p>
                  </div>
                </div>

                {!validateStep1() && (
                  <p className="text-yellow-400 text-sm mt-4">
                    请填写完整信息且确保交易代号可用
                  </p>
                )}
              </Step>

              {/* Step 2: 发行量和流动性 */}
              <Step>
                <h2 className="text-2xl font-extrabold mb-6">2. 发行设置</h2>
                
                <div className="space-y-6">
                  {/* 用户余额显示 */}
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h3 className="text-blue-400 font-medium mb-2">你的 YOLO 币余额</h3>
                    <p className="text-2xl font-bold text-white">{userBalance.balance.toLocaleString()} YOLO</p>
                    <p className="text-sm text-gray-400">建议投资额度：{(userBalance.balance * 0.1).toLocaleString()} - {userBalance.maxInvestment.toLocaleString()} YOLO (10%-20%)</p>
                  </div>

                  <div>
                    <Label htmlFor="supply" className="text-white mb-2 block">发行数量</Label>
                    <Input
                      id="supply"
                      type="number"
                      step="0.00000001"
                      value={formData.supply}
                      onChange={(e) => setFormData(prev => ({ ...prev, supply: Number(e.target.value) }))}
                      min="0.00000001"
                      max="1000000"
                      className="bg-background text-foreground"
                    />
                    <p className="text-sm text-gray-400 mt-1">建议发行量：1,000 - 100,000 股（支持小数精度）</p>
                  </div>

                  <div>
                    <Label htmlFor="price" className="text-white mb-2 block">单价 (YOLO币)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                      min="0.01"
                      max="100"
                      className="bg-background text-foreground"
                    />
                    <p className="text-sm text-gray-400 mt-1">建议单价：0.1 - 10 YOLO</p>
                  </div>

                  {/* 投资计算 */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">投资计算</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">股票总价值：</span>
                        <span className="text-white">{totalStockValue.toLocaleString()} YOLO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">你将获得：</span>
                        <span className="text-white">{userShares.toLocaleString()} 股 (35%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">实际支付：</span>
                        <span className="text-white">{actualInvestment.toLocaleString()} YOLO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">占余额比例：</span>
                        <span className="text-white">{investmentPercentage.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">剩余余额：</span>
                        <span className="text-white">{(userBalance.balance - actualInvestment).toLocaleString()} YOLO</span>
                      </div>
                    </div>
                  </div>

                  {!validateStep2() && (
                      <p className="text-red-400 text-sm">
                        {actualInvestment > userBalance.balance 
                          ? `余额不足。需要 ${actualInvestment.toLocaleString()} YOLO，当前余额 ${userBalance.balance.toLocaleString()} YOLO`
                          : '请设置有效的发行量和单价'
                        }
                      </p>
                    )}
                </div>
              </Step>

              {/* Step 3: 完成创建 */}
              <Step>
                <h2 className="text-2xl font-extrabold mb-6">3. 完成创建</h2>
                
                <div className="space-y-6">
                  {/* 创建摘要 */}
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                    <h3 className="text-primary font-medium mb-3">创建摘要</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">股票名称：</span>
                        <span className="text-white">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">交易代号：</span>
                        <span className="text-white">{formData.symbol}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">发行数量：</span>
                        <span className="text-white">{formData.supply.toLocaleString()} 股</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">单价：</span>
                        <span className="text-white">{formData.price} YOLO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">股票总价值：</span>
                        <span className="text-white">{totalStockValue.toLocaleString()} YOLO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">你将获得：</span>
                        <span className="text-white">{userShares.toLocaleString()} 股 (35%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">实际支付：</span>
                        <span className="text-white">{actualInvestment.toLocaleString()} YOLO</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">流动性池：</span>
                        <span className="text-white">{(formData.supply * 0.65).toLocaleString()} 股 (65%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">项目图片：</span>
                        <span className="text-white">系统自动生成</span>
                      </div>
                    </div>
                  </div>

                  {showSuccess && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6 text-center">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                      <h3 className="text-green-400 font-bold text-xl mb-2">创建成功！</h3>
                      <p className="text-green-300 mb-4">
                        恭喜！你的股票 <span className="font-semibold">{formData.symbol}</span> 已成功创建
                      </p>
                      <p className="text-sm text-gray-400">
                        正在跳转到探索页面...
                      </p>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <p className="text-red-400">{error}</p>
                    </div>
                  )}

                  {isCreating && !showSuccess && (
                    <div className="text-center">
                      <p className="text-blue-400">正在创建中...</p>
                    </div>
                  )}
                </div>
              </Step>
            </Stepper>
          </div>
        </div>

        {/* 右侧 CardSwap + 3D 背景 - 放大和优化 */}
        <div className={cn(center,'flex-1 xl:flex-none xl:w-[60%] relative min-h-[600px] xl:min-h-screen overflow-hidden')}>
          {/* 3D Beams 背景 */}
          <div className="absolute inset-0 z-0">
            <Beams
              beamWidth={2}
              beamHeight={15}
              beamNumber={12}
              lightColor="#ffffff"
              speed={2}
              noiseIntensity={1.75}
              scale={0.2}
              rotation={0}
            />
          </div>
          
          {/* CardSwap 前景 */}
          <div className={cn(center,'relative z-10 w-full h-full p-8 -translate-y-12') }>
            <CardSwap 
              cardDistance={120} 
              verticalDistance={80} 
              delay={4000} 
              pauseOnHover={true}
              width={620}
              height={380}
              skewAmount={4}
              easing="elastic"
            >
              <Card>
                <div className="flex flex-col h-full items-start gap-4">
                  <h3 className="text-3xl font-extrabold text-white">社交货币上链</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    将你的影响力资产化，互动即收益，让社交价值得到真实记录与流转。
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col h-full items-start gap-4">
                  <h3 className="text-3xl font-extrabold text-white">价值信任背书</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    区块链不可篡改的信用体系，为你的每次贡献提供权威证明，建立可信社交关系。
                  </p>
                </div>
              </Card>
              <Card>
                <div className="flex flex-col h-full items-start gap-4">
                  <h3 className="text-3xl font-extrabold text-white">个人成长增值</h3>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    参与、学习、分享，成长路径透明可见；贡献越多，潜在收益与成长价值越大。
                  </p>
                </div>
              </Card>
            </CardSwap>
          </div>
        </div>

      </div>
    </div>
  );
}