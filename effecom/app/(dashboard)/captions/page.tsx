import type { Metadata } from "next";
import Link from "next/link";
import { CaptionDashboard } from "@/components/caption-dashboard";

export const metadata: Metadata = { title: "Captions" };

export default function CaptionsPage() {
  return (
    <main id="main-content" className="dashboard-page">
      <div className="dashboard-inner">
        <header className="dashboard-heading">
          <div>
            <p className="landing-kicker">ACCESSIBLE VIDEO</p>
            <h1>Video captions</h1>
            <p>Transcribe, review, and export captions for your videos.</p>
          </div>
          <Link className="landing-button landing-button-secondary" href="/captions/audio">
            Open audio captions
          </Link>
        </header>
        <CaptionDashboard />
      </div>
    </main>
  );
}