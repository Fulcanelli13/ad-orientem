import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?600:844},serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/reader-phone-harness.html",
   {waitUntil:"networkidle"});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
   null,{timeout:25000});
  const result=await page.evaluate(async()=>{
   const api=window.__AO_PHONE_PREVIEW;
   if(!api||api.model.totalCards!==65)throw Error("Missing canonical 65-card LIVE reader");
   const frame=()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
   const focus=async cue=>{
    const card=api.model.cards.find(c=>c.paragraphs?.some(p=>
      (p.sourceCueIds??[]).includes(cue)));
    if(!card)throw Error("Missing source cue "+cue+" in LIVE reader");
    api.showSequence(card.sequence);await frame();
    const scroll=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
    if(!scroll)throw Error("Missing canonical scroll container");
    const max=Math.max(0,scroll.scrollHeight-scroll.clientHeight);
    for(let position=0;position<=max+32;position+=12){
      scroll.scrollTop=Math.min(max,position);
      scroll.dispatchEvent(new Event("scroll",{bubbles:true}));await frame();
      if(api.getActiveCue()===cue)break;
    }
    if(api.getActiveCue()!==cue)throw Error("Source cue not focusable: "+cue+
      " active "+api.getActiveCue());
    const state=api.getNativeEventState(),shell=document.querySelector("#ao-r17-native-reader-preview");
    return {cue:api.getActiveCue(),voice:state.priestVoice?.label??null,
     owner:state.ownership?.priestVoice,quiet:state.priestQuietOffertory??null,
     text:shell?.textContent??"",hasScore:Boolean(shell?.querySelector("[data-reference-score]"))};
   };
   const properSourcePlaceholderMounted=api.model.cards.some(c=>c.paragraphs?.some(p=>
     (p.sourceCueIds??[]).includes("AO.SM.C0109")));
   return {total:api.model.totalCards,
    oremus:await focus("AO.SM.C0108"),
    properSourcePlaceholderMounted,
    quiet:await focus("AO.SM.C0110")};
  });
  assert.equal(result.total,65);
  assert.equal(result.oremus.cue,"AO.SM.C0108");
  assert.equal(result.oremus.voice,"SUNG / CLEAR","1962 n.513 must show chanted Oremus");
  assert.equal(result.oremus.owner,"MR1962_513_A_OFFERTORY_OREMUS_SUNG");
  assert.match(result.oremus.text,/Orémus/);
  assert.equal(result.properSourcePlaceholderMounted,false,
   "The canonical C0109 source action is replaced by the resolved Proper; it is not a reader paragraph or evidence of a second priest chant");
  assert.equal(result.quiet.cue,"AO.SM.C0110");
  assert.equal(result.quiet.voice,"SECRET / QUIET");
  assert.equal(result.quiet.owner,"SUNG_SOURCE_OFFERTORY_PRIEST_PRIVATE");
  assert.equal(result.quiet.quiet?.iconKey,"priest_silent");
  assert.equal(result.oremus.hasScore,false,"No guessed priest Oremus neumes");
  // Dynamic Proper and Schola music are independent of the priest Oremus cue.
  await mkdir(resolve(root,".tmp/offertory-oremus-voice-boundary"),{recursive:true});
  await page.screenshot({path:resolve(root,
   ".tmp/offertory-oremus-voice-boundary/phone-"+width+".png"),fullPage:true});
  console.log("PASS "+width+"px Offertory sung Oremus -> Schola proper -> secret priest; 65 cards unchanged");
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
