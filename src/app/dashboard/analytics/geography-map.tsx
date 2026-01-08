"use client"

import { Globe } from "lucide-react"

interface GeographyMapProps {
  geoData: any[];
}

// A partial mapping of country codes to names
const countryNames: { [key: string]: string } = {
  'US': 'United States',
  'IN': 'India',
  'GB': 'United Kingdom',
  'DE': 'Germany',
  'CA': 'Canada',
  // Add more mappings as needed
};

export function GeographyMap({ geoData }: GeographyMapProps) {
  
  const totalVisitors = geoData.reduce((acc, country) => acc + (country.activeUsers || 0), 0);

  const countries = geoData.map(country => {
    const code = country.dimension;
    const visitors = country.activeUsers || 0;
    const percentage = totalVisitors > 0 ? (visitors / totalVisitors) * 100 : 0;

    return {
      name: countryNames[code] || code,
      code: code,
      visitors: visitors.toLocaleString(),
      percentage: percentage,
    };
  });
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
                <span className="text-sm font-semibold w-10 text-right">{country.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-500"
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
