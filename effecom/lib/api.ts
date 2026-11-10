type ApiErrorPayload = {
  detail?: unknown;
  error?: unknown;
  [key: string]: unknown;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let csrfToken: string | null = null;
const MAX_STT_UPLOAD_BYTES = 4 * 1024 * 1024;

function collectMessages(value: unknown, field = ""): string[] {
  if (typeof value === "string") {
    return [field ? `${field}: ${value}` : value];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => collectMessages(item, field));
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, nested]) =>
      collectMessages(nested, field ? `${field}.${key}` : key),
    );
  }
  return [];
}

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;
  if (!payload) return `Request failed (${response.status}).`;

  const apiError = payload.error;
  if (apiError && typeof apiError === "object" && !Array.isArray(apiError)) {
    const structuredError = apiError as {
      message?: unknown;
      details?: unknown;
    };
    const message =
      typeof structuredError.message === "string"
        ? structuredError.message
        : "";
    const details = collectMessages(structuredError.details);
    return [...new Set([message, ...details].filter(Boolean))].join(" ") ||
      `Request failed (${response.status}).`;
  }

  const detail = payload.detail ?? apiError;
  if (typeof detail === "string") return detail;

  const messages = collectMessages(
    Object.fromEntries(
      Object.entries(payload).filter(([field]) => field !== "detail"),
    ),
  );
  return messages.join(" ") || `Request failed (${response.status}).`;
}

async function getCsrfToken() {
  const response = await fetch("/api/v1/auth/csrf/", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }
  const payload = (await response.json()) as { csrfToken: string };
  csrfToken = payload.csrfToken;
  return csrfToken;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  const formData =
    typeof FormData !== "undefined" && init.body instanceof FormData
      ? init.body
      : null;
  if (path === "/api/v1/stt/" && formData) {
    const audio = formData.get("audio");
    if (
      typeof Blob !== "undefined" &&
      audio instanceof Blob &&
      audio.size > MAX_STT_UPLOAD_BYTES
    ) {
      throw new ApiError(
        "Audio recordings must be 4 MB or smaller when using the hosted app.",
        413,
      );
    }
  }
  if (init.body && !formData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-CSRFToken", await getCsrfToken());
  }

  const response = await fetch(path, {
    ...init,
    method,
    headers,
    credentials: "include",
  });
  if (!response.ok) {
    throw new ApiError(await readError(response), response.status);
  }
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}
