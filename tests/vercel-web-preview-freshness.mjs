import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";

const workerSource=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const bootSource=readFileSync(new URL("../src/app/offline-boot.js",import.meta.url),"utf8");

function simulate(host){
 const listeners={};const events={skipped:0,claimed:0,unregistered:0,intercepted:0,responses:[]};
 const storage={match:async()=>null};
 const sw={
  registration:{scope:"https://"+host+"/",unregister:async()=>{events.unregistered++;return true}},
  clients:{claim:async()=>{events.claimed++},matchAll:async()=>[]},
  skipWaiting:async()=>{events.skipped++},
  addEventListener:(type,fn)=>{listeners[type]=fn}
 };
 vm.runInNewContext(workerSource,{
  self:sw,URL,Request,Response,TextEncoder,
  caches:{open:async()=>storage,has:async()=>false},
  crypto:globalThis.crypto,
  fetch:async()=>new Response("fresh",{status:200})
 },{filename:"sw.js"});
 async function lifecycle(name){
  const promises=[];
  listeners[name]({waitUntil:p=>promises.push(Promise.resolve(p))});
  await Promise.all(promises);
 }
 async function navigate(){
  const promises=[];
  listeners.fetch({request:{method:"GET",mode:"navigate",url:"https://"+host+"/index.html"},
   respondWith:p=>{events.intercepted++;promises.push(Promise.resolve(p))}});
  await Promise.all(promises);
 }
 function message(){
  listeners.message({data:{source:"AO_OFFLINE_V1",type:"CHECK_UPDATE"},
   ports:[{postMessage:data=>events.responses.push(data)}]});
 }
 return {events,lifecycle,navigate,message};
}
const vercel=simulate("ad-orientem-preview.vercel.app");
await vercel.lifecycle("install");
await vercel.lifecycle("activate");
await vercel.navigate();
vercel.message();
assert.equal(vercel.events.skipped,1,"Vercel must activate a replacement worker promptly");
assert.equal(vercel.events.claimed,1);
assert.equal(vercel.events.unregistered,1,"Vercel must retire an older offline registration");
assert.equal(vercel.events.intercepted,0,"Vercel navigation must bypass stale snapshots");
assert.equal(vercel.events.responses[0].error,"VERCEL_PREVIEW_NETWORK_ONLY");

const pages=simulate("fulcanelli13.github.io");
await pages.lifecycle("install");
await pages.lifecycle("activate");
await pages.navigate();
assert.equal(pages.events.skipped,1,"GitHub Pages replacement worker must activate while app window remains open");
assert.equal(pages.events.unregistered,0,"Do not disable normal offline support");
assert.equal(pages.events.intercepted,1,"Offline service worker must continue intercepting on Pages");

assert.match(bootSource,/const VERCEL_WEB_PREVIEW=\/\\.vercel\\.app\$\/i/);
assert.match(bootSource,/const eligible=!VERCEL_WEB_PREVIEW&&/);
console.log("PASS Vercel network-first freshness and retirement; offline hosts retained");
