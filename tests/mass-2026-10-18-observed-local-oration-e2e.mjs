import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {projectObservedLocalOrations} from "../src/mass/1962-observed-local-orations.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".json":"application/json",".css":"text/css;charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const name=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(name!==root&&!name.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(name);
  res.writeHead(200,{"content-type":mime[extname(name)]??"application/octet-stream",
   "cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(ok=>srv.listen(0,"127.0.0.1",ok));let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html",
   {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
   null,{timeout:80000});
 const results=await page.evaluate(async()=>{
  const day=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-10-18");
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {projectObservedLocalOrations}=await import("/src/mass/1962-observed-local-orations.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {composeProperReaderParagraphs}=await import("/src/mass/proper-reader-composition.js");
  const form="MISSA_CANTATA_SIMPLE";
  const normal=select1962CommemorationsForMassForm({proper:day.proper,
    calendarResolution:day,form});
  const named=day.day.commemorations[0];
  const args={originalProper:day.proper,selectedProper:normal.proper,
    calendarResolution:day,form,commemorationId:named.id,
    observedGroups:["collects","postcommunions"],confirmedAtMass:true};
  const selected=projectObservedLocalOrations(args);
  const p=selected.proper?.data??selected.proper;
  const n=normal.proper?.data??normal.proper;
  const groupData={};
  for(const language of ["en","fr"]){
   const slots=properToReaderSlots(p,{language});
   for(const [slot,block] of [["COLLECT_SET","AO.SM.B019"],["POSTCOMMUNION_SET","AO.SM.B088"]]){
    const value=slots.slots[slot],rows=value.status==="READY"?
     composeProperReaderParagraphs(block,value.data.paragraphs,{form,language}):[];
    groupData[language+":"+slot]={status:value.status,
     amen:rows.filter(r=>r.kind==="RESPONSE"&&/Amen\./.test(r.latin)).length,
     oremus:rows.filter(r=>r.latin==="Orémus.").length,
     groupIndexes:[...new Set(rows.map(r=>r.orationGroupIndex).filter(Number.isInteger))],
     sourceRoles:value.data?.paragraphs?.map(r=>r.prayerRole)??null};
   }
  }
  const variants={
    unconfirmed:projectObservedLocalOrations({...args,confirmedAtMass:false}).reason,
    unknown:projectObservedLocalOrations({...args,observedGroups:["secrets","unsourced"]}).reason,
    wrongCommemoration:projectObservedLocalOrations({...args,commemorationId:"someone_else"}).reason,
    low:projectObservedLocalOrations({...args,form:"LOW"}).reason,
  };
  return {
   main:day.day.main.id,commemoration:named.id,
   sourceCounts:["collects","secrets","postcommunions"].map(k=>day.proper.data[k].length),
   standardStatus:normal.status,localStatus:selected.status,localReason:selected.reason,
   normalCounts:["collects","secrets","postcommunions"].map(k=>n[k].length),
   selectedCounts:["collects","secrets","postcommunions"].map(k=>p[k].length),
   missionBefore:n.missionSundayCollectDecision?.status,
   missionAfter:p.missionSundayCollectDecision?.status,
   missionaryCollectIdentical:p.collects[0].lat===n.collects[0].lat,
   noMutation:n.postcommunions.length===1,
   stillNormativeOmitted:p.commemorationFormDecision?.appliedCount===0&&
     p.omittedCommemorations?.length===1,
   groups:groupData,variants,localDecision:p.observedLocalOrationDecision,
  };
 });
 console.log("MASS_OBSERVED_LOCAL_ORATIONS_E2E="+JSON.stringify(results));
 assert.match(results.main,/Pent21/);
 assert.deepEqual(results.sourceCounts,[2,2,2]);
 assert.deepEqual(results.normalCounts,[1,1,1]);
 assert.deepEqual(results.selectedCounts,[2,1,2],
   "Do not assume a second Secret merely from the observed Collect/Postcommunion");
 assert.equal(results.localStatus,"OBSERVED_LOCAL_NOT_1962_NORMATIVE");
 assert.equal(results.missionAfter,"CERTIFIED");
 assert.equal(results.missionBefore,"CERTIFIED");
 assert.equal(results.missionaryCollectIdentical,true,
   "The separate missionary Collect under one conclusion must not be rewritten");
 assert.equal(results.noMutation,true);
 assert.equal(results.stillNormativeOmitted,true);
 for(const v of Object.values(results.groups)){
  assert.equal(v.status,"READY");
  assert.equal(v.amen,2);
  assert.equal(v.oremus,1);
  assert.equal(v.groupIndexes.length,2);
 }
 assert.equal(results.variants.unconfirmed,"NOT_ACTUALLY_CONFIRMED");
 assert.equal(results.variants.unknown,"UNKNOWN_ORATION_GROUPS");
 assert.equal(results.variants.wrongCommemoration,"SAME_DATE_SOURCE_IDENTITY_UNVERIFIED");
 assert.equal(results.variants.low,"NORMATIVE_SELECTION_NOT_VERIFIED");
 console.log("PASS: 18 Oct actual local additional orations remain explicit, trilingual, partial, and separate from 1962 normative selection");
}finally{await browser?.close();await new Promise(ok=>srv.close(ok))}
