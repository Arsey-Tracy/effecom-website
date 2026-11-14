"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Captions, CloudUpload, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api";
import { uploadVideoDirect } from "@/lib/caption-upload";
import {
  captionAllowedVideoExtensions,
  captionMaxUploadMb,
  validateVideoFile,
  type CaptionVideo,
  type CaptionVideoPage,
} from "@/lib/caption-workflow";

const PAGE_SIZE = 20;
const ACTIVE_STATUSES = new Set<CaptionVideo["status"]>([
  "queued",
  "extracting_audio",
  "transcribing",
  "generating_captions",
]);

function apiPath(path: string) {
  return `/api/v1/videos/${path}`;
}

function formatDuration(seconds: number | null) {
  if (seconds === null || !Number.isFinite(seconds)) return "Duration pending";
  const wholeSeconds = Math.max(0, Math.floor(seconds));
  return `${Math.floor(wholeSeconds / 60)}:${String(wholeSeconds % 60).padStart(2, "0")}`;
}

function formatBytes(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function statusLabel(video: CaptionVideo) {
  if (video.status === "transcribing" || video.status === "extracting_audio") {
    return video.stage || video.status.replaceAll("_", " ");
  }
  return video.status.replaceAll("_", " ");
}

export function CaptionDashboard() {
  const [videos, setVideos] = useState<CaptionVideo[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [busyVideoId, setBusyVideoId] = useState("");
  const [actionError, setActionError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadController = useRef<AbortController | null>(null);

  const loadVideos = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const result = await apiRequest<CaptionVideoPage>(
        `${apiPath("")}?page=${page}`,
      );
      setVideos(result.results);
      setCount(result.count);
      setListError("");
    } catch (cause: unknown) {
      setListError(
        cause instanceof Error ? cause.message : "Videos could not be loaded.",
      );
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = setTimeout(() => void loadVideos(), 0);
    return () => clearTimeout(timer);
  }, [loadVideos]);

  const hasActiveJobs = videos.some((video) => ACTIVE_STATUSES.has(video.status));
  useEffect(() => {
    if (!hasActiveJobs) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      await loadVideos(false);
      if (!cancelled) timer = setTimeout(poll, 2500);
    };
    timer = setTimeout(poll, 2500);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [hasActiveJobs, loadVideos]);

  useEffect(() => () => uploadController.current?.abort(), []);

  function chooseFile(file: File | undefined) {
    setUploadError("");
    setUploadMessage("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    const validationError = validateVideoFile(file);
    if (validationError) {
      setSelectedFile(null);
      setUploadError(validationError);
      return;
    }
    setSelectedFile(file);
    setTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  async function submitUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUploadError("");
    setUploadMessage("");
    if (!selectedFile) {
      setUploadError("Choose a video file first.");
      return;
    }
    const validationError = validateVideoFile(selectedFile);
    if (validationError) {
      setUploadError(validationError);
      return;
    }

    const controller = new AbortController();
    uploadController.current = controller;
    setUploading(true);
    setUploadProgress(0);
    try {
      const ticket = await apiRequest<{ ticket: string }>(
        apiPath("upload-ticket/"),
        { method: "POST", body: JSON.stringify({}), signal: controller.signal },
      );
      await uploadVideoDirect(
        selectedFile,
        title.trim() || selectedFile.name.replace(/\.[^.]+$/, ""),
        ticket.ticket,
        setUploadProgress,
        controller.signal,
      );
      setSelectedFile(null);
      setTitle("");
      setUploadProgress(100);
      setUploadMessage("Video uploaded. Start captioning when you’re ready.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await loadVideos(false);
    } catch (cause: unknown) {
      if (controller.signal.aborted) return;
      setUploadError(
        cause instanceof Error ? cause.message : "The video could not be uploaded.",
      );
    } finally {
      if (uploadController.current === controller) uploadController.current = null;
      setUploading(false);
    }
  }

  async function processVideo(videoId: string) {
    setBusyVideoId(videoId);
    setActionError("");
    try {
      const updated = await apiRequest<CaptionVideo>(
        apiPath(`${encodeURIComponent(videoId)}/process/`),
        { method: "POST", body: JSON.stringify({}) },
      );
      setVideos((current) =>
        current.map((video) => video.id === videoId ? updated : video),
      );
    } catch (cause: unknown) {
      setActionError(
        cause instanceof Error ? cause.message : "Captioning could not be started.",
      );
    } finally {
      setBusyVideoId("");
    }
  }

  async function deleteVideo(video: CaptionVideo) {
    if (!window.confirm(`Delete “${video.title}” and its saved captions?`)) return;
    setBusyVideoId(video.id);
    setActionError("");
    try {
      await apiRequest(apiPath(`${encodeURIComponent(video.id)}/`), {
        method: "DELETE",
      });
      setVideos((current) => current.filter((item) => item.id !== video.id));
      setCount((current) => Math.max(0, current - 1));
    } catch (cause: unknown) {
      setActionError(
        cause instanceof Error ? cause.message : "The video could not be deleted.",
      );
    } finally {
      setBusyVideoId("");
    }
  }

  const pageCount = Math.max(1, Math.ceil(count / PAGE_SIZE));
  const allowedExtensions = captionAllowedVideoExtensions();
  const maxUploadMb = captionMaxUploadMb();

  return (
    <div className="caption-dashboard">
      <section className="workspace-panel caption-upload-panel">
        <div className="workspace-panel-heading">
          <div>
            <p className="landing-kicker">LOCAL AI CAPTIONING</p>
            <h2>Upload a video</h2>
          </div>
          <Link className="caption-audio-link" href="/captions/audio">
            <Captions aria-hidden="true" size={16} />
            Audio captions
          </Link>
        </div>
        <p className="workspace-description">
          Upload directly to the caption service, track transcription progress, and edit the generated subtitles.
        </p>
        <form className="caption-upload-form" onSubmit={submitUpload}>
          <input
            ref={fileInputRef}
            className="caption-file-input"
            type="file"
            accept={allowedExtensions.map((extension) => `.${extension}`).join(",")}
            onChange={(event) => chooseFile(event.target.files?.[0])}
            disabled={uploading}
          />
          <button
            type="button"
            className={`caption-dropzone${dragging ? " is-dragging" : ""}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              chooseFile(event.dataTransfer.files[0]);
            }}
            disabled={uploading}
          >
            <CloudUpload aria-hidden="true" size={26} />
            <strong>{selectedFile ? selectedFile.name : "Choose or drop a video"}</strong>
            <span>
              {allowedExtensions.map((extension) => extension.toUpperCase()).join(", ")}
              {" · up to "}
              {maxUploadMb} MB
            </span>
          </button>
          <label className="app-field caption-title-field">
            <span>Title (optional)</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              maxLength={255}
              placeholder="Use the video filename"
              disabled={!selectedFile || uploading}
            />
          </label>
          <div className="caption-upload-actions">
            <Button type="submit" disabled={!selectedFile || uploading}>
              {uploading ? "Uploading…" : "Upload video"}
            </Button>
            {uploading && uploadProgress !== null && (
              <span className="caption-upload-percent">{uploadProgress}%</span>
            )}
          </div>
          {uploading && (
            <div
              className="caption-upload-progress"
              role="progressbar"
              aria-label="Video upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={uploadProgress ?? undefined}
            >
              <span style={{ width: `${uploadProgress ?? 0}%` }} />
            </div>
          )}
          {uploadError && <p className="tool-error" role="alert">{uploadError}</p>}
          {uploadMessage && <p className="app-success" role="status">{uploadMessage}</p>}
        </form>
      </section>

      <section className="workspace-panel caption-video-panel">
        <div className="workspace-panel-heading">
          <div>
            <p className="landing-kicker">YOUR VIDEOS</p>
            <h2>Caption jobs <span className="caption-count">{count}</span></h2>
          </div>
        </div>
        {actionError && <p className="tool-error" role="alert">{actionError}</p>}
        {listError && <p className="tool-error" role="alert">{listError}</p>}
        {loading ? (
          <p className="activity-empty" role="status">Loading your videos…</p>
        ) : videos.length === 0 ? (
          <p className="activity-empty">Your uploaded videos and caption jobs will appear here.</p>
        ) : (
          <ul className="caption-video-list">
            {videos.map((video) => {
              const isActive = ACTIVE_STATUSES.has(video.status);
              const isBusy = busyVideoId === video.id;
              return (
                <li className="caption-video-card" key={video.id}>
                  <div className="caption-video-main">
                    <div className="caption-video-title-row">
                      <h3>{video.title}</h3>
                      <span className={`caption-status is-${video.status}`}>
                        {statusLabel(video)}
                      </span>
                    </div>
                    <p>{formatDuration(video.duration)} · {formatBytes(video.file_size)}</p>
                    {isActive && (
                      <div className="caption-job-progress">
                        <div
                          role="progressbar"
                          aria-label={`${video.title} captioning progress`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={video.progress}
                        >
                          <span style={{ width: `${video.progress}%` }} />
                        </div>
                        <span>{video.progress}%</span>
                      </div>
                    )}
                    {video.error_message && <p className="caption-job-error">{video.error_message}</p>}
                  </div>
                  <div className="caption-video-actions">
                    {video.status === "uploaded" || video.status === "failed" ? (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => void processVideo(video.id)}
                        disabled={isBusy}
                      >
                        {isBusy ? "Starting…" : video.status === "failed" ? "Retry" : "Start captioning"}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      render={<Link href={`/captions/${encodeURIComponent(video.id)}`} />}
                    >
                      Open <ExternalLink aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="icon-sm"
                      variant="ghost"
                      aria-label={`Delete ${video.title}`}
                      onClick={() => void deleteVideo(video)}
                      disabled={isBusy || isActive}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        {pageCount > 1 && (
          <div className="caption-pagination">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <span>Page {page} of {pageCount}</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              disabled={page >= pageCount || loading}
            >
              Next
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}
