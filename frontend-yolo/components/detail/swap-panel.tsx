import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';
import GlassSurface from "@/components/react-bits/glass-surface";

// Mock data, will be replaced by props
const mockStock = {
    symbol: 'CHD',
    icon: '/icons/CHD.png' // Make sure this path is correct
};

const yoloBalance = 1000.00;
const stockBalance = 50.00;
const price = 200; // 1 stock = 200 YOLO

const SwapPanel = ({ stock = mockStock }) => {
    const [activeTab, setActiveTab] = useState('buy');
    const [payAmount, setPayAmount] = useState('');
    const [receiveAmount, setReceiveAmount] = useState('');

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setPayAmount('');
        setReceiveAmount('');
    };

    const handlePayAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || isNaN(Number(value))) {
            setPayAmount('');
            setReceiveAmount('');
            return;
        }

        const numericValue = parseFloat(value);
        setPayAmount(value);

        if (activeTab === 'buy') {
            // Pay with YOLO, receive stock
            setReceiveAmount((numericValue / price).toFixed(6));
        } else {
            // Pay with stock, receive YOLO
            setReceiveAmount((numericValue * price).toFixed(2));
        }
    };

    const handleMaxClick = () => {
        if (activeTab === 'buy') {
            setPayAmount(yoloBalance.toString());
            setReceiveAmount((yoloBalance / price).toFixed(6));
        } else {
            setPayAmount(stockBalance.toString());
            setReceiveAmount((stockBalance * price).toFixed(2));
        }
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
            
            <TabsContent value="buy" className="flex flex-col flex-grow">
                <div className="flex flex-col gap-3">
                    {/* Pay Section */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>You pay</span>
                            <div className="flex items-center gap-1.5">
                                <span>Balance: {yoloBalance.toFixed(2)}</span>
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
                                    <AvatarImage src={stock.icon} alt={stock.symbol} />
                                    <AvatarFallback>{stock.symbol.slice(0, 3)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base">{stock.symbol}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-auto">
                    <Button className="w-full bg-gradient-to-br from-green-500 to-green-600 text-white py-6 text-lg font-bold rounded-lg">
                        Buy {stock.symbol}
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
                                <span>Balance: {stockBalance.toFixed(2)}</span>
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
                            />
                             <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-full">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={stock.icon} alt={stock.symbol} />
                                    <AvatarFallback>{stock.symbol.slice(0, 3)}</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold text-base">{stock.symbol}</span>
                            </div>
                        </div>
                    </div>

                    {/* Receive Section */}
                    <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
                            <span>You receive</span>
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
                    <Button className="w-full bg-gradient-to-br from-red-500 to-red-600 text-white py-6 text-lg font-bold rounded-lg">
                        Sell {stock.symbol}
                    </Button>
                </div>
            </TabsContent>
        </Tabs>
    </div>
    </GlassSurface>
  );
};

export default SwapPanel;


