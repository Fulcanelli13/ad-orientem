/** Real 1962 native resolver regression: Advent I weekday Mass inherits Sunday text.
 * Retain each weekday identity; no synthetic Proper and no Calendar migration.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",
  ".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const dates=["2026-11-29","2026-11-30","2026-12-01","2026-12-02","2026-12-03","2026-12-04","2026-12-05",
  "2027-11-28","2027-11-29","2027-11-30","2027-12-01","2027-12-02","2027-12-03","2027-12-04"];
let browser, rows=[];
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
  for(let i=0;i<dates.length;i+=4){
    const batch=await page.evaluate(async ds=>{
    return await Promise.all(ds.map(async date=>{
      try {
        const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
        const p=r?.proper?.data||{},str=s=>String(s??"");
        const pick=x=>str(x?.lat??x?.la??"");
        const mandatory=[p.introit,p.collects?.[0],p.epistle,p.gospel,p.offertory,
          p.secrets?.[0],p.communion,p.postcommunions?.[0]];
        const bilingualPresence={
          en:mandatory.every(x=>str(x?.en).trim().length>0),
          fr:mandatory.every(x=>str(x?.fr).trim().length>0)
        };
        return {date,status:r?.status,properStatus:r?.proper?.status,bilingualPresence,
          main:r?.day?.main?.id??null,sourcePath:p.sourcePath??null,
          inherited:p.inheritedProper===true,
          introit:pick(p.introit).slice(0,130),
          collect1:pick(p.collects?.[0]).slice(0,130),
          collect2:pick(p.collects?.[1]).slice(0,130),
          epistle:pick(p.epistle).slice(0,130),
          gradual:pick(p.gradual).slice(0,130),
          gospel:pick(p.gospel).slice(0,130),
          offertory:pick(p.offertory).slice(0,130),
          communion:pick(p.communion).slice(0,130),
          commemorations:(p.calendarCommemorations||[]).map(x=>({path:x.path,name:x.name}))};
      }catch(e){return {date,error:String(e?.message||e)};}
    }));
    },dates.slice(i,i+4));
    rows.push(...batch);
  }
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
const words=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[^a-zA-Z]+/g," ").replace(/\s+/g," ").toLowerCase().trim();
const contains=(hay,needle)=>(" "+words(hay)+" ").includes(" "+words(needle)+" ");
for(const row of rows)console.log("ADVENT_I_SOURCE_OBSERVATION="+JSON.stringify(row));
assert.equal(rows.length,14);
assert.equal(new Set(rows.map(x=>x.date)).size,14);
const feria=rows.filter(x=>/^tempora:Adv1-[1-6]:[23]:v$/.test(x.main??""));
assert.ok(feria.length>=3,"Need at least 3 actual Advent I ferias across 2026/2027 for real-source audit");
for(const x of feria){
  assert.equal(x.status,"ready",x.date+": calendar unresolved");
  assert.equal(x.properStatus,"ready",x.date+": Proper unavailable");
  assert.equal(x.sourcePath,x.main.replace(/^tempora:/,"Tempora/").replace(/:[234]:v$/,""),
    x.date+": weekday source identity was overwritten");
  assert.equal(x.inherited,true,x.date+": no explicit inherited Mass source");
  assert.ok(contains(x.introit,"Ad te levavi"),x.date+": Advent Sunday Introit missing");
  assert.equal(x.bilingualPresence.en,true,x.date+": incomplete English inherited source (do not synthesize translation)");
  assert.equal(x.bilingualPresence.fr,true,x.date+": incomplete French inherited source (do not synthesize translation)");
  assert.ok(contains(x.collect1,"Excita quaesumus Domine potentiam tuam"),
    x.date+": first Collect must be inherited Advent I, NOT a saint's commemoration");
  for(const part of ["epistle","gospel","offertory","communion","gradual"])
    assert.ok(x[part]?.length>30,x.date+": required inherited "+part+" missing");
  assert.equal(/allel[uú]ia/i.test(words(x.gradual)),false,
    x.date+": Sunday Alleluia/verse must be omitted under the printed 1962 Advent feria rubric");
}
const dec5=rows.find(x=>x.date==="2026-12-05");
assert.equal(dec5.main,"tempora:Adv1-6:3:v");
assert.ok(dec5.commemorations.some(x=>x.path==="Sancti/12-05"),
 "Keep St Sabbas as a source commemoration");
assert.ok(contains(dec5.collect2,"Intercessio nos"),
 "St Sabbas prayer must follow inherited first Collect, not replace it");
const sunday=rows.find(x=>x.date==="2026-11-29");
assert.equal(sunday.sourcePath,"Tempora/Adv1-0");
assert.ok(contains(sunday.introit,"Ad te levavi"));
console.log("PASS 1962 Advent I inherited Mass Proper: "+feria.length+" actual ferias, cross-year, own weekday IDs, Sunday texts, St Sabbas second Collect");
