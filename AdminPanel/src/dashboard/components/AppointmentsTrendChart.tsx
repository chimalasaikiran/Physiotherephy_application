import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { AppointmentTrendPoint } from '../useDashboardData';

interface AppointmentsTrendChartProps {
  getAppointmentsTrend?: (timeframe: string) => AppointmentTrendPoint[];
  isLoading?: boolean;
}

export const AppointmentsTrendChart: React.FC<AppointmentsTrendChartProps> = ({
  getAppointmentsTrend,
  isLoading,
}) => {
  const [timeframe, setTimeframe] = useState('Last 30 Days');
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

  const rawData = getAppointmentsTrend ? getAppointmentsTrend(timeframe) : [];

  const defaultData: AppointmentTrendPoint[] = timeframe === 'Last 7 Days'
    ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({ label: day, count: 0, scheduled: 0, completed: 0, cancelled: 0 }))
    : ['WK 1', 'WK 2', 'WK 3', 'WK 4'].map((wk) => ({ label: wk, count: 0, scheduled: 0, completed: 0, cancelled: 0 }));

  const data: AppointmentTrendPoint[] = rawData.length > 0 ? rawData : defaultData;

  // SVG chart parameters matching exact design spec
  const viewBoxWidth = 360;
  const viewBoxHeight = 175;
  const paddingLeft = 45;
  const paddingRight = 45;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.count), 0);
  const yMax = maxVal > 0 ? Math.ceil(maxVal / 10) * 10 : 40;
  const yAxisValues = [yMax, Math.round(yMax * 0.75), Math.round(yMax * 0.5), Math.round(yMax * 0.25), 0];

  // Calculate coordinates for points
  const points = data.map((d, index) => {
    const denominator = data.length > 1 ? data.length - 1 : 1;
    const x = paddingLeft + (index / denominator) * chartWidth;
    const y = paddingTop + chartHeight - (Math.min(d.count, yMax) / yMax) * chartHeight;
    return { x, y, ...d };
  });

  // Construct smooth cubic bezier path
  const dPath = points.reduce((acc, point, index, array) => {
    if (index === 0) return `M ${point.x},${point.y}`;
    const prev = array[index - 1];
    const cp1x = prev.x + (point.x - prev.x) / 2;
    const cp1y = prev.y;
    const cp2x = prev.x + (point.x - prev.x) / 2;
    const cp2y = point.y;
    return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
  }, '');

  // Construct gradient area fill path from WK 1 x-coord to WK 4 x-coord
  const areaPath =
    points.length > 0
      ? `${dPath} L ${points[points.length - 1].x},${paddingTop + chartHeight} L ${points[0].x},${paddingTop + chartHeight} Z`
      : '';

  const activePoint = hoveredPoint !== null ? points[hoveredPoint] : null;

  return (
    <div className="flex-1 h-80 p-8 bg-white/70 rounded-[32px] shadow-[0px_8px_32px_0px_rgba(0,61,155,0.05)] outline outline-1 outline-offset-[-1px] outline-white/40 backdrop-blur-[10px] inline-flex flex-col justify-start items-start w-full">
      {/* Header */}
      <div className="self-stretch pb-4 flex flex-col justify-start items-start">
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="pr-2 inline-flex flex-col justify-start items-start">
            <div className="justify-center text-gray-700 text-sm font-medium font-['Inter'] uppercase leading-5 tracking-wider">
              APPOINTMENTS
              <br />
              TREND
            </div>
          </div>

          {/* Timeframe Dropdown Select */}
          <div className="pl-3 pr-8 py-2 relative inline-flex flex-col justify-center items-start">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="appearance-none bg-transparent border-none text-blue-900 text-sm font-bold font-['Inter'] leading-5 pr-6 focus:outline-none cursor-pointer hover:opacity-80"
            >
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="This Quarter">This Quarter</option>
            </select>
            <ChevronDown className="w-4 h-4 text-blue-900 absolute right-2 pointer-events-none stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="self-stretch flex-1 relative flex flex-col justify-center items-start w-full">
        <div className="self-stretch flex-1 relative w-full h-full">
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="appointmentsTrendBlueGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#003D9B" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#003D9B" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Y Axis Gridlines and Numerical Labels */}
            {yAxisValues.map((val) => {
              const y = paddingTop + chartHeight - (val / yMax) * chartHeight;
              return (
                <g key={val}>
                  {/* Gridline (draw for 30, 20, 10, 0) */}
                  {val <= 30 && (
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={viewBoxWidth - paddingRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                  )}
                  {/* Y-Axis Label */}
                  <text
                    x={paddingLeft - 12}
                    y={y + 4}
                    textAnchor="end"
                    className="text-gray-400 text-xs font-normal font-['Liberation_Mono'] fill-gray-400"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            {areaPath && <path d={areaPath} fill="url(#appointmentsTrendBlueGradient)" />}

            {/* Trend Line */}
            {dPath && (
              <path
                d={dPath}
                fill="none"
                stroke="#003D9B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points (Dots) */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPoint === idx;
              return (
                <g key={idx}>
                  {/* Invisible hit box for hover */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="12"
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Visible Dark Blue Dot */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? '5.5' : '3.8'}
                    fill="#003D9B"
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                </g>
              );
            })}

            {/* X Axis Labels */}
            {points.map((pt, idx) => (
              <text
                key={idx}
                x={pt.x}
                y={viewBoxHeight - 6}
                textAnchor="middle"
                className="text-gray-500 text-[10px] font-normal font-['Liberation_Mono'] fill-gray-500"
              >
                {pt.label}
              </text>
            ))}

            {/* Hover Callout Badge */}
            {activePoint && (
              <g
                transform={`translate(${activePoint.x}, ${Math.max(16, activePoint.y - 12)})`}
                className="pointer-events-none transition-all duration-150"
              >
                <rect
                  x="-30"
                  y="-18"
                  width="60"
                  height="20"
                  rx="5"
                  fill="#0F172A"
                />
                <text
                  x="0"
                  y="-4"
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="9.5"
                  fontWeight="700"
                  fontFamily="Inter, sans-serif"
                >
                  {activePoint.count} Appts
                </text>
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
};



