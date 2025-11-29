import { LinkButton } from "@mocknica/ui";
import { ArrowRight, Github } from "lucide-react";
import { config } from "../../lib/config";

export function CTASection() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-violet-500/5 to-background -z-10" />
      <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          {/* Main CTA Content */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            Ready to build{" "}
            <span className="bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              faster?
            </span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join developers building with Mocknica. Create your first mock API
            in under a minute.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {/* <Button
              size="lg"
              className="text-base px-8 group bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
              asChild
            >
              <Link href={`${config.dashboardUrl}/signup`}>
                Get Started — It&apos;s Free
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 border-border/50 hover:border-violet-500/50 hover:bg-violet-500/5 transition-all" asChild>
              <Link href={config.githubUrl} target="_blank">
                <Github className="mr-2 h-4 w-4" />
                View Source
              </Link>
            </Button> */}
            <LinkButton
              href={`${config.dashboardUrl}/signup`}
              size="lg"
              className="text-white text-base px-8 group bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 border-0 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 transition-all"
            >
              Get Started — It&apos;s Free
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </LinkButton>
            <LinkButton
              href={config.githubUrl}
              openNewTab
              size="lg"
              variant="outline"
            >
              <Github className="mr-2 h-4 w-4" />
              View GitHub
            </LinkButton>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-1">
                &lt;60s
              </div>
              <div>Setup time</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent mb-1">
                3+
              </div>
              <div>AI providers</div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent mb-1">
                MIT
              </div>
              <div>Open source</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
