"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface GrowthChartProps {
  growthData: any[];
  selectedRange: string;
}

const metrics = [
  { key: "activeUsers", label: "Users", color: "#3B82F6" },
  { key: "sessions", label: "Conversions", color: "#10B981" },
];

export function GrowthChart({ growthData = [], selectedRange }: GrowthChartProps) {
  const [activeMetrics, setActiveMetrics] = useState(["activeUsers", "sessions"]);

  const toggleMetric = (key: string) => {
    setActiveMetrics((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const processedData = (() => {
    const days = parseInt(selectedRange.replace('daysAgo', ''));
    const fullRange = Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().slice(0, 10).replace(/-/g, '');
    }).reverse();

    const dataMap = new Map(growthData.map(row => [row.dimension, row]));

    return fullRange.map(dateStr => {
      const date = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
      const row = dataMap.get(dateStr);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activeUsers: row?.activeUsers || 0,
        sessions: row?.sessions || 0,
      };
    });
  })();

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "150ms" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Growth Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">Users and conversions over time</p>
        </div>
        <div className="flex items-center gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeMetrics.includes(metric.key)
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: metric.color, opacity: activeMetrics.includes(metric.key) ? 1 : 0.4 }}
              />
              {metric.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="opacity-50" />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              tick={{  fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
            />
            <Tooltip
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
              formatter={(value: any, name?: string) => {
                return [Number(value).toLocaleString(), name || ''];
              }}
            />
            {metrics.map(
              (metric) =>
                activeMetrics.includes(metric.key) && (
                  <Line
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={2}
                    dot={{ r: 3, fill: metric.color }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                ),
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
