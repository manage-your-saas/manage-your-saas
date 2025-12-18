import { Check, Zap, Crown, Infinity } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
const plans = [
  {
    name: "Solo",
    price: "$19",
    period: "/month",
    description: "For solo founders getting clarity on growth & revenue",
    features: [
      { text: "Connect Stripe", included: true, bg: "bg-purple-100" },
      { text: "Connect Search Console", included: true, bg: "bg-yellow-100" },
      { text: "Connect Google Analytics", included: true, bg: "bg-blue-100" },
      { text: "1 website", included: true },
      { text: "Core dashboards", included: true },
    ],
    cta: "Start Solo",
    popular: false,
    icon: Zap,
  },

  {
    name: "Growth",
    price: "$39",
    period: "/month",
    description: "For growing SaaS teams that need deeper insights",
    features: [
      { text: "Everything in Solo", included: true },
      { text: "Up to 3 websites", included: true },
      { text: "Full historical data", included: true },
      { text: "Daily auto-sync", included: true },
      { text: "Advanced insights & trends", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Start Growth",
    popular: true,
    icon: Crown,
  },

  {
    name: "Founder Pass",
    price: "$199",
    period: "one-time",
    limit:"Limited to first 100 customers",
    description: "Lifetime access for early believers — all future features included",
    features: [
      { text: "Everything in Growth", included: true },
      { text: "Unlimited lifetime access", included: true, bg: "bg-green-100" },
      { text: "All future integrations", included: true },
      { text: "Early access to new features", included: true },
      { text: "Private feedback & roadmap access", included: true },
      { text: "Reddit integration (coming soon)", included: true, comingSoon: true },
      { text: "X / Twitter integration (coming soon)", included: true, comingSoon: true },
      { text: "LinkedIn integration (coming soon)", included: true, comingSoon: true },
      { text: "Email & marketing tools (coming soon)", included: true, comingSoon: true },
    ],
    cta: "Get Founder Pass",
    popular: false,
    lifetime: true,
    icon: Infinity,
  },
];

export default function Pricing() {
  return (
    <div style={{fontFamily:"var(--font-story-script)"}} className="mt-12 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Choose you Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get instant access to our powerful <span className="font-bold text-gray-500">All-in-one SaaS dashboard.</span>
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card
                key={plan.name}
                className={`relative flex flex-col ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : plan.lifetime
                    ? "border-amber-500/50 bg-gradient-to-b from-amber-50/50 to-background dark:from-amber-950/20"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-xl text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                {plan.lifetime && (
                  <Badge className="absolute text-xl -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-white">
                    Best Value
                  </Badge>
                )}

                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-3 rounded-full bg-muted w-fit">
                    <Icon className={`w-6 h-6 ${plan.lifetime ? "text-amber-500" : "text-primary"}`} />
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-lg text-center">{plan.description}</CardDescription>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="text-center mb-6">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground ml-1">{plan.period}</span>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <Check
                          className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            feature.included
                              ? feature.comingSoon
                                ? "text-amber-500"
                                : "text-green-500"
                              : "text-muted-foreground/30"
                          }`}
                        />
                        <span
                          className={`text-lg ${feature.bg} p-1 rounded  ${
                            feature.included ? "text-foreground" : "text-muted-foreground line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>

                <CardFooter>
                  <Button
                    className={`w-full border-2 border-black ${
                      plan.lifetime
                        ? "bg-amber-500 hover:bg-amber-600 text-white"
                        : plan.popular
                        ? ""
                        : "variant-outline"
                    }`}
                    variant={plan.popular || plan.lifetime ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
                <CardDescription className="text-lg text-muted-foreground text-center">{plan.limit}</CardDescription>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Trust Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            All plans include 14-day money-back guarantee. No questions asked.
          </p>
        </div>
      </div>
    </div>
  );
}
