import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { SiteFooter } from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { siteContent } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Privacy notice",
  description:
    "A draft explanation of information collected through Effecom's pilot interest form.",
};

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="privacy-page">
        <div className="privacy-page-inner">
          <Link
            href={`/${siteContent.links.pilot}`}
            className="privacy-back-link"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to the pilot form
          </Link>
          <div className="privacy-page-heading">
            <span className="privacy-page-icon">
              <ShieldCheck aria-hidden="true" className="size-6" />
            </span>
            <p className="section-label">Effecom · Privacy</p>
            <h1 className="section-title">Draft privacy notice</h1>
            <p className="section-description">
              This is a plain-language draft for the Effecom early-access
              interest form. It needs review and a real contact channel before
              the registration service is launched.
            </p>
          </div>

          <div className="privacy-content">
            <section>
              <h2>What the form asks for</h2>
              <p>
                The form may ask for a name or preferred name, one contact
                method and contact detail, an optional district or general
                location, an optional communication preference, and consent to
                be contacted about the pilot.
              </p>
              <p>
                It does not ask for medical history, diagnoses, national
                identification numbers, medical documents, or photographs and
                videos.
              </p>
            </section>

            <section>
              <h2>Why the information is requested</h2>
              <p>
                If a registration service is configured, the information is
                intended to let the Effecom team respond to a person&apos;s
                interest in the pilot and consider their optional communication
                preferences.
              </p>
            </section>

            <section>
              <h2>When information is sent</h2>
              <p>
                The home page shows whether registration is currently
                connected. When no service is configured, the website does not
                submit or store the form details. When connected, the details
                are sent to the endpoint maintained by the Effecom team; no
                details are stored in this website&apos;s browser storage.
              </p>
              <p>
                Registering interest does not guarantee pilot participation
                and does not provide medical care.
              </p>
            </section>

            <section>
              <h2>Retention and your questions</h2>
              <p>
                The retention period and process for asking about, correcting,
                or requesting removal of information must be confirmed by the
                team operating the registration service before launch.
              </p>
              <p>
                {siteContent.brand.contactEmail
                  ? `For privacy questions, contact ${siteContent.brand.contactEmail}.`
                  : "No privacy contact address has been provided. The Effecom team must publish a working privacy contact channel before collecting registrations."}
              </p>
            </section>

            <div className="privacy-draft-callout" role="note">
              This draft is not a statement of legal compliance. The Effecom
              team should review the collection, use, retention, and contact
              details before connecting registration.
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
