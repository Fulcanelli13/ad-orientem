// Off-production 28-source Gregorian research-board browser acceptance.
// No public reader or approved-score selector is modified by this fixture.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {build28ResearchReviewCsv} from "../scripts/mass/export-28-participation-research-review.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
assert.equal(build28ResearchReviewCsv().trim().split("\n").length,29);
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  const type={".js":"text/javascript",".mjs":"text/javascript",".html":"text/html",
   ".json":"application/json",".css":"text/css"}[extname(path)]??"application/octet-stream";
  res.writeHead(200,{"content-type":type,"cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const base="http://127.0.0.1:"+server.address().port;
 for(const width of [320,390,1180]){
  const page=await browser.newPage({viewport:{width,height:width===1180?900:844},
   serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  await page.goto(base+"/tests/fixtures/reader-participation-28-source-review.html",
   {waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>Boolean(window.__AO_PARTICIPATION_28_REVIEW),
   null,{timeout:30000});
  const overview=await page.evaluate(async()=>{
   await window.__AO_PARTICIPATION_28_REVIEW.ready;
   const state=window.__AO_PARTICIPATION_28_REVIEW.getState();
   const cards=[...document.querySelectorAll(".score")];
   const scanLinks=[...document.querySelectorAll('a[data-printed-plate="true"]')];
   const groups=[...document.querySelectorAll(".group")];
   return {state,ready:document.documentElement.dataset.review28Ready,
    cards:cards.length,svgs:cards.filter(x=>x.querySelector(".staff svg")).length,
    researchOnly:cards.every(x=>x.dataset.approved==="false"),
    base:cards.filter(x=>x.dataset.catalogue==="FIXED_24_BASELINE").length,
    appendix:cards.filter(x=>x.dataset.catalogue==="SOLEMNIOR_FOUR_SOURCE_ONLY").length,
    allPitchedStaffsFit:cards.every(x=>x.querySelector(".staff")?.scrollWidth<=
      x.querySelector(".staff")?.clientWidth+3),
    missingPrintedCards:cards.filter(x=>!x.querySelector('a[data-printed-plate="true"]'))
      .map(x=>x.dataset.scoreId),
    printedLinks:scanLinks.length,uniquePrintedPages:new Set(scanLinks.map(x=>x.href)).size,
    sourceLinks:cards.filter(x=>x.querySelector('a[data-source-record="true"]')).length,
    groups:groups.length,
    editorialStatus:cards.every(x=>x.querySelector(".status")?.textContent.includes("DO NOT PUBLISH")),
    pageWidth:document.documentElement.scrollWidth,viewportWidth:innerWidth};
  });
  assert.deepEqual(errors,[],"Browser review must have no errors: "+errors.join(" | "));
  assert.equal(overview.ready,"true");
  assert.equal(overview.state.total,28);
  assert.equal(overview.state.baseline,24);
  assert.equal(overview.state.appendix,4);
  assert.equal(overview.state.events,15);
  assert.equal(overview.state.sources,12);
  assert.equal(overview.state.printedPages,14);
  assert.equal(overview.state.newPublicApprovals,0);
  assert.equal(overview.state.passed,28);
  assert.equal(overview.state.failed,0);
  assert.equal(overview.cards,28);
  assert.equal(overview.svgs,28);
  assert.equal(overview.base,24);
  assert.equal(overview.appendix,4);
  assert.equal(overview.sourceLinks,28);
  assert.equal(overview.printedLinks,44);
  assert.equal(overview.uniquePrintedPages,14);
  assert.equal(overview.groups,15);
  assert.equal(overview.researchOnly,true);
  assert.equal(overview.allPitchedStaffsFit,true);
  assert.equal(overview.editorialStatus,true);
  assert.deepEqual(overview.missingPrintedCards,[]);
  assert.ok(overview.pageWidth<=overview.viewportWidth+1,
   "No phone horizontal overflow: "+JSON.stringify(overview));
  const selected=await page.evaluate(()=>{
   const api=window.__AO_PARTICIPATION_28_REVIEW;
   const filter=id=>{
    api.choose(id);
    const visible=[...document.querySelectorAll(".group")].filter(x=>!x.hidden);
    return {groups:visible.length,rows:visible.flatMap(x=>[...x.querySelectorAll(".score")]).length,
      appendix:visible.flatMap(x=>[...x.querySelectorAll(".score")])
       .filter(x=>x.dataset.catalogue==="SOLEMNIOR_FOUR_SOURCE_ONLY").length};
   };
   const a=filter("PREFACE_GREETING");
   const b=filter("SECRET_CONCLUSION");
   const c=filter("DISMISSAL_EXCHANGE");
   const d=filter("ALL");
   return {a,b,c,d};
  });
  assert.deepEqual(selected,{
   a:{groups:1,rows:3,appendix:1},
   b:{groups:1,rows:3,appendix:1},
   c:{groups:1,rows:4,appendix:0},
   d:{groups:15,rows:28,appendix:4}
  });
  await mkdir(resolve(root,".tmp/mass-participation-28-review"),{recursive:true});
  await page.evaluate(()=>window.__AO_PARTICIPATION_28_REVIEW.choose("PREFACE_GREETING"));
  await page.screenshot({path:resolve(root,
   ".tmp/mass-participation-28-review/preface-three-tones-"+width+".png"),fullPage:true});
  if(width===1180){
   await page.evaluate(()=>window.__AO_PARTICIPATION_28_REVIEW.choose("ALL"));
   await page.screenshot({path:resolve(root,
    ".tmp/mass-participation-28-review/all-28-research-desktop.png"),fullPage:true});
  }
  console.log("PASS 28 Gregorian research board",JSON.stringify({
   width,svgs:overview.svgs,sources:overview.state.sources,
   scannedPages:overview.uniquePrintedPages,allUnapproved:overview.researchOnly
  }));
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
