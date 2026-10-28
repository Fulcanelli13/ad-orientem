import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-adoration-guided");
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
await new Promise((ok,no)=>{server.once("error",no);server.listen(4293,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
 await page.goto("http://127.0.0.1:4293/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.visit_blessed_sacrament",{returnContext:null})),true);
 const sel="#aoPray435930.open .aoP435930AdorationReader",timeline=sel+" .aoDevoSequenceTimeline";
 await page.waitForSelector(timeline,{timeout:12000});
 const snapshot=()=>page.evaluate(()=>{
  const root=document.querySelector("#aoPray435930.open .aoP435930AdorationReader");
  const card=root?.querySelector(".aoDevoCard"),scroll=card?.querySelector(".aoDevoCardScroll");
  return {mode:root?.dataset.aoAdorationMode,stage:Number(root?.dataset.aoAdorationStep),
   final:root?.dataset.aoAdorationFinal,card:card?.dataset.aoDevoCard,
   index:Number(card?.dataset.aoDevoIndex),stops:root?.querySelectorAll(".aoDevoStop").length||0,
   current:root?.querySelectorAll(".aoDevoStop[aria-current='step']").length||0,
   active:scroll?.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length||0,
   overflow:scroll?getComputedStyle(scroll).overflowY:null,
   nav:root?.querySelector(".aoP435930GuideNav")?getComputedStyle(root.querySelector(".aoP435930GuideNav")).display:null};
 });
 let v=await snapshot();
 assert.deepEqual({mode:v.mode,card:v.card,stops:v.stops,current:v.current,overflow:v.overflow},
  {mode:"visit",card:"visit-0",stops:7,current:1,overflow:"auto"});
 assert.equal(v.nav,null,"Routine Adoration actions must be removed beside the chapter timeline");
 assert.ok(v.active>=1,"Visit has no illuminated prayer or direction paragraph");
 const reverence=page.locator("body > .aoDevotionalActionCinematic");
 await reverence.waitFor({state:"visible",timeout:4500});
 const rCue=await reverence.evaluate(el=>({
  id:el.dataset.aoActionScene,kind:el.dataset.aoActionKind,
  icon:el.querySelector(".aoDevotionalActionIcon")?.hidden===false,
  width:el.getBoundingClientRect().width,view:window.innerWidth,
  instruction:el.querySelector(".aoDevotionalActionTitle")?.textContent
 }));
 assert.equal(rCue.id,"VISIT.ARRIVAL");
 assert.equal(rCue.kind,"REVERENCE");
 assert.equal(rCue.icon,true,"Visit arrival lost the approved reverence icon");
 assert.ok(rCue.width>=rCue.view-60,"Visit arrival still uses a small rail badge");
 assert.match(rCue.instruction,/reverence|révérence/i);
 assert.equal(await reverence.evaluate(el=>el.parentElement===document.body&&
  getComputedStyle(el).position==="fixed"&&el.getAttribute("aria-modal")==="true"),true,
  "Visit reverence cue must hide global navigation as a true fullscreen modal");
 await page.screenshot({path:resolve(captures,"visit-390-full-reverence-cinematic.png"),animations:"disabled"});
 await reverence.locator(".aoDevotionalActionContinue").click();
 assert.equal(await reverence.count(),0,"Visit cinematic did not return to the existing prayer");
 assert.equal(await page.locator(sel).getAttribute("data-ao-adoration-folio"),"v1");
 assert.equal(await page.locator(sel+" .aoDevoCardNumber").count(),1,"Canonical card number stays in DOM for semantics");
 assert.equal(await page.locator(sel+" .aoDevoCardNumber").evaluate(x=>getComputedStyle(x).display),"none",
  "Visit cannot present redundant 1/7 progress under the named stages");
 assert.equal(await page.locator(sel+" .aoDevoCardScroll .aoP435930GuideNow h2").evaluate(x=>getComputedStyle(x).display),"none",
  "Do not repeat the named card title inside the prayer direction");
 assert.equal(await page.locator(sel+" .aoAdorationVisitNote").evaluate(x=>x.open),false,
  "Editorial visit background must not precede prayer");
 await page.screenshot({path:resolve(captures,"visit-390.png"),animations:"disabled"});
 // Silence must be possible even in stages containing several canonical prayers.
 const visitScroll=page.locator(sel+" .aoDevoCardScroll");
 assert.equal(await page.locator(sel+" .aoAdorationQuietLink").count(),1,"Visit stage needs quiet link");
 await visitScroll.evaluate(el=>{el.scrollTop=65});
 const beforePause=await visitScroll.evaluate(el=>el.scrollTop);
 await page.locator(sel+" .aoAdorationQuietLink").evaluate(el=>el.click());
 assert.equal(await page.locator(sel+'[data-ao-adoration-quiet="true"]').count(),1);
 assert.equal(await page.locator(sel+'[data-ao-adoration-quiet="true"]').getAttribute("aria-modal"),"true");
 assert.equal(await page.locator(sel+" .aoAdorationQuietExit").evaluate(el=>document.activeElement===el),true);
 await page.keyboard.press("Tab");
 assert.equal(await page.locator(sel+" .aoAdorationQuietExit").evaluate(el=>document.activeElement===el),true,"Silence traps keyboard focus");
 await page.keyboard.press("Escape");
 assert.equal((await snapshot()).index,0,"Escape should return to selected Visit step");
 assert.equal(await page.locator("#aoPray435930.open").count(),1);
 const resumedScroll=await visitScroll.evaluate(el=>({top:el.scrollTop,height:el.scrollHeight,client:el.clientHeight,padding:getComputedStyle(el).paddingBottom,runway:el.dataset.aoFocusRunway,first:el.querySelector(".aoDevoParagraph")?.getBoundingClientRect().top}));
 console.log("SILENCE_RETURN_DIAGNOSTIC",JSON.stringify({beforePause,resumedScroll}));
 assert.ok(Math.abs(resumedScroll.top-beforePause)<=2,"Scroll position lost on quiet return");
 await page.screenshot({path:resolve(captures,"visit-after-silent-pause-390.png"),animations:"disabled"});
 const swipe=async(dx,dy)=>page.locator(sel+" .aoDevoCardScroll").evaluate((el,{dx,dy})=>{
  const t=(x,y)=>new Touch({identifier:15,target:el,clientX:x,clientY:y});
  el.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,touches:[t(225,335)],changedTouches:[t(225,335)]}));
  el.dispatchEvent(new TouchEvent("touchend",{bubbles:true,touches:[],changedTouches:[t(225+dx,335+dy)]}));
 },{dx,dy});
 await swipe(5,-135);
 assert.equal((await snapshot()).index,0,"Vertical gesture changed the prayer card");
 await swipe(-160,3);
 assert.equal((await snapshot()).index,1,"Horizontal swipe must advance exactly one named card");
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 v=await snapshot();assert.equal(v.index,6);assert.equal(v.final,"true");
 assert.ok(v.nav&&v.nav!=="none","Last Visit card must keep Finish, not trap the faithful");
 assert.equal(await page.locator(sel+" [data-p435930-visit-prev],[data-p435930-visit-next]").count(),0);
 await page.locator(sel+" [data-p435930-visit-finish]").tap();
 assert.equal(await page.locator("#aoPray435930.open .aoP435930BigGrid").count(),1,
  "Finishing Visit did not restore the Adoration mode chooser");
 assert.equal(await page.locator(timeline).count(),0);
 const chooser="#aoPray435930.open .aoAdorationChooser";
 assert.equal(await page.locator(chooser).getAttribute("data-ao-adoration-chooser"),"quiet-v2");
 assert.equal(await page.locator(chooser+" .aoAdorationPrimaryGrid button").count(),2,
   "Visit and untimed silence should be the only primary options");
 assert.equal(await page.locator(chooser+" .aoAdorationMethodsDisclosure").evaluate(el=>el.open),false,
   "Secondary prayer methods should not crowd the entrance");
 assert.equal(await page.locator(chooser+" .aoP435930BigGrid button").count(),4,
   "Holy Hour, Four Ends, Treasury and Night Adoration must stay accessible");
 assert.equal(await page.locator(chooser+' [data-p435930-ador-mode="night"]').count(),1,
   "New night-home watch must remain a secondary Adoration method");
 assert.equal(await page.locator(chooser+" .aoAdorationPrimaryGrid button").first().isVisible(),true);
 assert.equal(await page.locator("#aoPray435930.open [data-ao-pray-rail-channel]").evaluateAll(
  es=>es.every(el=>getComputedStyle(el).display==="none")
 ),true,"Floating rail icons should not cover the Adoration chooser");
 await page.screenshot({path:resolve(captures,"adoration-chooser-quiet-390.png"),animations:"disabled"});
 // Open-ended adoration must remain SILENCE FIRST, not become a 7-card workout.
 await page.locator("#aoPray435930.open [data-p435930-ador-mode='open']").tap();
 assert.equal(await page.locator(sel+" .aoAdorationOpenPrayer").count(),1,"Open adoration is silence-first");
 assert.equal(await page.locator(sel+" .aoAdorationOptionDisclosure").count(),3);
 assert.equal(await page.locator("#aoPray435930.open [data-ao-pray-rail-channel]").evaluateAll(
  es=>es.every(el=>getComputedStyle(el).display==="none")
 ),true,"Open-ended silent prayer must not be obscured by posture rail icons");
 assert.equal(await page.locator(sel+" .aoAdorationOptionDisclosure[open]").count(),0,"Aids must be collapsed until asked for");
 assert.equal(await page.locator(timeline).count(),0,"Open silent Adoration was forced into a step timeline");
 assert.match(await page.locator("#aoPray435930.open .aoP435930GuideNow").innerText(),/Silence is the default|Be still/i);
 await page.screenshot({path:resolve(captures,"open-silence-390.png"),animations:"disabled"});
 await page.locator(sel+" [data-p435930-ador-quiet-enter]").tap();
 assert.equal(await page.locator(sel+'[data-ao-adoration-quiet="true"]').count(),1,
  "Silence entry must remove prayer controls, not start a countdown");
 assert.equal(await page.locator(sel+" .aoDevoSequenceTimeline").count(),0);
 assert.equal(await page.locator(sel+" [data-p435930-timer]").count(),0);
 const noChrome=await page.locator(sel+".aoAdorationQuietScreen").evaluate(el=>{
  const r=el.getBoundingClientRect(),center=document.elementFromPoint(innerWidth/2,innerHeight-32);
  return {fixed:getComputedStyle(el).position==="fixed",left:r.left,top:r.top,bottom:r.bottom,right:r.right,
   viewport:[innerWidth,innerHeight],hit:el.contains(center)||center===el,
   hitElement:center?.outerHTML?.slice(0,450),hitAncestors:Array.from((function*(x){for(let i=0;i<4&&x;i++,x=x.parentElement)yield x})(center)).map(x=>({tag:x.tagName,id:x.id,cls:String(x.className).slice(0,110),z:getComputedStyle(x).zIndex})),
   focused:document.activeElement?.matches("[data-p435930-ador-quiet-exit]")===true}
 });
 await page.screenshot({path:resolve(captures,"quiet-screen-390.png"),animations:"disabled"});
 assert.ok(noChrome.fixed&&noChrome.left===0&&noChrome.top===0&&
  noChrome.bottom>=noChrome.viewport[1]-1&&noChrome.right>=noChrome.viewport[0]-1&&
  noChrome.hit&&noChrome.focused,"Quiet screen must cover global chrome and focus the only exit: "+JSON.stringify(noChrome));
 assert.equal(await page.locator("#aoPray435930.open [data-ao-pray-rail-channel]").count(),0,
  "Quiet mode must remove floating posture/priest labels");
 await page.screenshot({path:resolve(captures,"quiet-screen-390.png"),animations:"disabled"});
 await page.locator(sel+" [data-p435930-ador-quiet-exit]").tap();
 assert.equal(await page.locator(sel+" .aoAdorationOpenPrayer").count(),1,"Returning to prayer must restore the same mode");
 const aid=page.locator(sel+" .aoAdorationOptionDisclosure").first();
 await aid.locator("summary").tap();
 assert.equal(await aid.evaluate(x=>x.open),true,"Optional guidance not usable");
 assert.equal(await page.locator(sel+" [data-p435930-open-prayer='adoration_spiritual_communion']").count(),1);
 await aid.locator("summary").tap();
 for(const width of [320,430]){
  await page.setViewportSize({width,height:width===320?700:932});
  const size=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
  assert.ok(size<=1,"Adoration opens wider than "+width+"px: "+size);
  await page.screenshot({path:resolve(captures,"open-silence-"+width+".png"),animations:"disabled"});
 }
 await page.setViewportSize({width:390,height:844});
 await page.locator("#aoPray435930.open [data-p435930-ador-home]").tap();
 await page.locator("#aoPray435930.open .aoAdorationMethodsDisclosure > summary").tap();
 await page.locator("#aoPray435930.open [data-p435930-ador-mode='holy']").tap();
 await page.waitForSelector(timeline);
 v=await snapshot();assert.equal(v.mode,"holy");assert.equal(v.stops,8);
 assert.equal(await page.locator(sel+" .aoAdorationOptionDisclosure").evaluate(x=>x.open),false,"Holy Hour timer must be optional and folded");
 assert.equal(await page.locator(sel+" .aoDevoStopNumber").first().evaluate(x=>getComputedStyle(x).display),"none",
  "Holy Hour must not show oversized stage numbers");
 await page.locator(timeline+" [data-ao-devo-chapter='6']").tap();
 assert.match(await page.locator(sel+" .aoDevoCard").innerText(),/Optional Agony decade/i);
 assert.equal(await page.locator(sel+" [data-p435930-go-rosary]").count(),1,
  "Optional Rosary handoff was lost from the Holy Hour");
 await page.locator(timeline+" [data-ao-devo-chapter='7']").tap();
 assert.equal((await snapshot()).final,"true");
 assert.equal(await page.locator(sel+" [data-p435930-holy-finish]").count(),1);
 assert.equal(await page.locator(sel+" [data-p435930-holy-next],[data-p435930-holy-prev]").count(),0);

 await page.locator("#aoPray435930.open [data-p435930-ador-home]").tap();
 await page.locator("#aoPray435930.open .aoAdorationMethodsDisclosure > summary").tap();
 await page.locator("#aoPray435930.open [data-p435930-ador-mode='four']").tap();
 await page.waitForSelector(timeline);
 v=await snapshot();assert.equal(v.mode,"four");assert.equal(v.stops,5);
 assert.match(await page.locator(timeline+" [aria-current='step']").innerText(),/Adoration/i,
  "The canonical Four Ends chapter title must remain in the stage timeline");
 assert.match(await page.locator(sel+" .aoDevoCard .aoP435930GuideNow p").innerText(),/Adore Him/i,
  "The first Four Ends stage must retain its source-owned prayer direction");
 await page.locator(timeline+" [data-ao-devo-chapter='4']").tap();
 assert.equal((await snapshot()).final,"true");
 assert.equal(await page.locator(sel+" [data-p435930-four-finish]").count(),1);
 assert.equal(await page.locator(sel+" [data-p435930-four-next],[data-p435930-four-prev]").count(),0);
 assert.equal(await page.locator(sel+" [data-p435930-ador-quiet-enter]").count(),1,"Final silence needs a direct stillness doorway");
 await page.locator(sel+" [data-p435930-ador-quiet-enter]").tap();
 assert.equal(await page.locator(sel+'[data-ao-adoration-quiet="true"]').count(),1);
 await page.locator(sel+" [data-p435930-ador-quiet-exit]").tap();
 assert.equal((await snapshot()).final,"true","Quiet exit should restore the canonical selected stage");
 await page.setViewportSize({width:320,height:720});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)<=1,
  "Guided Adoration overflows narrow phone width");
 assert.equal((await snapshot()).overflow,"auto");
 const railCollision=await page.evaluate(()=>{
  const timeline=document.querySelector("#aoPray435930.open .aoP435930AdorationReader .aoDevoSequenceTimeline");
  const t=timeline?.getBoundingClientRect();
  if(!t)return {missingTimeline:true};
  const icons=[...document.querySelectorAll("#aoPray435930 [data-ao-pray-rail-channel]")];
  const intersections=icons.filter(el=>{
   const r=el.getBoundingClientRect();
   return r.width>0&&r.height>0&&r.left<t.right&&r.right>t.left&&r.top<t.bottom&&r.bottom>t.top;
  });
  return {iconCount:icons.length,intersections:intersections.length};
 });
 assert.equal(railCollision.intersections,0,
  "Gesture/posture icon collides with a 320px timeline button: "+JSON.stringify(railCollision));
 await page.screenshot({path:resolve(captures,"four-ends-320.png"),animations:"disabled"});
 assert.deepEqual(errors,[],"Browser errors: "+errors.join(" | "));
 console.log("PASS guided Adoration 7/8/5 cards: source stages, swipe, paragraph focus, true silence mode and finish/return");
 await page.close();
}finally{await browser?.close();await new Promise(done=>server.close(done));}
