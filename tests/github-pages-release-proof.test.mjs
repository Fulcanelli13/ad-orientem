import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {
 RELEASE_PROOF_FILENAME,RELEASE_PROOF_SCHEMA,MASS_SCHOLA_CRITICAL_PATHS,NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS,DISCOVERY_CRITICAL_PATHS,SAN_POLO_CYCLE_CRITICAL_PATHS,criticalReleasePaths,
 createReleaseProof,releaseCommitSha,releaseRunId,releaseSha256,verifyReleaseProof
} from "../tools/github-pages-release-proof.mjs";

const shaA="a".repeat(40),shaB="b".repeat(40);
const html='<!doctype html><html><head><link href="./ao-inline-a1.css" rel="stylesheet"></head><body><script src="./ao-packed-a2.js"></script></body></html>';
const assets=()=>Object.fromEntries(criticalReleasePaths(html).map(p=>[p,releaseSha256(Buffer.from("critical:"+p))]));
const proof=()=>createReleaseProof({sha:shaA,runId:"1234567",indexHtml:html,assetSha256:assets()});

test("build provenance includes fourteen San Polo photographs, attribution and all older critical deployed files",()=>{
 const p=proof();
 assert.equal(p.schema,RELEASE_PROOF_SCHEMA);
 assert.equal(p.source_sha,shaA);
 assert.equal(p.workflow_run_id,"1234567");
 assert.equal(MASS_SCHOLA_CRITICAL_PATHS.length,18);
 assert.equal(SAN_POLO_CYCLE_CRITICAL_PATHS.length,17);
 assert.equal(Object.keys(p.critical_sha256).length,54+SAN_POLO_CYCLE_CRITICAL_PATHS.length);
 for(const path of SAN_POLO_CYCLE_CRITICAL_PATHS)
  assert.ok(Object.hasOwn(p.critical_sha256,path),"Missing optional San Polo exact release proof: "+path);
 for(const file of MASS_SCHOLA_CRITICAL_PATHS){
  assert.ok(file.startsWith("src/mass/"));
  assert.ok(Object.hasOwn(p.critical_sha256,file),"Missing live Mass/Schola reader proof: "+file);
 }
 for(const file of ["src/pray/novena-runtime.js","src/pray/holy-face-janvier-1887-b25.js","src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js","src/pray/prayer-design-pilot.js","src/pray/presentation-runtime.js","src/pray/mass-sequences-from-proper.v1.js","src/mass/1962-all-souls-sequence-english.js"]){
  assert.ok(Object.hasOwn(p.critical_sha256,file),"Missing live Pray reader proof: "+file);
 }
 assert.equal(DISCOVERY_CRITICAL_PATHS.length,15);
 for(const path of DISCOVERY_CRITICAL_PATHS)assert.ok(Object.hasOwn(p.critical_sha256,path),"Missing Discovery proof: "+path);
 assert.equal(NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS.length,9);
 for(const file of NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS)
   assert.ok(Object.hasOwn(p.critical_sha256,file),"Missing deployed ICRSP/Leonine source proof: "+file);
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
 const staleCueFocus={...p,critical_sha256:{...p.critical_sha256}};
 delete staleCueFocus.critical_sha256["src/mass/reader-cue-focus.js"];
 assert.throws(()=>verifyReleaseProof(staleCueFocus,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleSacredHeart={...p,critical_sha256:{...p.critical_sha256}};
 delete staleSacredHeart.critical_sha256["src/mass/icrsp-first-friday-entry.js"];
 assert.throws(()=>verifyReleaseProof(staleSacredHeart,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleOrdoGate={...p,critical_sha256:{...p.critical_sha256}};
 delete staleOrdoGate.critical_sha256["src/mass/ordo-mass-completeness.js"];
 assert.throws(()=>verifyReleaseProof(staleOrdoGate,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleProPapa={...p,critical_sha256:{...p.critical_sha256}};
 delete staleProPapa.critical_sha256["src/mass/icrsp-nov06-pro-papa-orations.js"];
 assert.throws(()=>verifyReleaseProof(staleProPapa,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleLeonine={...p,critical_sha256:{...p.critical_sha256}};
 delete staleLeonine.critical_sha256["src/pray/horarium-leonine-source-blocks.js"];
 assert.throws(()=>verifyReleaseProof(staleLeonine,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleDiscovery={...p,critical_sha256:{...p.critical_sha256}};
 delete staleDiscovery.critical_sha256['data/did-you-know/dyk-h225-world-liturgies-25-publication.v1.json'];
 assert.throws(()=>verifyReleaseProof(staleDiscovery,{expectedSha:shaA,expectedRunId:'1234567',indexHtml:html}),/Missing critical release digest/);
 const staleDyk520={...p,critical_sha256:{...p.critical_sha256}};
 delete staleDyk520.critical_sha256["data/did-you-know/dyk-customs-glossary-520.v1.json"];
 assert.throws(()=>verifyReleaseProof(staleDyk520,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
 const staleDyk520Loader={...p,critical_sha256:{...p.critical_sha256}};
 delete staleDyk520Loader.critical_sha256["src/home/dyk-520-release.js"];
 assert.throws(()=>verifyReleaseProof(staleDyk520Loader,{expectedSha:shaA,expectedRunId:"1234567",indexHtml:html}),/Missing critical release digest/);
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
 assert.match(live,/for\(const path of NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS\)await released\(path\)/,
   "Source-specific Sacred Heart and Leonine modules must be fetched from public Pages");
 assert.match(live,/ICRSP Sacred Heart III-class Low Mass, Gloria, Pro Papa threefold orations and five Leonine prayers exact-byte parity/);
 assert.match(live,/if\(i<5\)await new Promise/);
});

test("public phone boot timeout retains first-attempt diagnostics without weakening the 65-second gate",async()=>{
 const smoke=await readFile(new URL("./github-pages-phone-live-acceptance.mjs",import.meta.url),"utf8");
 assert.match(smoke,/PAGES_PHONE_BOOT_DIAGNOSTICS/);
 assert.ok(smoke.includes("startup-diagnostics.json"));
 assert.ok(smoke.includes("startup-failure-390.png"));
 assert.match(smoke,/requestfailed/);
 assert.match(smoke,/pageerror/);
 assert.match(smoke,/criticalResources/);
 assert.match(smoke,/swController/);
 assert.match(smoke,/AO_APP_SHELL_V1/);
 assert.match(smoke,/AO_R17_BROWSER_ENTRY/);
 assert.match(smoke,/timeout:65000/);
 assert.ok(smoke.includes("addFailure(label,e)"),
  "The first-attempt timeout must still fail the release job");
});

test("all 18 pinned Mass and Schola release witnesses are real, nonempty published-source modules",async()=>{
 const seen=new Set();
 for(const path of MASS_SCHOLA_CRITICAL_PATHS){
  assert.ok(!seen.has(path),"duplicate critical Mass module: "+path);seen.add(path);
  const content=await readFile(new URL("../"+path,import.meta.url));
  assert.ok(content.length>200,"missing or empty source module: "+path);
 }
});

test("all eight date-scoped Sacred Heart, Home and Leonine proof sources exist and remain nonempty",async()=>{
 const seen=new Set(MASS_SCHOLA_CRITICAL_PATHS);
 for(const path of NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS){
  assert.ok(!seen.has(path),"duplicate in Pages release manifest: "+path);
  seen.add(path);
  const content=await readFile(new URL("../"+path,import.meta.url));
  assert.ok(content.length>500,"missing/empty published-source module: "+path);
 }
});
