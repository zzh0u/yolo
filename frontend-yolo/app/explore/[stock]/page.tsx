"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import StockHeader from "@/components/detail/product-header";
import StatsBar from "@/components/detail/stats-bar";
import SwapPanel from "@/components/detail/swap-panel";
import TradingViewChart from "@/components/detail/trading-view-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/detail/overview-tab";
import ActivityTab from "@/components/detail/activity-tab";
import ContactTab from "@/components/detail/contact-tab";
import GlassSurface from "@/components/react-bits/glass-surface";
import Link from "next/link";
import { Home, Compass, PlusCircle, User, Loader2 } from "lucide-react";
import { StockService } from "@/service/stockService";
import { useAuth } from "@/contexts/AuthContext";

export default function ProductPage() {
    const { stock } = useParams();
    const { user } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [stockData, setStockData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 加载股票数据
    useEffect(() => {
        if (stock) {
            loadStockData();
        }
    }, [stock]);

    const loadStockData = async () => {
         try {
             setLoading(true);
             setError(null);
             
             // 获取单个股票的增强数据
             const data = await StockService.getSingleStockEnhancedData(stock as string);
             
             if (!data) {
                 setError('股票不存在');
                 return;
             }
             
             setStockData(data);
         } catch (error) {
             console.error('加载股票数据失败:', error);
             setError('加载股票数据失败');
         } finally {
             setLoading(false);
         }
     };

    // 格式化数字显示
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toFixed(2);
    };

    // 格式化百分比
    const formatPercentage = (num: number) => {
        const sign = num >= 0 ? '+' : '';
        return `${sign}${num.toFixed(1)}%`;
    };

    // 加载中状态
    if (loading) {
        return (
            <div className="flex min-h-screen bg-zinc-950 text-white items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <p className="text-gray-400">加载股票数据中...</p>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error || !stockData) {
        return (
            <div className="flex min-h-screen bg-zinc-950 text-white items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <p className="text-red-400">{error || '股票数据不存在'}</p>
                    <Link href="/discover" className="text-blue-400 hover:underline">
                        返回发现页面
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white">
            {/* This is a placeholder for the left sidebar from the image */}
            <div className="w-16 bg-black/30 p-2 hidden md:block"></div>

            <div className="flex-grow flex flex-col p-4 md:p-6 lg:p-8">
                <div className="flex flex-col xl:flex-row flex-grow gap-8">
                    <main className="flex-grow flex flex-col gap-6">
                        <StockHeader
                            name={stockData.name}
                            symbol={stockData.symbol}
                            price={stockData.current_price?.toFixed(4) || '0.0000'}
                            change={formatPercentage(stockData.daily_change || 0)}
                        />
                        <TradingViewChart 
                            stockId={stockData.id}
                            onTimeClick={setSelectedDate} 
                        />
                         <StatsBar
                             chain="YOLO"
                             marketCap={`$${formatNumber(stockData.market_cap || 0)}`}
                             volume={`$${formatNumber(stockData.daily_volume || 0)}`}
                             priceChange={formatPercentage(stockData.daily_change || 0)}
                             marketCapChange={formatPercentage(stockData.daily_change || 0)}
                         />
                    </main>
                    <aside className="w-full xl:w-1/3 xl:max-w-md">
                        <SwapPanel 
                            stockId={stockData.id}
                            stockSymbol={stockData.symbol}
                            stockName={stockData.name}
                            stockImageUrl={stockData.image_url}
                        />
                    </aside>
                </div>

                <div className="mt-12 min-h-screen">
                    <Tabs defaultValue="activity" className="w-full">
                        <TabsList className="border-b border-zinc-800 rounded-none p-0 h-auto bg-transparent justify-start gap-6">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-1 py-3 text-zinc-400">概况</TabsTrigger>
                            <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-1 py-3 text-zinc-400">动态</TabsTrigger>
                            <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-1 py-3 text-zinc-400">联系</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="mt-6">
                             <OverviewTab />
                         </TabsContent>
                         <TabsContent value="activity" className="mt-6">
                             <ActivityTab highlightDate={selectedDate || undefined} />
                         </TabsContent>
                         <TabsContent value="contact" className="mt-6">
                             <ContactTab />
                         </TabsContent>
                    </Tabs>
                </div>
            </div>
      {/* 固定在右下角的按钮 */}
      <div className="fixed bottom-6 right-6 z-50 rounded-full text-white">
        <GlassSurface 
          className="w-auto h-16 rounded-full"
          brightness={200}

        >
          <div className="flex flex-row items-center justify-evenly gap-4 px-6">
            <Link href="/" className="flex flex-row items-center gap-2 px-3">
              <Home size={18} />
              <span>Home</span>
            </Link>
            <Link href="/discover" className="flex flex-row items-center gap-2 px-3">
              <Compass size={18} />
              <span>Discover</span>
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
    );
}