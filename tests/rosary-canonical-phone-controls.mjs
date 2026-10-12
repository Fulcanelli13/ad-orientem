import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/rosary-canonical-phone-controls");
await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
 const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
 const data=await readFile(p);
 res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
 res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:width===390?844:932},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce",serviceWorkers:"block"});
  const errors=[];page.on("pageerror",error=>errors.push(error.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,null,{timeout:45000});
   const nav=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
   assert.equal(nav.ok,true,"Cannot open Prayer");
   const launch=await page.evaluate(()=>window.AO_PRAY_V435930?.open?.("pray.rosary_methods"));
   assert.equal(launch,true,"Cannot open preserved Methods owner");
   await page.locator('#aoPray435930 [data-p435930-rosary-begin]').click();
   // The historical donor has two distinct states: initial Rosary selection
   // and the active bead. Both must be accessible without inventing a reader.
   const player=page.locator('#aoPrayerBookRoot.open');
   await player.waitFor({state:"visible",timeout:20000});
   await player.locator('.aoP435930RosaryBar').waitFor({state:"attached",timeout:20000});
   const prep=player.locator('.aoRosaryPreparation');
   const hero=player.locator('.pbShell>.lab-rosary-hero');
   await prep.waitFor({state:"visible",timeout:12000});
   const layout=await page.evaluate(()=>{
     const shell=document.querySelector("#aoPrayerBookRoot.open .pbShell");
     const h=shell.querySelector(":scope > .lab-view-head"),
      hero=shell.querySelector(":scope > .lab-rosary-hero"),
      d=shell.querySelector(":scope > .aoRosaryPreparation"),
      btn=hero.querySelector("[data-lab-rosary-today]");
     return {first:h?.nextElementSibling===hero,second:hero?.nextElementSibling===d,
       closed:!d.open,summaryHeight:d.querySelector("summary")?.getBoundingClientRect().height,
       mainHeight:btn?.getBoundingClientRect().height,mainTop:btn?.getBoundingClientRect().top,
       optionsTop:d?.getBoundingClientRect().top,
       methods:shell.querySelectorAll("[data-v38-rosary-form]").length,
       mysteries:shell.querySelectorAll("[data-pb-rosary-set]").length,
       overflow:document.documentElement.scrollWidth-innerWidth};
   });
   assert.ok(layout.first&&layout.second,"Original recommended mystery not immediately below header");
   assert.equal(layout.closed,true,"Unnecessary setup controls cover initial prayer action");
   assert.ok(layout.mainHeight>=44&&layout.summaryHeight>=44,
     "Start or optional settings below touch minimum: "+JSON.stringify(layout));
   assert.ok(layout.mainTop<layout.optionsTop,
     "Main prayer CTA is below the configuration controls");
   assert.equal(layout.methods,2,"Traditional/Devotional forms replaced or removed");
   assert.equal(layout.mysteries,4,"Canonical four available mystery categories lost");
   const other=player.locator(".aoRosaryOtherMysteries");
   assert.equal(await other.getAttribute("open"),null,
     "Original mystery catalogue should not repeat the selected mystery at startup");
   assert.equal(await other.locator("[data-pb-rosary-set]").count(),4,
     "A historical mystery category was deleted or replaced");
   assert.ok(layout.overflow<=1,"Opening caused document overflow");
   await page.screenshot({path:resolve(captures,"rosary-first-action-"+width+".png"),
     fullPage:false,animations:"disabled"});
   await prep.locator("summary").first().click();
   await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot.open .aoRosaryPreparation")?.open===true,
     null,{timeout:10000});
   const metric=await page.evaluate(()=>{
    const root=document.querySelector('#aoPrayerBookRoot.open');
    const get=(selector)=>[...root.querySelectorAll(selector)].filter(x=>x.getClientRects().length>0).map(x=>{
      const box=x.getBoundingClientRect(),style=getComputedStyle(x);
      return {text:x.textContent.trim().slice(0,60),height:box.height,width:box.width,font:parseFloat(style.fontSize),
       pressed:x.getAttribute("aria-pressed"),tag:x.tagName,visible:style.visibility};
    });
    return {
      depth:get('.aoP435930RosaryBar button'),
      recitation:get('.r29-head-recitation button,.lab-recitation-mode button,[data-ao-recitation]'),
      guide:get('.aoRosaryGuide>summary'),
      sources:get('.aoRosaryScriptureOpening a,.aoRosaryGuidedBeadMeditation a[data-ao-rosary-meditation-source]'),
      overflow:document.documentElement.scrollWidth-innerWidth,
      playerCount:document.querySelectorAll('#aoPrayerBookRoot.open').length,
      state:window.AO_ROSARY_V381?.state?.()?.step,
      method:window.AO_ROSARY_V381?.getMethod?.()
    };
   });
   console.log("OPENING DOM "+width+"px "+JSON.stringify(metric));
   assert.equal(metric.playerCount,1,"Duplicate canonical Rosary active root");
   assert.equal(metric.depth.length,2,"Missing simple/guided options");
   assert.ok(metric.recitation.length>=2,"Missing individual/group options");
   assert.equal(metric.guide.length,1,"Historical guide lost");
   assert.equal(await prep.locator("[data-v38-rosary-form]").count(),2,
     "Traditional and Devotional Rosary forms missing from options");
   assert.equal(await prep.locator("[data-pb-fatima]").count(),1,
     "Optional Fatima prayer setting no longer reachable");
   assert.ok(metric.depth.every(x=>x.height>=44&&x.font>=12),
     "Simple/Guided touch/label size below accessibility floor: "+JSON.stringify(metric.depth));
   assert.ok(metric.recitation.every(x=>x.height>=44&&x.font>=12),
     "Recitation touch/label size below accessibility floor: "+JSON.stringify(metric.recitation));
   assert.ok(metric.guide.every(x=>x.height>=44),"Guide summary not reachable");
   const guide=prep.locator(".aoRosaryGuide");
   await guide.locator("summary").click();
   const guideLinks=await guide.locator(".aoRosaryGuideSection a").evaluateAll(nodes=>
     nodes.map(x=>x.getAttribute("href")));
   assert.equal(guideLinks.length,6,"Guide lost one of six source-linked sections");
   assert.ok(guideLinks.every(url=>url?.startsWith("https://")),"Historical Guide source URL lost");
   await guide.locator("summary").click();
   assert.ok(metric.sources.every(x=>x.height>=44),"Source action too small");
   assert.ok(metric.overflow<=1,"Canonical Rosary caused horizontal document overflow");
   await page.screenshot({path:resolve(captures,"rosary-phone-controls-"+width+".png"),
    fullPage:false,animations:"disabled"});

   // Changing the native reader's presentation controls must not advance a bead
   // or change its canonical Rosary method. No alternative engine is mounted.
   await player.locator('[data-p435930-rosary-depth="simple"]').click();
   await page.waitForFunction(()=>document.querySelector('#aoPrayerBookRoot [data-p435930-rosary-depth="simple"]')?.getAttribute("aria-pressed")==="true",
      null,{timeout:10000});
   const group=player.locator('[data-p435930-recitation="group"],[data-ao-recitation="group"]').first();
   await group.click();
   await page.waitForFunction(()=>[
     ...document.querySelectorAll('#aoPrayerBookRoot [data-p435930-recitation="group"],#aoPrayerBookRoot [data-ao-recitation="group"]')
    ].some(x=>x.getAttribute("aria-pressed")==="true"),null,{timeout:10000});
   const after=await page.evaluate(()=>({step:window.AO_ROSARY_V381?.state?.()?.step,
    method:window.AO_ROSARY_V381?.getMethod?.(),visible:document.querySelectorAll('#aoPrayerBookRoot.open').length}));
   assert.equal(after.step,metric.state,"Changing recitation depth advanced Rosary bead");
   assert.equal(after.method,metric.method,"Changing view mode changed historical method");
   assert.equal(after.visible,1,"Canonical Rosary donor replaced by competing reader");
   assert.equal(await prep.evaluate(node=>node.open),true,
     "Preference repaint unexpectedly closed Rosary options");
   assert.match(await prep.locator(".aoRosaryPreparationState").textContent(),/Group/,
     "Collapsed summary failed to reflect real recitation preference");
   await prep.locator("summary").first().click();
   await other.locator("summary").click();
   assert.equal(await other.locator("[data-pb-rosary-set]:visible").count(),4,
     "All mystery sets must be visibly reachable when explicitly requested");
   await other.locator("summary").click();
   await hero.locator("[data-lab-rosary-today]").click();
   await page.waitForFunction(()=>
     document.querySelector("#aoPrayerBookRoot.open .pbShell[data-ao-rosary-exact-donor='v3.4.14']")!=null &&
     document.querySelector("#aoPrayerBookRoot.open")?.dataset?.aoRosaryActiveRoot==="true",
      null,{timeout:20000});
   const live=await page.evaluate(()=>({method:window.AO_ROSARY_V381?.getMethod?.(),
     roots:document.querySelectorAll("#aoPrayerBookRoot.open").length,
     active:document.querySelector("#aoPrayerBookRoot.open")?.dataset?.aoRosaryActiveRoot}));
   assert.equal(live.method,"ordinary","Start replaced the canonical Rosary method");
   assert.equal(live.roots,1,"Start created a competing Rosary root");
   // Active recitation should expose ONE stateful preferences summary and
   // preserve the canonical gesture, bead, prayer and Previous/Next controls.
   const activeOptions=player.locator(".aoRosaryActiveOptions");
   await activeOptions.waitFor({state:"visible",timeout:15000});
   const activeBefore=await page.evaluate(()=>{
    const shell=document.querySelector("#aoPrayerBookRoot.open .pbShell"),
     header=shell.querySelector(":scope > .lab-view-head"),
     rail=shell.querySelector(":scope > .aoRosaryFaithfulRail"),
     options=shell.querySelector(":scope > .aoRosaryActiveOptions"),
     sheet=shell.querySelector(".lab-prayer-sheet"),
     nav=shell.querySelector("[data-lab-rosary-next]");
    return {afterRail:rail?.nextElementSibling===options,
      count:shell.querySelectorAll(".aoRosaryActiveOptions").length,
      collapsed:!options.open,
      state:options.querySelector(".aoRosaryActiveOptionsState")?.textContent,
      summaryHeight:options.querySelector("summary")?.getBoundingClientRect().height,
      hiddenMode:!shell.querySelector(".aoP435930RosaryBar button")?.getClientRects().length,
      hiddenRecitation:!shell.querySelector(".r29-head-recitation button")?.getClientRects().length,
      step:window.AO_ROSARY_V381?.state?.()?.step,
      prayer:sheet?.innerText?.trim()?.slice(0,130),
      next:!!nav&&nav.getBoundingClientRect().height>=44,
      overflow:document.documentElement.scrollWidth-innerWidth,
      headerHeight:header?.getBoundingClientRect().height
    };
   });
   assert.equal(activeBefore.count,1,"Parallel settings surfaces in active Rosary");
   assert.equal(activeBefore.afterRail,true,"Gesture rail or prayer hierarchy was disturbed");
   assert.equal(activeBefore.collapsed,true,"Recitation must focus prayer, not settings");
   assert.ok(activeBefore.hiddenMode&&activeBefore.hiddenRecitation,
     "Reading and recitation rows still compete with prayer");
   assert.ok(activeBefore.summaryHeight>=44&&activeBefore.next,
     "Active summary or Next action below accessible touch size");
   assert.ok(activeBefore.prayer?.length>15&&activeBefore.overflow<=1,
     "Active prayer missing or document overflow");
   assert.match(activeBefore.state,/Simple.*Group/,"Collapsed state not reflecting real choices");
   await page.screenshot({path:resolve(captures,"rosary-active-after-start-"+width+".png"),
     fullPage:false,animations:"disabled"});

   // Chapter cards mirror the canonical bead sequence without mounting a
   // second engine. Horizontal chapter gestures differ from bead-by-bead Next.
   const deck=await page.evaluate(()=>{
     const root=document.querySelector("#aoPrayerBookRoot.open");
     const shell=root?.querySelector(".pbShell");
     const sheet=shell?.querySelector(".lab-prayer-sheet");
     const nav=shell?.querySelector("[data-ao-rosary-timeline]");
     return {timeline:!!nav,cards:nav?.querySelectorAll(".aoRosaryChapterStop").length,
       current:nav?.querySelectorAll(".aoRosaryChapterStop[aria-current='step']").length,
       title:shell?.querySelector(".aoRosaryCardTitle")?.textContent?.trim(),
       scroll:getComputedStyle(sheet).overflowY,
       card:sheet?.dataset.aoRosaryCard,
       chapterStep:window.AO_ROSARY_V381?.state?.()?.step,
       sources:shell?.querySelectorAll(".lab-prayer-sheet .lab-prayer-flip").length,
       playerCount:document.querySelectorAll("#aoPrayerBookRoot.open").length};
   });
   assert.ok(deck.timeline&&deck.cards>=6&&deck.cards<=7&&deck.current===1&&
     deck.title?.length>3&&deck.scroll==="auto"&&deck.playerCount===1,
     "Rosary lost named horizontal cards / card-local vertical scroll: "+JSON.stringify(deck));
   const chapters=await page.evaluate(()=>[...document.querySelectorAll(
     "#aoPrayerBookRoot.open [data-ao-rosary-chapter]")].map(x=>x.textContent.trim()));
   assert.ok(chapters.some(x=>/Annunciation|Annonciation/.test(x)),
     "Rosary timeline must name the first canonical mystery");
   // A vertical gesture inside a prayer card does not advance a bead.
   await player.locator(".aoRosaryCardScroll").evaluate(node=>{
     const t=(x,y)=>new Touch({identifier:16,target:node,clientX:x,clientY:y});
     node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,
       touches:[t(240,350)],changedTouches:[t(240,350)]}));
     node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,
       touches:[],changedTouches:[t(245,200)]}));
   });
   assert.equal(await page.evaluate(()=>window.AO_ROSARY_V381.state().step),deck.chapterStep,
     "Vertical prayer scroll advanced the Rosary bead");
   const firstMystery=await page.evaluate(()=>window.AO_ROSARY_V381.steps().findIndex(
     step=>step.kind==="mystery"&&step.phase==="decade"));
   assert.ok(firstMystery>0,"Rosary donor lost its first canonical mystery");
   await player.locator('[data-ao-rosary-chapter="1"]').click();
   await page.waitForFunction(index=>window.AO_ROSARY_V381?.state?.()?.step===index,
     firstMystery,{timeout:9000});
   await page.waitForFunction(()=>document.querySelector(
     "#aoPrayerBookRoot.open [data-ao-rosary-chapter='1']")?.getAttribute("aria-current")==="step",
     null,{timeout:9000});
   assert.equal(await player.locator(".aoRosaryChapterTitle").count(),0,
     "Parallel mystery title surfaces must not be created");
   await player.locator('[data-ao-rosary-chapter="0"]').click();
   await page.waitForFunction(()=>window.AO_ROSARY_V381?.state?.()?.step===0,
     null,{timeout:9000});
   await page.screenshot({path:resolve(captures,"rosary-dual-axis-"+width+".png"),
     fullPage:false,animations:"disabled"});

   // A shell telemetry collision once caused the legacy bead dispatcher
   // to cancel every descendant click before it reached the real control.
   const shellData=await player.locator(".pbShell").evaluate(shell=>({
     buttonMarker:shell.hasAttribute("data-ao-rosary-bead"),
     current:shell.dataset.aoRosaryCurrentBead,
     actualBeads:shell.querySelectorAll(".lab-bead-stage [data-ao-rosary-bead]").length
   }));
   assert.equal(shellData.buttonMarker,false,"Shell is masquerading as a clickable bead");
   assert.ok(shellData.current!==undefined,"Canonical shell bead telemetry was lost");
   assert.ok(shellData.actualBeads>0,"True bead buttons disappeared");
   await activeOptions.locator(":scope > summary").click();
   await page.waitForFunction(()=>document.querySelector(
     "#aoPrayerBookRoot.open .aoRosaryActiveOptions")?.open===true,null,{timeout:10000});
   assert.equal(await activeOptions.evaluate(x=>x.open),true,"Active settings did not expand");
   assert.equal(await activeOptions.locator('[data-p435930-rosary-depth]').count(),2,
     "Simple/Guided disappeared from original reader");
   assert.ok(await activeOptions.locator('[data-p435930-recitation]').count()>=2,
     "Individual/Group disappeared from original reader");
   assert.equal(await activeOptions.locator(".aoRosaryGuideSection a[href^='https://']").count(),6,
     "Guide source links missing from active reader");
   const liveGuide=activeOptions.locator(".aoRosaryGuide");
   await liveGuide.locator(":scope > summary").click();
   assert.equal(await liveGuide.evaluate(el=>el.open),true,
     "Legacy bead interception still prevents opening the active Guide");
   await liveGuide.locator(":scope > summary").click();

   await activeOptions.locator('[data-p435930-rosary-depth="guided"]').click();
   await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveOptionsState")?.textContent?.includes("Guided"),null,{timeout:10000});
   assert.equal(await activeOptions.evaluate(x=>x.open),true,
     "Changing reading mode closed active options unexpectedly");
   assert.equal(await page.evaluate(()=>window.AO_ROSARY_V381.state().step),activeBefore.step,
     "Reading mode advanced canonical bead");
   await activeOptions.locator(":scope > summary").click();
   const beforeNext=await page.evaluate(()=>window.AO_ROSARY_V381.state().step);
   await player.locator('[data-lab-rosary-next]').click();
   await page.waitForFunction(previous=>window.AO_ROSARY_V381?.state?.()?.step>previous,beforeNext,{timeout:12000});
   await page.waitForFunction(()=>document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveOptions")?.open===false,null,{timeout:12000});
   assert.equal(await player.locator(".aoRosaryActiveOptions").count(),1,
     "Active preferences missing after next canonical bead");
   assert.match(await player.locator(".aoRosaryActiveOptionsState").textContent(),/Guided/,
     "Reading choice lost after advancing actual Rosary");
   assert.deepEqual(errors,[],"Uncaught reader errors: "+errors.slice(0,5).join("; "));
   console.log("PASS "+width+"px canonical Rosary: 44px controls, source, guide, no overflow/state mutation");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
