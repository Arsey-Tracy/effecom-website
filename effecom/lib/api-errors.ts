type ApiErrorPayload = {
  detail?: unknown;
  error?: unknown;
  [key: string]: unknown;
};

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

export function apiErrorMessage(payload: unknown, status: number): string {
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
