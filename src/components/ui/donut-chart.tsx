'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface DonutChartSegment {
  name: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  segments: DonutChartSegment[];
  size?: number;
  strokeWidth?: number;
  className?: string;
  centerLabel?: string;
  centerValue?: string;
}

// Color palette for segments
const COLORS = [
  '#3b82f6', // blue-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f59e0b', // amber-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#f43f5e', // rose-500
  '#84cc16', // lime-500
];

export function DonutChart({
  segments,
  size = 200,
  strokeWidth = 32,
  className,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const { paths, total } = useMemo(() => {
    const total = segments.reduce((sum, s) => sum + s.value, 0);
    if (total === 0) return { paths: [], total: 0 };

    const radius = (size - strokeWidth) / 2;
    const centerX = size / 2;
    const centerY = size / 2;
    const circumference = 2 * Math.PI * radius;

    let currentAngle = -90; // Start at top
    const paths = segments.map((segment, index) => {
      const percentage = segment.value / total;
      const angle = percentage * 360;

      // Calculate SVG arc path
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const startX = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
      const startY = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
      const endX = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
      const endY = centerY + radius * Math.sin((endAngle * Math.PI) / 180);

      const largeArcFlag = angle > 180 ? 1 : 0;

      // Create the arc path
      const path = [
        `M ${startX} ${startY}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}`,
      ].join(' ');

      currentAngle += angle;

      return {
        path,
        color: segment.color || COLORS[index % COLORS.length],
        name: segment.name,
        percentage: percentage * 100,
        value: segment.value,
      };
    });

    return { paths, total };
  }, [segments, size, strokeWidth]);

  if (paths.length === 0) {
    return (
      <div
        className={cn('relative', className)}
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={(size - strokeWidth) / 2}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-zinc-200 dark:text-zinc-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-zinc-400 dark:text-zinc-500">
            No data
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-0 transition-transform duration-500"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={(size - strokeWidth) / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-100 dark:text-zinc-800"
        />

        {/* Segments */}
        {paths.map((segment, index) => (
          <path
            key={segment.name}
            d={segment.path}
            fill="none"
            stroke={segment.color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="transition-all duration-500 hover:opacity-80"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
              // Animation delay based on index
              animation: `donut-segment-appear 0.6s ease-out ${index * 0.1}s forwards`,
              opacity: 0,
              strokeDasharray: 1000,
              strokeDashoffset: 1000,
            }}
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {centerValue && (
          <span className="text-2xl font-bold text-zinc-900 dark:text-white data-value">
            {centerValue}
          </span>
        )}
        {centerLabel && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {centerLabel}
          </span>
        )}
      </div>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes donut-segment-appear {
          to {
            opacity: 1;
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Legend component to pair with the chart
interface DonutLegendProps {
  segments: DonutChartSegment[];
  className?: string;
}

export function DonutLegend({ segments, className }: DonutLegendProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className={cn('space-y-2', className)}>
      {segments.map((segment, index) => {
        const percentage = total > 0 ? (segment.value / total) * 100 : 0;
        const color = segment.color || COLORS[index % COLORS.length];

        return (
          <div key={segment.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-sm text-zinc-600 dark:text-zinc-400 flex-1 truncate">
              {segment.name}
            </span>
            <span className="text-sm font-medium text-zinc-900 dark:text-white data-percent">
              {percentage.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
