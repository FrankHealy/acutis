import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const standalone = ".next/standalone";
const appStandalone = `${standalone}/acutis.centre/acutis.centre.web`;
if (existsSync(standalone)) {
  await rm(`${appStandalone}/.next/static`, { recursive: true, force: true });
  await rm(`${appStandalone}/public`, { recursive: true, force: true });
  await mkdir(`${appStandalone}/.next`, { recursive: true });
  await cp(".next/static", `${appStandalone}/.next/static`, { recursive: true });
  await cp("public", `${appStandalone}/public`, { recursive: true });
}
