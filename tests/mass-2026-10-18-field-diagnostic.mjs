// Real-calendar field diagnostic for the 21st Sunday after Pentecost,
// 18 October 2026. Distinguish source resolution from presentation.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".webmanifest":"application/manifest+json"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+p);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream"});
  res.end(bytes);
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
 const result=await page.evaluate(async()=>{
  const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay("2026-10-18");
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {composeProperReaderParagraphs}=await import("/src/mass/proper-reader-composition.js");
  const named=[];
  const output={
   main:{id:r.day?.main?.id,title:r.day?.main?.title,name:r.day?.main?.name},
   calendarCommemorations:(r.day?.commemorations??[]).map(x=>({id:x.id,name:x.name,title:x.title})),
   original:{sourcePath:r.proper?.data?.sourcePath,
     collects:r.proper?.data?.collects?.length??null,
     postcommunions:r.proper?.data?.postcommunions?.length??null,
     secrets:r.proper?.data?.secrets?.length??null},
   forms:{}
  };
  for(const form of ["LOW","MISSA_CANTATA_SIMPLE","SOLEMN"]){
   const selected=select1962CommemorationsForMassForm({proper:r.proper,calendarResolution:r,form});
   const p=selected.proper?.data??selected.proper;
   const entry={status:selected.status,reason:selected.reason??null,
     decision:selected.decision??null,
     counts:Object.fromEntries(["collects","secrets","postcommunions"].map(k=>[k,p?.[k]?.length??null])),
     groups:{}};
   for(const language of ["en","fr"]){
    const map=properToReaderSlots(p,{language});
    const groups={};
    for(const [slot,block] of [["COLLECT_SET","AO.SM.B019"],["POSTCOMMUNION_SET","AO.SM.B088"]]){
      const val=map.slots[slot];
      groups[slot]={status:val.status,reason:val.reason??null,paragraphs:val.status==="READY"
       ?composeProperReaderParagraphs(block,val.data.paragraphs,{language,form}).map(row=>({
        id:row.id,kind:row.kind,orationGroup:row.orationGroupIndex??null,
        role:row.prayerRole??null,latin:String(row.latin??"").slice(-320),
        vernacular:String(row.vernacular??"").slice(-320)}))
       :[]};
    }
    entry.groups[language]=groups;
   }
   output.forms[form]=entry;
  }
  const all=Object.values(r.proper?.data??{}).filter(x=>x&&typeof x==="object");
  output.ps113=all.map(x=>JSON.stringify(x)).filter(s=>/113\s*[:.,]\s*1|[ée]xitu|Æg[yý]pt/i.test(s)).map(s=>s.slice(0,500)).slice(0,5);
  return output;
 });
 console.log("MASS_OCT18_FIELD_DIAGNOSTIC="+JSON.stringify(result));
 assert.ok(result.main.id,"18 October 2026 Mass of the day resolution absent");
 console.log("PASS: 18 October 2026 real-source oration and Alleluia report captured");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
