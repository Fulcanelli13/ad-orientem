#!/usr/bin/env node
/**
 * Reversible, semantics-preserving reduction of the production HTML transfer.
 * Extract only large, synchronous classic inline scripts and static styles.
 * Never re-order scripts, add defer/async, or touch module/JSON scripts.
 * Original relative URLs stay correct: extracted assets reside beside index.html.
 *
 * Usage: node tools/split-production-html.mjs [--apply | --verify]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { createHash } from "node:crypto";
import { gzipSync } from "node:zlib";

const inputPath = "index.html";
const html = readFileSync(inputPath, "utf8");
const MIN_JS = 96 * 1024;
const MIN_CSS = 48 * 1024;
const REPORT_PATH = "data/presentation/startup-split-report.v1.json";
const pattern = /<(script|style)\b([^>]*)>([\s\S]*?)<\/\1\s*>/gi;
const size = value => Buffer.byteLength(value, "utf8");
const sha = value => createHash("sha256").update(value).digest("hex").slice(0, 16);
let output = "";
let cursor = 0;
let found = 0;
let moved = 0;
let movedBytes = 0;
const entries = [];
const bins = [];

for (const match of html.matchAll(pattern)) {
  const [full, rawTag, attrs, source] = match;
  const tag = rawTag.toLowerCase();
  const n = size(source);
  const type = (attrs.match(/\btype\s*=\s*(['"])(.*?)\1/i)?.[2] ?? "").trim().toLowerCase();
  const classic = tag === "script" && (!type || /^(?:text|application)\/(?:javascript|ecmascript)$/.test(type));
  const staticCss = tag === "style" && (!type || type === "text/css");
  // An ID is safe to retain on an external script/link when no code refers
  // to that ID elsewhere; dynamic template/data scripts are never extracted.
  const id = attrs.match(/\bid\s*=\s*(['"])(.*?)\1/i)?.[2] ?? null;
  const idIsUnreferenced = !id || html.split(id).length === 2;
  const blockedAttributes = /\b(?:src|async|defer|onload|onerror|integrity)\s*=/i.test(attrs) || !idIsUnreferenced;
  const blockedContents = tag === "script" && /\bdocument\s*\.\s*(?:currentScript|write|writeln)\b|\bimport\s*\.\s*meta\b/.test(source);
  const shouldExtract = !blockedAttributes && !blockedContents &&
    ((classic && n >= MIN_JS) || (staticCss && n >= MIN_CSS));

  if (!shouldExtract) {
    if (n >= (tag === "script" ? MIN_JS : MIN_CSS)) {
      bins.push({ kind: tag, bytes: n, type, reason: blockedAttributes ? "attributes" : blockedContents ? "runtime-relative" : "non-classic" });
    }
    continue;
  }
  found++;
  const extension = tag === "script" ? "js" : "css";
  const filename = "ao-boot-" + sha(tag + "\0" + source) + "." + extension;
  const replacement = tag === "script"
    ? "<script" + attrs + " src=\"./" + filename + "\"></script>"
    : "<link rel=\"stylesheet\"" + attrs + " href=\"./" + filename + "\">";
  if (match.index < cursor) throw new Error("Overlapping HTML tags");
  output += html.slice(cursor, match.index) + replacement;
  cursor = match.index + full.length;
  entries.push({ filename, kind: tag, originalBytes: n, order: found });
  movedBytes += n;
  if (process.argv.includes("--apply")) writeFileSync(filename, source);
  moved++;
}

output += html.slice(cursor);
const initial = size(html);
const final = size(output);
const report = {
  schema: "ao-startup-html-split-v1",
  originalHtmlBytes: initial,
  reducedHtmlBytes: final,
  originalGzipBytes: gzipSync(html).length,
  reducedGzipBytes: gzipSync(output).length,
  extractedBytes: movedBytes,
  extractedCount: moved,
  retainedLargeBlocks: bins.sort((a,b) => b.bytes-a.bytes).slice(0,25),
  entries,
};
console.log(JSON.stringify(report, null, 2));

if (process.argv.includes("--apply")) {
  if (!entries.length) {
    if (existsSync(REPORT_PATH)) { console.log("No further safe inline blocks; preserving prior report"); process.exit(0); }
    throw new Error("No eligible large inline blocks: preserving original HTML");
  }
  if (final >= initial * 0.9) throw new Error("Less than 10% HTML reduction: refusing speculative rewrite");
  writeFileSync(inputPath, output);
  writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + "\n");
}
if (process.argv.includes("--verify")) {
  const prev = JSON.parse(readFileSync(REPORT_PATH, "utf8"));
  for (const entry of prev.entries) {
    if (!existsSync(entry.filename)) throw new Error("Missing startup chunk " + entry.filename);
    if (!html.includes("./" + entry.filename)) throw new Error("HTML lost startup chunk " + entry.filename);
    if (size(readFileSync(entry.filename)) !== (entry.packagedBytes ?? entry.originalBytes)) throw new Error("Changed startup chunk " + entry.filename);
  }
  if (initial > prev.originalHtmlBytes * 0.9) throw new Error("HTML reduction budget regressed");
  console.log("Startup chunk integrity PASS");
}
