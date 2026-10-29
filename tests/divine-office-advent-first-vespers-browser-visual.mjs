/**
 * Research-only actual Chromium rendering and controls acceptance:
 * Advent I 2026 First Vespers, not part of public app routing.
 *
 * Tests original bounded LA/EN/FR pinned section fixtures in a REAL browser
 * with a local static HTTP origin. Writes genuine 390px/1440px/320px PNGs
 * and a JSON receipt. No fake HTML/screenshots and no publishing privileges.
 *
 * Optional AO_OFFICE_LIVE_SOURCES=1 performs an additional full unmocked
 * raw.githubusercontent.com CORS/source read to prove real delivery.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {readFileSync} from "node:fs";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";

const ROOT=resolve(fileURLToPath(new URL("..",import.meta.url)));
const OUT=resolve(ROOT,"artifacts/divine-office-advent-i-preview");
await mkdir(OUT,{recursive:true});
const fixtures={};
for(const lang of ["la","en","fr"]){
 fixtures[lang]=JSON.parse(readFileSync(new URL(
  "../tests/fixtures/office/advent-i-preview-"+lang+".json",import.meta.url),"utf8"));
 assert.equal(fixtures[lang].revision,PIN);
}
const complineFixtures={};
for(const lang of ["la","en","fr"]){
 complineFixtures[lang]=JSON.parse(readFileSync(new URL(
  "../tests/fixtures/office/advent-i-saturday-compline-"+lang+".json",
  import.meta.url),"utf8"));
 assert.equal(complineFixtures[lang].sourceRevision,PIN);
}
const ordinary=readFileSync(new URL(
 "../tests/fixtures/office/advent-i-preview-ordinary.txt",import.meta.url),"utf8");
const witness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-universal-commemoration.json",
 import.meta.url),"utf8"));
assert.equal(witness.calendarScope,"UNIVERSAL_ONLY");
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".txt":"text/plain; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(ROOT,"."+p);
  if(file!==ROOT&&!file.startsWith(ROOT+sep)){
   res.writeHead(403);res.end("forbidden");return;
  }
  const content=await readFile(file);
  res.writeHead(200,{"content-type":MIME[extname(file)]??"application/octet-stream",
   "cache-control":"no-store","x-content-type-options":"nosniff"});
  res.end(content);
 }catch(error){
  res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));
 }
});
await new Promise((done,reject)=>{
 server.once("error",reject);
 server.listen(0,"127.0.0.1",done);
});
const port=server.address().port;
const PREVIEW_URL="http://127.0.0.1:"+port+"/previews/advent-i-first-vespers-2026-research.html";
const SOURCE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
const LOCALE={Latin:"la",English:"en",Francais:"fr"};
function originalSourceFixture(url){
 if(!url.startsWith(SOURCE))throw Error("OFFICE_VISUAL_NON_PINNED_SOURCE_URL");
 const path=decodeURIComponent(url.slice(SOURCE.length));
 if(path==="Ordinarium/Vespera.txt")return ordinary;
 const m=/^(Latin|English|Francais)\/(.+)\.txt$/u.exec(path);
 if(!m)throw Error("OFFICE_VISUAL_UNKNOWN_SOURCE_URL:"+path);
 const lang=LOCALE[m[1]],id=m[2],f=fixtures[lang];
 if(Object.hasOwn(f.leaves,id))return f.leaves[id];
 const cf=complineFixtures[lang];
 const pm=/^Psalterium\/Psalmorum\/Psalm(87|102|233)$/u.exec(id);
 if(pm&&cf.psalms[pm[1]])return cf.psalms[pm[1]];
 const sections={...(f.sections[id]??{}),...(cf.sections[id]??{})};
 if(!Object.keys(sections).length)
  throw Error("OFFICE_VISUAL_SOURCE_NOT_IN_FINITE_FIXTURE:"+path);
 return Object.entries(sections)
  .map(([name,lines])=>"["+name+"]\n"+lines.join("\n"))
  .join("\n\n")+"\n";

}
const receipt={schema:"ao.office.2026-advent-i-visual-acceptance.v1",
 pinnedRevision:PIN,scenarios:[],screenshots:[],
 publicRouteEnabled:false,independent1961Certification:false,
 publication:false,success:false};
let browser;
function record(name,attrs){receipt.scenarios.push({name,...attrs})}
const shot=async(page,name)=>{
 const filename=name+".png";
 await page.screenshot({path:resolve(OUT,filename),
  fullPage:!name.includes("-focus-"),animations:"disabled"});
 receipt.screenshots.push(filename);
};
const finish=async()=>{
 await writeFile(resolve(OUT,"acceptance-receipt.json"),
  JSON.stringify(receipt,null,2)+"\n");
};
async function mockSources(page,{omitFrenchCollect=false}={}){
 const hit=new Set();
 await page.route("https://raw.githubusercontent.com/**",async route=>{
  const url=route.request().url();
  let source;
  try{source=originalSourceFixture(url)}
  catch(error){
   await route.fulfill({status:404,
    headers:{"access-control-allow-origin":"*"},
    body:String(error?.message??error)});return;
  }
  hit.add(url);
  if(omitFrenchCollect&&url.includes("/Francais/Tempora/Adv1-0.txt")){
   source=source.replace(/^\[Oratio\][\s\S]*?(?=\n\[[^\]]+\]|$)/mu,"");
  }
  await route.fulfill({status:200,
   headers:{"content-type":"text/plain;charset=utf-8",
    "access-control-allow-origin":"*"},
   body:source});
 });
 return hit;
}
function watchErrors(page){
 const errors=[];
 page.on("pageerror",e=>errors.push(String(e?.message??e)));
 return errors;
}
async function awaitReader(page){
 await page.goto(PREVIEW_URL,{waitUntil:"domcontentloaded",timeout:45000});
 await page.waitForFunction(()=>{
  const reader=document.querySelector("#reader");
  const status=document.querySelector("#status");
  return reader?.hidden===false||status?.classList.contains("error");
 },null,{timeout:30000});
 if(await page.locator("#status").evaluate(x=>x.classList.contains("error"))){
  const why=await page.locator("#status").innerText();
  await shot(page,"00-private-preview-fail-closed-diagnostic");
  throw Error("OFFICE_BROWSER_SOURCE_ASSEMBLY_WITHHELD:"+why);
 }
 await page.locator("#reader").waitFor({state:"visible",timeout:5000});
 await assertSourcePreview(page);
}
async function assertMobileNavigationReachable(page){
 const nav=await page.locator(".arrows").evaluate(el=>{
  const bounds=el.getBoundingClientRect();
  const prev=document.getElementById("back").getBoundingClientRect();
  const next=document.getElementById("next").getBoundingClientRect();
  return {
   position:getComputedStyle(el).position,
   top:bounds.top,bottom:bounds.bottom,
   height:window.innerHeight,
   prevLeft:prev.left,nextRight:next.right,width:window.innerWidth,
   nextTop:next.top,nextBottom:next.bottom
  };
 });
 assert.equal(nav.position,"fixed","mobile Next/Previous must stay in sight");
 assert.ok(nav.bottom<=nav.height+2&&nav.bottom>=nav.height-3,
  "navigation bottom is not viewport-anchored: "+JSON.stringify(nav));
 assert.ok(nav.top>=0&&nav.nextTop>=nav.top&&nav.nextBottom<=nav.height,
  "navigation controls are clipped: "+JSON.stringify(nav));
 assert.ok(nav.prevLeft>=0&&nav.nextRight<=nav.width+1,
  "mobile nav has horizontal overflow: "+JSON.stringify(nav));
}
async function assertSourcePreview(page){
 const s=await page.locator("#status").innerText();
 assert.match(s,/Source-first research preview available|Source preview assembled/);
 assert.equal(await page.locator(".guard").innerText(),"Research preview · not published");
 assert.equal(await page.locator("#card .ref").count(),1);
 assert.equal(await page.locator("#bar").count(),1);
 const info=await page.evaluate(()=>({
  horizontalOverflow:document.documentElement.scrollWidth-
   document.documentElement.clientWidth,
  navButtonCount:document.querySelectorAll("#reader nav button").length,
  brand:document.querySelector(".brand")?.textContent??"",
  bodySize:getComputedStyle(document.body).fontSize
 }));
 assert.ok(info.horizontalOverflow<=1,"mobile preview has horizontal overflow: "+JSON.stringify(info));
 assert.equal(info.navButtonCount,7);
 assert.match(info.brand,/Divine Office/);
}
try{
 browser=await chromium.launch({headless:true});
 const mobile=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,
  isMobile:true,hasTouch:true,locale:"en-GB",
  reducedMotion:"reduce"
 });
 const page=await mobile.newPage(),errors=watchErrors(page);
 const requests=[],responses=[],failedRequests=[];
 page.on("request",r=>{if(r.url().startsWith(SOURCE))requests.push(r.url())});
 page.on("response",r=>{if(r.url().startsWith(SOURCE))responses.push({url:r.url(),status:r.status()})});
 page.on("requestfailed",r=>failedRequests.push({
  url:r.url(),failure:r.failure()?.errorText??"unknown"
 }));
 const hits=await mockSources(page);
 try{await awaitReader(page)}
 catch(error){
  throw Error(String(error?.message??error)+"; "+JSON.stringify({
   requests,matchedCount:hits.size,responses,failedRequests,
   pageErrors:errors
  }));
 }
 assert.equal(hits.size,22,"preview fetched unexpected files or duplicated URLs");
 await assertMobileNavigationReachable(page);
 assert.equal(await page.locator("#back").isDisabled(),true);
 assert.equal(await page.locator("#next").isEnabled(),true);
 assert.equal(await page.locator('[data-mode="fr"]').getAttribute("aria-pressed"),"true");
 assert.equal(await page.locator(".columns>div").count(),2);
 assert.equal(await page.locator(".locale").nth(1).innerText(),"FRANÇAIS");
 assert.match(await page.locator("#card").innerText(),/Deus|adjutórium/);
 await shot(page,"01-mobile-390-la-fr-opening");
 await page.locator('[data-mode="en"]').click();
 assert.equal(await page.locator(".locale").nth(1).innerText(),"ENGLISH");
 assert.match(await page.locator("#card").innerText(),/come to my assistance/);
 await shot(page,"02-mobile-390-la-en-opening");
 await page.locator('[data-mode="la"]').click();
 assert.equal(await page.locator(".columns>div").count(),1);
 assert.equal(await page.locator(".locale").first().innerText(),"LATIN");
 await shot(page,"03-mobile-390-la-only");
 await page.locator('[data-mode="fr"]').click();
 await page.locator('[data-view="whole"]').click();
 assert.equal(await page.locator('[data-view="whole"]').getAttribute("aria-pressed"),"true");
 const seenKinds=[],total=55;
 let clicked=0,psalm=false,hymn=false,magnificat=false,collect=false,note=false;
 for(let i=0;i<total;i++){
  const title=await page.locator("#card .card-head h2").innerText();
  const ref=await page.locator("#card .ref").innerText();
  seenKinds.push({title,ref});
  if(!psalm&&/Psalm143/.test(ref)){
   await shot(page,"04-mobile-390-psalm143-la-fr");psalm=true;
  }
  if(!hymn&&/Hymnus Adv Vespera/.test(ref)){
   assert.match(await page.locator("#card").innerText(),/Creátor alme|Créateur des Cieux/);
   await shot(page,"05-mobile-390-hymn-la-fr");hymn=true;
  }
  if(!magnificat&&/LUKE_1_46_55/.test(ref)){
   assert.match(await page.locator("#card").innerText(),/Magníficat/);
   await shot(page,"06-mobile-390-magnificat-la-fr");magnificat=true;
  }
  if(!collect&&/Qui vivis/.test(ref)){
   assert.match(await page.locator("#card").innerText(),/Qui vivis et regnas/);
   await shot(page,"07-mobile-390-collect-ending-la-fr");collect=true;
  }
  if(!note&&/Universal calendar note/i.test(title)){
   assert.match(await page.locator("#card").innerText(),/Local calendars remain unreviewed/);
   await shot(page,"08-mobile-390-calendar-note");note=true;
  }
  if(await page.locator("#next").isDisabled())break;
  await page.locator("#next").click();
  clicked++;
 }
 assert.ok(clicked>25,"insufficient reading cards traversed");
 assert.ok(psalm&&hymn&&magnificat&&collect&&note,
  "essential Office cards not rendered: "+JSON.stringify({psalm,hymn,magnificat,collect,note}));
 assert.equal(await page.locator("#next").isDisabled(),true);
 assert.equal(await page.locator("#back").isEnabled(),true);
 assert.ok(seenKinds.filter(x=>x.ref.includes("Qui vivis")).length===1,
  "collect ending repeated in reader navigation");
 const progress=await page.locator("#bar").evaluate(el=>getComputedStyle(el).width);
 assert.ok(parseFloat(progress)>0);
 await shot(page,"09-mobile-390-final");
 assert.deepEqual(errors,[],"browser JavaScript errors in mobile reader");
 record("390px mobile, trilingual switch, full sequence, card navigation",{
  passed:true,uniqueSourceURLs:hits.size,cardsTraversed:clicked+1,
  containsHymn:hymn,containsMagnificat:magnificat,
  collectConclusionAppearsOnce:true,noHorizontalOverflow:true
 });
 await mobile.close();

 // Separate real Chromium acceptance for the short mobile reading progression.
 // The original 38 source events are NOT replaced: 87 focused steps are
 // derived by splitting only 40 numbered Psalm rows, ten Magnificat verses
 // and the six original hymn stanzas, with no altered or omitted source text.
 const focusMobile=await browser.newContext({
  viewport:{width:390,height:844},deviceScaleFactor:2,
  isMobile:true,hasTouch:true,locale:"en-GB",reducedMotion:"reduce"
 });
 const fp=await focusMobile.newPage(),focusErrors=watchErrors(fp);
 const focusHits=await mockSources(fp);
 await awaitReader(fp);
 assert.equal(await fp.locator('[data-view="focus"]').getAttribute("aria-pressed"),"true");
 assert.equal(await fp.locator("#bar").getAttribute("aria-valuemax"),"87");
 let focusPsalm=0,focusHymn=0,focusCanticle=0,focusEnding=0,focusSteps=0;
 let focusedPsalmShot=false,focusedHymnShot=false,focusedCanticleShot=false;
 for(let i=0;i<90;i++){
  const sourceId=await fp.locator("#card .ref").innerText();
  const cue=await fp.locator("#card .focus-cue").count()?
    await fp.locator("#card .focus-cue").innerText():"";
  const at=await fp.locator("#bar").getAttribute("aria-valuenow");
  if(i%17===0)await assertMobileNavigationReachable(fp);
  assert.equal(Number(at),i+1,"focused progress moved out of sequence");
  if(/Psalm(?:143|144)#/.test(sourceId)){
   focusPsalm++;
   assert.match(cue,/Psalm verse/);
   if(!focusedPsalmShot){
    assert.match(await fp.locator("#card").innerText(),/143:1/);
    const size=await fp.locator("#card").evaluate(el=>el.getBoundingClientRect().height);
    assert.ok(size<844,"single mobile bilingual Psalm verse still exceeds viewport: "+size);
    await shot(fp,"15-focus-mobile-390-psalm-la-fr");
    const origin=cue;
    await fp.locator('[data-mode="en"]').click();
    assert.equal(await fp.locator("#card .focus-cue").innerText(),origin);
    assert.match(await fp.locator("#card").innerText(),/Blessed be the Lord my God/);
    const englishFocus=await fp.locator("#card").evaluate(el=>({
     top:el.getBoundingClientRect().top,
     visibleHeight:window.innerHeight
    }));
    assert.ok(englishFocus.top>=65&&englishFocus.top<englishFocus.visibleHeight/2,
     "language switch abandoned the currently focused verse: "+JSON.stringify(englishFocus));
    await shot(fp,"16-focus-mobile-390-psalm-la-en");
    await fp.locator('[data-mode="fr"]').click();
    focusedPsalmShot=true;
   }
  }
  if(/Hymnus Adv Vespera/.test(sourceId)){
   focusHymn++;
   assert.match(cue,/Stanza/);
   if(!focusedHymnShot){
    await shot(fp,"17-focus-mobile-390-hymn-stanza-la-fr");
    focusedHymnShot=true;
   }
  }
  if(/LUKE_1_46_55/.test(sourceId)){
   focusCanticle++;
   assert.match(cue,/Magnificat verse/);
   if(!focusedCanticleShot){
    await shot(fp,"18-focus-mobile-390-magnificat-verse-la-fr");
    focusedCanticleShot=true;
   }
  }
  if(sourceId.includes("Qui vivis"))focusEnding++;
  assert.ok((await fp.evaluate(()=>document.documentElement.scrollWidth-
   document.documentElement.clientWidth))<=1,"focused verse caused horizontal overflow");
  focusSteps++;
  if(await fp.locator("#next").isDisabled())break;
  await fp.locator("#next").click();
 }
 assert.equal(focusSteps,87);
 assert.equal(focusPsalm,40);
 assert.equal(focusHymn,6);
 assert.equal(focusCanticle,10);
 assert.equal(focusEnding,1);
 assert.equal(focusHits.size,22);
 assert.equal(await fp.locator("#back").isEnabled(),true);
 assert.equal(await fp.locator("#next").isDisabled(),true);
 assert.deepEqual(focusErrors,[]);
 // Switching display mode should preserve the liturgical source EVENT
 // without duplicating, losing or renumbering the prayer.
 await fp.locator('[data-view="whole"]').click();
 assert.equal(await fp.locator("#bar").getAttribute("aria-valuemax"),"38");
 assert.equal(await fp.locator("#next").isDisabled(),true);
 await fp.locator('[data-view="focus"]').click();
 assert.equal(await fp.locator("#bar").getAttribute("aria-valuemax"),"87");
 assert.equal(await fp.locator("#next").isDisabled(),true);
 record("390px phone: 87 source-preserving focused steps, 40 Psalm rows, ten Magnificat verses, six hymn stanzas",{
  passed:true,sourceEvents:38,focusSteps,psalmVerseRows:focusPsalm,
  magnificatVerseRows:focusCanticle,hymnStanzas:focusHymn,
  noMissingTranslations:true,noHorizontalOverflow:true,
  intactSourceCollectEnding:true
 });
 await focusMobile.close();

 const desktop=await browser.newContext({viewport:{width:1440,height:900},
  deviceScaleFactor:1,locale:"en-GB"});
 const dp=await desktop.newPage(),dperrors=watchErrors(dp);
 const dhits=await mockSources(dp);
 await awaitReader(dp);
 await shot(dp,"10-desktop-1440-la-fr-opening");
 await dp.locator('[data-mode="en"]').click();
 await dp.locator("#next").click();
 await shot(dp,"11-desktop-1440-la-en-second-card");
 // The same presentation must work as an honest date/Hour beta shell,
 // never silently displaying Advent Vespers for a different request.
 assert.equal(await dp.locator("#office-date").inputValue(),"2026-11-28");
 assert.equal(await dp.locator("#office-hour").inputValue(),"VESPERS");
 await dp.locator("#office-hour").selectOption("COMPLINE");
 await dp.locator("#reader").waitFor({state:"visible",timeout:35000});
 assert.match(await dp.locator("#office-title").innerText(),/Saturday Compline/);
 assert.match(await dp.locator("#status").innerText(),/Source-first research preview/);
 assert.equal(dhits.size,40,"Saturday Compline must fetch 21 new, finite pinned sources");
 assert.ok(Number(await dp.locator("#bar").getAttribute("aria-valuemax"))>42);
 await shot(dp,"20-desktop-1440-saturday-compline-opening");
 await dp.locator('[data-view="whole"]').click();
 const found=new Set();
 for(let z=0;z<48;z++){
  const title=await dp.locator("#card h2").innerText();
  const source=await dp.locator("#card .ref").innerText();
  if(source.includes("Psalm87")&&!found.has("psalm")){
   found.add("psalm");
   await shot(dp,"21-desktop-1440-compline-psalm87");
  }
  if(source.includes("Mariaant")&&!found.has("marian")){
   found.add("marian");
   await shot(dp,"22-desktop-1440-compline-alma-redemptoris");
  }
  if(await dp.locator("#next").isDisabled())break;
  await dp.locator("#next").click();
 }
 assert.ok(found.has("psalm")&&found.has("marian"));
 assert.equal(await dp.locator("#next").isDisabled(),true);
 await dp.locator('[data-view="focus"]').click();
 await dp.locator("#office-hour").selectOption("VESPERS");
 await dp.locator("#reader").waitFor({state:"visible",timeout:10000);
 await dp.locator("#office-date").fill("2026-11-29");
 await dp.locator("#office-date").dispatchEvent("change");
 assert.equal(await dp.locator("#reader").isHidden(),true);
 assert.match(await dp.locator("#status").innerText(),/Not yet implemented/);
 await dp.locator("#office-date").fill("2026-11-28");
 await dp.locator("#office-date").dispatchEvent("change");
 assert.equal(await dp.locator("#reader").isVisible(),true);
 assert.match(await dp.locator("#card").innerText(),/Alleluia/);
 assert.equal(dhits.size,40,"switching pilots must reuse prior pinned source sessions");
 await shot(dp,"19-desktop-1440-office-beta-date-hour-picker");
 assert.equal(dhits.size,40);
 assert.deepEqual(dperrors,[]);
 record("1440px desktop responsive bilingual layout",{
  passed:true,sourceURLs:dhits.size});
 await desktop.close();

 const narrow=await browser.newContext({viewport:{width:320,height:700},
  deviceScaleFactor:2,isMobile:true,hasTouch:true});
 const np=await narrow.newPage(),nperrors=watchErrors(np);
 await mockSources(np);
 await awaitReader(np);
 await assertMobileNavigationReachable(np);
 assert.ok((await np.evaluate(()=>document.documentElement.scrollWidth-
  document.documentElement.clientWidth))<=1);
 await shot(np,"12-narrow-mobile-320-la-fr-opening");
 assert.deepEqual(nperrors,[]);
 record("320px small-phone no horizontal overflow",{passed:true});
 await narrow.close();

 const bad=await browser.newContext({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true});
 const bp=await bad.newPage(),berrors=watchErrors(bp);
 await mockSources(bp,{omitFrenchCollect:true});
 await bp.goto(PREVIEW_URL,{waitUntil:"domcontentloaded",timeout:45000});
 await bp.locator("#status.error").waitFor({state:"visible",timeout:45000});
 assert.equal(await bp.locator("#reader").isHidden(),true);
 assert.match(await bp.locator("#status").innerText(),/Source preview withheld/);
 await shot(bp,"13-mobile-390-missing-french-fail-closed");
 assert.deepEqual(berrors,[]);
 record("missing French collect blocks all prayer cards",{passed:true});
 await bad.close();

 if(process.env.AO_OFFICE_LIVE_SOURCES==="1"){
  const live=await browser.newContext({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true});
  const lp=await live.newPage(),liveErrors=watchErrors(lp);
  const failures=[];
  lp.on("requestfailed",req=>failures.push({
   url:req.url(),error:req.failure()?.errorText??"unknown"}));
  await lp.goto(PREVIEW_URL,{waitUntil:"domcontentloaded",timeout:45000});
  try{
   await lp.locator("#reader").waitFor({state:"visible",timeout:90000});
   assert.match(await lp.locator("#status").innerText(),/Source-first research preview available|Source preview assembled/);
   await shot(lp,"14-mobile-390-live-pinned-sources");
   await lp.locator("#office-hour").selectOption("COMPLINE");
   await lp.locator("#reader").waitFor({state:"visible",timeout:90000});
   assert.match(await lp.locator("#office-title").innerText(),/Saturday Compline/);
   await shot(lp,"23-mobile-390-live-saturday-compline-sources");

   assert.deepEqual(liveErrors,[]);
   record("real browser pinned source URL/CORS delivery",{
    passed:true,live:true,networkFailures:failures});
  }catch(error){
   await shot(lp,"14-mobile-390-live-source-blocked");
   record("real browser pinned source URL/CORS delivery",{
    passed:false,live:true,errors:liveErrors,networkFailures:failures,
    status:await lp.locator("#status").innerText()});
   throw error;
  }finally{await live.close()}
 }
 receipt.success=true;
 console.log("OFFICE_FIRST_VESPERS_BROWSER_ACCEPTANCE",JSON.stringify({
  screenshots:receipt.screenshots.length,scenarios:receipt.scenarios.length,
  liveChecked:process.env.AO_OFFICE_LIVE_SOURCES==="1",
  status:"PASS_NO_PUBLICATION"}));
}catch(error){
 receipt.failure=String(error?.stack??error);
 throw error;
}finally{
 await finish();
 await browser?.close();
 await new Promise(done=>server.close(done));
}
