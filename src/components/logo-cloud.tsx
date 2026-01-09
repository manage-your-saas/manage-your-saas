"use client"

import { useEffect, useRef } from "react"
import { ShieldCheck, Server, Lock } from "lucide-react"


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
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 underline decoration-wavy underline-offset-8 decoration-emerald-500/50">
            Your Trust is Our Foundation
          </h2>
          <p className="text-lg text-muted-foreground mb-12">
            We're committed to protecting your data, ensuring reliability, and respecting your privacy. Here's how:
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border border-border">
              <ShieldCheck className="w-10 h-10 text-emerald-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ironclad Security</h3>
              <p className="text-muted-foreground text-sm">
                We employ end-to-end encryption and industry-leading security protocols to keep your data safe, always.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border border-border">
              <Server className="w-10 h-10 text-blue-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Unwavering Reliability</h3>
              <p className="text-muted-foreground text-sm">
                Our robust infrastructure ensures high availability and consistent performance, so you can rely on us when it matters most.
              </p>
            </div>
            <div className="flex flex-col items-center p-6 bg-background rounded-lg border border-border">
              <Lock className="w-10 h-10 text-violet-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Privacy First</h3>
              <p className="text-muted-foreground text-sm">
                We are committed to your privacy. We never sell your data and give you full control over your information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
