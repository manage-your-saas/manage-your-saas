"use client"

import { useState, useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

interface ChartData {
  date: string
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

export function PerformanceChart({ data = [], selectedRange = "7daysAgo" }: { data: any[], selectedRange: string }) {
  const [showImpressions, setShowImpressions] = useState(true)
  const [showClicks, setShowClicks] = useState(true)
  const [showCTR, setShowCTR] = useState(false)
  const [showPosition, setShowPosition] = useState(false)

  const chartData = useMemo(() => {
    let chartDataToSet = [];
    if (data && data.length > 0) {
      chartDataToSet = data.map(item => ({
        date: item.date || item.day || item.time || '',
        clicks: showClicks ? (item.clicks || 0) : undefined,
        impressions: showImpressions ? (item.impressions || 0) : undefined,
        ctr: showCTR ? (item.ctr || 0) : undefined,
        position: showPosition ? (item.position || 0) : undefined
      }));
    } else {
      const days = parseInt(selectedRange.replace('daysAgo', ''), 10);
      const emptyData = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          clicks: showClicks ? 0 : undefined,
          impressions: showImpressions ? 0 : undefined,
          ctr: showCTR ? 0 : undefined,
          position: showPosition ? 0 : undefined
        });
      }
      chartDataToSet = emptyData.reverse();
    }
    return chartDataToSet;
  }, [data, showClicks, showImpressions, showCTR, showPosition, selectedRange]);

  return (
    <div className="p-6 bg-gray-50/50 rounded-xl border border-gray-100">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Performance Over Time</h3>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showImpressions}
                onChange={() => setShowImpressions(!showImpressions)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500"
              />
              <span>Impressions</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showClicks}
                onChange={() => setShowClicks(!showClicks)}
                className="h-4 w-4 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
              />
              <span>Clicks</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showCTR}
                onChange={() => setShowCTR(!showCTR)}
                className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-500"
              />
              <span>CTR</span>
            </label>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showPosition}
                onChange={() => setShowPosition(!showPosition)}
                className="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500"
              />
              <span>Position</span>
            </label>
          </div>
        </div>

        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 60, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="impressionsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a5b4fc" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a5b4fc" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#86efac" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#86efac" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="ctrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fde047" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fde047" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="positionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fca5a5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#fca5a5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#a5b4fc"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                stroke="#86efac" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'ctr') return [`${Number(value).toFixed(2)}%`, 'CTR']
                  if (name === 'position') return [Number(value).toFixed(1), 'Position']
                  return [value, name]
                }}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
                labelStyle={{ 
                  fontWeight: 'bold',
                  marginBottom: '8px',
                  color: '#374151'
                }}
              />
              <Legend />
              
              {showImpressions && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="impressions"
                  name="Impressions"
                  stroke="#a5b4fc"
                  fillOpacity={1}
                  fill="url(#impressionsGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={1500}
                />
              )}
              
              {showClicks && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="clicks"
                  name="Clicks"
                  stroke="#86efac"
                  fillOpacity={1}
                  fill="url(#clicksGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={1500}
                />
              )}
              
              {showCTR && (
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="ctr"
                  name="CTR"
                  stroke="#fde047"
                  fillOpacity={1}
                  fill="url(#ctrGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={1500}
                />
              )}
              
              {showPosition && (
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="position"
                  name="Position"
                  stroke="#fca5a5"
                  fillOpacity={1}
                  fill="url(#positionGradient)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  animationDuration={1500}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}