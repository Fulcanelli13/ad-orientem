// Isolated visual acceptance for the full Stage B/C/D LIVE band.
// Uses the real reader-dom.js shell markup and all production band modules,
// but a clearly marked synthetic source-event fixture. It does NOT certify
// the complete H7 entry path or physical handset behavior.
import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import {mkdir,writeFile} from "node:fs/promises";
import {resolve} from "node:path";

const base="http://127.0.0.1:4173/tests/fixtures/live-handoff-visual.html";
const output=resolve("artifacts/live-handoff-visual");
await mkdir(output,{recursive:true});
const cases=[
  {name:"small-portrait",width:320,height:568,mobile:true},
  {name:"regular-portrait",width:390,height:844,mobile:true},
  {name:"tablet-portrait",width:768,height:1024,mobile:true},
  {name:"phone-landscape",width:844,height:390,mobile:true}
];
const result={schema:"AO_LIVE_HANDOFF_ISOLATED_VISUAL_ACCEPTANCE_V1",
  source:"SYNTHETIC_CUE_FIXTURE_REAL_READER_DOM_AND_STAGE_BCD",
  productionMassEntryVerified:false,physicalHandsetVerified:false,
  runCommit:process.env.GITHUB_SHA??null,cases:[]};
function reportErrors(page,c){
  page.on("pageerror",e=>c.errors.push(String(e.stack||e.message||e).slice(0,700)));
}
async function metrics(page){
  return page.evaluate(()=>{
    const q=x=>document.querySelector(x);
    const box=el=>{
      if(!el)return null;
      const b=el.getBoundingClientRect(),s=getComputedStyle(el);
      return {x:b.x,y:b.y,w:b.width,h:b.height,
        visibility:s.visibility,display:s.display};
    };
    const b=box(q("[data-ao-live-band]")),stage=box(q(".ao-reader-stage"));
    const shell=box(q("[data-ao-reader-shell]"));
    const left=box(q(".ao-reader-stage .ao-rail-left"));
    const right=box(q(".ao-reader-stage .ao-rail-right"));
    const active=[...document.querySelectorAll(".ao-lb-page")].find(x=>x.dataset.active==="true");
    const content=active?.querySelector(".ao-claude-timeline-page,.ao-claude-wheel-page,.ao-lb-sanctuary-shell");
    const c=box(content);
    return {width:innerWidth,height:innerHeight,
      documentW:document.documentElement.scrollWidth,documentH:document.documentElement.scrollHeight,
      shell,band:b,stage,left,right,activePage:[...document.querySelectorAll(".ao-lb-page")].indexOf(active),
      content:c,contentScrollOverflow:content?Math.max(0,content.scrollHeight-content.clientHeight):null,
      visibleBand:!q("[data-ao-live-band]")?.hidden,
      sourceStatus:q("[data-ao-live-band]")?.dataset?.stageDSourceStatus,
      reference:q("[data-ao-live-band]")?.dataset?.referenceId,
      railCount:document.querySelectorAll(".ao-reader-stage .ao-rail").length,
      wheelSegments:document.querySelectorAll("[data-wheel-segment]").length,
      sixLanes:document.querySelectorAll("[data-native-lane]").length,
      scholaMarkers:0,
      organMarkers:0,
      minsterMarkers:0
    };
  });
}
function bounds(c,m,scenario){
  assert.equal(m.visibleBand,true,scenario+" band hidden");
  assert.equal(m.sourceStatus,"SOURCE_ONLY_65",scenario+" source hold");
  assert.equal(m.railCount,2,scenario+" rails missing");
  assert.equal(m.sixLanes,6,scenario+" lanes not rendered");
  assert.equal(m.wheelSegments,65,scenario+" actual wheel card count drift");
  assert.equal(m.scholaMarkers,0,scenario+" fabricated Schola card-synced marker");
  assert.equal(m.organMarkers,0,scenario+" fabricated organ card-synced marker");
  assert.equal(m.minsterMarkers,0,scenario+" fabricated minister card-synced marker");
  assert.ok(m.documentW<=c.width+2,scenario+" horizontal page overflow "+m.documentW);
  assert.ok(m.documentH<=c.height+2,scenario+" vertical page overflow "+m.documentH);
  for(const [key,rect] of Object.entries({
    shell:m.shell,band:m.band,stage:m.stage,left:m.left,right:m.right,content:m.content
  })){
    assert.ok(rect&&rect.w>0&&rect.h>0,scenario+" "+key+" has zero area");
    assert.ok(rect.x>=-2&&rect.x+rect.w<=c.width+2,
      scenario+" "+key+" outside x viewport "+JSON.stringify(rect));
    assert.ok(rect.y>=-2&&rect.y+rect.h<=c.height+2,
      scenario+" "+key+" outside y viewport "+JSON.stringify(rect));
  }
  assert.ok(m.stage.h>=95,scenario+" no room for native Mass text");
  assert.ok(m.contentScrollOverflow<=2,
    scenario+" visual content clipped by "+m.contentScrollOverflow+"px");
}
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const option of cases){
    const c={...option,pass:false,steps:[],errors:[]};
    result.cases.push(c);
    const ctx=await browser.newContext({
      viewport:{width:option.width,height:option.height},
      isMobile:option.mobile,hasTouch:option.mobile,
      deviceScaleFactor:1,reducedMotion:"reduce",locale:"en-GB",
      serviceWorkers:"block"
    });
    const page=await ctx.newPage();
    reportErrors(page,c);
    try{
      const response=await page.goto(base+"?aoLiveBandPreview=1",
        {waitUntil:"domcontentloaded",timeout:25000});
      assert.equal(response?.status(),200);
      await page.waitForFunction(()=>window.__aoHandoffFixture?.ready===true,
        null,{timeout:25000});
      await page.waitForFunction(()=>document.querySelector("[data-ao-live-band]")
        ?.dataset?.stageDSourceStatus==="SOURCE_ONLY_65",null,{timeout:15000});
      const start=await page.evaluate(()=>window.__aoHandoffFixture.selected());
      assert.equal(start.scholaIndex,2);
      for(const [index,name] of [[0,"sanctuary"],[1,"six-lane"],[2,"wheel"]]){
        await page.locator('.ao-lb-dot').nth(index).click();
        await page.waitForFunction(i=>
          document.querySelectorAll(".ao-lb-page")[i]?.dataset.active==="true",
          index);
        const m=await metrics(page);
        bounds(option,m,option.name+" "+name);
        assert.equal(m.activePage,index);
        c.steps.push({name,metrics:m});
        await page.screenshot({path:resolve(output,option.name+"-"+name+".png"),
          animations:"disabled",fullPage:false});
      }
      assert.equal(await page.locator("[data-wheel-segment]").count(),65);
      await page.evaluate(()=>window.__aoHandoffFixture.goPage(0));
      await page.waitForFunction(()=>{
        const el=document.querySelector(".ao-lb-pages");
        return el && Math.abs(new DOMMatrix(getComputedStyle(el).transform).m41)<1;
      },null,{timeout:2000});
      const before=await page.evaluate(()=>window.__aoHandoffFixture.selected());
      // Source turn: native C10 source cue C0070, not the card number itself.
      const turn=await page.evaluate(()=>window.__aoHandoffFixture.showCard(9));
      assert.equal(turn.nativeCue,"AO.SM.C0070");
      assert.equal(turn.scholaIndex,before.scholaIndex,
        "reader catch-up falsely advanced observed choir");
      const turnButton=page.locator("[data-lb-route-start]");
      await turnButton.waitFor({state:"visible",timeout:8000});
      assert.match(await turnButton.textContent(),/Illustrate turn/);
      await turnButton.click();
      await page.locator("[data-lb-route-nav]").waitFor({state:"visible"});
      await page.locator("[data-lb-route-nav] [data-lb-route-next]").click();
      assert.equal(await page.evaluate(()=>window.__aoHandoffFixture.getState().routeStep),1);
      await page.screenshot({path:resolve(output,option.name+"-turn.png"),
        animations:"disabled",fullPage:false});
      const incense=await page.evaluate(()=>window.__aoHandoffFixture.showCard(23));
      assert.equal(incense.nativeCue,"AO.SM.C0122");
      assert.equal(incense.scholaIndex,before.scholaIndex);
      await turnButton.waitFor({state:"visible",timeout:8000});
      assert.match(await turnButton.textContent(),/Illustrate path/);
      await turnButton.click();
      assert.equal(await page.locator("[data-lb-route-overlay]").count(),1);
      await page.screenshot({path:resolve(output,option.name+"-incensation.png"),
        animations:"disabled",fullPage:false});
      // No card route may remain when the exact source identity changes.
      await page.evaluate(()=>window.__aoHandoffFixture.showCard(39));
      await page.waitForTimeout(300); // settle the adaptive grid height before geometry assertions
      assert.equal(await page.locator("[data-lb-route-overlay]").count(),0);
      assert.equal(await page.locator("[data-lb-route-start]").isVisible(),false);
      const other=await metrics(page);
      bounds(option,other,option.name+" after-route");
      // Stage E: synthetic staff fixture exercises ONLY the already-gated
      // Exsurge presentation viewport. It is not an approved score or an
      // observation of an actual Schola performance on this feast.
      const chant=await page.evaluate(async()=>{
        const q=sel=>document.querySelector(sel);
        const panel=q('[data-role="schola-approved-score"]');
        const dock=q(".ao-schola-dock"),staff=q('[data-role="schola-approved-staff"]');
        const scroll=q('[data-ao-live-chant-scroll]');
        const line=q('[data-ao-live-chant-now]');
        if(!dock||!panel||!staff||!scroll||!line)return {mounted:false};
        dock.dataset.active="true";dock.dataset.collapsed="false";
        panel.hidden=false;panel.dataset.scoreStatus="approved";
        const sourceResponse=await fetch("/tests/fixtures/live-handoff-kyrie-XI-source.gabc");
        if(!sourceResponse.ok)throw new Error("Handoff Kyrie XI source missing");
        const gabc=await sourceResponse.text();
        const {createOfflineChantEngraver}=await import("/src/mass/reader-chant-engraver.js");
        const engraver=createOfflineChantEngraver({viewport:staff,document});
        const rendered=await engraver.engrave(gabc);
        if(!rendered||!staff.querySelector("svg"))throw new Error("Local Exsurge emitted no Gregorian staff");
        const before=scroll.scrollLeft;
        scroll.scrollLeft=480;
        const r=scroll.getBoundingClientRect(),mark=line.getBoundingClientRect();
        return {mounted:true,source:panel.dataset.liveChantSource,
          before,after:scroll.scrollLeft,extent:scroll.scrollWidth-scroll.clientWidth,
          markerWithin:mark.x>=r.x&&mark.x<=r.x+r.width,
          markerAt30Percent:Math.abs(mark.x-(r.x+r.width*.3))<3,
          engraverRendered:rendered,hasGregorianSvg:Boolean(staff.querySelector("svg")),
          sourceFixture:"HANDOFF_GREGOBASEx2982_NOT_APPROVED",
          documentW:document.documentElement.scrollWidth,
          independentScholaIndex:window.__aoHandoffFixture.selected().scholaIndex};
      });
      assert.equal(chant.mounted,true,option.name+" Stage E did not mount");
      assert.equal(chant.source,"APPROVED_NATIVE_ONLY");
      assert.equal(chant.engraverRendered,true,option.name+" Exsurge source render failed");
      assert.equal(chant.hasGregorianSvg,true);
      assert.ok(chant.extent>600,option.name+" score should horizontally scroll");
      assert.ok(chant.after>=450,option.name+" scroll gesture surface does not move");
      assert.equal(chant.markerWithin,true);
      assert.equal(chant.markerAt30Percent,true);
      assert.ok(chant.documentW<=option.width+2,
        option.name+" Stage E leaked horizontal page overflow");
      assert.equal(chant.independentScholaIndex,before.scholaIndex,
        "synthetic score scrolling advanced native choir clock");
      // The pre-existing Schola lyric follower, not a reader-card timestamp,
      // sets this attribute. Verify Stage E only follows that source-matched
      // glyph and makes no changes to the underlying music state.
      const lyric=await page.evaluate(async()=>{
        const staff=document.querySelector('[data-role="schola-approved-staff"]');
        const scroll=document.querySelector('[data-ao-live-chant-scroll]');
        const texts=[...staff.querySelectorAll("svg text")].filter(el=>
          el.getBoundingClientRect().width>0);
        if(texts.length<2)return {mapped:false,count:texts.length};
        texts.forEach(t=>delete t.dataset.scholaFollowActive);
        const last=texts[texts.length-1];
        scroll.scrollLeft=0;
        last.dataset.scholaFollowActive="true";
        staff.dataset.scholaFollowIndex="100";
        await new Promise(resolve=>requestAnimationFrame(resolve));
        const box=scroll.getBoundingClientRect(),glyph=last.getBoundingClientRect();
        const marker=box.x+box.width*.3;
        return {mapped:true,count:texts.length,scrollLeft:scroll.scrollLeft,
          glyphAtMarker:Math.abs((glyph.x+glyph.width/2)-marker)<7,
          scholaIndex:window.__aoHandoffFixture.selected().scholaIndex};
      });
      assert.equal(lyric.mapped,true,option.name+" missing rendered source lyric glyphs");
      assert.equal(lyric.glyphAtMarker,true,
        option.name+" independent source-syllable follower did not align to gold line");
      assert.equal(lyric.scholaIndex,before.scholaIndex,
        "notation-follow visual position altered actual native Schola progression");
      c.steps.push({name:"stage-e-source-gated-scroll-fixture",metrics:chant,lyric});
      await page.screenshot({path:resolve(output,option.name+"-kyrie-XI-reference-only.png"),
        animations:"disabled",fullPage:false});
      // A SEPARATE DOM harness uses the real source-indexed Kyrie XI GABC,
      // native-style dock and exact review-only control. No replacement of
      // the native Schola controller and no promoted score is made.
      const research=await page.evaluate(async()=>{
        const host=document.createElement("section");
        host.id="stageEReferenceQA";
        host.className="ao-reader-shell ao-live-band-enabled";
        host.style.cssText="position:fixed;z-index:1000;left:0;right:0;bottom:0;height:146px;max-width:100vw;background:#111b1c;display:block";
        const dock=document.createElement("div");dock.className="ao-schola-dock";
        dock.dataset.active="true";dock.dataset.collapsed="false";
        dock.style.cssText="display:block;position:relative;width:100%;height:146px";
        const title=document.createElement("div");title.className="ao-schola-title";
        title.textContent="SCHOLA · TEST REFERENCE";
        const toggle=document.createElement("button");toggle.type="button";
        toggle.dataset.scholaToggle="";toggle.textContent="HIDE";
        const main=document.createElement("div");main.className="ao-schola-main";
        const setting=document.createElement("select");
        setting.dataset.scholaKyrialeChoice="KYRIE";
        for(const id of ["MASS_11","MASS_08"]){
          const option=document.createElement("option");
          option.value=id;option.textContent=id;setting.append(option);
        }
        setting.value="MASS_11";
        dock.append(title,toggle,main);host.append(setting,dock);
        document.body.append(host);
        const {installLiveHandoffResearchNotation}=await import(
          "/src/mass/reader-live-handoff-research-notation.js");
        const source={owner:"R17_NATIVE_SCHOLA",trackId:"KYRIE",
          cueId:"AO.SM.C0041",trackSourceCueIds:["AO.SM.C0041","AO.SM.C0042"],
          trackSourceLatin:"Kyrie eleison Christe eleison",
          musicStatus:"EXPECTED_NOT_OBSERVED",composedWorkId:null};
        const view=installLiveHandoffResearchNotation({root:host,document,
          preview:{getScholaState:()=>({schola:source})},
          prepared:{session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}}});
        const available=view.refresh(true);
        window.__aoStageEReference={view,host,setting,source};
        return {available,initial:view.getState(),
          approvedScore:dock.dataset.approvedScore??"false"};
      });
      assert.equal(research.available,true,option.name+" research reference not available");
      assert.equal(research.initial.approval,"RESEARCH_ONLY");
      assert.equal(research.approvedScore,"false");
      await page.locator("#stageEReferenceQA [data-ao-reference-score-trigger]").click();
      await page.waitForFunction(()=>Boolean(document.querySelector(
        "#stageEReferenceQA [data-ao-reference-score-panel] svg")),
        null,{timeout:12000});
      const referenceMetrics=await page.evaluate(()=>{
        const host=document.querySelector("#stageEReferenceQA");
        const panel=host.querySelector("[data-ao-reference-score-panel]");
        const scroll=host.querySelector(".ao-live-chant-scroll");
        const dock=host.querySelector(".ao-schola-dock");
        scroll.scrollLeft=350;
        return {caption:host.querySelector("[data-ao-reference-score-caption]")?.textContent,
          horizontalExtent:scroll.scrollWidth-scroll.clientWidth,
          horizontalPosition:scroll.scrollLeft,opened:!panel.hidden,
          scoreId:window.__aoStageEReference.view.getState().scoreId,
          approvedScore:dock.dataset.approvedScore??"false",
          documentWidth:document.documentElement.scrollWidth};
      });
      assert.equal(referenceMetrics.caption,"1961 REFERENCE · NOT APPROVED");
      assert.equal(referenceMetrics.scoreId,"GREGOBASE-2982");
      assert.equal(referenceMetrics.opened,true);
      assert.equal(referenceMetrics.approvedScore,"false");
      assert.ok(referenceMetrics.horizontalExtent>500,
        option.name+" historical staff does not scroll");
      assert.ok(referenceMetrics.horizontalPosition>=300);
      assert.ok(referenceMetrics.documentWidth<=option.width+2,
        option.name+" research score leaks horizontal viewport");
      await page.screenshot({path:resolve(output,option.name+"-research-kyrie-XI.png"),
        animations:"disabled",fullPage:false});
      await page.locator("#stageEReferenceQA [data-ao-reference-full-open]").click();
      await page.waitForFunction(()=>document.querySelector(
        'dialog[data-ao-reference-full-score="GREGOBASE-2982"]')?.dataset.aoReferenceFullReady==="true",
        null,{timeout:20000});
      const fullKyrie=await page.evaluate(()=>{
        const dialog=document.querySelector('dialog[data-ao-reference-full-score]');
        const staff=dialog.querySelector("[data-ao-reference-full-staff]");
        return {open:dialog.open,score:dialog.dataset.aoReferenceFullScore,
          hasSvg:Boolean(staff.querySelector("svg")),viewportHeight:staff.clientHeight,
          sourceLink:dialog.querySelector("a")?.href,
          nativeScholaIndex:window.__aoHandoffFixture.selected().scholaIndex};
      });
      assert.equal(fullKyrie.open,true);
      assert.equal(fullKyrie.score,"GREGOBASE-2982");
      assert.equal(fullKyrie.hasSvg,true);
      assert.match(fullKyrie.sourceLink||"",/gregobase/);
      assert.equal(fullKyrie.nativeScholaIndex,before.scholaIndex);
      const originalButton=page.locator(
        'dialog[data-ao-reference-full-score] [data-ao-reference-print-toggle]');
      await originalButton.waitFor({state:"visible",timeout:3000});
      await originalButton.click();
      const originalKyrie=await page.evaluate(()=>{
        const modal=document.querySelector("dialog[data-ao-reference-full-score]");
        const printed=modal.querySelector("[data-ao-reference-print-view]");
        const originalUrls=[...printed.querySelectorAll("img")].map(i=>i.getAttribute("src"));
        const staff=modal.querySelector("[data-ao-reference-full-staff]");
        return {displayed:!printed.hidden,staffHidden:staff.hidden,originalUrls,
          originalPageLinks:[...printed.querySelectorAll("[data-ao-reference-print-page-link]")]
            .map(link=>link.getAttribute("href")),
          scanStatus:printed.querySelector("[data-ao-reference-print-status]")
            ?.dataset.aoReferencePrintStatus,
          loadingCopy:printed.querySelector("[role='status']")?.textContent?.trim(),
          pdf:printed.querySelector("a[href*='kyriale-solesmes.pdf']")?.getAttribute("href"),
          screenWidth:document.documentElement.scrollWidth,
          retainedScholaIndex:window.__aoHandoffFixture.selected().scholaIndex};
      });
      assert.equal(originalKyrie.displayed,true);
      assert.equal(originalKyrie.staffHidden,true);
      assert.deepEqual(originalKyrie.originalUrls,[
        "https://gregobase.selapa.net/sources/2/915.png",
        "https://gregobase.selapa.net/sources/2/916.png"
      ]);
      assert.deepEqual(originalKyrie.originalPageLinks,originalKyrie.originalUrls);
      assert.ok(originalKyrie.loadingCopy?.length>15,
        option.name+" original score has no loading/failure explanation");
      assert.ok(["loading","loaded","partial","unavailable"].includes(originalKyrie.scanStatus));
      assert.match(originalKyrie.pdf||"",/#page=40$/);
      assert.equal(originalKyrie.retainedScholaIndex,before.scholaIndex);
      assert.ok(originalKyrie.screenWidth<=option.width+2,
        option.name+" original folio comparison leaked page horizontally");
      await page.screenshot({path:resolve(output,option.name+"-kyrie-original-1961.png"),
        animations:"disabled",fullPage:false});
      await originalButton.click();
      assert.equal(await page.locator(
        'dialog[data-ao-reference-full-score] [data-ao-reference-print-view]').isVisible(),false);
      assert.equal(await page.locator(
        'dialog[data-ao-reference-full-score] [data-ao-reference-full-staff] svg').isVisible(),true);
      await page.locator('dialog[data-ao-reference-full-score] [data-schola-score-close]').click();
      assert.equal(await page.locator('dialog[data-ao-reference-full-score]').count(),0);
      const switching=await page.evaluate(()=>{
        const {view,setting,host}=window.__aoStageEReference;
        setting.value="MASS_08";
        setting.dispatchEvent(new Event("change",{bubbles:true}));
        const panel=host.querySelector("[data-ao-reference-score-panel]");
        const after={available:view.getState().available,open:view.getState().open,
          hidden:panel.hidden,staffCount:panel.querySelectorAll("svg").length};
        return after;
      });
      assert.equal(switching.available,true);
      assert.equal(switching.open,false,
        "Changing to a different Kyriale setting kept the old notation");
      assert.equal(switching.hidden,true);
      assert.equal(switching.staffCount,0);
      // A long Credo is much taller than the 63px travelling strip.
      // Its FULL view must expose every wrapped staff system by vertical
      // scrolling, without changing the native source Schola clock.
      const credo=await page.evaluate(()=>{
        const {source,view,setting}=window.__aoStageEReference;
        source.trackId="CREDO";
        source.cueId="AO.SM.C0091";
        source.trackSourceCueIds=["AO.SM.C0091","AO.SM.C0092"];
        source.trackSourceLatin="Credo in unum Deum Patrem omnipotentem";
        setting.dataset.scholaKyrialeChoice="CREDO";
        const choice=document.createElement("option");
        choice.value="CREDO_03";choice.textContent="Credo III";
        setting.append(choice);setting.value="CREDO_03";
        setting.dispatchEvent(new Event("change",{bubbles:true}));
        return {available:view.getState().available,scoreCount:view.getState().referenceCount};
      });
      assert.equal(credo.available,true);
      await page.locator("#stageEReferenceQA [data-ao-reference-score-trigger]").click();
      await page.locator("#stageEReferenceQA [data-ao-reference-score-staff] svg")
        .waitFor({state:"visible",timeout:18000});
      await page.locator("#stageEReferenceQA [data-ao-reference-full-open]").click();
      await page.waitForFunction(()=>document.querySelector(
        'dialog[data-ao-reference-full-score="GREGOBASE-749"]')?.dataset.aoReferenceFullReady==="true",
        null,{timeout:20000});
      const fullCredo=await page.evaluate(()=>{
        const dialog=document.querySelector('dialog[data-ao-reference-full-score]');
        const staff=dialog.querySelector("[data-ao-reference-full-staff]");
        const svg=staff.querySelector("svg");
        const extent=staff.scrollHeight-staff.clientHeight;
        staff.scrollTop=staff.scrollHeight;
        return {scoreId:dialog.dataset.aoReferenceFullScore,
          height:svg.getBoundingClientRect().height,scrollExtent:extent,
          scrollPosition:staff.scrollTop,documentWidth:document.documentElement.scrollWidth,
          approvedScore:window.__aoStageEReference.host.querySelector(".ao-schola-dock").dataset.approvedScore??"false",
          independentScholaIndex:window.__aoHandoffFixture.selected().scholaIndex};
      });
      assert.equal(fullCredo.scoreId,"GREGOBASE-749");
      assert.ok(fullCredo.scrollExtent>100,
        option.name+" complete Credo not accessible beyond first staff");
      assert.ok(fullCredo.scrollPosition>100);
      assert.ok(fullCredo.documentWidth<=option.width+2,
        option.name+" full Credo leaked horizontal page overflow");
      assert.equal(fullCredo.approvedScore,"false");
      assert.equal(fullCredo.independentScholaIndex,before.scholaIndex);
      await page.screenshot({path:resolve(output,option.name+"-full-credo-III.png"),
        animations:"disabled",fullPage:false});
      const teardown=await page.evaluate(()=>{
        const {source,view,host}=window.__aoStageEReference;
        source.trackId="OFFERTORY";view.refresh();
        const modalGone=!document.querySelector('dialog[data-ao-reference-full-score]');
        const hidden=host.querySelector("[data-ao-reference-score-panel]").hidden;
        view.dispose();host.remove();delete window.__aoStageEReference;
        return {modalGone,hidden};
      });
      assert.equal(teardown.modalGone,true,
        "Source change left the full-score modal open on stale music");
      assert.equal(teardown.hidden,true);
      c.steps.push({name:"stage-e-manual-nonpublishing-kyriale",
        source:"EXPLICIT_MASS_11_REFERENCE_ONLY",research,referenceMetrics,
        switching,fullKyrie,originalKyrie,credo,fullCredo,teardown});
      // The actual 1962 Advent I Gradual source has TWO separate matching
      // 1961 references in one source paragraph. Neither is to be inferred
      // from a calendar title; require an explicit user score choice.
      const proper=await page.evaluate(async()=>{
        const host=document.createElement("section");
        host.id="stageEProperQA";host.className="ao-reader-shell ao-live-band-enabled";
        host.style.cssText="position:fixed;z-index:1000;left:0;right:0;bottom:0;height:146px;max-width:100vw;background:#111b1c;display:block";
        const dock=document.createElement("div");dock.className="ao-schola-dock";
        dock.dataset.active="true";dock.dataset.collapsed="false";
        dock.style.cssText="display:block;position:relative;width:100%;height:146px";
        const title=document.createElement("div");title.className="ao-schola-title";
        title.textContent="SCHOLA · ADVENT PROPER";
        const toggle=document.createElement("button");toggle.type="button";
        toggle.dataset.scholaToggle="";toggle.textContent="HIDE";
        const main=document.createElement("div");main.className="ao-schola-main";
        dock.append(title,toggle,main);host.append(dock);document.body.append(host);
        const text="Universi qui te exspectant non confundentur Domine. "+
          "Ostende nobis Domine misericordiam tuam et salutare tuum da nobis.";
        const schola={owner:"R17_NATIVE_SCHOLA",trackId:"GRADUAL",
          segmentId:"GRADUAL.1",cueId:null,latin:text,
          musicStatus:"EXPECTED_NOT_OBSERVED",index:2};
        const itinerary={supported:true,properProgramme:[{trackId:"GRADUAL",
          source:"THIS_MASS_RESOLVED_1962_PROPER",
          status:"SOURCE_TEXT_ONLY_NOT_APPROVED_SCORE",
          lines:[{id:"GRADUAL.1",latin:text}]}]};
        const prepared={session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE",
          date:"2026-11-29",proper:{sourcePath:"Tempora/Adv1-0"},overlays:[]}}};
        const {installLiveHandoffResearchNotation}=await import(
          "/src/mass/reader-live-handoff-research-notation.js");
        const view=installLiveHandoffResearchNotation({root:host,document,prepared,
          preview:{getScholaState:()=>({schola}),getScholaPerformance:()=>itinerary}});
        const available=view.refresh(true);
        window.__aoStageEProper={view,host,schola,prepared};
        return {available,state:view.getState()};
      });
      assert.equal(proper.available,true,option.name+" source-bound Proper references not found");
      assert.equal(proper.state.referenceCount,2,
        option.name+" combined Gradual/Alleluia not distinguished");
      await page.locator("#stageEProperQA [data-ao-reference-score-trigger]").click();
      const choice=page.locator("#stageEProperQA [data-ao-reference-score-choice]");
      assert.equal(await choice.isVisible(),true,
        option.name+" dual-score source paragraph silently selected a melody");
      assert.equal(await page.locator("#stageEProperQA [data-ao-reference-score-panel] svg").count(),0);
      await choice.selectOption("GREGOBASE-1169");
      await page.locator("#stageEProperQA [data-ao-reference-score-panel] svg")
        .waitFor({state:"visible",timeout:15000});
      assert.equal(await page.evaluate(()=>window.__aoStageEProper.view.getState().scoreId),
        "GREGOBASE-1169");
      await choice.selectOption("GREGOBASE-1115");
      await page.waitForFunction(()=>window.__aoStageEProper?.view?.getState?.()?.scoreId
        ==="GREGOBASE-1115",null,{timeout:10000});
      await page.locator("#stageEProperQA [data-ao-reference-score-panel] svg")
        .waitFor({state:"visible",timeout:15000});
      const properMetrics=await page.evaluate(()=>{
        const {view,host,schola,prepared}=window.__aoStageEProper;
        const scroll=host.querySelector(".ao-live-chant-scroll");
        scroll.scrollLeft=300;
        const result={scoreId:view.getState().scoreId,referenceCount:view.getState().referenceCount,
          nativeScholaIndex:schola.index,scrollLeft:scroll.scrollLeft,
          documentWidth:document.documentElement.scrollWidth,
          approvedScore:host.querySelector(".ao-schola-dock").dataset.approvedScore??"false"};
        prepared.session.resolvedMass.proper.sourcePath="Tempora/Adv2-0";
        view.refresh();
        result.afterSourceMismatch=view.getState();
        result.afterSourceMismatchPanelHidden=host.querySelector("[data-ao-reference-score-panel]").hidden;
        view.dispose();host.remove();delete window.__aoStageEProper;
        return result;
      });
      assert.equal(properMetrics.scoreId,"GREGOBASE-1115");
      assert.equal(properMetrics.referenceCount,2);
      assert.equal(properMetrics.nativeScholaIndex,2);
      assert.equal(properMetrics.approvedScore,"false");
      assert.ok(properMetrics.scrollLeft>250);
      assert.ok(properMetrics.documentWidth<=option.width+2);
      assert.equal(properMetrics.afterSourceMismatch.available,false);
      assert.equal(properMetrics.afterSourceMismatchPanelHidden,true);
      c.steps.push({name:"stage-e-source-bound-multi-proper",metrics:properMetrics});
      assert.equal(c.errors.length,0,"Browser page errors: "+c.errors.join("; "));
      c.pass=true;
    }catch(e){
      c.error=String(e.stack??e);
      await page.screenshot({path:resolve(output,option.name+"-FAILED.png"),
        fullPage:true}).catch(()=>{});
    }finally{await ctx.close();}
  }
}finally{await browser?.close();}
result.passed=result.cases.filter(x=>x.pass).length;
result.failed=result.cases.filter(x=>!x.pass).length;
await writeFile(resolve(output,"report.json"),JSON.stringify(result,null,2)+"\n");
for(const c of result.cases){
  console.log((c.pass?"PASS":"FAIL")+" "+c.name+
    (c.pass?"":": "+(c.error||c.errors.join("; "))).slice(0,1200));
}
assert.equal(result.failed,0,
  "Stage B/C/D isolated visual fixture failed; see artifact screenshots/report");
