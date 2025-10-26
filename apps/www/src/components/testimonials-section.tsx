import { Card } from "@mocknica/ui";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  const testimonials = [
    {
      quote: "Mocknica saved us weeks of development time. The AI-powered schema generation is a game changer!",
      author: "Sarah Chen",
      role: "Frontend Lead",
      company: "TechStart Inc",
    },
    {
      quote: "Finally, a mock API tool that doesn't get in the way. Self-hosting gives us complete control.",
      author: "Michael Rodriguez",
      role: "CTO",
      company: "DataFlow Solutions",
    },
    {
      quote: "The best part? It's open source. We can contribute and customize it to our exact needs.",
      author: "Emily Watson",
      role: "Senior Developer",
      company: "CloudNative Labs",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Loved by{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Developers
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            See what teams are saying about Mocknica
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="p-6 border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
            >
              <Quote className="w-8 h-8 text-primary/20 mb-4" />
              <p className="text-muted-foreground mb-6 leading-relaxed">
                "{testimonial.quote}"
              </p>
              <div className="border-t border-border/50 pt-4">
                <div className="font-semibold">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role} at {testimonial.company}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
