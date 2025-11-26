import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { UseCasesSection } from "@/components/use-cases-section";
import { CTASection } from "@/components/cta-section";

export default function Home() {
  return (
    <main>
      <HeroSection />
      {/* <HowItWorksSection /> */}
      <FeaturesSection />
      <UseCasesSection />
      {/* <TechStackSection /> */}
      {/* <TestimonialsSection /> */}
      <CTASection />
    </main>
  );
}
