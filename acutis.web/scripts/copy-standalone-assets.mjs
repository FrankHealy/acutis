import { cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";

const standalone = ".next/standalone";
if (existsSync(standalone)) {
  await rm(`${standalone}/.next/static`, { recursive: true, force: true });
  await rm(`${standalone}/public`, { recursive: true, force: true });
  await mkdir(`${standalone}/.next`, { recursive: true });
  await cp(".next/static", `${standalone}/.next/static`, { recursive: true });
  await cp("public", `${standalone}/public`, { recursive: true });
}
