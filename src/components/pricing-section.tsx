"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const plans = [
  {
    name: "Starter",
    description: "Perfect for indie hackers",
    price: { monthly: 19, yearly: 15 },
    features: ["5 integrations", "Real-time dashboard", "Basic analytics", "Email support", "7-day data history"],
  },
  {
    name: "Pro",
    description: "For growing SaaS businesses",
    price: { monthly: 49, yearly: 39 },
    popular: true,
    features: [
      "Unlimited integrations",
      "AI-powered insights",
      "Advanced analytics",
      "Priority support",
      "90-day data history",
      "Custom reports",
      "Team collaboration",
    ],
  },
  {
    name: "Enterprise",
    description: "For larger teams",
    price: { monthly: 99, yearly: 79 },
    features: [
      "Everything in Pro",
      "Dedicated account manager",
      "Custom integrations",
      "SSO / SAML",
      "Unlimited data history",
      "SLA guarantee",
      "On-premise option",
    ],
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true)
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
    <section id="pricing" className="py-20 lg:py-32 bg-muted/30 border-y border-border">
      <div ref={sectionRef} className="container mx-auto px-4 sm:px-6 lg:px-8 opacity-0">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="text-sm font-medium text-accent mb-4 block">Pricing</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Start free, upgrade when you're ready. No hidden fees.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              !isYearly ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={cn("relative w-14 h-7 rounded-full transition-colors", isYearly ? "bg-accent" : "bg-muted")}
          >
            <div
              className={cn(
                "absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform",
                isYearly ? "translate-x-8" : "translate-x-1",
              )}
            />
          </button>
          <span
            className={cn(
              "text-sm font-medium transition-colors",
              isYearly ? "text-foreground" : "text-muted-foreground",
            )}
          >
            Yearly
            <span className="ml-1.5 text-xs text-accent font-semibold">Save 20%</span>
          </span>
        </div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                "relative p-6 rounded-xl border bg-card transition-all",
                plan.popular
                  ? "border-accent shadow-lg scale-105"
                  : "border-border hover:border-accent/50 hover:shadow-md",
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">${isYearly ? plan.price.yearly : plan.price.monthly}</span>
                <span className="text-muted-foreground">/month</span>
                {isYearly && <p className="text-xs text-muted-foreground mt-1">Billed annually</p>}
              </div>

              <Button
                className={cn(
                  "w-full mb-6",
                  plan.popular ? "" : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
                )}
              >
                Get Started
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
