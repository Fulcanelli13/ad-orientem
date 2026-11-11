// Curated static GitHub Pages includes exact All Saints JPEG and no source proof records.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
const root=new URL("..",import.meta.url);
const asset="assets/home/class-i-2026/saraceni-paradise-met-1971-93-original.jpg";
const proof="data/artwork/releases/2026-11-01-saraceni-met-cc0-byte-proof.v1.json";
const source=readFileSync(new URL(asset,root));
const deployed=readFileSync(new URL("dist/web-preview/"+asset,root));
const sha=b=>createHash("sha256").update(b).digest("hex");
assert.equal(source.length,2879956);
assert.equal(sha(source),"0d2f44968a83af250b13382b29585e18fcde78c5b36261e348f3498cefacd40c");
assert.equal(sha(deployed),sha(source));
assert.equal(deployed.length,source.length);
assert.equal(existsSync(new URL("dist/web-preview/"+proof,root)),false);
assert.equal(existsSync(new URL("dist/web-preview/.github/workflows/tmp-saraceni-met-photo-acquire-20261111.yml",root)),false);
console.log("PASS curated Pages includes byte-identical 2.88 MB Saraceni Met CC0 source and excludes research proof");
