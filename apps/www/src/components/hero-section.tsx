import { Badge, LinkButton } from "@mocknica/ui";
import { ArrowRight, Github, Sparkles } from "lucide-react";
import { config } from "../../lib/config";
import { HeroVideoDialog } from "./hero-video-dialog";

export function HeroSection() {
  return (
    <section className="relative pt-28 pb-16 md:pt-36 md:pb-24 overflow-hidden">
      {/* Gradient background - matching CTA section style */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/5 via-background to-background -z-10" />
      <div className="absolute -top-20 left-1/4 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Single Column - Centered Content */}
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center mb-8 animate-in fade-in slide-in-from-bottom-3 duration-700 fill-mode-backwards">
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-sm font-medium border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300 hover:bg-violet-500/15 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Open Source & AI-Powered
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 fill-mode-backwards">
            Mock APIs in Seconds,
            <br />
            <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Not Hours
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200 fill-mode-backwards">
            Create realistic mock APIs with AI. Define schemas, generate data,
            and deploy instantly. Perfect for frontend developers who don&apos;t
            want to wait.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300 fill-mode-backwards">
            <LinkButton
              size="lg"
              className="text-base text-white px-8 group bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
              href={`${config.dashboardUrl}/signup`}
            >
              Start Mocking — It&apos;s Free
              <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
            </LinkButton>
            <LinkButton
              size="lg"
              variant="outline"
              className="text-base px-8"
              openNewTab
              href={config.githubUrl}
            >
              <Github className="mr-2 size-4" />
              Star on GitHub
            </LinkButton>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-7 duration-700 delay-400 fill-mode-backwards">
            No credit card required · Self-host anywhere · MIT License
          </p>
        </div>

        {/* Demo Video - Full Width Below Content */}
        <div className="max-w-5xl mx-auto mt-16 md:mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-backwards">
          <div className="relative rounded-xl overflow-hidden border border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/20">
            <HeroVideoDialog
              className="hidden dark:block"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/1EfUX0agPLQ"
              thumbnailSrc="/dashboard-ss.png"
              thumbnailAlt="Mocknica Dashboard Demo"
            />
            <HeroVideoDialog
              className="block dark:hidden"
              animationStyle="from-center"
              videoSrc="https://www.youtube.com/embed/1EfUX0agPLQ"
              thumbnailSrc="/dashboard-light-ss.png"
              thumbnailAlt="Mocknica Dashboard Demo"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
