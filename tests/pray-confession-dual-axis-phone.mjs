import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-confession-dual-axis");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),full=resolve(root,"."+name);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4295,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",error=>errors.push(error.message));
 await page.goto("http://127.0.0.1:4295/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 const sel="#aoPray435930.open .aoP435930ConfessionReader";
 const timeline=sel+" .aoDevoSequenceTimeline";
 const open=()=>page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.confession",{returnContext:null}));
 assert.equal(await open(),true);
 assert.equal(await page.locator(sel+" [data-p435930-conf-path]").count(),3);
 assert.equal(await page.locator(timeline).count(),0,"Path chooser is not a prayer card timeline");
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").isDisabled(),true);
 assert.equal(await page.locator(sel+" [data-p435930-since]").count(),0,
  "No free-text time-since-Confession field may appear on the preparation screen");
 assert.equal(await page.locator(sel+" input").count(),0,
  "The private Confession preparation must not collect sensitive free-text answers");
 assert.match(await page.locator(".aoP435930ConfProgressLabel").innerText(),/1 OF 4 · Prepare/i);
 assert.equal(await page.locator("#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button").count(),4,
  "Exactly four source-owned stage segments are required");

 const locale=page.locator("#aoPray435930 .aoP435930SessionLanguage");
 assert.equal(await locale.count(),1,"Confession should share the devotional EN/FR header control");
 assert.equal((await locale.innerText()).trim(),"EN");
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"FR");
 assert.match(await page.locator(".aoP435930ConfProgressLabel").innerText(),/1 SUR 4 · Préparer/i);
 assert.equal(await page.locator(sel+" input").count(),0,
  "Changing language must not expose a sensitive text-entry control");
 assert.match(await page.locator(sel+" [data-p435930-conf-path='regular']").innerText(),/Confession rapide/);
 const visual=page.locator(sel+" .aoPrayerRitualWorkspace .aoPrayerRitualVisual");
 await page.waitForFunction(()=>Number(document.querySelector(
  "#aoPray435930 .aoChurchCinema[data-ao-cinema-kind='confession']")?.dataset.aoCinemaFrames)>2,
  null,{timeout:10000});
 assert.ok(await visual.locator(".aoChurchCinemaWorld .aoChurchFace").count()>150,
  "Confession animation must render a physically modeled church, not only the Murillo painting");
 assert.equal(await visual.locator(".aoChurchCinema").getAttribute("data-ao-cinema-source"),
  "claude-interactive-church-css3d-donor");
 assert.equal(await visual.locator('[data-ao-ritual-art-source="released-murillo-nga"] img').count(),1,
  "Approved Murillo should be the actual full-stage Confession scene, not a duplicate below it");
 assert.equal(await visual.locator(".aoPrayerSceneDoor").evaluate(el=>getComputedStyle(el).display),"none",
  "Painted Confession scene must not expose schematic confessional graphics");
 assert.ok(await visual.locator(".aoPrayerRitualSceneArt figcaption a[href]").count()===1,
  "Released painting needs its original attribution link");
 assert.ok(await visual.locator(".aoPrayerRitualSceneArt img").evaluate(img=>img.complete&&img.naturalWidth>0),
  "Released original artwork did not load in the scene");
 assert.equal(await visual.locator(".aoPrayerRitualSceneArt img").evaluate(img=>getComputedStyle(img).objectFit),"contain",
  "Preserve complete historical painting composition at the 390px Confession scene");
 await page.screenshot({path:resolve(captures,"confession-390-chooser-fr.png"),animations:"disabled"});
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"EN");

 await page.locator(sel+" [data-p435930-conf-path='regular']").tap();
 await page.locator(sel+" [data-p435930-conf-next]").tap();
 await page.waitForSelector(timeline,{timeout:12000});
 // The chapter timeline renders before the paragraph focus projection.
 // Await the actual focused question rather than sampling a transient frame.
 await page.waitForFunction(()=>Boolean(document.querySelector(
   "#aoPray435930.open .aoP435930ConfessionReader .aoDevoCardScroll .aoDevoParagraph[data-ao-devo-active='true']"
 )),null,{timeout:12000});
 const continuous=page.locator(sel+" [data-p435930-conf-reading='continuous']");
 assert.equal(await continuous.count(),1,"The source-owned examination must allow book-style reading");
 await continuous.click();
 const all=page.locator(sel+" [data-ao-confession-continuous='true']");
 assert.equal(await all.count(),1,"Continuous examination must display one natural reading flow");
 assert.equal(await all.locator("[data-ao-confession-source-card]").count(),5,
  "Regular Confession must keep all five source-defined examination sections");
 assert.equal(await all.locator("input,textarea,[contenteditable=true]").count(),0,
  "Continuous examination must not solicit or store sins");
 assert.ok((await all.locator(".aoConfessionContinuousQuestions li").count())>=20,
  "All original regular examination prompts must remain present");
 assert.equal(await page.locator(sel+" .aoDevoCard").count(),0,
  "Continuous reading must not also render the constrained single card");
 await page.screenshot({path:resolve(captures,"confession-390-examination-continuous.png"),animations:"disabled"});
 await page.locator(sel+" [data-p435930-conf-reading='cards']").click();
 // Switching from continuous reading remounts the original source card.
 // Wait for its focus observer, not merely for the card element to exist.
 await page.waitForFunction(()=>Boolean(document.querySelector(
  "#aoPray435930.open .aoP435930ConfessionReader .aoDevoCardScroll .aoDevoParagraph[data-ao-devo-active='true']"
 )),null,{timeout:12000});
 assert.equal(await page.locator(sel+" .aoDevoCard").count(),1,
  "The established source-owned card method must remain available");
 const state=()=>page.evaluate(()=>{
  const shell=document.querySelector("#aoPray435930.open .aoP435930ConfessionReader");
  const card=shell?.querySelector(".aoDevoCard"),scroll=card?.querySelector(".aoDevoCardScroll");
  return {stage:Number(shell?.dataset.aoConfessionSection),index:Number(card?.dataset.aoDevoIndex),
   id:card?.dataset.aoDevoCard,final:shell?.dataset.aoConfessionFinal,
   stops:shell?.querySelectorAll(".aoDevoStop").length||0,
   current:shell?.querySelectorAll(".aoDevoStop[aria-current='step']").length||0,
   active:scroll?.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length||0,
   overflow:scroll?getComputedStyle(scroll).overflowY:null,
   nav:shell?.querySelector(".aoP435930GuideNav")?getComputedStyle(shell.querySelector(".aoP435930GuideNav")).display:null,
   questions:scroll?.querySelectorAll(".aoP435930ConfQuestions li").length||0};
 });
 let st=await state();
 assert.deepEqual({stage:st.stage,id:st.id,stops:st.stops,index:st.index,current:st.current,overflow:st.overflow},
 {stage:1,id:"quick-commandments-1",stops:5,index:0,current:1,overflow:"auto"});
 assert.ok(st.questions>=3&&st.active>=1,"Original examination questions are not focusable paragraphs");
 assert.equal(await page.locator(sel+" .aoDevoCardHead").evaluate(x=>getComputedStyle(x).display),"none",
  "Duplicated numbered examination headline competes with the existing chapter rail");
 const questionContrast=await page.locator(sel+" .aoP435930ConfQuestions li").evaluateAll(
  es=>es.map(x=>Number(getComputedStyle(x).opacity)));
 assert.ok(questionContrast.length>=3&&questionContrast.every(x=>x>=.94),
  "All examination questions must remain readable, not dimmed by paragraph focus: "+JSON.stringify(questionContrast));


 const enExamText=await page.locator(sel+" .aoP435930ConfQuestions").innerText();
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"FR");
 let frState=await state();
 assert.equal(frState.stage,1);assert.equal(frState.id,st.id);
 assert.equal(frState.index,0,"Changing French must not discard the current examination card");
 const frExamText=await page.locator(sel+" .aoP435930ConfQuestions").innerText();
 assert.ok(frExamText.length>20&&frExamText!==enExamText,"French examination must use existing source text");
 const questionFont=await page.locator(sel+" .aoP435930ConfQuestions li").first().evaluate(
  el=>parseFloat(getComputedStyle(el).fontSize));
 const instructionFont=await page.locator(sel+" .aoP435930GuideNow p").first().evaluate(
  el=>parseFloat(getComputedStyle(el).fontSize));
 assert.ok(questionFont>instructionFont+3,"Examination questions must be more salient than directions");
 await page.screenshot({path:resolve(captures,"confession-390-examination-fr.png"),animations:"disabled"});
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"EN");

 assert.equal(st.nav,null,"Interior Confession cards must not render extra Previous/Next controls");
 assert.equal(await page.locator(sel+" [data-p435930-since]").count(),0,"Time-since-Confession input must remain absent");
 assert.match(await page.locator(".aoP435930ConfProgressLabel").innerText(),/2 OF 4 · Examination/i);
 await page.screenshot({path:resolve(captures,"regular-exam-390.png"),animations:"disabled"});
 const swipe=async(dx,dy)=>page.locator(sel+" .aoDevoCardScroll").evaluate((node,{dx,dy})=>{
  const t=(x,y)=>new Touch({identifier:16,target:node,clientX:x,clientY:y});
  node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(210,370)],changedTouches:[t(210,370)]}));
  node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(210+dx,370+dy)]}));
 },{dx,dy});
 await swipe(5,-140);
 assert.equal((await state()).index,0,"Vertical gesture changed the sacramental section");
 await swipe(-160,5);
 const workspace=page.locator(sel+" .aoPrayerRitualWorkspace");
 assert.equal(await workspace.getAttribute("data-ao-ritual-mode"),"text",
  "Horizontal gesture must switch the presentation view");
 assert.equal((await state()).index,0,
  "Horizontal gesture must not advance an examination card");
 await page.locator(timeline+" [data-ao-devo-chapter='1']").tap();
 assert.equal((await state()).index,1,
  "Explicit source timeline still advances a prayer card");
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 st=await state();assert.equal(st.id,"ready");assert.equal(st.final,"true");
 assert.ok(st.nav&&st.nav!=="none","Final examination card must allow explicit transition");
 assert.equal(await page.locator(sel+" [data-p435930-conf-prev]").count(),0);
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),1);
 await page.locator(sel+" [data-p435930-conf-next]").tap();
 st=await state();assert.equal(st.stage,2);assert.equal(st.stops,9);assert.equal(st.id,"at-priest");
 assert.match(await page.locator(sel+" .aoDevoCardScroll").innerText(),/phone away/i);
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),0,
  "Before entering rehearsal starts as a swipe-only card");
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 assert.equal((await state()).id,"contrition-penance");
 assert.equal(await page.locator(sel+" [data-ao-confession-act]").count(),1);
 await page.screenshot({path:resolve(captures,"confession-390-act-of-contrition.png"),animations:"disabled"});
 await page.locator(sel+" [data-p435930-conf-contrition='piusx']").tap();
 assert.equal(await page.locator(sel+" [data-p435930-conf-contrition='piusx']").getAttribute("aria-pressed"),"true","Contrition selection must respond on the actual prayer card");
 await page.locator(sel+" [data-p435930-conf-contrition='standard']").tap();
 assert.equal(await page.locator(sel+" [data-p435930-conf-contrition='standard']").getAttribute("aria-pressed"),"true");
 await page.locator(timeline+" [data-ao-devo-chapter='7']").tap();
 assert.equal((await state()).id,"priest-absolution");
 assert.equal(await page.locator(sel+" [data-ao-confession-latin-excerpt='priest-only']").count(),1);
 await page.screenshot({path:resolve(captures,"confession-390-priest-absolution-guide.png"),animations:"disabled"});
 await page.locator(timeline+" [data-ao-devo-chapter='8']").tap();
 assert.equal((await state()).id,"leave-confessional");
 await page.locator(sel+" [data-p435930-conf-next]").tap();
 st=await state();assert.equal(st.stage,3);assert.equal(st.stops,3);assert.equal(st.id,"thanksgiving");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 st=await state();assert.equal(st.id,"amendment");assert.equal(st.final,"true");
 assert.equal(await page.locator(sel+" [data-p435930-conf-clear]").count(),1);
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),1,
  "Final action must clear session preparation only on explicit exit");
 assert.ok(await page.locator(sel+" .aoP435930ConfSources a[href^='https://www.vatican.va']").count()>=2,
 "Original Vatican doctrinal and canon-law hyperlinks were discarded");
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,"320px Confession overflows document");
 assert.equal((await state()).overflow,"auto");
 await page.screenshot({path:resolve(captures,"after-confession-320.png"),animations:"disabled"});
 // Match the shortest supported phone as well as the roomy 320x720 case.
 // Confession must not regress to horizontal overflow or trapped focus.
 await page.setViewportSize({width:320,height:568});
 const compact=await page.evaluate(()=>{
  const root=document.querySelector("#aoPray435930.open .aoP435930ConfessionReader");
  const current=root?.querySelector(".aoDevoParagraph[data-ao-devo-active='true']");
  const sc=root?.querySelector(".aoDevoCardScroll");
  return {overflow:document.documentElement.scrollWidth-innerWidth,
   hasFocus:!!current,scrollClient:sc?.clientHeight||0,scrollHeight:sc?.scrollHeight||0};
 });
 assert.ok(compact.overflow<=1,"Confession overflows 320x568: "+JSON.stringify(compact));
 assert.ok(compact.hasFocus,"Confession loses active paragraph on 320x568");
 assert.ok(compact.scrollClient>0,"Confession reading region collapsed on 320x568");
 assert.equal(await page.locator(sel+" .aoPrayerRitualWorkspace[data-ao-ritual-mode='text'] .aoPrayerRitualSceneArt").evaluate(el=>getComputedStyle(el).visibility),"hidden",
   "320px Text view should not squeeze the painting and source credit into an illegible thumbnail");
 await page.screenshot({path:resolve(captures,"after-confession-320x568.png"),animations:"disabled"});
 // Restart clears session-local path; never save, mark, type or check off sins.
 await open();
 assert.equal(await page.locator(sel+" [data-p435930-conf-path][aria-pressed='true']").count(),0);
 for(const [path,count,id] of [["returning",13,"return-priest"],["general",14,"general-scope"]]){
  await page.locator(sel+" [data-p435930-conf-path='"+path+"']").tap();
  await page.locator(sel+" [data-p435930-conf-next]").tap();
  await page.waitForSelector(timeline);
  await page.waitForFunction(()=>document.querySelector(
   "#aoPray435930.open .aoP435930ConfessionReader .aoDevoCardScroll .aoDevoParagraph[data-ao-devo-active='true']"
  )!==null,null,{timeout:8000});
  const x=await state();
  assert.equal(x.stops,count);assert.equal(x.id,id);assert.ok(x.active>=1,
   "Canonical exam step has no illuminated paragraph after paint");
  assert.equal(await page.locator(sel+" .aoP435930ConfOneCard input").count(),0,"Never record answers to examination questions");
  if(path==="returning"){
    await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
    assert.equal(await page.locator(sel+" .aoP435930ConfQuestions li").count(),7,"Extended commandment must preserve two original prompts and five additions");
    await page.screenshot({path:resolve(captures,"returning-expanded-examination-320.png"),animations:"disabled"});
  }
  await open();
 }
 assert.deepEqual(errors,[],"Browser errors: "+errors.join(" | "));
 console.log("PASS 390/320px Confession: 5/13/14 source examination steps, 9+3 rite/after, local gestures, consent and session privacy");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
