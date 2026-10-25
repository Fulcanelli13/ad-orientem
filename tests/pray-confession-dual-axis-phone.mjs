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
 assert.equal(await page.locator(sel+" [data-p435930-since]").count(),1,
  "Only the optional time since last Confession belongs in the preparation screen");
 assert.equal(await page.locator(sel+" input").count(),1,"Confession screen collects sensitive sin answers");

 const locale=page.locator("#aoPray435930 .aoP435930SessionLanguage");
 assert.equal(await locale.count(),1,"Confession should share the devotional EN/FR header control");
 assert.equal((await locale.innerText()).trim(),"EN");
 await page.locator(sel+" [data-p435930-since]").fill("three weeks");
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"FR");
 assert.equal(await page.locator(sel+" [data-p435930-since]").inputValue(),"three weeks",
  "Switching language may not discard the private session-only time estimate");
 assert.match(await page.locator(sel+" [data-p435930-conf-path='regular']").innerText(),/Confession rapide/);
 await page.screenshot({path:resolve(captures,"confession-390-chooser-fr.png"),animations:"disabled"});
 await locale.click();
 assert.equal((await locale.innerText()).trim(),"EN");

 await page.locator(sel+" [data-p435930-conf-path='regular']").tap();
 await page.locator(sel+" [data-p435930-conf-next]").tap();
 await page.waitForSelector(timeline,{timeout:12000});
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
 assert.equal(await page.locator(sel+" [data-p435930-since]").count(),0,"Time estimate must not follow user into examination");
 await page.screenshot({path:resolve(captures,"regular-exam-390.png"),animations:"disabled"});
 const swipe=async(dx,dy)=>page.locator(sel+" .aoDevoCardScroll").evaluate((node,{dx,dy})=>{
  const t=(x,y)=>new Touch({identifier:16,target:node,clientX:x,clientY:y});
  node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(210,370)],changedTouches:[t(210,370)]}));
  node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(210+dx,370+dy)]}));
 },{dx,dy});
 await swipe(5,-140);
 assert.equal((await state()).index,0,"Vertical gesture changed the sacramental section");
 await swipe(-160,5);
 assert.equal((await state()).index,1,"Horizontal gesture did not move exactly one card");
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 st=await state();assert.equal(st.id,"ready");assert.equal(st.final,"true");
 assert.ok(st.nav&&st.nav!=="none","Final examination card must allow explicit transition");
 assert.equal(await page.locator(sel+" [data-p435930-conf-prev]").count(),0);
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),1);
 await page.locator(sel+" [data-p435930-conf-next]").tap();
 st=await state();assert.equal(st.stage,2);assert.equal(st.stops,3);assert.equal(st.id,"at-priest");
 assert.match(await page.locator(sel+" .aoDevoCardScroll").innerText(),/phone away/i);
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),0,
  "Before entering rehearsal starts as a swipe-only card");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 assert.equal((await state()).id,"contrition-penance");
 await page.locator(sel+" [data-p435930-conf-next]").tap();
 st=await state();assert.equal(st.stage,3);assert.equal(st.stops,3);assert.equal(st.id,"thanksgiving");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 st=await state();assert.equal(st.id,"amendment");assert.equal(st.final,"true");
 assert.equal(await page.locator(sel+" [data-p435930-conf-clear]").count(),1);
 assert.equal(await page.locator(sel+" [data-p435930-conf-next]").count(),1,
  "Final action must clear session preparation only on explicit exit");
 assert.equal(await page.locator(sel+" .aoP435930ConfSources a[href^='https://www.vatican.va']").count(),2,
 "Catholic doctrinal hyperlinks were discarded");
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,"320px Confession overflows document");
 assert.equal((await state()).overflow,"auto");
 await page.screenshot({path:resolve(captures,"after-confession-320.png"),animations:"disabled"});
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
  await open();
 }
 assert.deepEqual(errors,[],"Browser errors: "+errors.join(" | "));
 console.log("PASS 390/320px Confession: 5/13/14 source examination steps, 3+3 rite/after, local gestures, consent and session privacy");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
