'use client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import Image from "next/image"
  import { Badge } from "@/components/ui/badge";
  import { MiniLineChart } from "./line-chart";
  import { Star, BadgeCheck, Lightbulb, Box, PlayCircle, TrendingUp } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { useRouter } from "next/navigation";
  
  // 定义股票数据接口
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

  // 组件 Props 接口
  interface CollectionTableProps {
    stocks?: StockData[];
  }

  const statusIcons = {
    idea: <Lightbulb className="h-4 w-4 mr-2" />,
    prototype: <Box className="h-4 w-4 mr-2" />,
    demo: <PlayCircle className="h-4 w-4 mr-2" />,
    fundraising: <TrendingUp className="h-4 w-4 mr-2" />,
  }
  
  const statusStyles = {
    idea: "bg-yellow-900/50 text-yellow-200 border-yellow-700/60 hover:bg-yellow-900/80",
    prototype:
      "bg-sky-900/50 text-sky-200 border-sky-700/60 hover:bg-sky-900/80",
    demo: "bg-indigo-900/50 text-indigo-200 border-indigo-700/60 hover:bg-indigo-900/80",
    fundraising:
      "bg-emerald-900/50 text-emerald-200 border-emerald-700/60 hover:bg-emerald-900/80",
  }
  
  function formatCurrency(value: number) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M YOLO`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K YOLO`;
    }
    return `${value.toFixed(2)} YOLO`;
  }

  function formatSupply(value: number) {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(2)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K`;
    }
    // 对于小数，显示最多8位小数，但去掉尾随的0
    return value.toFixed(8).replace(/\.?0+$/, '');
  }
  
  export function CollectionTable({ stocks = [] }: CollectionTableProps) {
    const router = useRouter();
    
    // 如果没有股票数据，显示空状态
    if (stocks.length === 0) {
      return (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center text-gray-400">
            <div className="text-lg mb-2">No stocks found</div>
            <div className="text-sm">Try adjusting your search or create a new stock</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-700">
              <TableHead className="w-1/2 text-gray-400 uppercase text-xs">Collection</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">Price</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">1D Change</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">1D Volume</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">Market Cap</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">Owners</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">Supply</TableHead>
              <TableHead className="text-gray-400 uppercase text-xs">Last 7 Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stocks.map((stock, index) => (
              <TableRow 
                key={stock.id} 
                className="border-b border-gray-800 hover:bg-gray-800/50 align-middle cursor-pointer"
                onClick={() => router.push(`/explore/${stock.symbol}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Star className="text-gray-600 hover:text-yellow-400 cursor-pointer" size={16}/>
                    <span className="text-gray-400 w-6 text-sm">{index + 1}</span>
                    <Avatar>
                      <AvatarImage 
                        src={stock.image_url || "/img/sam.png"} 
                        alt={stock.name}
                      />
                      <AvatarFallback>{stock.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-white flex items-center gap-1">
                      {stock.name}
                      <BadgeCheck className="text-blue-500" size={16}/>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn("capitalize border-none text-xs font-semibold", statusStyles[stock.status])}
                    >
                       {statusIcons[stock.status]}
                       {stock.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-white">{formatCurrency(stock.price)}</TableCell>
                <TableCell className={stock.dailyChange > 0 ? "text-green-400" : "text-red-400"}>
                  {stock.dailyChange > 0 ? "+" : ""}
                  {stock.dailyChange.toFixed(1)}%
                </TableCell>
                <TableCell className="text-white">{formatCurrency(stock.dailyVolume)}</TableCell>
                <TableCell className="text-white">{formatCurrency(stock.marketCap)}</TableCell>
                <TableCell className="text-white">{stock.owners.toLocaleString()}</TableCell>
                <TableCell className="text-white">{formatSupply(stock.supply)}</TableCell>
                <TableCell>
                  <MiniLineChart 
                    color={stock.dailyChange > 0 ? "#22c55e" : "#ef4444"} 
                    data={stock.chartData}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }