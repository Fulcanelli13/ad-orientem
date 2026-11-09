import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Real R17 native 65-card reader. Obsolete query selectors must not restore a
// 48-card UI. Screenshots do not claim a priestly action was observed.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/live-cinematics");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const data=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4188,"127.0.0.1",ok)});
const SCENES=Object.freeze([
  ["AO.SM.C0173","HOST_WORDS"],
  ["AO.SM.C0174","HOST_ELEVATION"],
  ["AO.SM.C0179","CHALICE_WORDS"],
  ["AO.SM.C0181","CHALICE_ELEVATION"],
  ["AO.SM.C0096","INCARNATUS_GESTURE"],
  ["AO.SM.C0161","HANC_IGITUR_HANDS"],
  ["AO.SM.C0084","GOSPEL_CROSSES"],
]);
async function atCue(page,cueId){
  return page.evaluate(async cue=>{
    const api=window.__AO_PHONE_PREVIEW;
    const card=api.model.cards.find(c=>c.paragraphs.some(p=>p.sourceCueIds?.includes(cue)));
    if(!card)return {found:false,reason:"missing source cue"};
    api.showSequence(card.sequence);
    const frame=()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
    await frame();
    const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
    const node=[...scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]")]
      .find(n=>n.dataset.cueId===cue || n.dataset.sourceCueIds?.split(" ").includes(cue));
    if(!node)return {found:false,reason:"missing DOM cue",card:card.sectionId};
    const r=node.getBoundingClientRect(),c=scroller.getBoundingClientRect();
    const center=r.top-c.top+scroller.scrollTop+r.height/2;
    const maxScroll=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
    const ideal=center-scroller.clientHeight*.39;
    // The Gospel crosses occupy a short cue near a long reading. Testing
    // the first transient matching frame can select the exact scroll boundary,
    // where a later layout/scene refresh legitimately reveals the previous
    // source cue. Require a stationary, multi-frame focus interval, with
    // the same exact cue and cinematic scene. Do NOT accept C0083 as C0084
    // or alter the production source tracker to make the test green.
    const gospel=cue==="AO.SM.C0084";
    const candidates=[0,maxScroll];
    for(let y=Math.max(0,Math.floor((ideal-160)/12)*12);
      y<=Math.min(maxScroll,ideal+180);y+=12)candidates.push(y);
    const positions=[...new Set(candidates)].sort((a,b)=>
      Math.abs(a-ideal)-Math.abs(b-ideal));
    const diagnostics=[];
    for(const y of positions){
      scroller.scrollTop=Math.max(0,Math.min(maxScroll,y));
      scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
      await frame();
      if(api.getActiveCue()!==cue){
        if(gospel&&diagnostics.length<12)diagnostics.push({
          scrollTop:scroller.scrollTop,maxScroll:Math.max(0,scroller.scrollHeight-scroller.clientHeight),
          firstCue:api.getActiveCue(),scene:document.querySelector("[data-ao-reader-shell]")?.dataset.cinematicScene
        });
        continue;
      }
      if(!gospel)return {found:true,cue:api.getActiveCue(),section:card.sectionId};
      const frames=[];
      for(let sample=0;sample<8;sample++){
        await frame();
        const shell=document.querySelector("[data-ao-reader-shell]");
        frames.push({
          cue:api.getActiveCue(),scene:shell?.dataset.cinematicScene,
          scrollTop:scroller.scrollTop,
          maxScroll:Math.max(0,scroller.scrollHeight-scroller.clientHeight)
        });
      }
      if(frames.every(x=>x.cue===cue&&x.scene==="GOSPEL_CROSSES"))
        return {found:true,cue:api.getActiveCue(),section:card.sectionId,
          stableFrames:frames.length,settledScrollTop:scroller.scrollTop,
          settledMaxScroll:frames.at(-1).maxScroll};
      if(diagnostics.length<12)diagnostics.push({selectedScrollTop:y,frames});
    }
    return {found:false,reason:gospel?"Gospel cue has no stable 8-frame cinematic focus interval":
      "cue not focusable",active:api.getActiveCue(),
      section:card.sectionId,maxScroll,center,ideal,diagnostics};
  },cueId);
}
// Issue #2714: exercise native touch scrolling as well as the deterministic
// programmatic cue targeting above. This is an acceptance probe, not a cue
// override: the production tracker must continue to own all state changes.
async function touchGospelFocus(page,width,lang){
  const cue="AO.SM.C0084", scene="GOSPEL_CROSSES";
  const settled=await atCue(page,cue);
  assert.equal(settled.found,true,"No pre-touch Gospel focus interval: "+JSON.stringify(settled));
  const start=await page.evaluate(scrollTarget=>{
    const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
    scroller.scrollTop=Math.max(0,scrollTarget-12);
    scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
    const rect=scroller.getBoundingClientRect();
    window.__aoGospelTouchScroll=[];
    scroller.addEventListener("scroll",()=>{
      window.__aoGospelTouchScroll.push({
        time:performance.now(),scrollTop:scroller.scrollTop,
        cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
        scene:document.querySelector("[data-ao-reader-shell]")?.dataset.cinematicScene
      });
    },{passive:true});
    return {
      x:rect.left+rect.width/2,
      y:Math.min(rect.bottom-34,Math.max(rect.top+34,rect.top+rect.height*.65)),
      scrollTop:scroller.scrollTop,maxScroll:scroller.scrollHeight-scroller.clientHeight
    };
  },settled.settledScrollTop);
  assert.ok(start.maxScroll-start.scrollTop>=26,
    "C0084 lacks travel for the actual touch gesture: "+JSON.stringify(start));
  const session=await page.context().newCDPSession(page);
  try{
    const touchPoint=(y)=>[{x:start.x,y}];
    await session.send("Input.dispatchTouchEvent",{
      type:"touchStart",touchPoints:touchPoint(start.y)
    });
    for(let step=1;step<=6;step++){
      await session.send("Input.dispatchTouchEvent",{
        type:"touchMove",touchPoints:touchPoint(start.y-4*step)
      });
      await page.waitForTimeout(65);
    }
    await session.send("Input.dispatchTouchEvent",{
      type:"touchEnd",touchPoints:[]
    });
  }finally{
    await session.detach();
  }
  // Sample both the compositor's settling interval and a delayed content
  // layout pass; never accept a one-frame C0084 flash as a success.
  const frames=[];
  for(let sample=0;sample<10;sample++){
    await page.waitForTimeout(55);
    frames.push(await page.evaluate(()=>{
      const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
      return {scrollTop:scroller.scrollTop,
        maxScroll:scroller.scrollHeight-scroller.clientHeight,
        cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
        scene:document.querySelector("[data-ao-reader-shell]")?.dataset.cinematicScene};
    }));
  }
  const trace=await page.evaluate(()=>window.__aoGospelTouchScroll??[]);
  assert.ok(trace.length>0 &&
    Math.max(...trace.map(x=>x.scrollTop))>=start.scrollTop+4,
    width+"px "+lang+" did not perform a native touch scroll: "+JSON.stringify({start,trace}));
  assert.ok(frames.every(x=>x.cue===cue&&x.scene===scene),
    width+"px "+lang+" Gospel touch/reflow focus drift: "+JSON.stringify({start,trace,frames}));
}

// Independent issue #2714 boundary acceptance: move the actual mobile touch
// viewport FROM the preceding Gospel announcement C0083 INTO C0084. A test
// starting already inside C0084 cannot detect an unstable forward handoff.
async function touchGospelBoundary(page,width,lang){
  const next="AO.SM.C0084",previous="AO.SM.C0083",scene="GOSPEL_CROSSES";
  const target=await atCue(page,next);
  assert.equal(target.found,true,"No C0084 boundary destination: "+JSON.stringify(target));
  const setup=await page.evaluate(async end=>{
    const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
    const api=window.__AO_PHONE_PREVIEW;
    const frame=()=>new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));
    let start=null;
    for(let delta=24;delta<=220;delta+=8){
      scroller.scrollTop=Math.max(0,end-delta);
      scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
      await frame();
      if(api.getActiveCue()==="AO.SM.C0083"){start=scroller.scrollTop;break;}
    }
    if(start===null)return {found:false,reason:"Cannot find earlier C0083 boundary",end,
      cue:api.getActiveCue(),maxScroll:scroller.scrollHeight-scroller.clientHeight};
    const rect=scroller.getBoundingClientRect();
    window.__aoGospelBoundarySamples=[];
    window.__aoGospelBoundaryMonitoring=true;
    const sample=()=>{
      if(!window.__aoGospelBoundaryMonitoring)return;
      const shell=document.querySelector("[data-ao-reader-shell]");
      window.__aoGospelBoundarySamples.push({
        time:performance.now(),scrollTop:scroller.scrollTop,
        maxScroll:scroller.scrollHeight-scroller.clientHeight,
        cue:api.getActiveCue(),scene:shell?.dataset.cinematicScene
      });
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
    return {found:true,start,end,x:rect.left+rect.width/2,
      y:rect.top+rect.height*.66,initialCue:api.getActiveCue(),
      maxScroll:scroller.scrollHeight-scroller.clientHeight};
  },target.settledScrollTop);
  assert.equal(setup.found,true,width+"px "+lang+" "+JSON.stringify(setup));
  assert.equal(setup.initialCue,previous);
  const distance=setup.end-setup.start;
  assert.ok(distance>=16&&distance<=220,
    "Unsupported Gospel transition gesture distance: "+JSON.stringify(setup));
  const session=await page.context().newCDPSession(page);
  try{
    await session.send("Input.dispatchTouchEvent",{
      type:"touchStart",touchPoints:[{x:setup.x,y:setup.y}]
    });
    for(let step=1;step<=14;step++){
      await session.send("Input.dispatchTouchEvent",{
        type:"touchMove",touchPoints:[{x:setup.x,y:setup.y-distance*step/14}]
      });
      await page.waitForTimeout(65);
    }
    await session.send("Input.dispatchTouchEvent",{
      type:"touchEnd",touchPoints:[]
    });
  }finally{await session.detach();}
  // Real delayed content reflow, analogous to an inline neume/rubric settling:
  // a temporary empty spacer changes DOM geometry but not original Latin,
  // cue IDs, paragraph order or canonical words.
  await page.waitForTimeout(240);
  const injected=await page.evaluate(()=>{
    const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
    const row=scroller.querySelector('.ao-reader-paragraph[data-cue-id="AO.SM.C0082"]');
    if(!row)return false;
    const spacer=document.createElement("span");
    spacer.dataset.testGospelLayout="true";
    spacer.style.cssText="display:block;height:12px;pointer-events:none";
    row.append(spacer);
    return true;
  });
  assert.equal(injected,true,"Missing source row for layout reflow acceptance");
  await page.waitForTimeout(165);
  await page.evaluate(()=>document.querySelector('[data-test-gospel-layout="true"]')?.remove());
  await page.waitForTimeout(420);
  const observed=await page.evaluate(()=>{
    window.__aoGospelBoundaryMonitoring=false;
    return window.__aoGospelBoundarySamples??[];
  });
  const tail=observed.slice(-14);
  assert.ok(observed.some(frame=>frame.cue===previous)&&
    observed.some(frame=>frame.cue===next),
    width+"px "+lang+" native touch did not cross both Gospel cues: "+
      JSON.stringify({setup,observed:observed.slice(-40)}));
  assert.ok(observed.some(frame=>frame.scrollTop>=setup.start+8),
    "No actual native Gospel boundary scrolling: "+JSON.stringify({setup,observed:observed.slice(-40)}));
  assert.equal(tail.length,14,"Insufficient final layout-settled frames");
  assert.ok(tail.every(frame=>frame.cue===next&&frame.scene===scene),
    width+"px "+lang+" C0084 regressed after source-preserving content reflow: "+
      JSON.stringify({setup,tail,observed:observed.slice(-40)}));
}

// Gospel terminal response is a distinct sourced reading turn. Test its
// actual mobile DOM, not only the geometry-only unit fixture, and ensure
// that the following C0088 rubric does not swallow "Laus tibi, Christe".
async function gospelResponseFocus(page,width,lang){
  const cue="AO.SM.C0087",after="AO.SM.C0088";
  const focused=await atCue(page,cue);
  assert.equal(focused.found,true,
    width+"px "+lang+" source response cannot be focused: "+JSON.stringify(focused));
  const result=await page.evaluate(async ({cue,after})=>{
    const api=window.__AO_PHONE_PREVIEW;
    const scroller=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
    const find=id=>[...scroller.querySelectorAll(".ao-reader-paragraph[data-cue-id]")]
      .find(node=>node.dataset.cueId===id);
    const response=find(cue),closing=find(after),before=find("AO.SM.C0083");
    if(!response||!closing||!before)return {found:false,reason:"Missing distinct Gospel source paragraph"};
    const primary=response.querySelector(".ao-line-primary");
    const source=primary?.textContent?.trim()??"";
    const raf=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const sample=()=>{
      const line=primary?.getBoundingClientRect();
      const view=scroller.getBoundingClientRect();
      return {
        cue:api.getActiveCue(),
        scrollTop:scroller.scrollTop,
        maxScroll:Math.max(0,scroller.scrollHeight-scroller.clientHeight),
        reading:response.dataset.readingPosition,
        visible:Boolean(line&&line.height>0&&line.bottom>view.top+3&&line.top<view.bottom-3),
      };
    };
    const stable=[];
    for(let i=0;i<9;i++){await raf();stable.push(sample());}
    const spacer=document.createElement("span");
    spacer.dataset.gospelResponseLayoutTest="true";
    spacer.style.cssText="display:block;height:10px;pointer-events:none";
    before.append(spacer);
    const reflow=[];
    for(let i=0;i<5;i++){await raf();reflow.push(sample());}
    spacer.remove();
    for(let i=0;i<5;i++){await raf();reflow.push(sample());}
    // Slow source-monotonic scroll must give C0087 a genuine interval
    // and ultimately hand off to the exact terminal rubric C0088.
    const travel= Math.max(0,scroller.scrollHeight-scroller.clientHeight-scroller.scrollTop);
    const sequence=[];
    const start=scroller.scrollTop;
    const max=Math.max(0,scroller.scrollHeight-scroller.clientHeight);
    for(let target=start;target<=max+10;target+=12){
      scroller.scrollTop=Math.min(max,target);
      scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
      await raf();
      sequence.push(sample());
      if(scroller.scrollTop>=max-1)break;
    }
    return {found:true,source,stable,reflow,travel,sequence};
  },{cue,after});
  assert.equal(result.found,true,width+"px "+lang+" "+JSON.stringify(result));
  assert.ok(/Laus\s+tibi[,\s]+Christe/i.test(result.source),
    "The source-owned Gospel response words are missing: "+JSON.stringify(result.source));
  assert.ok(result.stable.every(s=>s.cue===cue&&s.visible&&s.reading==="current"),
    width+"px "+lang+" response lost settled focus: "+JSON.stringify(result.stable));
  assert.ok(result.reflow.every(s=>s.cue===cue&&s.visible&&s.reading==="current"),
    width+"px "+lang+" Gospel response drifted on delayed layout: "+JSON.stringify(result.reflow));
  assert.ok(result.travel>=12,
    width+"px "+lang+" C0087 has no scroll interval before C0088: "+result.travel);
  assert.ok(result.sequence.some(s=>s.cue===after),
    width+"px "+lang+" closing C0088 cannot be reached by scroll: "+JSON.stringify(result.sequence));
  const firstClosing=result.sequence.findIndex(s=>s.cue===after);
  assert.ok(result.sequence.slice(firstClosing).every(s=>s.cue===after),
    width+"px "+lang+" C0088 regressed after handoff: "+JSON.stringify(result.sequence));
}

async function snapshot(page,width,lang,cueId,expected,{reducedMotion=false}={}){
  const moved=await atCue(page,cueId);
  assert.equal(moved.found,true,cueId+": "+JSON.stringify(moved));
  await page.waitForFunction(x=>
    document.querySelector("[data-ao-reader-shell]")?.dataset.cinematicScene===x,
    expected,{timeout:3500});
  const actual=await page.evaluate(()=>{
    const shell=document.querySelector("[data-ao-reader-shell]");
    const cinema=shell.querySelector('[data-role="cinematic"]');
    const scroller=shell.querySelector(".ao-prayer-card");
    const active=[...scroller.querySelectorAll('.ao-reader-paragraph[data-active="true"]')];
    const hasVisibleText=active.some(el=>{
      const p=el.querySelector(".ao-line-primary"),rect=p?.getBoundingClientRect();
      const bound=scroller.getBoundingClientRect();
      return p && p.textContent.trim().length>0 &&
        rect?.height>0 && rect.bottom>bound.top && rect.top<bound.bottom &&
        getComputedStyle(p).visibility!=="hidden" &&
        Number(getComputedStyle(p).opacity)!==0;
    });
    const priest=shell.querySelector('.ao-rail-right .ao-rail-item[data-channel="priest-action"]');
    const gesture=shell.querySelector('.ao-rail-left .ao-rail-item[data-channel="gesture"]');
    const icon=priest?.querySelector(".ao-icon-mask");
    return {
      scene:shell.dataset.cinematicScene,
      mode:shell.dataset.mode,
      cards:window.__AO_PHONE_PREVIEW.model.totalCards,
      cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
      hasVisibleText,
      textScrollable:scroller.scrollHeight>scroller.clientHeight,
      horizontallyOverflowing:document.documentElement.scrollWidth>innerWidth+1,
      fullScreenVisible:!cinema.hidden && getComputedStyle(cinema).display!=="none",
      visualMode:shell.dataset.cinematicVisual,
      cinematicHeight:cinema.getBoundingClientRect().height,
      cinematicTop:cinema.getBoundingClientRect().top,
      lastParagraphBottom:Math.max(0,...[...scroller.querySelectorAll(".ao-reader-paragraph")]
        .filter(el=>!el.hidden).map(el=>el.getBoundingClientRect().bottom)),
      cinematicBackground:getComputedStyle(cinema).backgroundColor,
      cinematicCaptionBottom:cinema.querySelector(".ao-cinematic-sub")?.getBoundingClientRect().bottom??null,
      navTop:shell.querySelector(".ao-reader-progress")?.getBoundingClientRect().top??null,
      priestDisplay:priest ? getComputedStyle(priest).display : null,
      // Some elevations intentionally suppress a blank donor icon and keep
      // the exact 1962 source action as a readable in-paragraph rubric.
      // A rail fallback is acceptable only when that exact cue remains
      // visibly sourced, never merely because the prayer text is on screen.
      sourceActionRubric:[...scroller.querySelectorAll(".ao-reader-paragraph")]
        .filter(el=>el.dataset.cueId===window.__AO_PHONE_PREVIEW.getActiveCue() ||
          el.dataset.sourceCueIds?.split(" ").includes(window.__AO_PHONE_PREVIEW.getActiveCue()))
        .some(el=>[...el.querySelectorAll(
          ".ao-iconless-source-rubric[data-source-cue-id],"+
          ".ao-live-inline-rubrics [data-source-cue-id]"
        )].some(note=>{
          if(note.dataset.sourceCueId!==window.__AO_PHONE_PREVIEW.getActiveCue())return false;
          const rect=note.getBoundingClientRect();
          const bounds=scroller.getBoundingClientRect();
          const css=getComputedStyle(note);
          return rect.height>0 && rect.bottom>bounds.top+2 && rect.top<bounds.bottom-2 &&
            css.display!=="none" && css.visibility!=="hidden" && Number(css.opacity)>0 &&
            note.textContent.trim().length>0;
        })),
      priestActive:priest?.dataset.active??"false",
      priestIcon:icon?.dataset.iconKey??null,
      gestureActive:gesture?.dataset.active??"false",
      reducedMotion:matchMedia("(prefers-reduced-motion: reduce)").matches,
      iconAnimation:icon?.getAnimations?.().map(a=>a.animationName??"")??[],
    };
  });
  assert.equal(actual.mode,"LIVE");
  assert.equal(actual.scene,expected);
  assert.equal(actual.cue,cueId);
  assert.equal(actual.hasVisibleText,true,
    "Source words were obscured or offscreen: "+JSON.stringify(actual));
  assert.equal(actual.horizontallyOverflowing,false,"Cinematic caused phone horizontal overflow");
  if(expected.endsWith("_ELEVATION")){
    assert.equal(actual.priestActive,"true",
      "No certified priest-action rail during elevation");
    assert.ok(["ICON","RAIL"].includes(actual.visualMode),
      "Elevation lacks explicit text-safe visual treatment: "+JSON.stringify(actual));
    if(actual.visualMode==="ICON"){
      assert.equal(actual.fullScreenVisible,true,"Measured empty stage did not show elevation icon");
      assert.ok(actual.cinematicHeight<=174,"Elevation replaced with full-screen takeover");
      assert.ok(actual.cinematicCaptionBottom<=actual.navTop-10,
        "Elevation caption overlaps the bottom card counter: "+JSON.stringify(actual));
      assert.ok(actual.cinematicTop>=actual.lastParagraphBottom+2,
        "Large elevation art overlaps source words/rubrics: "+JSON.stringify(actual));
      assert.equal(actual.priestDisplay,"none",
        "Major icon duplicated rather than replacing its right-rail source");
      assert.equal(actual.cinematicBackground,"rgba(0, 0, 0, 0)",
        "Elevation reintroduced opaque background over missal text");
    }else{
      assert.equal(actual.fullScreenVisible,false,
        "No spare room but a cinematic overlay covered source prayers");
      assert.ok(actual.priestDisplay!=="none" || actual.sourceActionRubric,
        "No spare room: neither priest icon nor exact visible source action rubric: "+JSON.stringify(actual));
    }
  }
  if(expected==="INCARNATUS_GESTURE"){
    assert.equal(actual.gestureActive,"true","Incarnatus cue lost faithful gesture rail");
    assert.equal(actual.fullScreenVisible,false,"Incarnatus obscured the actual prayer");
  }
  if(["HANC_IGITUR_HANDS","GOSPEL_CROSSES"].includes(expected)){
    assert.equal(actual.fullScreenVisible,false,
      "Ordinary Gospel/Hanc visual focus introduced an opaque overlay");
    assert.equal(actual.priestActive,"true","Sourced priest-action cue disappeared");
  }
  if(reducedMotion)assert.equal(actual.reducedMotion,true);
  // Capture after the icon's opening animation, not its 0%-opacity keyframe.
  if(expected.endsWith("_ELEVATION"))await page.waitForTimeout(540);
  await page.screenshot({path:resolve(out,
    width+"-"+lang+"-"+cueId.slice(-4)+(reducedMotion?"-reduced":"")+".png")});
  return actual;
}
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const {width,lang,motion,query} of [
    {width:390,lang:"en",motion:"no-preference",query:"production=1&aoLiveCards=48"},
    {width:320,lang:"fr",motion:"no-preference",query:"production=1&aoLiveCards=48"},
    {width:390,lang:"en",motion:"reduce",query:"production=1&aoLiveCards=48"},
    {width:390,lang:"en",motion:"no-preference",query:"production=1&aoLiveCards=65"},
  ]){
    const context=await browser.newContext({
      viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,
      hasTouch:true,locale:lang==="fr"?"fr-FR":"en-GB",reducedMotion:motion,
    });
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",error=>errors.push(String(error.message??error)));
    await page.goto("http://127.0.0.1:4188/tests/fixtures/reader-phone-harness.html?"+query+"&lang="+lang,
      {waitUntil:"networkidle",timeout:45000});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
      null,{timeout:20000});
    const count=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards);
    assert.equal(count,65,"Public LIVE must retain the canonical 65-card structure regardless of obsolete URL selectors");
    // Check each source-owned cue in the actual production 65-card LIVE
    // presentation. A compressed paragraph that cannot receive focus is a
    // real reader defect, not grounds to switch to the retired 48-card UI.
    const selected=SCENES;
    for(const [cue,scene] of selected){
      await snapshot(page,width,lang,cue,scene,{reducedMotion:motion==="reduce"});
    }
    // Native finger input and delayed settling, not only scrollTop injection.
    // Run on both small-phone localizations; preserve all other scene checks.
    if((width===390&&lang==="en"&&motion==="no-preference"&&query.includes("48")) ||
       (width===320&&lang==="fr"))
      { await touchGospelFocus(page,width,lang); await touchGospelBoundary(page,width,lang); }
    // The terminal Gospel response must remain legible independently from
    // both the small-crosses cinematic and the following C0088 rubric.
    await gospelResponseFocus(page,width,lang);
    // Changing cards always clears the scene. No stale elevation halo.
    await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSequence(1));
    await page.waitForFunction(()=>
      document.querySelector("[data-ao-reader-shell]")?.dataset.cinematicScene==="NONE",
      null,{timeout:3500});
    assert.deepEqual(errors,[],width+" "+lang+" "+query+" runtime errors");
    await context.close();
  }
  // Good Friday has its own R28 source graph; ordinary AO.SM cue focus
  // must never be used to manufacture the death pause.
  {
    const context=await browser.newContext({viewport:{width:390,height:844},
      deviceScaleFactor:1,isMobile:true,hasTouch:true,locale:"en-GB"});
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",e=>errors.push(String(e.message??e)));
    await page.goto("http://127.0.0.1:4188/tests/fixtures/reader-phone-harness.html?rite=good-friday&form=SOLEMN",
      {waitUntil:"networkidle",timeout:45000});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
      null,{timeout:20000});
    const actual=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const before=api.getGoodFridayState().step.recordId;
      api.goToGoodFridayRecord("GF-PASS-320");
      const shell=document.querySelector("[data-ao-reader-shell]");
      const state=api.getGoodFridayState();
      const scene=shell?.dataset.cinematicScene;
      const primary=[...shell.querySelectorAll(".ao-reader-paragraph")]
        .find(el=>el.dataset.cueId==="GF-PASS-320");
      const text=primary?.querySelector(".ao-line-primary");
      const walk=text && document.createTreeWalker(text,NodeFilter.SHOW_TEXT);
      let visible=false,wordTop=null;
      if(walk){
        let node;
        while((node=walk.nextNode())){
          const words=String(node.textContent??"").toLowerCase();
          const at=words.lastIndexOf("tradidit spiritum");
          if(at<0)continue;
          const range=document.createRange();
          range.setStart(node,at);
          range.setEnd(node,at+"tradidit spiritum".length);
          const rect=range.getBoundingClientRect(),bounds=shell.querySelector(".ao-prayer-card").getBoundingClientRect();
          wordTop=rect.top;
          visible=rect.height>0 && rect.bottom>bounds.top+5 && rect.top<bounds.bottom-5;
          break;
        }
      }
      return {before,record:state.step.recordId,posture:state.posture,
        deathPause:window.AO_R17_NATIVE_READER_STATE?.deathPause,
        scene,visible,wordTop,scrollTop:shell.querySelector(".ao-prayer-card").scrollTop,
        reading:api.getCurrentCard()?.title};
    });
    assert.equal(actual.record,"GF-PASS-320");
    assert.equal(actual.scene,"PASSION_DEATH");
    assert.equal(actual.deathPause,true);
    assert.equal(actual.posture,"KNEEL");
    assert.equal(actual.visible,true,
      "Exact 'tradidit spiritum' phrase is not inside the visible phone reading viewport: "+JSON.stringify(actual));
    assert.ok(actual.scrollTop>0,"Explicit Passion death jump incorrectly stayed at the beginning of the Gospel");
    await page.screenshot({path:resolve(out,"390-en-good-friday-death.png")});
    const after=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      api.goToGoodFridayRecord("GF-PASS-330");
      return {scene:document.querySelector("[data-ao-reader-shell]")?.dataset.cinematicScene,
        posture:api.getGoodFridayState().posture,
        deathPause:window.AO_R17_NATIVE_READER_STATE?.deathPause};
    });
    assert.equal(after.scene,"NONE","Passion death stillness leaked into the resumed Gospel");
    assert.equal(after.posture,"STAND");
    assert.equal(after.deathPause,false);
    assert.deepEqual(errors,[],"Good Friday source graph browser errors");
    await context.close();
  }
  console.log("PASS actual LIVE 48/65 phone cinematics: EN/FR, 320/390px, two Elevations, both Consecrations, Incarnatus, Hanc, Gospel and R28 Passion, no blackout, no stale scene, reduced motion.");
}finally{
  await browser?.close();
  await new Promise(done=>server.close(done));
}
