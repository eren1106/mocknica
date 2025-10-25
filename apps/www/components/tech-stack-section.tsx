"use client";

import { useState } from "react";
import { Badge, Card } from "@mocknica/ui";

export function TechStackSection() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const technologies = {
    frontend: [
      { name: "Next.js", category: "Framework", description: "React framework for production" },
      { name: "React", category: "Library", description: "UI component library" },
      { name: "TypeScript", category: "Language", description: "Type-safe JavaScript" },
      { name: "TailwindCSS", category: "Styling", description: "Utility-first CSS" },
      { name: "Shadcn UI", category: "Components", description: "Accessible components" },
    ],
    backend: [
      { name: "Node.js", category: "Runtime", description: "JavaScript runtime" },
      { name: "Prisma ORM", category: "Database", description: "Type-safe database client" },
      { name: "PostgreSQL", category: "Database", description: "Relational database" },
    ],
    aiIntegration: [
      { name: "OpenAI", category: "AI", description: "GPT models integration" },
      { name: "Gemini", category: "AI", description: "Google AI models" },
      { name: "Ollama", category: "AI", description: "Local AI models" },
    ],
    infrastructure: [
      { name: "Docker", category: "Container", description: "Containerization platform" },
      { name: "Better Auth", category: "Auth", description: "Authentication solution" },
      { name: "Google OAuth", category: "Auth", description: "Social authentication" },
    ],
  };

  const categories = [
    { key: "frontend", label: "Frontend", icon: "🎨", color: "from-blue-500 to-cyan-500" },
    { key: "backend", label: "Backend", icon: "⚙️", color: "from-purple-500 to-pink-500" },
    { key: "aiIntegration", label: "AI Integration", icon: "🤖", color: "from-orange-500 to-red-500" },
    { key: "infrastructure", label: "Infrastructure", icon: "🏗️", color: "from-green-500 to-emerald-500" },
  ];

  return (
    <section id="tech-stack" className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Built with{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Modern Tech
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Leveraging the best tools and technologies for reliability and performance
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeCategory === cat.key
                    ? `bg-gradient-to-r ${cat.color} text-white shadow-lg scale-105`
                    : "bg-card border border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <span className="mr-2">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>

          {/* Technology Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => {
              const techs = technologies[cat.key as keyof typeof technologies];
              const isActive = activeCategory === cat.key || activeCategory === null;
              
              return techs.map((tech) => (
                <Card
                  key={tech.name}
                  className={`transition-all duration-300 border-border/50 hover:border-primary/50 hover:shadow-lg ${
                    isActive ? "opacity-100 scale-100" : "opacity-30 scale-95"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center text-2xl`}>
                        {cat.icon}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {tech.category}
                      </Badge>
                    </div>
                    <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
                    <p className="text-sm text-muted-foreground">{tech.description}</p>
                  </div>
                </Card>
              ));
            })}
          </div>

          {/* Tech Summary */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">5</div>
              <div className="text-sm text-muted-foreground">Frontend Tools</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">3</div>
              <div className="text-sm text-muted-foreground">Backend Tools</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">3</div>
              <div className="text-sm text-muted-foreground">AI Providers</div>
            </div>
            <div className="p-6 rounded-lg bg-card border border-border">
              <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">3</div>
              <div className="text-sm text-muted-foreground">Infrastructure</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
