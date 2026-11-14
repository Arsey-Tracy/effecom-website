export type CaptionWord = {
  start: number;
  end: number;
  text: string;
};

export type CaptionSegment = {
  id: string | number;
  start: number;
  end: number;
  text: string;
  words?: CaptionWord[];
};

export type CaptionTrack = {
  language: string;
  segments: CaptionSegment[];
  version: number;
};

export type CaptionVideo = {
  id: string;
  title: string;
  duration: number | null;
  file_size: number;
  detected_language: string;
  status:
    | "uploaded"
    | "queued"
    | "extracting_audio"
    | "transcribing"
    | "generating_captions"
    | "completed"
    | "failed";
  progress: number;
  stage: string;
  error_message: string;
  created_at: string;
  media_url: string;
};

export type CaptionVideoPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: CaptionVideo[];
};

const defaultExtensions = ["mp4", "mov", "mkv", "webm"];

function getAllowedExtensions(extensions?: readonly string[]): string[] {
  if (extensions) {
    return extensions.map((extension) =>
      extension.toLowerCase().replace(/^\./, ""),
    );
  }
  const configured = process.env.NEXT_PUBLIC_CAPTION_ALLOWED_VIDEO_EXTENSIONS;
  return configured
    ? configured
        .split(",")
        .map((extension) => extension.trim().toLowerCase().replace(/^\./, ""))
        .filter(Boolean)
    : defaultExtensions;
}

export function captionAllowedVideoExtensions(): string[] {
  return getAllowedExtensions();
}

export function captionMaxUploadMb(): number {
  return Number(process.env.NEXT_PUBLIC_CAPTION_MAX_UPLOAD_MB ?? 250);
}

export function validateVideoFile(
  file: Pick<File, "name" | "size">,
  maxUploadMb = captionMaxUploadMb(),
  allowedExtensions?: readonly string[],
): string | null {
  const extensions = getAllowedExtensions(allowedExtensions);
  if (!Number.isFinite(maxUploadMb) || maxUploadMb <= 0 || !extensions.length) {
    return "Video upload settings are invalid. Contact your administrator.";
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!extensions.includes(extension)) {
    return `Choose a video in ${extensions.map((item) => `.${item}`).join(", ")} format.`;
  }
  if (file.size <= 0) return "The selected video file is empty.";
  if (file.size > maxUploadMb * 1024 * 1024) {
    return `The video must be ${maxUploadMb} MB or smaller.`;
  }
  return null;
}

export function uploadProgressPercent(
  loaded: number,
  total: number,
  lengthComputable = true,
): number | null {
  if (!lengthComputable || !Number.isFinite(total) || total <= 0) return null;
  return Math.round((Math.min(Math.max(loaded, 0), total) / total) * 100);
}

export function validateCaptionSegments(
  segments: CaptionSegment[],
  duration: number,
): string | null {
  if (!Number.isFinite(duration) || duration <= 0) {
    return "The video duration is unavailable.";
  }
  const ids = new Set<string | number>();
  let previousStart = -Infinity;
  for (const [index, segment] of segments.entries()) {
    if (ids.has(segment.id)) return "Caption segment IDs must be unique.";
    ids.add(segment.id);
    if (
      !Number.isFinite(segment.start) ||
      !Number.isFinite(segment.end) ||
      segment.start < 0 ||
      segment.end <= segment.start ||
      segment.end > duration
    ) {
      return `Caption ${index + 1} must have valid times within the video.`;
    }
    if (segment.start < previousStart) {
      return "Caption segments must be in chronological order.";
    }
    if (!segment.text.trim()) return `Caption ${index + 1} text cannot be empty.`;
    previousStart = segment.start;

    let previousWordStart = segment.start;
    for (const [wordIndex, word] of (segment.words ?? []).entries()) {
      if (
        !Number.isFinite(word.start) ||
        !Number.isFinite(word.end) ||
        word.start < segment.start ||
        word.end <= word.start ||
        word.end > segment.end ||
        word.start < previousWordStart ||
        !word.text.trim()
      ) {
        return `Word ${wordIndex + 1} in caption ${index + 1} must have valid times and text.`;
      }
      previousWordStart = word.start;
    }
  }
  return null;
}

function timestamp(seconds: number, decimalSeparator: "." | ","): string {
  const milliseconds = Math.max(0, Math.round(seconds * 1000));
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const wholeSeconds = Math.floor((milliseconds % 60_000) / 1000);
  const remainder = milliseconds % 1000;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}${decimalSeparator}${String(remainder).padStart(3, "0")}`;
}

export function renderVtt(segments: CaptionSegment[]): string {
  const cues = segments.map((segment, index) =>
    `${index + 1}\n${timestamp(segment.start, ".")} --> ${timestamp(segment.end, ".")}\n${segment.text.trim().replace(/\r\n?/g, "\n")}`,
  );
  return `WEBVTT\n\n${cues.join("\n\n")}${cues.length ? "\n" : ""}`;
}

export function renderSrt(segments: CaptionSegment[]): string {
  const cues = segments.map((segment, index) =>
    `${index + 1}\n${timestamp(segment.start, ",")} --> ${timestamp(segment.end, ",")}\n${segment.text.trim().replace(/\r\n?/g, "\n")}`,
  );
  return `${cues.join("\n\n")}${cues.length ? "\n" : ""}`;
}

export function captionDownloadPath(
  videoId: string,
  format: "srt" | "vtt",
): string {
  return `/api/v1/videos/${encodeURIComponent(videoId)}/captions/download/?format=${format}`;
}

export function isCaptionVersionConflict(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 409,
  );
}
