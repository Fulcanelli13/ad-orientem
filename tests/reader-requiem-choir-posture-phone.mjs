// End-to-end 1962 Requiem choir posture: opt-in profile, real reader,
// source-cue focus, bilingual LIVE/Missal and ordinary-Mass isolation.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const port=4357;
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]??"application/octet-stream",
    "cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(); }
});
await new Promise((yes,no)=>{server.once("error",no);server.listen(port,"127.0.0.1",yes);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const {form,mode,lang,requiem} of [
  {form:"MISSA_CANTATA_SIMPLE",mode:"LIVE",lang:"en",requiem:true},
  {form:"SOLEMN",mode:"MISSAL",lang:"fr",requiem:true},
  {form:"SOLEMN",mode:"LIVE",lang:"en",requiem:false},
 ]){
  const context=await browser.newContext({viewport:{width:390,height:844},
    isMobile:true,hasTouch:true});
  try{
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   const params=new URLSearchParams({form,mode,lang,requiem:requiem?"1":"0"});
   await page.goto("http://127.0.0.1:"+port+
     "/tests/fixtures/reader-phone-harness.html?"+params.toString(),
     {waitUntil:"networkidle",timeout:90000});
   await page.waitForFunction(()=>
     ["true","error"].includes(document.documentElement.dataset.harnessReady),
     null,{timeout:30000});
   const startupError=await page.evaluate(()=>window.__AO_PHONE_HARNESS_ERROR??null);
   assert.equal(startupError,null,"reader fixture startup: "+startupError);
   // Same handler and saved-preference path as the actual Mass settings UI.
   await page.evaluate(()=>{
     const select=document.querySelector('[data-reader-customary="postureProfile"]');
     if(!select)throw new Error("Requiem choir posture choice missing");
     select.value="REQUIEM_CHOIR_1962";
     select.dispatchEvent(new Event("change",{bubbles:true}));
   });
   // Missal is intentionally a static book view: scrolling its columns
   // must not impersonate the priest's live source-cue clock. Check that
   // the opted-in profile persists and that all source prayer anchors exist,
   // then reserve exact live scroll-transition assertions for LIVE mode.
   if(mode==="MISSAL"){
     const staticMissal=await page.evaluate(async()=>{
       const api=window.__AO_PHONE_PREVIEW;
       const cues=["AO.SM.C0150","AO.SM.C0208","AO.SM.C0253","AO.SM.C0257"];
       const available=cues.every(cue=>api.model.cards.some(card=>
         (card.paragraphs??[]).some(p=>p.sourceCueIds?.includes(cue))));
       const card=api.model.cards.find(c=>(c.paragraphs??[]).some(p=>
         p.sourceCueIds?.includes("AO.SM.C0253")));
       api.showSequence(card.sequence);
       await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
       const before=api.getActiveCue();
       const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
       scroller.scrollTop=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
       scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
       await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
       return {available,mode:api.getPresentationMode(),
         chosen:api.getNativeEventState()?.customary?.postureProfile,
         before,after:api.getActiveCue()};
     });
     assert.equal(staticMissal.available,true,"Missal lost canonical Requiem source anchors");
     assert.equal(staticMissal.mode,"MISSAL");
     assert.equal(staticMissal.chosen,"REQUIEM_CHOIR_1962");
     assert.equal(staticMissal.after,staticMissal.before,
       "Missal book scrolling must not claim a new live priest/choir event");
     assert.deepEqual(errors,[],form+"/"+mode+" phone runtime errors");
     continue;
   }
   async function focus(cueId){
     const result=await page.evaluate(async target=>{
       const api=window.__AO_PHONE_PREVIEW;
       const card=api.model.cards.find(c=>(c.paragraphs??[]).some(p=>
         p.sourceCueIds?.includes(target)));
       if(!card)return {ok:false,reason:"SOURCE_CARD_MISSING",cue:target};
       api.showSequence(card.sequence);
       const frames=()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
       await frames();
       const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
       const node=[...scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]")]
         .find(n=>n.dataset.cueId===target);
       if(!node)return {ok:false,reason:"SOURCE_CUE_NOT_RENDERED",cue:target};
       const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
       const position=()=>{
         const a=scroller.getBoundingClientRect(),b=node.getBoundingClientRect();
         return Math.max(0,Math.min(max,scroller.scrollTop+b.top-a.top+
           b.height/2-scroller.clientHeight*.39));
       };
       // Tiny Oremus/response paragraphs can own only a narrow scroll
       // interval near the first-edge guard. Check that reachable interval
       // rather than testing five arbitrary offsets; never force cue state.
       const candidates=[
         position(),Math.max(0,position()-50),Math.min(max,position()+50),
         ...Array.from({length:Math.ceil(Math.min(max,192)/6)+1},(_,i)=>Math.min(max,i*6)),
         ...Array.from({length:Math.ceil(max/32)+1},(_,i)=>Math.min(max,i*32)),
         0,max,
       ];
       const options=[...new Set(candidates.map(v=>Math.max(0,Math.min(max,v))))];
       const observed=new Set();
       for(const scrollTop of options){
         scroller.scrollTop=scrollTop;
         scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
         await frames();
         observed.add(api.getActiveCue());
         if(api.getActiveCue()===target){
           const state=api.getNativeEventState();
           return {ok:true,posture:state?.posture?.value??state?.posture?.label,
             owner:state?.posture?.owner,postureCue:state?.postureCue?.cueId??null,
             postureCueOwner:state?.postureCue?.owner??null,
             rendered:document.querySelector('[data-role="posture"]')?.textContent?.trim(),
             active:api.getActiveCue()};
         }
       }
       return {ok:false,reason:"FOCUS_UNREACHABLE",current:api.getActiveCue(),
         cue:target,cardId:card.sectionId,maxScroll:max,
         cardCues:[...scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]")].map(n=>n.dataset.cueId),
         observed:[...observed]};
     },cueId);
     assert.equal(result.ok,true,JSON.stringify(result));
     return result;
   }
   for(const [id,expected] of [
     ["AO.SM.C0150","KNEEL"],
     ["AO.SM.C0208","STAND"],
     ["AO.SM.C0253","KNEEL"],
     ["AO.SM.C0257","STAND"],
   ]){
     const state=await focus(id);
     if(requiem){
       assert.equal(state.posture,expected,form+"/"+mode+" "+id);
       assert.equal(state.owner,"REQUIEM_CHOIR_1962",id);
       assert.equal(state.postureCue,id,id+" lacks a distinct real phone transition");
       assert.match(state.rendered??"",new RegExp(expected,"i"),
         id+" posture not visible in the reader");
     }else{
       assert.notEqual(state.owner,"REQUIEM_CHOIR_1962",
         "choir-only posture leaked into ordinary Mass "+id);
     }
   }
   assert.deepEqual(errors,[],form+"/"+mode+" phone runtime errors");
  }finally{await context.close();}
 }
 console.log("PASS Requiem choir 1962 phone: selected LIVE EN and Solemn Missal FR cue transitions; ordinary Mass isolated.");
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
