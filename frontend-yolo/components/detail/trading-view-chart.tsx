// "use client";
// import React from 'react';
// import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

// const TradingViewChart = () => {
//   return (
//     <div className="flex-grow h-[450px]">
//         <AdvancedRealTimeChart
//             theme="dark"
//             autosize
//             symbol="BITSTAMP:ETHUSD"
//             style="2" // 1 for Bars, 2 for Candles, 3 for Line
//             withdateranges
//             hide_side_toolbar={true}
//             allow_symbol_change={false}
//         />
//     </div>
//   );
// };

// export default TradingViewChart;


import { AreaSeries, createChart, ColorType } from 'lightweight-charts';
import React, { useEffect, useRef } from 'react';

export const TradingViewChart = (props: any) => {
    const {
        data,
        colors: {
            backgroundColor = 'white',
            lineColor = '#2962FF',
            textColor = 'black',
            areaTopColor = '#2962FF',
            areaBottomColor = 'rgba(41, 98, 255, 0.28)',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);

    useEffect(
        () => {
            const handleResize = () => {
                chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
            };

            const chart = createChart(chartContainerRef.current!, {
                layout: {
                    background: { type: ColorType.Solid, color: backgroundColor },
                    textColor,
                },
                width: chartContainerRef.current?.clientWidth,
                height: 300,
            });
            chart.timeScale().fitContent();

            const newSeries = chart.addSeries(AreaSeries, { lineColor, topColor: areaTopColor, bottomColor: areaBottomColor });
            newSeries.setData(data);

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);

                chart.remove();
            };
        },
        [data, backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]
    );

    return (
        <div
            ref={chartContainerRef}
        />
    );
};



export default TradingViewChart;