import axios, {
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

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

const MAX_STT_UPLOAD_BYTES = 4 * 1024 * 1024;
const apiClient = axios.create({
  baseURL: "/",
  withCredentials: true,
  withXSRFToken: true,
  xsrfCookieName: "csrftoken",
  xsrfHeaderName: "X-CSRFToken",
});

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

let refreshRequest: Promise<void> | null = null;

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

function readError(payload: unknown, status: number) {
  if (!payload || typeof payload !== "object") {
    return `Request failed (${status}).`;
  }
  const errorPayload = payload as ApiErrorPayload;

  const apiError = errorPayload.error;
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
      `Request failed (${status}).`;
  }

  const detail = errorPayload.detail ?? apiError;
  if (typeof detail === "string") return detail;

  const messages = collectMessages(
    Object.fromEntries(
      Object.entries(errorPayload).filter(([field]) => field !== "detail"),
    ),
  );
  return messages.join(" ") || `Request failed (${status}).`;
}

function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const message = error.response
      ? readError(error.response.data, status)
      : error.message || "The API could not be reached.";
    return new ApiError(message, status);
  }
  return new ApiError(
    error instanceof Error ? error.message : "The request could not be completed.",
    0,
  );
}

function isAuthEndpoint(url?: string) {
  return /\/api\/v1\/auth\/(?:csrf|login|register|logout|token\/refresh)\/?$/.test(
    url ?? "",
  );
}

apiClient.interceptors.request.use(async (config) => {
  const method = (config.method ?? "GET").toUpperCase();
  const isCsrfBootstrap = /\/api\/v1\/auth\/csrf\/?$/.test(config.url ?? "");
  if (
    ["POST", "PUT", "PATCH", "DELETE"].includes(method) &&
    !isCsrfBootstrap
  ) {
    try {
      await apiClient.get<{ csrfToken: string }>("/api/v1/auth/csrf/");
    } catch (error) {
      throw toApiError(error);
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw toApiError(error);
    const config = error.config as RetryableRequestConfig | undefined;
    if (
      error.response?.status === 401 &&
      config &&
      !config._authRetry &&
      !isAuthEndpoint(config.url)
    ) {
      config._authRetry = true;
      try {
        if (!refreshRequest) {
          refreshRequest = apiClient
            .post("/api/v1/auth/token/refresh/")
            .then(() => undefined)
            .finally(() => {
              refreshRequest = null;
            });
        }
        await refreshRequest;
        return apiClient.request(config);
      } catch {
        throw toApiError(error);
      }
    }
    throw toApiError(error);
  },
);

function getHeaders(headers: HeadersInit | undefined) {
  const result: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = getHeaders(init.headers);
  const formData =
    typeof FormData !== "undefined" && init.body instanceof FormData
      ? init.body
      : null;
  if (
    init.body &&
    !formData &&
    !Object.keys(headers).some((header) => header.toLowerCase() === "content-type")
  ) {
    headers["Content-Type"] = "application/json";
  }
  if (formData && path === "/api/v1/stt/") {
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

  const config: AxiosRequestConfig = {
    url: path,
    method,
    data: init.body,
    headers,
    signal: init.signal ?? undefined,
  };
  try {
    const response = await apiClient.request<T>(config);
    if (response.status === 204) return undefined as T;
    return response.data;
  } catch (error) {
    throw toApiError(error);
  }
}
