import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  SiteFooter,
  ToolAvailabilityNotice,
} from "@/components/home-sections";
import { SiteHeader } from "@/components/site-header";
import { ToolWorkspace } from "@/components/tool-workspace";
import { siteContent } from "@/lib/site-content";

type ProductPageProps = {
  params: Promise<{ tool: string }>;
};

function getTool(slug: string) {
  return siteContent.tools.find((tool) => tool.slug === slug);
}

export function generateStaticParams() {
  return siteContent.tools.map((tool) => ({ tool: tool.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  "use cache";

  const { tool: slug } = await params;
  const tool = getTool(slug);

  return {
    title: tool?.title ?? "Product",
    description: tool?.description,
  };
}

async function ProductContent({ params }: ProductPageProps) {
  const { tool: slug } = await params;
  const tool = getTool(slug);

  if (!tool) notFound();

  return (
    <>
      <p className="landing-kicker">EFFECOM / {tool.title}</p>
      <h1>{tool.headline}</h1>
      <p className="landing-product-description">{tool.description}</p>
      {tool.slug === "text-to-speech" ||
      tool.slug === "speech-to-text" ||
      tool.slug === "translation" ? (
        <ToolWorkspace
          tool={
            tool.slug === "text-to-speech"
              ? "text-to-speech"
              : tool.slug === "speech-to-text"
                ? "speech-to-text"
                : "translation"
          }
        />
      ) : (
        <ToolAvailabilityNotice tool={tool} />
      )}
      <Link href="/#tools" className="landing-button landing-button-primary">
        Explore all four tools
        <ArrowRight aria-hidden="true" className="size-4" />
      </Link>
    </>
  );
}

function ProductLoading() {
  return <p role="status">Loading tool…</p>;
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="landing-product-page">
        <div className="landing-product-inner">
          <Link href="/#tools" className="landing-product-back">
            <ArrowLeft aria-hidden="true" className="size-4" />
            All tools
          </Link>
          <Suspense fallback={<ProductLoading />}>
            <ProductContent params={params} />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
