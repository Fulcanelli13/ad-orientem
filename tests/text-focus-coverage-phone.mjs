import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {probeTextFocus} from "./support/text-focus-probe.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/text-focus-coverage");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await mkdir(output,{recursive:true});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4292,"127.0.0.1",ok)});
let browser;
const findings={schema:"ao-text-focus-audit-v1",testedAt:new Date().toISOString(),
 mass:{},prayer:{},limitations:[],errors:[]};
try{
 browser=await chromium.launch({headless:true});
 const mass=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const massErrors=[];
 mass.on("pageerror",e=>massErrors.push(e.message));
 await mass.goto("http://127.0.0.1:4292/tests/fixtures/reader-phone-harness.html?production=1&secondConfiteor=1",
   {waitUntil:"domcontentloaded",timeout:90000});
 await mass.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true"&&
  !!window.__AO_PHONE_PREVIEW?.model?.cards?.length,null,{timeout:60000});
 const massCards=await mass.evaluate(()=>window.__AO_PHONE_PREVIEW.model.cards.map((c,i)=>
  ({i,id:c.id,title:c.title,sequence:c.sequence})));
 const massResults=[];
 for(const card of massCards){
  const selected=await mass.evaluate(sequence=>{
    const app=window.__AO_PHONE_PREVIEW;
    app.showSequence(sequence);
    return {id:app.getCurrentCard()?.id,title:app.getCurrentCard()?.title};
  },card.sequence);
  await mass.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
  const info=await mass.evaluate(probeTextFocus,{
   rootSelector:"#ao-r17-native-reader-preview",scrollSelector:".ao-prayer-card",
   paragraphSelector:".ao-reader-paragraph",owner:"mass",
   label:card.i+" / "+(selected.title||card.title||card.id)
  });
  massResults.push({i:card.i,id:card.id,title:card.title,...info});
 }
 findings.mass={
  presentation:"LIVE",language:"en",scenario:"ordinary sung, optional second Confiteor enabled",
  cardsExpected:massCards.length,cardsChecked:massResults.length,
  allText:massResults.reduce((n,x)=>n+x.allText,0),
  cueRegistered:massResults.reduce((n,x)=>n+x.registered,0),
  cueReached:massResults.reduce((n,x)=>n+x.reached,0),
  cueUnreachable:massResults.reduce((n,x)=>n+x.unreachableTotal,0),
  unownedText:massResults.reduce((n,x)=>n+x.unownedTotal,0),
  rubricExempt:massResults.reduce((n,x)=>n+x.exemptTotal,0),
  noScroll:massResults.filter(x=>!x.scrollRegion).map(x=>({id:x.id,title:x.title})),
  cards:massResults,pageErrors:massErrors
 };
 await mass.close();

 const pray=await browser.newPage({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
 const prayErrors=[];
 pray.on("pageerror",e=>prayErrors.push(e.message));
 await pray.goto("http://127.0.0.1:4292/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await pray.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await pray.evaluate(async()=>await window.AO_PRAY_APP_V1.open()),true);
 await pray.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 const routes=JSON.parse(readFileSync(resolve(root,"data/app/content-reachability-audit.v1.json"),"utf8"))
  .routes.filter(x=>x.kind==="PRAY_FAMILY_ITEM").map(x=>x.id);
 const routeIds=[...new Set(["pray.angelus",...routes])];
 const prayResults=[];
 for(const id of routeIds){
  const opened=await pray.evaluate(async route=>{
    try{return await window.AO_MODULES.open(route,{returnContext:null})}
    catch(e){return {ok:false,error:String(e)}}
  },id);
  await pray.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
  const mount=await pray.evaluate(()=>{
    const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {view:m?.dataset.aoPrayView||null,route:m?.dataset.aoTraditionalPrayRoute||null,
      rosary:!!document.querySelector("#aoPrayerBookRoot.open")};
  });
  const row={id,opened:opened?.ok??null,view:mount.view,traditionalRoute:mount.route,
    cards:[],status:"review"};
  if(mount.rosary){row.status="different-owner-bead-engine";prayResults.push(row);continue}
  const steps=await pray.evaluate(()=>{
    const host=document.querySelector("#aoPray435930.open");
    const nav=[...(host?.querySelectorAll(".aoDevoTimeline .aoDevoStop, .aoDevoSequenceTimeline .aoDevoStop")||[])]
      .filter(el=>el.getClientRects().length);
    return Math.max(1,Math.min(20,nav.length));
  });
  for(let step=0;step<steps;step++){
    if(step>0){
      await pray.evaluate(i=>{
        const root=document.querySelector("#aoPray435930.open");
        const stops=[...(root?.querySelectorAll(".aoDevoTimeline .aoDevoStop, .aoDevoSequenceTimeline .aoDevoStop")||[])]
          .filter(x=>x.getClientRects().length);
        stops[i]?.click();
      },step);
      await pray.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
    }
    const cards=await pray.evaluate(()=>{
      const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
      const body=m?.querySelector(".aoDevoCard:not([hidden]) .aoDevoCardScroll");
      const legacy=m?.querySelector(".aoP435930FluidUnit");
      return {hasDeck:!!body,legacy:!!legacy,
       card:m?.querySelector(".aoDevoCard:not([hidden])")?.dataset.aoDevoCard||String(0),
       visibleText:(m?.innerText||"").trim().length};
    });
    let probed=null;
    if(cards.hasDeck)probed=await pray.evaluate(probeTextFocus,{
      rootSelector:"#aoPray435930.open",scrollSelector:".aoDevoCard:not([hidden]) .aoDevoCardScroll",
      paragraphSelector:".aoDevoParagraph",owner:"devotional",label:id+" / "+cards.card
    });
    else if(cards.legacy)probed=await pray.evaluate(probeTextFocus,{
      rootSelector:"#aoPray435930.open",scrollSelector:".aoP435930Mount",
      paragraphSelector:".aoP435930FluidUnit",owner:"legacy",label:id+" / "+cards.card
    });
    row.cards.push({step,card:cards.card,visibleTextLength:cards.visibleText,probe:probed});
  }
  row.status=row.cards.some(x=>x.probe?.registered>0)?"sampled-focused":
    row.cards.some(x=>x.probe?.scrollRegion)?"scroll-without-registered-paragraphs":"needs-deeper-reader-entry";
  prayResults.push(row);
 }
 findings.prayer={routesExpected:routeIds.length,routesChecked:prayResults.length,
  routes:prayResults,pageErrors:prayErrors};
 findings.limitations=[
  "Mass: full ordinary sung LIVE model on a controlled Proper fixture, not every 1962 date, special rite, or form.",
  "Prayer: all 23 catalogued entry routes and direct Angelus, but route options, nested disclosures and every novena day are not automatically exhausted.",
  "Rosary has its own bead-player ownership; detailed bead illumination must be audited by its existing independent reader tests.",
  "Missing cue IDs on non-rubric Mass text are reported as suspects, not automatically certified defects.",
  "Static headings, guide-only liturgical stages and folded content are not expected to become the active paragraph."
 ];
 assert.equal(findings.mass.cardsChecked,findings.mass.cardsExpected,"Mass card traversal incomplete");
 assert.equal(findings.prayer.routesChecked,findings.prayer.routesExpected,"Prayer route traversal incomplete");
} catch(error){
 findings.errors.push(String(error?.stack||error));
 throw error;
}finally{
 await writeFile(resolve(output,"focus-coverage.json"),JSON.stringify(findings,null,2));
 await writeFile(resolve(output,"focus-summary.txt"),[
  "Mass cards: "+(findings.mass.cardsChecked||0)+" / "+(findings.mass.cardsExpected||"?"),
  "Mass cue passages reached: "+(findings.mass.cueReached||0)+" / "+(findings.mass.cueRegistered||0),
  "Mass uncued non-rubric text: "+(findings.mass.unownedText||0),
  "Prayer routes: "+(findings.prayer.routesChecked||0)+" / "+(findings.prayer.routesExpected||"?"),
  "Unreachable Mass cues: "+(findings.mass.cueUnreachable||0),
  "See focus-coverage.json for per-card and per-prayer details."
 ].join("\n")+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
 console.log("TEXT_FOCUS_SUMMARY="+JSON.stringify({
  massCards:findings.mass.cardsChecked,massRegistered:findings.mass.cueRegistered,
  massReached:findings.mass.cueReached,massMissingCue:findings.mass.unownedText,
  massUnreachable:findings.mass.cueUnreachable,prayRoutes:findings.prayer.routesChecked,
  needsFurtherEntry:findings.prayer.routes?.filter(x=>x.status==="needs-deeper-reader-entry").map(x=>x.id)||[],
  errors:findings.errors
 }));
}
