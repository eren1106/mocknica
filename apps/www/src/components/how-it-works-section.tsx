import { Card, CardContent } from "@mocknica/ui";
import { Wand2, Database, Zap, CheckCircle } from "lucide-react";

export function HowItWorksSection() {
  const steps = [
    {
      icon: Wand2,
      title: "Describe with AI",
      description: "Simply describe your data in plain English. Our AI generates a complete schema with realistic fields.",
      example: '"User profile for social media app"',
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Database,
      title: "Auto-Generate Endpoints",
      description: "Click once to generate full CRUD endpoints from your schema. GET, POST, PUT, DELETE - all ready instantly.",
      example: "5 endpoints created automatically",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Use Immediately",
      description: "Your mock API is live! Start making requests right away with realistic data and proper authentication.",
      example: "fetch('/api/mock/project/users')",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: CheckCircle,
      title: "Build & Ship",
      description: "Continue developing your frontend with confidence. Switch to your real API when ready - no code changes needed.",
      example: "Production ready",
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            From Idea to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Live API
            </span>{" "}
            in Seconds
          </h2>
          <p className="text-lg text-muted-foreground">
            Four simple steps to supercharge your development workflow
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  {/* Step Number */}
                  <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm z-10 shadow-lg">
                    {index + 1}
                  </div>

                  <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg relative overflow-hidden group">
                    {/* Gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                    
                    <CardContent className="p-6 relative">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>

                      {/* Title */}
                      <h3 className="font-bold text-lg mb-3">{step.title}</h3>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground mb-4">
                        {step.description}
                      </p>

                      {/* Example */}
                      <div className="bg-muted/50 rounded-md p-2 text-xs font-mono text-muted-foreground">
                        {step.example}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Connector Line (hidden on mobile and last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-border z-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Additional CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            Ready to experience the fastest way to mock APIs?
          </p>
          <div className="inline-flex items-center gap-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
            <span className="text-muted-foreground">•</span>
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span>Free forever for open source</span>
          </div>
        </div>
      </div>
    </section>
  );
}
