"use client"

import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"

const pages = [
  { path: "/", title: "Homepage", views: "8,234", change: "+12.3%", trend: "up" },
  { path: "/pricing", title: "Pricing", views: "4,521", change: "+8.7%", trend: "up" },
  { path: "/features", title: "Features", views: "3,892", change: "+5.2%", trend: "up" },
  { path: "/blog/seo-tips", title: "SEO Tips Guide", views: "2,847", change: "+22.1%", trend: "up" },
  { path: "/contact", title: "Contact Us", views: "1,923", change: "-3.4%", trend: "down" },
  { path: "/docs/getting-started", title: "Getting Started", views: "1,654", change: "+15.8%", trend: "up" },
]

export function TopPages() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "300ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Top Pages</h3>
          <p className="text-sm text-muted-foreground mt-1">Most visited pages this period</p>
        </div>
        <button className="text-sm text-accent hover:underline flex items-center gap-1">
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      <div className="space-y-3">
        {pages.map((page, index) => (
          <div
            key={page.path}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground group-hover:bg-accent group-hover:text-white transition-colors">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{page.title}</p>
              <p className="text-xs text-muted-foreground truncate">{page.path}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{page.views}</p>
              <div
                className={`flex items-center justify-end gap-1 text-xs ${
                  page.trend === "up" ? "text-emerald-600" : "text-red-500"
                }`}
              >
                {page.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {page.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
