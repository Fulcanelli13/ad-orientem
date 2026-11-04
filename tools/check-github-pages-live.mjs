// GitHub Pages post-publication smoke check. GitHub-hosted URL only.
// All checks are against the actual release, not the repository source tree.
import assert from "node:assert/strict";

const raw=process.env.GITHUB_PAGES_URL;
if(!raw)throw Error("GITHUB_PAGES_URL missing: run after actions/deploy-pages");
const base=new URL(raw.endsWith("/")?raw:raw+"/");
if(base.protocol!=="https:"||base.hostname.toLowerCase()!=="fulcanelli13.github.io"||base.pathname!=="/ad-orientem/"){
 throw Error("Unexpected GitHub Pages publication URL: "+base.href);
}
const request=async(relative,expected="text")=>{
 const url=new URL(relative,base);
 if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname))throw Error("URL left Pages project scope "+url.href);
 let finalError;
 // GitHub Pages alias propagation can lag the deploy action briefly.
 for(let i=0;i<6;i++){
  try{
   const response=await fetch(url,{redirect:"follow",signal:AbortSignal.timeout(15000),headers:{"cache-control":"no-cache"}});
   if(response.ok){
    const body=expected==="json"?await response.json():await response.text();
    if(typeof body==="string"&&body.length===0)throw Error("Empty published body "+relative);
    return {response,body};
   }
   finalError=new Error("HTTP "+response.status+" from "+url.href);
  }catch(error){finalError=error;}
  if(i<5)await new Promise(resolve=>setTimeout(resolve,3000));
 }
 throw finalError;
};
const result={url:base.href,checks:[]};
const ok=(name)=>result.checks.push(name);
const index=(await request("index.html")).body;
assert.match(index,/<title>Ad Orientem<\/title>/);
assert.match(index,/<meta name="robots" content="noindex,nofollow,noarchive">/);
assert.match(index,/<link rel="manifest" href="Ad-Orientem-v43\.19\.webmanifest">/);
assert.ok(!/<base\s+[^>]*href=["']\//i.test(index));
ok("HTML entrypoint and crawler policy");

const pwa=(await request("Ad-Orientem-v43.19.webmanifest","json")).body;
assert.deepEqual([pwa.start_url,pwa.scope,pwa.id],["./","./","./"]);
ok("Subpath-relative PWA manifest");

const sw=(await request("sw.js")).body;
assert.ok(sw.includes("new URL(self.registration.scope)"));
ok("Service worker under Pages project scope");

const stylesheet=[...index.matchAll(/(?:href|src)=["']\.\/(ao-(?:inline|boot|packed)-[^"']+\.css)["']/g)][0]?.[1];
const script=[...index.matchAll(/(?:href|src)=["']\.\/(ao-(?:inline|boot|packed)-[^"']+\.js)["']/g)][0]?.[1];
if(!stylesheet||!script)throw Error("Missing content-addressed CSS or JavaScript entrypoint");
await request(stylesheet);await request(script);
ok("Published CSS and JS entrypoints");

const registry=(await request("data/geography/seed-registry.v1.json","json")).body;
const photos=(await request("data/geography/approved-place-media.v1.json","json")).body;
assert.ok(Array.isArray(registry.places)&&registry.places.length>=530);
assert.ok(Array.isArray(photos.items)&&photos.items.length>=379);
const siteIds=new Set(registry.places.map(p=>p.place_id));
assert.equal(siteIds.size,registry.places.length);
assert.ok(photos.items.every(item=>siteIds.has(item.place_id)&&item.status==="APPROVED"));
ok("Canonical Place registry and approved covers");

const hidden=new URL("data/geography/research/sacred-atlas-round25-23place-64-original-review-20261104.json",base);
const hiddenResp=await fetch(hidden,{redirect:"follow",signal:AbortSignal.timeout(15000)});
if(hiddenResp.ok)throw Error("Research file was publicly exposed by Pages: "+hidden.href);
ok("Research files not publicly exposed");

console.log("GITHUB_PAGES_POSTDEPLOY_PASS "+JSON.stringify(result));
