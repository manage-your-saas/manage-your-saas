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
  return (
    <section id="integrations" className="py-20 lg:py-32 bg-muted/30 border-y border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
