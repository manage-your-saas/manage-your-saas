"use client"

import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react"


interface TopPagesProps {
  topPages: any[];
}

export function TopPages({ topPages }: TopPagesProps) {
  if (!topPages || topPages.length === 0) {
    return <div className="bg-card rounded-2xl border border-border p-6 h-full animate-pulse"></div>;
  }

  const pages = topPages.map(page => ({
    path: page.dimension,
    views: (page.screenPageViews || 0).toLocaleString(),
  }));
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
              <p className="font-medium truncate">{page.path}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{page.views}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
