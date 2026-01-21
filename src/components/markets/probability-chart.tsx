'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { format } from 'date-fns';

interface PricePoint {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface ProbabilityChartProps {
  data: PricePoint[];
  height?: number;
  showVolume?: boolean;
  className?: string;
}

export function ProbabilityChart({
  data,
  height = 300,
  showVolume = false,
  className,
}: ProbabilityChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      timestamp: point.timestamp.getTime(),
      probability: point.close,
      high: point.high,
      low: point.low,
      volume: point.volume,
    }));
  }, [data]);

  const formatXAxis = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d');
  };

  const formatTooltipDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return format(date, 'MMM d, h:mm a');
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 shadow-lg">
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
          {formatTooltipDate(label)}
        </p>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              Probability
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-white">
              {data.probability.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-zinc-600 dark:text-zinc-300">
              High/Low
            </span>
            <span className="text-sm text-zinc-900 dark:text-white">
              {data.high.toFixed(1)} / {data.low.toFixed(1)}
            </span>
          </div>
          {showVolume && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-600 dark:text-zinc-300">
                Volume
              </span>
              <span className="text-sm text-zinc-900 dark:text-white">
                ${(data.volume / 100).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg ${className}`}
        style={{ height }}
      >
        <p className="text-zinc-500 dark:text-zinc-400">No historical data available</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="probabilityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatXAxis}
            tick={{ fontSize: 12, fill: '#71717A' }}
            axisLine={{ stroke: '#E4E4E7' }}
            tickLine={{ stroke: '#E4E4E7' }}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12, fill: '#71717A' }}
            axisLine={{ stroke: '#E4E4E7' }}
            tickLine={{ stroke: '#E4E4E7' }}
            width={50}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="probability"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#probabilityGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#3B82F6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// Mini sparkline version for cards
export function ProbabilitySparkline({
  data,
  width = 100,
  height = 40,
}: {
  data: PricePoint[];
  width?: number;
  height?: number;
}) {
  const chartData = useMemo(() => {
    return data.slice(-24).map((point) => ({
      probability: point.close,
    }));
  }, [data]);

  const isUp =
    chartData.length >= 2 &&
    chartData[chartData.length - 1].probability > chartData[0].probability;

  const color = isUp ? '#22C55E' : '#EF4444';

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Line
          type="monotone"
          dataKey="probability"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
