"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, Bell, Settings, User, ChevronDown } from "lucide-react"

export function DashboardHeader() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-background border-b border-border"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-accent-foreground font-bold text-sm">M</span>
            </div>
            <span className="font-heading font-bold text-lg">ManageYourSaaS</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              Home
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm text-foreground font-medium transition-colors rounded-lg bg-muted"
            >
              Dashboard
            </Link>
            <Link
              href="#"
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted"
            >
              Pricing
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="w-px h-6 bg-border mx-1" />
            <button className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-muted transition-colors">
              <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                <User className="w-4 h-4 text-accent" />
              </div>
              <span className="text-sm font-medium">Account</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-muted"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-2">
            <Link href="/" className="px-4 py-2 text-sm rounded-lg hover:bg-muted">
              Home
            </Link>
            <Link href="/dashboard" className="px-4 py-2 text-sm rounded-lg bg-muted font-medium">
              Dashboard
            </Link>
            <Link href="#" className="px-4 py-2 text-sm rounded-lg hover:bg-muted">
              Pricing
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
