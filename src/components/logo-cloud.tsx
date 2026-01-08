"use client"

import { useEffect, useRef } from "react"

const companies = ["Vercel", "Linear", "Notion", "Stripe", "Loom", "Figma", "Raycast", "Cal.com"]

export function LogoCloud() {
  const containerRef = useRef<HTMLDivElement>(null)

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

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section className="py-16 lg:py-20 border-y border-border bg-muted/30">
      <div ref={containerRef} className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0">
        <p className="text-center text-sm text-muted-foreground mb-8">
          Trusted by <span className="font-semibold text-foreground">2,500+</span> SaaS founders worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {companies.map((company) => (
            <div
              key={company}
              className="text-xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              {company}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
