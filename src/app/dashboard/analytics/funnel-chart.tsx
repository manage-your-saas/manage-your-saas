"use client"

import { ArrowDown, Users, Target, Zap } from "lucide-react"

interface FunnelChartProps {
  funnelData?: {
    visits: number
    signups: number
    activeUsers: number
  };
}

export function FunnelChart({ funnelData }: FunnelChartProps) {
  if (!funnelData) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6 h-full animate-pulse"></div>
    );
  }

  const steps = [
    {
      name: "Visit",
      value: funnelData.visits || 0,
      icon: Users,
      color: "bg-blue-500",
      description: "Website visitors"
    },
    {
      name: "Signup", 
      value: funnelData.signups || 0,
      icon: Target,
      color: "bg-emerald-500",
      description: "User signups"
    },
    {
      name: "Active",
      value: funnelData.activeUsers || 0,
      icon: Zap,
      color: "bg-amber-500",
      description: "Active users"
    }
  ];

  const calculateDropoff = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((previous - current) / previous * 100);
  };

  const maxValue = Math.max(...steps.map(step => step.value));

  return (
    <div className="bg-card rounded-2xl border border-border p-6 animate-fade-up" style={{ animationDelay: "250ms" }}>
      <div className="mb-6">
        <h3 className="text-lg font-heading font-semibold">Conversion Funnel</h3>
        <p className="text-sm text-muted-foreground mt-1">Visit → Signup → Active</p>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const width = maxValue > 0 ? (step.value / maxValue) * 100 : 0;
          const dropoff = index > 0 ? calculateDropoff(step.value, steps[index - 1].value) : 0;

          return (
            <div key={step.name} className="space-y-2">
              {/* Step Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${step.color} flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{step.name}</p>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{step.value.toLocaleString()}</p>
                  {index > 0 && dropoff > 0 && (
                    <p className="text-xs text-red-500">-{dropoff.toFixed(1)}%</p>
                  )}
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-8 bg-muted rounded-lg overflow-hidden">
                <div 
                  className={`h-full ${step.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${width}%` }}
                />
              </div>

              {/* Dropoff Arrow */}
              {index < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Funnel Summary */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall Conversion Rate</span>
          <span className="font-semibold">
            {funnelData.visits > 0 
              ? `${((funnelData.signups / funnelData.visits) * 100).toFixed(2)}%`
              : "0.00%"
            }
          </span>
        </div>
      </div>
    </div>
  )
}
