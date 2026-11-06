import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
 RELEASE_PROOF_FILENAME,RELEASE_PROOF_SCHEMA,MASS_SCHOLA_CRITICAL_PATHS,criticalReleasePaths,
 createReleaseProof,releaseCommitSha,releaseRunId,releaseSha256,verifyReleaseProof
} from "../tools/github-pages-release-proof.mjs";

const shaA="a".repeat(40),shaB="b".repeat(40);
const html='<!doctype html><html><head><link href="./ao-inline-a1.css" rel="stylesheet"></head><body><script src="./ao-packed-a2.js"></script></body></html>';
const assets=()=>Object.fromEntries(criticalReleasePaths(html).map(p=>[p,releaseSha256(Buffer.from("critical:"+p))]));
const proof=()=>createReleaseProof({sha:shaA,runId:"1234567",indexHtml:html,assetSha256:assets()});

test("build provenance identifies source commit, run and 26 critical deployed files",()=>{
 const p=proof();
 assert.equal(p.schema,RELEASE_PROOF_SCHEMA);
 assert.equal(p.source_sha,shaA);
 assert.equal(p.workflow_run_id,"1234567");
 assert.equal(MASS_SCHOLA_CRITICAL_PATHS.length,16);
 assert.equal(Object.keys(p.critical_sha256).length,26);
 for(const file of MASS_SCHOLA_CRITICAL_PATHS){
  assert.ok(file.startsWith("src/mass/"));
  assert.ok(Object.hasOwn(p.critical_sha256,file),"Missing live Mass/Schola reader proof: "+file);
 }
 for(const file of ["src/pray/novena-runtime.js","src/pray/prayer-design-pilot.js","src/pray/presentation-runtime.js"]){
  assert.ok(Object.hasOwn(p.critical_sha256,file),"Missing live Pray reader proof: "+file);
 }
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
 const staleNovena={...p,critical_sha256:{...p.critical_sha256}};
 delete staleNovena.critical_sha256["src/pray/novena-runtime.js"];
 assert.throws(()=>verifyReleaseProof(staleNovena,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleMass={...p,critical_sha256:{...p.critical_sha256}};
 delete staleMass.critical_sha256["src/mass/reader-native-preview.js"];
 assert.throws(()=>verifyReleaseProof(staleMass,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleSchola={...p,critical_sha256:{...p.critical_sha256}};
 delete staleSchola.critical_sha256["src/mass/reader-schola.js"];
 assert.throws(()=>verifyReleaseProof(staleSchola,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
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
 assert.match(live,/await released\(path\)/,"The deployed Pray source modules must be fetched and hashed");
 assert.ok(live.includes('"src/pray/novena-runtime.js"'),"The public-site checker must audit novena-runtime.js");
 assert.ok(live.includes('"src/pray/prayer-design-pilot.js"'),"The public-site checker must audit prayer-design-pilot.js");
 assert.ok(live.includes('"src/pray/presentation-runtime.js"'),"The public-site checker must audit presentation-runtime.js");
 assert.match(live,/for\(const path of MASS_SCHOLA_CRITICAL_PATHS\)await released\(path\)/,
  "Every Mass and Schola critical source module must be fetched and checked for exact published bytes");
 assert.match(live,/Direct 65-card Mass, appointed 1962 Proper corrections and Schola exact-byte parity/);
 assert.match(live,/if\(i<5\)await new Promise/);
});

test("all 16 pinned Mass and Schola release witnesses are real, nonempty published-source modules",async()=>{
 const seen=new Set();
 for(const path of MASS_SCHOLA_CRITICAL_PATHS){
  assert.ok(!seen.has(path),"duplicate critical Mass module: "+path);seen.add(path);
  const content=await readFile(new URL("../"+path,import.meta.url));
  assert.ok(content.length>200,"missing or empty source module: "+path);
 }
});
