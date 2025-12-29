"use client"

import { useEffect, useRef } from "react"

const integrations = [
  { name: "Google Analytics", color: "bg-orange-500" },
  { name: "Search Console", color: "bg-blue-500" },
  { name: "Stripe", color: "bg-indigo-500" },
  { name: "LinkedIn", color: "bg-blue-600" },
  { name: "Reddit", color: "bg-orange-600" },
  { name: "X (Twitter)", color: "bg-foreground" },
  { name: "Slack", color: "bg-pink-500" },
  { name: "Gmail", color: "bg-red-500" },
  { name: "HubSpot", color: "bg-orange-500" },
  { name: "Mailchimp", color: "bg-yellow-500" },
  { name: "Intercom", color: "bg-blue-500" },
  { name: "Zendesk", color: "bg-green-500" },
]

export function IntegrationsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

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

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section id="integrations" className="py-20 lg:py-32 bg-muted/30 border-y border-border">
      <div ref={sectionRef} className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-accent mb-4 block">Integrations</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
            All your apps, unified
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Connect all your favorite tools and see everything in one place. We support 50+ integrations and growing.
          </p>
        </div>

        {/* Integration hub visualization */}
        <div className="relative max-w-4xl mx-auto">
          {/* Center hub */}
          <div className="relative flex items-center justify-center py-16">
            <div className="absolute w-64 h-64 rounded-full border border-border bg-background" />
            <div className="absolute w-48 h-48 rounded-full border border-border bg-background" />
            <div className="absolute w-32 h-32 rounded-full border border-border bg-background" />

            <div className="relative w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg z-10">
              <span className="text-2xl font-bold text-primary-foreground">M</span>
            </div>

            {/* Orbiting integrations */}
            <div className="absolute inset-0 animate-spin" style={{ animationDuration: "60s" }}>
              {integrations.slice(0, 6).map((integration, i) => {
                const angle = i * 60 * (Math.PI / 180)
                const x = Math.cos(angle) * 120
                const y = Math.sin(angle) * 120
                return (
                  <div
                    key={integration.name}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                    }}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${integration.color} flex items-center justify-center shadow-md animate-spin`}
                      style={{ animationDuration: "60s", animationDirection: "reverse" }}
                      title={integration.name}
                    >
                      <span className="text-xs font-bold text-white">{integration.name.charAt(0)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Integration list */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">
            {integrations.map((integration) => (
              <div
                key={integration.name}
                className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border hover:border-accent/50 hover:shadow-md transition-all group cursor-pointer"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${integration.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <span className="text-xs font-bold text-white">{integration.name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium truncate">{integration.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
