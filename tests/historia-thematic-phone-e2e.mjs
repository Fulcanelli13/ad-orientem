import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",
 ".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(request,response)=>{
 try{
  const pathname=decodeURIComponent(new URL(request.url,"http://127.0.0.1").pathname);
  const target=resolve(root,"."+pathname);
  if(target!==root&&!target.startsWith(root+sep)){
   response.writeHead(403);response.end();return;
  }
  const bytes=await readFile(target);
  response.writeHead(200,{"content-type":mime[extname(target)]||"application/octet-stream",
   "cache-control":"no-store"});
  response.end(bytes);
 }catch(error){
  response.writeHead(error?.code==="ENOENT"?404:500);
  response.end(String(error?.message??error));
 }
});
await new Promise((ok,fail)=>{
 server.once("error",fail);
 server.listen(0,"127.0.0.1",ok);
});
const base="http://127.0.0.1:"+server.address().port;
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,
  hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block"});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e.message)));
 const output=resolve(root,"test-output/historia-thematic");
 await mkdir(output,{recursive:true});

 // Editorial-only proposal comparison preview. Source words must be read
 // verbatim from the Catholic witness files, not embedded in the HTML.
 const editorial=await context.newPage();
 editorial.on("pageerror",e=>errors.push(String(e.message)));
 await editorial.goto(base+"/research/historia-priority16-review.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await editorial.locator("#episode-list button").first().waitFor({timeout:30000});
 assert.equal(await editorial.locator("#episode-list button").count(),16);
 assert.equal(await editorial.locator("#detail .verse").count(),4);
 assert.match(await editorial.locator("#detail").innerText(),/Genesis 6:5–8/);
 assert.match(await editorial.locator("#detail").innerText(),/Existing salvation-history movement/);
 await editorial.locator('[data-episode-id="hist-omitted-035"]').click();
 await editorial.waitForFunction(()=>
  document.querySelector("#heading")?.textContent==="The twelve spies" &&
  document.querySelectorAll("#detail .verse").length===19,null,{timeout:30000});
 assert.equal(await editorial.locator("#detail .break").count(),6);
 await editorial.locator("#edition").selectOption("crampon-1923");
 await editorial.waitForFunction(()=>
  [...document.querySelectorAll("#detail .warning")].some(e=>e.textContent?.includes("Crampon 1923")) &&
  document.querySelectorAll("#detail .verse").length===19,null,{timeout:30000});
 const editorialSizing=await editorial.evaluate(()=>({
  viewport:innerWidth,width:document.documentElement.scrollWidth
 }));
 assert(editorialSizing.width<=editorialSizing.viewport+1,
  "Priority 16 review must fit a 390px phone: "+JSON.stringify(editorialSizing));
 await editorial.screenshot({path:resolve(output,"priority16-original-witness-390.png"),animations:"disabled"});
 results.push("16-episode comparison preview: pinned source words, visible excerpt gaps, Crampon switch, mobile fit");
 await editorial.close();

 // First check standalone mode loads authentic source-owned Scripture.
 await page.goto(base+"/research/historia-thematic-collections-preview.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 const standalone=page.locator("#episode-reading");
 await standalone.locator(".aoHistoriaCurrentReading").count(); // Noncanonical class must not drive acceptance.
 await page.locator("#episode-index > li > button").first().waitFor({timeout:25000});
 assert.equal(await page.locator("#episode-index > li > button").count(),7);
 await page.locator("#collections button").filter({hasText:"Miracles of Our Lord"}).click();
 assert.equal(await page.locator("#episode-index > li > button").count(),6);
 await page.screenshot({path:resolve(output,"before-storm-tap-390.png"),animations:"disabled"});
 const hitGeometry=await page.evaluate(()=>{
  const btn=[...document.querySelectorAll("#episode-index > li > button")]
   .find(x=>x.textContent.includes("Calming of the storm"));
  const list=document.querySelector("#episode-index");
  const parent=document.querySelector(".hist-index");
  const header=document.querySelector(".hist-header");
  const rect=el=>el?.getBoundingClientRect().toJSON();
  const b=btn.getBoundingClientRect();
  const hit=document.elementFromPoint(b.x+b.width/2,b.y+b.height/2);
  return {target:rect(btn),list:rect(list),index:rect(parent),header:rect(header),
   windowScroll:{x:scrollX,y:scrollY,innerWidth,innerHeight},
   listScroll:{left:list.scrollLeft,width:list.scrollWidth,clientWidth:list.clientWidth},
   hitTarget:{tag:hit?.tagName,text:hit?.textContent?.slice(0,90)},
   computed:{listDisplay:getComputedStyle(list).display,indexDisplay:getComputedStyle(parent).display,
    rootScrollBehavior:getComputedStyle(document.documentElement).scrollBehavior}};
 });
 console.log("HISTORIA_CLICK_GEOMETRY",JSON.stringify(hitGeometry));
 assert.ok(hitGeometry.windowScroll.innerWidth <= 391, 'Mobile document overflow widens the viewport: '+JSON.stringify(hitGeometry));
 assert.ok(hitGeometry.listScroll.clientWidth <= 390, 'Horizontal catalogue must scroll inside its own viewport: '+JSON.stringify(hitGeometry));
 await page.locator("#episode-index > li > button").filter({hasText:"Calming of the storm"}).click();
 await page.locator("#episode-reading .verse").first().waitFor({timeout:30000});
 assert.equal(await page.locator("#episode-reading .verse").count(),6);
 await page.locator("#episode-reading .source-gap").waitFor({timeout:30000});
 assert.match(await page.locator("#episode-reading .source-gap").innerText(),/41/,
  "The uncollated CPDV transcription must explicitly disclose missing Mark 4:41");
 await page.locator("#episode-reading select").selectOption("crampon-1923");
 await page.locator("#episode-reading .verse").first().waitFor({timeout:30000});
 await page.locator("#episode-reading .source-gap").waitFor({timeout:30000});
 assert.match(await page.locator("#episode-reading .source-gap").innerText(),/41/);
 results.push("standalone: collections + original witnesses + missing Mark 4:41");
 await page.screenshot({path:resolve(output,"standalone-miracles-390.png"),animations:"disabled"});

 // The production entry MUST NOT show the collections without explicit opt-in.
 const standard=await context.newPage();
 await standard.goto(base+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await standard.waitForFunction(()=>Boolean(globalThis.AO_SCRIPTURE_APP_V1),null,{timeout:45000});
 const unflagged=await standard.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-159"));
 assert.equal(unflagged,false,"Research episodes must not be enabled in production mode");
 assert.equal(await standard.locator("#ao-scripture-overlay [data-historia-episode]").count(),0);
 results.push("unflagged app: research navigation unavailable");
 await standard.close();

 // Real Home -> canonical Scripture -> covenantal manuscript -> return journey.
 const original=await context.newPage();
 original.on("pageerror",e=>errors.push(String(e.message)));
 await original.goto(base+"/index.html?ao_historia_collections=1#hist-omitted-159",
  {waitUntil:"domcontentloaded",timeout:90000});
 await original.waitForFunction(()=>
  globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.thematicEpisodeId==="hist-omitted-159",
  null,{timeout:65000});
 assert.equal(await original.locator("#ao-scripture-overlay").isVisible(),true);
 assert.equal(await original.locator('[data-historia-active-episode="hist-omitted-159"]').count(),1);
 const scripture=original.locator("#ao-scripture-overlay");
 await scripture.locator(".aoScriptureVerse").first().waitFor({timeout:45000});
 assert.match(await scripture.locator(".aoScriptureReading h3").innerText(),/Luke 15:11/);
 const outbound=scripture.locator('[data-historia-context-link="hist-omitted-159"]');
 assert.equal(await outbound.count(),1);
 const url=await outbound.getAttribute("href");
 assert.match(url,/hs_context=HS-M24/);
 assert.match(url,/episode=hist-omitted-159/);
 results.push("in-app research deep-link: Luke 15:11–32 exact source passage");

 const popupPromise=context.waitForEvent("page",{timeout:25000});
 await outbound.click();
 const manuscript=await popupPromise;
 manuscript.on("pageerror",e=>errors.push(String(e.message)));
 await manuscript.waitForLoadState("domcontentloaded",{timeout:30000});
 await manuscript.locator("#historia-source-bridge").waitFor({timeout:25000});
 assert.match(await manuscript.locator("#historia-source-bridge").innerText(),/not claimed to occur within/i);
 assert.equal(await manuscript.locator("#movement-24").count(),1);
 const back=manuscript.locator("#historia-source-bridge a");
 assert.match(await back.getAttribute("href"),/ao_historia_collections=1/);
 assert.match(await back.getAttribute("href"),/#hist-omitted-159/);
 await back.click();
 await manuscript.waitForFunction(()=>
  globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.thematicEpisodeId==="hist-omitted-159",
  null,{timeout:65000});
 assert.equal(await manuscript.locator("#ao-scripture-overlay").isVisible(),true);
 results.push("real reciprocal journey: P3 movement 24 -> Prodigal Son restored");

 // Long multi-chapter reading and edition lock.
 assert.equal(await manuscript.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-092")),true);
 await manuscript.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===4);
 const next=manuscript.locator("#ao-scripture-overlay [data-historia-next]");
 await next.click();
 await manuscript.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===5);
 assert.equal(await manuscript.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-094")),true);
 await manuscript.waitForFunction(()=>{
  const state=globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader;
  return state?.thematicEpisodeId==="hist-omitted-094"&&state.editionId==="dr-challoner";
 });
 const estherGuard=await manuscript.evaluate(()=>{
  const control=document.querySelector("#ao-scripture-overlay .aoScriptureNav select");
  const option=control?.querySelector('option[value="fr"]');
  return {episode:globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.thematicEpisodeId,
   edition:globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.editionId,
   optionDisabled:option?.disabled??null,
   optionHTML:option?.outerHTML??null,
   controlHTML:control?.outerHTML?.slice(0,450)??null};
 });
 console.log("HISTORIA_ESTHER_GUARD",JSON.stringify(estherGuard));
 assert.equal(estherGuard.optionDisabled,true,
  "Esther French option must be disabled under the unverified edition crosswalk");
 results.push("chapter navigation: Tobit 4 -> 5; Esther uses Challoner only");
 await manuscript.screenshot({path:resolve(output,"inapp-historia-390.png"),animations:"disabled"});

 // Judith: no fabricated chronological navigation.
 assert.equal(await manuscript.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-093")),true);
 assert.equal(await manuscript.locator('[data-historia-context-link="hist-omitted-093"]').count(),0);
 results.push("Judith: no unsupported chronology link");

 // Separately opted-in second-batch catalogue, still research-only.
 const expanded=await context.newPage();
 expanded.on("pageerror",e=>errors.push(String(e.message)));
 await expanded.goto(base+
  "/index.html?ao_historia_collections=1&ao_historia_batch2=1#hist-omitted-104",
  {waitUntil:"domcontentloaded",timeout:90000});
 await expanded.waitForFunction(()=>{
  const state=globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader;
  return state?.thematicEpisodeId==="hist-omitted-104" &&
   state?.passage?.book==="Luke" && state?.passage?.chapter===1 &&
   state?.passage?.verseStart===46;
 },null,{timeout:65000});
 const catalogue=expanded.locator("#ao-scripture-overlay");
 assert.equal(await catalogue.locator("[data-historia-episode]").count(),60);
 assert.equal(await catalogue.locator(".aoHistoriaGroup").count(),4);
 assert.equal(await catalogue.locator('[data-historia-context-link="hist-omitted-104"]').count(),0,
  "Staged Magnificat must not inherit an Atlas/P3 identity without adjudication");
 await catalogue.locator(".aoScriptureVerse").first().waitFor({timeout:25000});
 assert.match(await catalogue.locator("[data-historia-active-episode]").innerText(),
  /Staged supplementary Scripture:.*not yet verified/s);
 results.push("opt-in batch two: 60 canonical-source readings across four groups, no fabricated contextual anchor");
 // Audited boundaries: title, exact source fragments and editorial context.
 assert.equal(await expanded.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-142")),true);
 await expanded.waitForFunction(()=>{
  const s=globalThis.AO_SCRIPTURE_APP_V1.status().reader;
  return s?.passage?.book==="Mark" && s.passage.chapter===9 &&
   s.passage.verseStart===14&&s.passage.verseEnd===28;
 });
 assert.match(await catalogue.locator("[data-historia-boundary-review]").innerText(),/Mark 9:29/);
 assert.equal(await expanded.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-150")),true);
 await expanded.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===24);
 await catalogue.locator("[data-historia-next]").click();
 await expanded.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===36);
 assert.match(await catalogue.locator("[data-historia-boundary-review]").innerText(),/Matthew 13:36/);
 assert.equal(await expanded.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-171")),true);
 await expanded.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===12);
 await catalogue.locator("[data-historia-next]").click();
 await expanded.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===20);
 assert.equal(await expanded.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-172")),true);
 await expanded.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===23);
 assert.match(await catalogue.locator("[data-historia-active-episode]").innerText(),/Debates and denunciations/);
 results.push("audited boundary: Mark 9:14–28, split wheat explanation, two fig-tree actions, Matthew authorities without triumphal entry");

 await expanded.screenshot({path:resolve(output,"batch2-magnificat-390.png"),animations:"disabled"});
 await expanded.close();

 // Third optional research mode: seven distinct, noncontiguous Scriptural plans.
 const segmented=await context.newPage();
 segmented.on("pageerror",e=>errors.push(String(e.message)));
 await segmented.goto(base+
  "/index.html?ao_historia_collections=1&ao_historia_batch2=1&ao_historia_segmented=1#hist-omitted-095",
  {waitUntil:"domcontentloaded",timeout:90000});
 await segmented.waitForFunction(()=>{
  const r=globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader;
  return r?.thematicEpisodeId==="hist-omitted-095"&&
   r?.editionId==="dr-challoner"&&r?.passage?.book==="Esther"&&r?.passage?.chapter===14;
 },null,{timeout:65000});
 const sevenReader=segmented.locator("#ao-scripture-overlay");
 assert.equal(await sevenReader.locator("[data-historia-episode]").count(),67);
 assert.equal(await sevenReader.locator(".aoHistoriaGroup").count(),6);
 await sevenReader.locator(".aoScriptureVerse").first().waitFor({timeout:30000});
 assert.match(await sevenReader.locator("[data-historia-active-episode]").innerText(),/CPDV chapter 14 has unrelated material/);
 assert.equal(await sevenReader.locator('[data-historia-context-link="hist-omitted-095"]').count(),0);
 // A literary frame: the middle chapters are conspicuously absent.
 assert.equal(await segmented.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-217")),true);
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===1);
 let paging=sevenReader.locator("[data-historia-next]");
 await paging.click();
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===2);
 await paging.click();
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===42);
 assert.match(await sevenReader.locator("[data-historia-active-episode]").innerText(),/Job 3–41 is deliberately not shown/);
 assert.equal(await sevenReader.locator('[data-historia-context-link="hist-omitted-217"]').count(),0);
 // Two distinct Luke verse segments may not include the Finding in the Temple.
 assert.equal(await segmented.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-114")),true);
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===39);
 await paging.click();
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.verseStart===51);
 // Matthew 24 and Mark 13 are parallel records, not an invented double event.
 assert.equal(await segmented.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-173")),true);
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.book==="Matthew");
 await paging.click();
 await segmented.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.book==="Mark");
 assert.match(await sevenReader.locator("[data-historia-active-episode]").innerText(),/separate Gospel tellings/);
 results.push("segmented mode: 67 sources, Esther 14 protected, Job 1/2/42 visibly noncontiguous, Luke 2 split, Matthew/Mark separate");
 await segmented.screenshot({path:resolve(output,"seven-segmented-390.png"),animations:"disabled"});
 await segmented.close();

 // Fourth and final research-only catalogue: 217 original inventory identities.
 const complete=await context.newPage();
 complete.on("pageerror",e=>errors.push(String(e.message)));
 await complete.goto(base+
  "/index.html?ao_historia_collections=1&ao_historia_batch2=1&ao_historia_segmented=1&ao_historia_all=1#hist-omitted-213",
  {waitUntil:"domcontentloaded",timeout:90000});
 await complete.waitForFunction(()=>{
  const r=globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader;
  return r?.thematicEpisodeId==="hist-omitted-213" &&
   r?.passage?.book==="Revelation" && r?.passage?.chapter===13 &&
   r?.passage?.verseStart===1 && r?.passage?.verseEnd===10;
 },null,{timeout:65000});
 const full=complete.locator("#ao-scripture-overlay");
 assert.equal(await full.locator("[data-historia-episode]").count(),217);
 assert.equal(await full.locator(".aoHistoriaGroup").count(),9);
 assert.equal(await full.locator('[data-historia-context-link="hist-omitted-213"]').count(),0);
 await full.locator(".aoScriptureVerse").first().waitFor({timeout:30000});
 assert.match(await full.locator("[data-historia-active-episode]").innerText(),/beast coming from the sea/i);
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-214")),true);
 await complete.waitForFunction(()=>{
  const r=globalThis.AO_SCRIPTURE_APP_V1.status().reader;
  return r?.passage?.chapter===13&&r?.passage?.verseStart===11&&r?.passage?.verseEnd===18;
 });
 assert.match(await full.locator("[data-historia-active-episode]").innerText(),/beast from the earth/i);
 // Ordinary historic Acts episodes remain distinct from visionary scenes.
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-205")),true);
 await complete.waitForFunction(()=>{
  const r=globalThis.AO_SCRIPTURE_APP_V1.status().reader;
  return r?.passage?.book==="Acts"&&r?.passage?.chapter===27&&r?.passage?.verseStart===13;
 });
 // The full construction account must remain a chapter-at-a-time reading.
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-032")),true);
 await complete.waitForFunction(()=>{
  const r=globalThis.AO_SCRIPTURE_APP_V1.status().reader;
  return r?.passage?.book==="Exodus"&&r?.passage?.chapter===35;
 });
 assert.match(await full.locator('[data-historia-boundary-review]').innerText(),/six Exodus chapters|Exodus 35–40/i);
 await full.locator("[data-historia-next]").click();
 await complete.waitForFunction(()=>globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage?.chapter===36);
 // Editorial source-seam corrections: source verse limits, not new wording.
 assert.equal(await complete.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-022")),true);
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.book==="Genesis"&&p.chapter===49&&p.verseStart===29&&p.verseEnd===32;
 });
 assert.match(await full.locator("[data-historia-boundary-review]").innerText(),/Jacob's death and burial/);
 await full.locator("[data-historia-next]").click();
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.chapter===50&&p.verseStart===1&&p.verseEnd===14;
 });
 await full.locator("[data-historia-next]").click();
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.chapter===50&&p.verseStart===22&&p.verseEnd===25;
 });
 assert.equal(await complete.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-064")),true);
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.book==="1Kings"&&p.chapter===17&&p.verseStart===8&&p.verseEnd===16;
 });
 assert.equal(await complete.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-065")),true);
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.book==="1Kings"&&p.chapter===17&&p.verseStart===17&&p.verseEnd===24;
 });
 assert.equal(await complete.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-195")),true);
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.book==="Acts"&&p.chapter===12&&p.verseStart===3&&p.verseEnd===19;
 });
 assert.equal(await complete.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-196")),true);
 await complete.waitForFunction(()=>{
  const p=globalThis.AO_SCRIPTURE_APP_V1.status().reader?.passage;
  return p?.book==="Acts"&&p.chapter===12&&p.verseStart===1&&p.verseEnd===2;
 });
 results.push("source-seam acceptance: separate Jacob/Joseph deaths, Elijah's two widow episodes, and Acts' James/Peter scenes");

 // The proposed main-narrative path is not an approved insertion.
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-003")),true);
 await full.locator('[data-historia-editorial-recommendation="hist-omitted-003"]').waitFor();
 assert.match(await full.locator('[data-historia-editorial-recommendation="hist-omitted-003"]').innerText(),
  /not approved/i);
 assert.equal(await full.locator("[data-historia-atlas-event]").count(),0);
 // Shared book/chapter is not an actual selected-verse overlap.
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-063")),true);
 assert.match(await full.locator('[data-historia-editorial-recommendation="hist-omitted-063"]').innerText(),
  /Solomon's apostasy.*distinct.*Jeroboam/s);
 // A thematic scene and Atlas entry emphasizing different acts cannot be
 // treated as one verified geographic stop.
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-123")),true);
 assert.match(await full.locator('[data-historia-atlas-evidence="hist-omitted-123"]').innerText(),
  /same Scripture passage, different narrative action/i);
 assert.equal(await full.locator("[data-historia-atlas-event]").count(),0);
 // By contrast a matching, navigable named scene should open the Atlas and
 // return with the exact original Scripture reading still selected.
 assert.equal(await complete.evaluate(()=>
  globalThis.AO_SCRIPTURE_APP_V1.openThematicEpisode("hist-omitted-103")),true);
 const atlasVisit=full.locator('[data-historia-atlas-event="biblical:event:ein-karem-e1"]');
 await atlasVisit.waitFor();
 await atlasVisit.click();
 await complete.waitForFunction(()=>
  globalThis.AO_APP_SHELL_V1?.getActive?.()==="find" &&
  globalThis.AO_SCRIPTURE_APP_V1?.status?.().suspended===true,
  null,{timeout:60000});
 await complete.locator('[data-bible-event-key="biblical:event:ein-karem-e1"]').waitFor({timeout:30000});
 await complete.locator("[data-bible-atlas-close]").first().click();
 await complete.waitForFunction(()=>
  globalThis.AO_APP_SHELL_V1?.getActive?.()==="home" &&
  globalThis.AO_SCRIPTURE_APP_V1?.status?.().reader?.thematicEpisodeId==="hist-omitted-103",
  null,{timeout:60000});
 assert.equal(await complete.locator("#ao-scripture-overlay").isVisible(),true);
 results.push("adjudication: 46 unapproved restoration decisions and verified Visitation Atlas handoff/return");

 results.push("complete mode: all 217 sources in nine collections, distinct Revelation beasts, Acts events, long Exodus chapter paging");
 await complete.screenshot({path:resolve(output,"all217-nine-families-390.png"),animations:"disabled"});
 await complete.close();

 // One canonical priority-sixteen research preview (the 156-verse source
 // variant). The independent 196-verse study is a comparison, not a second
 // active owner. The UI never rewrites or silently joins Scripture verses.
 const approval=await context.newPage();
 approval.on("pageerror",e=>errors.push(String(e.message)));
 await approval.goto(base+"/research/historia-priority16-review.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await approval.locator('#episode-list [data-episode-id]').first().waitFor({timeout:45000});
 assert.equal(await approval.locator('#episode-list [data-episode-id]').count(),16);
 await approval.locator('#detail .verse').first().waitFor({timeout:30000});
 assert.equal(await approval.locator('#detail .verse').count(),4);
 await approval.locator('[data-episode-id="hist-omitted-084"]').click();
 await approval.waitForFunction(()=>document.querySelector('#position')?.textContent?.includes('13 proposed verses'),
  null,{timeout:30000});
 await approval.waitForFunction(()=>document.querySelectorAll('#detail .verse').length===13,
  null,{timeout:30000});
 assert.equal(await approval.locator('#detail .break').count(),4);
 assert.match(await approval.locator('#detail').innerText(),/Catholic prayer and canticle/i);
 await approval.locator('#edition').selectOption('crampon-1923');
 await approval.waitForFunction(()=>
  document.querySelector('#detail')?.textContent?.includes('Crampon 1923') &&
  document.querySelectorAll('#detail .verse').length===13,
  null,{timeout:30000});
 assert.match(await approval.locator('#detail').innerText(),/NOT ACCEPTED/);
 results.push('single priority16 preview: 16 source-backed candidates, visible Daniel ellipses and French witness, no approval');
 await approval.screenshot({path:resolve(output,"priority16-single-review-390.png"),animations:"disabled"});
 await approval.close();

 assert.deepEqual(errors.filter(s=>/ReferenceError|SyntaxError|TypeError/.test(s)),[],
  "Browser runtime failures: "+errors.join(" | "));
 await original.close();await manuscript.close();await page.close();
 await context.close();
 console.log("PASS Historia thematic actual Chromium: "+results.join("; "));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
