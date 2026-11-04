import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const vercel=JSON.parse(readFileSync("vercel.json","utf8"));
const workflow=readFileSync(".github/workflows/github-pages.yml","utf8");
const finalize=readFileSync("tools/prepare-github-pages-release.mjs","utf8");
const builder=readFileSync("tools/build-web-preview.mjs","utf8");
const manifest=JSON.parse(readFileSync("Ad-Orientem-v43.19.webmanifest","utf8"));
const sw=readFileSync("sw.js","utf8");
const html=readFileSync("index.html","utf8");

assert.equal(vercel.git?.deploymentEnabled,false,
 "Vercel commits must not trigger auto-deployments on any branch");
assert.match(workflow,/^name:\s+Ad Orientem.*GitHub Pages/m);
assert.match(workflow,/^\s+workflow_dispatch:/m);
assert.match(workflow,/^\s+branches: \[main\]$/m);
assert.match(workflow,/actions\/configure-pages@v5/);
assert.match(workflow,/actions\/upload-pages-artifact@v3/);
assert.match(workflow,/actions\/deploy-pages@v4/);
assert.match(workflow,/^\s+path: dist\/web-preview$/m);
assert.match(workflow,/^\s+pages: write$/m);
assert.match(workflow,/^\s+id-token: write$/m);
assert.match(workflow,/^\s+if: github\.ref == 'refs\/heads\/main'$/m);
assert.ok(!/vercel (deploy|build|pull|promote|--prod)/i.test(workflow),
 "GitHub Pages workflow must never invoke Vercel");
assert.match(builder,/const output=resolve\(root,"dist\/web-preview"\)/);
assert.ok(builder.includes('"data/geography/research"'));
assert.ok(builder.includes('"assets/staged"'));
assert.ok(builder.includes('excludedOfflineOnlyCatenaPaths'));
assert.ok(finalize.includes("1_000_000_000"));
assert.ok(finalize.includes(".nojekyll"));
assert.ok(finalize.includes("404.html"));
assert.ok(finalize.includes('name="robots"'));
assert.ok(finalize.includes('new URL(self.registration.scope)'));
assert.deepEqual([manifest.start_url,manifest.scope,manifest.id],["./","./","./"]);
assert.match(sw,/const BASE=new URL\(self\.registration\.scope\)/);
assert.ok(!/<base\s+[^>]*href=["']\//i.test(html),"no root-absolute base");
assert.ok(!/(?:src|href)=["']\/(?!\/)/i.test(html),"no root-absolute HTML asset path");
console.log("GITHUB PAGES ONLY: Vercel auto-deployment disabled, static Pages-only publication, scope and crawler safeguards intact.");
