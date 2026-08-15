import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AppointmentTrendPoint } from '../useDashboardData';

interface AppointmentsTrendChartProps {
  getAppointmentsTrend?: (timeframe: string) => AppointmentTrendPoint[];
}

export const AppointmentsTrendChart: React.FC<AppointmentsTrendChartProps> = ({
  getAppointmentsTrend,
}) => {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const rawData = getAppointmentsTrend ? getAppointmentsTrend(timeframe) : [];

  const data = rawData.length > 0
    ? rawData
    : [
        { label: 'WK 1', count: 0, scheduled: 0, completed: 0, cancelled: 0 },
        { label: 'WK 2', count: 0, scheduled: 0, completed: 0, cancelled: 0 },
        { label: 'WK 3', count: 0, scheduled: 0, completed: 0, cancelled: 0 },
        { label: 'WK 4', count: 0, scheduled: 0, completed: 0, cancelled: 0 },
      ];

  // SVG dimensions
  const viewBoxWidth = 400;
  const viewBoxHeight = 180;
  const paddingLeft = 35;
  const paddingBottom = 25;
  const paddingTop = 20;
  const paddingRight = 20;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  const maxCount = Math.max(5, ...data.map((d) => d.count));
  const yMax = Math.ceil(maxCount * 1.25);

  // Calculate points for SVG path
  const points = data.map((d, index) => {
    const denominator = data.length > 1 ? data.length - 1 : 1;
    const x = paddingLeft + (index / denominator) * chartWidth;
    const y = paddingTop + chartHeight - (d.count / yMax) * chartHeight;
    return { x, y, ...d };
  });

  // Construct smooth bezier curve path string
  const dPath = points.reduce((acc, point, index, array) => {
    if (index === 0) return `M ${point.x},${point.y}`;
    const prev = array[index - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  // Area path
  const areaPath = points.length > 0
    ? `${dPath} L ${points[points.length - 1].x},${paddingTop + chartHeight} L ${points[0].x},${paddingTop + chartHeight} Z`
    : '';

  const yStep = Math.ceil(yMax / 4);
  const yAxisValues = [0, yStep, yStep * 2, yStep * 3, yStep * 4];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase">
            Appointments Trend
          </h4>
        </div>
        <div className="relative">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="appearance-none bg-slate-50 border border-slate-100 text-slate-700 text-xs font-semibold py-1.5 pl-3 pr-7 rounded-lg focus:outline-none cursor-pointer"
          >
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>This Quarter</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* SVG Line Chart */}
      <div className="relative w-full h-48 sm:h-52">
        <svg
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          className="w-full h-full overflow-visible"
        >
          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Y Axis Grid Lines */}
          {yAxisValues.map((val) => {
            const y = paddingTop + chartHeight - (val / (yStep * 4 || 1)) * chartHeight;
            return (
              <g key={val}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={viewBoxWidth - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                  strokeDasharray={val === 0 ? undefined : "3 3"}
                />
                <text
                  x={paddingLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 font-medium"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Gradient Fill */}
          {areaPath && <path d={areaPath} fill="url(#blueGradient)" />}

          {/* Trend Line */}
          {dPath && (
            <path
              d={dPath}
              fill="none"
              stroke="#1D4ED8"
              strokeWidth="3"
              strokeLinecap="round"
            />
          )}

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint === idx ? "6" : "4"}
                fill="#1D4ED8"
                stroke="#FFFFFF"
                strokeWidth="2"
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* X Axis Labels */}
              <text
                x={pt.x}
                y={viewBoxHeight - 4}
                textAnchor="middle"
                className="text-[10px] fill-slate-400 font-semibold uppercase"
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint !== null && points[hoveredPoint] && (
          <div
            className="absolute bg-slate-900 text-white text-xs px-2.5 py-1.5 rounded-lg shadow-xl pointer-events-none transform -translate-x-1/2 -translate-y-full transition-all duration-150 whitespace-nowrap z-20"
            style={{
              left: `${(points[hoveredPoint].x / viewBoxWidth) * 100}%`,
              top: `${(points[hoveredPoint].y / viewBoxHeight) * 100 - 10}%`,
            }}
          >
            <div className="font-bold border-b border-slate-700 pb-1 mb-1">{points[hoveredPoint].label}</div>
            <div>Total: {points[hoveredPoint].count}</div>
            <div className="text-[10px] text-emerald-300">Completed: {points[hoveredPoint].completed}</div>
            <div className="text-[10px] text-blue-300">Scheduled: {points[hoveredPoint].scheduled}</div>
            {points[hoveredPoint].cancelled > 0 && (
              <div className="text-[10px] text-rose-300">Cancelled: {points[hoveredPoint].cancelled}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
