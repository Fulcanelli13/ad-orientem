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
    const candidates=[0,maxScroll];
    for(let y=Math.max(0,Math.floor((ideal-160)/12)*12);
      y<=Math.min(maxScroll,ideal+180);y+=12)candidates.push(y);
    for(const y of [...new Set(candidates)]){
      scroller.scrollTop=Math.max(0,Math.min(maxScroll,y));
      scroller.dispatchEvent(new Event("scroll",{bubbles:true}));
      await frame();
      if(api.getActiveCue()===cue)return {found:true,cue:api.getActiveCue(),section:card.sectionId};
    }
    return {found:false,reason:"cue not focusable",active:api.getActiveCue(),
      section:card.sectionId,maxScroll,center,ideal};
  },cueId);
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
          el.dataset.sourceCueIds?.split(/\\s+/).includes(window.__AO_PHONE_PREVIEW.getActiveCue()))
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
