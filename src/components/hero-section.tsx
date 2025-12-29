"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { DashboardPreview } from "@/components/dashboard-preview"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-up")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = heroRef.current?.querySelectorAll(".animate-on-scroll")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-on-scroll opacity-0 stagger-1">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium border border-border hover:bg-muted/80 transition-colors cursor-pointer group"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-red-500" />
              New: AI-powered insights
              <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="animate-on-scroll opacity-0 stagger-2 text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-[1.1] mb-6">
            One dashboard to manage{" "}
            <span className="relative">
              <span className="text-accent">your entire SaaS</span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 300 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 8.5C50 3.5 150 1 298 8.5"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="text-accent/30"
                />
              </svg>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-on-scroll opacity-0 stagger-3 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed text-balance">
            Stop switching between Google Analytics, Search Console, Stripe, Reddit, LinkedIn, and X. Get everything you
            need — social reach, SEO, traffic, signups, and revenue — in one simple place.
          </p>

          {/* CTAs */}
          <div className="animate-on-scroll opacity-0 stagger-4 flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button size="lg" className="w-full sm:w-auto text-base font-medium group">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base font-medium group bg-transparent">
              <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Social proof */}
          <div className="animate-on-scroll opacity-0 stagger-5 flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <p>
              <span className="font-semibold text-foreground">2,500+</span> founders already using it
            </p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="animate-on-scroll opacity-0 stagger-6 mt-16 lg:mt-24">
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}
