"use client"

import { useState } from "react"
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, ExternalLink, FileText, Globe, Monitor } from "lucide-react"

const tabs = [
  { id: "queries", label: "Queries", icon: Search },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "countries", label: "Countries", icon: Globe },
  { id: "devices", label: "Devices", icon: Monitor },
]

const queriesData = [
  { rank: 1, query: "inter freight", clicks: 1, impressions: 5, ctr: 20.0, position: 4.8 },
  { rank: 2, query: "interfreight forwarders", clicks: 1, impressions: 13, ctr: 7.69, position: 5.0 },
  { rank: 3, query: "forwarder in logistics", clicks: 0, impressions: 1, ctr: 0.0, position: 2.0 },
  { rank: 4, query: "inter freight inc", clicks: 0, impressions: 2, ctr: 0.0, position: 8.0 },
  { rank: 5, query: "inter freight logistics", clicks: 0, impressions: 1, ctr: 0.0, position: 10.0 },
  { rank: 6, query: "interfreight", clicks: 0, impressions: 1, ctr: 0.0, position: 7.0 },
  { rank: 7, query: "interfreight forwarders pvt ltd", clicks: 0, impressions: 7, ctr: 0.0, position: 5.4 },
]

export function QueriesTable() {
  const [activeTab, setActiveTab] = useState("queries")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const filteredData = queriesData.filter((item) => item.query.toLowerCase().includes(searchQuery.toLowerCase()))

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortBy) return 0
    const aVal = a[sortBy as keyof typeof a]
    const bVal = b[sortBy as keyof typeof b]
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("desc")
    }
  }

  return (
    <div
      className="rounded-2xl bg-card border border-border overflow-hidden animate-fade-up"
      style={{ animationDelay: "250ms" }}
    >
      {/* Tabs */}
      <div className="border-b border-border bg-muted/30">
        <div className="flex items-center gap-0 px-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-accent rounded-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search & Controls */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter queries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent focus:bg-background transition-all"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {sortedData.length} {sortedData.length === 1 ? "result" : "results"}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Query
              </th>
              <th className="text-right px-4 py-4">
                <button
                  onClick={() => handleSort("clicks")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Clicks
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-4 py-4">
                <button
                  onClick={() => handleSort("impressions")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Impr.
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-4 py-4 hidden sm:table-cell">
                <button
                  onClick={() => handleSort("ctr")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  CTR
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
              <th className="text-right px-6 py-4">
                <button
                  onClick={() => handleSort("position")}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  Pos.
                  <ArrowUpDown className="w-3 h-3" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row) => (
              <tr
                key={row.rank}
                className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                      {row.rank}
                    </span>
                    <span className="font-medium group-hover:text-accent transition-colors">{row.query}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className={`font-semibold ${row.clicks > 0 ? "text-foreground" : "text-muted-foreground"}`}>
                    {row.clicks}
                  </span>
                </td>
                <td className="px-4 py-4 text-right text-muted-foreground">{row.impressions}</td>
                <td className="px-4 py-4 text-right hidden sm:table-cell">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      row.ctr > 0 ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {row.ctr.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span
                    className={`font-semibold ${
                      row.position <= 3
                        ? "text-emerald-600"
                        : row.position <= 10
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {row.position.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
        <p className="text-sm text-muted-foreground">Page 1 of 1</p>
        <div className="flex items-center gap-2">
          <button
            disabled
            className="p-2 rounded-lg border border-border text-muted-foreground disabled:opacity-50 hover:bg-muted transition-colors disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            disabled
            className="p-2 rounded-lg border border-border text-muted-foreground disabled:opacity-50 hover:bg-muted transition-colors disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
