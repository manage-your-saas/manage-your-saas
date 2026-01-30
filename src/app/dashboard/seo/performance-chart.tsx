"use client"

import { useState, useMemo } from "react"
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"

interface ChartData {
  date: string
  clicks?: number
  impressions?: number
  ctr?: number
  position?: number
}

export function PerformanceChart({ data = [], selectedRange = "7daysAgo" }: { data: any[], selectedRange: string }) {
  const [selectedMetrics, setSelectedMetrics] = useState(['clicks', 'impressions'])

  const chartData = useMemo(() => {
    let chartDataToSet = [];
    if (data && data.length > 0) {
      chartDataToSet = data.map(item => ({
        date: item.date || item.day || item.time || '',
        clicks: item.clicks || 0,
        impressions: item.impressions || 0,
        ctr: item.ctr || 0,
        position: item.position || 0
      }));
    } else {
      const days = parseInt(selectedRange.replace('daysAgo', ''), 10);
      const emptyData = [];
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        emptyData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          clicks: 0,
          impressions: 0,
          ctr: 0,
          position: 0
        });
      }
      chartDataToSet = emptyData.reverse();
    }
    return chartDataToSet;
  }, [data, selectedRange]);

  const metrics = [
    { id: 'clicks', label: 'Clicks', color: '#3b82f6' },
    { id: 'impressions', label: 'Impressions', color: '#10b981' },
    { id: 'ctr', label: 'CTR', color: '#f59e0b' },
    { id: 'position', label: 'Position', color: '#ef4444' }
  ];

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => 
      prev.includes(metricId) 
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const formatValue = (value: any, metricId: string) => {
    if (metricId === 'ctr') return `${Number(value).toFixed(2)}%`;
    if (metricId === 'position') return Number(value).toFixed(1);
    return Number(value).toLocaleString();
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold">Performance Trends</h3>
          <div className="flex flex-wrap gap-2">
            {metrics.map((metric) => (
              <button
                key={metric.id}
                onClick={() => toggleMetric(metric.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedMetrics.includes(metric.id)
                    ? 'bg-accent text-accent-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {metric.label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="opacity-50" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: any) => {
                  // Use the first selected metric for Y-axis formatting
                  const firstMetricId = selectedMetrics[0] || 'clicks';
                  return formatValue(value, firstMetricId);
                }}
              />
              <Tooltip 
                formatter={(value: any, name?: string) => {
                  const metric = metrics.find(m => m.label === name);
                  return [formatValue(value, metric?.id || ''), name || ''];
                }}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{ 
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: 'hsl(var(--foreground))'
                }}
              />
              {selectedMetrics.map((metricId) => {
                const metric = metrics.find(m => m.id === metricId);
                if (!metric) return null;
                return (
                  <Line
                    key={metricId}
                    type="monotone"
                    dataKey={metricId}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: metric.color }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}