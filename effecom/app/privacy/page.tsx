import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the EFFECOM website.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="landing-product-page">
        <div className="landing-product-inner landing-privacy-content">
          <Link href="/" className="landing-product-back">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to EFFECOM
          </Link>
          <p className="landing-kicker">EFFECOM / Privacy</p>
          <h1>Your privacy matters.</h1>
          <p className="landing-product-description">
            EFFECOM&apos;s communication tools are still in development. This
            website does not currently offer accounts or submit text, audio,
            translations, or video for processing.
          </p>
          <p className="landing-product-description">
            When tool experiences become available, we will explain what
            information each one uses and how it is handled before you submit
            anything.
          </p>
          <Link href="/#tools" className="landing-text-link">
            Explore the tools
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
