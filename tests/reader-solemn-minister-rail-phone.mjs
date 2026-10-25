import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream"});
    res.end(bytes);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4368,"127.0.0.1",done);});
let browser;
async function focusCue(page,section,cue){
  // Source-owned LIVE projections can split a section (notably Offertory).
  // Resolve its exact cue, not a guessed display card ID. This works for
  // the curated 65-card ordinary Mass and retained Requiem compatibility.
  const found=await page.evaluate(({section,cue})=>{
    const api=window.__AO_PHONE_PREVIEW;
    const card=api.model.cards.find(c=>
      (c.sectionId===section||c.sourceSectionId===section) &&
      c.paragraphs?.some(p=>(p.sourceCueIds??[]).includes(cue)));
    return card?Boolean(api.showSequence(card.sequence)):false;
  },{section,cue});
  assert.ok(found,"Missing source cue "+cue+" within "+section);
  await page.locator(".ao-prayer-card").evaluate((el,cue)=>{
    const hit=el.querySelector('[data-cue-id="'+cue+'"]');
    if(!hit)throw new Error("Source cue missing from "+el.parentElement?.className+": "+cue);
    const a=el.getBoundingClientRect(),b=hit.getBoundingClientRect();
    el.scrollTop=Math.max(0,b.top-a.top+el.scrollTop+b.height/2-el.clientHeight*.39);
  },cue);
  await page.waitForFunction(cue=>window.__AO_PHONE_PREVIEW.getActiveCue()===cue,cue,{timeout:7000});
  // The cue focus tracker reports before the next RAF paints rail channels.
  // Assert against the *rendered* native state, not the unpainted cursor.
  await page.waitForFunction(cue=>
    window.__AO_PHONE_PREVIEW.getNativeEventState()?.nativeCueId===cue &&
    document.querySelector('[data-r17-native-cue]')?.dataset.r17NativeCue===cue,
    cue,{timeout:7000});
}
try{
  browser=await chromium.launch({headless:true});
  for(const width of [360,390]){
    for(const form of ["SOLEMN","MISSA_CANTATA_INCENSE"]){
      const context=await browser.newContext({viewport:{width,height:844},
        hasTouch:true,isMobile:true,deviceScaleFactor:2});
      const page=await context.newPage(),errors=[];
      page.on("pageerror",e=>errors.push(String(e?.message??e)));
      await page.goto("http://127.0.0.1:4368/tests/fixtures/reader-phone-harness.html?mode=LIVE&form="+form,
        {waitUntil:"networkidle"});
      await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
        null,{timeout:25000});
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards),65,
        "Ordinary Solemn/Cantata must use the curated 65-card production family");
      await focusCue(page,"AO.CARD.007","AO.SM.C0082");
      const current=await page.evaluate(()=>{
        const rail=document.querySelector('.ao-rail-right [data-channel="sacred-minister"]');
        const state=window.__AO_PHONE_PREVIEW.getNativeEventState();
        const lines=[...document.querySelectorAll(
          '.ao-live-inline-rubrics .ao-live-rubric-action[data-source-cue-id="AO.SM.C0082"]'
        )].map(el=>el.textContent?.trim()??"");
        return {active:rail?.dataset.active,text:rail?.textContent,
          accessible:rail?.getAttribute("aria-label"),minister:state?.sacredMinister,
          railDisplay:rail?getComputedStyle(rail).display:null,
          railHidden:rail?.getAttribute("aria-hidden"),
          inline:lines,stage:document.querySelector(".ao-reader-stage")?.dataset.rightRail,
          overflow:document.documentElement.scrollWidth-innerWidth};
      });
      if(form==="SOLEMN"){
        assert.equal(current.active,"true","Solemn subdeacon's Epistle rubric not visible");
        assert.match(current.text??"",/DEACON.*GOSPEL/i);
        assert.match(current.accessible??"",/not independently observed/i);
        assert.equal(current.minister?.actor,"DEACON");
        assert.equal(current.railDisplay,"none",
          "The priest/minister rail must not show a text-only icon-shaped tile");
        assert.equal(current.railHidden,"true",
          "Text-only minister source must not masquerade as a graphic");
        assert.ok(current.inline.some(x=>/DEACON.*GOSPEL/i.test(x)),
          "Solemn deacon's exact source rubric is missing from its LIVE paragraph");
      }else{
        assert.equal(current.active,"false","Cantata improperly invented a deacon");
        assert.equal(current.minister,null);
      }
      assert.ok(current.overflow<=1,"New rail overflows "+width+"px phone");
      // The curated reader splits Offertory 010, and source C0112 may
      // share a paragraph with C0113. Open the actual B032 prayer
      // presentation, not an invented exact-word observation/gesture trigger.
      const opened=await page.evaluate(()=>{
        const api=window.__AO_PHONE_PREVIEW;
        const card=api.model.cards.find(c=>c.blocks?.some(b=>b.blockId==="AO.SM.B032"));
        return card?Boolean(api.showSequence(card.sequence)):false;
      });
      assert.ok(opened,"Canonical Offertory B032 is missing from LIVE");
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const unknown=await page.evaluate(()=>{
        const rail=document.querySelector('.ao-rail-right [data-channel="sacred-minister"]');
        return {active:rail?.dataset.active,aria:rail?.getAttribute("aria-label"),
          minister:window.__AO_PHONE_PREVIEW.getNativeEventState()?.sacredMinister};
      });
      assert.equal(unknown.active,"false",
        "Unreleased Offertory minister movement leaked into LIVE");
      assert.equal(unknown.aria,null,"Stale Solemn minister cue remained accessible after navigation");
      assert.equal(unknown.minister,null);
      assert.deepEqual(errors,[],"Browser exceptions in "+form+" at "+width+"px");
      await context.close();
    }
  }
  // Actual selected Solemn Requiem, not a CSS-only hidden label. The
  // expected minister rail uses the existing 19 source events with explicit
  // 1962 Requiem omissions; observation status must remain false.
  for(const width of [360,390]){
    const context=await browser.newContext({viewport:{width,height:844},
      hasTouch:true,isMobile:true,deviceScaleFactor:2});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message??e)));
    await page.goto("http://127.0.0.1:4368/tests/fixtures/reader-phone-harness.html?mode=LIVE&form=SOLEMN&requiem=1",
      {waitUntil:"networkidle"});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
      null,{timeout:25000});
    assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards),48);
    for(const [cue,expectVisible,part] of [
      ["AO.SM.C0076",true,/without receiving.*blessing/i],
      ["AO.SM.C0080",false,null],
      ["AO.SM.C0081",true,/neither incense nor lighted candles/i],
      ["AO.SM.C0120",true,/choir and people are not/i],
      ["AO.SM.C0212",false,null],
      ["AO.SM.C0225",false,null],
    ]){
      const section=await page.evaluate(cue=>{
        const card=window.__AO_PHONE_PREVIEW.model.cards.find(c=>
          c.paragraphs?.some(p=>(p.sourceCueIds??[]).includes(cue)));
        return card?.sourceSectionId??card?.sectionId??null;
      },cue);
      if(!section){
        // An explicitly omitted Requiem prayer is a legitimate absence.
        assert.equal(expectVisible,false,"Retained Requiem event disappeared: "+cue);
        continue;
      }
      await focusCue(page,section,cue);
      const observed=await page.evaluate(()=>{
        const rail=document.querySelector('.ao-rail-right [data-channel="sacred-minister"]');
        const state=window.__AO_PHONE_PREVIEW.getNativeEventState();
        const cue=state?.nativeCueId??null;
        const inline=[...document.querySelectorAll('.ao-live-inline-rubrics .ao-live-rubric-action')]
          .filter(el=>el.dataset.sourceCueId===cue)
          .map(el=>el.textContent?.trim()??"");
        const paragraph=[...document.querySelectorAll(".ao-reader-paragraph")]
          .find(el=>el.dataset.cueId===cue ||
            String(el.dataset.sourceCueIds??"").split(/\s+/).includes(cue));
        const sourceParagraphText=paragraph?.querySelector(".ao-line-primary")?.textContent?.trim()??"";
        return {active:rail?.dataset.active,text:rail?.textContent,
          aria:rail?.getAttribute("aria-label"),minister:state?.sacredMinister,
          railDisplay:rail?getComputedStyle(rail).display:null,
          railHidden:rail?.getAttribute("aria-hidden"),inline,sourceParagraphText,
          width:document.documentElement.scrollWidth-innerWidth};
      });
      assert.equal(observed.active,expectVisible?"true":"false",
        "Wrong Requiem minister visibility at "+cue);
      if(expectVisible){
        // The compact rail intentionally shows actor + short label only;
        // the sourced full action remains available in the native projection.
        assert.match(observed.minister?.action??"",part);
        assert.equal(observed.railDisplay,"none",
          "Requiem minister instruction must not be compressed into a rail tile");
        assert.equal(observed.railHidden,"true");
        assert.ok(observed.inline.some(x=>part.test(x)) ||
          part.test(observed.sourceParagraphText),
          "The exact certified Requiem minister rubric is absent from inline annotation AND printed source paragraph at "+cue);
        assert.ok(observed.minister);
      }else{
        assert.equal(observed.minister,null,"Absent Requiem action was exported");
        assert.equal(observed.aria,null,"Stale Requiem minister tile still accessible");
      }
      assert.ok(observed.width<=1,"Requiem minister tile overflow "+width+"px");
    }
    assert.deepEqual(errors,[],"Requiem phone browser errors");
    await context.close();
  }
  console.log("PASS 360/390px Solemn/Cantata LIVE: certified minister instructions are inline, missing-art rail hidden and unobserved actions fail closed.");
}finally{
  await browser?.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
}
