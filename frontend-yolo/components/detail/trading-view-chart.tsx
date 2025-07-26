"use client";

import { AreaSeries, createChart, ColorType, CrosshairMode, LineStyle, IChartApi, ISeriesApi, UTCTimestamp, MouseEventParams } from 'lightweight-charts';
import React, { useEffect, useRef, useState } from 'react';
import { StockService } from '@/service/stockService';

type TradingViewChartProps = {
  stockId?: string; // 添加stockId参数
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
        stockId,
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
    const [chartData, setChartData] = useState<{ time: number; value: number }[]>([]);
    const [loading, setLoading] = useState(false);

    // 加载图表数据
    const loadChartData = async (range: string) => {
        if (!stockId) return;
        
        setLoading(true);
        try {
            const data = await StockService.getStockChartData(
                stockId, 
                range as '1D' | '1W' | '1M' | '3M'
            );
            setChartData(data);
        } catch (error) {
            console.error('Error loading chart data:', error);
            setChartData([]);
        } finally {
            setLoading(false);
        }
    };

    // 初始化图表
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

    // 处理点击事件
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

    // 当stockId或timeRange变化时加载数据
    useEffect(() => {
        if (stockId) {
            loadChartData(timeRange);
        }
    }, [stockId, timeRange]);

    // 更新图表数据
    useEffect(() => {
        if (!seriesRef.current || chartData.length === 0) return;

        // 转换数据格式为lightweight-charts需要的格式
        const formattedData = chartData.map(item => ({
            time: item.time as UTCTimestamp,
            value: item.value
        }));

        seriesRef.current.setData(formattedData);

        // 设置时间轴格式
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
    }, [chartData, timeRange]);

    const TimeRangeButton = ({ range, children }: { range: string, children: React.ReactNode }) => (
        <button
            onClick={() => setTimeRange(range)}
            disabled={loading}
            className={`px-3 py-1 text-sm rounded-md transition-colors disabled:opacity-50 ${
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
                className="rounded-xl bg-black/30 backdrop-blur-sm p-4 relative"
            >
                {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                        <div className="text-white/60 text-sm">加载图表数据中...</div>
                    </div>
                )}
                {!stockId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                        <div className="text-white/60 text-sm">请选择股票查看图表</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TradingViewChart;