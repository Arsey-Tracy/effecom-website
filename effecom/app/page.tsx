import {
  AccessibilitySection,
  FinalCTA,
  FeatureSection,
  HeroSection,
  SiteFooter,
} from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <FeatureSection />
        <AccessibilitySection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
