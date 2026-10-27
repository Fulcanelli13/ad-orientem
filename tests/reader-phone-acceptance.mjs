import assert from "node:assert/strict";
import http from "node:http";
import { mkdir, readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const repoRoot=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={
  ".html":"text/html; charset=utf-8",
  ".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",
  ".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",
};

const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const candidate=resolve(repoRoot,"."+pathname);
    if(candidate!==repoRoot && !candidate.startsWith(repoRoot+sep)){
      res.writeHead(403);res.end("forbidden");return;
    }
    const data=await readFile(candidate);
    res.writeHead(200,{"content-type":mime[extname(candidate)]??"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){
    res.writeHead(error?.code==="ENOENT"?404:500);
    res.end(String(error?.message??error));
  }
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4173,"127.0.0.1",ok)});

let browser;
try{
  browser=await chromium.launch({headless:true});
  const context=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const page=await context.newPage();
  page.on("console",msg=>{if(msg.type()==="error")console.error("browser console:",msg.text())});
  await page.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html",{waitUntil:"networkidle"});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});

  const viewport=page.viewportSize();
  const shell=page.locator("[data-ao-reader-shell]");
  const shellBox=await shell.boundingBox();
  assert.ok(shellBox,"reader shell not mounted");
  assert.ok(shellBox.x>=-0.5 && shellBox.y>=-0.5,"reader shell begins outside viewport");
  assert.ok(shellBox.x+shellBox.width<=viewport.width+0.5,"reader shell overflows phone width");
  assert.ok(shellBox.y+shellBox.height<=viewport.height+0.5,"reader shell overflows phone height");
  const noPageOverflow=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);
  assert.equal(noPageOverflow,true,"reader causes horizontal page overflow");

  for(const selector of ['[data-reader-nav="previous"]','[data-reader-nav="next"]']){
    const box=await page.locator(selector).boundingBox();
    assert.ok(box && box.height>=44,selector+" touch target is under 44px high");
  }

  // The former Guide overlay is no longer part of LIVE Mass. The central
  // space belongs to persistent YOU/PRIEST states and source rubrics remain
  // beside their exact source prayer cues, never in a separate overlay.
  const guide=page.locator('[data-role="guide-button"]');
  assert.equal(await guide.count(),1,"Historical Guide marker should remain inert for compatibility");
  assert.equal(await guide.isVisible(),false,"Explanatory Guide returned to LIVE");
  assert.equal(await guide.isDisabled(),true,"An invisible Guide is still keyboard-operable");
  assert.equal(await page.locator('[data-role="guide-popover"]').isVisible(),false);
  assert.equal(await shell.count(),1,"Removing Guide detached native Mass reader");

  const translatable=page.locator('[data-translate-toggle="true"]').first();
  assert.ok(await translatable.count(),"no tappable vernacular/Latin paragraph found");
  const primary=await translatable.getAttribute("data-primary-text");
  const alternate=await translatable.getAttribute("data-alt-text");
  assert.ok(primary && alternate && primary!==alternate,"translation toggle lacks two distinct texts");
  let box=await translatable.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+Math.min(box.height/2,30));
  await page.waitForFunction(
    expected=>document.querySelector('[data-translate-toggle="true"] .ao-line-primary')?.textContent===expected,
    alternate
  );
  box=await translatable.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+Math.min(box.height/2,30));
  await page.waitForFunction(
    expected=>document.querySelector('[data-translate-toggle="true"] .ao-line-primary')?.textContent===expected,
    primary
  );

  const cardId=()=>page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId);
  const initialCard=await cardId();
  const nextButton=page.locator('[data-reader-nav="next"]');
  box=await nextButton.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(previous=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId!==previous,initialCard);
  const afterNext=await cardId();
  assert.notEqual(afterNext,initialCard,"Next touch did not change cards");
  // v1.80 donor part-transition cinema deliberately owns the transition interval.
  // Test the next deliberate tap only after that interval has completed.
  await page.waitForFunction(()=>document.querySelector('[data-role="cinematic"]')?.hidden===true,null,{timeout:5000});
  const backButton=page.locator('[data-reader-nav="previous"]');
  box=await backButton.boundingBox();
  const backHit=await page.evaluate(({x,y})=>{
    const target=document.elementFromPoint(x,y);
    return {
      tag:target?.tagName??null,
      cls:target?.className??null,
      nav:target?.closest?.("[data-reader-nav]")?.dataset?.readerNav??null,
      cinematicHidden:document.querySelector('[data-role="cinematic"]')?.hidden??null,
      current:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    };
  },{x:box.x+box.width/2,y:box.y+box.height/2});
  await page.evaluate(()=>{
    window.__AO_BACK_EVENTS=[];
    for(const type of ["pointerdown","touchstart","touchend","click"]){
      document.addEventListener(type,event=>{
        const t=event.target;
        window.__AO_BACK_EVENTS.push({
          type,
          tag:t?.tagName??null,
          nav:t?.closest?.("[data-reader-nav]")?.dataset?.readerNav??null,
          cls:typeof t?.className==="string"?t.className:null,
        });
      },{capture:true,once:false});
    }
  });
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(350);
  const afterBack=await cardId();
  const navDiag=await page.evaluate(({x,y})=>{
    const root=document.querySelector("[data-ao-reader-shell]")?.parentElement;
    const post=document.elementFromPoint(x,y);
    return {
      input:root?.dataset.aoLastNavInput??null,
      result:root?.dataset.aoLastNavResult??null,
      events:window.__AO_BACK_EVENTS??[],
      postHit:{tag:post?.tagName??null,nav:post?.closest?.("[data-reader-nav]")?.dataset?.readerNav??null,cls:post?.className??null},
    };
  },{x:box.x+box.width/2,y:box.y+box.height/2});
  assert.equal(afterBack,initialCard,
    "Back touch did not restore initial card: "+JSON.stringify({initialCard,afterNext,afterBack,backHit,navDiag}));

  // v1.80 two-axis contract: vertical touch remains native prayer scrolling;
  // a deliberate horizontal swipe owns card navigation.
  const swipeClient=await context.newCDPSession(page);
  async function horizontalSwipe(direction){
    const hit=await page.locator(".ao-prayer-card").boundingBox();
    assert.ok(hit&&hit.width>180&&hit.height>180,"active prayer card has no swipe territory");
    const y=Math.round(hit.y+Math.min(hit.height*.46,320));
    const xStart=Math.round(hit.x+hit.width*(direction>0?.78:.22));
    const xEnd=Math.round(hit.x+hit.width*(direction>0?.22:.78));
    await swipeClient.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x:xStart,y}]});
    for(let i=1;i<=5;i++){
      const x=Math.round(xStart+(xEnd-xStart)*(i/5));
      await swipeClient.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y}]});
    }
    await swipeClient.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  }
  await horizontalSwipe(1);
  await page.waitForFunction(previous=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId!==previous,initialCard,{timeout:3000});
  const afterSwipeNext=await cardId();
  assert.notEqual(afterSwipeNext,initialCard,"horizontal left swipe did not advance the card");
  assert.equal(await page.evaluate(()=>document.querySelector("[data-ao-reader-shell]")?.parentElement?.dataset.aoLastNavInput),"swipe:next",
    "horizontal left swipe was not owned by the v1.80 card-navigation path");
  await page.waitForTimeout(430);
  await horizontalSwipe(-1);
  await page.waitForFunction(expected=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId===expected,initialCard,{timeout:3000});
  assert.equal(await page.evaluate(()=>document.querySelector("[data-ao-reader-shell]")?.parentElement?.dataset.aoLastNavInput),"swipe:previous",
    "horizontal right swipe was not owned by the v1.80 card-navigation path");

  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.LIVECURATED.AO.CANON.06.1"));
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CANON.06.1");
  await page.waitForTimeout(300);
  const topFocus=await page.evaluate(()=>({
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    dataset:document.getElementById("ao-r17-native-reader-preview")?.dataset.r17NativeCue??null,
    scrollTop:document.querySelector(".ao-prayer-card")?.scrollTop??null,
    clientHeight:document.querySelector(".ao-prayer-card")?.clientHeight??null,
    scrollHeight:document.querySelector(".ao-prayer-card")?.scrollHeight??null,
    cueIds:[...document.querySelectorAll(".ao-reader-paragraph[data-cue-id]")].map(x=>x.dataset.cueId),
  }));
  assert.equal(topFocus.cue,"AO.SM.C0168",
    "top of Host Consecration card does not belong to first cue: "+JSON.stringify(topFocus));

  // The real curated reader separates Consecration preparation from words
  // and elevation; the historical 48-card test navigated an obsolete union.
  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.LIVECURATED.AO.CANON.06.2"));
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CANON.06.2");
  const card=page.locator(".ao-prayer-card");
  await card.evaluate(el=>{
    const target=el.querySelector('[data-cue-id="AO.SM.C0173"]');
    const cr=el.getBoundingClientRect();
    const tr=target.getBoundingClientRect();
    const absoluteCenter=(tr.top-cr.top+el.scrollTop)+(tr.height/2);
    el.scrollTop=Math.max(0,absoluteCenter-el.clientHeight*.39);
  });
  await page.waitForTimeout(250);
  const wordsFocus=await page.evaluate(()=>{
    const card=document.querySelector(".ao-prayer-card");
    const cr=card.getBoundingClientRect();
    return {
      cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
      scrollTop:card.scrollTop,
      maxScroll:card.scrollHeight-card.clientHeight,
      clientHeight:card.clientHeight,
      scrollHeight:card.scrollHeight,
      items:[...card.querySelectorAll(".ao-reader-paragraph[data-cue-id]")].map(el=>{
        const r=el.getBoundingClientRect();
        return {cue:el.dataset.cueId,top:r.top-cr.top+card.scrollTop,bottom:r.bottom-cr.top+card.scrollTop};
      }),
    };
  });
  assert.equal(wordsFocus.cue,"AO.SM.C0173",
    "pre-elevation words cue has no phone focus territory: "+JSON.stringify(wordsFocus));
  const voiceEvidence=await page.evaluate(()=>{
    const node=document.querySelector('.ao-rail-right [data-channel="priest-voice"]');
    const copy=node?.querySelector('[data-role="priest-voice"]');
    return {active:node?.dataset.active,voiceFallback:node?.dataset.voiceTextFallback,
      text:copy?.textContent??"",display:copy?getComputedStyle(copy).display:null};
  });
  if(voiceEvidence.active==="true"){
    assert.ok(voiceEvidence.text.trim()!=="—",
      "Source priest voice meaning was lost from the semantic registry");
    assert.equal(voiceEvidence.display,"none",
      "Priest voice must not become miniature words inside an icon rail box");
  }
  assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell??null),null,
    "Host elevation bell fires on the words cue before the action cue");

  const beforeScroll=await card.evaluate(el=>el.scrollTop);
  const cardBox=await card.boundingBox();
  const client=await context.newCDPSession(page);
  const x=Math.round(cardBox.x+cardBox.width/2);
  const yStart=Math.round(cardBox.y+cardBox.height*0.72);
  const yEnd=Math.round(cardBox.y+cardBox.height*0.24);
  await client.send("Input.dispatchTouchEvent",{type:"touchStart",touchPoints:[{x,y:yStart}]});
  for(let i=1;i<=6;i++){
    const y=Math.round(yStart+(yEnd-yStart)*(i/6));
    await client.send("Input.dispatchTouchEvent",{type:"touchMove",touchPoints:[{x,y}]});
  }
  await client.send("Input.dispatchTouchEvent",{type:"touchEnd",touchPoints:[]});
  await page.waitForTimeout(250);
  const afterScroll=await card.evaluate(el=>el.scrollTop);
  assert.ok(afterScroll>beforeScroll,"real touch swipe did not scroll prayer card");

  await card.evaluate(el=>{
    const target=el.querySelector('[data-cue-id="AO.SM.C0174"]');
    const cr=el.getBoundingClientRect();
    const tr=target.getBoundingClientRect();
    const absoluteCenter=(tr.top-cr.top+el.scrollTop)+(tr.height/2);
    el.scrollTop=Math.max(0,absoluteCenter-el.clientHeight*.39);
  });
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()==="AO.SM.C0174",null,{timeout:3000});
  const elevationState=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
  assert.equal(elevationState?.nativeCueId,"AO.SM.C0174");
  assert.equal(elevationState?.bell?.label,"ELEVATION BELL","Host elevation action cue lost its bell state");
  // Regression: the section explanation must follow scroll-to-cue updates.
  // Static card navigation itself has no attested LIVE cue and must not
  // preempt the precise ceremonial rubric or the existing action rails.
  await page.waitForFunction(()=>{
    const shell=document.querySelector("[data-ao-reader-shell]");
    const explanation=document.querySelector('[data-role="objective-context"]');
    return shell?.dataset.objectiveContext==="true" &&
      explanation&&!explanation.hidden&&explanation.dataset.blockId==="AO.SM.B052";
  },null,{timeout:5000});
  // CDP touchend can leave kinetic scrolling active after the first C0174
  // focus event. Wait for physical scroll quiescence, then anchor the exact
  // elevation cue before checking its native state and painted rail.
  await page.evaluate(async()=>{
    const card=document.querySelector(".ao-prayer-card");
    if(!card)throw Error("PHONE_PRAYER_CARD_MISSING");
    let last=card.scrollTop,quietFrames=0;
    for(let frame=0;frame<90&&quietFrames<8;frame++){
      await new Promise(resolve=>requestAnimationFrame(resolve));
      const next=card.scrollTop;
      quietFrames=Math.abs(next-last)<0.5?quietFrames+1:0;
      last=next;
    }
    const target=card.querySelector('[data-cue-id="AO.SM.C0174"]');
    if(!target)throw Error("PHONE_ELEVATION_CUE_MISSING");
    // Use the SAME geometry-based, source-only selector as production.
    // A center-based target may fall outside the final cue's available
    // scrolling territory on some headless browser/font metrics.
    const {pickActiveCue,cueItemsFromScrollContainer}=await import(
      "/src/mass/reader-cue-focus.js");
    const items=cueItemsFromScrollContainer(card);
    const max=Math.max(0,card.scrollHeight-card.clientHeight);
    const steps=80,position=Array.from({length:steps+1},(_,i)=>
      max*(steps-i)/steps).find(y=>pickActiveCue({
        scrollTop:y,clientHeight:card.clientHeight,
        scrollHeight:card.scrollHeight,items
      })==="AO.SM.C0174");
    if(position===undefined)throw Error(
      "PHONE_ELEVATION_HAS_NO_READER_FOCUS_TERRITORY");
    card.scrollTop=position;
    // The scroller may already be at its final edge: explicitly notify
    // the regular focus listener without modifying native source state.
    card.dispatchEvent(new Event("scroll"));
  });
  // B052 covers both C0173 (consecration words) and C0174 (elevation).
  // Require the *same exact source cue* and rendered rail state together.
  const elevationPainted=await page.waitForFunction(()=>{
    const source=window.__AO_PHONE_PREVIEW?.getNativeEventState();
    const context=document.querySelector('[data-role="objective-context"]');
    const rail=document.querySelector('.ao-rail-right [data-channel="priest-action"]');
    return source?.nativeCueId==="AO.SM.C0174" &&
      context?.dataset.blockId==="AO.SM.B052" &&
      rail?.dataset.actionTextFallback==="true";
  },null,{timeout:3500}).then(()=>true,()=>false);
  if(!elevationPainted){
    const diagnostic=await page.evaluate(()=>{
      const source=window.__AO_PHONE_PREVIEW?.getNativeEventState();
      const rail=document.querySelector('.ao-rail-right [data-channel="priest-action"]');
      return {activeCue:window.__AO_PHONE_PREVIEW?.getActiveCue(),
        nativeCueId:source?.nativeCueId,priestAction:source?.priestAction,
        priestActionOwner:source?.ownership?.priestAction,
        actionTextFallback:rail?.dataset.actionTextFallback,
        label:rail?.querySelector('[data-role="priest-action"]')?.textContent,
        contextBlock:document.querySelector('[data-role="objective-context"]')?.dataset.blockId,
        scrollTop:document.querySelector('.ao-prayer-card')?.scrollTop};
    });
    assert.fail("Elevation cue and rail did not stabilize together: "+JSON.stringify(diagnostic));
  }
  const objectiveVisual=await page.evaluate(()=>{
    const box=document.querySelector('[data-role="objective-context"]');
    const parent=document.querySelector(".ao-reader-stage");
    const top= document.querySelector('.ao-state-cell[data-side="faithful"]');
    const left=document.querySelector(".ao-rail-left");
    const posture=left?.querySelector('[data-channel="posture"]');
    const postureCopy=posture?.querySelector('[data-role="posture-left"]');
    const right=document.querySelector(".ao-rail-right");
    const position=right?.querySelector('[data-channel="priest-position"]');
    const action=right?.querySelector('[data-channel="priest-action"]');
    const actionText=action?.querySelector('[data-role="priest-action"]');
    return {
      context:box?.textContent??"",
      nativeCueId:window.__AO_PHONE_PREVIEW?.getNativeEventState()?.nativeCueId??null,
      contextHeight:box?.getBoundingClientRect().height??0,
      ribbonHeight:box?.parentElement?.getBoundingClientRect().height??0,
      oldTopDisplay:top?getComputedStyle(top).display:null,
      leftVisible:left?.dataset.visible??null,
      postureDisplay:posture?getComputedStyle(posture).display:null,
      postureIconHidden:posture?.querySelector('[data-icon-slot="posture"]')?.hidden??true,
      postureCopy:postureCopy?.textContent??"",
      postureCopyDisplay:postureCopy?getComputedStyle(postureCopy).display:null,
      rightVisible:right?.dataset.visible??null,
      positionActive:position?.dataset.active??null,
      positionLabel:position?.querySelector('[data-role="priest-position-rail"]')?.textContent??null,
      sourceActionFallback:action?.dataset.actionTextFallback??null,
      sourceActionText:actionText?.textContent??"",
      sourceActionTextDisplay:actionText?getComputedStyle(actionText).display:null,
      viewportOverflow:document.documentElement.scrollWidth-innerWidth,
    };
  });
  assert.match(objectiveVisual.context,/Host|Sacred Host/,
    "The context must explain the Consecration, not another Mass section");
  assert.equal(objectiveVisual.oldTopDisplay,"none",
    "LIVE explanation did not replace the duplicate top YOU/PRIEST cells");
  assert.equal(objectiveVisual.leftVisible,"true",
    "The faithful posture must remain visible in the left rail");
  assert.equal(objectiveVisual.postureDisplay,"grid",
    "Context ribbon hid the actual faithful posture tile via legacy LIVE CSS");
  assert.ok(!objectiveVisual.postureIconHidden,
    "Visible LIVE posture tile must contain real reviewed artwork, not a text fallback");
  assert.equal(objectiveVisual.postureCopyDisplay,"none",
    "Posture text may not be miniaturized inside the icon rail");
  assert.equal(objectiveVisual.rightVisible,"true",
    "Priest actions and position must remain on the right rail");
  assert.equal(objectiveVisual.positionActive,"true",
    "Context ribbon displaced the priest's active station");
  assert.equal(objectiveVisual.nativeCueId,"AO.SM.C0174",
    "The stationary visual audit must still be on the Host elevation cue");
  assert.equal(objectiveVisual.sourceActionFallback,"true",
    "The legacy objective context still identifies the unpainted elevation");
  assert.equal(objectiveVisual.sourceActionTextDisplay,"none",
    "An icon-shaped tile must never show tiny fallback rubric text");
  assert.ok(objectiveVisual.sourceActionText.trim() &&
    !/^—$/.test(objectiveVisual.sourceActionText.trim()),
    "Keep the original priest action text in source state, not in a rail box");
  assert.ok(objectiveVisual.ribbonHeight<=90,
    "Explanatory ribbon expanded excessively on a narrow phone");
  assert.ok(objectiveVisual.viewportOverflow<=1,
    "Context ribbon created horizontal phone overflow");
  const rubricLegibility=await page.evaluate(()=>{
    const rubric=document.querySelector('.ao-reader-paragraph[data-kind="RUBRIC"][data-cue-id="AO.SM.C0174"]');
    const annotation=rubric?.querySelector(".ao-live-inline-rubrics");
    return {
      exists:Boolean(rubric),
      visible:Boolean(rubric&&getComputedStyle(rubric).display!=="none"),
      opacity:rubric?Number(getComputedStyle(rubric).opacity):0,
      annotationOpacity:annotation?Number(getComputedStyle(annotation).opacity):null,
    };
  });
  assert.ok(rubricLegibility.exists&&rubricLegibility.visible,
    "The exact Host elevation source rubric must remain visible");
  assert.ok(rubricLegibility.opacity>=0.55,
    "Source rubric must remain readable, not disappear under faded LIVE focus");
  assert.ok(rubricLegibility.annotationOpacity==null ||
    rubricLegibility.annotationOpacity>=0.85,
    "Optional certified ceremonial detail is excessively dim");
  await mkdir(resolve(repoRoot,"artifacts/live-cinematics"),{recursive:true});
  await page.screenshot({
    path:resolve(repoRoot,"artifacts/live-cinematics/context-host-390-en.png"),
    fullPage:false,
  });


  async function tapMode(mode){
    const prefs=page.locator('[data-reader-preferences]');
    const prefBox=await prefs.boundingBox();
    assert.ok(prefBox&&prefBox.height>=40,"v1.80 Mass-preferences control is not touchable");
    await page.touchscreen.tap(prefBox.x+prefBox.width/2,prefBox.y+prefBox.height/2);
    await page.waitForFunction(()=>document.querySelector('[data-role="mass-preferences"]')?.dataset?.open==="true");
    const button=page.locator('[data-reader-mode="'+mode+'"]');
    const hit=await button.boundingBox();
    assert.ok(hit&&hit.height>=30,mode+" mode selector is not touchable in Mass preferences");
    await page.touchscreen.tap(hit.x+hit.width/2,hit.y+hit.height/2);
    await page.waitForFunction(expected=>window.__AO_PHONE_PREVIEW.getPresentationMode()===expected,mode,{timeout:3000});
    assert.equal(await button.getAttribute("aria-pressed"),"true",mode+" selector did not become active");
    await page.locator('[data-reader-preferences-close]').click();
  }

  // After the elevation bell cinematic the visible LIVE source cue can
  // legitimately settle on the adjacent Words paragraph. Preserve the exact
  // cue present when the reader actually switches modes, not a stale
  // 48-card test fixture's assumed C0174.
  const modeSwitchCue=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getActiveCue());
  assert.ok(["AO.SM.C0173","AO.SM.C0174"].includes(modeSwitchCue),
    "Mode switch started outside the sourced Host Consecration");
  await tapMode("SIMPLE");
  let switched=await page.evaluate(()=>({
    mode:window.__AO_PHONE_PREVIEW.getPresentationMode(),
    card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    product:window.__AO_PHONE_PREVIEW.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null,
    progress:document.querySelector('[data-role="progress"]')?.textContent??"",
  }));
  assert.deepEqual(switched,{mode:"SIMPLE",card:"AO.CARD.015",cue:modeSwitchCue,product:30,source:30,progress:"15 / 30"},
    "LIVE -> SIMPLE did not preserve the actually selected canonical Host cue");

  await tapMode("MISSAL");
  switched=await page.evaluate(()=>({
    mode:window.__AO_PHONE_PREVIEW.getPresentationMode(),
    card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    product:window.__AO_PHONE_PREVIEW.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null,
    progress:document.querySelector('[data-role="progress"]')?.textContent??"",
  }));
  assert.deepEqual(switched,{mode:"MISSAL",card:"AO.CARD.015",cue:modeSwitchCue,product:67,source:30,progress:"34 / 67"},
    "SIMPLE -> MISSAL changed the canonical Host source cue");
  assert.equal(await page.locator('.ao-missal-prayer-heading[data-source-block-id="AO.SM.B052"]').count(),1,
    "Missal lacks its in-text canonical prayer title at the Host Consecration");
  assert.equal(await page.locator('[data-role="missal-faithful-gesture"]').count(),1,
    "Missal faithful gesture channel missing from top ribbon");
  assert.equal(await page.locator('[data-role="missal-priest-action"]').count(),1,
    "Missal priest action channel missing from top ribbon");

  await tapMode("LIVE");
  switched=await page.evaluate(()=>({
    mode:window.__AO_PHONE_PREVIEW.getPresentationMode(),
    card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    product:window.__AO_PHONE_PREVIEW.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null,
    progress:document.querySelector('[data-role="progress"]')?.textContent??"",
  }));
  assert.equal(switched.mode,"LIVE");
  assert.equal(switched.card,"AO.LIVECURATED.AO.CANON.06.2",
    "MISSAL -> LIVE must return to the source-cued Host elevation card, not a 48-step macro");
  assert.equal(switched.cue,modeSwitchCue,
    "MISSAL -> curated LIVE did not preserve the selected Host source cue");
  assert.equal(switched.product,65,"Ordinary LIVE must use the actual 65-card presentation");
  assert.equal(switched.source,39,"Canonical Sung source sections must remain unchanged");
  assert.match(switched.progress,/^\d+ \/ 64$/,"Ordinary LIVE progress must count visible curated cards, omitting the optional second Confiteor");

  box=await nextButton.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CANON.07.1");
  assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell??null),null,
    "Host bell transient leaked into Chalice Consecration card");

  const progress=await page.locator('[data-role="progress"]').textContent();
  assert.match(progress,/^\d+ \/ 64$/,"Visible 64-card progression must survive Chalice preparation");
  const modelCounts=await page.evaluate(()=>({
    product:window.__AO_PHONE_PREVIEW?.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW?.sourceModel?.totalCards??null,
    productOwner:window.__AO_PHONE_PREVIEW?.model?.structureOwner??null,
    sourceOwner:window.__AO_PHONE_PREVIEW?.sourceModel?.structureOwner??null,
  }));
  assert.equal(modelCounts.product,65,"phone reader lost curated 65-card production presentation");
  assert.equal(modelCounts.source,39,"curated presentation modified the canonical 39-section source model");
  assert.equal(modelCounts.productOwner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
  assert.equal(modelCounts.sourceOwner,"SOURCE_FIRST_LIVE");

  await context.close();

  const frenchContext=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const french=await frenchContext.newPage();
  french.on("console",msg=>{if(msg.type()==="error")console.error("french browser console:",msg.text())});
  await french.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html?asperges=1&lang=fr",{waitUntil:"networkidle"});
  await french.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
  assert.equal(await french.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().id),"ASP-R01",
    "French Holy Rosary field path fell out of native reader before Asperges");
  const frenchNext=french.locator('[data-reader-nav="next"]');
  for(const expected of ["ASP-R02","ASP-R03","ASP-R04","ASP-R05"]){
    const hit=await frenchNext.boundingBox();
    await french.touchscreen.tap(hit.x+hit.width/2,hit.y+hit.height/2);
    await french.waitForFunction(id=>window.__AO_PHONE_PREVIEW.getCurrentCard().id===id,expected);
  }
  let frenchHit=await frenchNext.boundingBox();
  await french.touchscreen.tap(frenchHit.x+frenchHit.width/2,frenchHit.y+frenchHit.height/2);
  await french.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CARD.001.1");
  const frenchOpening=await french.locator('[data-role="paragraphs"]').textContent();
  assert.match(frenchOpening,/Introíbo ad altáre Dei/,
    "After Asperges, the sourced Foot-of-Altar prayers must remain before the Introit");
  // Asperges is explicitly FOOT_CLUSTER-owned; unlike Palm/Ash/Candlemas/
  // Rogations, it does not authorize omitting the four opening prayer cards.
  // Follow the actual 65-card curated source sequence to its B014 Introit.
  for(const ordinal of [2,3,4,5]){
    const next=await frenchNext.boundingBox();
    await french.touchscreen.tap(next.x+next.width/2,next.y+next.height/2);
    await french.waitForFunction(n=>
      window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CARD.001."+n,ordinal);
  }
  assert.equal(await french.evaluate(()=>
    window.__AO_PHONE_PREVIEW.getCurrentCard().blocks?.[0]?.blockId),"AO.SM.B014",
    "French Introit must remain owned by canonical B014, not an earlier Foot-of-Altar card");
  const frenchBody=await french.locator('[data-role="paragraphs"]').textContent();
  assert.match(frenchBody,/Réjouissons-nous ensemble dans le Seigneur/,
    "French-only resolved Proper did not reach its source-owned Introit card");
  assert.notEqual((await french.locator('[data-role="card-title"]').textContent())?.trim(),"",
    "French native reader rendered a blank card title");
  await frenchContext.close();

  for(const viewportSpec of [
    {width:320,height:700},
    {width:360,height:780},
    {width:430,height:900},
  ]){
    const phone=await browser.newContext({
      viewport:viewportSpec,
      deviceScaleFactor:2,
      isMobile:true,
      hasTouch:true,
    });
    const p=await phone.newPage();
    await p.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html",{waitUntil:"networkidle"});
    await p.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});

    const fits=await p.evaluate(()=>({
      horizontal:document.documentElement.scrollWidth<=window.innerWidth+1,
      shell:(()=>{
        const r=document.querySelector("[data-ao-reader-shell]")?.getBoundingClientRect();
        return r ? {x:r.x,y:r.y,right:r.right,bottom:r.bottom,w:window.innerWidth,h:window.innerHeight} : null;
      })(),
    }));
    assert.equal(fits.horizontal,true,viewportSpec.width+"px reader causes horizontal overflow");
    assert.ok(fits.shell && fits.shell.x>=-0.5 && fits.shell.right<=fits.shell.w+0.5,
      viewportSpec.width+"px reader shell does not fit viewport");

    for(const selector of ['[data-reader-nav="previous"]','[data-reader-nav="next"]']){
      const target=await p.locator(selector).boundingBox();
      assert.ok(target && target.height>=44,viewportSpec.width+"px "+selector+" touch target is under 44px");
    }

    const translate=p.locator('[data-translate-toggle="true"]').first();
    assert.ok(await translate.count(),viewportSpec.width+"px missing translation toggle");
    const tbox=await translate.boundingBox();
    const before=await translate.locator(".ao-line-primary").textContent();
    await p.touchscreen.tap(tbox.x+tbox.width/2,tbox.y+Math.min(tbox.height/2,30));
    await p.waitForFunction(previous=>{
      const value=document.querySelector('[data-translate-toggle="true"] .ao-line-primary')?.textContent;
      return value && value!==previous;
    },before);

    const initial=await p.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId);
    const next=p.locator('[data-reader-nav="next"]');
    const nbox=await next.boundingBox();
    await p.touchscreen.tap(nbox.x+nbox.width/2,nbox.y+nbox.height/2);
    await p.waitForFunction(previous=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId!==previous,initial);

    await p.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.LIVECURATED.AO.CANON.06.1"));
    await p.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CANON.06.1");
    await p.waitForTimeout(200);
    const firstCue=await p.evaluate(()=>window.__AO_PHONE_PREVIEW.getActiveCue());
    assert.equal(firstCue,"AO.SM.C0168",viewportSpec.width+"px top-of-card focus lost first cue ownership");

    await phone.close();
  }

  const aspContext=await browser.newContext({
    viewport:{width:390,height:844},
    deviceScaleFactor:2,
    isMobile:true,
    hasTouch:true,
  });
  const asp=await aspContext.newPage();
  await asp.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html?asperges=1",{waitUntil:"networkidle"});
  await asp.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
  assert.equal(await asp.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().id),"ASP-R01",
    "Asperges prelude lost first-card ownership");
  assert.equal(await asp.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().formulaState.formula),"ORDINARY",
    "4 October field session selected Vidi aquam instead of Asperges me");

  const aspNext=asp.locator('[data-reader-nav="next"]');
  for(const expected of ["ASP-R02","ASP-R03"]){
    const hit=await aspNext.boundingBox();
    await asp.touchscreen.tap(hit.x+hit.width/2,hit.y+hit.height/2);
    await asp.waitForFunction(id=>window.__AO_PHONE_PREVIEW.getCurrentCard().id===id,expected);
  }
  assert.equal(await asp.locator('[data-role="gesture"]').textContent(),"—",
    "Asperges personal Sign of Cross fired before actual sprinkling");
  await asp.evaluate(()=>window.__AO_PHONE_PREVIEW.markActuallySprinkled());
  await asp.waitForFunction(()=>document.querySelector('[data-role="gesture"]')?.textContent?.includes("MAKE_FULL_SIGN_OF_CROSS"));
  for(const expected of ["ASP-R04","ASP-R05"]){
    const hit=await aspNext.boundingBox();
    await asp.touchscreen.tap(hit.x+hit.width/2,hit.y+hit.height/2);
    await asp.waitForFunction(id=>window.__AO_PHONE_PREVIEW.getCurrentCard().id===id,expected);
  }
  let hit=await aspNext.boundingBox();
  await asp.touchscreen.tap(hit.x+hit.width/2,hit.y+hit.height/2);
  await asp.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CARD.001.1");
  assert.match(await asp.locator('[data-role="progress"]').textContent(),/1 \/ 64/,
    "Asperges did not hand off to the first curated 65-card LIVE prayer");
  assert.equal(await asp.evaluate(()=>window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null),39,
    "Asperges handoff replaced the certified 39-step source model");

  const aspBack=asp.locator('[data-reader-nav="previous"]');
  hit=await aspBack.boundingBox();
  await asp.touchscreen.tap(hit.x+hit.width/2,hit.y+hit.height/2);
  await asp.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().id==="ASP-R05");
  assert.equal(await asp.evaluate(()=>window.__AO_PHONE_PREVIEW.getAspergesState().handoff),"FOOT_CLUSTER",
    "Back from Mass did not restore the Asperges handoff card");
  await aspContext.close();


  async function exerciseRecipientPrelude(kind,firstId,recipientCardId,receiveState,handoffId){
    const ctx=await browser.newContext({
      viewport:{width:390,height:844},
      deviceScaleFactor:2,
      isMobile:true,
      hasTouch:true,
    });
    const p=await ctx.newPage();
    await p.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html?rite="+kind.toLowerCase(),{waitUntil:"networkidle"});
    await p.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
    assert.equal(await p.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().id),firstId,kind+" lost first-card ownership");
    const next=p.locator('[data-reader-nav="next"]');
    while((await p.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().id))!==recipientCardId){
      const b=await next.boundingBox();
      await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
      await p.waitForTimeout(80);
    }
    if(kind==="PALM")await p.evaluate(state=>window.__AO_PHONE_PREVIEW.setPalmRecipientState(state),receiveState);
    else await p.evaluate(state=>window.__AO_PHONE_PREVIEW.setAshRecipientState(state),receiveState);
    await p.waitForFunction(()=>document.querySelector('[data-role="posture"]')?.textContent?.includes("KNEEL"));
    while((await p.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().id))!==handoffId){
      const b=await next.boundingBox();
      await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
      await p.waitForTimeout(80);
    }
    let b=await next.boundingBox();
    await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
    await p.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.LIVECURATED.AO.CARD.001.5");
    assert.equal(await p.locator('[data-role="card-title"]').textContent(),"Introit",kind+" handoff leaked preparatory prayers");
    const back=p.locator('[data-reader-nav="previous"]');
    b=await back.boundingBox();
    await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
    await p.waitForFunction(id=>window.__AO_PHONE_PREVIEW.getCurrentCard().id===id,handoffId);
    await ctx.close();
  }

  await exerciseRecipientPrelude("PALM","PALM-R01","PALM-R02","RECEIVE_PALM","PALM-R07");
  await exerciseRecipientPrelude("ASH","ASH-R01","ASH-R03","RECEIVE_ASHES","ASH-R05");


  // The standard 1962 Mass print must be user-operable and sourced from all
  // 96 canonical Missal blocks. A votive/preceding-rite graph is rejected.
  for(const lang of ["en","fr"]){
    const printCtx=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
    const printPage=await printCtx.newPage();
    await printPage.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html?print=1&lang="+lang,
      {waitUntil:"networkidle"});
    await printPage.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
    // Secondary printing lives inside the existing preferences umbrella:
    // it must not obstruct the section jump or current curated LIVE ribbon.
    assert.equal(await printPage.locator('[data-ao-native-mass-print]').isVisible(),false,
      "Print action leaked from closed Mass preferences");
    await printPage.locator("[data-reader-preferences]").click();
    await printPage.locator('[data-role="mass-preferences"][data-open="true"]').waitFor({state:"visible",timeout:10000});
    const button=printPage.locator('[data-ao-native-mass-print="source-text"]');
    if(await button.count()!==1 || !await button.isVisible()){
      const debug=await printPage.evaluate(()=>({
        root:document.querySelector("#ao-r17-native-reader-preview")?.dataset??null,
        previewRoot:window.__AO_PHONE_PREVIEW?.root?.id??null,
        printCount:document.querySelectorAll("[data-ao-native-mass-print]").length,
        prefs:document.querySelector('[data-role="mass-preferences"]')?.outerHTML?.slice(0,1600)||null,
      }));
      throw new Error("Mass print control missing from open preferences: "+JSON.stringify({lang,debug}));
    }
    const rect=await button.boundingBox();
    assert.ok(rect&&rect.height>=44,"Native print requires a 44px touch target");
    const printErrors=[];
    printPage.on("console",message=>{if(message.type()==="error")printErrors.push(message.text())});
    const popupPromise=printPage.waitForEvent("popup",{timeout:6000}).catch(()=>null);
    await button.click();
    const printed=await popupPromise;
    if(!printed){
      const details=await printPage.evaluate(()=>({
        status:document.querySelector("#ao-r17-native-reader-preview")?.dataset?.aoNativePrintStatus??null,
        button:document.querySelector("[data-ao-native-mass-print]")?.outerHTML?.slice(0,750)??null,
        url:location.href,
      }));
      throw new Error("Native Mass print did not open a popup: "+JSON.stringify({lang,details,printErrors}));
    }
    await printed.locator('main [data-section]').first().waitFor({state:"visible",timeout:12000});
    assert.equal(await printed.locator("main [data-section]").count(),30,
      "Print must use the 30-section complete Missal corpus, not 65 curated LIVE cards");
    const body=await printed.locator("body").innerText();
    assert.match(body,/Per ómnia sǽcula sæculórum/,"Canon conclusion was not printed");
    assert.match(body,/R17 96/,"One or more source blocks were omitted");
    assert.match(body,/This is not a certified complete|n’est pas un missel liturgique certifié/,
      "Print failed to disclose its limited ceremonial coverage");
    const right=lang==="fr"?"fr":"en";
    assert.ok(await printed.locator('.two p[lang="'+right+'"]').count()>30,
      "Proper and Ordinary vernacular columns absent: "+right);
    assert.equal(await printPage.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards),65,
      "Printing mutated the curated 65-card native LIVE presentation");
    await printed.close();
    await printCtx.close();
  }
  console.log("PASS Native Mass text print on phone: 30 Missal sections, 96 source blocks, Canon B061, EN/FR and curated LIVE65 preserved");

  // Missal-only visual QA: independently capture actual 320/390px source
  // prayer pages and ribbon without perturbing the LIVE phone assertions.
  // Captures are presentation evidence, not a claim of editorial approval.
  await mkdir(resolve(repoRoot,"artifacts/missal-phone-review"),{recursive:true});
  for(const width of [320,390]){
    const visualContext=await browser.newContext({
      viewport:{width,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,
    });
    const visualPage=await visualContext.newPage();
    await visualPage.goto("http://127.0.0.1:4173/tests/fixtures/reader-phone-harness.html",
      {waitUntil:"networkidle"});
    await visualPage.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
      null,{timeout:20000});
    await visualPage.locator("[data-reader-preferences]").click();
    await visualPage.locator('[data-reader-mode="MISSAL"]').click();
    await visualPage.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getPresentationMode()==="MISSAL");
    await visualPage.locator('[data-reader-preferences-close]').click();
    await visualPage.waitForFunction(()=>document.querySelector(
      '[data-role="mass-preferences"]')?.dataset.open==="false");
    await visualPage.waitForTimeout(270);
    const ribbon=visualPage.locator(".ao-state-ribbon");
    assert.equal(await ribbon.isVisible(),true,
      "Missal gesture and priest-action top ribbon must be visible");
    assert.ok((await ribbon.boundingBox())?.height>=56,
      "Missal top ribbon collapsed");
    const pages=[
      ["offertory-bread","AO.MISSAL.010.2","AO.SM.B031"],
      ["canon-opening","AO.MISSAL.014.1","AO.SM.B047"],
      ["canon-memento-dead","AO.MISSAL.017.4","AO.SM.B057"],
      ["consecration-host","AO.CARD.015","AO.SM.B052"],
    ];
    for(const [name,sectionId,blockId] of pages){
      await visualPage.evaluate(id=>window.__AO_PHONE_PREVIEW.showSection(id),sectionId);
      await visualPage.waitForFunction(id=>
        window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId===id,sectionId,{timeout:5000});
      const heading=visualPage.locator('.ao-missal-prayer-heading[data-source-block-id="'+blockId+'"]');
      assert.equal(await heading.count(),1,
        "Missal visual target lacks exact source block "+blockId);
      assert.equal(await visualPage.locator('.ao-state-cell[data-side="faithful"]').isVisible(),true,
        "Missal "+name+" faithful ribbon hidden");
      assert.equal(await visualPage.locator('.ao-state-cell[data-side="priest"]').isVisible(),true,
        "Missal "+name+" priest ribbon hidden");
      assert.equal(await visualPage.locator(".ao-state-source").isVisible(),false,
        "Missal "+name+" has duplicate Canon source banner in the rubric ribbon");
      if(blockId==="AO.SM.B031"){
        assert.match(
          (await visualPage.locator('[data-role="missal-priest-action"]').textContent())??"",
          /OFFERS HOST/,
          "Missal rubric ribbon did not retrieve B031's exact C0110 action"
        );
      }

      const horizontalOverflow=await visualPage.evaluate(()=>
        document.documentElement.scrollWidth>window.innerWidth+1);
      assert.equal(horizontalOverflow,false,
        "Missal "+name+" has horizontal page overflow at "+width+"px");
      await visualPage.screenshot({
        path:resolve(repoRoot,"artifacts/missal-phone-review",width+"-"+name+".png"),
      });
    }
    await visualContext.close();
  }
  console.log("phone browser acceptance: PASS — 320/360/390/430px Chromium touch, source-first Mass, plus native Asperges/Palm/Ash prelude handoffs.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
