"use client"

import React from 'react';
import { Globe, Search, Share2, Mail, MousePointerClick } from "lucide-react";

interface TrafficSourcesProps {
  trafficSources: any[];  
}

const sourceDetailsMap: { [key: string]: { icon: React.ElementType; color: string; name: string; category: string } } = {
  // Organic
  'google': { icon: Search, color: 'emerald', name: 'Google', category: 'organic' },
  'bing': { icon: Search, color: 'emerald', name: 'Bing', category: 'organic' },
  'yahoo': { icon: Search, color: 'emerald', name: 'Yahoo', category: 'organic' },
  'duckduckgo': { icon: Search, color: 'emerald', name: 'DuckDuckGo', category: 'organic' },
  
  // Direct
  '(direct)': { icon: Globe, color: 'blue', name: 'Direct', category: 'direct' },
  
  // Social
  'facebook': { icon: Share2, color: 'violet', name: 'Facebook', category: 'social' },
  't.co': { icon: Share2, color: 'violet', name: 'Twitter', category: 'social' },
  'instagram': { icon: Share2, color: 'violet', name: 'Instagram', category: 'social' },
  'linkedin': { icon: Share2, color: 'violet', name: 'LinkedIn', category: 'social' },
  'youtube': { icon: Share2, color: 'violet', name: 'YouTube', category: 'social' },
  
  // Paid
  'cpc': { icon: MousePointerClick, color: 'amber', name: 'Paid Search', category: 'paid' },
  'ppc': { icon: MousePointerClick, color: 'amber', name: 'Paid Ads', category: 'paid' },
  'googleadwords': { icon: MousePointerClick, color: 'amber', name: 'Google Ads', category: 'paid' },
  
  // Referral
  'referral': { icon: MousePointerClick, color: 'rose', name: 'Referral', category: 'referral' },
  
  // Other
  '(other)': { icon: Share2, color: 'gray', name: 'Other', category: 'other' },
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
}

export function TrafficSources({ trafficSources }: TrafficSourcesProps) {
  // Default to empty array if no data
  const trafficData = trafficSources || [];
  
  // Group sources by category
  const categoryMap = new Map<string, number>();
  
  trafficData.forEach(source => {
    const sourceName = source.dimension;
    const details = Object.entries(sourceDetailsMap).find(([key]) => sourceName.includes(key))?.[1] 
                    || { category: 'other', name: sourceName };
    const sessions = source.sessions || 0;
    
    const currentCategory = categoryMap.get(details.category) || 0;
    categoryMap.set(details.category, currentCategory + sessions);
  });

  // Define main categories with their display info
  const mainCategories = [
    { key: 'organic', name: 'Organic', icon: Search, color: 'emerald' },
    { key: 'direct', name: 'Direct', icon: Globe, color: 'blue' },
    { key: 'social', name: 'Social', icon: Share2, color: 'violet' },
    { key: 'paid', name: 'Paid', icon: MousePointerClick, color: 'amber' }
  ];

  const totalVisitors = Array.from(categoryMap.values()).reduce((acc, val) => acc + val, 0);

  const sources = mainCategories.map(category => {
    const visitors = categoryMap.get(category.key) || 0;
    const value = totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0;

    return {
      name: category.name,
      value: value,
      visitors: visitors.toLocaleString(),
      icon: category.icon,
      color: category.color,
    };
  }).sort((a, b) => b.value - a.value);

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "200ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold">Traffic Sources</h3>
        <p className="text-sm text-muted-foreground mt-1">Where your users come from</p>
      </div>

      {/* Simple Bar Chart */}
      <div className="space-y-3 mb-6">
        {sources.map((source) => {
          const Icon = source.icon;
          return (
            <div key={source.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{source.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{source.visitors}</span>
                  <span className="text-sm font-semibold w-10 text-right">{source.value.toFixed(1)}%</span>
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorMap[source.color]} transition-all duration-1000 ease-out`}
                  style={{ width: `${source.value}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Total Sessions</span>
          <span className="font-semibold">{totalVisitors.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
