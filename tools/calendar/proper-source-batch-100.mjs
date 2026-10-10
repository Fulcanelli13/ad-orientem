// First hundred DISTINCT 1962 Mass formulary source identities, sampled
// deterministically across all months in 2024 and 2027. This is an integrity
// and editorial-gap census, never a claim of text-for-text Missale certification.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const FOCUSED_GAPS=process.argv.includes("--focus-gaps");
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const dest=resolve(root,FOCUSED_GAPS?"artifacts/calendar-1962-proper-source-focus-10.json":"artifacts/calendar-1962-proper-source-batch-100.json");
const media={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
  try{
    const rel=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+rel);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(file);
    res.writeHead(200,{"content-type":media[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const output={
  schema:"AO_1962_PROPER_100_SOURCE_INTEGRITY_V1",
  date:"2026-10-09",years:[2024,2027],target:100,
  scope:"One hundred distinct pinned source-formulary paths (50 per civil year) across twelve months, Mass text availability, source resolution, language and commemorative prayer integrity.",
  limits:"This is NOT comparison with an independent original 1962 Latin typical edition; no source-variant comparison, theological certification, particular calendar, conditional violet Rogation Mass or special-rite completeness is implied.",
  records:[],failures:[],summary:null,
};
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  page.setDefaultTimeout(90000);
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:60000});
  // Select from the same production calendar data that controls the reader,
  // not from guessed civil dates or hard-coded feast-name search terms.
  const dates=await page.evaluate(async()=>{
    const resolver=globalThis.AO_RUNTIME_V8.resolver,seen=new Set(),all=[];
    for(const year of [2024,2027]){
      const ready=await resolver.resolveDay(year+"-01-01");
      if(ready?.status!=="ready")throw Error("Cannot initialize calendar source for "+year);
      const {cal}=await resolver.calendarEngine.getCalendar(year);
      const candidates=[...cal.entries()].map(([date,day])=>{
        const m=day.celebration?.[0];
        const month=Number(date.slice(5,7));
        return {date,year,month,id:m?.id||null,path:m?.path||null,rank:m?.rank||4,
          commemorations:day.commemoration?.length||0,sunday:new Date(date+"T12:00:00Z").getUTCDay()===0};
      }).filter(x=>x.path&&/^(Tempora|Sancti|Commune)\//.test(x.path)
        &&!/^tempora:Quad6-5/.test(x.id||"")); // Good Friday is no Mass.
      // Prefer principal I/II/III-class feasts and Sunday formularies, plus
      // evidenced commemorations; keep every liturgical month represented.
      const points=x=>(x.rank===1?100:x.rank===2?70:x.rank===3?45:15)
        +(x.sunday?12:0)+Math.min(x.commemorations,3)*8;
      candidates.sort((a,b)=>points(b)-points(a)||a.date.localeCompare(b.date));
      const selected=[];
      const accept=x=>{
        if(!x||seen.has(x.path)||selected.some(z=>z.date===x.date))return false;
        selected.push(x);seen.add(x.path);return true;
      };
      // Month coverage first; then explicitly include class III and IV
      // source paths. Ranking only by solemnity would select 99 high-rank
      // Masses and overlook the far larger ordinary Sanctorale/Common.
      for(let month=1;month<=12;month++){
        for(const x of candidates){if(x.month===month&&accept(x))break;}
      }
      const perClassTargets=new Map([[4,8],[3,18],[2,15],[1,9]]);
      for(const [rank,target] of perClassTargets){
        for(const x of candidates){
          if(selected.filter(z=>z.rank===rank).length>=target)break;
          if(x.rank===rank)accept(x);
        }
      }
      for(const x of candidates){if(selected.length>=50)break;accept(x);}
      if(selected.length!==50)throw Error("Unable to select 50 independent source IDs for "+year+" (found "+selected.length+")");
      all.push(...selected.sort((a,b)=>a.date.localeCompare(b.date)));
    }
    return all;
  });
  assert.equal(dates.length,100);
  assert.equal(new Set(dates.map(x=>x.path)).size,100,"Sampling reused a Proper instead of auditing distinct IDs");
  assert.deepEqual([2024,2027].map(y=>dates.filter(x=>x.year===y).length),[50,50]);
  for(const year of [2024,2027])assert.equal(
    new Set(dates.filter(x=>x.year===year).map(x=>x.month)).size,12,
    year+": sampling lost a liturgical month");
  // The legacy sample found exactly ten path-owned bilingual gaps. Preserve
  // its deterministic 100-identity selection, but let CI scrutinize those ten
  // quickly without downloading every source in routine feature PRs.
  const focusPaths=new Set(["Sancti/02-22","Sancti/01-15","Sancti/05-25",
    "Sancti/02-06","Tempora/Quad3-3","Tempora/Quad5-4","Tempora/Quad1-4",
    "Commune/C10c","Commune/C10Pasc","Commune/C10t"]);
  const cases=FOCUSED_GAPS?dates.filter(row=>focusPaths.has(row.path)):dates;
  if(FOCUSED_GAPS){
    assert.deepEqual(new Set(cases.map(x=>x.path)),focusPaths,"Focused audit lost a registered source identity");
  }
  const chunks=[];
  for(let n=0;n<cases.length;n+=5)chunks.push(cases.slice(n,n+5));
  for(const chunk of chunks){
    const records=await page.evaluate(async ({list,focused})=>{
      const resolver=globalThis.AO_RUNTIME_V8.resolver;
      return Promise.all(list.map(async item=>{
        try{
          const r=await resolver.resolveDay(item.date);
          const p=r?.proper?.data||{};
          const prayed=[];
          const record=(section,v)=>{
            if(!v||!["lat","en","fr"].some(lang=>String(v[lang]||"").trim()))return;
            prayed.push({section,lat:String(v.lat||""),en:String(v.en||""),fr:String(v.fr||"")});
          };
          for(const key of ["introit","epistle","gradual","sequence","gospel","offertory","preface","communion"])record(key,p[key]);
          for(const [key,prefix] of [["collects","Collect"],["secrets","Secret"],["postcommunions","Postcommunion"]])
            (p[key]||[]).forEach((prayer,i)=>record(prefix+" "+(i+1),prayer));
          for(const [i,lesson] of (p.preparatoryLessons||[]).entries()){
            record("Preparatory "+(i+1)+" lesson",lesson.lesson);
            record("Preparatory "+(i+1)+" chant",lesson.gradual);
            record("Preparatory "+(i+1)+" collect",lesson.collect);
          }
          const latinExpected=prayed.filter(x=>x.lat.trim());
          const missing=Object.fromEntries(["lat","en","fr"].map(lang=>[lang,
            latinExpected.filter(x=>!x[lang].trim()).map(x=>x.section)]));
          // Blank translations and *visible* unresolved source tokens are
          // different categories. Keep the blank-only historical metric intact,
          // but compare the engine's post-composition readiness against both.
          const incompleteByIntegrity=Object.fromEntries(["en","fr"].map(lang=>[lang,
            latinExpected.filter(x=>!x[lang].trim() ||
              /\$[A-Za-z][A-Za-z -]*|\bN\.(?=\s|$)/.test(x[lang]))
              .map(x=>x.section)]));
          const suspicious=[];
          for(const x of prayed)for(const lang of ["lat","en","fr"]){
            const hit=x[lang].match(/(^|\W)N\.(?=\s|,|;|$)|@[A-Za-z]+\/|\$(?:Per Dominum|Qui tecum)/i);
            if(hit){
              const match=hit[0].trim(),kind=/^\$/.test(match)?"unexpanded_conclusion"
                :match.includes("@")?"unresolved_source_reference":"name_placeholder";
              suspicious.push({section:x.section,lang,kind,matched:match,excerpt:x[lang].slice(0,100)});
            }
          }
          const hardSections={
            introit:p.introit,epistle:p.epistle,gospel:p.gospel,offertory:p.offertory,communion:p.communion,
            collect:p.collects?.[0],secret:p.secrets?.[0],postcommunion:p.postcommunions?.[0],
          };
          const missingLatinCore=Object.entries(hardSections).filter(([,v])=>!String(v?.lat||"").trim()).map(([key])=>key);
          const expectedSourceURL=p.sourcePath?
            "https://raw.githubusercontent.com/mmolenda/missalemeum/"+p.sourceRevisions?.missaleMeum+
            "/backend/resources/divinum-officium-local/web/www/missa/Latin/"+p.sourcePath+".txt":null;
          const actualSourceRequests=(r?.diagnostic?.requestedFiles||[]).filter(u=>
            /(?:missalemeum|DivinumOfficium)/i.test(u)&&u.includes("/missa/")).slice(0,25);
          return {...item,identity:r?.day?.main?.id||null,status:r?.status||"missing",properStatus:r?.proper?.status||"missing",
            error:r?.error||r?.proper?.error||null,resolvedPath:p.sourcePath||null,
            languageCoverage:p.languageCoverage||null,ownComputedMissing:missing,
            ownComposedIncomplete:incompleteByIntegrity,
            missingLatinCore,sectionCount:prayed.length,sectionNames:prayed.map(x=>x.section),
            commemorations:(r?.day?.commemorations||[]).map(x=>({id:x.id,path:x.path||null})),
            prayerCounts:{collects:p.collects?.length||0,secrets:p.secrets?.length||0,
              postcommunions:p.postcommunions?.length||0},
            composedCommemorations:(p.calendarCommemorations||[]).map(x=>({path:x.path,
              prayerSourcePath:x.prayerSourcePath,inseparable:!!x.inseparable,underOneConclusion:!!x.underOneConclusion})),
            sourceVersions:p.sourceRevisions||null,pinnedLatinSourceURL:expectedSourceURL,
            sourceRequests:actualSourceRequests,suspicious,
            ...(focused&&["Sancti/01-15","Commune/C10c","Commune/C10Pasc","Commune/C10t","Sancti/02-06","Tempora/Quad3-3","Tempora/Quad5-4","Tempora/Quad1-4"].includes(p.sourcePath)?{
              trace:await Promise.all(["la","en","fr"].map(async language=>{
                const properResolver=resolver.properResolver;
                const diagnostic={requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],
                  structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]};
                const sections=["Oratio","Lectio","Graduale","Evangelium","Offertorium","Communio"];
                try{
                  const root=await properResolver.loadLocalRoot(p.sourcePath,language,diagnostic);
                  const built=await properResolver.resolveSource(p.sourcePath,language,diagnostic);
                  const donorPath=/^Commune\/C10/.test(p.sourcePath)?"Commune/C11":"Commune/C5";
                  const coronatio=await properResolver.loadUpstreamParsed(donorPath,language,diagnostic);
                  return {language,rootSections:Object.fromEntries(sections.map(k=>[k,(root.map.get(k)||[]).slice(0,2)])),
                    finalLengths:Object.fromEntries(sections.map(k=>[k,(built.map.get(k)||[]).join(" ").length])),
                    donorLengths:Object.fromEntries(sections.map(k=>[k,(coronatio.map.get(k)||[]).join(" ").length])),
                    references:diagnostic.referencesResolved.filter(v=>sections.some(k=>v.from.includes(":"+k))).slice(0,25),
                    warnings:diagnostic.warnings.slice(0,12),donorPath,
                    rootKeys:root.order.filter(x=>x==="Oratio"||x==="Communio"),sourceRequests:diagnostic.requestedFiles.filter(x=>x.includes("Commune/")).slice(0,20)};
                }catch(e){return {language,error:String(e?.message||e),warnings:diagnostic.warnings};}
              })),
            }:{}),
            ...(focused?{
              detailedMissing:prayed.filter(section=>
                section.lat.trim()&&(!section.en.trim()||!section.fr.trim())).map(section=>({
                  section:section.section,latinStart:section.lat.slice(0,140),
                  englishStart:section.en.slice(0,140),frenchStart:section.fr.slice(0,140)
                })),
              orationGroups:Object.fromEntries(["collects","secrets","postcommunions"].map(key=>
                [key,(p[key]||[]).map((v,index)=>({
                  index,latStart:String(v?.lat||"").slice(0,140),
                  enLength:String(v?.en||"").length,frLength:String(v?.fr||"").length,
                  sourceOwner:index===0?p.sourcePath:
                    (p.calendarCommemorations||[]).filter(x=>!x.inseparable)[index-1]?.prayerSourcePath??null
                }))])),
              integrity:p.composedSourceIntegrity,
            }:{}),
            };
        }catch(error){return {...item,status:"exception",properStatus:"failed",error:String(error?.message||error)};}
      }));
    },{list:chunk,focused:FOCUSED_GAPS});
    output.records.push(...records);
    console.log("PROPER_100_PROGRESS "+output.records.length+"/100");
  }
  assert.equal(output.records.length,FOCUSED_GAPS?focusPaths.size:100);
  const records=output.records;
  output.failures=records.filter(x=>x.status!=="ready"||x.properStatus!=="ready"||!x.resolvedPath)
    .map(x=>({date:x.date,id:x.id,path:x.path,stage:"source load",error:x.error||x.properStatus}));
  const coverageMismatch=records.filter(x=>
    ["en","fr"].some(lang=>{
      const old=x.languageCoverage?.[lang],actual=x.ownComposedIncomplete?.[lang]||[];
      const expected=x.sectionNames?.length||0;
      return old&&old.missing?.length!==actual.length && expected>0;
    })).map(x=>({date:x.date,path:x.resolvedPath,engine:x.languageCoverage,actual:x.ownComputedMissing}));
  output.summary={
    selected:records.length,selectedByYear:[2024,2027].map(year=>({year,count:records.filter(x=>x.year===year).length})),
    distinctSourcePaths:new Set(records.map(x=>x.resolvedPath).filter(Boolean)).size,
    uniqueRankCounts:Object.fromEntries([1,2,3,4].map(rank=>[rank,records.filter(x=>x.rank===rank).length])),
    withCommemorations:records.filter(x=>x.commemorations?.length).length,
    allThreeOrations:records.filter(x=>["collects","secrets","postcommunions"].every(k=>x.prayerCounts?.[k]>0)).length,
    missingLatinCore:records.filter(x=>x.missingLatinCore?.length).map(x=>({date:x.date,path:x.resolvedPath,fields:x.missingLatinCore})),
    missingLanguageSlots:Object.fromEntries(["en","fr"].map(lang=>[lang,
      records.flatMap(x=>(x.ownComputedMissing?.[lang]||[]).map(section=>({date:x.date,path:x.resolvedPath,section})))])),
    inheritedCoverageMismatch:coverageMismatch,
    unresolvedSourcePointers:records.flatMap(x=>(x.suspicious||[]).map(s=>({date:x.date,path:x.resolvedPath,...s}))),
    unresolvedPointerTypes:Object.fromEntries(["unexpanded_conclusion","unresolved_source_reference","name_placeholder"].map(kind=>
      [kind,records.flatMap(x=>x.suspicious||[]).filter(x=>x.kind===kind).length])),
    failures:output.failures.length,
    note:"Source integrity and bilingual text coverage measured from actual produced sections; no independent full-text collation against a 1962 typical edition.",
  };
  if(FOCUSED_GAPS)console.log("PROPER_SOURCE_FOCUS_DETAILS "+JSON.stringify(records.map(r=>({
    date:r.date,path:r.resolvedPath,missing:r.ownComputedMissing,owners:r.composedCommemorations,
    detailedMissing:r.detailedMissing,orationGroups:r.orationGroups,trace:r.trace,
    unresolved:r.integrity?.unresolved?.slice(0,10),coverage:r.languageCoverage
  }))));
  console.log("PROPER_100_SUMMARY "+JSON.stringify({...output.summary,
    missingLatinCore:output.summary.missingLatinCore.length,
    missingLanguageSlots:Object.fromEntries(["en","fr"].map(x=>[x,output.summary.missingLanguageSlots[x].length])),
    inheritedCoverageMismatch:coverageMismatch.length,
    unresolvedSourcePointers:output.summary.unresolvedSourcePointers.length}));
}finally{
  await mkdir(resolve(root,"artifacts"),{recursive:true});
  await writeFile(dest,JSON.stringify(output,null,2)+"\n");
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
console.log("Source-integrity artifact: "+dest);
if(output.failures.length)process.exitCode=2;
if(output.records.length!==(FOCUSED_GAPS?10:100))process.exitCode=3;
// These two canonical Propers had 12 missing vernacular slots in the
// original 100-case corpus. EN/FR must both survive the pinned donor path.
// Every named source in the 2026-10-10 integrity register must now have
// EN and FR for all Latin-bearing sections. No blank row may count as complete.
for(const path of ["Sancti/02-22","Sancti/05-25","Sancti/01-15",
  "Commune/C10c","Commune/C10Pasc","Commune/C10t","Sancti/02-06",
  "Tempora/Quad3-3","Tempora/Quad5-4","Tempora/Quad1-4"]){
  const entry=output.records.find(row=>row.resolvedPath===path);
  if(!entry || ["en","fr"].some(lang=>entry.ownComputedMissing?.[lang]?.length)){
    console.error("PROPER_BILINGUAL_SOURCE_UNRESOLVED",path,entry?.ownComputedMissing);
    process.exitCode=6;
  }
}
// Production cannot advertise translated Proper completeness while composed
// prayers or readings still contain a placeholder, and source directives may
// never be displayed as completed liturgical conclusions.
if(output.summary?.inheritedCoverageMismatch?.length)process.exitCode=4;
if(output.summary?.unresolvedPointerTypes?.unexpanded_conclusion)process.exitCode=5;
if(!FOCUSED_GAPS && output.summary?.unresolvedPointerTypes?.name_placeholder){
  console.error("PROPER_100_UNRESOLVED_SAINT_NAMES",output.summary.unresolvedPointerTypes.name_placeholder);
  process.exitCode=7;
}
