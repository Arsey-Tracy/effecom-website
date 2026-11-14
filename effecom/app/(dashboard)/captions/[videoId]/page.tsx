import type { Metadata } from "next";
import { VideoCaptionEditor } from "@/components/video-caption-editor";

export const metadata: Metadata = { title: "Edit captions" };

export default async function VideoCaptionPage({
  params,
}: {
  params: Promise<{ videoId: string }>;
}) {
  const { videoId } = await params;
  return <VideoCaptionEditor key={videoId} videoId={videoId} />;
}
