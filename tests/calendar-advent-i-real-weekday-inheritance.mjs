/** Real 1962 native resolver regression: four Advent weeks inherit Sunday where source is rubric-only.
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
const dates=[
  "2026-11-29","2026-11-30","2026-12-01","2026-12-05",
  "2026-12-06","2026-12-07","2026-12-08","2026-12-09","2026-12-12",
  "2026-12-13","2026-12-14","2026-12-16","2026-12-17","2026-12-18","2026-12-19",
  "2026-12-20","2026-12-21","2026-12-22","2026-12-23","2026-12-24",
  "2027-11-28","2027-11-29","2027-11-30","2027-12-01","2027-12-04",
  "2027-12-05","2027-12-06","2027-12-08","2027-12-09","2027-12-11",
  "2027-12-12","2027-12-13","2027-12-15","2027-12-16","2027-12-17","2027-12-18",
  "2027-12-19","2027-12-20","2027-12-21","2027-12-23"
];
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
// Latin typographic æ/ǽ and œ/œ́ are ligatures, not ASCII ae/oe under NFD.
// Fold them before word matching without changing any user-facing liturgical text.
const words=x=>String(x??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe")
 .replace(/[^a-zA-Z]+/g," ").replace(/\s+/g," ").toLowerCase().trim();
assert.equal(words("Roráte, cæli"),words("Rorate caeli"));
assert.equal(words("Roráte, cœli"),words("Rorate coeli"));
assert.equal(words("Excita, quǽsumus, Dómine"),words("Excita quaesumus Domine"));
const contains=(hay,needle)=>(" "+words(hay)+" ").includes(" "+words(needle)+" ");
for(const row of rows)console.log("ADVENT_WEEKDAY_SOURCE_OBSERVATION="+JSON.stringify(row));
assert.equal(rows.length,dates.length);
assert.equal(new Set(rows.map(x=>x.date)).size,dates.length);
const donors={
  "1":{introit:"Ad te levavi",collect:"Excita quaesumus Domine potentiam tuam"},
  "2":{introit:"Populus Sion",collect:"Excita Domine corda nostra"},
  "3":{introit:"Gaudete in Domino",collect:"Aurem tuam quaesumus Domine"},
  "4":{introit:"Rorate coeli",collect:"Excita quaesumus Domine potentiam tuam et veni et magna"}
};
const feria=rows.filter(x=>/^tempora:Adv[1-4]-[1-6]:[23]:v$/.test(x.main??""));
const perWeek={};
for(const x of feria){
  const week=x.main.match(/^tempora:Adv([1-4])-/)[1];
  perWeek[week]=(perWeek[week]||0)+1;
  assert.equal(x.status,"ready",x.date+": Calendar unresolved");
  assert.equal(x.properStatus,"ready",x.date+": Proper unavailable");
  assert.equal(x.sourcePath,x.main.replace(/^tempora:/,"Tempora/").replace(/:[234]:v$/,""),
    x.date+": weekday source identity was overwritten");
  // The dedicated Ember days must retain their own distinct Mass structures.
  const isEmber=week==="3"&&/Adv3-[356]$/.test(x.sourcePath);
  if(isEmber){
    assert.equal(x.inherited,false,x.date+": Ember proper replaced by Sunday");
    assert.ok(x.introit.length>25,x.date+": missing own Ember Mass");
    continue;
  }
  assert.equal(x.inherited,true,x.date+": missing explicitly inherited Sunday Mass source");
  assert.ok(contains(x.introit,donors[week].introit),x.date+": wrong Advent Sunday Introit");
  assert.ok(contains(x.collect1,donors[week].collect),x.date+": wrong inherited Advent Sunday Collect");
  assert.equal(x.bilingualPresence.en,true,x.date+": incomplete English inherited source");
  assert.equal(x.bilingualPresence.fr,true,x.date+": incomplete French inherited source");
  for(const part of ["epistle","gospel","offertory","communion","gradual"])
    assert.ok(x[part]?.length>30,x.date+": mandatory "+part+" missing");
  assert.equal(/alleluia/i.test(words(x.gradual)),false,
    x.date+": improper Sunday Alleluia in Advent feria Gradual");
}
for(const week of ["1","2","3","4"])
  assert.ok((perWeek[week]||0)>=2,"Need at least two actual Advent "+week+" feria observations across two years");
const ember=feria.filter(x=>/^Tempora\/Adv3-[356]$/.test(x.sourcePath));
assert.ok(ember.length>=2,"Must observe at least two distinct Ember Masses without inheritance");

const dec5=rows.find(x=>x.date==="2026-12-05");
assert.equal(dec5.main,"tempora:Adv1-6:3:v");
assert.ok(dec5.commemorations.some(x=>x.path==="Sancti/12-05"),
 "Keep St Sabbas as a source commemoration");
assert.ok(contains(dec5.collect2,"Intercessio nos"),
 "St Sabbas prayer must follow inherited first Collect, not replace it");
const sunday=rows.find(x=>x.date==="2026-11-29");
assert.equal(sunday.sourcePath,"Tempora/Adv1-0");
assert.ok(contains(sunday.introit,"Ad te levavi"));
console.log("PASS 1962 Advent 4-week source-aware inheritance: "+JSON.stringify({observations:rows.length,ferias:feria.length,perWeek,ember:ember.length,stSabbas:"commemoration follows Sunday collect"}));
