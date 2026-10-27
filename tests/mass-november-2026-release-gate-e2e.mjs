// P0 pre-release probe for the REAL 2026 All Saints and All Souls Masses.
// Use the existing production resolver / native R17 Proper mapper. This test
// deliberately fails when the three distinct All Souls Masses are not actually
// selectable and source-complete; historical metadata is not a release proof.
// Authorities: Missal 1960 rubrics §§402–404 and Ritus servandus XIII.
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dir=resolve(root,"artifacts/mass-november-readiness");
await mkdir(dir,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
const failures=[];
const record={schema:"ao-november-2026-live-mass-gate-v1",date:"2026-10-27",
 scope:"actual native 1962 source-to-reader map; NOT visual release certification",
 allSaints:null,allSouls:null,ceremonial:null,failures};
function check(ok,message){if(!ok)failures.push(message)}
const pathOf=x=>String(x?.sourcePath??x?.data?.sourcePath??"").trim();
const statuses=slots=>Object.fromEntries(Object.entries(slots?.slots??{}).map(([k,v])=>[k,v.status]));
let browser;
try{
 await new Promise((done,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",done)});
 browser=await chromium.launch({headless:true,executablePath:process.env.AO_BROWSER_BIN||undefined});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 const evaluated=await page.evaluate(async()=>{
  const day=globalThis.AO_RUNTIME_V8.resolver.resolveDay.bind(globalThis.AO_RUNTIME_V8.resolver);
  const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {requiemOmittedOrdinaryCuesForResolvedMass,requiemFinalBlessingOmittedCuesForResolvedMass,
    requiemAgnusVariantsForResolvedMass,requiemEntranceIncensationOmittedCuesForResolvedMass,
    requiemOffertoryIncensationVariantsForResolvedMass}=await import("/src/mass/reader-requiem-conditions.js");
  const saint=await day("2026-11-01"),souls=await day("2026-11-02");
  const extract=x=>({
   date:x?.date,status:x?.status,id:x?.day?.main?.id??null,
   rank:x?.day?.main?.rank??null,sourcePath:x?.proper?.data?.sourcePath??null,
   properStatus:x?.proper?.status??null,
   commemorations:(x?.day?.commemorations??[]).map(y=>({id:y.id,path:y.path,rank:y.rank})),
   prayerCounts:["collects","secrets","postcommunions"].map(k=>x?.proper?.data?.[k]?.length??0)
  });
  const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
  const saintForms=Object.fromEntries(forms.map(form=>{
   const selected=select1962CommemorationsForMassForm({
    proper:saint.proper,calendarResolution:saint,form});
   const p=selected.proper?.data??selected.proper;
   return [form,{
    status:selected.status,reason:selected.reason??null,
    decision:selected.decision?.scope??null,
    counts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??0),
    languages:Object.fromEntries(["en","fr"].map(language=>{
     const slots=properToReaderSlots(p,{language});
     return [language,{ready:slots.ready,missing:slots.missing,
       collects:slots.slots?.COLLECT_SET?.data?.paragraphs?.length??0,
       secrets:slots.slots?.SECRET_SET?.data?.paragraphs?.length??0,
       postcommunions:slots.slots?.POSTCOMMUNION_SET?.data?.paragraphs?.length??0}];
    }))
   }];
  }));
  // Look only at the RESOLVED source and its explicitly exposed alternatives.
  // Never count unrelated historical artwork aliases or registry strings.
  const candidates=[souls.proper?.data,
   ...(Array.isArray(souls.proper?.alternatives)?souls.proper.alternatives:[]),
   ...(Array.isArray(souls.proper?.data?.alternatives)?souls.proper.data.alternatives:[]),
   ...(Array.isArray(souls.alternativeMasses)?souls.alternativeMasses:[])];
  const resolved=[];
  for(const item of candidates){
   const p=item?.proper?.data??item?.proper??item?.data??item;
   if(!p?.sourcePath||resolved.some(x=>x.sourcePath===p.sourcePath))continue;
   const languages=Object.fromEntries(["en","fr"].map(language=>{
    const slots=properToReaderSlots(p,{language});
    return [language,{ready:slots.ready,missing:slots.missing,
     slots:Object.fromEntries(Object.entries(slots.slots??{}).map(([k,v])=>[k,v.status])),
     sequenceText:(slots.slots?.ALLELUIA_TRACT_SEQUENCE?.data?.paragraphs??[])
       .map(x=>x.latin).join(" ").slice(0,180)}];
   }));
   resolved.push({sourcePath:p.sourcePath,
    collects:p.collects?.length??0,secrets:p.secrets?.length??0,
    postcommunions:p.postcommunions?.length??0,
    sequenceLatin:String(p.sequence?.lat??p.sequence?.la??"").slice(0,130),
    languages});
  }
  const requiem={overlays:["REQUIEM"]};
  const ordinary={overlays:[]};
  return {
   saints:{...extract(saint),forms:saintForms},
   souls:{...extract(souls),resolvedFormularies:resolved},
   ceremonial:{
    req:{omittedPeace:requiemOmittedOrdinaryCuesForResolvedMass(requiem),
     omittedFinalBlessing:requiemFinalBlessingOmittedCuesForResolvedMass(requiem),
     omittedEntranceIncense:requiemEntranceIncensationOmittedCuesForResolvedMass(requiem),
     offeredIncense:requiemOffertoryIncensationVariantsForResolvedMass(requiem),
     agnus:requiemAgnusVariantsForResolvedMass(requiem)},
    ordinary:{omittedPeace:requiemOmittedOrdinaryCuesForResolvedMass(ordinary),
     agnus:requiemAgnusVariantsForResolvedMass(ordinary)}
   }
  };
 });
 record.allSaints=evaluated.saints;record.allSouls=evaluated.souls;
 record.ceremonial=evaluated.ceremonial;
 const a=evaluated.saints,b=evaluated.souls;
 check(a.status==="ready"&&a.properStatus==="ready","NOV01_CALENDAR_OR_PROPER_NOT_READY");
 check(a.id==="sancti:11-01:1:w","NOV01_WRONG_PRINCIPAL");
 check(a.sourcePath==="Sancti/11-01","NOV01_WRONG_SOURCE_PROPER");
 check(a.commemorations.some(c=>/Pent\d+-0/.test(c.path??"")),
  "NOV01_PRIVILEGED_SUNDAY_COMMEMORATION_NOT_LINKED");
 for(const [form,x] of Object.entries(a.forms)){
  check(x.status==="CERTIFIED",`NOV01_${form}_COMMEMORATION_FORM_UNCERTIFIED`);
  check(x.counts.every(n=>n===2),`NOV01_${form}_2_2_2_ORATIONS_MISSING`);
  for(const [language,v] of Object.entries(x.languages))
   check(v.ready&&v.collects===2&&v.secrets===2&&v.postcommunions===2,
    `NOV01_${form}_${language}_READER_ORATIONS_NOT_READY`);
 }
 check(b.status==="ready"&&b.properStatus==="ready","NOV02_CALENDAR_OR_PROPER_NOT_READY");
 check(b.id==="sancti:11-02m1:1:b","NOV02_WRONG_PRINCIPAL");
 // 1960 Missal §404: the first is the day default, but not a substitute for
 // the other two. Distinct texts require distinct original sourcePath objects.
 const expected=["Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"];
 for(const owner of expected){
  const form=b.resolvedFormularies.find(x=>x.sourcePath===owner);
  check(Boolean(form),`NOV02_FORMULARY_NOT_RESOLVED_OR_NOT_EXPOSED:${owner}`);
  if(!form)continue;
  check(form.collects===1&&form.secrets===1&&form.postcommunions===1,
   `NOV02_INCOMPLETE_ORATIONS:${owner}`);
  for(const [language,v] of Object.entries(form.languages)){
   check(v.ready,`NOV02_${owner}_${language}_READER_SLOTS_INCOMPLETE:${v.missing.join(",")}`);
   // 1960 Missal §399: mandatory in principal/first Mass, but
   // later consecutive non-sung Masses may omit the Sequence.
   if(owner==="Sancti/11-02m1")
    check(/Dies\\s+ir[aæe]/i.test(v.sequenceText),
     `NOV02_FIRST_${language}_DIES_IRAE_NOT_IN_SOURCE_READER`);
  }
 }
 const c=evaluated.ceremonial;
 check(c.req.omittedPeace.includes("AO.SM.C0225"),"REQUIEM_PEACE_PRAYER_NOT_OMITTED");
 check(c.req.omittedFinalBlessing.includes("AO.SM.C0263"),"REQUIEM_FINAL_BLESSING_NOT_OMITTED");
 check(c.req.omittedEntranceIncense.includes("AO.SM.C0040"),"REQUIEM_ENTRANCE_INCENSE_NOT_OMITTED");
 check(Boolean(c.req.offeredIncense?.["AO.SM.C0124"]), "REQUIEM_OFFERTORY_INCENSE_NOT_DISTINGUISHED");
 check(Boolean(c.req.agnus?.["AO.SM.C0224"]),"REQUIEM_AGNUS_SPECIAL_WORDING_MISSING");
 check(c.ordinary.omittedPeace.length===0&&!c.ordinary.agnus,
  "REQUIEM_RUBRICS_LEAK_INTO_ORDINARY_MASS");
 // This E2E test is intentionally NOT a certificate for the triple-Mass
 // chalice/ablution microsteps, local Schola choices or image publication.
 // They remain separately blocked until exact source-to-card proof exists.
} catch(e){failures.push("PROBE_EXCEPTION:"+String(e?.stack??e))}
finally{
 await writeFile(resolve(dir,"report.json"),JSON.stringify(record,null,2)+"\n");
 await browser?.close();if(server.listening)await new Promise(done=>server.close(done));
}
console.log("NOVEMBER_2026_READINESS="+JSON.stringify(record));
assert.deepEqual(failures,[],"November 1–2 native source-to-reader release gate is NOT certified");