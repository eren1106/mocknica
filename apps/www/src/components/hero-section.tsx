import { Badge, LinkButton } from "@mocknica/ui";
import { ArrowRight, Github, Sparkles, Star, GitFork } from "lucide-react";
import { config } from "../../lib/config";
import HeroVideoDialog from "./hero-video-dialog";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Animated Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div
          className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/3 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center mb-6 animate-in fade-in slide-in-from-bottom-3 duration-1000">
              <Badge variant="secondary" className="px-4 py-1.5 text-sm">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Open Source & AI-Powered
              </Badge>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Stop Waiting for{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Backend APIs
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-5 duration-1000 delay-200">
              Create, manage, and deploy realistic mock APIs in seconds with AI.
              Build faster, test smarter, and ship with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-300">
              <LinkButton
                size="lg"
                className="text-base group"
                href={`${config.dashboardUrl}/signup`}
                openNewTab
              >
                Get Started Free{" "}
                <ArrowRight className="ml-2 size-4 group-hover:translate-x-1 transition-transform" />
              </LinkButton>
              <LinkButton
                size="lg"
                variant="outline"
                className="text-base"
                openNewTab
                href={config.githubUrl}
              >
                <Github className="mr-2 size-4" />
                View on GitHub
              </LinkButton>
            </div>

            {/* GitHub Stats */}
            <div className="flex items-center gap-4 justify-center lg:justify-start text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-7 duration-1000 delay-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span>Star on GitHub</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                <span>Open Source</span>
              </div>
            </div>
          </div>

          {/* Right Column - Demo Video */}
          <HeroVideoDialog
            animationStyle="top-in-bottom-out"
            videoSrc="https://www.youtube.com/embed/1EfUX0agPLQ"
            thumbnailSrc="/dashboard-ss.png"
            thumbnailAlt="Hero Video"
          />
        </div>

        {/* Quick Stats */}
        {/* <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 pt-12 border-t animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-600">
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              100%
            </div>
            <div className="text-sm text-muted-foreground">Open Source</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              AI
            </div>
            <div className="text-sm text-muted-foreground">Powered</div>
          </div>
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              $0
            </div>
            <div className="text-sm text-muted-foreground">Self Host</div>
          </div>
        </div> */}
      </div>
    </section>
  );
}
