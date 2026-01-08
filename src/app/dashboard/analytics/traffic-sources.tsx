"use client"

import React from 'react';
import { Globe, Search, Share2, Mail, MousePointerClick } from "lucide-react";

interface TrafficSourcesProps {
  trafficSources: any[];
}

const sourceDetailsMap: { [key: string]: { icon: React.ElementType; color: string; name: string } } = {
  '(direct)': { icon: Globe, color: 'emerald', name: 'Direct' },
  'google': { icon: Search, color: 'blue', name: 'Google' },
  'bing': { icon: Search, color: 'cyan', name: 'Bing' },
  'facebook': { icon: Share2, color: 'violet', name: 'Facebook' },
  't.co': { icon: Share2, color: 'blue', name: 'Twitter' },
  'referral': { icon: MousePointerClick, color: 'amber', name: 'Referral' },
  'email': { icon: Mail, color: 'rose', name: 'Email' },
  '(other)': { icon: Share2, color: 'gray', name: 'Other' },
};

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
}

export function TrafficSources({ trafficSources }: TrafficSourcesProps) {
  if (!trafficSources || trafficSources.length === 0) {
    return <div className="bg-card rounded-2xl border border-border p-6 h-full animate-pulse"></div>;
  }

  const totalVisitors = trafficSources.reduce((acc, source) => acc + (source.sessions || 0), 0);

  const sources = trafficSources.map(source => {
    const sourceName = source.dimension;
    const details = Object.entries(sourceDetailsMap).find(([key]) => sourceName.includes(key))?.[1] 
                    || { icon: Globe, color: 'gray', name: sourceName };
    const visitors = source.sessions || 0;
    const value = totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0;

    return {
      name: details.name,
      value: value,
      visitors: visitors.toLocaleString(),
      icon: details.icon,
      color: details.color,
    };
  }).sort((a, b) => b.value - a.value);
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold">Traffic Sources</h3>
        <p className="text-sm text-muted-foreground mt-1">Where your visitors come from</p>
      </div>

      {/* Donut Chart Visual */}
      <div className="relative w-40 h-40 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {
            sources.reduce(
              (acc, source, index) => {
                const circumference = 2 * Math.PI * 35
                const strokeDasharray = (source.value / 100) * circumference
                const strokeDashoffset = -acc.offset

                acc.elements.push(
                  <circle
                    key={source.name}
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    strokeWidth="12"
                    className={colorMap[source.color]}
                    stroke="currentColor"
                    strokeDasharray={`${strokeDasharray} ${circumference}`}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />,
                )
                acc.offset += strokeDasharray

                return acc
              },
              { elements: [] as React.ReactElement[], offset: 0 },
            ).elements
          }
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-heading font-bold">{totalVisitors.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-3">
        {sources.map((source) => {
          const Icon = source.icon
          return (
            <div key={source.name} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${colorMap[source.color]}`} />
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{source.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{source.visitors}</span>
                <span className="text-sm font-semibold w-10 text-right">{source.value.toFixed(1)}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
