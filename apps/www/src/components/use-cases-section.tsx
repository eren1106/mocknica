import { Monitor, Presentation, TestTube, Users } from "lucide-react";

const useCases = [
  {
    icon: Monitor,
    title: "Frontend Development",
    description:
      "Build UIs without waiting for backend APIs. Develop in parallel with realistic mock data.",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    icon: Presentation,
    title: "Rapid Prototyping",
    description:
      "Validate ideas quickly with AI-generated data. Perfect for demos and stakeholder presentations.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: TestTube,
    title: "QA & Testing",
    description:
      "Test edge cases with controlled mock data. Simulate API states without complex setup.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share mock APIs across teams. Keep data contracts consistent between frontend and backend.",
    gradient: "from-orange-500 to-amber-500",
  },
];

export function UseCasesSection() {
  return (
    <section id="use-cases" className="relative py-20 md:py-28 overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-cyan-500/5 rounded-full blur-[100px] -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Built for{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              every team
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            From solo developers to enterprise teams, accelerate your
            development workflow.
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {useCases.map((useCase) => {
            const Icon = useCase.icon;
            return (
              <div key={useCase.title} className="text-center group">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${useCase.gradient} mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
