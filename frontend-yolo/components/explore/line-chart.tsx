"use client";

import { LineChart, Line, ResponsiveContainer } from 'recharts';

type MiniLineChartProps = {
  data: { value: number }[];
  color: string;
};

const mockData = [
  { value: 10 },
  { value: 50 },
  { value: 30 },
  { value: 80 },
  { value: 60 },
  { value: 100 },
];

export function MiniLineChart({ data = mockData, color = "#8884d8" }: MiniLineChartProps) {
  return (
    <div style={{ width: '100px', height: '40px' }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 