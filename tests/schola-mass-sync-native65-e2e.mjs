// Bounded actual 65-card LIVE reader integration with an EXPLICIT TEST-ONLY
// score-eligibility stub. No score is approved, published or staged for users.
// The production module still has zero Schola score promotions.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {SCHOLA_DOCK_SCORE_APPROVALS} from "../src/mass/reader-schola-dock-approved.js";

assert.equal(SCHOLA_DOCK_SCORE_APPROVALS.length,0,
 "An E2E test must never promote provisional Gregorian music");
for(const [track,setting] of [["KYRIE","MASS_08"],["GLORIA","MASS_08"],["CREDO","CREDO_03"]])
 assert.ok(offlineKyrialeResearchScore(track,setting)?.gabc,track+" original GABC missing");

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/schola-shared-cursor");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",
 ".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp"};
const gateStub=String.raw`// MOCKED ONLY in tests/schola-mass-sync-native65-e2e.mjs local HTTP server.
// Original 1961 research GABC tests behavior; this is NOT music approval.
import {offlineKyrialeResearchScore} from "./reader-kyriale-research-gabc.js";
export const SCHOLA_DOCK_SCORE_APPROVALS=Object.freeze([]);
export function selectApprovedScholaDockScore({schola,form}={}){
 const track=schola?.trackId;
 const setting={KYRIE:"MASS_08",GLORIA:"MASS_08",CREDO:"CREDO_03"}[track];
 if(!setting||schola?.musicStatus!=="EXPECTED_NOT_OBSERVED"||
    !["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form))return null;
 const source=offlineKyrialeResearchScore(track,setting);
 return source?Object.freeze({...source,scoreId:source.scoreId,
   gabcSha256:"TEST_ONLY_"+source.scoreId,scholaTrackId:track}):null;
}
`;
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  if(pathname==="/src/mass/reader-schola-dock-approved.js"){
   res.writeHead(200,{"content-type":mime[".js"],"cache-control":"no-store",
    "x-ao-gate-test":"SOURCE_GABC_TEST_ONLY_NOT_PUBLISHED"});
   res.end(gateStub);return;
  }
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){
   res.writeHead(403);res.end("Forbidden");return;
  }
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);
  res.end(String(error?.message??error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const browser=await chromium.launch({headless:true});
try{
 for(const width of [320,390,1280]){
  for(const {track,settings,cardsExpected} of [
   {track:"KYRIE",settings:"MASS_08",cardsExpected:1},
   {track:"GLORIA",settings:"MASS_08",cardsExpected:3},
   {track:"CREDO",settings:"CREDO_03",cardsExpected:4}
  ]){
   const page=await browser.newPage({viewport:{width,height:width<600?844:880},
    isMobile:width<600,hasTouch:width<600,deviceScaleFactor:1});
   const errors=[];page.on("pageerror",err=>errors.push(err.message));
   const base="http://127.0.0.1:"+server.address().port;
   await page.goto(base+"/tests/fixtures/reader-phone-harness.html?production=1&aoLiveCards=65&form=MISSA_CANTATA_SIMPLE&gloria=1&credo=1",
     {waitUntil:"networkidle",timeout:60000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
     null,{timeout:30000});
   const source=offlineKyrialeResearchScore(track,settings);
   const target=await page.evaluate(async({gabc,track})=>{
    const {buildOrdinaryScholaCardFollowMap}=await import(
      "/src/mass/reader-schola-card-follow.js");
    const api=window.__AO_PHONE_PREVIEW;
    const mapping=buildOrdinaryScholaCardFollowMap({
      gabc,trackId:track,cards:api.model.cards
    });
    if(!mapping.supported)throw Error("CANONICAL_SOURCE_MAP_REJECTED:"+mapping.reason);
    const ordered=[...new Set(mapping.anchors.map(a=>a.sectionId))];
    const positions=ordered.map(id=>{
      for(let i=0;i<mapping.count;i++){
       if(mapping.cardForIndex(i)?.sectionId===id)return {id,index:i};
      }
      throw Error("NO_SOURCE_SYLLABLE_FOR_CARD:"+id);
    });
    // Gloria/Credo's first card is the celebrant's intonation. The source
    // GABC includes it, but the Schola follower starts at the next card.
    const choirStart=track==="KYRIE"?0:1;
    const first=api.model.cards.find(c=>c.sectionId===ordered[choirStart]);
    api.showSequence(first.sequence);
    return {cards:api.model.totalCards,ordered,positions,choirStart,
      sourceSection:mapping.sourceSectionId,count:mapping.count};
   },{gabc:source.gabc,track});
   assert.equal(target.cards,65);
   assert.equal(target.ordered.length,cardsExpected,JSON.stringify(target));
   // The runtime has loaded authentic source GABC through its *test-only*
   // selector; its independent Schola clock remains an expected cue.
   await page.waitForFunction(()=>document.querySelector(".ao-schola-dock")
     ?.dataset.notationFollow==="estimated",null,{timeout:25000});
   await page.locator("[data-schola-notation-pause]").click();
   if(target.choirStart){
    assert.equal(await page.locator(
      '.ao-schola-follow-strip button[data-schola-syllable-index="0"]').isVisible(),
      false,"Schola cannot control celebrant-owned intonation syllables");
   }
   const baseline=await page.evaluate(()=>{
    const api=window.__AO_PHONE_PREVIEW;
    return {track:api.getScholaState()?.trackId,
      index:api.getScholaState()?.index,
      complete:api.getScholaState()?.complete,
      totalCards:api.model.totalCards};
   });
   assert.equal(baseline.track,track);
   for(const {id,index} of [...target.positions.slice(target.choirStart+1),target.positions[target.choirStart]]){
    const btn=page.locator('.ao-schola-follow-strip button[data-schola-syllable-index="'+index+'"]');
    assert.equal(await btn.count(),1,"Missing GABC source-syllable control "+track+" "+index);
    await btn.click();
    await page.waitForFunction(expected=>
      window.__AO_PHONE_PREVIEW.getCurrentCard()?.sectionId===expected,
      id,{timeout:5000});
    const moved=await page.evaluate(()=>{
      const api=window.__AO_PHONE_PREVIEW,
       reader=document.querySelector(".ao-prayer-card"),
       staff=document.querySelector('[data-role="schola-approved-staff"]');
      return {
       card:api.getCurrentCard()?.sectionId,
       schola:api.getScholaState(),
       index:staff?.dataset.scholaFollowIndex,
       readerIndex:reader?.dataset.scholaTextFollowIndex,
       readerParagraph:reader?.dataset.scholaTextFollowParagraph,
       scoreLeft:staff?.scrollLeft,
       scoreWidth:staff?.scrollWidth,
       viewportWidth:staff?.clientWidth,
       approval:document.querySelector(".ao-schola-dock")?.dataset.approvedScore
      };
    });
    assert.equal(moved.card,id);
    assert.equal(Number(moved.index),index);
    assert.equal(Number(moved.readerIndex),index,
     "The same syllable must be current in Mass and Schola");
    assert.ok(moved.readerParagraph,"Source Latin paragraph was not focused");
    assert.equal(moved.schola.trackId,baseline.track);
    assert.equal(moved.schola.index,baseline.index,
     "Visual Schola follow changed the independent canonical Schola phrase");
    assert.equal(moved.schola.complete,baseline.complete);
    assert.equal(moved.approval,"true","Test-only score not visible");
    assert.ok(moved.scoreWidth>moved.viewportWidth+50,
     "Authentic neumes are not in a horizontal score viewport");
   }
   if(width===390 && track!=="KYRIE"){
    await page.screenshot({path:resolve(out,track.toLowerCase()+"-native65-390.png"),
     animations:"disabled"});
   }
   assert.deepEqual(errors,[],"Native reader JS error "+track+" "+width);
   console.log("SCHOLA_NATIVE65_SOURCE_CARD_SYNC_PASS="+JSON.stringify({
     width,track,cards:target.ordered.length,
     syllables:target.count,approval:"TEST_ONLY_NOT_PUBLISHED"}));
   await page.close();
  }
 }
 // No score or notation is automatically published in the real Low/Missal
 // modes, even when the local HTTP server provides a research-only stub.
 for(const query of ["mode=MISSAL&form=SOLEMN","mode=LIVE&form=LOW"]){
  const p=await browser.newPage({viewport:{width:390,height:844}});
  await p.goto("http://127.0.0.1:"+server.address().port+
    "/tests/fixtures/reader-phone-harness.html?production=1&aoLiveCards=65&"+query,
    {waitUntil:"networkidle",timeout:60000});
  await p.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",
    null,{timeout:30000});
  const hidden=await p.evaluate(()=>{
   const api=window.__AO_PHONE_PREVIEW;
   const card=api.model.cards.find(c=>c.sourceSectionId==="AO.CARD.002");
   if(card)api.showSequence(card.sequence);
   const dock=document.querySelector(".ao-schola-dock");
   return {approved:dock?.dataset.approvedScore,
    track:api.getScholaState()?.trackId,
    visible:getComputedStyle(dock).display!=="none"};
  });
  assert.notEqual(hidden.approved,"true",query+": research score leaked to Low/Missal");
  await p.close();
 }
}finally{
 await browser.close();
 await new Promise(ok=>server.close(ok));
}
