"use client"

import { useState } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsChartProps {
  chartData: any[];
  selectedRange: string;
}

const metrics = [
  { key: "activeUsers", label: "Users", color: "#3B82F6" },
  { key: "sessions", label: "Sessions", color: "#8B5CF6" },
  { key: "screenPageViews", label: "Page Views", color: "#10B981" },
];

export function AnalyticsChart({ chartData = [], selectedRange }: AnalyticsChartProps) {
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

    const dataMap = new Map(chartData.map(row => [row.dimension, row]));

    return fullRange.map(dateStr => {
      const date = new Date(`${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`);
      const row = dataMap.get(dateStr);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        activeUsers: row?.activeUsers || 0,
        sessions: row?.sessions || 0,
        screenPageViews: row?.screenPageViews || 0,
      };
    });
  })();

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Traffic Overview</h3>
          <p className="text-sm text-muted-foreground mt-1">User activity over time</p>
        </div>
        <div className="flex items-center gap-2">
          {metrics.map((metric) => (
            <button
              key={metric.key}
              onClick={() => toggleMetric(metric.key)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeMetrics.includes(metric.key)
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
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

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={processedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {metrics.map((metric) => (
                <linearGradient key={metric.key} id={`gradient-${metric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metric.color} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={metric.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              dx={-10}
              tickFormatter={(value) => (value >= 1000 ? `${value / 1000}k` : value)}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
                      <p className="text-sm font-semibold mb-2">{label}</p>
                      {payload.map((entry: any) => (
                        <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                          <span className="text-muted-foreground">{entry.name}:</span>
                          <span className="font-semibold">{entry.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )
                }
                return null
              }}
            />
            {metrics.map(
              (metric) =>
                activeMetrics.includes(metric.key) && (
                  <Area
                    key={metric.key}
                    type="monotone"
                    dataKey={metric.key}
                    name={metric.label}
                    stroke={metric.color}
                    strokeWidth={2}
                    fill={`url(#gradient-${metric.key})`}
                  />
                ),
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
