"use client"

import { useEffect, useRef } from "react"

const integrations = [
  { name: "Google Analytics", color: "bg-orange-500" , logo:"/google-analytics-icon.svg"},
  { name: "Search Console", color: "bg-blue-500" ,logo:"/google-search-console-icon.svg"},
  { name: "Dodo Payments", color: "bg-lime-500" ,logo:"/Dodo.svg"},
  { name: "LinkedIn", color: "bg-blue-600" ,logo:"/linkedin-icon.svg"},
  { name: "Reddit", color: "bg-orange-600" ,logo:"/reddit-icon.svg"},
  { name: "X (Twitter)", color: "bg-foreground" ,logo:"/twitter-icon.svg"},
  { name: "Slack", color: "bg-pink-500" ,logo:"/slack-icon.svg"},
  { name: "Gmail", color: "bg-red-500" ,logo:"/gmail-icon.svg"},
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
                  className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <img src={`${integration.logo}`} className="w-8 h-8" alt="" />
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
