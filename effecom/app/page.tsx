import { Suspense } from "react";
import {
  AccessibilitySection,
  ApproachSection,
  EarlyAccessSection,
  FAQSection,
  FeatureSection,
  HeroSection,
  PilotStepsSection,
  SiteFooter,
  TrustSection,
} from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { connection } from "next/server";

async function RuntimeEarlyAccessSection() {
  await connection();

  return (
    <EarlyAccessSection
      registrationConfigured={Boolean(
        process.env.EFFECOM_REGISTRATION_ENDPOINT,
      )}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content">
        <HeroSection />
        <ApproachSection />
        <FeatureSection />
        <PilotStepsSection />
        <AccessibilitySection />
        <TrustSection />
        <FAQSection />
        <Suspense
          fallback={<EarlyAccessSection registrationConfigured={null} />}
        >
          <RuntimeEarlyAccessSection />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
