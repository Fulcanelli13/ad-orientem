import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-historical-dual-axis");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const full=resolve(root,"."+name);
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end();}
  const bytes=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4298,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4298/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 const rootSel="#aoPray435930.open .aoP435930DevotionalGuidedReader";
 const timeline=rootSel+" .aoDevoSequenceTimeline";
 const open=async id=>{
  const success=await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),id);
  assert.equal(success,true,"Cannot open original source module: "+id);
 };
 const snapshot=()=>page.evaluate(()=>{
  const reader=document.querySelector("#aoPray435930.open .aoP435930DevotionalGuidedReader");
  const card=reader?.querySelector(".aoDevoCard"),body=card?.querySelector(".aoDevoCardScroll");
  return {owner:reader?.dataset.aoDevotionalOwner,index:Number(card?.dataset.aoDevoIndex),
   id:card?.dataset.aoDevoCard,final:reader?.dataset.aoDevotionalFinal,
   chapters:reader?.querySelectorAll(".aoDevoStop").length||0,
   current:reader?.querySelectorAll(".aoDevoStop[aria-current='step']").length||0,
   paragraphs:body?.querySelectorAll(".aoDevoParagraph").length||0,
   lit:body?.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length||0,
   overflow:body?getComputedStyle(body).overflowY:null,
   nav:reader?.querySelector(".aoP435930GuideNav")?
    getComputedStyle(reader.querySelector(".aoP435930GuideNav")).display:null};
 });
 const swipe=async(dx,dy)=>page.locator(rootSel+" .aoDevoCardScroll").evaluate((node,{dx,dy})=>{
  const t=(x,y)=>new Touch({identifier:16,target:node,clientX:x,clientY:y});
  node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(212,370)],changedTouches:[t(212,370)]}));
  node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(212+dx,370+dy)]}));
 },{dx,dy});
 await open("pray.penitential_psalms");
 await page.waitForSelector(timeline,{timeout:14000});
 let s=await snapshot();assert.deepEqual({owner:s.owner,chapters:s.chapters,index:s.index,current:s.current,overflow:s.overflow},
  {owner:"penitential",chapters:7,index:0,current:1,overflow:"auto"});
 assert.equal(s.nav,null,"Legacy Psalm navigation must be removed, not merely hidden");
 assert.equal(await page.locator(rootSel+" [data-p435930-pen-scripture]").count(),1,
  "Canonical Catholic Bible source loader is missing");
 await page.screenshot({path:resolve(captures,"penitential-390.png"),animations:"disabled"});
 await swipe(5,-140);assert.equal((await snapshot()).index,0,"Vertical Psalm scroll changed chapter");
 await swipe(-170,3);assert.equal((await snapshot()).index,1,"Psalm swipe must advance one chapter");
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 s=await snapshot();assert.equal(s.index,6);assert.equal(s.final,"true");
 assert.ok(s.nav&&s.nav!=="none","Original final Litany handoff is missing");
 assert.equal(await page.locator(rootSel+" [data-p435930-pen-litany]").count(),1);
 await page.locator(rootSel+" [data-p435930-pen-litany]").tap();
 await page.waitForFunction(()=>document.querySelector("#aoPray435930.open .aoP435930Mount")?.dataset.aoPrayView==="litany");
 // The Litany is external-witness backed. A real, complete source earns a
 // titled timeline; an unavailable source must display an explicit hold,
 // never synthetic invocations or false release certification.
 await page.waitForFunction(()=>{
  const m=document.querySelector("#aoPray435930.open .aoP435930Mount");
  return Boolean(m?.querySelector(".aoP435930DevotionalGuidedReader .aoDevoSequenceTimeline")||
   m?.querySelector("[data-p435930-lit-retry]"));
 },null,{timeout:24000});
 const ready=await page.locator(timeline).count()>0;
 if(ready){
  s=await snapshot();assert.equal(s.owner,"litany");
   assert.equal(s.nav,null,"No duplicate Litany Previous/Next controls");
   assert.equal(await page.locator(rootSel+" [data-p435930-lit-prev],[data-p435930-lit-next]").count(),0);
   const litProgress=page.locator(timeline+" .aoDevoProgress");
   assert.equal(await litProgress.getAttribute("aria-valuenow"),"1");
   assert.equal(await litProgress.getAttribute("aria-valuemax"),String(s.chapters));
  assert.ok(s.chapters>=2&&s.paragraphs>=2,"Historical Litany invocation lines are not focusable");
  const invocation=await page.locator(rootSel+" .aoP435930LitanyLine").allTextContents();
  assert.ok(invocation.length>2&&invocation.some(t=>/Lord|Saint|Mary|Seigneur|Sainte/.test(t)));
  await swipe(-160,4);assert.equal((await snapshot()).index,1,"Litany swipe did not advance one verified section");
   assert.equal(await litProgress.getAttribute("aria-valuenow"),"2");
   await page.locator(timeline+" [data-ao-devo-chapter='"+(s.chapters-1)+"']").tap();
   assert.equal((await snapshot()).final,"true");
   assert.equal(await litProgress.getAttribute("aria-valuenow"),String(s.chapters));
   assert.equal(await page.locator(rootSel+" [data-p435930-lit-done]").count(),1,
    "Litany source-end must retain the explicit final handoff");
  await page.screenshot({path:resolve(captures,"litany-390-source.png"),animations:"disabled"});
 }else{
  const hold=await page.locator("#aoPray435930.open").innerText();
  assert.match(hold,/could not be verified or loaded|n’a pas pu être chargé|n'a pas pu être chargé/,
   "Litany source failed but an unsourced substitute appeared");
  assert.equal(await page.locator(timeline).count(),0);
  console.log("SOURCE_HOLD historical Litany unavailable; layout release cannot be source-certified from this run");
 }
 await open("pray.seven_words");
 await page.waitForSelector(timeline,{timeout:12000});
 s=await snapshot();assert.deepEqual({owner:s.owner,chapters:s.chapters,index:s.index},
  {owner:"sevenWords",chapters:7,index:0});
  assert.equal(s.nav,null,"No duplicate Seven Words Previous/Next controls");
  assert.equal(await page.locator(rootSel+" [data-p435930-word-prev],[data-p435930-word-next]").count(),0);
  const wordProgress=page.locator(timeline+" .aoDevoProgress");
  assert.equal(await wordProgress.getAttribute("aria-valuenow"),"1");
  assert.equal(await wordProgress.getAttribute("aria-valuemax"),"7");
 assert.match(await page.locator(rootSel+" .aoDevoCardHead").innerText(),/Father, forgive them|Père, pardonne/);
 assert.equal(await page.locator(rootSel+" [data-p435930-word-scripture]").count(),1);
 assert.equal(await page.locator(rootSel+" .aoP435930HistoricalFocus").count()<=1,true,
  "Historical witness must not duplicate Gospel in multiple cards");
 await page.screenshot({path:resolve(captures,"seven-words-390.png"),animations:"disabled"});
 await swipe(-170,4);assert.equal((await snapshot()).index,1);
  assert.equal(await wordProgress.getAttribute("aria-valuenow"),"2");
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 assert.equal((await snapshot()).final,"true");
 assert.equal(await page.locator(rootSel+" [data-p435930-word-done]").count(),1);
  assert.equal(await wordProgress.getAttribute("aria-valuenow"),"7");
 await open("pray.forty_hours");
 assert.equal(await page.locator("[data-ao-forty-mode=choose]").count(),1,"Forty Hours now explicitly offers visitor and solemn paths");
 await page.locator("[data-p435930-forty-mode=visitor]").tap();
 await page.waitForSelector(timeline,{timeout:12000});
 s=await snapshot();assert.deepEqual({owner:s.owner,chapters:s.chapters,index:s.index},
  {owner:"fortyHours",chapters:6,index:0});
 assert.match(await page.locator(rootSel+" .aoDevoCard").innerText(),/church devotion already in progress/);
 await swipe(3,-170);assert.equal((await snapshot()).index,0,"Vertical ritual scroll changed the stage");
 await swipe(-160,3);assert.equal((await snapshot()).index,1,"Forty Hours swipe must change exactly one stage");
 await page.waitForTimeout(650);assert.equal((await snapshot()).index,1,"Public rite advanced automatically");
 await page.locator(timeline+" [data-ao-devo-chapter='2']").tap();
 for(const id of ["pray.adoration","pray.litany_saints","pray.penitential_psalms"]){
  assert.equal(await page.locator(rootSel+" [data-p435930-forty-own='"+id+"']").count(),1,
   "Existing aid handoff lost: "+id);
 }
 await page.locator(timeline+" [data-ao-devo-chapter='3']").tap();
 assert.match(await page.locator(rootSel+" .aoDevoCardScroll").innerText(),/Public|clergy|church/i);
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 assert.equal(await page.locator(rootSel+" [data-p435930-forty-ben]").count(),1,
  "Benediction public-rite handoff missing");
 await page.locator(timeline+" [data-ao-devo-chapter='5']").tap();
 assert.equal((await snapshot()).final,"true");
 assert.ok((await snapshot()).nav&&((await snapshot()).nav!=="none"),"Forty Hours final manual return missing");
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,
  "Small phone prayer reader overflows");
 assert.equal((await snapshot()).overflow,"auto");
 const guard=await page.locator(rootSel+" .aoDevoCardScroll .aoP435930GuideNow p").evaluate(el=>({
  right:el.getBoundingClientRect().right,viewport:innerWidth
 }));
 assert.ok(guard.right<=guard.viewport-46,
  "Gesture icon encroaches on 320px public-rite text: "+JSON.stringify(guard));
 await page.screenshot({path:resolve(captures,"forty-hours-320.png"),animations:"disabled"});
 assert.deepEqual(errors,[],"Browser errors: "+errors.join(" | "));
 console.log("PASS source-owned Psalms/Seven Words/Forty Hours card gestures, exact original handoffs, 320/390px focus; Litany="+(ready?"verified source view":"explicit historical source hold"));
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
