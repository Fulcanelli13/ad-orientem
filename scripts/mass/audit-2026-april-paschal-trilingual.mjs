// Reproduce only the three April 2026 Paschal Proper defects and adjacent
// days against the REAL browser DayResolver. Public liturgical text only.
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dates=["2026-04-12","2026-04-13","2026-04-14","2026-04-15",
 "2026-04-28","2026-04-29","2026-04-30"];
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,"http://localhost");
  const path=decodeURIComponent(url.pathname);
  const dest=resolve(root,"."+path);
  if(dest!==root&&!dest.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const b=await readFile(dest);
  res.writeHead(200,{"content-type":mime[extname(dest)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(b);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,records=[];
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 records=await page.evaluate(async dates=>{
  const r=globalThis.AO_RUNTIME_V8.resolver,out=[];
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  for(const date of dates){
   const resolved=await r.resolveDay(date);
   const proper=resolved?.proper?.data;
   const selected={date,status:resolved?.status,
    principalId:resolved?.day?.main?.id??null,sourcePath:proper?.sourcePath??null,
    gradual:proper?.gradual??null,
    preGospelChants:proper?.preGospelChants??null,
    readerChantSourceProof:proper?.readerChantSourceProof??null,
    introit:proper?.introit??null,
    epistle:proper?.epistle??null,
    gospel:proper?.gospel??null,
    off:proper?.offertory??null,
    communion:proper?.communion??null,
    collect:proper?.collect??null,
    collects:proper?.collects??null,
    secret:proper?.secret??null,
    secrets:proper?.secrets??null,
    postcommunion:proper?.postcommunion??null,
    postcommunions:proper?.postcommunions??null,
    preface:proper?.preface??null,
    sourceCalendarCommemorations:proper?.calendarCommemorations??null};
   selected.recoveryDiagnostic={
    hostResolverAvailable:typeof r.properResolver?.resolveSource==="function",
    actualDataSourcePath:proper?.sourcePath,
    principal:resolved?.day?.main?.id,
    gradualLanguageShapes:Object.fromEntries(["lat","en","fr"].map(k=>
      [k,{type:typeof proper?.gradual?.[k],length:String(proper?.gradual?.[k]??"").length}])),
    originalEpistlePrefix:proper?.epistle?.lat?.slice(0,90),
    originalOffertoryPrefix:proper?.offertory?.lat?.slice(0,90)
   };
   try{
    const recovered=await recoverReaderProperOmissions(resolved?.proper,{
      hostResolver:r.properResolver,
      principalCelebrationId:resolved?.day?.main?.id??null,
      calendarDate:date
    });
    const corrected=recovered?.data??recovered;
    const en=properToReaderSlots(corrected,{language:"en"});
    const fr=properToReaderSlots(corrected,{language:"fr"});
    selected.recovered={
      correction:corrected?.aprilPaschalSourceCorrection??null,
      proof:corrected?.aprilPaschalDualAlleluiaProof??null,
      sourcePath:corrected?.sourcePath??null,
      introit:corrected?.introit??null,
      epistle:corrected?.epistle??null,
      gradual:corrected?.gradual??null,
      gospel:corrected?.gospel??null,
      off:corrected?.offertory??null,
      communion:corrected?.communion??null,
      postcommunion:corrected?.postcommunion??null,
      preGospelChants:corrected?.preGospelChants??null,
      readerSlotsEN:{
        ready:en.ready,missing:en.missing,
        first:en.slots?.GRADUAL?.data?.paragraphs??null,
        second:en.slots?.ALLELUIA_TRACT_SEQUENCE?.data?.paragraphs??null
      },
      readerSlotsFR:{
        ready:fr.ready,missing:fr.missing,
        first:fr.slots?.GRADUAL?.data?.paragraphs??null,
        second:fr.slots?.ALLELUIA_TRACT_SEQUENCE?.data?.paragraphs??null
      }
    };
   }catch(error){
    selected.recoveryError=String(error?.stack??error?.message??error);
   }
   out.push(selected);
  }
  return out;
 },dates);
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
if(records.length!==dates.length||records.some((x,i)=>x.date!==dates[i]||x.status!=="ready"))
 throw Error("APRIL_1962_SELECTED_SOURCE_SNAPSHOTS_INCOMPLETE");
await mkdir(resolve(root,".tmp/mass-april-1962"),{recursive:true});
await writeFile(resolve(root,".tmp/mass-april-1962/trilingual-dayresolver-snapshots.json"),
 JSON.stringify({schema:"ao-mass-april-1962-trilingual-dayresolver-snapshots-v1",
 readOnly:true,dates:records},null,2)+"\n");
for(const x of records)console.log("APRIL_1962_ACTUAL_SELECTED "+JSON.stringify({
 date:x.date,principalId:x.principalId,path:x.sourcePath,
 gradualLA:x.gradual?.lat??null,
 gradualEN:x.gradual?.en??null,
 gradualFR:x.gradual?.fr??null,
 introitLA:(x.introit?.lat??"").slice(0,180),
 epistleLA:(x.epistle?.lat??"").slice(0,180),
 gospelLA:(x.gospel?.lat??"").slice(0,180),
 offLA:(x.off?.lat??"").slice(0,230),
 communionLA:(x.communion?.lat??"").slice(0,230),
 collectLA:(x.collect?.lat??"").slice(0,150),
 secretLA:(x.secret?.lat??"").slice(0,150),
 postcommunionLA:(x.postcommunion?.lat??"").slice(0,150),
 properChantRows:x.preGospelChants?.map(y=>({kind:y.kind,section:y.section,lat:y.text?.lat}))??null,
 repairApplied:Boolean(x.recovered?.correction),
 repairFirstLA:x.recovered?.readerSlotsEN?.first?.[0]?.latin?.slice(0,150)??null,
 repairSecondLA:x.recovered?.readerSlotsEN?.second?.[0]?.latin?.slice(0,150)??null,
 repairError:x.recoveryError??null,
 recoveryDiagnostic:x.recoveryDiagnostic
}));
