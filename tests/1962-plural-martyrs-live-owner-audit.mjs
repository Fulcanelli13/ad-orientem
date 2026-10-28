/**
 * Non-destructive REAL production browser source/reader audit for 1962 French
 * Martyrs Common and the named Saints Perpetua/Felicity proper.
 * This is observation, NOT permission to select/celebrate another Mass.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try {
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(file));
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,output;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 output=await page.evaluate(async()=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
  const {inspect1962PluralMartyrsFrenchOrationSource}=await import("/src/mass/1962-plural-martyr-french-source.js");
  const values=(p,k)=>Array.isArray(p?.[k])?p[k]:[];
  const describeRow=(x,i)=>({
   index:i,sourcePath:x?.sourcePath??null,latinPresent:!!(x?.lat??x?.la),
   englishPresent:!!x?.en,frenchPresent:!!x?.fr,
   latinNamedMartyrs:/mart[yý]rum/i.test(String(x?.lat??x?.la??"")),
   frenchVirginLabel:/vierges et martyres/i.test(String(x?.fr??"")),
   frenchNameCount:(String(x?.fr??"").match(/N\./g)||[]).length,
   latinNameCount:(String(x?.lat??x?.la??"").match(/N\./g)||[]).length
  });
  const inspect=(p,lang)=>({
   sourcePath:p?.sourcePath??null,
   collect:values(p,"collects").map(describeRow),
   secret:values(p,"secrets").map(describeRow),
   postcommunion:values(p,"postcommunions").map(describeRow),
   sourceConflict:["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].map(slot=>{
     let h=inspect1962PluralMartyrsFrenchOrationSource(p,slot);
     return {slot,status:h?.status??"NONE",sourcePath:h?.sourcePath??null};
   }),
   readerSlots:(()=>{
     const r=properToReaderSlots(p,{language:lang});
     return {collect:r.slots.COLLECT_SET.status,secret:r.slots.SECRET_SET.status,
      postcommunion:r.slots.POSTCOMMUNION_SET.status,ready:r.ready,missing:r.missing};
   })()
  });
  const dates=["2026-03-06","2027-03-06","2026-11-11"];
  const observedDays=[];
  for(const date of dates){
   try {
    const d=await resolver.resolveDay(date),p=d?.proper?.data;
    const legacy={canStart:true,date,calendarDay:{id:d?.day?.main?.id,title:d?.day?.main?.title??null},
      celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
      celebrationType:"CALENDAR",properSource:p?.sourcePath};
    const after=p?await recoverReaderProperOmissions(p,{hostResolver:resolver.properResolver,
       principalCelebrationId:d?.day?.main?.id,calendarDate:date}):null;
    const a=after?adaptV346ResolvedMass(legacy,{form:"low",proper:after}):null;
    observedDays.push({date,status:d?.status??null,mainId:d?.day?.main?.id??null,
      sourcePath:p?.sourcePath??null,dayCommemorations:(d?.day?.commemorations??[]).map(x=>({
        name:x?.name??x?.title??null,path:x?.path??null
      })), calendarCommemorations:(p?.calendarCommemorations??[]).map(x=>({
        name:x?.name??null,path:x?.path??null,prayerSourcePath:x?.prayerSourcePath??null
      })), raw:p?inspect(p,"fr"):null, reader:a?.proper?.data?inspect(a.proper.data,"fr"):null});
   }catch(error){observedDays.push({date,error:String(error?.message??error)});}
  }
  const sourceObservations=[];
  for(const path of ["Commune/C6b","Commune/C7b","Sancti/03-06"]){
   const obj={path};
   for(const lang of ["la","fr"]){
    const diagnostic={requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],
      structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]};
    try{
     const parsed=await resolver.properResolver.resolveSource(path,lang,diagnostic);
     obj[lang]={sourceFound:!!parsed?.map,sections:["Oratio","Secreta","Postcommunio"].map(section=>{
      const rows=parsed?.map?.get?.(section)??[];
      return {section,rows:Array.isArray(rows)?rows.length:0,
        originalRef:(Array.isArray(rows)?rows:[]).some(x=>/^@/.test(String(x)))};
     }),warnings:diagnostic.warnings?.slice(0,3),errors:diagnostic.errors?.slice(0,3),
      requestCount:diagnostic.requestedFiles?.length};
    }catch(e){obj[lang]={error:String(e?.message??e)};}
   }
   sourceObservations.push(obj);
  }
  return {schema:"AO_1962_PLURAL_MARTYRS_LIVE_OWNER_OBSERVATIONS_V1",
   method:"Real local browser index.html, AO_RUNTIME_V8.resolver.resolveDay and actual reader recovery/host-adapter/properToReaderSlots; never select a different Mass automatically",
   sourceObservations,observedDays,productionChanged:false,
   directCommonUserSelectable:false, // No selector was invoked or certified.
   note:"False means NOT ESTABLISHED by this read-only probe, not globally impossible."};
 });
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
assert.equal(output.schema,"AO_1962_PLURAL_MARTYRS_LIVE_OWNER_OBSERVATIONS_V1");
assert.equal(output.observedDays.length,3);
const mar6=output.observedDays.find(x=>x.date==="2026-03-06");
assert.equal(mar6?.sourcePath,"Tempora/Quad2-5","6 March default Mass is the Lenten feria, never silently replace with a Common");
for(const d of output.observedDays){
 console.log("MARTYRS_LIVE_DAY="+JSON.stringify({date:d.date,status:d.status,mainId:d.mainId,
  selectedPath:d.sourcePath,commemorations:d.calendarCommemorations??null,
  raw:d.raw,reader:d.reader,error:d.error}));
}
for(const src of output.sourceObservations)console.log("MARTYRS_SOURCE="+JSON.stringify(src));
console.log("MARTYRS_LIVE_SUMMARY="+JSON.stringify({
 days:output.observedDays.length,defaultMar6Path:mar6.sourcePath,
 exactNamedCommemorationObserved:(mar6.calendarCommemorations??[]).some(x=>
  x.prayerSourcePath==="Sancti/03-06"||x.path==="Sancti/03-06"),
 actualReaderConflicts:output.observedDays.reduce((n,x)=>n+(x.reader?.sourceConflict??[])
  .filter(y=>y.status==="SOURCE_CONFLICT").length,0),
 actualProductionEdit:false}));
await mkdir(resolve(root,"artifacts/mass"),{recursive:true});
await writeFile(resolve(root,"artifacts/mass/1962-plural-martyrs-live-owner-audit.json"),
 JSON.stringify(output,null,2)+"\n","utf8");
