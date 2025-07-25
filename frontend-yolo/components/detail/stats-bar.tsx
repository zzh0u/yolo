import React from 'react';

interface StatsBarProps {
    chain: string;
    marketCap: string;
    volume: string;
    priceChange: string;
    marketCapChange: string;
}

const StatsBar: React.FC<StatsBarProps> = ({ chain, marketCap, volume, priceChange, marketCapChange }) => {
  return (
    <div className="grid grid-cols-5 gap-4 py-4 text-center border-t border-b border-zinc-800">
        <div>
            <div className="text-xs text-zinc-400 tracking-wider">CHAIN</div>
            <div className="text-base font-medium mt-1">{chain}</div>
        </div>
        <div>
            <div className="text-xs text-zinc-400 tracking-wider">MARKET CAP</div>
            <div className="text-base font-medium mt-1">{marketCap}</div>
        </div>
        <div>
            <div className="text-xs text-zinc-400 tracking-wider">1D VOLUME</div>
            <div className="text-base font-medium mt-1">{volume}</div>
        </div>
        <div>
            <div className="text-xs text-zinc-400 tracking-wider">1D PRICE</div>
            <div className="text-base font-medium text-green-500 mt-1">{priceChange}</div>
        </div>
        <div>
            <div className="text-xs text-zinc-400 tracking-wider">1D MARKET CAP</div>
            <div className="text-base font-medium text-green-500 mt-1">{marketCapChange}</div>
        </div>
    </div>
  );
};

export default StatsBar;
