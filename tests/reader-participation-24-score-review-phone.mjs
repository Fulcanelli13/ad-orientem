// Browser acceptance of EVERY archived Gregorian participation excerpt.
// This is an off-production editorial fixture. No publication decisions.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildParticipationScoreReviewCsv} from "../scripts/mass/export-24-participation-review-csv.mjs";
import {PARTICIPATION_REFERENCE_SCORES} from "../src/mass/reader-participation-reference-scores.js";
import {buildParticipationCoverage} from "../src/mass/reader-participation-coverage.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const csv=buildParticipationScoreReviewCsv();
assert.equal(csv.trim().split("\n").length,25,"CSV header and 24 separate exact scores required");
assert.ok(csv.includes('"GLORIA_INTONATION"')&&csv.includes('"DISMISSAL_EXCHANGE"'));
assert.ok(csv.includes('"DO_NOT_PUBLISH"'),"Explicitly refuse promotion");
assert.ok(PARTICIPATION_REFERENCE_SCORES.every(x=>x.publicScoreApproved===false));
const events=buildParticipationCoverage().events.filter(e=>e.fixedResearchIds.length);
assert.equal(events.length,15);
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
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
  await page.goto(base+"/tests/fixtures/reader-participation-score-review.html",
   {waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>Boolean(window.__AO_PARTICIPATION_SCORE_REVIEW),
   null,{timeout:30000});
  const overview=await page.evaluate(async()=>{
   await window.__AO_PARTICIPATION_SCORE_REVIEW.ready;
   const state=window.__AO_PARTICIPATION_SCORE_REVIEW.getState();
   const scoreCards=[...document.querySelectorAll(".score")];
   return {state,loaded:document.documentElement.dataset.reviewReady,
    cards:scoreCards.length,svgs:scoreCards.filter(c=>c.querySelector(".staff svg")).length,
    links:scoreCards.filter(c=>c.querySelector('a[href^="https://gregobase.selapa.net/chant.php?id="]')).length,
    plateLinks:scoreCards.reduce((n,c)=>n+c.querySelectorAll('a[data-printed-plate="true"]').length,0),
    missingPlateLinks:scoreCards.filter(c=>!c.querySelector('a[data-printed-plate="true"]')).map(c=>c.dataset.scoreId),
    plateIds:[...new Set([...document.querySelectorAll('a[data-printed-plate="true"]')]
       .map(a=>a.href))],
    prefaceLocations:scoreCards.filter(c=>c.dataset.prefacePassage==="located").length,
    exactPrefacePages:scoreCards.filter(c=>c.dataset.prefacePassage==="located"&&
       c.querySelectorAll('a[data-printed-plate="true"]').length===2).length,
    allUnapproved:scoreCards.every(c=>c.dataset.approved==="false"),
    eventGroups:document.querySelectorAll(".event").length,
    badWidth:scoreCards.filter(c=>c.querySelector(".staff")?.scrollWidth>
      c.querySelector(".staff")?.clientWidth+3).map(c=>c.dataset.scoreId),
    documentWidth:document.documentElement.scrollWidth,viewportWidth:window.innerWidth,
    editorialStatus:scoreCards.every(c=>c.querySelector(".status")?.textContent.includes("awaiting independent"))
   };
  });
  assert.deepEqual(errors,[],"Review fixture must not throw: "+errors.join(" | "));
  assert.equal(overview.loaded,"true");
  assert.equal(overview.state.total,24);
  assert.equal(overview.state.events,15);
  assert.equal(overview.state.passed,24,"Every archival GABC must engrave, otherwise no review");
  assert.equal(overview.state.failed,0,"Failed archive excerpt requires explicit treatment");
  assert.equal(overview.cards,24);
  assert.equal(overview.svgs,24);
  assert.equal(overview.links,24);
  assert.equal(overview.plateLinks,36,"Eight Preface responses require two EXACT 1961 books; other archived excerpts retain their witnesses");
  assert.deepEqual(overview.missingPlateLinks,[],"Each archived excerpt links its 1961 printed staff");
  assert.equal(overview.plateIds.length,13,"Original 1961 p.109 plus Graduale p.130*/p.131* are separately indexed");
  assert.equal(overview.prefaceLocations,8);
  assert.equal(overview.exactPrefacePages,8);
  assert.equal(overview.eventGroups,15);
  assert.equal(overview.allUnapproved,true);
  assert.equal(overview.state.allUnapproved,true);
  assert.equal(overview.editorialStatus,true);
  assert.deepEqual(overview.badWidth,[],"Staff must fit mobile without clipping");
  assert.ok(overview.documentWidth<=overview.viewportWidth+1,
   "Review board horizontal overflow at "+width+": "+JSON.stringify(overview));
  const filterResult=await page.evaluate(()=>{
   const api=window.__AO_PARTICIPATION_SCORE_REVIEW;
   const id=api.selectEvent("DISMISSAL_EXCHANGE");
   const visible=[...document.querySelectorAll(".event")].filter(el=>!el.hidden);
   const scoreCount=visible.flatMap(el=>[...el.querySelectorAll(".score")]).length;
   api.selectEvent("PREFACE_GREETING");
   const preface=[...document.querySelectorAll(".event")].filter(el=>!el.hidden);
   return {id,visible:visible.length,scoreCount,
    preface:preface.length,prefaceScores:preface[0]?.querySelectorAll(".score").length,
    refilter:document.getElementById("event-filter").value};
  });
  assert.deepEqual(filterResult,{id:"DISMISSAL_EXCHANGE",visible:1,scoreCount:4,
   preface:1,prefaceScores:2,refilter:"PREFACE_GREETING"});
  await mkdir(resolve(root,".tmp/mass-participation-24-review"),{recursive:true});
  await page.screenshot({path:resolve(root,
   ".tmp/mass-participation-24-review/visible-preface-"+width+".png"),fullPage:true});
  await page.evaluate(()=>window.__AO_PARTICIPATION_SCORE_REVIEW.selectEvent("ALL"));
  if(width===1180){
   await page.screenshot({path:resolve(root,
    ".tmp/mass-participation-24-review/all-24-desktop.png"),fullPage:true});
  }else{
   await page.evaluate(()=>window.__AO_PARTICIPATION_SCORE_REVIEW.selectEvent("DISMISSAL_EXCHANGE"));
   await page.screenshot({path:resolve(root,
    ".tmp/mass-participation-24-review/dismissal-alternatives-"+width+".png"),fullPage:true});
  }
  console.log("PASS_24_SCORE_REVIEW",JSON.stringify({width,engraved:overview.svgs,
   sourceLinks:overview.links,printedScans:overview.plateLinks,
   events:overview.eventGroups,allUnapproved:true}));
  await page.close();
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
