import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
const mime={
  ".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",
};
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const full=resolve(root,"."+path);
    if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
    const body=await readFile(full);
    res.writeHead(200,{"content-type":mime[extname(full)]??"application/octet-stream","cache-control":"no-store"});
    res.end(body);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4282,"127.0.0.1",resolve)});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const {width,height,lang} of [
    {width:320,height:740,lang:"en"},
    {width:390,height:844,lang:"en"},
    {width:768,height:1024,lang:"en"},
    {width:390,height:844,lang:"fr"},
  ]){
    const context=await browser.newContext({viewport:{width,height},isMobile:width<600,
      hasTouch:width<600,deviceScaleFactor:1,locale:lang==="fr"?"fr-FR":"en-GB"});
    const page=await context.newPage();
    const errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message??e)));
    await page.goto("http://127.0.0.1:4282/tests/fixtures/reader-phone-harness.html?aoLiveCards=65&lang="+lang,
      {waitUntil:"networkidle",timeout:45000});
    await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",null,{timeout:20000});
    const summary=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const root=document.querySelector("#ao-r17-native-reader-preview");
      const shell=root?.querySelector("[data-ao-reader-shell]");
      return {
        count:api.model.totalCards,owner:api.model.structureOwner,
        headings:api.model.cards.map(c=>c.title),
        canonical:api.sourceModel.totalCards,
        rootVisible:!!root && root.getBoundingClientRect().width>0,
        shellWidth:shell?.getBoundingClientRect().width??0,
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        navNext:!!root?.querySelector('[data-reader-nav="next"]'),
        navPrev:!!root?.querySelector('[data-reader-nav="previous"]'),
      };
    });
    assert.equal(summary.count,65,"Review query param did not activate curated 65");
    assert.equal(summary.canonical,39);
    assert.equal(summary.owner,"SOURCE_FIRST_LIVE_CURATED_65_REVIEW");
    assert.ok(summary.rootVisible && summary.navNext && summary.navPrev);
    assert.ok(summary.shellWidth<=width+1,"Phone viewport horizontal overflow");
    assert.equal(summary.overflow,false,"Curated Mass caused document horizontal scroll");
    assert.ok(summary.headings.includes("Gloria · The Celebrant's Intonation"));
    assert.ok(summary.headings.includes("Words of Consecration and Elevation · Host"));
    assert.ok(summary.headings.includes("Communion Antiphon"));
    const landmarks=[
      "Gloria · The Celebrant's Intonation",
      "Gloria · Praise and Supplication",
      "Credo · Incarnation, Passion and Resurrection",
      "Sanctus",
      "Benedictus",
      "Words of Consecration and Elevation · Host",
      "Words of Consecration and Elevation · Chalice",
      "Communion Antiphon",
      "Last Gospel · The Word Made Flesh",
    ];
    for(const title of landmarks){
      const state=await page.evaluate(t=>{
        const api=window.__AO_PHONE_PREVIEW;
        const card=api.model.cards.find(c=>c.title===t);
        if(!card)return {found:false};
        api.showSequence(card.sequence);
        const shell=document.querySelector("[data-ao-reader-shell]");
        return {
          found:true,current:api.getCurrentCard()?.sectionId,
          expected:card.sectionId,
          paragraphs:card.paragraphs.length,
          scrollWidth:shell?.scrollWidth,
          clientWidth:shell?.clientWidth,
          track:api.getScholaState()?.trackId??null,
        };
      },title);
      assert.equal(state.found,true,"Missing curated landmark "+title);
      assert.equal(state.current,state.expected,"Reader navigated to wrong curated card "+title);
      assert.ok(state.paragraphs>0,"Blank curated prayer card "+title);
      assert.ok(state.scrollWidth<=state.clientWidth+3,"Horizontal overflow at "+title);
      if(title==="Gloria · The Celebrant's Intonation")assert.equal(state.track,null);
      if(title==="Gloria · Praise and Supplication")assert.equal(state.track,"GLORIA");
      if(title==="Sanctus")assert.equal(state.track,"SANCTUS_BENEDICTUS");
      if(title==="Benedictus")assert.equal(state.track,"SANCTUS_BENEDICTUS");
    }
    const guide=page.locator('[data-role="guide-button"]');
    assert.equal(await guide.count(),1,"Curated card lacks native Guide control");
    const guides=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW;
      const card=api.model.cards.find(c=>c.title==="Credo · Incarnation, Passion and Resurrection");
      api.showSequence(card.sequence);
      const label=document.querySelector('[data-role="guide-button"]')?.textContent?.trim();
      return {label};
    });
    assert.ok(guides.label!=null,"Guide did not render");
    await page.screenshot({path:resolve(out,lang+"-"+width+"-credo.png"),fullPage:false});
    assert.deepEqual(errors,[],"Curated mobile browser JS errors");
    await context.close();
  }
  console.log("Curated 65 phone: PASS — 320/390/768px EN and 390px FR; 65 source-based LIVE cards, Schola, Guide and no horizontal overflow.");
}finally{
  await browser?.close();
  await new Promise(done=>server.close(()=>done()));
}
