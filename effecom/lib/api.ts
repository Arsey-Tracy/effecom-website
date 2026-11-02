const apiBaseUrl = (
  process.env.NEXT_PUBLIC_EFFECOM_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");

type ApiErrorPayload = {
  detail?: string;
  error?: string;
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

async function readError(response: Response) {
  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | null;
  if (!payload) return `Request failed (${response.status}).`;

  const detail = payload.detail ?? payload.error;
  if (typeof detail === "string") return detail;

  const messages = Object.entries(payload).flatMap(([field, value]) => {
    if (typeof value === "string") return [`${field}: ${value}`];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string")
        .map((item) => `${field}: ${item}`);
    }
    return [];
  });
  return messages.join(" ") || `Request failed (${response.status}).`;
}

async function getCsrfToken() {
  const response = await fetch(`${apiBaseUrl}/api/v1/auth/csrf/`, {
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
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    headers.set("X-CSRFToken", await getCsrfToken());
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
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
