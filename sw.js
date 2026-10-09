/* Ad Orientem: versioned, transactional offline bootstrap snapshots.
 * No Scripture-packs or user data are owned, deleted or cached by this worker.
 * Scope is strictly the containing GitHub Pages project path.
 */
"use strict";
const PREFIX="ao-bootstrap-snapshot-v1-";
const STAGE="ao-bootstrap-staging-v1";
const META="ao-bootstrap-meta-v1";
const BASE=new URL(self.registration.scope);
const ROOT=new URL("index.html",BASE).href;
const KEY=new URL("__ao_bootstrap_state__",BASE).href;
const READY=new URL("__ao_bootstrap_completed__",BASE).href;
const MAX_ITEMS=320,MAX_BYTES=35_000_000;
let stagedJob=null,activeVersion=null;
const liveClients=new Map();

const scoped=url=>{
 try{const u=new URL(url,BASE);return u.origin===BASE.origin&&u.pathname.startsWith(BASE.pathname)&&!u.search&&!u.hash?u.href:null}
 catch{return null}
};
const keyFor=url=>new Request(url,{credentials:"same-origin"});
const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(n=>n.toString(16).padStart(2,"0")).join("");
const utf8=s=>new TextEncoder().encode(s);
const fail=(reason)=>{throw Error("OFFLINE_SNAPSHOT_"+reason)};
async function readState(){
 const c=await caches.open(META),r=await c.match(KEY);
 if(!r)return {active:null,completed:[]};
 try{
  const s=await r.json();
  return {active:typeof s.active==="string"?s.active:null,completed:Array.isArray(s.completed)?s.completed.filter(x=>typeof x==="string"):[]};
 }catch{return {active:null,completed:[]}}
}
async function saveState(s){
 const c=await caches.open(META);
 await c.put(KEY,new Response(JSON.stringify(s),{headers:{"content-type":"application/json"}}));
 activeVersion=s.active;
}
const cacheName=v=>PREFIX+v;
async function validVersion(v){
 if(!v||!await caches.has(cacheName(v)))return false;
 const c=await caches.open(cacheName(v));
 return Boolean(await c.match(ROOT))&&Boolean(await c.match(READY));
}
async function pinnedVersion(event){
 const id=event?.clientId||event?.resultingClientId;
 if(id&&liveClients.has(id))return liveClients.get(id);
 const s=await readState();
 const v=await validVersion(s.active)?s.active:null;
 if(id&&v)liveClients.set(id,v);
 return v;
}
const listOf=async()=>({...(await readState())});
const urlsInHtml=text=>{
 const urls=[];
 for(const m of text.matchAll(/<(?:script|link)\b[^>]*?(?:\bsrc|\bhref)\s*=\s*["']([^"']+)["'][^>]*>/gi)){
  const url=scoped(new URL(m[1],BASE).href);
  if(url&&/\.(?:js|mjs|css|json|svg|png|webp|jpe?g|woff2?|webmanifest)$/.test(new URL(url).pathname))urls.push(url);
 }
 return urls;
};
const staticDeps=(text,url)=>{
 const result=[];
 if(/\.m?js$/.test(new URL(url).pathname)){
  // Static ESM graph only; deliberately omit first-use dynamic imports.
  const rx=/\b(?:import|export)\s+(?:(?:[^;]{0,500}?)\s+from\s+)?["'](\.{1,2}\/[^"']+)["']/g;
  for(const m of text.matchAll(rx)){try{const u=scoped(new URL(m[1],url).href);if(u)result.push(u)}catch{}}
 }else if(/\.css$/.test(new URL(url).pathname)){
  for(const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)){
   try{const u=scoped(new URL(m[1],url).href);if(u)result.push(u)}catch{}
  }
 }
 return result;
};
async function broadcast(type,detail={}){
 const clients=await self.clients.matchAll({type:"window",includeUncontrolled:true});
 for(const client of clients)client.postMessage({source:"AO_OFFLINE_V1",type,...detail});
}
const safeFetch=async url=>{
 const request=new Request(url,{cache:"no-store",credentials:"same-origin"});
 const response=await fetch(request);
 if(!response.ok||response.type==="opaque")fail("FETCH_"+response.status+"_"+new URL(url).pathname);
 return response;
};
async function stageSnapshot(){
 if(stagedJob)return stagedJob;
 stagedJob=(async()=>{
  await caches.delete(STAGE);
  const staging=await caches.open(STAGE);
  const source=await safeFetch(ROOT),html=await source.clone().text();
  if(!html.includes("src/mass/browser-entry.js")||!html.includes("src/app/browser-entry.js"))fail("UNRECOGNISED_HTML");
  const initialHash=await hash(utf8(html));
  const queue=[ROOT,...urlsInHtml(html)];
  const processed=new Set(),digests=[];
  let bytes=0;
  try{
   // Limit concurrency while avoiding one network+CacheStorage round-trip
   // per resource. Individual responses are still verified before commit.
   while(queue.length){
    if(processed.size+queue.length>MAX_ITEMS)fail("ITEM_LIMIT");
    const batch=[];
    while(batch.length<8&&queue.length){
      const url=queue.shift();
      if(processed.has(url))continue;
      processed.add(url);
      batch.push(url);
    }
    const entries=await Promise.all(batch.map(async url=>{
      const response=url===ROOT?source.clone():await safeFetch(url);
      const body=await response.clone().arrayBuffer();
      await staging.put(keyFor(url),response);
      const digest=await hash(body);
      const path=new URL(url).pathname;
      const deps=(path.endsWith(".js")||path.endsWith(".mjs")||path.endsWith(".css"))?
        staticDeps(new TextDecoder().decode(body),url):[];
      return {url,size:body.byteLength,digest,deps};
    }));
    for(const entry of entries){
      bytes+=entry.size;
      if(bytes>MAX_BYTES)fail("BYTE_LIMIT");
      digests.push([entry.url,entry.digest]);
      for(const dep of entry.deps)if(!processed.has(dep)&&!queue.includes(dep))queue.push(dep);
    }
   }
   // Reject deployments that change the entry HTML while its graph is
   // fetched. A failed stage never replaces a previously usable snapshot.
   const finalHtml=await (await safeFetch(ROOT)).text();
   if(await hash(utf8(finalHtml))!==initialHash)fail("ROLLING_DEPLOYMENT");
   const manifest=digests.sort((a,b)=>a[0].localeCompare(b[0])).map(([u,h])=>u+"\t"+h).join("\n");
   const version=(await hash(utf8(manifest))).slice(0,24);
   const existing=await readState();
   if(!await validVersion(version)){
    const final=await caches.open(cacheName(version));
    try{
     for(const [url] of digests){
      const r=await staging.match(keyFor(url));
      if(!r)fail("MISSING_STAGE_ITEM");
      await final.put(keyFor(url),r);
     }
     if(!await final.match(ROOT))fail("MISSING_ENTRY");
     await final.put(READY,new Response(JSON.stringify({version,files:processed.size,bytes}),{headers:{"content-type":"application/json"}}));
    }catch(e){await caches.delete(cacheName(version));throw e}
   }
   const oldActive=await validVersion(existing.active)?existing.active:null;
   const next={active:oldActive||version,completed:[version,...existing.completed.filter(x=>x!==version)].slice(0,4)};
   await saveState(next);
   await caches.delete(STAGE);
   await broadcast(existing.active&&existing.active!==version?"UPDATE_READY":"OFFLINE_READY",{version,active:next.active,files:processed.size,bytes});
   return {ok:true,version,active:next.active,updateAvailable:existing.active&&existing.active!==version,files:processed.size,bytes};
  }catch(error){
   await caches.delete(STAGE);
   await broadcast("SNAPSHOT_FAILED",{message:String(error?.message||error)});
   return {ok:false,error:String(error?.message||error)};
  }
 })().finally(()=>{stagedJob=null});
 return stagedJob;
}
async function useSnapshot(version,clientId=null){
 const state=await readState();
 if(!state.completed.includes(version)||!await validVersion(version))return {ok:false,error:"UNVERIFIED_VERSION"};
 await saveState({...state,active:version});
 if(clientId)liveClients.set(clientId,version);
 // Existing tab clients stay pinned to their previous snapshot until they
 // themselves navigate/reload. Do not force reload of a live Mass session.
 await broadcast("ACTIVE_VERSION",{version});
 return {ok:true,version};
}
self.addEventListener("install",event=>event.waitUntil(Promise.resolve()));
self.addEventListener("activate",event=>{
 event.waitUntil((async()=>{await self.clients.claim();activeVersion=(await readState()).active})());
});
self.addEventListener("message",event=>{
 const m=event.data;
 if(m?.source!=="AO_OFFLINE_V1")return;
 const respond=body=>{try{event.ports?.[0]?.postMessage(body)}catch{}};
 if(m.type==="CHECK_UPDATE")event.waitUntil(
   stageSnapshot().catch(error=>({ok:false,error:String(error?.message||error)})).then(respond)
 );
 else if(m.type==="STATUS")event.waitUntil(readState().then(s=>respond({ok:true,...s})));
 else if(m.type==="USE_SNAPSHOT")event.waitUntil(useSnapshot(m.version,event.source?.id).then(respond));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const u=new URL(request.url);
 if(u.origin!==BASE.origin||!u.pathname.startsWith(BASE.pathname))return;
 // Never intercept APIs, unrelated origins, private synthetic Scripture pack
 // CacheStorage keys or unscoped data. Asset requests may contain a query
 // (e.g. a current-day JSON fetch): let them pass through unmodified.
 const navigation=request.mode==="navigate";
 if((u.search&&!navigation)||u.pathname.includes("__ao_scripture_cache__"))return;
 event.respondWith((async()=>{
  const id=event.resultingClientId||event.clientId;
  const version=await pinnedVersion(event);
  const cache=version?await caches.open(cacheName(version)):null;
  const url=navigation?ROOT:request.url;
  const cached=await cache?.match(keyFor(url));
  if(cached){
   if(navigation&&id)liveClients.set(id,version);
   return cached;
  }
  try{
   const fresh=await fetch(request);
   if(fresh.ok&&cache&&!navigation&&fresh.type!=="opaque"){
    // Previously visited noncritical routes become usable offline for this
    // version; do not mutate the certified core snapshot on staging errors.
    try{await cache.put(keyFor(url),fresh.clone())}catch{}
   }
   return fresh;
  }catch(error){
   if(navigation){
    const fallback=await cache?.match(ROOT);
    if(fallback)return fallback;
    return new Response("Ad Orientem requires one successful online visit before offline startup.",{status:503,headers:{"content-type":"text/plain; charset=utf-8"}});
   }
   return new Response("Offline resource unavailable in this saved version.",{status:503,headers:{"content-type":"text/plain; charset=utf-8"}});
  }
 })());
});
