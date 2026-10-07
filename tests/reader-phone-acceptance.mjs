import assert from "node:assert/strict";
import http from "node:http";
import { readFile } from "node:fs/promises";
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

  await page.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.CANON.06"));
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CANON.06");
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

  await tapMode("SIMPLE");
  let switched=await page.evaluate(()=>({
    mode:window.__AO_PHONE_PREVIEW.getPresentationMode(),
    card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    product:window.__AO_PHONE_PREVIEW.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null,
    progress:document.querySelector('[data-role="progress"]')?.textContent??"",
  }));
  assert.deepEqual(switched,{mode:"SIMPLE",card:"AO.CARD.015",cue:"AO.SM.C0174",product:30,source:30,progress:"15 / 30"},
    "LIVE -> SIMPLE did not preserve the exact Host elevation source anchor");

  await tapMode("MISSAL");
  switched=await page.evaluate(()=>({
    mode:window.__AO_PHONE_PREVIEW.getPresentationMode(),
    card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    product:window.__AO_PHONE_PREVIEW.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null,
    progress:document.querySelector('[data-role="progress"]')?.textContent??"",
  }));
  assert.deepEqual(switched,{mode:"MISSAL",card:"AO.CARD.015",cue:"AO.SM.C0174",product:30,source:30,progress:"15 / 30"},
    "SIMPLE -> MISSAL changed the canonical Host elevation anchor");

  await tapMode("LIVE");
  switched=await page.evaluate(()=>({
    mode:window.__AO_PHONE_PREVIEW.getPresentationMode(),
    card:window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId??null,
    cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
    product:window.__AO_PHONE_PREVIEW.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW.sourceModel?.totalCards??null,
    progress:document.querySelector('[data-role="progress"]')?.textContent??"",
  }));
  assert.deepEqual(switched,{mode:"LIVE",card:"AO.CANON.06",cue:"AO.SM.C0174",product:48,source:39,progress:"21 / 48"},
    "MISSAL -> LIVE did not restore the exact 48-step Host elevation surface");

  box=await nextButton.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CANON.07");
  assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell??null),null,
    "Host bell transient leaked into Chalice Consecration card");

  const progress=await page.locator('[data-role="progress"]').textContent();
  assert.match(progress,/22 \/ 48/,"48-step LIVE product counter did not reach Chalice Consecration as 22 / 48");
  const modelCounts=await page.evaluate(()=>({
    product:window.__AO_PHONE_PREVIEW?.model?.totalCards??null,
    source:window.__AO_PHONE_PREVIEW?.sourceModel?.totalCards??null,
    productOwner:window.__AO_PHONE_PREVIEW?.model?.structureOwner??null,
    sourceOwner:window.__AO_PHONE_PREVIEW?.sourceModel?.structureOwner??null,
  }));
  assert.equal(modelCounts.product,48,"phone reader lost 48-step product presentation");
  assert.equal(modelCounts.source,39,"48-step product presentation replaced the certified 39-step source model");
  assert.equal(modelCounts.productOwner,"SOURCE_FIRST_LIVE_PRODUCT_48");
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
  await french.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CARD.001");
  const frenchBody=await french.locator('[data-role="paragraphs"]').textContent();
  assert.match(frenchBody,/Réjouissons-nous ensemble dans le Seigneur/,
    "French-only resolved Proper did not reach the native Mass card");
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

    await p.evaluate(()=>window.__AO_PHONE_PREVIEW.showSection("AO.CANON.06"));
    await p.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CANON.06");
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
  await asp.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CARD.001");
  assert.match(await asp.locator('[data-role="progress"]').textContent(),/1 \/ 48/,
    "Asperges did not hand off to the first 48-step LIVE product card");
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
    await p.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CARD.001");
    assert.equal(await p.locator('[data-role="card-title"]').textContent(),"Introit",kind+" handoff leaked preparatory prayers");
    const back=p.locator('[data-reader-nav="previous"]');
    b=await back.boundingBox();
    await p.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);
    await p.waitForFunction(id=>window.__AO_PHONE_PREVIEW.getCurrentCard().id===id,handoffId);
    await ctx.close();
  }

  await exerciseRecipientPrelude("PALM","PALM-R01","PALM-R02","RECEIVE_PALM","PALM-R07");
  await exerciseRecipientPrelude("ASH","ASH-R01","ASH-R03","RECEIVE_ASHES","ASH-R05");

  console.log("phone browser acceptance: PASS — 320/360/390/430px Chromium touch, source-first Mass, plus native Asperges/Palm/Ash prelude handoffs.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
