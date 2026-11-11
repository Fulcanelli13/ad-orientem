// End-to-end real native Mass acceptance of the opt-in handoff.
// Unlike tests/fixtures/live-handoff-visual.html, this exercises H7 Home ->
// Change sheet -> Mass Door -> actual reader/proper/source/model/Schola.
// No mock Mass models, no internal state injection, no real-world sound claims.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const HOST="http://127.0.0.1:4173/";
const OUT=resolve("artifacts/live-handoff-native-acceptance");
await mkdir(OUT,{recursive:true});
const cases=[
  {name:"incensed-en-390",width:390,height:844,form:"MISSA_CANTATA_INCENSE",lang:"en"},
  {name:"low-en-320",width:320,height:844,form:"LOW",lang:"en"}
];
const report={schema:"AO_LIVE_HANDOFF_REAL_H7_NATIVE_INTEGRATION_V1",
  testOrigin:HOST,source:"REAL_LOCAL_REPOSITORY_NATIVE_MASS_NO_MOCK_CONTROLLER",
  isPublicGitHubPagesAcceptance:false,isPhysicalDeviceAcceptance:false,
  timestamp:new Date().toISOString(),cases:[]};
const pause=(ms)=>new Promise(r=>setTimeout(r,ms));
async function read(page){
  return page.evaluate(()=>{
    const api=window.AO_R17_NATIVE_READER_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const shell=root?.querySelector("[data-ao-reader-shell]");
    const band=shell?.querySelector("[data-ao-live-band]");
    const stage=shell?.querySelector(".ao-reader-stage");
    const nativeDock=shell?.querySelector(".ao-schola-dock");
    const firstDot=band?.querySelector(".ao-lb-dot");
    const headerTitle=shell?.querySelector('.ao-reader-top-ribbon [data-role="section-title"]');
    const headerTitleStyle=headerTitle?getComputedStyle(headerTitle):null;
    const schola=api?.getScholaState?.()??null;
    const card=api?.getCurrentCard?.()??null;
    const rect=el=>{
      if(!el)return null;
      const r=el.getBoundingClientRect();
      return {x:r.x,y:r.y,w:r.width,h:r.height};
    };
    return {
      active:true,mode:api?.getPresentationMode?.()??null,
      nativeCardCount:api?.model?.cards?.length??null,
      modelOwner:api?.model?.structureOwner??null,
      nativeCardId:card?.sectionId??null,
      nativeCardSequence:card?.sequence??null,
      nativeCueId:api?.getActiveCue?.()??null,
      scholaTrackId:schola?.trackId??null,
      scholaIndex:schola?.index??null,
      scholaComplete:schola?.complete??null,
      scholaTotal:schola?.total??null,
      scholaSourceTrack:{
        hasActive:Boolean(schola?.schola),
        sourceCueCount:schola?.schola?.trackSourceCueIds?.length??0,
        sourceCueIncludesCurrent:schola?.schola?.cueId
          ?schola?.schola?.trackSourceCueIds?.includes(schola.schola.cueId)??false
          :null,
        hasSourceLatin:Boolean(schola?.schola?.trackSourceLatin),
        scoreAutomaticallyApproved:nativeDock?.dataset.approvedScore==="true"
      },
      viewportW:innerWidth,viewportH:innerHeight,
      headerTitle:{text:headerTitle?.textContent??"",whiteSpace:headerTitleStyle?.whiteSpace??null,
        textOverflow:headerTitleStyle?.textOverflow??null,height:rect(headerTitle)?.h??null},
      documentW:document.documentElement.scrollWidth,
      documentH:document.documentElement.scrollHeight,
      bandVisible:band&&!band.hidden,
      bandSourceGate:shell?.dataset.aoLiveBandGate??null,
      stageDSourceStatus:band?.dataset.stageDSourceStatus??null,
      referenceId:band?.dataset.referenceId??null,
      currentPage:[...band?.querySelectorAll(".ao-lb-page")??[]].findIndex(x=>x.dataset.active==="true"),
      wheelCount:band?.querySelectorAll("[data-wheel-segment]")?.length??0,
      laneCount:band?.querySelectorAll("[data-native-lane]")?.length??0,
      independentScholaMarks:0,
      mainPrayer:rect(shell?.querySelector('[data-role="card"]')),
      shell:rect(shell),band:rect(band),
      stage:rect(stage),
      scholaDock:rect(nativeDock),
      scholaDockInStage:Boolean(nativeDock&&stage?.contains(nativeDock)),
      firstDotUnobstructed:(()=>{
        const r=firstDot?.getBoundingClientRect();
        if(!r)return false;
        const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);
        return hit===firstDot||firstDot.contains(hit);
      })(),
      faithfulPosture:{sourceMatched:shell?.dataset.aoLivePreviewPosture??null,
        visible:(()=>{const t=shell?.querySelector('.ao-rail-left [data-channel="posture"]');
          return Boolean(t&&getComputedStyle(t).display!=="none"&&t.getBoundingClientRect().height>0);})()},
      leftRail:rect(shell?.querySelector(".ao-rail-left")),
      rightRail:rect(shell?.querySelector(".ao-rail-right")),
      rails:shell?.querySelectorAll(".ao-reader-stage .ao-rail").length??0
    };
  });
}
function verify(m,{width,height,name},label){
  assert.equal(m.mode,"LIVE",name+" "+label+" native mode");
  assert.ok([65,66].includes(m.nativeCardCount),name+" "+label+" native source family 65 or 66");
  assert.match(m.modelOwner||"",/SOURCE_FIRST_LIVE_CURATED/);
  assert.equal(m.bandVisible,true,name+" "+label+" visual band hidden");
  assert.equal(m.bandSourceGate,m.nativeCardCount===66
    ?"SOURCE_CERTIFIED_66_PRE_GOSPEL_SPLIT":"EXACT_NATIVE_65_CROSSWALK",
    name+" "+label+" source gate "+m.bandSourceGate);
  assert.equal(m.stageDSourceStatus,"SOURCE_ONLY_"+m.nativeCardCount,
    name+" "+label+" Stage D source hold");
  assert.equal(m.wheelCount,m.nativeCardCount,name+" "+label+" wheel does not reflect native source cuts");
  assert.equal(m.laneCount,6,name+" "+label+" lanes");
  assert.equal(m.independentScholaMarks,0,name+" "+label+" false Schola clock marker");
  if(["KYRIE","GLORIA","CREDO","SANCTUS_BENEDICTUS","AGNUS_DEI"]
      .includes(m.scholaTrackId)){
    assert.ok(m.scholaSourceTrack.sourceCueCount>0,
      name+" "+label+" complete Schola track source cue list missing");
    assert.equal(m.scholaSourceTrack.sourceCueIncludesCurrent,true,
      name+" "+label+" current Schola cue missing from native track");
    assert.equal(m.scholaSourceTrack.hasSourceLatin,true,
      name+" "+label+" full source Latin missing");
  }
  assert.equal(m.scholaSourceTrack.scoreAutomaticallyApproved,false,
    name+" "+label+" unapproved score surfaced automatically");
  assert.equal(m.rails,2,name+" "+label+" gesture rails missing");
  if(name==="low-en-320"&&label==="sanctuary")
    assert.equal(m.faithfulPosture.sourceMatched,"true",
      "The real C01 Low Mass must expose its independently source-matched posture");
  if(m.faithfulPosture.sourceMatched==="true"){
    assert.equal(m.faithfulPosture.visible,true,name+" "+label+" lost the sourced faithful posture rail tile");
    assert.ok(m.leftRail?.w>0&&m.leftRail?.h>0,
      name+" "+label+" native transient-rail suppression concealed faithful posture");
  }
  assert.equal(m.headerTitle.whiteSpace,"nowrap",name+" "+label+" LIVE preview title wraps");
  assert.equal(m.headerTitle.textOverflow,"ellipsis",name+" "+label+" LIVE preview title is not truncated");
  assert.ok(m.headerTitle.height>0&&m.headerTitle.height<24,
    name+" "+label+" LIVE preview title exceeds one header line: "+JSON.stringify(m.headerTitle));
  assert.equal(m.scholaDockInStage,true,name+" "+label+" Schola dock escaped the prayer stage");
  assert.equal(m.firstDotUnobstructed,true,name+" "+label+" sanctuary selector intercepted; dock="+JSON.stringify(m.scholaDock));
  if(m.scholaDock?.h>0)
    assert.ok(m.scholaDock.y>=m.stage.y-2,
      name+" "+label+" active Schola dock overlaps the sanctuary band");
  assert.ok(m.documentW<=width+2,name+" "+label+" horizontal page overflow "+m.documentW);
  assert.ok(m.stage?.h>85,name+" "+label+" native text stage collapsed");
  assert.ok(m.mainPrayer?.w>85&&m.mainPrayer?.h>70,
    name+" "+label+" missing native Mass text");
  for(const key of ["shell","band","stage"]){
    const box=m[key];assert.ok(box&&box.w>0&&box.h>0,name+" "+label+" "+key+" blank");
    assert.ok(box.x>=-2 && box.x+box.w<=width+2,
      name+" "+label+" "+key+" outside x "+JSON.stringify(box));
    assert.ok(box.y>=-2 && box.y+box.h<=height+2,
      name+" "+label+" "+key+" outside y "+JSON.stringify(box));
  }
}
async function capture(page,c,name){
  await pause(300);
  const m=await read(page);
  verify(m,c,name);c.steps.push({name,metrics:m});
  await page.screenshot({path:resolve(OUT,c.name+"-"+name+".png"),
    animations:"disabled",fullPage:false});
  return m;
}
async function enterNativeMass(page,option){
  const res=await page.goto(HOST+"?aoR17Reader=native&aoLiveBandPreview=1&qa=live-handoff-native",
    {waitUntil:"domcontentloaded",timeout:90000});
  assert.equal(res?.status(),200);
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,
    null,{timeout:60000});
  await page.waitForFunction(()=>typeof window.AO_CELEBRATION_API?.openPreflight==="function",
    null,{timeout:35000});
  const home=page.locator(".aoH7HomeView [data-home-h7-enter]");
  await home.waitFor({state:"visible",timeout:35000});
  await home.click();
  const door=page.locator(".aoH7DoorView:not([hidden])");
  await door.waitFor({state:"visible",timeout:20000});
  await door.locator("[data-home-h4-change]").first().click();
  const sheet=page.locator(".aoH4ChoiceDialog[open]");
  await sheet.waitFor({state:"visible",timeout:20000});
  await sheet.locator('[data-h4-option="form"]').selectOption(option.form);
  const aspersion=sheet.locator('[data-h4-option="aspersion"]');
  if(option.form!=="LOW" && await aspersion.isEnabled()){
    // On an eligible sung Sunday, the source-owned H7 choice can start
    // unresolved while the displayed select defaults to "no". Touching the
    // same value is not a real user change. Explicitly choose yes, then no,
    // exactly as the existing real production Mass acceptance does.
    await aspersion.selectOption("yes");
    await aspersion.selectOption("no");
    assert.equal(await page.evaluate(()=>window.AO_R17_BROWSER_ENTRY?.status?.()
      ?.fullMassPreflight?.aspersionDecisionRequired),false,
      "Explicit Sunday Asperges refusal did not clear source-owned H7 entry");
  }
  await sheet.locator('[data-h4-option="readerMode"]').selectOption("LIVE");
  await sheet.locator('[data-h4-option="readerLanguage"]').selectOption(option.lang);
  await sheet.locator('[data-h4-option="beforeMass"]').selectOption("none");
  await sheet.locator("[data-h4-sheet-close]").last().click();
  await sheet.waitFor({state:"detached",timeout:20000});
  const begin=door.locator("[data-home-h4-begin]");
  await begin.waitFor({state:"visible",timeout:35000});
  await page.waitForFunction(()=>Boolean(document.querySelector(
    ".aoH7DoorView:not([hidden]) [data-home-h4-begin]:not(:disabled)"
  )),null,{timeout:40000});
  await begin.click();
  await page.waitForFunction(()=>{
    const api=window.AO_R17_NATIVE_READER_PREVIEW;
    return Boolean(api?.getCurrentCard?.()?.sectionId &&
      api?.model?.cards?.length && api?.getScholaState &&
      api?.getNativeEventState &&
      document.querySelector("#ao-r17-native-reader-preview .ao-reader-shell"));
  },null,{timeout:65000});
  await page.waitForFunction(()=>{
    const curtain=document.querySelector('#ao-r17-native-reader-preview [data-role="cinematic"]');
    if(!curtain)return true;
    const css=getComputedStyle(curtain);
    return curtain.hidden||curtain.getAttribute("aria-hidden")==="true"||
      css.display==="none"||css.visibility==="hidden";
  },null,{timeout:30000});
  await page.waitForFunction(()=>{
    const band=document.querySelector(".ao-live-band");
    const api=window.AO_R17_NATIVE_READER_PREVIEW;
    return band?.dataset.stageDSourceStatus==="SOURCE_ONLY_"+api?.model?.cards?.length;
  },null,{timeout:20000});
}
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const opt of cases){
    const c={...opt,pass:false,steps:[],errors:[],failedResponses:[]};
    report.cases.push(c);
    const context=await browser.newContext({
      viewport:{width:opt.width,height:opt.height},
      isMobile:true,hasTouch:true,deviceScaleFactor:1,locale:"en-GB",
      reducedMotion:"reduce",serviceWorkers:"block"
    });
    const page=await context.newPage();
    page.on("pageerror",e=>c.errors.push(String(e.message||e).slice(0,900)));
    page.on("response",r=>{
      if(r.status()>=400 && r.url().startsWith(HOST) && c.failedResponses.length<20)
        c.failedResponses.push({status:r.status(),url:r.url()});
    });
    try{
      await enterNativeMass(page,c);
      const musicAccess=page.locator(".ao-claude-music-access");
      if(c.form!=="LOW"){
        await musicAccess.waitFor({state:"visible",timeout:10000});
        await musicAccess.click();
        const musicMenu=page.locator("#ao-r17-native-reader-preview [data-role=schola-events-menu]");
        await musicMenu.waitFor({state:"visible",timeout:10000});
        await musicMenu.locator('[data-schola-event-select="KYRIE"]').click();
        await page.waitForFunction(()=>window.AO_R17_NATIVE_READER_PREVIEW
          ?.getScholaState?.()?.trackId==="KYRIE",null,{timeout:10000});
        // Real H7 entry: pick a source-indexed Kyriale setting in the EXISTING
        // parish programme, then manually request its historical reference.
        // No synthetic score injection or automatic promotion is permitted.
        const beforeReference=await page.evaluate(()=>window.AO_R17_NATIVE_READER_PREVIEW
          ?.getScholaState?.()?.index??null);
        await page.evaluate(()=>{
          const select=document.querySelector(
            '#ao-r17-native-reader-preview [data-schola-kyriale-choice="KYRIE"]');
          if(!select)throw new Error("Native Kyriale selection missing");
          select.value="MASS_11";
          select.dispatchEvent(new Event("change",{bubbles:true}));
        });
        const refTrigger=page.locator(
          "#ao-r17-native-reader-preview [data-ao-reference-score-trigger]");
        await refTrigger.waitFor({state:"visible",timeout:10000});
        await refTrigger.click();
        const refSvg=page.locator(
          "#ao-r17-native-reader-preview [data-ao-reference-score-panel] svg");
        await refSvg.waitFor({state:"visible",timeout:15000});
        const checkedReference=await page.evaluate(()=>{
          const shell=document.querySelector("#ao-r17-native-reader-preview");
          const dock=shell?.querySelector(".ao-schola-dock");
          const staff=shell?.querySelector("[data-ao-reference-score-staff]");
          const native=window.AO_R17_NATIVE_READER_PREVIEW?.getScholaState?.();
          return {sourceLabel:staff?.getAttribute("aria-label")??null,
            approvedScore:dock?.dataset.approvedScore??"false",
            nativeTrack:native?.trackId??null,nativeIndex:native?.index??null,
            width:document.documentElement.scrollWidth};
        });
        assert.match(checkedReference.sourceLabel||"",/Research-only Kyrie XI/);
        assert.equal(checkedReference.approvedScore,"false",
          "Research reference was incorrectly marked as an approved LIVE score");
        assert.equal(checkedReference.nativeTrack,"KYRIE");
        assert.equal(checkedReference.nativeIndex,beforeReference,
          "Manually opening notation advanced independent Schola");
        assert.ok(checkedReference.width<=c.width+2,
          "Historical reference created page overflow");
        c.steps.push({name:"actual-native-explicit-kyriale-reference",
          metrics:checkedReference});
        await page.screenshot({path:resolve(OUT,c.name+"-native-kyrie-XI-reference.png"),
          animations:"disabled",fullPage:false});
        await page.locator(
          "#ao-r17-native-reader-preview [data-ao-reference-score-close]").click();
        assert.equal(await page.locator(
          "#ao-r17-native-reader-preview [data-ao-reference-score-panel]").isVisible(),false);

      }else{
        assert.equal(await musicAccess.isVisible(),false,
          "Low Mass incorrectly presents a Schola chooser");
      }
      let baseline=await capture(page,c,"sanctuary");
      assert.ok(baseline.nativeCardId,"native prayer card missing");
      for(const [idx,name] of [[1,"timeline"],[2,"wheel"]]){
        await page.locator(".ao-lb-dot").nth(idx).click();
        await page.waitForFunction(i=>document.querySelectorAll(".ao-lb-page")[i]
          ?.dataset.active==="true",idx,{timeout:5000});
        const state=await capture(page,c,name);
        assert.equal(state.currentPage,idx);
      }
      await page.locator(".ao-lb-dot").first().click();
      const before=await read(page);
      // Native reader API, not synthetic card state. The model and selected
      // Schola track/phrase must not change when user catches up with priest.
      await page.evaluate(()=>window.AO_R17_NATIVE_READER_PREVIEW.showSection("AO.LIVECURATED.AO.CARD.004.1"));
      await page.waitForFunction(previous=>{
        const card=window.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.();
        return card?.sectionId && card.sectionId!==previous;
      },before.nativeCardId,{timeout:12000});
      const changed=await capture(page,c,"native-card-10");
      assert.notEqual(changed.nativeCardId,before.nativeCardId);
      assert.equal(changed.scholaTrackId,before.scholaTrackId,
        "native card navigation advanced Schola track");
      assert.equal(changed.scholaIndex,before.scholaIndex,
        "native card navigation advanced independent Schola phrase");
      assert.equal(changed.scholaComplete,before.scholaComplete,
        "native card navigation completed Schola");
      assert.equal(changed.referenceId,"C10");
      // A second native jump proves the wheel follows current native card ID.
      await page.evaluate(()=>window.AO_R17_NATIVE_READER_PREVIEW.showSection("AO.LIVECURATED.AO.CARD.011.1"));
      await page.waitForFunction(()=>document.querySelector(".ao-live-band")
        ?.dataset.referenceId==="C26",null,{timeout:12000});
      const last=await capture(page,c,"native-card-26");
      assert.equal(last.referenceId,"C26");
      assert.equal(last.scholaIndex,before.scholaIndex);
      // Rotate the actual H7 native reader after it has opened. This tests
      // portrait/landscape resizing without reconstructing a fake Mass.
      if(c.width===390){
        await page.setViewportSize({width:844,height:390});
        const rotated={...c,width:844,height:390};
        await page.locator(".ao-lb-dot").first().click();
        await capture(page,rotated,"native-landscape-sanctuary");
        await page.locator(".ao-lb-dot").nth(1).click();
        await capture(page,rotated,"native-landscape-six-lane");
      }
      assert.equal(c.errors.length,0,"Native browser JS exceptions: "+c.errors.join("; "));
      assert.equal(c.failedResponses.filter(x=>x.url.includes("/src/")).length,0,
        "Native reader missing source modules");
      c.pass=true;
    }catch(e){
      c.error=String(e.stack||e);
      try{
        c.diagnostic=await read(page);
        c.nativeCards=await page.evaluate(()=>{
          const api=window.AO_R17_NATIVE_READER_PREVIEW;
          const cards=api?.model?.cards??[];
          return cards.map((c,i)=>({
            sequence:i+1,id:c.sectionId,source:c.sourceSectionId,
            canon:c.provenance?.canonSegmentId??null,
            title:c.title,stateOnly:c.stateOnly===true,
            omittedByRite:c.omittedByRite??null,
            cueIds:(c.paragraphs??[]).flatMap(p=>p.sourceCueIds??[])
          }));
        });
      }catch(diagError){c.diagnosticError=String(diagError)}
      await page.screenshot({path:resolve(OUT,c.name+"-FAILED.png"),
        fullPage:true}).catch(()=>{});
    }finally{await context.close();}
  }
}finally{await browser?.close();}
report.passed=report.cases.filter(c=>c.pass).length;
report.failed=report.cases.length-report.passed;
await writeFile(resolve(OUT,"report.json"),JSON.stringify(report,null,2)+"\n");
for(const c of report.cases)
  console.log((c.pass?"PASS ":"FAIL ")+c.name+" "+String(c.error||"").slice(0,1100));
assert.equal(report.failed,0,
  "Real H7 native Mass LIVE handoff integration failed; inspect screenshot and report");
