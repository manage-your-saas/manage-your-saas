"use client"

import { useState } from "react"
import { Search, BarChart3, CreditCard, Zap } from "lucide-react"

const integrations = [
  {
    id: "search-console",
    name: "Search Console",
    icon: Search,
    color: "bg-amber-500",
    active: true,
  },
  {
    id: "analytics",
    name: "Google Analytics",
    icon: BarChart3,
    color: "bg-orange-500",
    active: false,
  },
  {
    id: "stripe",
    name: "Stripe",
    icon: CreditCard,
    color: "bg-violet-500",
    active: false,
  },
]

export function IntegrationSwitcher() {
  const [activeIntegration, setActiveIntegration] = useState("search-console")

  return (
    <div className="animate-fade-up">
      <div className="flex flex-wrap gap-3">
        {integrations.map((integration) => {
          const Icon = integration.icon
          const isActive = activeIntegration === integration.id

          return (
            <button
              key={integration.id}
              onClick={() => setActiveIntegration(integration.id)}
              className={`
                group flex items-center gap-3 px-5 py-3 rounded-xl border transition-all duration-300
                ${
                  isActive
                    ? "bg-card border-accent shadow-lg shadow-accent/10 scale-[1.02]"
                    : "bg-card/50 border-border hover:border-accent/50 hover:bg-card hover:shadow-md"
                }
              `}
            >
              <div
                className={`
                w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-300
                ${integration.color}
                ${isActive ? "scale-110" : "group-hover:scale-105"}
              `}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p
                  className={`text-sm font-medium transition-colors ${isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}
                >
                  {integration.name}
                </p>
                <p className="text-xs text-muted-foreground">{isActive ? "Connected" : "Click to view"}</p>
              </div>
              {isActive && (
                <div className="ml-2">
                  <Zap className="w-4 h-4 text-accent animate-pulse" />
                </div>
              )}
            </button>
          )
        })}

        <button className="flex items-center gap-2 px-5 py-3 rounded-xl border border-dashed border-border hover:border-accent/50 hover:bg-card/50 transition-all duration-300 text-muted-foreground hover:text-foreground">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <span className="text-xl font-light">+</span>
          </div>
          <span className="text-sm font-medium">Add Integration</span>
        </button>
      </div>
    </div>
  )
}
