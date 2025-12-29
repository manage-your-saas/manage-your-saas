"use client"

import { useEffect, useRef } from "react"
import { BarChart3, Zap, Shield, Clock, LineChart, Bell, Layers, Target } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Unified Analytics",
    description:
      "See all your metrics from Google Analytics, Search Console, and social platforms in one beautiful dashboard.",
  },
  {
    icon: Zap,
    title: "Real-time Data",
    description: "Get instant updates on your revenue, signups, and traffic. No more waiting for reports to generate.",
  },
  {
    icon: Shield,
    title: "Secure Connections",
    description: "Your data is encrypted end-to-end. We never store your credentials, only secure OAuth tokens.",
  },
  {
    icon: Clock,
    title: "Save 10+ Hours Weekly",
    description: "Stop jumping between tabs. Everything you need to understand your business is in one place.",
  },
  {
    icon: LineChart,
    title: "Smart Insights",
    description: "AI-powered recommendations help you understand trends and take action on your data.",
  },
  {
    icon: Bell,
    title: "Custom Alerts",
    description: "Get notified when metrics hit your targets or when something needs your attention.",
  },
  {
    icon: Layers,
    title: "Beautiful Reports",
    description: "Generate stunning reports in seconds to share with your team or investors.",
  },
  {
    icon: Target,
    title: "Goal Tracking",
    description: "Set KPIs and track progress across all your platforms with visual goal indicators.",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll(".feature-card")
            elements.forEach((el, i) => {
              setTimeout(() => {
                el.classList.add("animate-scale-in")
              }, i * 100)
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-accent mb-4 block">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
            Everything you need to grow your SaaS
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Powerful features designed to help you understand your business better and make data-driven decisions
            faster.
          </p>
        </div>

        {/* Features grid */}
        <div ref={sectionRef} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="feature-card opacity-0 group p-6 rounded-xl border border-border bg-card hover:border-accent/50 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
