import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
  ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
  ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const full=resolve(root,"."+path);
    if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(full);
    res.writeHead(200,{"content-type":mime[extname(full)]??"application/octet-stream",
      "cache-control":"no-store"});res.end(bytes);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(4297,"127.0.0.1",ok);});
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const {width,language,optional=false} of [
    {width:320,language:"en"},{width:390,language:"en"},
    {width:768,language:"en"},{width:390,language:"fr"},
    {width:390,language:"en",optional:true},
  ]){
    const context=await browser.newContext({viewport:{width,height:844},isMobile:width<600,
      hasTouch:width<600,deviceScaleFactor:1,locale:language==="fr"?"fr-FR":"en-GB"});
    const page=await context.newPage(),errors=[];
    page.on("pageerror",e=>errors.push(String(e?.message??e)));
    const query="production=1&sequence=1&lang="+language+(optional?"&secondConfiteor=1":"");
    await page.goto("http://127.0.0.1:4297/tests/fixtures/reader-phone-harness.html?"+query,
      {waitUntil:"networkidle",timeout:60000});
    await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
      null,{timeout:30000});
    const result=await page.evaluate(()=>{
      if(document.documentElement.dataset.harnessReady==="error"){
        return {error:window.__AO_PHONE_HARNESS_ERROR??"Unknown harness error"};
      }
      const api=window.__AO_PHONE_PREVIEW;
      const cards=api.model.cards.filter(card=>card.sourceSectionId==="AO.CARD.006");
      const first=cards[0],second=cards[1];
      if(!first||!second)return {error:"Expected two pre-Gospel cards"};
      api.showSequence(first.sequence);
      const before=api.getCurrentCard()?.title;
      const next=document.querySelector('[data-reader-nav="next"]');
      if(!next)return {error:"No real reader next control"};
      next.click(); // Navigate through the actual button, not a model-only operation.
      const after=api.getCurrentCard()?.title;
      const shell=document.querySelector("#ao-r17-native-reader-preview");
      const renderedTitle=shell?.querySelector('[data-role="section-title"]')?.textContent?.trim();
      const sections=[...shell?.querySelectorAll?.('[data-reader-section]')??[]].map(n=>n.textContent?.trim());
      return {
        model:api.model.totalCards,
        visible:shell?.querySelector('[data-role="progress"]')?.textContent?.trim(),
        cards:cards.map(c=>({
          title:c.title,ids:c.paragraphs.map(p=>p.id),
          blocks:c.blocks.filter(b=>b.paragraphCount>0).map(b=>b.blockId)
        })),
        before,after,renderedTitle,sections,
        sourceParagraphs:api.sourceModel.cards.find(c=>c.sectionId==="AO.CARD.006")?.paragraphs.length,
        translationVisible:shell?.textContent?.includes(new URL(location.href).searchParams.get("lang")==="fr"
          ?"Loue, Sion, ton Sauveur":"Praise, O Sion, thy Saviour"),
        overflow:document.documentElement.scrollWidth>innerWidth+1,
        rootWidth:shell?.getBoundingClientRect()?.width??0,
        language:document.documentElement.lang,
      };
    });
    assert.equal(result.error,undefined,JSON.stringify(result));
    assert.equal(result.model,66,"Separate source Sequence must add one, not duplicate all Proper stages");
    assert.deepEqual(result.cards.map(x=>x.blocks),[["AO.SM.B021"],["AO.SM.B022"]]);
    assert.equal(result.sourceParagraphs,result.cards.reduce((sum,x)=>sum+x.ids.length,0));
    assert.equal(result.before,"Gradual · Alleluia / Tract");
    assert.equal(result.after,"Sequence","Native phone Next must navigate to the independently sourced Sequence");
    assert.equal(result.renderedTitle,"Sequence");
    assert.equal(result.translationVisible,true,JSON.stringify(result));
    assert.match(result.visible,new RegExp("\\/ "+(optional?66:65)+"$"),
      "Progress must use the actual visible, not abstract model, denominator");
    assert.equal(result.overflow,false,"Reader introduced horizontal phone overflow");
    assert.ok(result.rootWidth<=width+1);
    assert.deepEqual(errors,[],"JavaScript errors during actual conditional Sequence navigation");
    await page.screenshot({path:resolve(out,"conditional-sequence-"+width+"-"+language+(optional?"-confiteor":"")+".png"),animations:"disabled"});
    console.log("PASS conditional Sequence production phone "+width+"px "+language+
      (optional?" optional Confiteor":"")+": 66 model / "+(optional?66:65)+" visible, real navigation and bilingual source");
    await context.close();
  }
}finally{
  await browser?.close().catch(()=>{});
  await new Promise(ok=>server.close(ok));
}
