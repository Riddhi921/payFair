#!/usr/bin/env node
/**
 * Assembles the static deployable site into /dist:
 *
 *   dist/index.html              -- landing page
 *   dist/demo/**                 -- the built React app (web/dist, base=/demo/)
 *   dist/research/index.html     -- the research brief
 *   dist/.nojekyll                -- GitHub Pages: don't run Jekyll over this
 *
 * Assumes `engine` and `web` have already been built (see package.json's
 * "build:site" script, which runs both first). No server code is included --
 * this is a pure static bundle with no server dependency.
 */
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST = path.join(ROOT, "dist");

function copyDir(src, dest) {
  if (!existsSync(src)) {
    throw new Error(`missing build input: ${src} (did the web build run first?)`);
  }
  mkdirSync(dest, { recursive: true });
  cpSync(src, dest, { recursive: true });
}

console.log("[build-site] cleaning dist/");
rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });

console.log("[build-site] copying landing page");
cpSync(path.join(ROOT, "index.html"), path.join(DIST, "index.html"));

console.log("[build-site] copying demo (web/dist -> dist/demo)");
copyDir(path.join(ROOT, "web", "dist"), path.join(DIST, "demo"));

console.log("[build-site] copying research brief");
mkdirSync(path.join(DIST, "research"), { recursive: true });
cpSync(
  path.join(ROOT, "research", "payment-terms-research.html"),
  path.join(DIST, "research", "index.html")
);

console.log("[build-site] writing .nojekyll (GitHub Pages)");
writeFileSync(path.join(DIST, ".nojekyll"), "");

console.log(`[build-site] done -> ${path.relative(ROOT, DIST)}/`);
