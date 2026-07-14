import { readFile, readdir } from "node:fs/promises";
import { join, relative } from "node:path";

const products = {
  practitioner: { root: "acutis.practitioner/acutis.practitioner.web", apiPort: "5010", forbiddenPort: "5020" },
  community: { root: "acutis.community/acutis.community.web", apiPort: "5020", forbiddenPort: "5010" },
};
const product = products[process.argv[2]];
if (!product) throw new Error("Expected product argument: practitioner or community.");
const repository = new URL("../", import.meta.url).pathname.replace(/^\/(.:\/)/, "$1");
const root = join(repository, product.root);
const forbidden = [/from\s+["']next(?:\/|["'])/, /from\s+["']next-auth(?:\/|["'])/, /getServerSession\s*\(/, /(?:cookies|headers)\s*\(/, /["']use server["']/];

async function sourceFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (["node_modules", "dist", ".next"].includes(entry.name)) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await sourceFiles(path));
    else if (/\.(?:ts|tsx|mts|mjs|js|jsx)$/.test(entry.name)) files.push(path);
  }
  return files;
}

const packageJson = JSON.parse(await readFile(join(root, "package.json"), "utf8"));
const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
if (dependencies.next || dependencies["next-auth"]) throw new Error(`${process.argv[2]} must not depend on Next.js or NextAuth.`);
if (!dependencies.vite || !packageJson.scripts?.build?.includes("vite build")) throw new Error(`${process.argv[2]} must retain the Vite browser build.`);
for (const file of await sourceFiles(root)) {
  const source = await readFile(file, "utf8");
  const match = forbidden.find((pattern) => pattern.test(source));
  if (match) throw new Error(`${relative(repository, file)} contains forbidden server-rendering/authentication code (${match}).`);
}
const main = await readFile(join(root, "main.tsx"), "utf8");
const workspace = await readFile(join(root, "app", "workspace.tsx"), "utf8");
if (!main.includes("ProductSpaAuthProvider") || !main.includes("history.pushState")) throw new Error(`${process.argv[2]} must initialise browser Keycloak and use client-side route transitions.`);
if (!workspace.includes(`localhost:${product.apiPort}`) || workspace.includes(`localhost:${product.forbiddenPort}`)) throw new Error(`${process.argv[2]} is not isolated to its product API.`);
console.log(`${process.argv[2]} authenticated workflows are client rendered and API-isolated.`);
