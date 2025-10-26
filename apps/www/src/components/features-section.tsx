import { Card, CardContent, CardHeader, CardTitle, Badge } from "@mocknica/ui";
import { 
  Sparkles, 
  Database, 
  Lock, 
  Folder, 
  Zap, 
  Code2,
  Shield,
  Globe
} from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Sparkles,
      title: "AI-Powered Generation",
      description: "Generate realistic mock endpoints and schemas using OpenAI, Gemini, or local Ollama models.",
      // badge: "Popular",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Database,
      title: "Schema-Based CRUD",
      description: "Define reusable data schemas with type-safe fields and auto-generate complete CRUD endpoints instantly.",
      // badge: "Core",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Globe,
      title: "Self-Hosting Freedom",
      description: "Deploy anywhere with Docker or run locally. Your data, your infrastructure, your control.",
      // badge: "New",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: Lock,
      title: "Production-Ready Security",
      description: "Built-in token authentication, CORS support, and configurable response wrappers included out of the box.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Folder,
      title: "Multi-Project Support",
      description: "Organize mock APIs by project with isolated endpoints, schemas, and configurations.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: Zap,
      title: "Instant API Endpoints",
      description: "Create and deploy mock APIs in seconds. No backend setup, no configuration headaches.",
      color: "from-yellow-500 to-orange-500",
    },
    {
      icon: Code2,
      title: "Developer-Friendly",
      description: "Intuitive UI for managing endpoints and data. RESTful APIs ready to integrate with your frontend.",
      color: "from-teal-500 to-green-500",
    },
    {
      icon: Shield,
      title: "100% Open Source",
      description: "Transparent, community-driven development. No vendor lock-in, no hidden costs.",
      // badge: "Free",
      color: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section id="features" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Mock APIs
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features that make API mocking fast, flexible, and production-ready
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={feature.title} 
                className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg group relative overflow-hidden"
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {/* {feature.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {feature.badge}
                      </Badge>
                    )} */}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
