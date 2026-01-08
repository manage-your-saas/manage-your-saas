"use client"

import { useEffect, useRef } from "react"
import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "ManageYourSaaS saved me at least 10 hours a week. I used to jump between 8 different tabs just to get a sense of how my business was doing. Now it's all in one place.",
    author: "Sarah Chen",
    role: "Founder, DevTools.io",
    rating: 5,
  },
  {
    quote:
      "The AI insights are incredible. It spotted a drop in our conversion rate before I even noticed it and suggested fixes that actually worked.",
    author: "Marcus Johnson",
    role: "CEO, SaaSify",
    rating: 5,
  },
  {
    quote:
      "Finally, a dashboard that doesn't require a PhD to set up. Connected all my tools in under 5 minutes and had beautiful reports ready for my investors.",
    author: "Emily Rodriguez",
    role: "Founder, ContentStack",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll(".testimonial-card")
            cards.forEach((card, i) => {
              setTimeout(() => {
                card.classList.add("animate-fade-up")
              }, i * 150)
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
    <section id="testimonials" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-sm font-medium text-accent mb-4 block">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-balance">
            Loved by founders worldwide
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            See what other SaaS founders are saying about ManageYourSaaS.
          </p>
        </div>

        {/* Testimonials grid */}
        <div ref={sectionRef} className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.author}
              className="testimonial-card opacity-0 p-6 rounded-xl border border-border bg-card hover:shadow-lg transition-all"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-medium">
                  {testimonial.author.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{testimonial.author}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
