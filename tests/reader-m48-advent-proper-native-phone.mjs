// M48: real native 65-card reader with the actual 1962 Advent I/II
// appointed Proper. No synthetic Gregorian melody assignment or remote GABC.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,".tmp/m48-advent-proper");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+name);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const cases=[
 {id:"advent1",date:"2026-11-29",scores:{INTROIT:["GREGOBASE-132"],
  GRADUAL:["GREGOBASE-1169","GREGOBASE-1115"],
  OFFERTORY:[],COMMUNION:["GREGOBASE-1036"]}},
 {id:"advent2",date:"2026-12-06",scores:{INTROIT:["GREGOBASE-356"],
  GRADUAL:["GREGOBASE-1268","GREGOBASE-292"],
  OFFERTORY:[],COMMUNION:["GREGOBASE-966"]}}
];
let browser;
try{
 browser=await chromium.launch({headless:true});
 await mkdir(out,{recursive:true});
 const base="http://127.0.0.1:"+server.address().port;
 for(const fixture of cases)for(const [width,mode,lang] of [
  [320,"live","en"],[390,"live","en"],[390,"missal","en"],
  [390,"live","fr"],[390,"missal","fr"]
 ]){
  const context=await browser.newContext({viewport:{width,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try{
   const page=await context.newPage();const errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message??e)));
   const query=new URLSearchParams({production:"1",print:"1",notation:"1",
    scoreProper:fixture.id,date:fixture.date,form:"MISSA_CANTATA_INCENSE",mode,lang});
   await page.goto(base+"/tests/fixtures/reader-phone-harness.html?"+query.toString(),
    {waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>["true","error"].includes(
    document.documentElement.dataset.harnessReady),null,{timeout:45000});
   const state=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    return api?{ok:true,cardCount:api.model.totalCards,
      sourceCount:api.sourceModel.totalCards,form:api.model.resolvedMass?.form??null,
      modelTitles:api.model.cards.slice(0,18).map(c=>c.title)}:
     {ok:false,error:window.__AO_PHONE_HARNESS_ERROR??"NO_READER"};
   });
   assert.equal(state.ok,true,JSON.stringify(state));
   assert.equal(state.sourceCount,30);
   assert.ok(state.cardCount>=60,"Advent must preserve source-owned reader");

   const show=async id=>page.evaluate(paragraphId=>{
    const api=window.__AO_PHONE_PREVIEW;
    const card=api.model.cards.find(c=>c.paragraphs?.some(p=>p.id===paragraphId))||
      api.model.cards.find(c=>JSON.stringify(c).includes('"' + paragraphId + '"'));
    if(!card)throw Error("M48 missing actual Mass paragraph "+paragraphId);
    api.showSequence(card.sequence);
    return {title:card.title,sequence:card.sequence};
   },id);
   let actual=[];
   for(const [role,paragraphId] of [
    ["INTROIT","INTROIT.1"],["GRADUAL","GRADUAL.1"],
    ["OFFERTORY","OFFERTORY.1"],["COMMUNION","COMMUNION.1"]
   ]){
    await show(paragraphId);
    const passage=page.locator('[data-paragraph-id="'+paragraphId+'"]');
    await passage.waitFor({state:"visible",timeout:20000});
    assert.ok((await passage.locator(".ao-line-primary").textContent())?.length>10,
      "Original source Latin lost "+role);
    const expected=fixture.scores[role];
    for(const score of expected){
     await page.waitForFunction(id=>!!document.querySelector(
       '[data-reference-score="'+id+'"][data-reference-ready="true"] svg'),
      score,{timeout:35000});
     const element=passage.locator('[data-reference-score="'+score+'"]');
     assert.equal(await element.count(),1,role+" original score not on its own source paragraph");
     assert.equal(await element.getAttribute("data-approved"),"false");
     assert.match(await element.locator(".ao-proper-reference-label").textContent(),
       /1961 review pending/i);
     // Proper source links are intentionally exposed in the enlarged
     // notation dialog, not inline in the prayer paragraph.
     actual.push(score);
    }
    if(role==="OFFERTORY")
     assert.equal(await passage.locator("[data-reference-score]").count(),0,
      "Textually divergent Offertory source must be withheld");
    const geometry=await passage.evaluate(el=>({
     viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
     staffWidths:[...el.querySelectorAll(".ao-proper-reference-staff")].map(n=>
       n.getBoundingClientRect().width)
    }));
    assert.ok(geometry.documentWidth<=width+1,
     "Rendered score overflow at "+width+"px "+JSON.stringify(geometry));
    assert.ok(geometry.staffWidths.every(w=>w>90&&w<=width));
    if(role==="GRADUAL"){
     await page.screenshot({path:resolve(out,fixture.id+"-"+mode+"-"+lang+"-"+width+"-gradual-alleluia.png"),animations:"disabled"});
     await passage.locator(".ao-proper-reference-expand").first().click();
     const zoom=page.locator("dialog.ao-proper-reference-zoom");
     await zoom.waitFor({state:"visible",timeout:20000});
     assert.equal(await zoom.getAttribute("data-reference-zoom-mode"),"fit");
     assert.ok(await zoom.locator(".ao-proper-reference-wide svg").count()>=1);
     assert.equal(await zoom.locator('[data-reference-zoom-transcription]').getAttribute("href"),
       "https://gregobase.selapa.net/chant.php?id="+
         fixture.scores.GRADUAL[0].slice("GREGOBASE-".length),
       "The rendered Gradual must provide its exact archived transcription source");
     assert.match(await zoom.locator(".ao-proper-reference-provenance").textContent(),
       /not musically certified/i);
     await zoom.locator('button[aria-label="Close enlarged Gregorian notation"]').click();
    }
   }
   assert.equal(actual.length,4);
   assert.deepEqual(actual,[
    ...fixture.scores.INTROIT,...fixture.scores.GRADUAL,...fixture.scores.COMMUNION]);
   assert.deepEqual(errors,[],"Reader JS errors "+JSON.stringify(errors));
   console.log("M48_ADVENT_NATIVE_PHONE_PASS "+JSON.stringify({
    width,mode,lang,source:fixture.id,scores:actual,heldOffertory:true,
    cardCount:state.cardCount}));
   await context.close();
  }catch(error){await context.close();throw error;}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
