import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Bell,
  Check,
  Eye,
  HandHelping,
  HeartHandshake,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EarlyAccessForm } from "@/components/early-access-form";
import { siteContent, type FeatureStatus } from "@/lib/site-content";

const copyrightYear = new Date().getFullYear();

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="section-label">
      <span aria-hidden="true" className="section-label-dot" />
      {children}
    </p>
  );
}

function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 36 36"
      fill="none"
      className="size-10 shrink-0"
    >
      <rect width="36" height="36" rx="13" fill={inverse ? "white" : "currentColor"} />
      <path
        d="M10 12.5C10 11.12 11.12 10 12.5 10h11c1.38 0 2.5 1.12 2.5 2.5v7c0 1.38-1.12 2.5-2.5 2.5h-5.3l-5.1 4v-4H12.5c-1.38 0-2.5-1.12-2.5-2.5v-7Z"
        stroke={inverse ? "var(--forest)" : "white"}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="16" r="1" fill={inverse ? "var(--forest)" : "white"} />
      <circle cx="18" cy="16" r="1" fill={inverse ? "var(--forest)" : "white"} />
      <circle cx="21" cy="16" r="1" fill={inverse ? "var(--forest)" : "white"} />
    </svg>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  centered?: boolean;
}) {
  return (
    <div className={centered ? "section-heading section-heading-centered" : "section-heading"}>
      <SectionLabel>{eyebrow}</SectionLabel>
      <h2 className="section-title">{title}</h2>
      {description && <p className="section-description">{description}</p>}
    </div>
  );
}

const featureIcons = {
  hands: HandHelping,
  message: MessageSquareText,
  bell: Bell,
};

function StatusBadge({ status }: { status: FeatureStatus }) {
  return (
    <Badge className="feature-status">
      <span aria-hidden="true" className="status-indicator" />
      {status}
    </Badge>
  );
}

export function HeroSection() {
  return (
    <section className="hero-section">
      <div className="hero-grid">
        <div className="hero-copy">
          <SectionLabel>{siteContent.hero.eyebrow}</SectionLabel>
          <h1 className="hero-title">{siteContent.hero.title}</h1>
          <p className="hero-description">{siteContent.hero.description}</p>
          <div className="hero-actions">
            <a href={siteContent.links.pilot} className="button-primary">
              {siteContent.hero.primaryAction}
              <ArrowRight aria-hidden="true" className="size-4.5" />
            </a>
            <a href={siteContent.links.approach} className="button-secondary">
              {siteContent.hero.secondaryAction}
              <ArrowDown aria-hidden="true" className="size-4" />
            </a>
          </div>
          <p className="hero-note">
            <span aria-hidden="true" className="hero-note-line" />
            {siteContent.hero.note}
          </p>
        </div>

        <div
          className="hero-art"
          role="img"
          aria-label="Illustrative concept showing clear written, caption, and Uganda Sign Language communication preferences for a healthcare visit. It is not an active service."
        >
          <div aria-hidden="true" className="hero-art-orbit orbit-one" />
          <div aria-hidden="true" className="hero-art-orbit orbit-two" />
          <div className="concept-card">
            <div className="concept-card-top">
              <span className="concept-badge">
                <Sparkles aria-hidden="true" className="size-3.5" />
                A more considered visit
              </span>
              <span aria-hidden="true" className="concept-menu-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
            <div className="concept-intro">
              <span className="concept-icon">
                <HeartHandshake aria-hidden="true" className="size-5" />
              </span>
              <div>
                <p className="concept-kicker">Your care, your communication</p>
                <p className="concept-heading">What works for you?</p>
              </div>
            </div>
            <div className="concept-options" aria-hidden="true">
              <div className="concept-option">
                <span className="option-symbol option-written">
                  <MessageSquareText className="size-4.5" />
                </span>
                <span>Written text</span>
                <span className="option-check">
                  <Check className="size-3" />
                </span>
              </div>
              <div className="concept-option">
                <span className="option-symbol option-captions">
                  <Eye className="size-4.5" />
                </span>
                <span>Captions</span>
                <span className="option-trailing">Explore</span>
              </div>
              <div className="concept-option">
                <span className="option-symbol option-sign">
                  <HandHelping className="size-4.5" />
                </span>
                <span>Uganda Sign Language</span>
                <span className="option-trailing">Explore</span>
              </div>
            </div>
            <p className="concept-footnote">
              An early concept. Options shown are not active features.
            </p>
          </div>
          <div className="art-side-note">
            <span className="art-side-dot" />
            Communication should feel considered
          </div>
        </div>
      </div>
      <div className="hero-bottom-rule" aria-hidden="true">
        <span>01 / Designed around people</span>
        <span>Uganda-first · Community-informed</span>
      </div>
    </section>
  );
}

export function ApproachSection() {
  const principles = [
    {
      number: "01",
      title: "Communication on your terms.",
      description:
        "People have different preferences, including sign language, written text, captions, and other visual approaches.",
      icon: MessageSquareText,
    },
    {
      number: "02",
      title: "Accessibility by design.",
      description:
        "Important information, actions, and feedback should be visually clear and easy to understand.",
      icon: Eye,
    },
    {
      number: "03",
      title: "Built with the community.",
      description:
        "The pilot should listen to intended users and help improve the experience around their needs.",
      icon: UsersRound,
    },
  ];

  return (
    <section id="approach" className="approach-section section-anchor">
      <div className="approach-layout">
        <div className="approach-intro">
          <SectionLabel>Our approach</SectionLabel>
          <h2 className="section-title">
            Communication
            <br />
            is part of care.
          </h2>
          <p className="section-description">
            Understanding and being understood matters in healthcare. Effecom
            is being shaped around a simple idea: people deserve to take part
            in conversations about their care in ways that work for them.
          </p>
        </div>
        <div className="principle-list">
          {principles.map(({ number, title, description, icon: Icon }) => (
            <article className="principle-row" key={number}>
              <span className="principle-number">{number}</span>
              <div className="principle-content">
                <h3>{title}</h3>
                <p>{description}</p>
              </div>
              <Icon aria-hidden="true" className="principle-icon" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FeatureSection() {
  return (
    <section id="features" className="feature-section section-anchor">
      <div className="content-width">
        <div className="feature-heading-layout">
          <SectionHeading
            eyebrow="What we are exploring"
            title="A more accessible way to communicate."
            description="Effecom is exploring tools and experiences designed to make healthcare communication more inclusive for deaf and hard-of-hearing people in Uganda."
          />
          <p className="feature-heading-note">
            Each feature is a direction under consideration. Availability will
            depend on what is developed and supported.
          </p>
        </div>

        <div className="feature-grid">
          {siteContent.features.map((feature, index) => {
            const Icon = featureIcons[feature.icon];
            return (
              <Card className={`feature-card feature-card-${index + 1} ring-0`} key={feature.title}>
                <CardHeader className="feature-card-header">
                  <div className="feature-card-topline">
                    <span className={`feature-icon feature-icon-${index + 1}`}>
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                    <span className="feature-index">0{index + 1}</span>
                  </div>
                  <StatusBadge status={feature.status} />
                  <CardTitle className="feature-card-title">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="feature-card-body">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
        <p className="feature-footnote">
          Status labels are conservative and should be confirmed by the Effecom
          team before launch.
        </p>
      </div>
    </section>
  );
}

export function PilotStepsSection() {
  return (
    <section id="how-it-works" className="steps-section section-anchor">
      <div className="content-width">
        <div className="steps-heading">
          <SectionHeading
            eyebrow="The pilot journey"
            title="Help shape what comes next."
            description="The Effecom pilot is an opportunity to learn from the people the platform is being designed to serve."
          />
          <div className="steps-aside">
            <span aria-hidden="true" className="steps-aside-mark">
              03
            </span>
            <p>
              A considered process, with no promise of immediate access or
              medical care.
            </p>
          </div>
        </div>
        <ol className="steps-list">
          {siteContent.pilotSteps.map((step, index) => (
            <li className="step-item" key={step.title}>
              <span className="step-marker" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="step-copy">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function AccessibilitySection() {
  const principles = [
    "Uganda Sign Language is a priority in our local context.",
    "Written communication and captions matter where supported.",
    "Readable interfaces, clear feedback, and predictable navigation.",
    "Different preferences are respected without asking for explanations.",
  ];

  return (
    <section
      id="accessibility"
      className="accessibility-section section-anchor"
    >
      <div className="accessibility-layout">
        <div className="accessibility-copy">
          <SectionLabel>Accessibility & inclusion</SectionLabel>
          <h2 className="section-title">
            Accessibility is not an extra. It is part of the experience.
          </h2>
          <p className="section-description">
            Effecom starts with Uganda and the communication preferences of
            people here. That means designing for choice, clear visual
            information, and community feedback—not assuming one approach
            works for everyone.
          </p>
          <a
            className="text-link accessibility-link"
            href={siteContent.links.pilot}
          >
            Share what works for you
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <div className="accessibility-panel">
          <div className="accessibility-panel-heading">
            <span className="accessibility-symbol">
              <Eye aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="concept-kicker">Designed with intention</p>
              <h3>Communication has many forms.</h3>
            </div>
          </div>
          <ul className="accessibility-list">
            {principles.map((principle) => (
              <li key={principle}>
                <span className="accessibility-check">
                  <Check aria-hidden="true" className="size-3.5" />
                </span>
                <span>{principle}</span>
              </li>
            ))}
          </ul>
          <div className="accessibility-note">
            <HandHelping aria-hidden="true" className="size-4 shrink-0" />
            <p>
              Uganda Sign Language is one preference—not a requirement or
              assumption about every person.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function TrustSection() {
  return (
    <section className="trust-section">
      <div className="trust-layout">
        <div className="trust-intro">
          <span className="trust-icon">
            <ShieldCheck aria-hidden="true" className="size-6" />
          </span>
          <div>
            <SectionLabel>Trust through transparency</SectionLabel>
            <h2 className="section-title">
              A careful start, built on clear intentions.
            </h2>
          </div>
        </div>
        <div className="trust-points">
          <div>
            <Check aria-hidden="true" className="size-4" />
            <p>Uganda-first approach</p>
          </div>
          <div>
            <Check aria-hidden="true" className="size-4" />
            <p>Community-informed development</p>
          </div>
          <div>
            <Check aria-hidden="true" className="size-4" />
            <p>Honest about what is still being built</p>
          </div>
        </div>
        <div className="privacy-note">
          <p className="privacy-note-label">Your information</p>
          <p>
            The interest form asks for contact details and optional preferences
            only. It does not ask for medical information. Registration stays
            disconnected until a submission service is configured.
          </p>
          <Link href={siteContent.links.privacy} className="text-link">
            Read the draft privacy notice
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  return (
    <section id="faqs" className="faq-section section-anchor">
      <div className="faq-layout">
        <div className="faq-intro">
          <SectionLabel>Questions, answered</SectionLabel>
          <h2 className="section-title">A little more clarity.</h2>
          <p className="section-description">
            A few things you may want to know about Effecom and the pilot.
          </p>
          <div className="faq-signpost">
            <span className="faq-signpost-icon">
              <MessageSquareText aria-hidden="true" className="size-4" />
            </span>
            <p>
              Still wondering? You can share your question when you register
              your interest.
            </p>
          </div>
        </div>
        <Accordion className="faq-accordion" multiple>
          {siteContent.faqs.map((item, index) => (
            <AccordionItem
              key={item.question}
              value={`faq-${index + 1}`}
              className="faq-item"
            >
              <AccordionTrigger className="faq-trigger">
                <span className="faq-number">0{index + 1}</span>
                <span>{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="faq-content">
                <p>{item.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

export function EarlyAccessSection({
  registrationConfigured,
}: {
  registrationConfigured: boolean | null;
}) {
  return (
    <section id="pilot" className="pilot-section section-anchor">
      <div className="pilot-layout">
        <div className="pilot-copy">
          <SectionLabel>Join the Effecom pilot</SectionLabel>
          <h2 className="section-title">
            Be part of a more accessible future.
          </h2>
          <p className="section-description">
            Are you deaf or hard of hearing, or do you support accessible
            communication in healthcare? Register your interest and help
            inform the future of Effecom.
          </p>
          <div className="pilot-promise">
            <span className="pilot-promise-icon">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <p>
              Only share what you are comfortable sharing. We do not need
              medical history or a reason for your communication preference.
            </p>
          </div>
          <div className="pilot-reassurance">
            <span className="reassurance-mark" aria-hidden="true">
              <Check className="size-3" />
            </span>
            <p>Interest only · No medical care · No guaranteed pilot place</p>
          </div>
        </div>
        <div className="pilot-form-card">
          <div className="pilot-form-heading">
            <div>
              <p className="concept-kicker">A few details, if you choose</p>
              <h3>Register your interest</h3>
            </div>
            <span className="pilot-form-icon">
              <HeartHandshake aria-hidden="true" className="size-5" />
            </span>
          </div>
          <EarlyAccessForm registrationConfigured={registrationConfigured} />
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link
            href={siteContent.links.home}
            className="footer-brand-link"
            aria-label="Effecom home"
          >
            <BrandMark inverse />
            <span className="font-heading text-[23px] font-semibold tracking-[-0.04em]">
              {siteContent.brand.name}
            </span>
          </Link>
          <p className="footer-tagline">
            More accessible ways to communicate in healthcare, shaped around
            the people who use them.
          </p>
          <p className="footer-attribution">{siteContent.brand.attribution}</p>
        </div>

        <nav aria-label="Footer navigation" className="footer-nav">
          <p className="footer-nav-heading">Explore</p>
          <Link href={`/${siteContent.links.approach}`}>Our approach</Link>
          <Link href={`/${siteContent.links.features}`}>Features</Link>
          <Link href={`/${siteContent.links.howItWorks}`}>How it works</Link>
          <Link href={`/${siteContent.links.accessibility}`}>
            Accessibility
          </Link>
          <Link href={`/${siteContent.links.faqs}`}>FAQs</Link>
        </nav>

        <div className="footer-action">
          <p className="footer-nav-heading">Help shape what comes next</p>
          <p>Share your interest in the Effecom pilot.</p>
          <Link href={`/${siteContent.links.pilot}`} className="footer-cta">
            Join the Pilot
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            className="footer-privacy-link"
            href={siteContent.links.privacy}
          >
            Privacy notice
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {copyrightYear} Effecom. All rights reserved.</p>
        <p>Healthcare communication, with people at the centre.</p>
      </div>
    </footer>
  );
}
