"use client"

import { Activity, Users, Monitor, Smartphone, Tablet } from "lucide-react"

const activePages = [
  { page: "/pricing", users: 12 },
  { page: "/features", users: 8 },
  { page: "/", users: 15 },
  { page: "/blog/seo-tips", users: 6 },
  { page: "/docs", users: 6 },
]

export function RealTimeUsers() {
  return (
    <div
      className="bg-gradient-to-r from-blue-500/10 via-violet-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 p-4 animate-fade-up"
      style={{ animationDelay: "50ms" }}
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Live Counter */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-background animate-pulse" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-heading font-bold">47</span>
              <span className="text-sm text-muted-foreground">users online</span>
            </div>
            <p className="text-sm text-muted-foreground">Real-time active visitors</p>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">28</span>
            <span className="text-xs text-muted-foreground">Desktop</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">15</span>
            <span className="text-xs text-muted-foreground">Mobile</span>
          </div>
          <div className="flex items-center gap-2">
            <Tablet className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">4</span>
            <span className="text-xs text-muted-foreground">Tablet</span>
          </div>
        </div>

        {/* Active Pages */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {activePages.map((item) => (
            <div
              key={item.page}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background/50 border border-border whitespace-nowrap"
            >
              <span className="text-xs font-medium truncate max-w-24">{item.page}</span>
              <span className="flex items-center gap-1 text-xs text-blue-600 font-semibold">
                <Users className="w-3 h-3" />
                {item.users}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
