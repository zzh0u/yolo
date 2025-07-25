import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface StockHeaderProps {
    name: string;
    symbol: string;  // 缩写
    price: string;
    change: string;
}

const StockHeader: React.FC<StockHeaderProps> = ({ name, symbol, price, change }) => {
  return (
    <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                    <AvatarImage src={`/icons/${symbol.toLowerCase()}.png`} alt={name} />
                    <AvatarFallback>{symbol.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold">{name} {symbol}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{symbol}</span>
                        <span>/</span>
                        <span>YOLO</span>
                        <span className="ml-2 px-2 py-1 bg-zinc-800 text-xs rounded">TOKEN</span>
                    </div>
                </div>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
                <div className="text-4xl font-bold">${price}</div>
                <div className="text-green-500 text-lg font-semibold">{change}</div>
            </div>
        </div>
        
        {/* 分享 ICON */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
              <polyline points="16 6 12 2 8 6"></polyline>
              <line x1="12" y1="2" x2="12" y2="15"></line>
            </svg>
          </Button>
        </div>
    </div>
  );
};

export default StockHeader;
