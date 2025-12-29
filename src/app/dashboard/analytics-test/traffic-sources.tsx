"use client"

import { Globe, Search, Share2, Mail, MousePointerClick } from "lucide-react"

const sources = [
  { name: "Organic Search", value: 45, visitors: "5,782", icon: Search, color: "blue" },
  { name: "Direct", value: 28, visitors: "3,594", icon: Globe, color: "emerald" },
  { name: "Social Media", value: 15, visitors: "1,927", icon: Share2, color: "violet" },
  { name: "Referral", value: 8, visitors: "1,028", icon: MousePointerClick, color: "amber" },
  { name: "Email", value: 4, visitors: "514", icon: Mail, color: "rose" },
]

const colorMap: Record<string, string> = {
  blue: "bg-blue-500",
  emerald: "bg-emerald-500",
  violet: "bg-violet-500",
  amber: "bg-amber-500",
  rose: "bg-rose-500",
}

export function TrafficSources() {
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
              { elements: [] as JSX.Element[], offset: 0 },
            ).elements
          }
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-heading font-bold">12.8K</span>
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
                <span className="text-sm font-semibold w-10 text-right">{source.value}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
