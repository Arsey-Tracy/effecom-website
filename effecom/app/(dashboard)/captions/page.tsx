import type { Metadata } from "next";
import { CaptionWorkspace } from "@/components/caption-workspace";

export const metadata: Metadata = { title: "Captions" };

export default function CaptionsPage() {
  return <main id="main-content" className="dashboard-page"><div className="dashboard-inner"><header className="dashboard-heading"><div><p className="landing-kicker">ACCESSIBLE VIDEO</p><h1>Captions</h1><p>Turn a recording into an editable subtitle file.</p></div></header><CaptionWorkspace /></div></main>;
}