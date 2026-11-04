import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
let browser;
try{
 await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
 browser=await chromium.launch({headless:true});
 for(const spec of [
  {width:320,lang:"en",requiem:true},
  {width:390,lang:"fr",requiem:true},
  {width:390,lang:"en",requiem:false}
 ]){
  const ctx=await browser.newContext({viewport:{width:spec.width,height:844},isMobile:true,hasTouch:true});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message??e)));
   const query=new URLSearchParams({production:"1",aoLiveCards:"65",requiem:spec.requiem?"1":"0",
    lang:spec.lang,form:"MISSA_CANTATA_SIMPLE",mode:"LIVE"});
   await page.goto("http://127.0.0.1:"+server.address().port+"/tests/fixtures/reader-phone-harness.html?"+query,
    {waitUntil:"networkidle",timeout:55000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:25000});
   const before=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW,card=api.model.cards.find(c=>c.title==="Kyrie");
    if(!card)throw Error("Kyrie card missing");
    api.showSequence(card.sequence);
    return {section:api.getCurrentCard().sectionId,cue:api.getActiveCue()};
   });
   const plan=page.locator("[data-schola-local-panel]");
   await plan.locator("summary").first().click();
   await plan.locator("[data-schola-music-setting]").selectOption("faure-requiem-op48");
   if(spec.requiem){
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola?.composedWorkId==="faure-requiem-op48");
    // LIVE UI rendering is scheduled after the controller projection. Do not
    // compare composer lyrics while the previous Gregorian line is still in
    // the DOM; require BOTH Latin and translated words to be painted.
    await page.waitForFunction(()=>{
      const schola=window.__AO_PHONE_PREVIEW.getScholaState()?.schola;
      const dock=document.querySelector(".ao-schola-dock");
      const displayedLatin=dock?.querySelector('[data-role="schola"]')?.textContent?.trim();
      const displayedTranslation=dock?.querySelector(
        '[data-role="schola-inline-translation"]')?.textContent?.trim();
      return schola?.composedWorkId==="faure-requiem-op48" &&
        dock?.dataset.composed==="true" &&
        displayedLatin===schola.latin &&
        displayedTranslation===schola.english;
    },null,{timeout:15000});
    const lyric=await page.evaluate(()=>({
      schola:window.__AO_PHONE_PREVIEW.getScholaState().schola,
      text:document.querySelector('[data-role="schola"]')?.textContent,
      translation:document.querySelector('[data-role="schola-inline-translation"]')?.textContent,
      classMode:document.querySelector('.ao-schola-dock')?.dataset.composed
    }));
    assert.equal(lyric.schola.trackId,"KYRIE");
    assert.equal(lyric.schola.total,3);
    assert.match(lyric.text,/Kyrie eleison/);
    assert.match(lyric.translation,spec.lang==="fr"?/Seigneur, prenez pitié/:/Lord, have mercy/);
    assert.equal(lyric.classMode,"true");
    assert.equal(await page.locator(".ao-schola-dock").getAttribute("data-shared"),"false",
      "Composer's literal lyrics must not be mistaken for duplicate Gregorian central text");
    assert.equal(await page.locator('[data-role="schola"]').evaluate(el=>getComputedStyle(el).visibility),
      "visible","Selected composer lyrics must remain visible inside the actual LIVE Schola dock");
    assert.equal(await page.locator('[data-role="schola-inline-translation"]').isVisible(),true);
    await plan.locator("summary").first().click();
    // showSequence schedules a source-cue projection. Capture the settled
    // Kyrie priest cue BEFORE advancing any manual Schola phrase, otherwise
    // a pending initial projection (null -> source cue) looks like choir
    // navigation changed the priest clock.
    await page.waitForFunction(()=>
      window.__AO_PHONE_PREVIEW.getCurrentCard()?.title==="Kyrie" &&
      Boolean(window.__AO_PHONE_PREVIEW.getActiveCue()),null,{timeout:15000});
    const cueBeforeManualPhrase=await page.evaluate(()=>
      window.__AO_PHONE_PREVIEW.getActiveCue());
    await page.locator("[data-schola-next]").click();
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.schola?.index===1);
    const after=await page.evaluate(()=>({
      section:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
      cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
      line:window.__AO_PHONE_PREVIEW.getScholaState().schola.latin
    }));
    assert.equal(after.section,before.section,"Manual choir phrase step changed priest card");
    assert.equal(after.cue,cueBeforeManualPhrase,"Manual choir phrase step changed settled priest cue");
    assert.match(after.line,/Christe eleison/);
    // In the production 65-card reader the Gradual and Tract are a single
    // source-owned pre-Gospel card; a separately titled "Gradual" exists only
    // in the optional sourceChants split-navigation test fixture.
    const preGospelTitle=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>c.sourceSectionId==="AO.CARD.006");
      if(!card)throw Error("Canonical pre-Gospel source section missing");
      api.showSequence(card.sequence);
      return card.title;
    });
    await page.waitForFunction(()=>["GRADUAL","ALLELUIA_TRACT_SEQUENCE"]
      .includes(window.__AO_PHONE_PREVIEW.getScholaState()?.trackId),
      null,{timeout:15000});
    assert.ok(!await page.locator(".ao-schola-dock").getAttribute("data-composed").then(x=>x==="true"),
      "Fauré must not replace the appointed Gradual");
    assert.match((await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola.owner)),
      /R17_NATIVE/,"Gregorian source owner must survive on nonmapped track");
    await plan.locator("summary").first().click();
    const select=plan.locator("[data-schola-manual-movement]");
    assert.equal(await select.isVisible(),true,"Manual text selection must be offered with Fauré");
    await select.selectOption("PIE_JESU");
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola?.manualMovementId==="PIE_JESU");
    let extra=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola);
    assert.equal(extra.total,4);assert.match(extra.latin,/Pie Jesu/);
    assert.equal(extra.musicStatus,"MANUAL_TEXT_REFERENCE_NOT_OBSERVED");
    assert.match(await page.locator("[data-role='schola-inline-translation']").innerText(),
      spec.lang==="fr"?/Jésus/:/Jesus/);
    await select.selectOption("LIBERA_ME");
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola?.manualMovementId==="LIBERA_ME");
    extra=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola);
    assert.equal(extra.total,15);assert.match(extra.latin,/Libera me/);
    await select.selectOption("IN_PARADISUM");
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola?.manualMovementId==="IN_PARADISUM");
    extra=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola);
    assert.equal(extra.total,6);assert.match(extra.latin,/In paradisum/);
    await select.selectOption("");
    // As with initial composer selection, controller state settles before
    // the queued dock paint. Assert that actual DOM returns to Gregorian,
    // rather than assuming the first repaint has already completed.
    await page.waitForFunction(()=>{
      const source=window.__AO_PHONE_PREVIEW.getScholaState()?.schola;
      const dock=document.querySelector(".ao-schola-dock");
      return source?.owner==="R17_NATIVE_SCHOLA" &&
        dock?.dataset.composed==="false";
    },null,{timeout:15000});
    assert.equal(await page.locator(".ao-schola-dock").getAttribute("data-composed"),"false");
    await plan.locator("summary").first().click();
    assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().title),preGospelTitle,
      "Manual extra musical references must not move the priest Mass card");
   }else{
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.trackId==="KYRIE");
    const state=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState());
    assert.equal(state.schola?.composedWorkId,undefined,"Non-Requiem Mass cannot inherit Fauré");
    assert.equal(state.schola?.owner,"R17_NATIVE_SCHOLA");
   }
   assert.deepEqual(errors,[],"Browser errors: "+JSON.stringify(errors));
   console.log("PASS LIVE Schola composed text "+spec.width+"px / "+spec.lang+
    " / requiem="+spec.requiem);
  }finally{await ctx.close()}
 }
 // The Requiem Absolution is a separate source-owned rite, not another
 // Gregorian ordinary track. Explicit Libera me must remain visible
 // without moving the Absolution card when the listener advances lyrics.
 const ctx=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 try{
  const page=await ctx.newPage();
  const query=new URLSearchParams({production:"1",following:"requiem",body:"1",
   burial:"1",date:"2026-11-02",form:"SOLEMN",mode:"LIVE"});
  await page.goto("http://127.0.0.1:"+server.address().port+
   "/tests/fixtures/reader-phone-harness.html?"+query,
   {waitUntil:"domcontentloaded",timeout:55000});
  await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:30000});
  const panel=page.locator("[data-schola-local-panel]");
  await panel.locator("summary").first().click();
  await panel.locator("[data-schola-music-setting]").selectOption("faure-requiem-op48");
  await panel.locator("[data-schola-manual-movement]").selectOption("LIBERA_ME");
  await page.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   for(const c of [...api.model.cards].reverse()){
    if(api.showSequence(c.sequence))return;
   }
   throw Error("No terminal Requiem Mass card");
  });
  await page.locator("#ao-r17-native-reader-preview [data-reader-nav='next']").click();
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.specialRite==="REQUIEM_ABSOLUTION",
    null,{timeout:15000});
  await page.waitForFunction(()=>document.querySelector(".ao-schola-dock")?.dataset.composed==="true");
  assert.match(await page.locator('[data-role="schola"]').innerText(),/Libera me/,
   "Real Requiem Absolution transition lost selected full Fauré text");
  assert.match(await page.locator('[data-role="schola-inline-translation"]').innerText(),/Deliver me/);
  assert.equal(await page.locator(".ao-schola-dock").getAttribute("data-special-only"),"false");
  const before=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getRequiemAbsolutionState().card.id);
  await page.locator("[data-schola-next]").click();
  await page.waitForFunction(()=>document.querySelector('[data-role="schola"]')?.textContent.includes("in die illa"));
  const after=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getRequiemAbsolutionState().card.id);
  assert.equal(after,before,"Sung Libera me line advance shifted Absolution ceremony card");
  console.log("PASS LIVE Requiem Absolution 390px · manual Fauré Libera me, translation and rite independence");
 }finally{await ctx.close()}
}finally{await browser?.close();if(server.listening)await new Promise(ok=>server.close(ok))}
