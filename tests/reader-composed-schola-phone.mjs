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
    await page.locator("[data-schola-next]").click();
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.schola?.index===1);
    const after=await page.evaluate(()=>({
      section:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
      cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
      line:window.__AO_PHONE_PREVIEW.getScholaState().schola.latin
    }));
    assert.equal(after.section,before.section,"Manual choir phrase step changed priest card");
    assert.equal(after.cue,before.cue,"Manual choir phrase step changed priest cue");
    assert.match(after.line,/Christe eleison/);
    await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>c.title==="Gradual");
      if(!card)throw Error("Gradual card missing");
      api.showSequence(card.sequence);
    });
    await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.trackId==="GRADUAL");
    assert.ok(!await page.locator(".ao-schola-dock").getAttribute("data-composed").then(x=>x==="true"),
      "Fauré must not replace the appointed Gradual");
    assert.match((await page.evaluate(()=>window.__AO_PHONE_PREVIEW.getScholaState().schola.owner)),
      /R17_NATIVE/,"Gregorian source owner must survive on nonmapped track");
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
}finally{await browser?.close();if(server.listening)await new Promise(ok=>server.close(ok))}
