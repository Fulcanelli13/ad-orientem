// Read-only field acceptance: measure actual rubric/title/Schola visibility
// across *all* curated ordinary Sung LIVE prayer cards on mobile Chromium.
// No form/rubric/chant data modified. Do not conflate this with a physical Mass.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".woff2":"font/woff2",".webmanifest":"application/manifest+json"};
const srv=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const filename=resolve(root,"."+p);
  if(filename!==root&&!filename.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(filename);
  res.writeHead(200,{"content-type":mime[extname(filename)]??"application/octet-stream",
    "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{srv.once("error",no);srv.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1});
 const page=await context.newPage(),errors=[];
 page.on("pageerror",e=>errors.push(String(e.message??e)));
 await page.goto("http://127.0.0.1:"+srv.address().port+
   "/tests/fixtures/reader-phone-harness.html?aoLiveCards=65&production=1&lang=en",
   {waitUntil:"networkidle",timeout:60000});
 await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
   null,{timeout:40000});
 const model=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.cards.map(card=>({
   sequence:card.sequence,title:card.title,source:card.sourceSectionId??card.sectionId,
   sourceCueIds:[...new Set(card.paragraphs.flatMap(p=>p.sourceCueIds??[]))],
   paragraphCount:card.paragraphs.length,
 })));
 const results=[];
 for(const item of model){
  const shown=await page.evaluate(seq=>window.__AO_PHONE_PREVIEW.showSequence(seq)?.sectionId??null,
    item.sequence);
  if(!shown){results.push({...item,hidden:true});continue}
  await page.evaluate(()=>new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok))));
  const ui=await page.evaluate(()=>{
   const root=document.querySelector("#ao-r17-native-reader-preview");
   const nodes=[...root.querySelectorAll(".ao-reader-paragraph")];
   const visible=el=>el&&getComputedStyle(el).display!=="none"&&
      getComputedStyle(el).visibility!=="hidden"&&el.getBoundingClientRect().height>0;
   const live=[...root.querySelectorAll(".ao-live-inline-rubrics")].filter(visible);
   const rubricRows=nodes.filter(n=>n.dataset.kind==="RUBRIC"&&visible(n));
   const sourceRubrics=[...root.querySelectorAll("[data-rubric-id]")].filter(visible);
   const title=root.querySelector('[data-role="section-title"]');
   const priest=root.querySelector('[data-channel="priest-action"]');
   const schola=root.querySelector(".ao-schola-dock");
   return {
    titleText:title?.textContent?.trim()??null,
    titleClamp:getComputedStyle(title)?.webkitLineClamp??null,
    inlineRubricCount:live.length,inlineRubricEventIds:sourceRubrics.map(n=>n.dataset.rubricId),
    sourceRubricRows:rubricRows.length,
    rubricText:[...live,...rubricRows].slice(0,3).map(n=>n.textContent?.trim().slice(0,180)),
    prayerRowCount:nodes.filter(visible).length,
    voice:root.dataset.r17OwnerPriestVoice??null,
    posture:root.dataset.r17OwnerPosture??null,
    scholaVisibility:schola?.dataset.active??null,
    scrollable:(root.querySelector(".ao-prayer-card")?.scrollHeight??0)>
      (root.querySelector(".ao-prayer-card")?.clientHeight??0)+10,
    horizOverflow:root.scrollWidth>root.clientWidth+2,
    priestVisible:!!priest&&visible(priest),
   };
  });
  results.push({...item,hidden:false,...ui});
 }
 const visible=results.filter(x=>!x.hidden),hidden=results.filter(x=>x.hidden);
 const withInline=visible.filter(x=>x.inlineRubricCount>0);
 const withAny=visible.filter(x=>x.inlineRubricCount>0||x.sourceRubricRows>0);
 const allEvents=[...new Set(visible.flatMap(x=>x.inlineRubricEventIds))];
 const snapshots=visible.filter(x=>/Sanctus|Benedictus|Consecration|Secret Prayer|Postcommunion|Confiteor|Introit|Alleluia|Communion Antiphon|Final Blessing/i.test(x.title))
   .map(x=>({card:x.sequence,title:x.title,paragraphs:x.paragraphCount,inline:x.inlineRubricCount,
    explicit:x.sourceRubricRows,rubricIDs:x.inlineRubricEventIds,schola:x.scholaVisibility,
    titleActual:x.titleText,scrollable:x.scrollable}));
 const assessment={
  view:"production entry through phone harness",total:model.length,visible:visible.length,
  hidden:hidden.map(x=>x.title),
  sourceCueIds: new Set(visible.flatMap(x=>x.sourceCueIds)).size,
  cardsWithInlineRubrics:withInline.length,cardsWithAnyRubrics:withAny.length,
  cardsWithoutAnyRubrics:visible.length-withAny.length,
  visibleRubricEventIds:allEvents.length,
  totalDisplayedRubricInstances:visible.reduce((sum,x)=>sum+x.inlineRubricEventIds.length,0),
  namedCardTitles:visible.filter(x=>x.titleText===x.title).length,
  overflows:visible.filter(x=>x.horizOverflow).map(x=>x.title),
  longTitles:visible.filter(x=>x.title.length>=42).map(x=>x.title),
  areaSnapshots:snapshots,
  noRubricCards:visible.filter(x=>x.inlineRubricCount===0&&x.sourceRubricRows===0)
    .map(x=>x.title),
  errors
 };
 console.log("MASS_LIVE_FIELD_COVERAGE_AUDIT="+JSON.stringify(assessment));
 assert.ok(visible.length>=60&&visible.length<=67);
 assert.deepEqual(errors,[]);
 console.log("PASS all 65 presentation cards inspected, audit only; no claim of physical handset or liturgical fidelity");
 await context.close();
}finally{
 await browser?.close();
 await new Promise(ok=>srv.close(ok));
}
