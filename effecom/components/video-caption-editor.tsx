"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Captions,
  Download,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Save,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api";
import {
  captionDownloadPath,
  isCaptionVersionConflict,
  renderVtt,
  validateCaptionSegments,
  type CaptionSegment,
  type CaptionTrack,
  type CaptionVideo,
} from "@/lib/caption-workflow";

const ACTIVE_STATUSES = new Set<CaptionVideo["status"]>([
  "queued",
  "extracting_audio",
  "transcribing",
  "generating_captions",
]);
const EDITOR_ROW_HEIGHT = 160;
const EDITOR_VIEWPORT_HEIGHT = 600;
const EDITOR_OVERSCAN = 5;

function videoApiPath(videoId: string, suffix = "") {
  return `/api/v1/videos/${encodeURIComponent(videoId)}/${suffix}`;
}

function errorText(cause: unknown, fallback: string) {
  return cause instanceof Error ? cause.message : fallback;
}

export function VideoCaptionEditor({ videoId }: { videoId: string }) {
  const [video, setVideo] = useState<CaptionVideo | null>(null);
  const [track, setTrack] = useState<CaptionTrack | null>(null);
  const [segments, setSegments] = useState<CaptionSegment[]>([]);
  const [deletedIds, setDeletedIds] = useState<(string | number)[]>([]);
  const [savedVtt, setSavedVtt] = useState<string | null>(null);
  const [captionsVisible, setCaptionsVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingTrack, setLoadingTrack] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [downloading, setDownloading] = useState<"srt" | "vtt" | "">("");
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackElementRef = useRef<HTMLTrackElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const trackLoaded = useRef(false);

  const fetchTrack = useCallback(async () => {
    setLoadingTrack(true);
    try {
      const loadedTrack = await apiRequest<CaptionTrack>(
        videoApiPath(videoId, "captions/"),
      );
      const vtt = await apiRequest<string>(
        captionDownloadPath(videoId, "vtt"),
      );
      trackLoaded.current = true;
      setTrack(loadedTrack);
      setSegments(loadedTrack.segments);
      setDeletedIds([]);
      setSavedVtt(vtt);
      setConflict(false);
      setError("");
    } catch (cause: unknown) {
      setError(errorText(cause, "Captions could not be loaded."));
      throw cause;
    } finally {
      setLoadingTrack(false);
    }
  }, [videoId]);

  const fetchVideo = useCallback(async () => {
    const loadedVideo = await apiRequest<CaptionVideo>(
      videoApiPath(videoId),
    );
    setVideo(loadedVideo);
    if (loadedVideo.status === "completed" && !trackLoaded.current) {
      await fetchTrack();
    }
  }, [fetchTrack, videoId]);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      void fetchVideo()
        .catch((cause: unknown) => {
          if (active) setError(errorText(cause, "The video could not be loaded."));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchVideo]);

  const hasActiveJob = video !== null && ACTIVE_STATUSES.has(video.status);
  useEffect(() => {
    if (!hasActiveJob) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      try {
        await fetchVideo();
      } catch (cause: unknown) {
        setError(errorText(cause, "The caption job status could not be refreshed."));
      }
      if (!cancelled) timer = setTimeout(poll, 2500);
    };
    timer = setTimeout(poll, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fetchVideo, hasActiveJob]);

  const isDirty = track !== null && (
    deletedIds.length > 0 ||
    JSON.stringify(segments) !== JSON.stringify(track.segments)
  );
  const validationError = video?.duration
    ? validateCaptionSegments(segments, video.duration)
    : "The video duration is unavailable.";
  const previewText = isDirty && !validationError
    ? renderVtt(segments)
    : savedVtt;

  useEffect(() => {
    const trackElement = trackElementRef.current;
    if (previewText === null || !trackElement) return;
    const url = URL.createObjectURL(
      new Blob([previewText], { type: "text/vtt;charset=utf-8" }),
    );
    previewUrlRef.current = url;
    trackElement.src = url;
    return () => {
      if (previewUrlRef.current === url) previewUrlRef.current = null;
      trackElementRef.current?.removeAttribute("src");
      URL.revokeObjectURL(url);
    };
  }, [previewText]);

  const bindTrackElement = useCallback((element: HTMLTrackElement | null) => {
    trackElementRef.current = element;
    if (element && previewUrlRef.current) {
      element.src = previewUrlRef.current;
    }
  }, []);

  const onTrackLoad = useCallback(() => {
    const textTrack = videoRef.current?.textTracks[0];
    if (textTrack) textTrack.mode = captionsVisible ? "showing" : "hidden";
  }, [captionsVisible]);

  const activeIndex = segments.findIndex(
    (segment) => currentTime >= segment.start && currentTime < segment.end,
  );
  const firstVisible = Math.max(
    0,
    Math.floor(scrollTop / EDITOR_ROW_HEIGHT) - EDITOR_OVERSCAN,
  );
  const lastVisible = Math.min(
    segments.length,
    Math.ceil((scrollTop + EDITOR_VIEWPORT_HEIGHT) / EDITOR_ROW_HEIGHT) +
      EDITOR_OVERSCAN,
  );
  const visibleSegments = segments.slice(firstVisible, lastVisible);

  function updateSegment(
    id: string | number,
    update: Partial<CaptionSegment>,
  ) {
    setSegments((current) =>
      current.map((segment) =>
        segment.id === id ? { ...segment, ...update } : segment,
      ),
    );
  }

  function addSegment() {
    if (!video?.duration || video.duration <= 0) return;
    const lastEnd = segments.at(-1)?.end ?? 0;
    const start = Math.min(lastEnd, Math.max(0, video.duration - 0.1));
    const end = Math.min(video.duration, start + 2);
    if (end <= start) return;
    const newSegment: CaptionSegment = {
      id: crypto.randomUUID(),
      start,
      end,
      text: "",
    };
    setSegments((current) => [...current, newSegment]);
  }

  function removeSegment(id: string | number) {
    if (track?.segments.some((segment) => segment.id === id)) {
      setDeletedIds((current) => current.includes(id) ? current : [...current, id]);
    }
    setSegments((current) => current.filter((segment) => segment.id !== id));
  }

  function seekTo(time: number) {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, time);
      videoRef.current.focus();
    }
  }

  async function saveCaptions() {
    if (!track || !video?.duration) return;
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError("");
    setConflict(false);
    try {
      const saved = await apiRequest<CaptionTrack>(
        videoApiPath(videoId, "captions/"),
        {
          method: "PATCH",
          body: JSON.stringify({
            version: track.version,
            segments,
            deleted_ids: deletedIds,
          }),
        },
      );
      setTrack(saved);
      setSegments(saved.segments);
      setDeletedIds([]);
      setSavedVtt(renderVtt(saved.segments));
    } catch (cause: unknown) {
      if (isCaptionVersionConflict(cause)) {
        setConflict(true);
        setError("These captions changed elsewhere. Reload the latest version before saving again.");
      } else {
        setError(errorText(cause, "Caption changes could not be saved."));
      }
    } finally {
      setSaving(false);
    }
  }

  async function reloadCaptions() {
    try {
      await fetchTrack();
    } catch {
      // fetchTrack sets the user-visible error.
    }
  }

  async function startProcessing() {
    setProcessing(true);
    setError("");
    try {
      const updated = await apiRequest<CaptionVideo>(
        videoApiPath(videoId, "process/"),
        { method: "POST", body: JSON.stringify({}) },
      );
      setVideo(updated);
    } catch (cause: unknown) {
      setError(errorText(cause, "Captioning could not be started."));
    } finally {
      setProcessing(false);
    }
  }

  async function downloadSavedCaptions(format: "srt" | "vtt") {
    setDownloading(format);
    setError("");
    try {
      const content = await apiRequest<string>(
        captionDownloadPath(videoId, format),
      );
      const mimeType = format === "srt"
        ? "application/x-subrip;charset=utf-8"
        : "text/vtt;charset=utf-8";
      const url = URL.createObjectURL(new Blob([content], { type: mimeType }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `captions-${videoId}.${format}`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause: unknown) {
      setError(errorText(cause, `${format.toUpperCase()} export failed.`));
    } finally {
      setDownloading("");
    }
  }

  if (loading) {
    return (
      <main id="main-content" className="dashboard-page">
        <div className="dashboard-inner">
          <p className="activity-empty" role="status">Loading video workspace…</p>
        </div>
      </main>
    );
  }

  if (!video) {
    return (
      <main id="main-content" className="dashboard-page">
        <div className="dashboard-inner">
          <Link className="caption-back-link" href="/captions"><ArrowLeft size={16} /> All videos</Link>
          {error && <p className="tool-error" role="alert">{error}</p>}
        </div>
      </main>
    );
  }

  const canEdit = video.status === "completed" && track !== null;
  const canAddSegment = Boolean(
    video.duration && (segments.at(-1)?.end ?? 0) < video.duration,
  );

  return (
    <main id="main-content" className="dashboard-page caption-workspace-page">
      <div className="dashboard-inner">
        <div className="caption-workspace-toolbar">
          <Link className="caption-back-link" href="/captions">
            <ArrowLeft aria-hidden="true" size={16} /> All videos
          </Link>
          {video.status === "uploaded" || video.status === "failed" ? (
            <Button type="button" onClick={() => void startProcessing()} disabled={processing}>
              {processing ? "Starting…" : video.status === "failed" ? "Retry captioning" : "Start captioning"}
            </Button>
          ) : null}
        </div>
        <header className="dashboard-heading caption-video-heading">
          <div>
            <p className="landing-kicker">VIDEO CAPTION WORKSPACE</p>
            <h1>{video.title}</h1>
            <p>
              {video.status.replaceAll("_", " ")}
              {video.status === "completed" && video.detected_language
                ? ` · ${video.detected_language}`
                : ""}
            </p>
          </div>
        </header>
        {error && <p className="tool-error caption-workspace-error" role="alert">{error}</p>}
        {conflict && (
          <div className="caption-conflict" role="alert">
            <span>Reload the latest saved captions to resolve this conflict.</span>
            <Button type="button" size="sm" variant="outline" onClick={() => void reloadCaptions()} disabled={loadingTrack}>
              <RefreshCw aria-hidden="true" /> Reload captions
            </Button>
          </div>
        )}
        {ACTIVE_STATUSES.has(video.status) && (
          <section className="workspace-panel caption-processing">
            <div className="caption-processing-heading">
              <div>
                <strong>{video.stage || "Transcription in progress"}</strong>
                <span>Keep this page open or return later to check progress.</span>
              </div>
              <span>{video.progress}%</span>
            </div>
            <div
              className="caption-job-progress caption-processing-bar"
              role="progressbar"
              aria-label="Transcription progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={video.progress}
            >
              <div><span style={{ width: `${video.progress}%` }} /></div>
            </div>
          </section>
        )}
        {video.error_message && <p className="caption-job-error">{video.error_message}</p>}

        <div className="caption-workspace-grid">
          <section className="workspace-panel caption-player-panel">
            <div className="workspace-panel-heading">
              <div>
                <p className="landing-kicker">PREVIEW</p>
                <h2><Captions aria-hidden="true" size={18} /> Video and captions</h2>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => setCaptionsVisible((current) => !current)}
                disabled={savedVtt === null}
                aria-pressed={captionsVisible}
              >
                {captionsVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                {captionsVisible ? "Hide captions" : "Show captions"}
              </Button>
            </div>
            <video
              ref={videoRef}
              className="caption-video-player"
              src={video.media_url}
              controls
              preload="metadata"
              onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
              aria-label={`Video preview: ${video.title}`}
            >
              {savedVtt !== null && track && (
                <track
                  key={captionsVisible ? "captions-visible" : "captions-hidden"}
                  ref={bindTrackElement}
                  kind="captions"
                  srcLang={track.language || video.detected_language || "en"}
                  label={track.language || video.detected_language || "Captions"}
                  default={captionsVisible}
                  onLoad={onTrackLoad}
                />
              )}
            </video>
            <p className="caption-player-note">
              Caption preview updates from valid unsaved edits. SRT and VTT downloads use saved captions.
            </p>
          </section>

          <section className="workspace-panel caption-editor">
            <div className="workspace-panel-heading">
              <div>
                <p className="landing-kicker">CAPTION EDITOR</p>
                <h2>Segments <span className="caption-count">{segments.length}</span></h2>
              </div>
              {canEdit && (
                <div className="caption-actions">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void downloadSavedCaptions("srt")}
                    disabled={downloading !== "" || isDirty || !track?.segments.length}
                  >
                    <Download aria-hidden="true" /> SRT
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => void downloadSavedCaptions("vtt")}
                    disabled={downloading !== "" || isDirty || !track?.segments.length}
                  >
                    <Download aria-hidden="true" /> VTT
                  </Button>
                </div>
              )}
            </div>
            {loadingTrack && <p className="activity-empty" role="status">Loading saved captions…</p>}
            {!loadingTrack && !canEdit && (
              <p className="activity-empty">
                Captions will be available here after transcription completes.
              </p>
            )}
            {canEdit && (
              <>
                <div className="caption-editor-actions">
                  <span>{isDirty ? "Unsaved edits" : `Version ${track.version}`}</span>
                  <div className="caption-actions">
                    <Button type="button" size="sm" variant="outline" onClick={addSegment} disabled={!canAddSegment}>
                      <Plus aria-hidden="true" /> Add segment
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => void saveCaptions()}
                      disabled={!isDirty || Boolean(validationError) || saving || conflict}
                    >
                      <Save aria-hidden="true" /> {saving ? "Saving…" : "Save"}
                    </Button>
                  </div>
                </div>
                {validationError && segments.length > 0 && (
                  <p className="caption-validation-error" role="status">{validationError}</p>
                )}
                {segments.length > 0 ? (
                  <div
                    className="caption-virtual-list"
                    style={{ height: EDITOR_VIEWPORT_HEIGHT }}
                    onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
                    aria-label="Caption segments"
                  >
                    <div
                      style={{
                        height: segments.length * EDITOR_ROW_HEIGHT,
                        position: "relative",
                      }}
                    >
                      <ol
                        className="caption-virtual-rows"
                        style={{
                          position: "absolute",
                          top: firstVisible * EDITOR_ROW_HEIGHT,
                          left: 0,
                          right: 0,
                        }}
                      >
                        {visibleSegments.map((segment, offset) => {
                          const index = firstVisible + offset;
                          return (
                            <li
                              className={`caption-edit-row${activeIndex === index ? " is-active" : ""}`}
                              key={segment.id}
                              style={{ height: EDITOR_ROW_HEIGHT }}
                            >
                              <span className="caption-index">{String(index + 1).padStart(2, "0")}</span>
                              <div className="caption-edit-fields">
                                <Textarea
                                  aria-label={`Caption ${index + 1} text`}
                                  rows={2}
                                  value={segment.text}
                                  onChange={(event) => updateSegment(segment.id, { text: event.target.value })}
                                />
                                <div className="caption-time-fields">
                                  <label>
                                    <span>Start (sec)</span>
                                    <Input
                                      aria-label={`Caption ${index + 1} start time`}
                                      type="number"
                                      min="0"
                                      max={video.duration ?? undefined}
                                      step="0.1"
                                      value={Number.isFinite(segment.start) ? segment.start : ""}
                                      onChange={(event) => updateSegment(segment.id, {
                                        start: event.target.value === "" ? Number.NaN : Number(event.target.value),
                                      })}
                                    />
                                  </label>
                                  <label>
                                    <span>End (sec)</span>
                                    <Input
                                      aria-label={`Caption ${index + 1} end time`}
                                      type="number"
                                      min="0"
                                      max={video.duration ?? undefined}
                                      step="0.1"
                                      value={Number.isFinite(segment.end) ? segment.end : ""}
                                      onChange={(event) => updateSegment(segment.id, {
                                        end: event.target.value === "" ? Number.NaN : Number(event.target.value),
                                      })}
                                    />
                                  </label>
                                </div>
                              </div>
                              <div className="caption-segment-actions">
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label={`Seek to caption ${index + 1}`}
                                  onClick={() => seekTo(segment.start)}
                                >
                                  <span className="caption-seek-icon" aria-hidden="true">▶</span>
                                </Button>
                                <Button
                                  type="button"
                                  size="icon-sm"
                                  variant="ghost"
                                  aria-label={`Delete caption ${index + 1}`}
                                  onClick={() => removeSegment(segment.id)}
                                >
                                  <Trash2 aria-hidden="true" />
                                </Button>
                              </div>
                            </li>
                          );
                        })}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <p className="activity-empty">
                    No caption segments. Add a segment to begin editing.
                  </p>
                )}
                {isDirty && <p className="caption-save-note">Exports are disabled until these edits are saved.</p>}
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
