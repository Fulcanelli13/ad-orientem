// GitHub Pages post-publication smoke check. GitHub-hosted URL only.
// Compare LIVE critical asset bytes and build provenance against this exact run.
import assert from "node:assert/strict";
import {
 RELEASE_PROOF_FILENAME,releaseCommitSha,releaseSha256,verifyReleaseProof
} from "./github-pages-release-proof.mjs";

const raw=process.env.GITHUB_PAGES_URL;
if(!raw)throw Error("GITHUB_PAGES_URL missing: run after actions/deploy-pages");
const expectedSha=releaseCommitSha(process.env.GITHUB_SHA);
const expectedRunId=process.env.GITHUB_RUN_ID||null;
const base=new URL(raw.endsWith("/")?raw:raw+"/");
if(base.protocol!=="https:"||base.hostname.toLowerCase()!=="fulcanelli13.github.io"||base.pathname!=="/ad-orientem/"){
 throw Error("Unexpected GitHub Pages publication URL: "+base.href);
}
const request=async(relative,validate)=>{
 const url=new URL(relative,base);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))throw Error("URL left Pages project scope "+url.href);
 let finalError;
 // A deployment can briefly serve an earlier artifact from the Pages CDN.
 // Verify the actual content on every attempt; a stale 200 is NOT success.
 for(let i=0;i<6;i++){
  const attempt=new URL(url);
  attempt.searchParams.set("ao_release_verify",(expectedRunId||expectedSha.slice(0,12))+"-"+i);
  try{
   const response=await fetch(attempt,{redirect:"follow",signal:AbortSignal.timeout(15000),cache:"no-store",headers:{"cache-control":"no-cache"}});
   const final=new URL(response.url);
   if(final.origin!==base.origin||!final.pathname.startsWith(base.pathname))throw Error("Published asset redirected out of project scope: "+response.url);
   if(response.ok){
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length===0)throw Error("Empty published body "+relative);
    if(validate)validate(bytes);
    return {response,bytes};
   }
   finalError=new Error("HTTP "+response.status+" from "+attempt.href);
  }catch(error){finalError=error;}
  if(i<5)await new Promise(resolve=>setTimeout(resolve,3000));
 }
 throw finalError;
};
const result={url:base.href,source_sha:expectedSha,workflow_run_id:expectedRunId,checks:[]};
const ok=name=>result.checks.push(name);

// The release proof is generated AFTER building the allowlisted static artifact.
// A successful HTTP 200 is insufficient: it must match this exact CI run.
const proofBytes=(await request(RELEASE_PROOF_FILENAME,bytes=>{
 verifyReleaseProof(JSON.parse(bytes.toString("utf8")),{expectedSha,expectedRunId});
})).bytes;
const proof=JSON.parse(proofBytes.toString("utf8"));
const released=async(relative)=>{
 const expectedDigest=proof.critical_sha256[relative];
 if(!expectedDigest)throw Error("Asset omitted from published release proof: "+relative);
 return (await request(relative,bytes=>{
  assert.equal(releaseSha256(bytes),expectedDigest,"Published asset bytes differ from release proof: "+relative);
 })).bytes;
};
const index=(await released("index.html")).toString("utf8");
verifyReleaseProof(proof,{expectedSha,expectedRunId,indexHtml:index});
ok("Exact deployed source SHA, workflow run and critical asset digest map");

assert.match(index,/<title>Ad Orientem<\/title>/);
assert.match(index,/<meta name="robots" content="noindex,nofollow,noarchive">/);
assert.match(index,/<link rel="manifest" href="Ad-Orientem-v43\.19\.webmanifest">/);
assert.ok(!/<base\s+[^>]*href=["']\//i.test(index));
ok("HTML entrypoint and crawler policy");

const pwa=JSON.parse((await released("Ad-Orientem-v43.19.webmanifest")).toString("utf8"));
assert.deepEqual([pwa.start_url,pwa.scope,pwa.id],["./","./","./"]);
ok("Subpath-relative PWA manifest");

const sw=(await released("sw.js")).toString("utf8");
assert.ok(sw.includes("new URL(self.registration.scope)"));
ok("Service worker under Pages project scope");

const stylesheet=[...index.matchAll(/(?:href|src)=["']\.\/(ao-(?:inline|boot|packed)-[^"']+\.css)["']/g)][0]?.[1];
const script=[...index.matchAll(/(?:href|src)=["']\.\/(ao-(?:inline|boot|packed)-[^"']+\.js)["']/g)][0]?.[1];
if(!stylesheet||!script)throw Error("Missing content-addressed CSS or JavaScript entrypoint");
await released(stylesheet);await released(script);
ok("Published CSS and JS exact-byte digests");

// A correct HTML shell can still be paired with stale, CDN-cached reader
// modules. Verify the precise source-owned Pray code released with this SHA.
for(const path of [
 "src/pray/novena-runtime.js",
 "src/pray/prayer-design-pilot.js",
 "src/pray/presentation-runtime.js",
])await released(path);
ok("Novena reader, bilingual Pray search and Prayer router exact-byte parity");

const registry=JSON.parse((await released("data/geography/seed-registry.v1.json")).toString("utf8"));
const photos=JSON.parse((await released("data/geography/approved-place-media.v1.json")).toString("utf8"));
assert.ok(Array.isArray(registry.places)&&registry.places.length>=530);
assert.ok(Array.isArray(photos.items)&&photos.items.length>=379);
const siteIds=new Set(registry.places.map(p=>p.place_id));
assert.equal(siteIds.size,registry.places.length);
assert.ok(photos.items.every(item=>siteIds.has(item.place_id)&&item.status==="APPROVED"));
ok("Exact-byte Place registry and approved covers");

const hidden=new URL("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json",base);
const hiddenResp=await fetch(hidden,{redirect:"follow",signal:AbortSignal.timeout(15000)});
if(hiddenResp.ok)throw Error("Research file was publicly exposed by Pages: "+hidden.href);
ok("Research files not publicly exposed");

// Unreleased San Polo source photography is intentionally held in Git only.
// A hidden reader binding is not enough if the static builder leaks raw files.
for(const relative of [
 "assets/stations/san-polo/station-01.webp",
 "assets/stations/san-polo/station-14.webp",
 "data/prayer/stations/san-polo-tiepolo-oils-1747/manifest.v1.json",
]){
 const withheld=new URL(relative,base);
 withheld.searchParams.set("ao_release_verify",expectedRunId||expectedSha.slice(0,12));
 const response=await fetch(withheld,{
  redirect:"follow",signal:AbortSignal.timeout(15000),cache:"no-store",headers:{"cache-control":"no-cache"}
 });
 if(response.ok)throw Error("Unreleased San Polo photograph or research archive exposed by Pages: "+withheld.href);
}
ok("Unreleased San Polo Stations assets and research archive absent from live Pages");

console.log("GITHUB_PAGES_POSTDEPLOY_PASS "+JSON.stringify(result));
