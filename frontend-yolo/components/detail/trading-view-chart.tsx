"use client";

import { AreaSeries, createChart, ColorType, CrosshairMode, LineStyle, IChartApi, ISeriesApi, UTCTimestamp, MouseEventParams } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';

const generateData = (numPoints: number, type: 'day' | 'minute') => {
    const data = [];
    let value = 100;
    const now = new Date();
    
    for (let i = 0; i < numPoints; i++) {
        const date = new Date(now);
        if (type === 'day') {
            date.setUTCDate(date.getUTCDate() - (numPoints - 1 - i));
            date.setUTCHours(0, 0, 0, 0);
        } else {
            date.setUTCMinutes(date.getUTCMinutes() - (numPoints - 1 - i));
        }
        
        const time = (date.getTime() / 1000) as UTCTimestamp;
        value += (Math.random() - 0.48) * (type === 'day' ? 2 : 0.1);
        if (value < 10) value = 10;
        data.push({ time, value: parseFloat(value.toFixed(2)) });
    }
    return data;
};

const dailyData = generateData(365 * 2, 'day'); // 2 years of daily data
const minuteData = generateData(24 * 60, 'minute'); // 24 hours of minute data

type TradingViewChartProps = {
  onTimeClick?: (time: string | null) => void;
  colors?: {
    backgroundColor?: string;
    lineColor?: string;
    textColor?: string;
    areaTopColor?: string;
    areaBottomColor?: string;
  };
};

export const TradingViewChart = (props: TradingViewChartProps) => {
    const {
        onTimeClick,
        colors: {
            backgroundColor = 'transparent',
            lineColor = '#C77CFF',
            textColor = 'white',
            areaTopColor = '#C77CFF',
            areaBottomColor = 'rgba(199, 124, 255, 0.1)',
        } = {},
    } = props;

    const chartContainerRef = useRef<HTMLDivElement>(null);
    const chartRef = useRef<IChartApi | null>(null);
    const seriesRef = useRef<ISeriesApi<'Area'> | null>(null);
    const [timeRange, setTimeRange] = useState('3M');

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            chartRef.current?.applyOptions({ width: chartContainerRef.current!.clientWidth });
        };

        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { type: ColorType.Solid, color: backgroundColor },
                textColor,
            },
            width: chartContainerRef.current.clientWidth,
            height: 300,
            grid: {
                vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
                horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    style: LineStyle.Dotted,
                    color: 'rgba(255, 255, 255, 0.5)',
                },
                horzLine: {
                    style: LineStyle.Dotted,
                    color: 'rgba(255, 255, 255, 0.5)',
                },
            },
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderVisible: false,
            },
            rightPriceScale: {
                borderVisible: false,
            },
        });

        chartRef.current = chart;

        const newSeries = chart.addSeries(AreaSeries, {
            lineColor,
            topColor: areaTopColor,
            bottomColor: areaBottomColor,
            lineWidth: 2,
        });
        seriesRef.current = newSeries;

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (chartRef.current) {
                chartRef.current.remove();
            }
        };
    }, [backgroundColor, lineColor, textColor, areaTopColor, areaBottomColor]);

    useEffect(() => {
      if (!chartRef.current || !onTimeClick) return;

      const handleClick = (param: MouseEventParams) => {
          if (param.time) {
              const date = new Date((param.time as number) * 1000);
              const dateString = `${date.getUTCFullYear()}年${String(date.getUTCMonth() + 1).padStart(2, '0')}月${String(date.getUTCDate()).padStart(2, '0')}日`;
              onTimeClick(dateString);
          }
      };
      
      chartRef.current.subscribeClick(handleClick);

      return () => {
        if(chartRef.current) {
            chartRef.current.unsubscribeClick(handleClick);
        }
      };
    }, [onTimeClick]);

    useEffect(() => {
        if (!seriesRef.current) return;

        let data;
        switch (timeRange) {
            case '1D':
                data = minuteData;
                break;
            default:
                const now = new Date();
                now.setUTCHours(0,0,0,0);
                const startDate = new Date(now);
                
                if (timeRange === '1W') {
                    startDate.setDate(now.getDate() - 7);
                } else if (timeRange === '1M') {
                    startDate.setMonth(now.getMonth() - 1);
                } else if (timeRange === '3M') {
                    startDate.setMonth(now.getMonth() - 3);
                }

                const startTimeStamp = startDate.getTime() / 1000;
                data = dailyData.filter(d => d.time >= startTimeStamp);
                break;
        }

        seriesRef.current.setData(data);

        const timeScaleOptions: any = {
            timeVisible: true,
            secondsVisible: timeRange === '1D',
        };

        if(timeRange !== '1D') {
            timeScaleOptions.tickMarkFormatter = (time: UTCTimestamp) => {
                const date = new Date(time * 1000);
                return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
            };
        }

        chartRef.current?.applyOptions({
            timeScale: timeScaleOptions,
        });

        chartRef.current?.timeScale().fitContent();
    }, [timeRange]);

    const TimeRangeButton = ({ range, children }: { range: string, children: React.ReactNode }) => (
        <button
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                    ? 'bg-white/20 text-white'
                    : 'bg-transparent text-zinc-400 hover:bg-white/10 hover:text-white'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="w-full">
            <div className="flex justify-end gap-2 mb-4">
                <TimeRangeButton range="1D">1D</TimeRangeButton>
                <TimeRangeButton range="1W">1W</TimeRangeButton>
                <TimeRangeButton range="1M">1M</TimeRangeButton>
                <TimeRangeButton range="3M">3M</TimeRangeButton>
            </div>
            <div
                ref={chartContainerRef}
                className="rounded-xl bg-black/30 backdrop-blur-sm p-4"
            />
        </div>
    );
};

export default TradingViewChart;