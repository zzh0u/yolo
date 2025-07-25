import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Settings } from 'lucide-react';

const SwapPanel = () => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg flex flex-col gap-4 h-full">
        <div className="flex justify-between items-center">
            <Tabs defaultValue="swap">
                <TabsList className="bg-zinc-800 p-1">
                    <TabsTrigger value="swap" className="data-[state=active]:bg-zinc-700">Swap</TabsTrigger>
                    <TabsTrigger value="buy" className="data-[state=active]:bg-zinc-700">Buy</TabsTrigger>
                </TabsList>
            </Tabs>
            <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5 text-zinc-400" />
            </Button>
        </div>
        
        <Tabs defaultValue="swap" className="w-full">
            <TabsContent value="swap" className="mt-0">
                <div className="flex flex-col gap-3">
                    {/* Sell Section */}
                    <div className="p-3 bg-zinc-950 rounded-md border border-zinc-800">
                        <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                            <span>Sell</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <Input type="text" placeholder="0" className="bg-transparent border-none text-2xl p-0 h-auto focus:ring-0" />
                            <Button variant="secondary" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="/icons/eth.png" alt="ETH" />
                                    <AvatarFallback>TO</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">TO</span>
                                <span>▼</span>
                            </Button>
                        </div>
                         <div className="text-right text-xs text-zinc-400">
                            <span>0.00 TO</span>
                            <Button variant="link" className="text-blue-500 text-xs h-auto p-0 ml-2">Max</Button>
                        </div>
                    </div>

                    <div className="flex justify-center my-[-10px] z-10">
                        <Button variant="outline" size="icon" className="rounded-full bg-zinc-900 border-zinc-700 hover:bg-zinc-800">↓</Button>
                    </div>

                    {/* Buy Section */}
                    <div className="p-3 bg-zinc-950 rounded-md border border-zinc-800">
                        <div className="flex justify-between items-center text-xs text-zinc-400 mb-1">
                            <span>Buy</span>
                            <span>$0.00</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <Input type="text" placeholder="0" className="bg-transparent border-none text-2xl p-0 h-auto focus:ring-0" />
                            <Button variant="secondary" className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src="/icons/dia.png" alt="DIA" />
                                    <AvatarFallback>DIA</AvatarFallback>
                                </Avatar>
                                <span className="font-semibold">DIA</span>
                                <span>▼</span>
                            </Button>
                        </div>
                        <div className="text-right text-xs text-zinc-400">0.00 DIA</div>
                    </div>

                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold">
                        Swap
                    </Button>
                </div>
            </TabsContent>
            <TabsContent value="buy">
                <p className="text-center p-8">Buy functionality coming soon.</p>
            </TabsContent>
        </Tabs>
    </div>
  );
};

export default SwapPanel;
