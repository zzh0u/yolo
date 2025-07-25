"use client";
import { useParams } from "next/navigation";
import ProductHeader from "@/components/detail/product-header";
import StatsBar from "@/components/detail/stats-bar";
import SwapPanel from "@/components/detail/swap-panel";
import TradingViewChart from "@/components/detail/trading-view-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OverviewTab from "@/components/detail/overview-tab";
import ActivityTab from "@/components/detail/activity-tab";
import ContactTab from "@/components/detail/contact-tab";
import GlassSurface from "@/components/react-bits/glass-surface";
import Link from "next/link";
import { Home, Compass, PlusCircle, User } from "lucide-react";

export default function ProductPage() {
    const { product } = useParams();
    // Static data based on the new screenshot
    const staticData = {
        name: "DIAToken",
        symbol: "DIA",
        price: "0.8694",
        change: "+72%",
        chain: "ETHEREUM",
        marketCap: "$189.3M",
        volume: "$1.6M",
        priceChange: "+97.1%",
        marketCapChange: "+97.1%",
    };

    return (
        <div className="flex min-h-screen bg-zinc-950 text-white">
            {/* This is a placeholder for the left sidebar from the image */}
            <div className="w-16 bg-black/30 p-2 hidden md:block"></div>

            <div className="flex-grow flex flex-col p-4 md:p-6 lg:p-8">
                <div className="flex flex-col xl:flex-row flex-grow gap-8">
                    <main className="flex-grow flex flex-col gap-6">
                        <ProductHeader
                            name={staticData.name}
                            symbol={staticData.symbol}
                            price={staticData.price}
                            change={staticData.change}
                        />
                        <TradingViewChart />
                        <StatsBar
                            chain={staticData.chain}
                            marketCap={staticData.marketCap}
                            volume={staticData.volume}
                            priceChange={staticData.priceChange}
                            marketCapChange={staticData.marketCapChange}
                        />
                    </main>
                    <aside className="w-full xl:w-1/3 xl:max-w-md">
                        <SwapPanel />
                    </aside>
                </div>

                <div className="mt-12 min-h-screen">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="border-b border-zinc-800 rounded-none p-0 h-auto bg-transparent justify-start gap-6">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-1 py-3 text-zinc-400">概况</TabsTrigger>
                            <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-1 py-3 text-zinc-400">动态</TabsTrigger>
                            <TabsTrigger value="contact" className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-white rounded-none px-1 py-3 text-zinc-400">联系</TabsTrigger>
                        </TabsList>
                        <TabsContent value="overview" className="mt-6">
                            <OverviewTab />
                        </TabsContent>
                        <TabsContent value="activity" className="mt-6">
                            <ActivityTab />
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
            <Link href="/dashboard" className="flex flex-row items-center gap-2 px-3">
              <User size={18} />
              <span>Me</span>
            </Link>
          </div>
        </GlassSurface>
      </div>
        </div>
    );
}