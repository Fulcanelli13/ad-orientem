import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
 RELEASE_PROOF_FILENAME,RELEASE_PROOF_SCHEMA,criticalReleasePaths,
 createReleaseProof,releaseCommitSha,releaseRunId,releaseSha256,verifyReleaseProof
} from "../tools/github-pages-release-proof.mjs";

const shaA="a".repeat(40),shaB="b".repeat(40);
const html='<!doctype html><html><head><link href="./ao-inline-a1.css" rel="stylesheet"></head><body><script src="./ao-packed-a2.js"></script></body></html>';
const assets=()=>Object.fromEntries(criticalReleasePaths(html).map(p=>[p,releaseSha256(Buffer.from("critical:"+p))]));
const proof=()=>createReleaseProof({sha:shaA,runId:"1234567",indexHtml:html,assetSha256:assets()});

test("build provenance identifies exactly the checked-out commit, run and seven critical files",()=>{
 const p=proof();
 assert.equal(p.schema,RELEASE_PROOF_SCHEMA);
 assert.equal(p.source_sha,shaA);
 assert.equal(p.workflow_run_id,"1234567");
 assert.equal(Object.keys(p.critical_sha256).length,7);
 assert.ok(!Object.hasOwn(p.critical_sha256,RELEASE_PROOF_FILENAME),"The manifest cannot hash itself");
 assert.equal(verifyReleaseProof(p,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),p);
});
test("wrong public commit or workflow run fails closed, even when files are HTTP 200",()=>{
 const p=proof();
 assert.throws(()=>verifyReleaseProof(p,{expectedSha:shaB,expectedRunId:"1234567"}),/source SHA differs/);
 assert.throws(()=>verifyReleaseProof(p,{expectedSha:shaA,expectedRunId:"1234568"}),/different workflow run/);
 assert.throws(()=>verifyReleaseProof({...p,repository:"other/repo"},{expectedSha:shaA}),/Wrong GitHub Pages release repository/);
});
test("missing, malformed or substituted critical bytes do not certify the deployment",()=>{
 const p=proof();
 const missing={...p,critical_sha256:{...p.critical_sha256}};
 delete missing.critical_sha256["sw.js"];
 assert.throws(()=>verifyReleaseProof(missing,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const altered={...p,critical_sha256:{...p.critical_sha256,"index.html":"00"}};
 assert.throws(()=>verifyReleaseProof(altered,{expectedSha:shaA}),/Invalid SHA-256 digest/);
 assert.notEqual(releaseSha256(Buffer.from("tampered:index.html")),p.critical_sha256["index.html"]);
});
test("HTML entrypoint fingerprint must describe the current published bundles",()=>{
 const p=proof();
 const other=html.replace("ao-packed-a2.js","ao-packed-stale.js");
 assert.throws(()=>verifyReleaseProof(p,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:other}),/Missing critical release digest/);
 assert.throws(()=>criticalReleasePaths("<html></html>"),/approved CSS and JavaScript/);
 const malicious={...p,critical_sha256:{...p.critical_sha256,"../docs/private.md":"a".repeat(64)}};
 assert.throws(()=>verifyReleaseProof(malicious,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/precisely the entrypoint/);
});
test("invalid source SHA and workflow run identifiers are rejected",()=>{
 assert.throws(()=>releaseCommitSha("deadbeef"),/40 lowercase hex digits/);
 assert.throws(()=>releaseRunId("123; rm -rf /"),/positive decimal/);
 assert.equal(releaseRunId(null),null);
 const local=createReleaseProof({sha:shaA,runId:null,indexHtml:html,assetSha256:assets()});
 assert.equal(local.workflow_run_id,null);
 assert.equal(verifyReleaseProof(local,{expectedSha:shaA,indexHtml:html}),local);
});
test("release scripts consume the shared proof and audit the actual published bytes",async()=>{
 const prepare=await readFile(new URL("../tools/prepare-github-pages-release.mjs",import.meta.url),"utf8");
 const live=await readFile(new URL("../tools/check-github-pages-live.mjs",import.meta.url),"utf8");
 assert.match(prepare,/execFileSync\("git",\["rev-parse","HEAD"\]/);
 assert.match(prepare,/GITHUB_SHA/);
 assert.match(prepare,/await writeFile\(join\(output,RELEASE_PROOF_FILENAME\)/);
 assert.match(live,/verifyReleaseProof\(/);
 assert.match(live,/expectedSha=releaseCommitSha\(process\.env\.GITHUB_SHA\)/);
 assert.match(live,/expectedDigest=proof\.critical_sha256\[relative\]/);
 assert.match(live,/releaseSha256\(bytes\)/);
 assert.match(live,/if\(i<5\)await new Promise/);
});
