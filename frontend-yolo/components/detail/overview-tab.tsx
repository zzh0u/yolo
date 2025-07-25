import React from 'react';
import { BarChart, Clock, ShieldCheck } from 'lucide-react';

const OverviewTab = () => {
  return (
    <div className="grid md:grid-cols-3 gap-12 text-zinc-300">
      <div className="md:col-span-2">
        <h2 className="text-3xl font-bold text-white">The Decentralized Information Asset</h2>
        <p className="mt-6 text-lg leading-relaxed text-zinc-400">
          DIA (Decentralised Information Asset) is a cross-chain, end-to-end, open-source data and oracle platform for Web3. 
          The DIA platform enables the sourcing, validation and sharing of transparent and verified data feeds for traditional and digital financial applications.
        </p>
        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
          DIA’s data is directly sourced from a broad array of on-chain and off-chain sources and is fully customisable, with the ability to set custom methodologies and pricing sources. This allows for the creation of any asset price feed, including crypto-asset, NFT, and FX prices.
        </p>
      </div>
      <div className="space-y-8">
        <div className="flex items-start gap-4">
          <div className="bg-zinc-800 p-2 rounded-md">
            <BarChart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Transparent Data</h3>
            <p className="text-zinc-400 text-sm mt-1">Sourced from a wide range of on-chain and CEX/DEX markets.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-zinc-800 p-2 rounded-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Verified Oracles</h3>
            <p className="text-zinc-400 text-sm mt-1">Crowd-verified price oracles for reliable Web3 applications.</p>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="bg-zinc-800 p-2 rounded-md">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Real-Time Delivery</h3>
            <p className="text-zinc-400 text-sm mt-1">Delivering price feeds with customizable update mechanisms.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
