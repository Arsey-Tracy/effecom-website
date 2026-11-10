import { NextResponse } from "next/server";

export const maxDuration = 240;

const backendOrigin = (
  process.env.EFFECOM_BACKEND_URL ??
  (process.env.NODE_ENV === "production"
    ? "https://effecom-backend.onrender.com"
    : "http://localhost:8000")
).replace(/\/+$/, "");

const hopByHopHeaders = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function proxyRequest(request: Request, context: RouteContext) {
  const { path } = await context.params;
  const upstreamUrl = new URL(
    `/api/v1/${path.map(encodeURIComponent).join("/")}/`,
    backendOrigin,
  );
  upstreamUrl.search = new URL(request.url).search;

  const headers = new Headers(request.headers);
  for (const header of hopByHopHeaders) headers.delete(header);

  const hasBody = !["GET", "HEAD"].includes(request.method);
  const init: RequestInit & { duplex: "half" } = {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
    signal: AbortSignal.timeout(220_000),
    duplex: "half",
  };

  try {
    const upstream = await fetch(upstreamUrl, init);
    const responseHeaders = new Headers();
    upstream.headers.forEach((value, name) => {
      if (name !== "set-cookie" && !hopByHopHeaders.has(name)) {
        responseHeaders.set(name, value);
      }
    });
    for (const cookie of upstream.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", cookie);
    }

    return new Response(
      [204, 304].includes(upstream.status) ? null : upstream.body,
      {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders,
      },
    );
  } catch (error) {
    console.error("Backend API proxy request failed.", error);
    const timedOut =
      error instanceof DOMException && error.name === "TimeoutError";
    return NextResponse.json(
      {
        error: timedOut
          ? "The backend request timed out. Please try again."
          : "The backend could not be reached. Please try again.",
      },
      { status: timedOut ? 504 : 502 },
    );
  }
}

export const GET = proxyRequest;
export const HEAD = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
export const OPTIONS = proxyRequest;
