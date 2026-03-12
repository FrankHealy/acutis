import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";

const buildUpstreamUrl = (request: NextRequest, path: string[]) => {
  const upstreamBaseUrl = getApiBaseUrl();
  const trimmedBaseUrl = upstreamBaseUrl.endsWith("/")
    ? upstreamBaseUrl.slice(0, -1)
    : upstreamBaseUrl;
  const search = request.nextUrl.search || "";
  return `${trimmedBaseUrl}/${path.join("/")}${search}`;
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
