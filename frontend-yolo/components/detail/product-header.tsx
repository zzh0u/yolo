import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface ProductHeaderProps {
    name: string;
    symbol: string;
    price: string;
    change: string;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ name, symbol, price, change }) => {
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
                        <span>◆</span>
                        <span>ETHEREUM</span>
                        <span className="ml-2 px-2 py-1 bg-zinc-800 text-xs rounded">TOKEN</span>
                    </div>
                </div>
            </div>
            <div className="flex items-baseline gap-3 mt-2">
                <div className="text-4xl font-bold">${price}</div>
                <div className="text-green-500 text-lg font-semibold">{change}</div>
            </div>
        </div>
        <div className="flex items-center gap-1">
          {/* These are placeholder icons */}
          <Button variant="ghost" size="icon">❐</Button>
          <Button variant="ghost" size="icon">📈</Button>
          <Button variant="ghost" size="icon">🌐</Button>
          <Button variant="ghost" size="icon">X</Button>
          <Button variant="ghost" size="icon">➢</Button>
        </div>
    </div>
  );
};

export default ProductHeader;
