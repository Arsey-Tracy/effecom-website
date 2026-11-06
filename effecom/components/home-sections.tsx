import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  Captions,
  Languages,
  Volume2,
} from "lucide-react";
import { siteContent } from "@/lib/site-content";

const toolIcons = {
  volume: Volume2,
  audio: AudioLines,
  languages: Languages,
  captions: Captions,
};

function ToolIcon({ icon }: { icon: keyof typeof toolIcons }) {
  const Icon = toolIcons[icon];
  return <Icon aria-hidden="true" className="size-5" />;
}

export function HeroSection() {
  return (
    <section className="landing-hero" id="home">
      <div className="landing-hero-inner">
        <div className="landing-hero-copy">
          <p className="landing-eyebrow">
            <span aria-hidden="true" />
            {siteContent.hero.eyebrow}
          </p>
          <h1>{siteContent.hero.title}</h1>
          <p className="landing-hero-description">
            {siteContent.hero.description}
          </p>
          <div className="landing-hero-actions">
            <Link href="#tools" className="landing-button landing-button-primary">
              {siteContent.hero.primaryAction}
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
            <Link href="#about" className="landing-button landing-button-secondary">
              {siteContent.hero.secondaryAction}
              <ArrowDownRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <p className="landing-guest-note">
            <span aria-hidden="true">↳</span>
            {siteContent.hero.note}
          </p>
        </div>

        <div className="landing-hero-tools" aria-label="Explore EFFECOM tools">
          <div className="landing-hero-tools-heading">
            <span>ONE MESSAGE, MORE WAYS THROUGH</span>
            <span aria-hidden="true">EFF / 01</span>
          </div>
          <div className="landing-hero-tool-grid">
            {siteContent.tools.map((tool, index) => (
              <Link
                href={`/products/${tool.slug}`}
                className={`landing-hero-tool landing-hero-tool-${index + 1}`}
                key={tool.slug}
              >
                <span className="landing-tool-number">0{index + 1}</span>
                <span className="landing-tool-icon">
                  <ToolIcon icon={tool.icon} />
                </span>
                <span className="landing-tool-name">{tool.title}</span>
                <ArrowRight aria-hidden="true" className="landing-tool-arrow size-4" />
              </Link>
            ))}
          </div>
          <p className="landing-hero-tools-foot">
            Text · voice · language · captions
          </p>
        </div>
      </div>
      <div className="landing-hero-bottom" aria-hidden="true">
        <span>Clearer communication, made practical.</span>
        <span>Four tools / one inclusive platform</span>
      </div>
    </section>
  );
}

export function FeatureSection() {
  return (
    <section id="tools" className="landing-tools-section section-anchor">
      <div className="landing-section-inner">
        <div className="landing-section-heading">
          <div>
            <p className="landing-kicker">The tools</p>
            <h2>Everything you need to communicate more accessibly.</h2>
          </div>
          <p>
            Four simple tools. One more accessible way to communicate.
          </p>
        </div>
        <div className="landing-tool-cards">
          {siteContent.tools.map((tool, index) => (
            <article className={`landing-tool-card landing-tool-card-${index + 1}`} key={tool.slug}>
              <div className="landing-tool-card-top">
                <span className="landing-tool-card-icon">
                  <ToolIcon icon={tool.icon} />
                </span>
                <span className="landing-tool-card-index">0{index + 1}</span>
              </div>
              <p className="landing-tool-card-title">{tool.title}</p>
              <h3>{tool.headline}</h3>
              <p className="landing-tool-card-description">{tool.description}</p>
              <Link href={`/products/${tool.slug}`} className="landing-text-link">
                {tool.action}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <span className="landing-tool-status">
                {tool.slug === "text-to-speech" ||
                tool.slug === "speech-to-text" ||
                tool.slug === "translation"
                  ? "Available to try"
                  : "In development"}
              </span>
            </article>
          ))}
        </div>
        <p className="landing-tools-note">
          Speech-to-text, translation, and text-to-speech are ready to try
          without an account. Video captions are still in development.
        </p>
      </div>
    </section>
  );
}

export function AccessibilitySection() {
  return (
    <section id="about" className="landing-about-section section-anchor">
      <div className="landing-about-inner">
        <div className="landing-about-mark" aria-hidden="true">
          <span>“</span>
          <span className="landing-about-lines">
            <i />
            <i />
            <i />
          </span>
          <span className="landing-about-mark-caption">UNDERSTOOD</span>
        </div>
        <div className="landing-about-copy">
          <p className="landing-kicker">A more inclusive conversation</p>
          <h2>Communication should be accessible to everyone.</h2>
          <p>
            Whether you prefer listening to written information, need spoken
            words converted into text, communicate across languages, or need
            captions to follow a video, EFFECOM brings practical communication
            tools together in one accessible platform.
          </p>
          <p className="landing-about-signoff">
            {siteContent.brand.statement}
          </p>
        </div>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section id="account-access" className="landing-cta-section section-anchor">
      <div className="landing-cta-inner">
        <div>
          <p className="landing-kicker">A clearer way forward</p>
          <h2>Better communication starts with understanding.</h2>
          <p>
            Explore EFFECOM and experience simpler, more accessible
            communication. Try speech-to-text, translation, and text-to-speech
            as a guest, or create an account to keep a private activity history.
          </p>
        </div>
        <div className="landing-cta-action">
          <Link href="#tools" className="landing-button landing-button-light">
            Explore the tools
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link className="landing-cta-account-link" href="/register">
            Create an account
          </Link>
        </div>
      </div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-footer-main">
        <div className="landing-footer-brand">
          <Link href="/" className="landing-brand landing-footer-brand-link">
            <Image
              src="/effecomlogo.jpeg"
              alt=""
              width={44}
              height={44}
              className="landing-brand-image"
            />
            <span className="landing-brand-name">{siteContent.brand.name}</span>
          </Link>
          <p>{siteContent.brand.tagline}</p>
        </div>
        <nav aria-label="Footer navigation" className="landing-footer-nav">
          <Link href="/">Home</Link>
          <Link href="/#tools">Products</Link>
          <Link href="/#about">About</Link>
          <Link href="/login">Sign in</Link>
          <Link href="/register">Create account</Link>
        </nav>
      </div>
      <div className="landing-footer-bottom">
        <span>© EFFECOM</span>
        <span>Communication without barriers.</span>
      </div>
    </footer>
  );
}

export function ToolAvailabilityNotice({ tool }: { tool: (typeof siteContent.tools)[number] }) {
  return (
    <div className="landing-unavailable-notice" role="status">
      <span className="landing-tool-card-icon">
        <ToolIcon icon={tool.icon} />
      </span>
      <div>
        <p className="landing-tool-status">In development</p>
        <p>
          {tool.title} is not connected yet. For now, try translation and
          text-to-speech without an account.
        </p>
      </div>
    </div>
  );
}
