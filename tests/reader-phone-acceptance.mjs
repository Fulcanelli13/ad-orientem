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
  const backButton=page.locator('[data-reader-nav="previous"]');
  box=await backButton.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(expected=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId===expected,initialCard);

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
    el.scrollTop=Math.max(0,absoluteCenter-el.clientHeight*.46);
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

  await page.locator('[data-cue-id="AO.SM.C0174"]').evaluate(el=>el.scrollIntoView({block:"end"}));
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getActiveCue()==="AO.SM.C0174");
  const elevationState=await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState());
  assert.equal(elevationState?.nativeCueId,"AO.SM.C0174");
  assert.equal(elevationState?.bell?.label,"ELEVATION BELL","Host elevation action cue lost its bell state");

  box=await nextButton.boundingBox();
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);
  await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId==="AO.CANON.07");
  assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getNativeEventState()?.bell??null),null,
    "Host bell transient leaked into Chalice Consecration card");

  const progress=await page.locator('[data-role="progress"]').textContent();
  assert.match(progress,/20 \/ 39/,"source-first LIVE card counter did not reach Chalice Consecration as 20 / 39");

  await context.close();
  console.log("phone browser acceptance: PASS — 390px Chromium touch, translation, Back/Next, cue focus, elevation gate and transient clearing.");
}finally{
  await browser?.close();
  await new Promise(resolveClose=>server.close(()=>resolveClose()));
}
