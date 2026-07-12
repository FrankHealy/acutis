import { getServerSession, type Session } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { getFeedbackConfig } from "@/lib/feedbackConfig";

export const runtime = "nodejs";

type FeedbackRequest = {
  type?: string;
  title?: string;
  description?: string;
  contact?: string;
  route?: string;
  timestamp?: string;
  userAgent?: string;
  viewport?: string;
  platform?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  };
  appVersion?: string;
  screenshotDataUrl?: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMaxRequests = 3;
const rateLimits = new Map<string, RateLimitEntry>();

// TODO: add labels when the pilot feedback taxonomy is agreed.
// TODO: add auto-triage once common pilot issue patterns are known.
// TODO: add durable screenshot storage instead of embedding tiny data URLs.
// TODO: add an internal admin dashboard if GitHub issues stop being enough.
// TODO: add telemetry integration if feedback needs product analytics context.

const sanitizeLine = (value: unknown, fallback = "Not provided") => {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.replace(/\s+/g, " ").trim();
  return trimmed || fallback;
};

const trimBlock = (value: unknown, maxLength: number) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, maxLength);
};

const getClientKey = async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  const userKey = session?.username ?? session?.user?.email ?? session?.user?.name;
  if (userKey) {
    return { key: `user:${userKey}`, session };
  }

  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip");
  return { key: `ip:${forwardedFor ?? realIp ?? "unknown"}`, session };
};

const isRateLimited = (key: string) => {
  const now = Date.now();
  const entry = rateLimits.get(key);
  if (!entry || entry.resetAt <= now) {
    rateLimits.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return false;
  }

  if (entry.count >= rateLimitMaxRequests) {
    return true;
  }

  entry.count += 1;
  return false;
};

const buildIssueBody = (payload: FeedbackRequest, session: Session | null) => {
  const submittedUser = payload.user ?? {};
  const userLines = [
    `Session username: ${sanitizeLine(session?.username)}`,
    `Session name: ${sanitizeLine(session?.user?.name)}`,
    `Session email: ${sanitizeLine(session?.user?.email)}`,
    `Submitted username: ${sanitizeLine(submittedUser.username)}`,
    `Submitted name: ${sanitizeLine(submittedUser.name)}`,
    `Submitted email: ${sanitizeLine(submittedUser.email)}`,
    `Contact field: ${sanitizeLine(payload.contact)}`,
  ];

  const screenshotSection =
    typeof payload.screenshotDataUrl === "string" && payload.screenshotDataUrl.length <= 25_000
      ? `\n## Screenshot\n\n<img src="${payload.screenshotDataUrl}" alt="Feedback screenshot" />\n`
      : "\n## Screenshot\n\nNot attached. The browser capture was unavailable or too large.\n";

  return [
    `## Type\n\n${sanitizeLine(payload.type)}`,
    `## Description\n\n${trimBlock(payload.description, 4000)}`,
    "## Context",
    `Route/page: ${sanitizeLine(payload.route)}`,
    `Timestamp: ${sanitizeLine(payload.timestamp)}`,
    `App version/build: ${sanitizeLine(payload.appVersion)}`,
    `Device/browser: ${sanitizeLine(payload.userAgent)}`,
    `Viewport: ${sanitizeLine(payload.viewport)}`,
    `Platform: ${sanitizeLine(payload.platform)}`,
    "## User",
    userLines.join("\n"),
    screenshotSection,
    "<!-- TODO: add labels. -->",
    "<!-- TODO: add auto-triage. -->",
    "<!-- TODO: add durable screenshot storage. -->",
    "<!-- TODO: add an internal admin dashboard. -->",
    "<!-- TODO: add telemetry integration. -->",
  ].join("\n\n");
};

export async function POST(request: NextRequest) {
  const config = getFeedbackConfig();
  if (!config.enabled) {
    return NextResponse.json({ error: "Feedback is disabled." }, { status: 404 });
  }

  if (!config.githubToken) {
    return NextResponse.json({ error: "Feedback is not configured." }, { status: 503 });
  }

  const { key, session } = await getClientKey(request);
  if (isRateLimited(key)) {
    return NextResponse.json({ error: "Too many feedback submissions. Please try again later." }, { status: 429 });
  }

  const payload = (await request.json().catch(() => null)) as FeedbackRequest | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid feedback payload." }, { status: 400 });
  }

  const type = payload.type === "Suggestion" ? "Suggestion" : payload.type === "Bug" ? "Bug" : null;
  const shortTitle = trimBlock(payload.title, 120);
  const description = trimBlock(payload.description, 4000);
  if (!type || !shortTitle || !description) {
    return NextResponse.json({ error: "Type, title, and description are required." }, { status: 400 });
  }

  const githubResponse = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(config.githubOwner)}/${encodeURIComponent(config.githubRepo)}/issues`,
    {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${config.githubToken}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({
        title: `[${type}] ${shortTitle}`,
        body: buildIssueBody({ ...payload, type, title: shortTitle, description }, session),
        // TODO: add labels when the pilot feedback taxonomy is agreed.
      }),
    },
  );

  if (!githubResponse.ok) {
    const body = await githubResponse.text().catch(() => "");
    return NextResponse.json(
      { error: `GitHub issue creation failed: ${githubResponse.status} ${body}` },
      { status: 502 },
    );
  }

  const issue = (await githubResponse.json()) as { html_url?: string; number?: number };
  return NextResponse.json({ issueUrl: issue.html_url, issueNumber: issue.number });
}
