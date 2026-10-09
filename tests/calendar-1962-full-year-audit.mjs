// Bounded independent checkpoints + exhaustive local production resolver sweep.
// Do not silently treat a complete geometry sweep as certified 1962 Mass parity.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const outputDir=resolve(root,"artifacts/calendar-oracle");
const fixture=JSON.parse(await readFile(resolve(root,"data/calendar/1962-year-independent-checks-2026.v1.json"),"utf8"));
assert.equal(fixture.schema,"ao-1962-year-independent-checks-v1");
assert.equal(fixture.year,2026);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
function normalizeRank(value){
  const raw=String(value??"").trim().toUpperCase();
  if(/^[1-4]$/.test(raw))return Number(raw);
  const match=raw.match(/(?:^|\b)(IV|III|II|I)(?=\b|[.\s])/);
  if(match)return {I:1,II:2,III:3,IV:4}[match[1]];
  const ar=raw.match(/(?:^|\b)([1-4])(?:ST|ND|RD|TH)?\s*(?:CLASS|CLASSE|KL)/);
  return ar?Number(ar[1]):null;
}
function normalizeColor(value){
  const raw=String(value??"").trim().toLowerCase();
  for(const [colour,alternatives] of Object.entries({
    white:["white","blanc","albus"],
    violet:["violet","purple","violaceus"],
    rose:["rose","rosaceus","pink"],
    green:["green","vert","viridis"],
    red:["red","rouge","ruber"],
    black:["black","noir","niger"],
  })){
    if(alternatives.some(x=>raw===x||raw.startsWith(x+" ")))return colour;
  }
  return raw||null;
}
const dates=[];
for(let day=Date.UTC(2026,0,1);day<Date.UTC(2027,0,1);day+=86400000)
  dates.push(new Date(day).toISOString().slice(0,10));
assert.equal(dates.length,365);
let browser;
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const port=server.address().port;
let result=null;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  page.setDefaultTimeout(90000);
  await page.goto("http://127.0.0.1:"+port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
  const rows=[];
  // Reuse the production Mass day resolver directly, not Calendar's visual
  // projection; avoid 365 expensive DOM navigation and do not mutate app data.
  for(let offset=0;offset<dates.length;offset+=12){
    const chunk=dates.slice(offset,offset+12);
    const response=await page.evaluate(async ids=>{
      const resolver=globalThis.AO_RUNTIME_V8?.resolver;
      if(!resolver||typeof resolver.resolveDay!=="function")throw Error("Production day resolver unavailable");
      return Promise.all(ids.map(async date=>{
        try{
          const r=await resolver.resolveDay(date);
          const d=r?.day?.main||{},p=r?.proper?.data||{};
          const commRaw=r?.day?.commemorations||d.commemorations||r?.commemorations||[];
          const comms=(Array.isArray(commRaw)?commRaw:[commRaw]).map(x=>
            typeof x==="string"?x:String(x?.title||x?.name||x?.titleFr||x?.id||"")).filter(Boolean);
          return {
            date,status:String(r?.status||""),actualDate:String(r?.date||""),
            mainId:String(d.id||""),title:String(p.name||p.title?.en||d.title||d.name||""),
            provenance:{dayTitle:d.title??null,dayColour:d.color??d.colour??null,properTitle:p.name??p.title?.en??null,properColour:p.color??p.colour??null,colourPlan:r?.colourPlan??null,dayCommemorations:d.commemorations??null,properCommemorations:p.commemorations??null},
            rawRank:p.rank??d.rank??null,rawColour:(/^tempora:Quad6-5r:/.test(String(d.id??""))?r?.colourPlan?.primary:r?.colourPlan?.massColor)??p.color??p.colour??d.color??d.colour??r?.colourPlan?.name??null,
            commemorations:comms,properStatus:String(r?.proper?.status||""),
            failed:!r||r.status==="failed"||!r.day?.main||r.date!==date,
            failure:String(r?.error||r?.proper?.error||""),
          };
        }catch(error){return {date,failed:true,status:"exception",failure:String(error?.message||error)};}
      }));
    },chunk);
    rows.push(...response);
  }
  const checks=[];
  for(const check of fixture.checks){
    const row=rows.find(x=>x.date===check.date);
    const problems=[];
    if(!row||row.failed){problems.push("not resolved");}
    else {
      if(!new RegExp(check.principalRegex,"i").test(row.title))problems.push("principal mismatch");
      if(normalizeRank(row.rawRank)!==check.rank)problems.push("rank mismatch");
      if(!new RegExp("^(?:"+check.colourRegex+")$","i").test(normalizeColor(row.rawColour)||""))problems.push("colour mismatch");
      if(check.commemorationRegex&&!row.commemorations.some(x=>new RegExp(check.commemorationRegex,"i").test(x)))
        problems.push("commemoration absent or unidentified");
      if(check.colourPhases){
        const actualPhases=(row.provenance?.colourPlan?.sequence||[]).map(x=>normalizeColor(x?.[1]));
        if(JSON.stringify(actualPhases)!==JSON.stringify(check.colourPhases))problems.push("ceremonial colour sequence mismatch");
      }
    }
    checks.push({date:check.date,expected:{principalRegex:check.principalRegex,rank:check.rank,colourRegex:check.colourRegex,commemorationRegex:check.commemorationRegex||null,colourPhases:check.colourPhases||null},actual:row||null,problems});
  }
  const unresolved=rows.filter(x=>x.failed);
  const incomplete=rows.filter(x=>!x.failed&&(!x.title||normalizeRank(x.rawRank)===null||!normalizeColor(x.rawColour)));
  const discrepancies=checks.filter(x=>x.problems.length);
  const summary={
    year:2026,calendar:"GENERAL_ROMAN_1962",productionResolverDates:dates.length,
    resolved:rows.length-unresolved.length,unresolved:unresolved.length,
    missingTitleRankColour:incomplete.length,independentChecks:checks.length,
    independentlyMatched:checks.length-discrepancies.length,independentDiscrepancies:discrepancies.length,
    fullYearIndependentlyCertified:false,
    status:"EVIDENCE_AUDIT_NOT_CERTIFICATION",
  };
  result={schema:"ao-1962-year-runtime-audit-v1",createdAt:new Date().toISOString(),sources:fixture.sources,
    constraints:[
      "All 365 civil dates are resolved locally against the production engine.",
      "Only independent fixture dates have independently cross-checked names/classes/colours/commemorations.",
      "Unresolved and discrepant cases are not rewritten or represented as certified.",
      "No external calendar content is copied into the runtime or output.",
      "Optional rose on Laetare/Gaudete is not confused with an obligatory violet alternative.",
    ],summary,unresolved,incomplete,discrepancies,checks,rows};
  await mkdir(outputDir,{recursive:true});
  await writeFile(resolve(outputDir,"1962-2026-full-year-audit.json"),JSON.stringify(result,null,2)+"\n","utf8");
  console.log("CALENDAR_1962_YEAR_AUDIT_SUMMARY="+JSON.stringify(summary));
  console.log("CALENDAR_1962_YEAR_AUDIT_TOP_FINDINGS="+JSON.stringify(discrepancies.slice(0,30).map(x=>({date:x.date,problems:x.problems,title:x.actual?.title,rank:x.actual?.rawRank,color:x.actual?.rawColour}))));
  assert.equal(rows.length,365,"Production resolver sweep must cover every day of 2026");
  assert.equal(new Set(rows.map(x=>x.date)).size,365,"Production resolver sweep must not repeat dates");
  if(process.env.AO_CALENDAR_AUDIT_STRICT==="1")
    assert.equal(unresolved.length+incomplete.length+discrepancies.length,0,"Full-year source audit has unresolved/discrepant data");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
