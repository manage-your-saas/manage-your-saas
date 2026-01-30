"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface MarketDistributionProps {
  marketData?: {
    metric: 'users' | 'conversions' | 'revenue';
    title: string;
    data: Array<{
      country: string;
      users: number;
      conversions: number;
      revenue: number;
    }>;
  };
}

export function MarketDistribution({ marketData }: MarketDistributionProps) {
  // Default data with 0 values if no data provided
  const data = marketData?.data || [];
  const metric = marketData?.metric || 'users';
  const title = marketData?.title || 'Top Countries by Users';

  if (data.length === 0) {
    // Show UI with 0 values instead of empty state
    const emptyData = [
      { country: 'No Data', users: 0, conversions: 0, revenue: 0 }
    ];
    
    return (
      <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
        <div className="mb-6">
          <h3 className="text-lg font-heading font-semibold">Market Distribution</h3>
          <p className="text-sm text-muted-foreground mt-1">Top Countries Driving Growth</p>
        </div>
        
        <div className="h-48 flex items-center justify-center mb-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-muted-foreground mb-2">0</div>
            <div className="text-sm text-muted-foreground">No geographic data available</div>
          </div>
        </div>

        {/* Summary Table with 0 values */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 font-medium text-muted-foreground">Country</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Users</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Conversions</th>
                <th className="text-right py-2 font-medium text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-2 font-medium">No Data</td>
                <td className="text-right py-2">0</td>
                <td className="text-right py-2">0</td>
                <td className="text-right py-2">$0</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary Stats */}
        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total {title.split('by ')[1]}</span>
            <span className="font-semibold">0</span>
          </div>
        </div>
      </div>
    );
  }

  const formatValue = (value: number, metric: string) => {
    if (metric === "revenue") {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const getBarColor = (metric: string) => {
    switch (metric) {
      case "revenue": return "#10B981"; // emerald for revenue
      case "conversions": return "#3B82F6"; // blue for conversions
      case "users": return "#8B5CF6"; // violet for users
      default: return "#6B7280"; // gray
    }
  };

  return (  
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold">Market Distribution</h3>
        <p className="text-sm text-muted-foreground mt-1">Top Countries Driving Growth</p>
      </div>

      {/* Dynamic Title */}
      <div className="mb-6">
        <h4 className="text-base font-medium text-accent-foreground">{title}</h4>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="h-[300px] mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={data} 
            layout="horizontal"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="opacity-50" />
            <XAxis 
              type="number"
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              tickFormatter={(value) => {
                if (metric === "revenue") {
                  return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
                }
                return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
              }}
            />
            <YAxis 
              type="category"
              dataKey="country"
              axisLine={{ stroke: '#e2e8f0' }}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              width={70}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#ffffff', 
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
                return [formatValue(Number(value), metric), title.split('by ')[1] || name];
              }}
            />
            <Bar 
              dataKey={metric} 
              fill={getBarColor(metric)}
              radius={[0, 4, 4, 0]}
              animationDuration={1000}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 font-medium text-muted-foreground">Country</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Users</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Conversions</th>
              <th className="text-right py-2 font-medium text-muted-foreground">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((country, index) => (
              <tr key={country.country} className="border-b border-border/50 last:border-0">
                <td className="py-2 font-medium">{country.country}</td>
                <td className="text-right py-2">{country.users.toLocaleString()}</td>
                <td className="text-right py-2">{country.conversions.toLocaleString()}</td>
                <td className="text-right py-2">${country.revenue.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total {title.split('by ')[1]}</span>
          <span className="font-semibold">
            {formatValue(
              data?.reduce((sum, c) => sum + (c[metric] || 0), 0) || 0,
              metric
            )}
          </span>
        </div>
      </div>
    </div>
  )
}
