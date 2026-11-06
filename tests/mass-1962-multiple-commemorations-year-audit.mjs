// Exhaustive date-scoped read-only source witness for the 2026 1962 calendar.
// Every candidate comes from the actual resolver, never a manually invented
// civil-date or named-feast mapping. No automatic rubrical certification.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".json":"application/json",".css":"text/css",".mjs":"text/javascript",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
 const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});res.end(bytes)
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 page.on("console",m=>{if(m.type()==="error")console.error("SOURCE_PAGE_ERROR",m.text().slice(0,350))});
 const dates=Array.from({length:365},(_,i)=>new Date(Date.UTC(2026,0,i+1,12)).toISOString().slice(0,10));
 const aggregate={multi:[],single:[],inseparable:[],failures:[],unmappedGroups:[],
   formDecisions:{},certifiedFormCases:0,uncertifiedFormCases:[],certifiedOrationFailures:[],checked:0};
 for(let offset=0;offset<dates.length;offset+=30){
   const batch=dates.slice(offset,offset+30);
   const items=await page.evaluate(async dates=>{
     // Exercise the original source-owned 1962 form selector and the exact
     // reader projection; do not construct a parallel liturgical algorithm.
     const {select1962CommemorationsForMassForm:select}=
       await import("/src/mass/1962-commemoration-form-source.js");
     const {properToReaderSlots}=
       await import("/src/mass/proper-reader-slots.js");
     const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
     const sourceGroupPairs=[
       ["collects","COLLECT_SET"],["secrets","SECRET_SET"],
       ["postcommunions","POSTCOMMUNION_SET"]
     ];
     const rows=[];
     for(const date of dates){
       try{
         const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
         const p=r?.proper?.data,comms=r?.day?.commemorations??[];
         const cal=p?.calendarCommemorations??[];
         const groups=["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??null);
         const row={date,status:r?.status,properStatus:r?.proper?.status,
           main:{id:r?.day?.main?.id,rank:r?.day?.main?.rank,path:r?.day?.main?.path,title:r?.day?.main?.title},
           commemorations:comms.map(x=>({id:x.id,title:x.title,rank:x.rank,path:x.path,inseparable:x.inseparable,privileged:x.privileged})),
           sourceCommemorations:cal.map(x=>({name:x.name,path:x.path,prayerSourcePath:x.prayerSourcePath,inseparable:x.inseparable})),
           prayerCounts:groups,
           trilingual:["collects","secrets","postcommunions"].map(k=>(p?.[k]??[]).map(x=>(["lat","en","fr"].every(l=>!!String(x?.[l]??"").trim())))),
           sourcePath:p?.sourcePath};
         if(r?.status==="ready" && r?.proper?.status==="ready" && comms.length){
           row.formChecks=forms.map(form=>{
             const projected=select({
               proper:r.proper,calendarResolution:r,
               form,celebrationId:"mass_of_day"
             });
             const result={form,status:projected.status,reason:projected.reason??null};
             if(projected.status!=="CERTIFIED")return result;
             const data=projected.proper?.data??projected.proper;
             const decision=data?.commemorationFormDecision;
             const counts=sourceGroupPairs.map(([field])=>Array.isArray(data?.[field])?
               data[field].length:0);
             const expected=decision?.prayerGroupCount??(
               Number.isInteger(decision?.appliedCount)?decision.appliedCount+1:null);
             const failures=[];
             if(decision?.status!=="CERTIFIED"||
                decision?.source!=="1962_PROPER_RESOLVER"||
                decision?.form!==form||!Number.isInteger(expected))
               failures.push("Missing or mismatched original form decision");
             if(expected!=null && counts.some(n=>n!==expected))
               failures.push("Source-group mismatch: "+counts.join("/")+
                 " expected "+expected);
             for(const language of ["en","fr"]){
               const projection=properToReaderSlots(data,{language});
               for(const [field,slot] of sourceGroupPairs){
                 const entry=projection.slots?.[slot];
                 if(entry?.status!=="READY"){
                   failures.push(language+" "+slot+" "+(entry?.reason??"not ready"));
                   continue;
                 }
                 const paragraphs=entry.data?.paragraphs??[];
                 const groupIndexes=[...new Set(paragraphs.map(p=>p.orationGroupIndex)
                   .filter(Number.isInteger))];
                 if(groupIndexes.length!==data[field].length||
                    groupIndexes.some((n,i)=>n!==i+1))
                   failures.push(language+" "+slot+" lost a source-owned group");
               }
             }
             return {...result,expected,counts,failures};
           });
         }
         rows.push(row);
       }catch(e){rows.push({date,error:String(e?.message??e)})}
     }return rows;
   },batch);
   for(const row of items){
     aggregate.checked++;
     if(row.error||row.status!=="ready"||row.properStatus!=="ready")aggregate.failures.push(row);
     if(row.commemorations?.length>1)aggregate.multi.push(row);
     else if(row.commemorations?.length===1)aggregate.single.push({date:row.date,main:row.main,comm:row.commemorations[0],prayers:row.prayerCounts});
     if(row.commemorations?.some(x=>x.inseparable))aggregate.inseparable.push(row);
     if(row.sourceCommemorations?.length>1||row.prayerCounts?.some(x=>x>2))
       aggregate.unmappedGroups.push(row);
     for(const decision of row.formChecks??[]){
       const key=decision.status==="CERTIFIED"?"CERTIFIED":
         decision.reason??decision.status;
       aggregate.formDecisions[key]=(aggregate.formDecisions[key]??0)+1;
       if(decision.status==="CERTIFIED"){
         aggregate.certifiedFormCases++;
         if(decision.failures?.length)
           aggregate.certifiedOrationFailures.push({
             date:row.date,sourcePath:row.sourcePath,...decision
           });
       }else{
         aggregate.uncertifiedFormCases.push({
           date:row.date,sourcePath:row.sourcePath,form:decision.form,
           reason:decision.reason??decision.status
         });
       }
     }
   }
   console.log("MASS_1962_2026_SCAN",JSON.stringify({checked:aggregate.checked,multi:aggregate.multi.length,single:aggregate.single.length,unmappedGroups:aggregate.unmappedGroups.length,failed:aggregate.failures.length}));
 }
 console.log("MASS_1962_MULTI_WITNESSES="+JSON.stringify(aggregate.multi));
 console.log("MASS_1962_SOURCE_GROUP_CANDIDATES="+JSON.stringify(aggregate.unmappedGroups));
 console.log("MASS_1962_FORM_ORATION_COVERAGE="+JSON.stringify({certified:aggregate.certifiedFormCases,uncertified:aggregate.uncertifiedFormCases.length,decisions:aggregate.formDecisions,unverifiedCandidates:aggregate.uncertifiedFormCases.slice(0,90)}));
 console.log("MASS_1962_CERTIFIED_ORATION_FAILURES="+JSON.stringify(aggregate.certifiedOrationFailures));
 console.log("MASS_1962_SOURCE_SCAN_SUMMARY="+JSON.stringify({checked:aggregate.checked,failures:aggregate.failures.slice(0,30),multiDates:aggregate.multi.map(x=>x.date),single:aggregate.single.length,inseparableDates:aggregate.inseparable.map(x=>x.date)}));
 assert.equal(aggregate.checked,365);
 assert.deepEqual(aggregate.failures,[],
   "Every 2026 day must resolve; source errors are release blockers, not a passing audit");
 assert.ok(aggregate.single.length>0,"Resolver returned no commemoration evidence");
 assert.ok(aggregate.certifiedFormCases>0,
   "No certified 1962 form-specific Masses were exercised");
 assert.deepEqual(aggregate.certifiedOrationFailures,[],
   "An existing source-certified 1962 Mass lost prayers on its way to LIVE/Missal");
 console.log("PASS: 365 resolved 2026 1962 dates; all source-certified form orations retained EN/FR. Uncertified cases are listed, never silently certified.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
