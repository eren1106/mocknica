import { Header } from "../../components/header";
import { HeroSection } from "../../components/hero-section";
import { HowItWorksSection } from "../../components/how-it-works-section";
import { FeaturesSection } from "../../components/features-section";
import { UseCasesSection } from "../../components/use-cases-section";
import { TechStackSection } from "../../components/tech-stack-section";
import { TestimonialsSection } from "../../components/testimonials-section";
import { CTASection } from "../../components/cta-section";
import { Footer } from "../../components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <HowItWorksSection />
        <FeaturesSection />
        <UseCasesSection />
        <TechStackSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}