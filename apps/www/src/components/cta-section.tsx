import Link from "next/link";
import { Button, Card } from "@mocknica/ui";
import { ArrowRight, Github, Star, Users, Zap, CheckCircle } from "lucide-react";
import { config } from "../../lib/config";

export function CTASection() {
  const highlights = [
    { icon: Star, label: "100% Open Source" },
    { icon: Zap, label: "Setup in 60 seconds" },
    { icon: Users, label: "Community-driven" },
  ];

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 shadow-2xl">
          {/* Animated Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzg4ODg4OCIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
          
          <div className="relative px-8 py-16 md:px-16 md:py-24">
            <div className="max-w-4xl mx-auto">
              {/* Main CTA Content */}
              <div className="text-center space-y-8 mb-12">
                <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold">
                  Ready to Accelerate Your{" "}
                  <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    Development?
                  </span>
                </h2>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join developers who are building faster with Mocknica. Start creating mock APIs in seconds, completely free.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                  <Button size="lg" className="text-base group shadow-lg" asChild>
                    <Link href={`${config.dashboardUrl}/signup`}>
                      Get Started Now
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base bg-background/50 backdrop-blur" asChild>
                    <Link href={config.githubUrl} target="_blank">
                      <Github className="mr-2 h-4 w-4" />
                      Star on GitHub
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {highlights.map((highlight) => {
                  const Icon = highlight.icon;
                  return (
                    <Card key={highlight.label} className="bg-background/50 backdrop-blur border-border/50">
                      <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium">{highlight.label}</span>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Trust Indicators */}
              <div className="pt-8 border-t border-border/50">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>No credit card required</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-border" />
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Open source forever</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-border" />
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Self-host anywhere</span>
                  </div>
                </div>
              </div>

              {/* Social Proof Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    &lt;60s
                  </div>
                  <div className="text-xs text-muted-foreground">Setup Time</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    3+
                  </div>
                  <div className="text-xs text-muted-foreground">AI Providers</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold mb-1 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    ∞
                  </div>
                  <div className="text-xs text-muted-foreground">Mock Endpoints</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
