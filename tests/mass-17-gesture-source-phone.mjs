import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

// Verify source paragraph geometry on real native phone, not inferred from
// the matrix's raw labels. No new image binding, timing, posture or source
// event is created by this acceptance test.
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/mass-17-gesture-source-paragraphs");
await mkdir(out,{recursive:true});
const dispositions=JSON.parse(await readFile(resolve(root,
  "data/mass/gesture-icon-disposition-20261029.v1.json"),"utf8"));
const matrix=JSON.parse(await readFile(resolve(root,
  "data/mass/gesture-matrix.v1.json"),"utf8"));
const byId=new Map(matrix.items.map(x=>[x.id,x]));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
  const data=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4491,"127.0.0.1",ok);});
let browser;
const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const spec of [
  {width:320,language:"en",mode:"LIVE",form:"MISSA_CANTATA_SIMPLE"},
  {width:390,language:"fr",mode:"MISSAL",form:"SOLEMN"},
 ]){
  const context=await browser.newContext({viewport:{width:spec.width,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2,
   locale:spec.language==="fr"?"fr-FR":"en-GB"});
  try{
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message??e)));
   const params=new URLSearchParams({aoLiveCards:"65",mode:spec.mode,form:spec.form,
    lang:spec.language,secondConfiteor:"1"});
   await page.goto("http://127.0.0.1:4491/tests/fixtures/reader-phone-harness.html?"+params,
    {waitUntil:"networkidle",timeout:45000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
    null,{timeout:25000});
   for(const item of dispositions.items){
    const cue=byId.get(item.id)?.cueId;
    assert.ok(cue,"Matrix identity missing: "+item.id);
    const reading=await page.evaluate(async cueId=>{
     const api=window.__AO_PHONE_PREVIEW;
     const sourceMatches=api.model.cards.flatMap(c=>c.paragraphs?.filter(p=>
      (p.sourceCueIds??[]).includes(cueId)).map(p=>({card:c,paragraph:p}))??[]);
     if(sourceMatches.length===0)return {error:"Original 65-card source paragraph absent"};
     const selected=sourceMatches[0];
     if(!api.showSequence(selected.card.sequence))return {error:"Could not navigate to source-owned card"};
     await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
     const scroll=document.querySelector("#ao-r17-native-reader-preview .ao-prayer-card");
     const row=[...scroll.querySelectorAll(".ao-reader-paragraph")]
       .find(el=>el.dataset.paragraphId===selected.paragraph.id);
     if(!row)return {error:"Canonical source paragraph not in actual DOM"};
     row.scrollIntoView({block:"center",inline:"nearest"});
     await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
     const style=getComputedStyle(row),bounds=row.getBoundingClientRect();
     const primary=row.querySelector(".ao-line-primary");
     return {
      id:selected.paragraph.id,kind:row.dataset.kind,card:selected.card.title,
      sourceIds:row.dataset.sourceCueIds??"",
      primaryText:primary?.textContent?.trim()??"",
      visible:style.display!=="none"&&style.visibility!=="hidden"&&bounds.height>0&&bounds.width>10,
      rect:{left:bounds.left,right:bounds.right,top:bounds.top,bottom:bounds.bottom},
      horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
      mode:document.querySelector("[data-ao-reader-shell]")?.dataset.mode,
      totalCards:api.model.totalCards,
      iconlessRubricCount:row.querySelectorAll("[data-source-gesture-id],.ao-iconless-source-rubric").length
     };
    },cue);
    results.push({...spec,id:item.id,cue,actor:item.actor,disposition:item.disposition,...reading});
    assert.equal(reading.error,undefined,
     item.id+" "+spec.mode+": "+JSON.stringify(reading));
    assert.equal(reading.mode,spec.mode,"Wrong mounted reader mode");
    assert.ok(reading.sourceIds.split(/\s+/).includes(cue),
     item.id+" visible row moved off source paragraph");
    assert.ok(reading.primaryText.length>1,item.id+" source text disappeared");
    assert.equal(reading.visible,true,item.id+" original paragraph hidden");
    assert.equal(reading.horizontalOverflow,false,item.id+" phone horizontal overflow");
    assert.ok(reading.rect.left>=-1&&reading.rect.right<=spec.width+1,
     item.id+" source row clipped horizontally");
    if(item.actor==="PRIEST"||["GM.F.C0096.01","GM.F.C0235.01","GM.F.C0242.01"].includes(item.id)){
     const name=spec.mode.toLowerCase()+"-"+spec.language+"-"+item.id+".png";
     await page.screenshot({path:resolve(out,name)});
    }
    assert.deepEqual(errors,[],"Browser runtime errors");
   }
  }finally{await context.close()}
 }
 await writeFile(resolve(out,"source-paragraph-report.json"),JSON.stringify({
  status:"SOURCE_PARAGRAPH_GEOMETRY_VERIFIED_NO_ART_APPROVAL",count:results.length,rows:results
 },null,2));
 console.log("PASS "+results.length+" exact 17-cue source-paragraph placements across LIVE EN 320px and MISSAL FR 390px; profile-dependent faithful guidance remains source-owned.");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
