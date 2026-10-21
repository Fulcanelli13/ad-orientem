// Focused *production resolver* witness. Unlike synthetic adapter tests,
// these values come from the existing app, not a guessed Saints/Commune path.
// Research-only; never changes Mass selection or touches an active session.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 const results=await page.evaluate(async dates=>{
  const source=globalThis.AO_RUNTIME_V8?.resolver;
  const reports=[];
  for(const date of dates){
   try{
    const r=await source.resolveDay(date);
    const d=r?.day??{},p=r?.proper?.data??{},comm=d.commemorations??[];
    let linkProbes=null;
    if(date==="2026-10-09"){
      try{
        const {inspectP1InternalMissalLink}=await import("/src/calendar/p1-internal-missal-link-resolution.js");
        const anchors=(await (await fetch("/data/calendar/p1-internal-missal-navigation.v1.json")).json()).exampleInternalAnchors;
        linkProbes=anchors.map(anchor=>{
          const result=inspectP1InternalMissalLink({anchor,calendarResolution:r,proper:r.proper,language:"en"});
          return {anchorId:anchor.anchorId,status:result.status,reason:result.reason??null,
            sourcePath:result.sourcePath??null,readerParagraphId:result.readerParagraphId??null,
            route:result.route,readOnly:result.readOnly};
        });
      }catch(e){linkProbes=[{importOrProjectionError:String(e?.message??e)}];}
    }

    reports.push({
      linkProbes,
      date,status:r?.status??null,dayDate:r?.date??null,
      principal:{id:d.main?.id??null,path:d.main?.path??null,rank:d.main?.rank??null,title:d.main?.title??null},
      proper:{status:r?.proper?.status??null,path:p.sourcePath??r?.proper?.sourcePath??null,
        orationGroups:Object.fromEntries(["collects","secrets","postcommunions"].map(k=>[k,
          (p[k]??[]).map((x,i)=>({index:i+1,sourcePath:x?.sourcePath??null,
           latinPresent:Boolean(x?.lat??x?.la),englishPresent:Boolean(x?.en),frenchPresent:Boolean(x?.fr)}))])),
        calendarCommemorations:(p.calendarCommemorations??[]).map(x=>
         ({id:x?.id??null,path:x?.path??null,prayerSourcePath:x?.prayerSourcePath??null})),
        appliedCommemorations:(p.appliedCommemorations??[]).map(x=>({id:x?.id??null,path:x?.path??null})),
        formDecision:{status:p.commemorationFormDecision?.status??null,
          source:p.commemorationFormDecision?.source??null,
          reason:p.commemorationFormDecision?.reason??null}},
      calendarCommemorations:(Array.isArray(comm)?comm:[comm]).map(x=>typeof x==="string"?
        {value:x,id:null,path:null}:{id:x?.id??null,path:x?.path??null,title:x?.title??x?.name??null}),
    });
   }catch(e){reports.push({date,error:String(e?.message??e)})}
  }
  return reports;
 },["2026-10-09","2027-10-09","2026-10-15","2026-10-03","2026-09-23"]);

 const commons=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const paths=["Commune/C4","Commune/C4-1","Commune/C4a","Commune/C5","Commune/C5-1","Commune/C5a","Commune/C5b"];
   const languages=["la","en","fr"];
   const slots=["Introitus","Oratio","Lectio","Evangelium","Secreta","Communio","Postcommunio"];
   const diagnostic=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   if(typeof resolver?.resolveSource!=="function")return {error:"APP_PROPER_RESOLVER_SOURCE_API_ABSENT",paths:[]};
   const summary=[];
   for(const sourcePath of paths){
     const languageProof={};
     for(const language of languages){
       try{
         const parsed=await resolver.resolveSource(sourcePath,language,diagnostic());
         const bySection={};
         for(const section of slots){
           const rows=parsed?.map?.get?.(section);
           const useful=Array.isArray(rows)?rows.filter(row=>typeof row==="string"&&row.trim()&&!row.startsWith("@")):[];
           bySection[section]={present:useful.length>0,
             rowCount:Array.isArray(rows)?rows.length:0,
             incipit:useful[0]?.replace(/\\s+/g," ").slice(0,100)??null};
         }
         languageProof[language]={status:"RESOLVED",bySection};
       }catch(e){languageProof[language]={status:"ERROR",reason:String(e?.message??e).slice(0,150)}}
     }
     summary.push({sourcePath,languageProof});
   }
   return {paths:summary};
 });
 const doctorInheritance=await page.evaluate(async()=>{
  const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
  const {reconcileP1NonPontiffDoctorSources}=await import("/src/calendar/p1-doctor-common-inheritance.js");
  const diagnostic=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
  const target={},shared={};
  for(const lang of ["la","en","fr"]){
    target[lang]=await resolver.resolveSource("Commune/C5a",lang,diagnostic());
    shared[lang]=await resolver.resolveSource("Commune/C4a",lang,diagnostic());
  }
  const result=reconcileP1NonPontiffDoctorSources({target,shared});
  return {status:result.status,reason:result.reason??null,section:result.section??null,
    sourcePath:result.sourcePath,sharedSourcePath:result.sourceOwner,
    borrowedSections:result.borrowedSections.map(x=>x.language+":"+x.section),
    nonPontiffOrationsPreserved:result.nonPontiffOrationsPreserved===true,
    allSharedSections:["Introitus","Oratio","Lectio","Graduale","GradualeP","Tractus","Evangelium","Offertorium","Communio"],
    collectLatinRows:{target:(target.la?.map?.get("Oratio")??[]).map(x=>String(x).slice(0,450)),shared:(shared.la?.map?.get("Oratio")??[]).map(x=>String(x).slice(0,450))},
    latinSharedDiagnostics:["Introitus","Oratio","Lectio","Graduale","GradualeP","Tractus","Evangelium","Offertorium","Communio"].map(section=>{
      const a=target.la?.map?.get(section)??[],b=shared.la?.map?.get(section)??[];
      const norm=rows=>rows.join("\\n").normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/[^A-Za-z0-9]+/g," ").trim().toLowerCase();
      const na=norm(a),nb=norm(b);let prefix=0;
      while(prefix<na.length&&prefix<nb.length&&na[prefix]===nb[prefix])prefix++;
      return {section,targetRows:a.length,donorRows:b.length,targetLength:na.length,donorLength:nb.length,
        equality:na===nb,firstMismatch:prefix,
        targetAtMismatch:na.slice(Math.max(0,prefix-45),prefix+115),
        donorAtMismatch:nb.slice(Math.max(0,prefix-45),prefix+115),
        targetLast:String(a[a.length-1]??"").slice(-100),donorLast:String(b[b.length-1]??"").slice(-100)};
    }),
    variantLatinDistinct:["Secreta","Postcommunio"].map(section=>{
      const v=target.la?.map?.get?.(section),b=shared.la?.map?.get?.(section);
      return {section,different:JSON.stringify(v)!==JSON.stringify(b),
        nonPontiffExists:Array.isArray(v)&&v.length>0};
    }),
    approvedForMass:result.approvedForMass??false,
    route:result.route??null};
 });
 console.log("P1_DOCTOR_INHERITANCE_LIVE_WITNESS="+JSON.stringify({
   status:doctorInheritance.status,reason:doctorInheritance.reason,
   borrowedSections:doctorInheritance.borrowedSections,
   nonPontiffOrationsPreserved:doctorInheritance.nonPontiffOrationsPreserved,
   variantLatinDistinct:doctorInheritance.variantLatinDistinct,
 }));
 assert.equal(doctorInheritance.status,"SOURCE_COMPOSITION_VERIFIED",doctorInheritance.reason+" "+doctorInheritance.section);
 assert.equal(doctorInheritance.borrowedSections.length,18);
 assert.equal(doctorInheritance.nonPontiffOrationsPreserved,true);
 assert.ok(doctorInheritance.variantLatinDistinct.every(x=>x.different&&x.nonPontiffExists));
 assert.equal(doctorInheritance.approvedForMass,false);
 assert.equal(doctorInheritance.route,null);
 const additionalCommons=process.env.P1_FULL_COMMON_SOURCE_AUDIT==="1" ? await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const registry=(await (await fetch("/data/calendar/p1-additional-common-candidates.v1.json")).json()).provisionalRows;
   const slots=["Introitus","Oratio","Lectio","Graduale","Evangelium","Offertorium","Secreta","Communio","Postcommunio"];
   const diag=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   const inspect=async row=>{
     const languageProof={};
     for(const lang of ["la","en","fr"]){
       try{
         const parsed=await resolver.resolveSource(row.candidateCanonicalSourcePath,lang,diag());
         const sections=Object.fromEntries(slots.map(section=>{
           const raw=parsed?.map?.get(section);
           const usable=Array.isArray(raw)&&raw.some(v=>
             typeof v==="string"&&v.trim()&&!String(v).trim().startsWith("@"));
           return [section,Boolean(usable)];
         }));
         languageProof[lang]={status:"RESOLVED",sections};
       }catch(e){languageProof[lang]={status:"ERROR",reason:String(e?.message??e).slice(0,130)}}
     }
     return {researchId:row.researchId,sourcePath:row.candidateCanonicalSourcePath,languageProof};
   };
   const results=[];
   for(let i=0;i<registry.length;i+=5)results.push(...await Promise.all(registry.slice(i,i+5).map(inspect)));
   return {candidateCount:registry.length,results};
 }) : null;
 const donorProbe=process.env.P1_FULL_DONOR_AUDIT==="1" ? await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const plan=(await (await fetch("/data/calendar/p1-partial-common-donor-plan.v1.json")).json()).cases;
   const existing=(await (await fetch("/data/calendar/p1-additional-common-app-audit.v1.json")).json()).sourceEntries;
   const audited=new Map(existing.map(x=>[x.sourcePath,x]));
   const options=["la","en","fr"],core=["Introitus","Oratio","Lectio","Graduale","Evangelium","Offertorium","Secreta","Communio","Postcommunio"];
   const normalized=lines=>String((lines??[]).join("\\n")).normalize("NFD")
      .replace(/[\\u0300-\\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
      .replace(/[^A-Za-z0-9]+/g," ").trim().toLowerCase();
   const present=lines=>Array.isArray(lines)&&lines.some(s=>typeof s==="string"&&s.trim()&&!s.trim().startsWith("@"));
   const diag=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   const memo=new Map();
   const load=async(path,lang)=>{
     const k=path+"|"+lang;
     if(memo.has(k))return memo.get(k);
     let value=null;
     try{value=(await resolver.resolveSource(path,lang,diag()))?.map??null}catch{}
     memo.set(k,value);
     return value;
   };
   const reports=[];
   for(const testcase of plan){
     const missing=audited.get(testcase.target)?.byLanguage??{};
     const checks=[];
     for(const donor of testcase.donors){
       for(const lang of options){
         const d=await load(donor,lang);
         const t=await load(testcase.target,lang);
         const lt=await load(testcase.target,"la");
         const ld=await load(donor,"la");
         for(const section of (missing[lang]?.missingSections??core)){
           const donorLines=d?.get(section),latinTarget=lt?.get(section),latinDonor=ld?.get(section);
           checks.push({donor,language:lang,section,donorPresent:present(donorLines),
             targetLatinPresent:present(latinTarget),
             donorLatinPresent:present(latinDonor),
             latinEqual:present(latinTarget)&&present(latinDonor)&&normalized(latinTarget)===normalized(latinDonor),
             targetLatinLength:normalized(latinTarget).length,donorLatinLength:normalized(latinDonor).length,
             donorLatinBeginning:normalized(latinDonor).slice(0,48),
             targetLatinBeginning:normalized(latinTarget).slice(0,48)});
         }
       }
     }
     reports.push({target:testcase.target,kind:testcase.kind,checks});
   }
   return reports;
 }) : null;
 const paschalAlternate=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const {composeP1OneMartyrPaschalAltera}=await import("/src/calendar/p1-paschal-alternate-source-composition.js");
   const diagnostic=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   const load=async path=>{
     const result={};
     for(const lang of ["la","en","fr"])result[lang]=await resolver.resolveSource(path,lang,diagnostic());
     return result;
   };
   const target=await load("Commune/C2ap"),base=await load("Commune/C2p"),orations=await load("Commune/C2a");
   const result=composeP1OneMartyrPaschalAltera({target,base,orations});
   return {status:result.status,reason:result.reason??null,section:result.section??null,
     sourcePath:result.sourcePath,baseSourcePath:result.baseSourcePath??null,
     alternativeOrationsSourcePath:result.alternativeOrationsSourcePath??null,
     borrowedSections:result.borrowedSections.map(x=>x.language+":"+x.section+":"+x.owner),
     completeByLanguage:result.composition?Object.fromEntries(["la","en","fr"].map(lang=>
       [lang,["Introitus","Oratio","Lectio","Graduale","Evangelium","Offertorium","Secreta","Communio","Postcommunio"].every(
        section=>Array.isArray(result.composition[lang].map.get(section)) &&
        result.composition[lang].map.get(section).length>0)])):null,
     historicalSourceOnly:true,approvedForMass:result.approvedForMass??false,
     route:result.route??null};
 });
 const partialReconciliation=await page.evaluate(async()=>{
   const {reconcileP1PartialCommon}=await import("/src/calendar/p1-partial-common-source-reconciliation.js");
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const diagnostic=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   const memo=new Map();
   const get=async path=>{
     if(memo.has(path))return memo.get(path);
     const result={};
     for(const language of ["la","en","fr"])
       result[language]=await resolver.resolveSource(path,language,diagnostic());
     memo.set(path,result);return result;
   };
   const requests=[
     {targetPath:"Commune/C3ap",basePath:"Commune/C3p",orationPath:"Commune/C3a"},
     {targetPath:"Commune/C7",basePath:"Commune/C6-1",lessonPath:"Commune/C6"},
   ];
   const reports=[];
   for(const request of requests){
     const value=reconcileP1PartialCommon({
       targetPath:request.targetPath,
       target:await get(request.targetPath),
       base:await get(request.basePath),
       orations:request.orationPath?await get(request.orationPath):undefined,
       lessonSource:request.lessonPath?await get(request.lessonPath):undefined,
     });
     reports.push({
       targetPath:request.targetPath,
       status:value.status,reason:value.reason??null,section:value.section??null,
       borrowedSections:value.borrowedSections.map(x=>x.language+":"+x.section+":"+x.from),
       missingByLanguage:value.missingByLanguage??null,
       route:value.route,authorizedForSaintMass:value.authorizedForSaintMass
     });
   }
   return reports;
 });
 const apostleVigilOrations=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const diag=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   const rows={};
   for(const language of ["la","en","fr"]){
     const s=await resolver.resolveSource("Commune/C1v",language,diag());
     rows[language]={};
     for(const section of ["Oratio","Oratio 1 loco","Oratio 2 loco","Oratio pro Evangelistae"]){
       const v=s?.map?.get(section);
       rows[language][section]={present:Array.isArray(v)&&v.some(t=>typeof t==="string"&&t.trim()&&!t.trim().startsWith("@")),
         totalRows:Array.isArray(v)?v.length:0,
         firstRow:(Array.isArray(v)?v.find(t=>typeof t==="string"&&t.trim()):null)?.slice(0,165)??null};
     }
   }
   const normalise=value=>String((value??[]).join(" "))
      .normalize("NFD").replace(/[\\u0300-\\u036f]/g,"")
      .replace(/[^A-Za-z0-9]+/g," ").toLowerCase().trim();
   const variantTexts={};
   for(const language of ["la","en","fr"]){
     const src=await resolver.resolveSource("Commune/C1v",language,diag());
     variantTexts[language]={
       first:normalise(src?.map?.get("Oratio 1 loco")),
       second:normalise(src?.map?.get("Oratio 2 loco"))
     };
   }
   return {source:"Commune/C1v",sourceRows:rows,
     variantParity:{
       latinDifferent:variantTexts.la.first!==variantTexts.la.second,
       englishDuplicated:variantTexts.en.first===variantTexts.en.second,
       frenchDifferent:variantTexts.fr.first!==variantTexts.fr.second
     }};

 });
 const papalCommonOwnerProbe=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
   const diag=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
   const langs=["la","en","fr"];
   const sections=["Introitus","Oratio","Lectio","Graduale","Evangelium","Offertorium","Secreta","Communio","Postcommunio"];
   const canonical=x=>String((x??[]).join("\\n")).normalize("NFD")
     .replace(/[\\u0300-\\u036f]/g,"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
     .replace(/[^A-Za-z0-9]+/g," ").toLowerCase().trim();
   const present=x=>Array.isArray(x)&&x.some(v=>typeof v==="string"&&v.trim()&&!v.trim().startsWith("@"));
   const get=async path=>{
     const out={};
     for(const lang of langs)out[lang]=(await resolver.resolveSource(path,lang,diag()))?.map;
     return out;
   };
   const base=await get("Commune/C4b");
   const out=[];
   for(const path of ["Commune/C2b","Commune/C3b"]){
     const target=await get(path),rows=[];
     for(const lang of langs)for(const section of sections){
       const own=target[lang]?.get(section),shared=base[lang]?.get(section);
       rows.push({lang,section,targetPresent:present(own),donorPresent:present(shared),
         latinEqual:present(target.la?.get(section))&&present(base.la?.get(section))&&
           canonical(target.la.get(section))===canonical(base.la.get(section)),
         targetLatinHead:canonical(target.la?.get(section)).slice(0,90),
         donorLatinHead:canonical(base.la?.get(section)).slice(0,90)});
     }
     out.push({path,donor:"Commune/C4b",rows});
   }
   return out;
 });
 const papalComposition=await page.evaluate(async()=>{
  const resolver=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
  const {composeP1PapalMartyrSource}=await import("/src/calendar/p1-papal-martyr-source-composition.js");
  const diag=()=>({requestedFiles:[],cacheHits:[],referencesResolved:[],languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],warnings:[],errors:[]});
  const get=async path=>{
   const result={};
   for(const lang of ["la","en","fr"])result[lang]=await resolver.resolveSource(path,lang,diag());
   return result;
  };
  const shared=await get("Commune/C4b");
  const out=[];
  for(const path of ["Commune/C2b","Commune/C3b"]){
   const r=composeP1PapalMartyrSource({targetPath:path,target:await get(path),donor:shared});
   out.push({path,status:r.status,reason:r.reason??null,section:r.section??null,
    borrowedSections:r.borrowedSections.map(x=>x.language+":"+x.section),
    variantCollectRetained:r.variantCollectRetained??false,latinParity:r.latinSectionParityCount??0,
    sourcePath:r.sourcePath??null,donorSourcePath:r.donorSourcePath??null,
    route:r.route,approvedForMass:r.approvedForMass});
  }
  return out;
 });
 console.log("P1_PAPAL_MARTYR_SOURCE_COMPOSITION="+JSON.stringify(papalComposition));
 assert.equal(papalComposition.length,2);
 assert.ok(papalComposition.every(x=>x.status==="SOURCE_COMPOSITION_VERIFIED"&&
   x.variantCollectRetained&&x.latinParity===8&&x.borrowedSections.length===16&&
   x.route===null&&x.approvedForMass===false));
 console.log("P1_PAPAL_COMMON_SOURCE_OWNERS="+JSON.stringify(papalCommonOwnerProbe));
 console.log("P1_C1V_ALT_ORATION_OWNERSHIP="+JSON.stringify(apostleVigilOrations));
 assert.deepEqual(apostleVigilOrations.variantParity,
   {latinDifferent:true,englishDuplicated:true,frenchDifferent:true},
   "Confirm actual C1v source mismatch in production and keep editor hold");
 console.log("P1_PARTIAL_COMMON_COMPOSITION_WITNESS="+JSON.stringify(partialReconciliation));
 assert.equal(partialReconciliation.length,2);
 assert.deepEqual(partialReconciliation.map(x=>x.status),
   ["PARTIAL_SOURCE_RECOVERY_VERIFIED","SOURCE_COMPOSITION_COMPLETE"]);
 assert.ok(partialReconciliation.every(x=>x.route===null&&x.authorizedForSaintMass===false));
 const c3ap=partialReconciliation.find(x=>x.targetPath==="Commune/C3ap");
 const c7=partialReconciliation.find(x=>x.targetPath==="Commune/C7");
 assert.equal(c3ap.borrowedSections.length,18);
 assert.deepEqual(c3ap.missingByLanguage,{la:[],en:[],
  fr:["Introitus","Lectio","Graduale","Evangelium","Offertorium","Communio"]});
 assert.equal(c7.borrowedSections.length,10);
 assert.deepEqual(c7.missingByLanguage,{la:[],en:[],fr:[]});
 assert.equal(c7.borrowedSections.filter(x=>x.includes(":Lectio:Commune/C6")).length,3,
   "Only the explicitly inherited C6, not alternate C6-1, can own the Lesson");
 console.log("P1_PASCHAL_ALTERA_LIVE_WITNESS="+JSON.stringify(paschalAlternate));
 assert.equal(paschalAlternate.status,"SOURCE_COMPOSITION_VERIFIED",paschalAlternate.reason+" / "+paschalAlternate.section);
 assert.deepEqual(paschalAlternate.completeByLanguage,{la:true,en:true,fr:true});
 assert.equal(paschalAlternate.baseSourcePath,"Commune/C2p");
 assert.equal(paschalAlternate.alternativeOrationsSourcePath,"Commune/C2a");
 assert.equal(paschalAlternate.borrowedSections.length,23);
 assert.equal(paschalAlternate.approvedForMass,false);
 assert.equal(paschalAlternate.route,null);
 if(donorProbe)console.log("P1_PARTIAL_COMMON_DONOR_LIVE_WITNESS="+JSON.stringify(donorProbe));
 if(additionalCommons){
   console.log("P1_ADDITIONAL_COMMONS_LIVE_WITNESS="+JSON.stringify(additionalCommons));
   assert.equal(additionalCommons.candidateCount,28);
   assert.equal(additionalCommons.results.length,28);
 }
 console.log("P1_REAL_COMMONS_SOURCE_WITNESS="+JSON.stringify(commons));
 console.log("P1_REAL_SOURCE_WITNESS="+JSON.stringify(results));
 const october=results[0];
 assert.equal(october.date,"2026-10-09");
 assert.equal(october.status,"ready","October 9 canonical resolver must be ready");
 assert.equal(october.dayDate,"2026-10-09");
 assert.ok(october.principal?.id?.startsWith("sancti:10-09:"),"The original day must remain traditional 1962");
 assert.ok(october.principal?.path&&october.proper?.path,"Source path discovery cannot be declared on title alone");
 assert.equal(october.linkProbes?.length,6,"Every registered historical Missal prayer must be resolvable");
 assert.ok(october.linkProbes.every(p=>p.status==="SOURCE_READY_ROUTER_NOT_IMPLEMENTED"&&
  p.route===null&&p.readOnly===true), "The six real prayer targets must be exact, read-only and unrouted");
 assert.deepEqual(october.linkProbes.map(p=>p.readerParagraphId),
  ["COLLECT_SET.1","SECRET_SET.1","POSTCOMMUNION_SET.1",
   "COLLECT_SET.2","SECRET_SET.2","POSTCOMMUNION_SET.2"]);
 assert.deepEqual(october.proper.calendarCommemorations.map(c=>c.path),["Sancti/10-09t"]);
 assert.deepEqual(october.calendarCommemorations.map(c=>c.id),["sancti:10-09t:4:r"]);

 console.log("P1 resolver live source identity PASS; witness is observation only, not an authorized alternative saint Mass.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
