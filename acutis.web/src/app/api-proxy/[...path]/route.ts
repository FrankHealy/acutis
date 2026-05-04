import { NextRequest, NextResponse } from "next/server";

const getProxyUpstreamBaseUrl = (): string => {
  const upstreamBaseUrl = process.env.INTERNAL_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!upstreamBaseUrl) {
    throw new Error("API base URL is not configured for proxy requests.");
  }

  return upstreamBaseUrl.replace(/\/$/, "");
};

const buildUpstreamUrl = (request: NextRequest, path: string[]) => {
  const search = request.nextUrl.search || "";
  return `${getProxyUpstreamBaseUrl()}/${path.join("/")}${search}`;
};

const buildUpstreamHeaders = (request: NextRequest) => {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const normalized = key.toLowerCase();
    if (normalized === "host" || normalized === "content-length") {
      return;
    }

    headers.set(key, value);
  });

  return headers;
};

const proxyRequest = async (request: NextRequest, path: string[]) => {
  const upstreamResponse = await fetch(buildUpstreamUrl(request, path), {
    method: request.method,
    headers: buildUpstreamHeaders(request),
    body: request.method === "GET" || request.method === "HEAD"
      ? undefined
      : await request.text(),
    cache: "no-store",
  });

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers: upstreamResponse.headers,
  });
};

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}
