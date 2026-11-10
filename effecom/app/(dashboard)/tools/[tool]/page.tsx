import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ToolWorkspace } from "@/components/tool-workspace";

const toolDetails = {
  "speech-to-text": { title: "Speech to text", description: "Turn a supported WAV recording into a written transcript." },
  "text-to-speech": { title: "Text to speech", description: "Create spoken audio from your text using a supported voice." },
  translation: { title: "Translation", description: "Translate text between languages supported by EFFECOM." },
} as const;

type ToolSlug = keyof typeof toolDetails;
type ToolPageProps = { params: Promise<{ tool: string }> };

export const metadata: Metadata = { title: "EFFECOM Workspace" };

function isToolSlug(value: string): value is ToolSlug {
  return value in toolDetails;
}

export function generateStaticParams() {
  return Object.keys(toolDetails).map((tool) => ({ tool }));
}

async function DashboardToolContent({ params }: ToolPageProps) {
  const { tool } = await params;
  if (!isToolSlug(tool)) notFound();

  return (
    <>
      <header className="dashboard-heading">
        <div><p className="landing-kicker">EFFECOM WORKSPACE</p><h1>{toolDetails[tool].title}</h1><p>{toolDetails[tool].description}</p></div>
      </header>
      <ToolWorkspace tool={tool} />
    </>
  );
}

export default function DashboardToolPage({ params }: ToolPageProps) {
  return (
    <main id="main-content" className="dashboard-page">
      <div className="dashboard-inner">
        <Suspense fallback={<p role="status">Loading tool…</p>}>
          <DashboardToolContent params={params} />
        </Suspense>
      </div>
    </main>
  );
}
