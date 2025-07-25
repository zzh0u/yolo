"use client";
import React from 'react';
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

const TradingViewChart = () => {
  return (
    <div className="flex-grow h-[450px]">
        <AdvancedRealTimeChart
            theme="dark"
            autosize
            symbol="BITSTAMP:ETHUSD"
            style="2" // 1 for Bars, 2 for Candles, 3 for Line
            withdateranges
            hide_side_toolbar={true}
            allow_symbol_change={false}
        />
    </div>
  );
};

export default TradingViewChart;
