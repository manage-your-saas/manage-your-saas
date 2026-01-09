"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Menu,
  Bell,
  Search,
  Command,
  User,
  ChevronDown,
  X,
  LayoutDashboard,
  BarChart3,
  CreditCard,
  Settings,
} from "lucide-react"

export function DashboardTopbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden p-2 hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden flex items-center">
            <img src="/myslogo.svg" alt="ManageYourSaaS" className="w-8 h-8" />
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl border border-border bg-muted/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent focus:bg-background transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">
                  <Command className="w-3 h-3 inline" />
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border font-mono">K</kbd>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-accent rounded-full border-2 border-background" />
            </button>

            {/* User Menu */}
            <button className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent/20 to-amber-500/20 flex items-center justify-center">
                <User className="w-4 h-4 text-accent" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Account</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-card border-r border-border shadow-xl animate-slide-in-left">
            <div className="h-16 flex items-center justify-between px-4 border-b border-border">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10  from-accent  flex items-center justify-center">
                  <img src="/myslogo.svg" alt="" />
                </div>
                <span className="font-heading font-bold text-lg">ManageYourSaaS</span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-muted transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-accent/10 text-accent"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <BarChart3 className="w-5 h-5" />
                <span className="font-medium">Analytics</span>
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <CreditCard className="w-5 h-5" />
                <span className="font-medium">Payments</span>
              </Link>
              <Link
                href="#"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Settings</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
