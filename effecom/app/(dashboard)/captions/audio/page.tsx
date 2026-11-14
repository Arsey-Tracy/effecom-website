import type { Metadata } from "next";
import Link from "next/link";
import { CaptionWorkspace } from "@/components/caption-workspace";

export const metadata: Metadata = { title: "Audio captions" };

export default function AudioCaptionsPage() {
  return (
    <main id="main-content" className="dashboard-page">
      <div className="dashboard-inner">
        <header className="dashboard-heading">
          <div>
            <p className="landing-kicker">AUDIO TO SUBTITLES</p>
            <h1>Audio captions</h1>
            <p>Keep using the existing WAV transcription and SRT editor.</p>
          </div>
          <Link className="landing-button landing-button-secondary" href="/captions">
            Back to video captions
          </Link>
        </header>
        <CaptionWorkspace />
      </div>
    </main>
  );
}
