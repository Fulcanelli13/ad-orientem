import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFileSync} from "node:fs";
import {chromium} from "@playwright/test";
import {buildReaderShellMarkup} from "../src/mass/reader-dom.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";

// The actual historical GABC is a test source, not a published Schola score.
// No user-selected setting, score approval or priest cue is manufactured.
const files=new Map([
 ["/src/mass/reader-schola-notation-follow.js",
  new URL("../src/mass/reader-schola-notation-follow.js",import.meta.url)],
 ["/src/mass/reader-schola-mass-text-sync.js",
  new URL("../src/mass/reader-schola-mass-text-sync.js",import.meta.url)],
 ["/src/mass/reader-chant-engraver.js",
  new URL("../src/mass/reader-chant-engraver.js",import.meta.url)],
 ["/assets/vendor/exsurge/exsurge.min.js",
  new URL("../assets/vendor/exsurge/exsurge.min.js",import.meta.url)]
]);
const html='<meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<style>html,body{height:100%;width:100%;margin:0;overflow:hidden}'+
 '.ao-prayer-card{height:340px!important;overflow-y:auto!important;scroll-behavior:auto!important}'+
 '.ao-schola-follow-strip{overflow-x:auto;white-space:nowrap;max-width:100%}'+
 '</style>'+buildReaderShellMarkup({readerPreferences:{mode:"LIVE"}});
const server=createServer((req,res)=>{
 const path=req.url.split("?")[0];
 if(files.has(path)){
  res.writeHead(200,{"Content-Type":"text/javascript; charset=utf-8"});
  res.end(readFileSync(files.get(path)));return;
 }
 res.writeHead(200,{"Content-Type":"text/html; charset=utf-8"}).end(html);
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390]){
  for(const [movement,setting,lines] of [
   ["GLORIA","MASS_08",["Glória in excélsis Deo.",
     "Et in terra pax homínibus bonæ voluntátis."]],
   ["CREDO","CREDO_03",["Credo in unum Deum.",
     "Patrem omnipotentem, factorem caeli et terrae."]],
   ["KYRIE","MASS_08",[
      "Kýrie, eléison.","Kýrie, eléison.","Kýrie, eléison.",
      "Christe, eléison.","Christe, eléison.","Christe, eléison.",
      "Kýrie, eléison.","Kýrie, eléison.","Kýrie, eléison."
   ]]
  ]){
   const score=offlineKyrialeResearchScore(movement,setting);
   assert.ok(score?.gabc);
   const page=await browser.newPage({viewport:{width,height:780}});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto("http://127.0.0.1:"+server.address().port+"/");
   const result=await page.evaluate(async ({gabc,lines,trackId})=>{
    const {createOfflineChantEngraver}=await import("/src/mass/reader-chant-engraver.js");
    const {createScholaNotationFollower}=await import("/src/mass/reader-schola-notation-follow.js");
    const {createScholaMassTextSynchronizer,scholaMassTextAnchors}=
      await import("/src/mass/reader-schola-mass-text-sync.js");
    const reader=document.querySelector(".ao-prayer-card");
    const body=reader.querySelector('[data-role="paragraphs"]');
    for(const [n,text] of lines.map((text,i)=>[i+1,text])){
     const p=document.createElement("p");p.className="ao-reader-paragraph";
     p.dataset.paragraphId="SOURCE-"+n;p.dataset.kind="TEXT";
     p.style.cssText="min-height:140px;margin-top:"+(n===1?"20px":"400px")+";";
     const span=document.createElement("span");span.className="ao-line-primary";
     span.textContent=text;p.append(span);body.append(p);
    }
    const dock=document.querySelector(".ao-schola-dock");
    dock.dataset.active="true";dock.dataset.approvedScore="true";
    dock.dataset.collapsed="false";
    const panel=dock.querySelector('[data-role="schola-approved-score"]');
    panel.hidden=false;panel.dataset.scoreStatus="approved";
    const pauseControl=dock.querySelector("[data-schola-notation-pause]");
    if(getComputedStyle(pauseControl).display==="none")
      throw Error("Approved notation Pause control must be visible");
    const staff=dock.querySelector('[data-role="schola-approved-staff"]');
    const strip=dock.querySelector('[data-role="schola-follow-strip"]');
    const engraver=createOfflineChantEngraver({viewport:staff,document});
    if(!await engraver.engrave(gabc))throw Error("Original GABC engraving failed");
    const plan=scholaMassTextAnchors(gabc,lines.map((latin,i)=>({
      id:"SOURCE-"+(i+1),latin
    })),{trackId});
    if(plan.anchors.length!==lines.length)
      throw Error("Exact original source mapping failed: "+plan.anchors.length+"/"+lines.length);
    const textSync=createScholaMassTextSynchronizer({reader,gabc,trackId});
    const follow=createScholaNotationFollower({staff,strip,stepMs:9000,trackId,
      onPosition:({index})=>textSync.follow(index)});
    if(!follow.start(gabc))throw Error("Schola syllable follower failed");
    const offsets=plan.offsets;
    const syllable=offsets.findIndex((x)=>x>=plan.anchors.at(-1).start);
    if(syllable<0)throw Error("Second source syllable absent");
    const initial={scroll:reader.scrollTop,index:follow.getState().index};
    follow.seek(syllable);
    const later={scroll:reader.scrollTop,index:follow.getState().index,
      paragraph:reader.dataset.scholaTextFollowParagraph,
      horizontal:strip.scrollLeft,stripIndex:strip.dataset.scholaFollowIndex,
      mapped:follow.getState().mapped,staffSvg:!!staff.querySelector("svg")};
    follow.pause();
    const paused=follow.getState().paused;
    follow.destroy();textSync.destroy();engraver.destroy();
    return {initial,later,paused,readerHeight:reader.clientHeight,
      readerMax:reader.scrollHeight-reader.clientHeight};
   },{gabc:score.gabc,lines,trackId:movement});
   assert.equal(result.later.paragraph,"SOURCE-"+lines.length,JSON.stringify(result));
   assert.equal(result.later.index,result.later.stripIndex*1);
   assert.ok(result.later.scroll>result.initial.scroll+20,JSON.stringify(result));
   assert.ok(result.later.horizontal>=0&&result.later.staffSvg,JSON.stringify(result));
   assert.equal(result.paused,true);
   assert.deepEqual(errors,[]);
   console.log("SCHOLA_SHARED_CURSOR_PHONE_PASS "+width+" "+movement+" "+JSON.stringify(result));
   await page.close();
  }
 }
}finally{
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
