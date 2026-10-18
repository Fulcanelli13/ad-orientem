// Field sample of four contrasted 1962 Mass days, sourced through the
// actual app calendar resolver and native Proper/reader composition pipeline.
// Publication guard: no inferred Commemoration if a form excludes it.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
    "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:80000});
 const output=await page.evaluate(async()=>{
  const dates=["2026-10-11","2026-10-25","2026-11-01","2026-12-04"];
  const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {composeProperReaderParagraphs}=await import("/src/mass/proper-reader-composition.js");
  const {assessPrintableProper}=await import("/src/calendar/print-proper.js");
  const {massCalendarPreflightContext}=await import("/src/mass/calendar-preflight-context.js");
  const field=["collects","secrets","postcommunions"];
  const slots=["INTROIT","COLLECT_SET","EPISTLE_OR_LESSON","GRADUAL",
   "ALLELUIA_TRACT_SEQUENCE","GOSPEL","OFFERTORY","SECRET_SET","PREFACE",
   "COMMUNION","POSTCOMMUNION_SET"];
  const res=[];
  for(const date of dates){
   const day=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
   const p=day.proper?.data??{};
   const summary={date,calendarStatus:day.status,properStatus:day.proper?.status,
    main:{id:day.day?.main?.id,title:day.day?.main?.title,rank:day.day?.main?.rank,
     path:day.day?.main?.path},sourcePath:p.sourcePath,
    commemorations:(day.day?.commemorations??[]).map(v=>({id:v.id,title:v.title,
     rank:v.rank,privileged:v.privileged,path:v.path})),
    rawCounts:field.map(key=>p[key]?.length??0),
    raw:{gradual:p.gradual?.lat?.slice(0,300),alleluia:p.alleluia?.lat?.slice(0,260),
     preface:p.preface?.lat?.slice(0,280)},
    forms:{}};
   for(const form of forms){
    const selected=select1962CommemorationsForMassForm({
     proper:day.proper,calendarResolution:day,form});
    const data=selected.proper?.data??selected.proper??{};
    const formRow={status:selected.status,reason:selected.reason??null,
     scope:selected.decision?.scope??null,applied:selected.decision?.appliedCount??null,
     groupCount:selected.decision?.prayerGroupCount??null,
     counts:field.map(key=>data[key]?.length??0),
     decision:data.commemorationFormDecision??null,
     print:assessPrintableProper(day,{language:"fr",massForm:form}).ok,
     language:{},flags:[]};
    for(const language of ["en","fr"]){
     const projection=properToReaderSlots(data,{language});
     const slotsStatus=Object.fromEntries(slots.map(key=>[key,projection.slots[key]?.status??"UNDEFINED"]));
     const report={ready:projection.ready,status:slotsStatus,oration:{},chant:null};
     for(const [slot,block] of [["COLLECT_SET","AO.SM.B019"],["POSTCOMMUNION_SET","AO.SM.B088"]]){
      const envelope=projection.slots[slot];
      if(envelope?.status!=="READY"){formRow.flags.push(language+":"+slot+" not ready");continue}
      const source=envelope.data.paragraphs;
      const rows=composeProperReaderParagraphs(block,source,{form,language});
      const groups=[...new Set(source.map(x=>x.orationGroupIndex).filter(Number.isInteger))];
      const amen=rows.filter(x=>x.kind==="RESPONSE"&&/Amen\.\s*$/i.test(x.latin));
      const oremus=rows.filter(x=>/^Orémus\./.test(x.latin));
      const sourceEntries=source.filter(x=>x.kind==="TEXT");
      const conclusions=sourceEntries.map(x=>({
       id:x.id,role:x.prayerRole,
       beginningLat:x.latin?.slice(0,100),endingLat:x.latin?.slice(-190),
       beginningVern:x.vernacular?.slice(0,110),endingVern:x.vernacular?.slice(-130)
      }));
      report.oration[slot]={sourcePrayerParagraphs:sourceEntries.length,liturgicalGroups:groups.length,
       responseAmens:amen.length,additionalOremus:oremus.length,
       rowOrder:rows.map(x=>({id:x.id,kind:x.kind,group:x.orationGroupIndex??null,
        opening:x.latin?.slice(0,25)})),conclusions};
      if(amen.length!==groups.length||oremus.length!==Math.max(0,groups.length-1))
       formRow.flags.push(language+":"+slot+": response/invitation boundary mismatch");
      // No duplicate built-in response in printed prayer plus canonical response.
      if(sourceEntries.some(x=>/\s(?:℟\.\s*)?Amen\.\s*$/i.test(x.latin)))
       formRow.flags.push(language+":"+slot+": Amen retained inside source paragraph");
     }
     const secret=projection.slots.SECRET_SET;
     if(secret?.status==="READY")report.oration.SECRET_SET={
      paragraphs:secret.data.paragraphs.length,
      boundary:secret.data.paragraphs.at(-1)?.secretConclusionBoundary??null,
      ends:secret.data.paragraphs.map(x=>String(x.latin).slice(-140))
     };
     report.chant={
      gradual:projection.slots.GRADUAL?.data?.paragraphs?.map(x=>({
       id:x.id,latin:String(x.latin).slice(0,110)}))??null,
      following:projection.slots.ALLELUIA_TRACT_SEQUENCE?.data?.paragraphs?.map(x=>({
       id:x.id,group:x.liturgicalGroup,latin:String(x.latin).slice(0,130)}))??null
     };
     for(const required of ["COLLECT_SET","EPISTLE_OR_LESSON","GOSPEL",
      "SECRET_SET","POSTCOMMUNION_SET"])
      if(slotsStatus[required]!=="READY")formRow.flags.push(language+":"+required+"="+slotsStatus[required]);
     formRow.language[language]=report;
    }
    const preflight=massCalendarPreflightContext({
      date,celebrationId:"mass_of_day",celebrationType:"CALENDAR",
      actualCelebration:day.day.main,proper:day.proper,canStart:true
    },{selectedDate:date,resolving:false,resolution:day},"fr",{form});
    formRow.preflight={
     status:preflight.commemorationOrations?.status??null,
     titles:preflight.commemorations,
     counts:preflight.commemorationOrations?.counts??null,
    };
    summary.forms[form]=formRow;
   }
   res.push(summary);
  }
  return res;
 });
 for(const row of output)console.log("MASS_CROSS_DATE_AUDIT="+JSON.stringify(row));
 const exp=[
  {date:"2026-10-11",main:/Pent20/,counts:[2,2,2]},
  {date:"2026-10-25",main:/10-25|Christ|Regis/i,counts:[1,1,1]},
  {date:"2026-11-01",main:/11-01|Omnium/i,counts:[2,2,2]},
  {date:"2026-12-04",main:/12-04|Petri/i,counts:[3,3,3]},
 ];
 for(let i=0;i<output.length;i++){
  const row=output[i],e=exp[i];
  assert.equal(row.date,e.date);
  assert.equal(row.calendarStatus,"ready",row.date+" calendar not ready");
  assert.equal(row.properStatus,"ready",row.date+" Proper not ready");
  assert.match(row.main.id??"",e.main,row.date+" incorrect main celebration");
  assert.deepEqual(row.rawCounts,e.counts,row.date+" incomplete source prayer groups");
 }
 console.log("PASS: four dated Mass sources and 16 form selections × EN/FR audited; flags in JSON output");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
