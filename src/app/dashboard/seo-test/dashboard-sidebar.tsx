"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Search,
  BarChart3,
  CreditCard,
  Globe,
  MessageSquare,
  Settings,
  HelpCircle,
  ChevronLeft,
  Zap,
  Plus,
} from "lucide-react"

const mainNav = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
  { id: "search-console", label: "Search Console", icon: Search, href: "/dashboard/seo-test" },
  { id: "analytics", label: "Google Analytics", icon: BarChart3, href: "/dashboard/analytics-test" },
  { id: "stripe", label: "Stripe", icon: CreditCard, href: "/dashboard/stripe-test" },
]

const socialNav = [
  { id: "twitter", label: "X (Twitter)", icon: Globe, href: "/dashboard" },
  { id: "linkedin", label: "LinkedIn", icon: Globe, href: "/dashboard" },
  { id: "reddit", label: "Reddit", icon: MessageSquare, href: "/dashboard" },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 bg-card border-r border-border z-40 transition-all duration-300 ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-amber-500 flex items-center justify-center shadow-lg shadow-accent/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            {!collapsed && <span className="font-heading font-bold text-lg">ManageYourSaaS</span>}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <ChevronLeft
              className={`w-4 h-4 text-muted-foreground transition-transform ${collapsed ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main */}
          <div>
            {!collapsed && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">
                Analytics
              </p>
            )}
            <div className="space-y-1">
              {mainNav.map((item) => {
                const Icon = item.icon
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                        isActive ? "bg-accent text-white" : "bg-muted group-hover:bg-accent/10"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    {!collapsed && (
                      <>
                        <span className="font-medium flex-1">{item.label}</span>
                        {isActive && <Zap className="w-4 h-4 text-accent" />}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Social */}
          <div>
            {!collapsed && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Social</p>
            )}
            <div className="space-y-1">
              {socialNav.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center group-hover:bg-accent/10 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Add Integration */}
          {!collapsed && (
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 border-dashed border-border hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 text-muted-foreground hover:text-foreground">
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-medium">Add Integration</span>
            </button>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border space-y-1">
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Settings className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </Link>
          <Link
            href="#"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            {!collapsed && <span className="font-medium">Help & Support</span>}
          </Link>
        </div>
      </aside>
    </>
  )
}
