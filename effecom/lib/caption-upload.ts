import { ApiError } from "@/lib/api";
import { apiErrorMessage } from "@/lib/api-errors";
import {
  uploadProgressPercent,
  type CaptionVideo,
} from "@/lib/caption-workflow";

function directUploadUrl(): string {
  const origin =
    process.env.NEXT_PUBLIC_EFFECOM_BACKEND_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://effecom-backend.onrender.com"
      : "http://localhost:8000");
  return new URL("/api/v1/videos/upload/", origin).toString();
}

export function uploadVideoDirect(
  file: File,
  title: string,
  ticket: string,
  onProgress: (progress: number | null) => void,
  signal: AbortSignal,
): Promise<CaptionVideo> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);

    const abort = () => xhr.abort();
    const removeAbortListener = () =>
      signal.removeEventListener("abort", abort);
    const rejectAborted = () => {
      removeAbortListener();
      reject(new DOMException("Video upload was cancelled.", "AbortError"));
    };

    if (signal.aborted) {
      rejectAborted();
      return;
    }

    xhr.open("POST", directUploadUrl());
    xhr.withCredentials = false;
    xhr.setRequestHeader("Authorization", `CaptionUpload ${ticket}`);
    xhr.upload.addEventListener("progress", (event) => {
      onProgress(
        uploadProgressPercent(event.loaded, event.total, event.lengthComputable),
      );
    });
    xhr.addEventListener("load", () => {
      removeAbortListener();
      let payload: unknown;
      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        reject(
          new ApiError(
            "The upload API returned an invalid response.",
            xhr.status,
          ),
        );
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(payload as CaptionVideo);
        return;
      }
      reject(new ApiError(apiErrorMessage(payload, xhr.status), xhr.status));
    });
    xhr.addEventListener("error", () => {
      removeAbortListener();
      reject(new ApiError("The direct upload API could not be reached.", 0));
    });
    xhr.addEventListener("abort", rejectAborted, { once: true });
    signal.addEventListener("abort", abort, { once: true });
    xhr.send(formData);
  });
}
