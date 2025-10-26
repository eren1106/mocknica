import { Card, CardContent, CardHeader, CardTitle } from "@mocknica/ui";
import { Monitor, Presentation, TestTube, Users } from "lucide-react";

export function UseCasesSection() {
  const useCases = [
    {
      icon: Monitor,
      title: "Frontend Development",
      description: "Build UIs without waiting for backend APIs. Develop and iterate faster with realistic mock data that matches your production schema.",
      benefits: [
        "Parallel development workflow",
        "No backend dependencies",
        "Faster iteration cycles",
      ],
    },
    {
      icon: Presentation,
      title: "Rapid Prototyping",
      description: "Validate ideas and create demos quickly with AI-generated schemas and realistic data. Perfect for stakeholder presentations.",
      benefits: [
        "Quick proof of concepts",
        "Impressive demos",
        "Validate ideas early",
      ],
    },
    {
      icon: TestTube,
      title: "QA & Testing",
      description: "Test edge cases and error scenarios with controlled mock data. Simulate various API states without complex backend configurations.",
      benefits: [
        "Test edge cases easily",
        "Controlled test data",
        "Isolated testing environment",
      ],
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Enable frontend and backend teams to work in parallel. Share mock APIs across teams with consistent data structures.",
      benefits: [
        "Better team coordination",
        "Consistent data contracts",
        "Reduced dependencies",
      ],
    },
  ];

  return (
    <section id="use-cases" className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Perfect For{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Every Team
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From solo developers to enterprise teams, Mocknica accelerates your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <Card 
                key={useCase.title}
                className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{useCase.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {useCase.description}
                  </p>
                  <div className="space-y-3 pt-2">
                    {useCase.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-start gap-3 group">
                        <div className="mt-1 flex-shrink-0">
                          <div className="w-5 h-5 rounded-md bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                            <svg 
                              className="w-3 h-3 text-primary" 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-sm leading-relaxed">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
