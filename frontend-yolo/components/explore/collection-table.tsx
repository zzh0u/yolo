'use client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table";
  import Image from "next/image";
  import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
  import { Badge } from "@/components/ui/badge";
  import { MiniLineChart } from "./line-chart";
  import { Star, BadgeCheck, Lightbulb, Box, PlayCircle, TrendingUp } from "lucide-react";
  import { cn } from "@/lib/utils";
  import { useRouter } from "next/navigation";
  
  type Collection = {
    name: string;
    img: string;
    status: "idea" | "prototype" | "demo" | "fundraising";
    price: number;
    dailyChange: number;
    dailyVolume: number;
    marketCap: number;
    owners: number;
    supply: number;
    chartData: { value: number }[];
  };

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
  
  const generateChartData = () => {
    return Array.from({ length: 7 }, () => ({ value: Math.random() * 100 }));
  }
  
  const collections: Collection[] = [
    {
      name: "ALcohol",
      img: "/cryptopunks.png",
      status: "fundraising",
      price: 181500,
      dailyChange: 16.5,
      dailyVolume: 15000000,
      marketCap: 181500 * 9994,
      owners: 3843,
      supply: 9994,
      chartData: generateChartData(),
    },
    {
      name: "EarBro",
      img: "/pudgypenguins.png",
      status: "demo",
      price: 63700,
      dailyChange: 14.3,
      dailyVolume: 6100000,
      marketCap: 63700 * 8888,
      owners: 4961,
      supply: 8888,
      chartData: generateChartData(),
    },
    {
        name: "Weekend",
        img: "/bayc.png",
        status: "idea",
        price: 50100,
        dailyChange: 20.3,
        dailyVolume: 3800000,
        marketCap: 50100 * 9998,
        owners: 5506,
        supply: 9998,
        chartData: generateChartData(),
    },
    {
        name: "YoungZ",
        img: "/moonbirds.png",
        status: "prototype",
        price: 7370.22,
        dailyChange: 32.2,
        dailyVolume: 1900000,
        marketCap: 7370.22 * 9999,
        owners: 5773,
        supply: 9999,
        chartData: generateChartData(),
    },
    {
        name: "LingLong",
        img: "/lilpudgys.png",
        status: "fundraising",
        price: 6834.31,
        dailyChange: -18.5,
        dailyVolume: 1800000,
        marketCap: 6834.31 * 21912,
        owners: 9830,
        supply: 21912,
        chartData: generateChartData(),
    },
  ];
  
  function formatCurrency(value: number) {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(2)}`;
  }
  
  export function CollectionTable() {
    const router = useRouter();
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
            {collections.map((collection, index) => (
              <TableRow 
                key={index} 
                className="border-b border-gray-800 hover:bg-gray-800/50 align-middle cursor-pointer"
                onClick={() => router.push(`/discover/${collection.name}`)}
              >
                <TableCell>
                  <div className="flex items-center gap-4">
                    <Star className="text-gray-600 hover:text-yellow-400 cursor-pointer" size={16}/>
                    <span className="text-gray-400 w-6 text-sm">{index + 1}</span>
                    <Avatar>
                      <AvatarImage src={collection.img} />
                      <AvatarFallback>{collection.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="font-semibold text-white flex items-center gap-1">
                      {collection.name}
                      <BadgeCheck className="text-blue-500" size={16}/>
                    </div>
                    <Badge 
                      variant="outline"
                      className={cn("capitalize border-none text-xs font-semibold", statusStyles[collection.status])}
                    >
                       {statusIcons[collection.status]}
                       {collection.status}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="font-semibold text-white">{formatCurrency(collection.price)}</TableCell>
                <TableCell className={collection.dailyChange > 0 ? "text-green-400" : "text-red-400"}>
                  {collection.dailyChange > 0 ? "+" : ""}
                  {collection.dailyChange.toFixed(1)}%
                </TableCell>
                <TableCell className="text-white">{formatCurrency(collection.dailyVolume)}</TableCell>
                <TableCell className="text-white">{formatCurrency(collection.marketCap)}</TableCell>
                <TableCell className="text-white">{collection.owners.toLocaleString()}</TableCell>
                <TableCell className="text-white">{collection.supply.toLocaleString()}</TableCell>
                <TableCell>
                  <MiniLineChart color={collection.dailyChange > 0 ? "#22c55e" : "#ef4444"} data={collection.chartData}/>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  } 