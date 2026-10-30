import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
// Guard the shipped single-source bead Scripture presentation. Historical
// duplicate selectors silently overrode accessible 44px links/disclosures.
const prayStyles=await readFile(new URL("../src/pray/presentation-styles.js",import.meta.url),"utf8");
const scriptureStyle=prayStyles.split("/* Guided Rosary:")[1]
  ?.split("#aoPrayerBookRoot .aoRosaryGuidedBeadMeditation")[0]??"";
assert.ok(scriptureStyle,"Canonical Guided Rosary Scripture CSS missing");
for(const selector of [
 ".aoRosaryBeadScripture{",
 ".aoRosaryBeadScriptureActions :is(a,button){",
 ".aoRosaryBeadSourceNotice{",
]){
 assert.equal(scriptureStyle.split(selector).length-1,1,
   "Duplicate Guided Rosary Scripture source style: "+selector);
}
assert.match(scriptureStyle,/\.aoRosaryBeadSourceNotice>summary\{[^}]*min-height:44px/);
assert.match(scriptureStyle,/\.aoRosaryBeadScriptureActions :is\(a,button\)\{[^}]*min-height:44px/);
assert.doesNotMatch(scriptureStyle,/\.aoRosaryEnglishSwitch button\{/,
  "Do not restore an obsolete second translation button family");
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
 const body=await readFile(p);
 res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
 res.end(body);
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
   // The chapter rail is a non-owning view of the preserved bead engine.
   const chapterRail=player.locator(".aoRosaryNamedTimeline");
   await chapterRail.waitFor({state:"visible",timeout:9000});
   const options=await chapterRail.locator("[data-ao-rosary-chapter]").evaluateAll(nodes=>nodes.map(b=>({
     start:Number(b.dataset.aoRosaryChapter),title:b.querySelector(".aoDevoStopTitle")?.textContent||"",
     active:b.getAttribute("aria-current")==="step"
   })));
   assert.ok(options.length>=5&&options.filter(x=>x.active).length===1,
     "Rosary title timeline missing the five mysteries or unique current chapter");
   assert.ok(options.every((x,i)=>x.title&&Number.isInteger(x.start)&&
      (i===0||x.start>options[i-1].start)), "Rosary timeline chapters must follow source steps");
   // Titles are localised and the visible stop label is not guaranteed to
   // contain the word "Mystery". Resolve identity from canonical bead steps.
   const jump=await page.evaluate(stops=>{
     const steps=globalThis.AO_ROSARY_V381.steps();
     return stops.find(stop=>{
       const step=steps[stop.start];
       return step?.kind==="mystery"&&Number.isInteger(step.mi)&&step.mi>=0;
     });
   },options);
   assert.ok(jump,"No named Rosary mystery chapter");
   await chapterRail.locator('[data-ao-rosary-chapter="'+jump.start+'"]').click();
   await page.waitForFunction(target=>window.AO_ROSARY_V381?.state?.()?.step===target,jump.start,{timeout:9000});
   await page.waitForFunction(()=>document.querySelectorAll("#aoPrayerBookRoot.open .aoRosaryNamedTimeline [aria-current='step']").length===1,
     null,{timeout:9000});
   assert.equal(await player.locator(".aoRosaryNamedTimeline [aria-current='step']").count(),1,
     "Rosary named timeline failed to follow canonical step jump");
   assert.equal(await player.locator(".pbShell").count(),1,
     "Chapter jump replaced canonical Rosary donor");
   // A mystery opens in the canonical contemplation surface. This is a
   // distinct kind of source-owned card, not an invented bead prayer.
   await page.waitForFunction(()=>document.querySelector(
     "#aoPrayerBookRoot.open .aoRosaryActiveCard[data-ao-rosary-card-kind='contemplation']"),
     null,{timeout:9000});
   const beadTarget=await page.evaluate(start=>{
     const steps=globalThis.AO_ROSARY_V381.steps();
     return steps.findIndex((entry,i)=>i>start&&entry.mi===steps[start].mi&&entry.kind!=='mystery');
   },jump.start);
   assert.ok(beadTarget>jump.start,"Rosary mystery has no following prayer step");
   // Use the actual Next control, not setStep() directly: the canonical
   // donor's real click handler also owns the repaint/decorate lifecycle.
   for(let bead=jump.start;bead<beadTarget;bead++){
     await player.locator("[data-lab-rosary-next]").click();
     await page.waitForFunction(target=>globalThis.AO_ROSARY_V381?.state?.()?.step===target,
       bead+1,{timeout:9000});
   }
   await page.waitForFunction(()=>document.querySelector(
     "#aoPrayerBookRoot.open .aoRosaryActiveCard[data-ao-rosary-card-kind='prayer'] .aoRosaryPrayerScroll"),
     null,{timeout:9000}).catch(async error=>{
      const diag=await page.evaluate(()=>{
       const root=document.querySelector("#aoPrayerBookRoot.open");
       const sheet=root?.querySelector(".lab-prayer-sheet");
       const flip=root?.querySelector(".lab-prayer-flip");
       const all=[...root?.querySelectorAll(".aoRosaryActiveCard")||[]];
       return {step:globalThis.AO_ROSARY_V381?.state?.()?.step,kind:root?.querySelector(".pbShell")?.dataset?.aoRosaryKind,
         cardKinds:all.map(x=>x.dataset.aoRosaryCardKind),inside:!!sheet?.contains(flip),
         sheet:sheet?.outerHTML?.slice(0,2700),flip:flip?.outerHTML?.slice(0,1800),
         contemplation:root?.querySelector(".lab-contemplation")?.outerHTML?.slice(0,800)};
      });
      throw new Error("ROSARY_PRAYER_STAGE_DIAGNOSTIC "+JSON.stringify(diag)+"; "+error);
     });
   // The same canonical donor is now the one titled, locally scrolling card.
   await page.waitForFunction(()=>{
     const sheet=document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveCard");
     return sheet?.querySelector(".aoRosaryPrayerScroll")&&
       sheet.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length===1;
   },null,{timeout:9000}).catch(async error=>{
     const diag=await page.evaluate(()=>{
       const root=document.querySelector("#aoPrayerBookRoot.open");
       const sheet=root?.querySelector(".lab-prayer-sheet");
       const flip=root?.querySelector(".lab-prayer-flip");
       return {sheet:sheet?.outerHTML?.slice(0,3200),flip:flip?.outerHTML?.slice(0,1400),
         inside:!!sheet?.contains(flip),sheetClass:sheet?.className,
         flipClass:flip?.className,active:root?.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length,
         step:globalThis.AO_ROSARY_V381?.state?.()?.step,
         named:root?.querySelectorAll(".aoRosaryNamedTimeline").length};
     });
     throw new Error("ROSARY_CARD_FOCUS_DIAGNOSTIC "+JSON.stringify(diag)+"; "+error);
   });
   const card=await page.evaluate(()=>{
     const sheet=document.querySelector("#aoPrayerBookRoot.open .aoRosaryActiveCard");
     const flip=sheet.querySelector(".aoRosaryPrayerScroll");
     return {count:document.querySelectorAll("#aoPrayerBookRoot.open .aoRosaryActiveCard").length,
       chapter:sheet.dataset.aoDevoCard,active:sheet.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length,
       scroll:getComputedStyle(flip).overflowY,title:sheet.querySelector("h2.aoDevoCardTitle")?.textContent?.trim(),
       flip:flip.hasAttribute("data-pb-flip"),next:!!document.querySelector("#aoPrayerBookRoot.open [data-lab-rosary-next]"),
       rawStep:window.AO_ROSARY_V381.state().step};
   });
   assert.equal(card.count,1,"Rosary created a second prayer card instead of decorating the donor");
   assert.equal(card.active,1,"Rosary card failed to illuminate exactly one visible prayer passage");
   assert.equal(card.scroll,"auto","Rosary prayer text does not have its own vertical scroll");
   assert.ok(card.title?.length>3&&card.flip&&card.next,
     "Rosary card lost title, source-owned translation toggle or bead controls");
   // The donor owns the language flip. Verify that only the focus changes,
   // never the bead cursor or the canonical prayer text.
   const faceBefore=await player.locator(".aoRosaryPrayerScroll").evaluate(root=>({
     latin:root.querySelector("[data-pb-latin]")?.hidden,
     vern:root.querySelector("[data-pb-vern]")?.hidden
   }));
   if(typeof faceBefore.latin==="boolean"&&typeof faceBefore.vern==="boolean"){
    await player.locator(".aoRosaryPrayerScroll[data-pb-flip]").click();
    await page.waitForFunction(previous=>{
      const root=document.querySelector("#aoPrayerBookRoot.open .aoRosaryPrayerScroll");
      return root?.querySelector("[data-pb-latin]")?.hidden!==previous;
    },faceBefore.latin,{timeout:7000});
    await page.waitForFunction(()=>{
      const root=document.querySelector("#aoPrayerBookRoot.open .aoRosaryPrayerScroll");
      const face=[...root.querySelectorAll("[data-pb-latin],[data-pb-vern]")]
        .find(x=>!x.hidden);
      return !!face&&face.querySelectorAll(".aoDevoParagraph[data-ao-devo-active='true']").length===1;
    },null,{timeout:7000});
    assert.equal(await page.evaluate(()=>window.AO_ROSARY_V381.state().step),card.rawStep,
      "Rosary language flip changed the canonical bead");
   }
   const gesture=async(dx,dy)=>{
     await player.locator(".aoRosaryPrayerScroll").evaluate((node,{dx,dy})=>{
       const t=(x,y)=>new Touch({identifier:24,target:node,clientX:x,clientY:y});
       node.dispatchEvent(new TouchEvent("touchstart",{bubbles:true,cancelable:true,touches:[t(235,350)],changedTouches:[t(235,350)]}));
       node.dispatchEvent(new TouchEvent("touchend",{bubbles:true,cancelable:true,touches:[],changedTouches:[t(235+dx,350+dy)]}));
     },{dx,dy});
   };
   await gesture(5,-135);
   assert.equal(await page.evaluate(()=>window.AO_ROSARY_V381.state().step),card.rawStep,
     "Vertical prayer scroll incorrectly advanced a Rosary bead or mystery");
   const currentPosition=options.findIndex(ch=>ch.start===jump.start);
   assert.ok(currentPosition>=0&&currentPosition<options.length-1,"No following mystery for swipe test");
   const nextChapter=options[currentPosition+1];
   await gesture(-160,4);
   await page.waitForFunction(index=>window.AO_ROSARY_V381?.state?.()?.step===index,nextChapter.start,{timeout:9000});
   await page.waitForFunction(start=>document.querySelector(
     "#aoPrayerBookRoot.open .aoRosaryNamedTimeline [aria-current='step']")?.getAttribute("data-ao-rosary-chapter")===String(start),
     nextChapter.start,{timeout:9000});
   assert.notEqual(await player.locator(".aoRosaryActiveCard").getAttribute("data-ao-devo-card"),card.chapter,
     "Rosary active card did not advance exactly one named chapter");
   await gesture(160,4);
   await page.waitForFunction(index=>window.AO_ROSARY_V381?.state?.()?.step===index,jump.start,{timeout:9000});
   await page.waitForFunction(()=>document.querySelectorAll(
      "#aoPrayerBookRoot.open .aoRosaryActiveCard .aoDevoParagraph[data-ao-devo-active='true']").length===1,
     null,{timeout:9000});
   // Real Guided-bead Scripture links now open the same contextual Bible
   // reader as the 20 mystery openings. The canonical bead index must survive
   // passage/chapter/commentary navigation and exact-origin return.
   const citedBead=await page.evaluate(start=>{
     const steps=globalThis.AO_ROSARY_V381.steps();
     return steps.findIndex((step,index)=>index>start&&
       step.mi===steps[start].mi&&step.cue&&Number.isInteger(step.bead)&&step.bead>0);
   },jump.start);
   assert.ok(citedBead>jump.start,"A mystery has no source-owned Guided citation bead");
   for(let n=jump.start;n<citedBead;n++){
     await player.locator("[data-lab-rosary-next]").click();
     await page.waitForFunction(index=>globalThis.AO_ROSARY_V381.state().step===index,
       n+1,{timeout:9000});
   }
   const beadSource=player.locator(
     ".aoRosaryBeadScripture a[data-ao-rosary-meditation-source][data-ao-scripture-context]").first();
   await beadSource.waitFor({state:"visible",timeout:9000});
   if(width===390){
     const restored=player.locator(".aoRosaryBeadScripture");
     await restored.waitFor({state:"visible",timeout:12000});
     assert.match(await restored.locator(".aoRosaryBeadScriptureLabel").innerText(),/SCRIPTURE/);
     assert.equal(await restored.locator(".aoRosaryEnglishFlip").count(),1,
       "One unobtrusive translation flip, not two full buttons");
     await restored.locator(".aoRosaryBeadVerse").first().waitFor({state:"visible",timeout:12000});
     const rosaryBead=await page.evaluate(()=>window.AO_ROSARY_V381.state().step);
     await restored.locator('[data-ao-rosary-english-edition="cpdv-2009"]').click();
     await restored.locator(".aoRosaryBeadVerse").first().waitFor({state:"visible",timeout:12000});
     assert.equal(await restored.locator('[data-ao-rosary-active-edition="cpdv-2009"]').count(),1);
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-scripture-v1")).englishEdition),"cpdv-2009");
     assert.equal(await page.evaluate(()=>window.AO_ROSARY_V381.state().step),rosaryBead,
       "Bible translation toggle must never advance a prayer bead");
     await restored.locator('[data-ao-rosary-english-edition="dr-challoner"]').click();
     await restored.locator(".aoRosaryBeadVerse").first().waitFor({state:"visible",timeout:12000});
     assert.equal(await restored.locator('[data-ao-rosary-active-edition="dr-challoner"]').count(),1);
     assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-scripture-v1")).englishEdition),"dr-challoner");
     assert.equal(await restored.getAttribute("data-ao-rosary-verse-status"),
       "UNCOLLATED_SOURCE_WITNESS","Do not mislabel a source transcription as certified text");
     assert.ok((await restored.locator(".aoRosaryBeadVerse").first().innerText()).length>12);
     const fathers=restored.locator("[data-ao-rosary-church-fathers]");
     if(await fathers.count()){
       await fathers.click();
       const patristic=page.locator("#ao-scripture-overlay");
       await patristic.waitFor({state:"visible",timeout:12000});
       await patristic.locator(".aoScriptureFatherText").first().waitFor({state:"visible",timeout:15000});
       assert.ok((await patristic.locator(".aoScriptureFatherText").first().innerText()).length>80);
       await patristic.locator("[data-scripture-close]").click();
       assert.equal(await page.evaluate(()=>globalThis.AO_ROSARY_V381.state().step),citedBead,
         "Church Fathers deep link must not progress the canonical Rosary");
     }
   }
   const citedReference=await beadSource.getAttribute("data-ao-scripture-context");
   assert.match(citedReference,/^[A-Za-z1-3 ]+\s+\d+:\d+/,
     "The same original bead reference must be used in the shared Bible reader");
   assert.match(await beadSource.getAttribute("href"),/^https:\/\//,
     "Keep exact external Catholic source witness as fallback");
   await beadSource.click();
   const scripture=page.locator("#ao-scripture-overlay");
   await scripture.waitFor({state:"visible",timeout:10000});
   assert.equal(await scripture.locator("[data-scripture-context-depth='selected']").count(),1,
     "Bead source opened an external page or another Scripture reader");
   await scripture.locator("[data-scripture-context-depth='chapter']").click();
   assert.ok(await scripture.locator(".aoScriptureVerse").count()>5,
     "Biblical chapter must display original source-witness verses in-app");
   await scripture.locator("[data-scripture-close]").click();
   assert.equal(await page.evaluate(()=>globalThis.AO_ROSARY_V381.state().step),citedBead,
     "Opening a Bible chapter advanced the original Rosary bead engine");
   assert.equal(await player.locator(".aoRosaryGuidedBeadMeditation").count(),1,
     "Scripture return discarded the existing source-owned meditation");
   assert.deepEqual(errors,[],"Uncaught reader errors: "+errors.slice(0,5).join("; "));
   console.log("PASS "+width+"px canonical Rosary: 44px controls, source, guide, no overflow/state mutation");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
