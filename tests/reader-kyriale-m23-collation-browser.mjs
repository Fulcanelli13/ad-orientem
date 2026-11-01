// M23: real Chromium acceptance for the isolated 1961 Kyriale collation workbench.
// External printed scans are explicitly mocked to avoid network-dependent CI;
// this does not validate external scan reachability or note accuracy.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/mass-m23-kyriale-collation");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+pathname);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(path));
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const url="http://127.0.0.1:"+server.address().port+"/tools/mass/kyriale-1961-collation.html";
const smallPng=Buffer.from(
 "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=","base64");
const sourceRe=/^https:\/\/gregobase\.selapa\.net\/sources\/2\/\d+\.png(?:\?.*)?$/;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const test of [{width:1280,height:900},{width:390,height:844}]){
  const ctx=await browser.newContext({viewport:{width:test.width,height:test.height},
   acceptDownloads:true,serviceWorkers:"block",deviceScaleFactor:1,
   isMobile:test.width<500,hasTouch:test.width<500});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(e.message));
   let mockedPrintCount=0;
   await page.route(sourceRe,route=>{mockedPrintCount++;return route.fulfill({
    status:200,contentType:"image/png",body:smallPng})});
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>document.querySelector("#scoreSelect")?.options.length===7,null,{timeout:35000});
   assert.equal(await page.locator("#scoreSelect option").count(),7);
   assert.equal(await page.locator("#pageSelect option").count(),1);
   await page.locator("#engraveViewport svg").waitFor({timeout:55000});
   assert.match(await page.locator("#engraveStatus").innerText(),/Offline SVG/);
   assert.ok(await page.locator("#engraveViewport svg").evaluate(svg=>
    svg.getBoundingClientRect().height>0&&svg.querySelectorAll("*").length>2),
    "Actual Exsurge SVG must have nonempty visible staff/neume output");
   assert.ok(mockedPrintCount>0,"Page must request original source image URL");
   assert.match(await page.locator("#printImage").getAttribute("src"),/\/931\.png$/);
   assert.deepEqual(errors,[],"No workbench page or rendering errors");

   // Exercise all seven source-preserved GABCs through the ACTUAL browser
   // renderer, not merely the independent VM/parser tests.
   for(const [index,sourceId] of [[0,545],[1,2982],[2,1184],[3,961],[4,749],[5,1384],[6,2760]]){
    await page.locator("#scoreSelect").selectOption(String(index));
    await page.waitForFunction(id=>{
     const label=document.querySelector("#scoreReference")?.textContent??"";
     const status=document.querySelector("#engraveStatus")?.textContent??"";
     const svg=document.querySelector("#engraveViewport svg");
     return label.includes("#"+id)&&status.includes("Offline SVG")&&
      svg?.querySelectorAll("*").length>2&&svg.getBoundingClientRect().height>0;
    },sourceId,{timeout:55000});
   }
   // All seven must have source-only note group controls, with original Agnus staff mapping.
   for(const [index,expected] of [[0,27],[1,27],[2,28],[3,196],[4,366],[5,55],[6,54]]){
    await page.locator("#scoreSelect").selectOption(String(index));
    await page.locator("#agnusNotePanel").waitFor({state:"visible"});
    assert.equal(await page.locator("#agnusGroupSelect option").count(),expected);
    assert.equal(await page.locator("#agnusPitch").inputValue(),"UNREVIEWED");
   }
   // Kyrie VIII has one source-bearing melismatic continuation, not an extra syllable.
   await page.locator("#scoreSelect").selectOption("2");
   await page.locator("#agnusGroupSelect").selectOption("3");
   assert.match(await page.locator("#agnusGroupDescription").innerText(),/melisma without new syllable/);
   // 54 individual sung source-note groups, across four original printed systems.
   // Synthetic reviews in this E2E are tests ONLY, not real editorial decisions.
   await page.locator("#scoreSelect").selectOption("6");
   await page.locator("#agnusNotePanel").waitFor({state:"visible",timeout:30000});
   assert.equal(await page.locator("#agnusGroupSelect option").count(),54);
   assert.match(await page.locator("#agnusGroupTitle").innerText(),/Invocation 1.*staff system 1/);
   assert.match(await page.locator("#agnusGroupSource").innerText(),/A\(fggf\)/);
   for(const [index,expected] of [
    ["13","staff system 1"],["14","staff system 2"],
    ["18","Invocation 2"],["28","staff system 3"],
    ["36","Invocation 3"],["42","staff system 4"]
   ]){
    await page.locator("#agnusGroupSelect").selectOption(index);
    assert.ok((await page.locator("#agnusGroupTitle").innerText()).includes(expected),
     "Original printed system or invocation was misplaced: "+index);
   }
   await page.locator("#agnusGroupSelect").selectOption("0");
   assert.equal(await page.locator("#agnusPitch").inputValue(),"UNREVIEWED");
   assert.equal(await page.locator("#agnusNeume").inputValue(),"UNREVIEWED");
   await page.locator("#agnusPitch").selectOption("MATCH");
   await page.locator("#agnusNeume").selectOption("DIFFERENCE");
   await page.locator("#agnusUnderlay").selectOption("UNCERTAIN");
   await page.locator("#agnusGroupComment").fill(
    "SYNTHETIC TEST ONLY: original staff 1, A(fggf). Not evidence of a real discrepancy.");
   await page.locator("#agnusGroupSave").click();
   await page.locator("#agnusNext").click();
   await page.locator("#agnusPrev").click();
   assert.equal(await page.locator("#agnusPitch").inputValue(),"MATCH");
   assert.equal(await page.locator("#agnusNeume").inputValue(),"DIFFERENCE");
   assert.match(await page.locator("#agnusGroupComment").inputValue(),/SYNTHETIC TEST ONLY/);
   for(const key of ["pitch","neume","underlay","rhythm"])
    await page.locator("#"+key).selectOption("MATCH");
   await page.locator("#save").click();
   assert.match(await page.locator("#progress").innerText(),/0 of 7/,
    "Page-level Agnus MATCH must never imply 54 individual groups certified");
   assert.match(await page.locator("#agnusGroupProgress").innerText(),/0\/54/);

   await page.locator("#scoreSelect").selectOption("0");
   await page.waitForFunction(()=>document.querySelector("#engraveStatus")
    ?.textContent?.includes("Offline SVG"),null,{timeout:55000});


   // A full one-page review is still NOT an editorial/publication approval.
   for(const key of ["pitch","neume","underlay","rhythm"])
    await page.locator("#"+key).selectOption("MATCH");
   await page.locator("#reviewNotes").fill("Reviewed original printed folio 54*; independent reviewer must still approve.");
   await page.locator("#save").click();
   assert.match(await page.locator("#progress").innerText(),/0 of 7/,
    "Page review alone never completes a score without every source note group");
   const local=await page.evaluate(()=>JSON.parse(
    localStorage.getItem("ao-m22-kyriale-print-collation-local-v1")||"{}"));
   assert.equal(local["545:54*"]?.pitch,"MATCH");
   assert.equal(local["545:54*"]?.notes.includes("54*"),true);

   await page.locator("#scoreSelect").selectOption("4");
   await page.locator("#engraveViewport svg").waitFor({timeout:55000});
   await page.waitForFunction(()=>document.querySelector("#scoreReference")
     ?.textContent?.includes("Credo III"),null,{timeout:35000});
   assert.equal(await page.locator("#pageSelect option").count(),3);
   assert.match(await page.locator("#printImage").getAttribute("src"),/\/941\.png$/);
   await page.locator("#next").click();
   assert.equal(await page.locator("#pageSelect").inputValue(),"1");
   assert.match(await page.locator("#printImage").getAttribute("src"),/\/942\.png$/);
   await page.locator("#neume").selectOption("DIFFERENCE");
   await page.locator("#reviewNotes").fill("Example discrepancy on printed 65*; needs documented correction before publication.");
   await page.locator("#next").click();
   assert.equal(await page.locator("#pageSelect").inputValue(),"2");
   await page.locator("#previous").click();
   assert.equal(await page.locator("#neume").inputValue(),"DIFFERENCE");
   assert.match(await page.locator("#reviewNotes").inputValue(),/Example discrepancy/);
   await page.locator("#scoreSelect").selectOption("0");
   assert.equal(await page.locator("#pitch").inputValue(),"MATCH");
   await page.reload({waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForFunction(()=>document.querySelector("#scoreSelect")?.options.length===7,null,{timeout:35000});
   assert.equal(await page.locator("#pitch").inputValue(),"MATCH",
    "Page-specific review must survive a browser reload");

   const [download]=await Promise.all([
    page.waitForEvent("download",{timeout:25000}),
    page.locator("#export").click()
   ]);
   assert.equal(download.suggestedFilename(),"ao-kyriale-1961-collation-review.json");
   const exportFile=await download.path();
   const exported=JSON.parse(await readFile(exportFile,"utf8"));
   assert.equal(exported.schema,"ao-m22-kyriale-musical-collation-evidence-v1");
   assert.equal(exported.scores.length,7);
   assert.equal(exported.scoreCount,7);
   assert.equal(exported.editorialApproval,false);
   assert.equal(exported.allowAutomaticPublication,false);
   assert.equal(exported.publicScoreCount,0);
   assert.equal(exported.scores[0].allPageCategoriesMarkedMatching,true);
   assert.equal(exported.scores[0].allSourceGroupsMarkedMatching,false);
   assert.equal(exported.scores[0].sourceNoteGroupCount,27);
   assert.equal(exported.scores[0].fullyMarkedMatching,false);
   assert.deepEqual(exported.scores.map(x=>x.sourceNoteGroupCount),[27,27,28,196,366,55,54]);
   assert.equal(exported.scores.reduce((n,s)=>n+s.sourceNoteGroupCount,0),753);
   assert.equal(exported.scores[0].publicScore,false);
   assert.equal(exported.scores[4].allPageCategoriesMarkedMatching,false);
   assert.equal(exported.scores[4].pages[1].neume,"DIFFERENCE");
   assert.equal(exported.scores[4].pages[1].editorialApproval,undefined);
   const agnusEvidence=exported.scores.find(s=>s.gregobaseId===2760);
   assert.equal(agnusEvidence.allPageCategoriesMarkedMatching,true,
    "The folio-level review was marked matching in this synthetic browser test");
   assert.equal(agnusEvidence.allSourceGroupsMarkedMatching,false,
    "All 54 note groups must be independently marked MATCH, not inferred from page fields");
   assert.equal(agnusEvidence.fullyMarkedMatching,false,
    "Folio-level MATCH cannot count as full musical parity");
   assert.equal(agnusEvidence.pages[0].groupReviews?.[1]?.pitch,"MATCH");
   assert.equal(agnusEvidence.pages[0].groupReviews?.[1]?.neume,"DIFFERENCE");
   assert.equal(agnusEvidence.pages[0].groupReviews?.[1]?.underlay,"UNCERTAIN");
   assert.equal(agnusEvidence.pages[0].groupReviews?.[1]?.rhythm,"UNREVIEWED");
   assert.match(agnusEvidence.pages[0].groupReviews?.[1]?.comment,/SYNTHETIC TEST ONLY/);
   assert.equal(agnusEvidence.editorialApproval,false);
   assert.equal(agnusEvidence.publicScore,false);

   assert.ok(exported.scores.every(s=>s.publicScore===false&&s.editorialApproval===false));
   await page.screenshot({path:out+"/"+test.width+"-source-collation.png",animations:"disabled"});
   assert.deepEqual(errors,[],"Review navigation/export must have no runtime errors");
   console.log("PASS M23 real Chromium offline Exsurge + mock printed-image route, "
    +test.width+"px page navigation, local review persistence, four decisions and blocked JSON export");
  }finally{await ctx.close()}
 }
 // Deliberately drop an external source request. Source errors must be visible
 // and must never invent a facsimile success or contaminate the offline SVG.
 const ctx=await browser.newContext({viewport:{width:390,height:844},serviceWorkers:"block"});
 try{
  const page=await ctx.newPage();
  await page.route(sourceRe,route=>route.abort());
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
  await page.locator("#engraveViewport svg").waitFor({timeout:55000});
  await page.locator("#printLoadStatus:visible").waitFor({timeout:10000});
  assert.match(await page.locator("#printLoadStatus").innerText(),/unavailable/i);
  assert.match(await page.locator("#sourcePdf").getAttribute("href"),/kyriale-solesmes\.pdf/);
  console.log("PASS M23 unavailable remote print is visible while original link and offline neumes survive");
 }finally{await ctx.close()}
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
