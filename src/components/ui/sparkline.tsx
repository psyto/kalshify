'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface SparklineProps {
  data?: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: 'green' | 'red' | 'neutral' | 'auto';
  className?: string;
  // If no data provided, generate synthetic data from these
  currentValue?: number;
  change?: number;
}

export function Sparkline({
  data: providedData,
  width = 80,
  height = 24,
  strokeWidth = 1.5,
  color = 'auto',
  className,
  currentValue = 50,
  change = 0,
}: SparklineProps) {
  // Generate synthetic data if none provided
  const data = useMemo(() => {
    if (providedData && providedData.length > 0) {
      return providedData;
    }

    // Generate 12 points of synthetic historical data
    const points = 12;
    const result: number[] = [];

    // Start from where we would have been given the change
    const startValue = currentValue - change;

    // Create a somewhat random but trending path
    let current = startValue;
    const volatility = Math.abs(change) > 5 ? 3 : 1.5; // More volatile if big change

    for (let i = 0; i < points; i++) {
      // Add some random noise but trend toward the final value
      const progress = i / (points - 1);
      const targetForThisPoint = startValue + (change * progress);
      const noise = (Math.random() - 0.5) * volatility * 2;
      current = targetForThisPoint + noise;

      // Keep within reasonable bounds
      current = Math.max(1, Math.min(99, current));
      result.push(current);
    }

    // Ensure last point is exactly the current value
    result[result.length - 1] = currentValue;

    return result;
  }, [providedData, currentValue, change]);

  // Determine color based on trend
  const strokeColor = useMemo(() => {
    if (color !== 'auto') {
      switch (color) {
        case 'green':
          return '#22c55e'; // green-500
        case 'red':
          return '#ef4444'; // red-500
        default:
          return '#71717a'; // zinc-500
      }
    }

    // Auto-detect based on trend
    if (data.length < 2) return '#71717a';
    const first = data[0];
    const last = data[data.length - 1];
    if (last > first) return '#22c55e';
    if (last < first) return '#ef4444';
    return '#71717a';
  }, [color, data]);

  // Calculate SVG path
  const path = useMemo(() => {
    if (data.length < 2) return '';

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    // Padding to prevent clipping at edges
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minVal) / range) * chartHeight;
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [data, width, height]);

  // Calculate gradient fill path (area under the line)
  const fillPath = useMemo(() => {
    if (data.length < 2) return '';

    const minVal = Math.min(...data);
    const maxVal = Math.max(...data);
    const range = maxVal - minVal || 1;

    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = data.map((value, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((value - minVal) / range) * chartHeight;
      return `${x},${y}`;
    });

    const firstX = padding;
    const lastX = padding + chartWidth;
    const bottomY = height - padding;

    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  }, [data, width, height]);

  const gradientId = useMemo(() => `sparkline-gradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path
        d={fillPath}
        fill={`url(#${gradientId})`}
      />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      {data.length >= 2 && (
        <circle
          cx={width - 2}
          cy={(() => {
            const minVal = Math.min(...data);
            const maxVal = Math.max(...data);
            const range = maxVal - minVal || 1;
            const padding = 2;
            const chartHeight = height - padding * 2;
            return padding + chartHeight - ((data[data.length - 1] - minVal) / range) * chartHeight;
          })()}
          r={2}
          fill={strokeColor}
        />
      )}
    </svg>
  );
}
