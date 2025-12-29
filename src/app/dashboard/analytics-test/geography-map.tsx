"use client"

import { Globe } from "lucide-react"

const countries = [
  { name: "United States", code: "US", visitors: "4,521", percentage: 35 },
  { name: "India", code: "IN", visitors: "2,847", percentage: 22 },
  { name: "United Kingdom", code: "GB", visitors: "1,923", percentage: 15 },
  { name: "Germany", code: "DE", visitors: "1,234", percentage: 10 },
  { name: "Canada", code: "CA", visitors: "987", percentage: 8 },
  { name: "Others", code: "XX", visitors: "1,335", percentage: 10 },
]

export function GeographyMap() {
  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "350ms" }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold">Geography</h3>
          <p className="text-sm text-muted-foreground mt-1">Visitors by country</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Globe className="w-5 h-5 text-blue-600" />
        </div>
      </div>

      <div className="space-y-4">
        {countries.map((country) => (
          <div key={country.code} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.code === "XX" ? "🌍" : getFlagEmoji(country.code)}</span>
                <span className="text-sm font-medium">{country.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">{country.visitors}</span>
                <span className="text-sm font-semibold w-10 text-right">{country.percentage}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                style={{ width: `${country.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}
