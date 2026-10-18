import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const full=resolve(root,"."+path);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]??"application/octet-stream",
    "cache-control":"no-store"});res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4298,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const variant of [
  {width:320,lang:"en",tract:false,sequence:false},
  {width:390,lang:"en",tract:false,sequence:true},
  {width:768,lang:"en",tract:true,sequence:false},
  {width:390,lang:"fr",tract:true,sequence:true},
 ]){
  const {width,lang,tract,sequence}=variant;
  const context=await browser.newContext({
   viewport:{width,height:844},isMobile:width<600,hasTouch:width<600,
   deviceScaleFactor:1,locale:lang==="fr"?"fr-FR":"en-GB"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  const params=new URLSearchParams({
    production:"1",sourceChants:"1",lang,...(tract?{tract:"1"}:{}),
    ...(sequence?{sequence:"1"}:{}),
  });
  await page.goto("http://127.0.0.1:4298/tests/fixtures/reader-phone-harness.html?"+params,
    {waitUntil:"networkidle",timeout:55000});
  await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),null,{timeout:25000});
  const result=await page.evaluate(()=>{
   if(document.documentElement.dataset.harnessReady==="error")
     return {error:globalThis.__AO_PHONE_HARNESS_ERROR??"Boot failed"};
   const api=window.__AO_PHONE_PREVIEW;
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const cards=api.model.cards.filter(c=>c.sourceSectionId==="AO.CARD.006");
   const actions=[];
   const next=()=>root.querySelector('[data-reader-nav="next"]')?.click();
   if(!next)return {error:"Next button absent"};
   api.showSequence(cards[0].sequence);
   const snapshot=()=>{
    const toggle=root.querySelector(".ao-schola-toggle")?.getBoundingClientRect();
    const kick=root.querySelector(".ao-schola-kicker")?.getBoundingClientRect();
    const page=root.querySelector(".ao-schola-page")?.getBoundingClientRect();
    const intersects=(a,b)=>Boolean(a&&b&&
      a.width>0&&b.width>0&&
      Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&
      Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1);
    return {
     title:api.getCurrentCard()?.title,
     schola:api.getNativeScholaState?.()?.schola?.segmentId??null,
     header:root.querySelector('[data-role="section-title"]')?.textContent?.trim(),
     scholaHeaderText:root.querySelector(".ao-schola-kicker")?.textContent?.trim(),
     scholaHeaderOverlapsControls:intersects(toggle,kick)||intersects(toggle,page),
     scholaToggleWidth:toggle?.width??0,
    };
   };
   actions.push(snapshot());
   next();actions.push(snapshot());
   if(cards.length===3){next();actions.push(snapshot());}
   return {
    count:api.model.totalCards,
    cards:cards.map(c=>({title:c.title,paragraphIds:c.paragraphs.map(p=>p.id),
      groups:c.paragraphs.map(p=>p.liturgicalGroup)})),
    original:api.sourceModel.cards.find(c=>c.sectionId==="AO.CARD.006")?.paragraphs.map(p=>p.id),
    actions,
    overflow:document.documentElement.scrollWidth>innerWidth+1,
    width:root.querySelector("[data-ao-reader-shell]")?.getBoundingClientRect().width,
    rendered:root.textContent,
   };
  });
  assert.equal(result.error,undefined,JSON.stringify(result));
  assert.equal(result.count,sequence?66:65);
  const names=["Gradual",tract?"Tract":"Alleluia",...(sequence?["Sequence"]:[])];
  assert.deepEqual(result.cards.map(c=>c.title),names);
  assert.deepEqual(result.cards.flatMap(c=>c.paragraphIds),result.original,
   "Source paragraphs were lost during card navigation");
  assert.deepEqual(result.actions.map(a=>a.title),names,
   "Physical next button did not navigate distinct source chants");
  assert.deepEqual(result.actions.map(a=>a.header),names);
  assert.deepEqual(result.actions.map(a=>a.scholaHeaderText),names.map(x=>x.toUpperCase()),
   "The Schola should label only the actual source-owned chant");
  assert.equal(result.actions.some(a=>a.scholaHeaderOverlapsControls),false,
   "Schola Hide button overlaps the chant name or segment counter");
  assert.equal(result.actions.every(a=>a.scholaToggleWidth>=(width<=760?44:24)),true,
   "The Schola Hide button lost its mobile touch target");
  assert.equal(result.overflow,false);
  assert.ok(result.width<=width+1);
  assert.deepEqual(errors,[],"Console page errors");
  await page.screenshot({path:resolve(out,
    "source-chants-"+width+"-"+lang+(tract?"-tract":"-alleluia")+
    (sequence?"-sequence":"")+".png"),animations:"disabled"});
  console.log("PASS source-verified "+names.join(" → ")+" at "+width+"px "+lang+
    ", "+result.count+" cards, exact paragraph conservation");
  await context.close();
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
