import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const vercel=JSON.parse(readFileSync("vercel.json","utf8"));
const workflow=readFileSync(".github/workflows/github-pages.yml","utf8");
const finalize=readFileSync("tools/prepare-github-pages-release.mjs","utf8");
const publicSmoke=readFileSync("tools/check-github-pages-live.mjs","utf8");
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
assert.ok(workflow.includes("group: ad-orientem-github-pages-${{ github.event_name == 'pull_request' && github.event.pull_request.number || 'main' }}"),
  "Pages production concurrency group must be separate from PR preflight");
assert.ok(workflow.includes("cancel-in-progress: ${{ github.event_name == 'pull_request' }}"),
  "A new PR or main push must not cancel a running Pages production release");
assert.match(workflow,/run: node tools\/check-github-pages-live\.mjs/);
assert.match(workflow,/GITHUB_PAGES_URL:\s*\$\{\{ steps\.pages\.outputs\.page_url \}\}/);
assert.match(workflow,/node --check tools\/check-github-pages-live\.mjs/);
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
assert.ok(publicSmoke.includes("GITHUB_PAGES_POSTDEPLOY_PASS"));
assert.ok(publicSmoke.includes("data/geography/seed-registry.v1.json"));
assert.ok(publicSmoke.includes("data/geography/approved-place-media.v1.json"));
assert.ok(publicSmoke.includes("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json"));
assert.ok(publicSmoke.includes("Ad-Orientem-v43.19.webmanifest"));
assert.ok(publicSmoke.includes("sw.js"));
assert.ok(!/<base\s+[^>]*href=["']\//i.test(html),"no root-absolute base");
assert.ok(!/(?:src|href)=["']\/(?!\/)/i.test(html),"no root-absolute HTML asset path");
console.log("GITHUB PAGES ONLY: Vercel auto-deployment disabled, static Pages-only publication, scope and crawler safeguards intact.");
