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
            EFFECOM sends the text or audio you submit to Sunbird&apos;s
            language services to provide translation, speech-to-text, and
            text-to-speech. Do not submit confidential or sensitive
            information. Signed-in successful requests are saved in your
            private activity history; guest usage is tracked against a
            short-lived guest session.
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
