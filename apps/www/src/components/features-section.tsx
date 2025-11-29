import { Card, CardContent } from "@mocknica/ui";
import {
  Sparkles,
  Database,
  Lock,
  Folder,
  Zap,
  Code2,
  Shield,
  Globe,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Generation",
    description:
      "Generate realistic mock data using OpenAI, Gemini, or local Ollama models.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Database,
    title: "Schema-Based CRUD",
    description:
      "Define reusable schemas and auto-generate complete CRUD endpoints instantly.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Globe,
    title: "Self-Hosting Freedom",
    description:
      "Deploy anywhere with Docker. Your data, your infrastructure, your control.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Lock,
    title: "Built-in Security",
    description:
      "Token authentication, CORS support, and configurable response wrappers.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Folder,
    title: "Multi-Project Support",
    description:
      "Organize APIs by project with isolated endpoints and configurations.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    icon: Zap,
    title: "Instant Deployment",
    description:
      "Create and deploy mock APIs in seconds. No backend setup required.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Code2,
    title: "Developer-Friendly",
    description:
      "Intuitive UI and RESTful APIs ready to integrate with any frontend.",
    gradient: "from-cyan-500 to-blue-500",
  },
  {
    icon: Shield,
    title: "100% Open Source",
    description:
      "MIT licensed, community-driven. No vendor lock-in, no hidden costs.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="relative py-20 md:py-28 bg-muted/30 overflow-hidden"
    >
      {/* Subtle gradient accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
              mock APIs
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Powerful features designed for speed, flexibility, and
            production-readiness.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.title}
                className="group relative border-border/50 bg-background/80 backdrop-blur-sm hover:border-transparent transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                {/* Gradient border on hover */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <div
                  className={`absolute inset-px rounded-[inherit] bg-background group-hover:bg-background/95 transition-colors duration-300`}
                />

                <CardContent className="relative pt-6">
                  <div className="mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg`}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
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
