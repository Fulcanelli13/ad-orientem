import assert from "node:assert/strict";
import http from "node:http";
import {readFile,readFileSync} from "node:fs";
import {promisify} from "node:util";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";

const read=promisify(readFile);
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
  const bytes=await read(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
const canonical=JSON.parse(readFileSync(resolve(root,"data/app/content-reachability-audit.v1.json"),"utf8"))
 .routes.filter(x=>x.kind==="PRAY_FAMILY_ITEM").map(x=>x.id);
assert.equal(canonical.length,23,"Canonical Prayer route count changed; reconcile source audit before accepting new UI");
assert.equal(new Set(canonical).size,23,"Duplicated canonical Prayer route");
await new Promise((resolvePromise,reject)=>{server.once("error",reject);server.listen(4282,"127.0.0.1",resolvePromise);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"fr-FR",serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e?.message??e)));
 await page.goto("http://127.0.0.1:4282/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:15000});

 const hub=async()=>{
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null})),true);
   await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView==="home");
 };
 const openFamilyDoor=async family=>{
   if(family!=="daily")await page.locator("#aoPray435930 .aoP435930QuietMore>summary").click();
   const launcher=page.locator('#aoPray435930.open [data-p435930-family="'+family+'"]');
   await launcher.evaluate(el=>el.scrollIntoView({block:"center",inline:"nearest",behavior:"instant"}));
   await launcher.tap();
 };
 const identify=async()=>page.evaluate(()=>{
   if(document.querySelector("#aoPrayerBookRoot.open .pbShell"))
     return {owner:"rosary",body:"canonical bead player",visible:true};
   const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
   if(!mount)return {owner:null,visible:false};
   const own=mount.dataset.aoPrayView||null;
   return {owner:own==="traditional-pray"?"traditional:"+mount.dataset.aoTraditionalPrayRoute:own,
    visible:true,
    body:(mount.querySelector(".aoP435930Body")?.innerText||mount.innerText||"").trim().slice(0,150),
    alternate:mount.querySelectorAll("[data-p435930-internal-route-error],[data-p435930-family-open-error],[data-p435930-home-error]").length,
    timeline:mount.querySelectorAll(".aoDevoSequenceTimeline .aoDevoStop").length};
 });
 const waitOwner=async(expected,id)=>{
   await page.waitForFunction(({expected})=>{
     if(expected==="rosary")return !!document.querySelector("#aoPrayerBookRoot.open .pbShell");
     const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
     if(!m)return false;
     return (m.dataset.aoPrayView==="traditional-pray"?"traditional:"+m.dataset.aoTraditionalPrayRoute:m.dataset.aoPrayView)===expected;
   },{expected},{timeout:18000});
   const value=await identify();
   assert.equal(value.owner,expected,id+" opened a different UI owner: "+JSON.stringify(value));
   assert.equal(value.alternate||0,0,id+" opened a route error");
   assert.ok(value.body.length>=12,id+" opened an empty reader");
   return value;
 };
 const discovered=new Map();
 for(const family of ["daily","eucharistic","penance","passion","devotions"]){
  await hub();
  await openFamilyDoor(family);
  await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView==="family");
  const list=await page.locator('#aoPray435930.open .aoP435930ModuleGrid [data-p435930-own],#aoPray435930.open .aoP435930ModuleGrid [data-p435930-external]')
   .evaluateAll(buttons=>buttons.map(button=>({id:button.dataset.p435930Own||button.dataset.p435930External,kind:button.dataset.p435930Own?"own":"external"})));
  for(const entry of list){
    assert.equal(discovered.has(entry.id),false,"Duplicated visible Prayer entry "+entry.id);
    discovered.set(entry.id,{...entry,family});
  }
 }
 discovered.set("pray.library",{id:"pray.library",kind:"own",family:null});
 for(const id of canonical)assert.ok(discovered.has(id),"Canonical route missing visible Prayer launcher: "+id);
 assert.ok(discovered.has("pray.tenebrae"),"Tenebrae optional Prayer route no longer exists");
 assert.equal(discovered.size,24,"Prayer catalogue contains duplicated/orphan module entry");
 const order=canonical.filter(x=>x!=="pray.rosary").concat("pray.rosary");
 const results=[];
 for(const id of order){
   const entry=discovered.get(id);
   const expected=id==="pray.rosary"?"rosary":entry.kind==="external"
     ?(id==="pray.novenas"?"novenas":"traditional:"+id):internalPrayerView(id);
   assert.ok(expected,"No authoritative owner for "+id);
   await hub();
   if(entry.family){
     await openFamilyDoor(entry.family);
     await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView==="family");
   }
   const attr=entry.kind==="own"?"data-p435930-own":"data-p435930-external";
   await page.locator('#aoPray435930.open ['+attr+'="'+id+'"]').tap();
   const fromCatalogue=await waitOwner(expected,id+" catalogue");
   // Contextual links and calendar launch through the same registry instead of
   // the catalogue. Compare the real mounted UI owner, not route metadata only.
   const direct=await page.evaluate(async route=>await globalThis.AO_MODULES.open(route,{returnContext:{surface:"calendar"}}),id);
   assert.equal(direct?.ok,true,"Calendar-style registry launch failed "+id+": "+JSON.stringify(direct));
   const fromContext=await waitOwner(expected,id+" contextual");
   assert.equal(fromContext.owner,fromCatalogue.owner,id+" has a duplicate reader implementation");
   // Keep stage count separately as a diagnostic. Different remembered
   // positions are legitimate; a separate visible owner is not.
   results.push({id,owner:expected,stops:fromContext.timeline||0});
 }
 assert.equal(results.length,23);
 assert.deepEqual(errors.filter(x=>/SyntaxError|TypeError|ReferenceError|Unhandled/i.test(x)),[],"Prayer entry page errors: "+JSON.stringify(errors));
 console.log("PASS all 23 canonical Prayer catalogue taps agree with context/calendar registry on their one visible reader owner");
 console.log("PRAY_OWNER_PARITY="+JSON.stringify(results));
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
