import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {probeTextFocus} from "./support/text-focus-probe.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/text-focus-parity");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise((ok,fail)=>{srv.once("error",fail);srv.listen(4295,"127.0.0.1",ok)});
const cases=[
 {mode:"LIVE",lang:"en"},
 {mode:"LIVE",lang:"fr"},
 {mode:"MISSAL",lang:"en"},
 {mode:"MISSAL",lang:"fr"},
];
const findings={schema:"ao-reader-mode-language-parity-audit-v1",
 timestamp:new Date().toISOString(),scenarios:[],comparisons:[],limitations:[],errors:[]};
let browser;
const sleepFrames=()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
try{
 browser=await chromium.launch({headless:true});
 for(const test of cases){
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,
   hasTouch:true,deviceScaleFactor:1,locale:test.lang==="fr"?"fr-FR":"en-GB",serviceWorkers:"block"});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  const params=new URLSearchParams({production:"1",secondConfiteor:"1",mode:test.mode,lang:test.lang});
  await page.goto("http://127.0.0.1:4295/tests/fixtures/reader-phone-harness.html?"+params,
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true"||
    document.documentElement.dataset.harnessReady==="error",null,{timeout:60000});
  const state=await page.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   return {error:window.__AO_PHONE_HARNESS_ERROR??null,
    mode:document.querySelector("#ao-r17-native-reader-preview [data-ao-reader-shell]")?.dataset.mode,
    cards:(api?.model?.cards||[]).map((c,i)=>({id:c.sectionId??c.id??null,title:c.title,sequence:c.sequence,i})),
    total:api?.model?.totalCards??0,source:api?.sourceModel?.totalCards??null};
  });
  const scenario={...test,modeRendered:state.mode,modelCards:state.total,sourceCards:state.source,
    visited:0,cards:[],errors,loadError:state.error};
  if(state.error)throw Error(test.mode+"/"+test.lang+" failed to open: "+state.error);
  assert.equal(state.mode,test.mode,test.mode+"/"+test.lang+" rendered wrong presentation mode");
  assert.ok(state.cards.length>15,"Unexpectedly empty "+test.mode+" presentation model");
  for(const card of state.cards){
   const report=await page.evaluate(async ({sequence,mode,label})=>{
    const api=window.__AO_PHONE_PREVIEW;
    const selected=api.showSequence(sequence);
    await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
    const shell=document.querySelector("#ao-r17-native-reader-preview");
    const scroll=shell?.querySelector(".ao-prayer-card");
    const paragraphs=[...(scroll?.querySelectorAll(".ao-reader-paragraph")||[])]
      .filter(node=>node.getClientRects().length && !node.closest("[hidden]"));
    const cueNodes=paragraphs.filter(node=>/^AO\.SM\.C\d{4}$/.test(node.dataset.cueId||""));
    const idList=cueNodes.map(node=>node.dataset.cueId);
    const seen=new Set();
    const original=scroll?.scrollTop||0;
    const max=Math.max(0,(scroll?.scrollHeight||0)-(scroll?.clientHeight||0));
    const dark=[];
    const sample=node=>{
      if(node?.dataset.active==="true")seen.add(node.dataset.cueId);
    };
    cueNodes.forEach(sample);
    // Keep this preliminary parity sweep bounded even for readers with
    // many cue IDs. A separate exhaustive LIVE audit already owns 259/259.
    if(mode!=="MISSAL"&&scroll){
      const offsets=new Set([0,max]);
      for(const node of cueNodes){
       const box=node.getBoundingClientRect(),sr=scroll.getBoundingClientRect();
       const mid=(box.top+box.bottom)/2-sr.top+scroll.scrollTop;
       offsets.add(Math.max(0,Math.min(max,Math.round(mid-scroll.clientHeight*.39))));
      }
      for(let i=1;i<35;i++)offsets.add(Math.round(max*i/35));
      for(const y of [...offsets].sort((a,b)=>a-b)){
       scroll.scrollTop=y;
       scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
       await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
       for(const node of cueNodes)sample(node);
      }
    }
    // Measure the *actual computed* text readability, not source styles.
    for(const node of paragraphs){
     const o=Number(getComputedStyle(node).opacity);
     if(o<(mode==="MISSAL"?.90:.42))dark.push({text:node.textContent.trim().slice(0,75),opacity:o,kind:node.dataset.kind||null});
    }
    const sourceCueBefore=api.getNativeEventState?.()?.nativeCueId??shell?.dataset.r17NativeCue??null;
    const scrollPositions=[Math.max(0,max*.19),Math.max(0,max*.76),0];
    if(mode==="MISSAL"&&scroll){
     for(const y of scrollPositions){
      scroll.scrollTop=y;
      scroll.dispatchEvent(new Event("scroll",{bubbles:true}));
      await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
     }
    }
    const sourceCueAfter=api.getNativeEventState?.()?.nativeCueId??shell?.dataset.r17NativeCue??null;
    const vernacular=paragraphs.map(n=>n.querySelector(".ao-line-secondary")?.textContent||"")
      .filter(Boolean).slice(0,5).join(" ").slice(0,180);
    const matchedId=api.getCurrentCard()?.sectionId??api.getCurrentCard()?.id??null;
    if(scroll){scroll.scrollTop=original;scroll.dispatchEvent(new Event("scroll",{bubbles:true}))}
    return {id:matchedId,title:label,paragraphs:paragraphs.length,sourceCues:idList.length,
      cuesFocused:seen.size,unfocused:idList.filter(id=>!seen.has(id)).slice(0,24),
      maxScroll:Math.round(max),lowOpacityCount:dark.length,lowOpacityExamples:dark.slice(0,5),
      nativeCueBefore:sourceCueBefore,nativeCueAfter:sourceCueAfter,
      vernacular,secondaryCount:paragraphs.filter(n=>n.querySelector(".ao-line-secondary")).length,
      missalTwoColumn:!!shell?.querySelector(".ao-reader-shell[data-mode='MISSAL'] .ao-prayer-body"),
      error:null};
   },{sequence:card.sequence,mode:test.mode,label:card.title});
   if(test.mode!=="MISSAL"&&report.unfocused.length){
    const dense=await page.evaluate(probeTextFocus,{
      rootSelector:"#ao-r17-native-reader-preview",scrollSelector:".ao-prayer-card",
      paragraphSelector:".ao-reader-paragraph",owner:"mass",
      label:test.mode+"/"+test.lang+" / "+card.title
    });
    report.quickSampleFocused=report.cuesFocused;
    report.cuesFocused=dense.reached;
    report.unfocused=dense.unreachable.map(x=>x.id);
    report.denseScrollSteps=dense.scrollSweepSteps||0;
    report.denseInvalidated=dense.invalidated;
    if(report.unfocused.length){
     report.gapGeometry=await page.evaluate(ids=>{
      const scroll=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
      const sr=scroll.getBoundingClientRect(), nodes=[...scroll.querySelectorAll(".ao-reader-paragraph[data-cue-id]")];
      return ids.map(id=>{
       const i=nodes.findIndex(n=>n.dataset.cueId===id);
       const positions=[i-1,i,i+1].map(k=>{
        const n=nodes[k],r=n?.getBoundingClientRect();
        return !n||!r?null:{cue:n.dataset.cueId,text:n.textContent.trim().slice(0,95),
         top:Math.round(r.top-sr.top+scroll.scrollTop),
         bottom:Math.round(r.bottom-sr.top+scroll.scrollTop)};
       });
       return {id,index:i,neighbors:positions,maxScroll:Math.max(0,scroll.scrollHeight-scroll.clientHeight),
        viewport:scroll.clientHeight,padding:getComputedStyle(scroll).paddingBottom};
      });
     },report.unfocused);
     console.log("PARITY_GAP_GEOMETRY="+JSON.stringify({mode:test.mode,lang:test.lang,
      card:card.title,details:report.gapGeometry}));
    }
   }
   scenario.cards.push({index:card.i,expectedId:card.id,...report});
   scenario.visited++;
  }
  scenario.registered=scenario.cards.reduce((n,x)=>n+x.sourceCues,0);
  scenario.focused=scenario.cards.reduce((n,x)=>n+x.cuesFocused,0);
  scenario.darkParagraphs=scenario.cards.reduce((n,x)=>n+x.lowOpacityCount,0);
  scenario.focusGaps=(test.mode==="MISSAL"?[]:scenario.cards).filter(x=>x.sourceCues&&x.cuesFocused<x.sourceCues)
    .map(x=>({index:x.index,title:x.title,sourceCues:x.sourceCues,focused:x.cuesFocused,maxScroll:x.maxScroll,unfocused:x.unfocused}));
  scenario.unpaired=scenario.cards.filter(x=>x.paragraphs>0&&!x.secondaryCount)
    .map(x=>({index:x.index,title:x.title,paragraphs:x.paragraphs}));
  scenario.cardIdentityErrors=scenario.cards.filter(x=>x.id!==x.expectedId);
  scenario.missalStateDrift=scenario.cards.filter(x=>test.mode==="MISSAL"&&x.nativeCueBefore!==x.nativeCueAfter)
    .map(x=>({title:x.title,before:x.nativeCueBefore,after:x.nativeCueAfter}));
  findings.scenarios.push(scenario);
  assert.equal(scenario.visited,scenario.modelCards,test.mode+"/"+test.lang+" skipped model cards");
  assert.equal(scenario.cardIdentityErrors.length,0,test.mode+"/"+test.lang+" card identity drift");
  assert.equal(scenario.errors.length,0,test.mode+"/"+test.lang+" JavaScript errors");
  const kyrie=scenario.cards.find(x=>/^Kyrie/.test(x.title));
  assert.ok(kyrie,test.mode+"/"+test.lang+" lost Kyrie card");
  const localizedKyrie=test.lang==="fr"?"Seigneur, ayez pitié":"Lord, have mercy";
  assert.ok(kyrie.vernacular.includes(localizedKyrie),
    test.mode+"/"+test.lang+" did not render the expected translation");
  if(test.mode==="LIVE"){
   assert.equal(scenario.registered,scenario.focused,
     test.mode+"/"+test.lang+" contains unreadable source-cue paragraphs: "+JSON.stringify(scenario.focusGaps));
  }
  if(test.mode==="MISSAL"){
   assert.equal(scenario.darkParagraphs,0,"Missal must remain fully readable, never dimmed");
   assert.equal(scenario.missalStateDrift.length,0,"Missal scroll must not advance ceremonial state");
   assert.equal(scenario.cards.filter(x=>x.missalTwoColumn).length,scenario.visited,
     "Missal lost the two-column reader on one or more cards");
  }
  console.log("PARITY_SCENARIO="+JSON.stringify({mode:test.mode,lang:test.lang,cards:scenario.visited,
   registered:scenario.registered,focused:test.mode==="MISSAL"?"static":scenario.focused,gaps:scenario.focusGaps.length,
   dark:scenario.darkParagraphs,unpaired:scenario.unpaired.length,missalStateDrift:scenario.missalStateDrift.length}));
  await context.close();
 }
 for(const mode of ["LIVE","MISSAL"]){
  const en=findings.scenarios.find(x=>x.mode===mode&&x.lang==="en");
  const fr=findings.scenarios.find(x=>x.mode===mode&&x.lang==="fr");
  findings.comparisons.push({mode,enCards:en.modelCards,frCards:fr.modelCards,
   enCues:en.registered,frCues:fr.registered,
   matchIds:JSON.stringify(en.cards.map(x=>x.id))===JSON.stringify(fr.cards.map(x=>x.id)),
   enSecondary:en.cards.reduce((n,x)=>n+x.secondaryCount,0),
   frSecondary:fr.cards.reduce((n,x)=>n+x.secondaryCount,0)});
 }
 findings.limitations=[
  "This is a first-pass mode/language parity sweep for an ordinary sung Mass with a source-backed Proper fixture, not a certification of every liturgical day, local variant, or form.",
  "LIVE English has a separate exhaustive source-cue audit; this run covers both reader modes in English and French.",
  "Missal is intentionally static; source cue progress must remain unchanged during scrolling, and visual brightness is assessed separately from ceremonial cues.",
  "LIVE sampled scroll positions are a diagnostic screen, not proof every handoff pixel is traversed; any missing cues require a dense follow-up.",
  "Headings, rubrics and intentionally hidden translation faces are not interchangeable with reading paragraphs."
 ];
} catch(e){findings.errors.push(String(e?.stack||e));throw e}
finally{
 await writeFile(resolve(output,"mode-language-parity.json"),JSON.stringify(findings,null,2));
 await writeFile(resolve(output,"mode-language-summary.txt"),
 findings.scenarios.map(s=>[s.mode,s.lang,"cards",s.visited+"/"+s.modelCards,
  "cue focus",s.focused+"/"+s.registered,"dark",s.darkParagraphs,
  "no pairing",s.unpaired.length,"errors",s.errors.length].join(" ")).join("\n")+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>srv.close(ok));
 console.log("PARITY_AUDIT_RESULT="+JSON.stringify({
  scenarios:findings.scenarios.map(s=>({mode:s.mode,lang:s.lang,cards:s.visited,
   registered:s.registered,focused:s.focused,focusGaps:s.focusGaps.length,
   dark:s.darkParagraphs,unpaired:s.unpaired.length,missalStateDrift:s.missalStateDrift.length})),
  comparisons:findings.comparisons,errors:findings.errors
 }));
}
