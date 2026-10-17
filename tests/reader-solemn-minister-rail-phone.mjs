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
  const found=await page.evaluate(section=>Boolean(window.__AO_PHONE_PREVIEW.showSection(section)),section);
  assert.ok(found,"Missing source section "+section);
  await page.locator(".ao-prayer-card").evaluate((el,cue)=>{
    const hit=el.querySelector('[data-cue-id="'+cue+'"]');
    if(!hit)throw new Error("Source cue missing from "+el.parentElement?.className+": "+cue);
    const a=el.getBoundingClientRect(),b=hit.getBoundingClientRect();
    el.scrollTop=Math.max(0,b.top-a.top+el.scrollTop+b.height/2-el.clientHeight*.39);
  },cue);
  await page.waitForFunction(cue=>window.__AO_PHONE_PREVIEW.getActiveCue()===cue,cue,{timeout:7000});
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
      assert.equal(await page.evaluate(()=>window.__AO_PHONE_PREVIEW.model.totalCards),48,
        "Solemn minister label changed LIVE cards");
      await focusCue(page,"AO.CARD.005","AO.SM.C0075");
      const current=await page.evaluate(()=>{
        const rail=document.querySelector('.ao-rail-right [data-channel="sacred-minister"]');
        const state=window.__AO_PHONE_PREVIEW.getNativeEventState();
        return {active:rail?.dataset.active,text:rail?.textContent,
          accessible:rail?.getAttribute("aria-label"),minister:state?.sacredMinister,
          stage:document.querySelector(".ao-reader-stage")?.dataset.rightRail,
          overflow:document.documentElement.scrollWidth-innerWidth};
      });
      if(form==="SOLEMN"){
        assert.equal(current.active,"true","Solemn subdeacon's Epistle rubric not visible");
        assert.match(current.text??"",/SUBDEACON.*EPISTLE/i);
        assert.match(current.accessible??"",/not independently observed/i);
        assert.equal(current.minister?.actor,"SUBDEACON");
        assert.equal(current.stage,"true","Source-owned minister rail was invisible");
      }else{
        assert.equal(current.active,"false","Cantata improperly invented a subdeacon");
        assert.equal(current.minister,null);
      }
      assert.ok(current.overflow<=1,"New rail overflows "+width+"px phone");
      await focusCue(page,"AO.CARD.010","AO.SM.C0112");
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
  console.log("PASS 360/390px: source-owned Solemn minister rubric is visibly distinct from priest, never claimed observed, absent in Cantata and at held Offertory C0112; LIVE 48 intact.");
}finally{
  await browser?.close().catch(()=>{});
  await new Promise(resolve=>server.close(resolve));
}
