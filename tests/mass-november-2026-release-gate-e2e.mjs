// P0 pre-release probe for the REAL 2026 All Saints and All Souls Masses.
// Use the existing production resolver / native R17 Proper mapper. This test
// deliberately fails when the three distinct All Souls Masses are not actually
// selectable and source-complete; historical metadata is not a release proof.
// Authorities: Missal 1960 rubrics §§399, 402–404 and Ritus servandus XIII–XIV.
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
  const {resolve1962AllSoulsAdditionalProper}=await import("/src/mass/1962-all-souls-source.js");
  const firstPreface=souls?.proper?.data?.preface??null;
  const firstPrefaceEvidence={keys:Object.keys(firstPreface??{}),
    lat:String(firstPreface?.lat??"").slice(0,100),
    la:String(firstPreface?.la??"").slice(0,100),
    en:String(firstPreface?.en??"").slice(0,100),
    fr:String(firstPreface?.fr??"").slice(0,100)};
  const candidates=[souls.proper?.data,
   ...(Array.isArray(souls.proper?.alternatives)?souls.proper.alternatives:[]),
   ...(Array.isArray(souls.proper?.data?.alternatives)?souls.proper.data.alternatives:[]),
   ...(Array.isArray(souls.alternativeMasses)?souls.alternativeMasses:[])];
   const additionalErrors=[];
   for(const massNumber of [2,3]){
     try{
       const explicit=await resolve1962AllSoulsAdditionalProper({
         calendarResolution:souls,
         properResolver:globalThis.AO_RUNTIME_V8.resolver.properResolver,
         massNumber
       });
       candidates.push(explicit.data);
     }catch(error){
       additionalErrors.push({massNumber,reason:String(error?.message??error)});
     }
   }
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
  const req=globalThis.AO_RUNTIME_V8?.resolver?.properResolver;
  const selectors=globalThis.AO_CELEBRATION_API??{};
  const rawSources=[];
  for(const owner of ["Sancti/11-02m1","Sancti/11-02m2","Sancti/11-02m3"]){
   const langs=[];
   for(const language of ["la","en","fr"]){
    try{
     const raw=await req.resolveSource(owner,language,{
      requestedFiles:[],cacheHits:[],referencesResolved:[],
      languageGaps:[],structuralInheritances:[],legacyCommonRecoveries:[],
      warnings:[],errors:[]
     });
     const sections=raw?.sections??raw?.data?.sections??raw?.rawSections??raw?.map??null;
     langs.push({language,status:"RETURNED",type:typeof raw,
      keys:Object.keys(raw??{}).slice(0,18),
      sectionKeys:sections instanceof Map?[...sections.keys()].slice(0,25):
       sections&&typeof sections==="object"?Object.keys(sections).slice(0,25):null,
      sourceOrder:Array.isArray(raw?.order)?raw.order.slice(0,20):null,
      valueType:typeof raw?.text,
      sample:String(raw?.text??"").slice(0,85)});
    }catch(error){
     langs.push({language,status:"ERROR",message:String(error?.message??error).slice(0,180)});
    }
   }
   rawSources.push({sourcePath:owner,languages:langs});
  }
  const discovery={resolverKeys:Object.keys(req??{}).slice(0,40),
   celebrationApiKeys:Object.keys(selectors).slice(0,35),
   selectionSignature:typeof selectors.select==="function"?
    Function.prototype.toString.call(selectors.select).slice(0,850):null,
   massFlowOptions:[...document.querySelectorAll("[data-ao-requiem],[data-ao-celebration]")]
    .slice(0,22).map(node=>({requiem:node.dataset.aoRequiem??null,
     celebration:node.dataset.aoCelebration??null,
     title:String(node.textContent??"").trim().slice(0,70)})),
   rawSources};
  const requiem={overlays:["REQUIEM"]};
  const ordinary={overlays:[]};
  return {
   saints:{...extract(saint),forms:saintForms},
   souls:{...extract(souls),resolvedFormularies:resolved,additionalErrors,firstPrefaceEvidence,discovery},
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
 const chooser=await page.evaluate(async()=>{
  const api=globalThis.AO_CELEBRATION_API;
  const snapshot=()=>[...document.querySelectorAll(
    "[data-ao-requiem],[data-ao-celebration],[data-ao-open]")]
    .slice(0,50).map(el=>({id:el.dataset.aoRequiem??null,
      celebration:el.dataset.aoCelebration??null,open:el.dataset.aoOpen??null,
      title:String(el.textContent??"").trim().slice(0,100)}));
  const result={opening:null,initial:[],requiem:[],hostMass:null};
  try{
   api.openChangeMass?.();
   await new Promise(done=>setTimeout(done,350));
   result.initial=snapshot();
   const category=document.querySelector('[data-ao-open="requiem"]');
   if(category){
    category.click();
    await new Promise(done=>setTimeout(done,450));
   }
   result.requiem=snapshot();
   const selected=api.getResolvedMass?.();
   result.hostMass={date:selected?.date,celebration:selected?.celebrationId,
     type:selected?.celebrationType,source:selected?.proper?.data?.sourcePath??null};
  }catch(e){result.opening=String(e?.message??e)}
  return result;
 });
 evaluated.souls.discovery.hostChooser=chooser;
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
    check(/Dies\s+ir[aæe]/i.test(v.sequenceText),
     `NOV02_FIRST_${language}_DIES_IRAE_NOT_IN_SOURCE_READER`);
  }
 }
 check((b.additionalErrors??[]).length===0,
  "NOV02_ADDITIONAL_SOURCE_BUILD_ERRORS:"+JSON.stringify(b.additionalErrors));
 const massUi=await (async()=>{
   const out={cases:[],error:null,available:false};
   try{
     const changed=await page.evaluate(async()=>await globalThis.AO_CALENDAR_WEEK_CACHE_V4345.revealDate(
       "2026-11-02",{forceLoader:false,prefetch:false}));
     if(changed!==true)throw Error("NOV02_NATIVE_DATE_CHANGE_FAILED");
     await page.waitForFunction(()=>{
       const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
       return s?.selectedDate==="2026-11-02"&&
         s?.resolution?.date==="2026-11-02"&&!s.resolving;
     },null,{timeout:60000});
     await page.evaluate(()=>globalThis.AO_CELEBRATION_API?.openPreflight?.());
     await page.waitForSelector("[data-ao-full-mass-preflight]",{timeout:30000});
     out.host=await page.evaluate(()=>{
       const mass=globalThis.AO_CELEBRATION_API?.getResolvedMass?.();
       const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
       const inspect=x=>({sourcePath:x?.sourcePath??x?.data?.sourcePath??null,status:x?.status??null,
         keys:Object.keys(x??{}).slice(0,15)});
       return {massDate:mass?.date,massKeys:Object.keys(mass??{}).slice(0,50),
         celebrationId:mass?.celebrationId,requestedCelebrationId:mass?.requestedCelebrationId,
         celebrationType:mass?.celebrationType,calendarDay:mass?.calendarDay,
         proper:inspect(mass?.proper),properSource:mass?.properSource,
         selectedDate:state?.selectedDate,resolutionDate:state?.resolution?.date,
         dayMain:state?.resolution?.day?.main,
         resolvedProper:inspect(state?.resolution?.proper),
         preflight:globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight,
       };
     });
     const container=page.locator("[data-ao-all-souls-choices]");
     out.available=await container.count()===1&&
       await container.evaluate(el=>!el.hidden);
     if(!out.available)throw Error("NOV02_NATIVE_FORMULARY_UI_NOT_VISIBLE");
     // The live M1 presentation uses choice rows, not the hidden legacy
     // wizard tabs. Go through the actual visible Mass/Reader controls while
     // retaining all six source-to-reader readiness assertions below.
     const m1=await page.locator('[data-m1-choice="mass"]').count()===1;
     if(m1)await page.locator('[data-m1-choice="mass"]').click();
     else await page.locator('[data-folio-goto="celebration"]').first().click();
     for(const massNumber of [1,2,3]){
       const input=container.locator('[data-ao-all-souls-mass][value="'+massNumber+'"]');
       await input.check();
       for(const mode of ["MISSAL","LIVE"]){
         if(m1){
           const back=page.locator('[data-folio-overview-button]');
           if(await back.isVisible())await back.click();
           await page.locator('[data-m1-choice="reader"]').click();
         }else await page.locator('.aoMassFolioStepNav [data-folio-goto="reader"]').click();
         await page.locator('[data-full-mass-reader-mode][value="'+mode+'"]').check();
         const output=await page.evaluate(async()=>{
           const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
           const mass=prepared?.session?.resolvedMass;
           return {sourcePath:mass?.proper?.data?.sourcePath??mass?.proper?.sourcePath??null,
             overlays:mass?.overlays??[],mode:prepared?.readerPreferences?.mode??null,
             massReady:prepared?.session?.plan?.kind??null,
             sourceProof:mass?.proper?.data?.allSoulsSourceProof??null};
         });
         out.cases.push({massNumber,requestedMode:mode,...output});
       }
       if(massNumber!==3){
         if(m1)await page.locator('[data-m1-choice="mass"]').click();
         else await page.locator('.aoMassFolioStepNav [data-folio-goto="celebration"]').click();
       }
     }
     // Ritus XIV is a separate, explicitly observed SAME-PRIEST
     // circumstance; the choice of Mass II alone proves none of it.
     if(m1)await page.locator('[data-m1-choice="mass"]').click();
     else await page.locator('.aoMassFolioStepNav [data-folio-goto="celebration"]').click();
     await container.locator('[data-ao-all-souls-mass][value="2"]').check();
     const successionDetails=container.locator("[data-ao-all-souls-succession-details]");
     if(await successionDetails.evaluate(el=>el.open))
       throw Error("NOV02_OPTIONAL_CELEBRANT_CONTROLS_NOT_COLLAPSED");
     await successionDetails.locator("summary").click();
     await container.locator('[data-ao-all-souls-succession="previous"]').selectOption("IMMEDIATE");
     await container.locator('[data-ao-all-souls-succession="next"]').selectOption("INTERRUPTED_LT3");
     out.succession=await page.evaluate(async()=>{
       const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
       const decision=prepared?.session?.resolvedMass?.provenance?.allSoulsSuccession;
       const {ritusXIVRubricsForCue}=await import("/src/mass/1962-all-souls-consecutive-rites.js");
       return {decision,
         offertory:ritusXIVRubricsForCue(decision,"AO.SM.C0112","fr"),
         purification:ritusXIVRubricsForCue(decision,"AO.SM.C0247","en"),
         nextPurification:ritusXIVRubricsForCue(decision,"AO.SM.C0248","en"),
       };
     });
     await page.setViewportSize({width:390,height:844});
     out.mobileDisplay=await page.evaluate(async()=>{
       const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
       const decision=prepared?.session?.resolvedMass?.provenance?.allSoulsSuccession;
       const {createReaderDomAdapter}=await import("/src/mass/reader-dom.js");
       const {with1962RitusXIVParagraphRubrics}=await import("/src/mass/1962-all-souls-consecutive-rites.js");
       const root=document.createElement("div");
       root.dataset.aoNovemberRitusXivRendererTest="true";
       document.body.append(root);
       const adapter=createReaderDomAdapter({root,allowPresentationModeSwitch:false});
       const checks=[];
       try{
         const sourceRows=[
           {id:"AO.SM.C0112",kind:"TEXT",
             primary:"Deus, qui humánæ substántiæ dignitátem",
             sourceCueIds:["AO.SM.C0112"]},
           {id:"AO.SM.C0247",kind:"TEXT",
             primary:"Quod ore súmpsimus, Dómine, pura mente capiámus",
             sourceCueIds:["AO.SM.C0247"]},
           {id:"AO.SM.C0248",kind:"TEXT",
             primary:"Corpus tuum, Dómine, quod sumpsi",
             sourceCueIds:["AO.SM.C0248"]},
         ];
         for(const mode of ["MISSAL","LIVE"]){
           adapter.mount({...prepared,readerPreferences:{...prepared.readerPreferences,mode}});
           adapter.renderMoment({
             id:"AO.CARD.026",sectionTitle:"Ablutions",cardTitle:"Ablutions",
             cardUpdate:true,paragraphs:with1962RitusXIVParagraphRubrics(
               sourceRows,decision,{language:"fr"}),
           });
           const rows=[...root.querySelectorAll("[data-rubric-id]")].map(el=>({
             id:el.dataset.rubricId,text:el.textContent.trim(),
             cue:el.dataset.sourceCueId,
             width:el.getBoundingClientRect().width,
           })).filter(x=>x.id.startsWith("AO.RITUS.XIV."));
           const paragraphNotes=[...root.querySelectorAll(".ao-reader-paragraph")].map(el=>({
             cue:el.dataset.cueId??null,
             text:el.querySelector(".ao-canon-inline-rubrics")?.textContent?.trim()??"",
           })).filter(x=>x.text);
           checks.push({mode,modeApplied:adapter.getMode(),
             rubrics:rows,paragraphNotes,
             selectedCueRoot:root.querySelectorAll(".ao-reader-paragraph").length});
         }
       }finally{adapter.destroy();root.remove()}
       return {viewport:390,checks};
     });

   }catch(error){out.error=String(error?.message??error)}
   return out;
 })();
 // Verify the Home-to-Folio handoff that the two independent selector
 // acceptance tests do not cover: Home may already select Mass II or III.
 const crossSelections=[];
 for(const originalNumber of [2,3]){
   await page.evaluate(async number=>{
     const rt=globalThis.AO_RUNTIME_V8,date="2026-11-02";
     rt.resolver.formularies.set(date,number-1);
     await rt.controller.home.resolve(date);
     globalThis.AO_CELEBRATION_API.openPreflight();
     // Fresh Home-to-Mass entry resets only the presentation. The selected
     // source Proper, form and R17 checkpoint remain untouched.
     globalThis.AO_R17_BROWSER_ENTRY.resetPreflightView();
   },originalNumber);
   await page.waitForFunction(number=>{
     const st=globalThis.AO_RUNTIME_V8?.store?.getState?.();
     const form=document.querySelector("[data-ao-all-souls-choices]");
     return st?.resolution?.day?.main?.id==="sancti:11-02m"+number+":1:b"&&
       form&&!form.hidden&&Boolean(form.querySelector(
       '[data-ao-all-souls-mass][value="'+number+'"]')?.checked);
   },originalNumber,{timeout:45000});
   // A Home-to-Folio jump opens a fresh preflight. The advanced Ritus XIV
   // circumstance is intentionally collapsed on that new screen.
   const succession=page.locator("[data-ao-all-souls-succession-details]");
   if(await succession.evaluate(el=>el.open))
     throw Error("NOV02_HOME_PREFLIGHT_ADVANCED_CONTROLS_NOT_COLLAPSED");
   // The source controls are under the current Mass chooser. They must
   // be visible before asserting or editing the Ritus XIV circumstance.
   const massChoice=page.locator('[data-m1-choice="mass"]');
   if(await massChoice.isVisible())await massChoice.click();
   else await page.locator('.aoMassFolioStepNav [data-folio-goto="celebration"]').click();
   await succession.locator("summary").click();
   await page.locator('[data-ao-all-souls-succession="previous"]')
     .selectOption("IMMEDIATE");
   const active=await page.evaluate(async number=>{
     const before=globalThis.AO_RUNTIME_V8.store.getState().resolution;
     const prep=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
     return {number,calendarPath:before.day.main.path,
       sourcePath:prep.session.resolvedMass.proper?.data?.sourcePath,
       overlays:prep.session.resolvedMass.overlays,
       decision:prep.session.resolvedMass.provenance?.allSoulsSuccession};
   },originalNumber);
   crossSelections.push(active);
   await page.locator('[data-ao-all-souls-mass][value="1"]').check();
   const override=await page.evaluate(async()=>{
     const state=globalThis.AO_RUNTIME_V8.store.getState();
     const prepared=await globalThis.AO_R17_BROWSER_ENTRY.prepare();
     return {homeSource:state.resolution.proper.data.sourcePath,
       selectedSource:prepared.session.resolvedMass.proper?.data?.sourcePath,
       overlays:prepared.session.resolvedMass.overlays};
   });
   crossSelections.push({number:1,from:originalNumber,...override});
 }
 record.allSouls.crossHomeToFolio=crossSelections;
 for(const row of crossSelections){
   if(row.number>1){
     check(row.calendarPath==="Sancti/11-02m"+row.number,
       "NOV02_HOME_ORIGINAL_FORMULARY_CHANGED:"+row.number);
     check(row.sourcePath==="Sancti/11-02m"+row.number,
       "NOV02_HOME_TO_FOLIO_SOURCE_MISMATCH:"+row.number);
     check(row.decision?.massNumber===row.number&&
       row.decision?.previous==="IMMEDIATE",
       "NOV02_HOME_TO_FOLIO_RITUS_XIV_MISSING:"+row.number);
     check(row.overlays.includes("REQUIEM"),
       "NOV02_HOME_TO_FOLIO_REQUIEM_MISSING:"+row.number);
   }else{
     check(row.homeSource==="Sancti/11-02m"+row.from &&
       row.selectedSource==="Sancti/11-02m1"&&
       row.overlays.includes("REQUIEM"),
       "NOV02_FOLIO_OVERRIDE_DID_NOT_PRESERVE_HOME_OR_REQUIEM:"+row.from);
   }
 }
 record.allSouls.ui=massUi;
 check(massUi.error===null,"NOV02_NATIVE_UI_OR_PREPARE:"+massUi.error);
 check(massUi.available,"NOV02_NATIVE_THREE_FORMULARY_CONTROL_MISSING");
 for(const row of massUi.cases){
   check(row.sourcePath==="Sancti/11-02m"+row.massNumber,
    "NOV02_NATIVE_PREPARED_WRONG_FORMULARY:"+row.massNumber+":"+row.sourcePath);
   check(row.overlays.includes("REQUIEM"),"NOV02_NATIVE_PREPARED_REQUIEM_RITE_MISSING:"+row.massNumber);
   check(row.mode===row.requestedMode,"NOV02_NATIVE_READER_MODE_NOT_APPLIED:"+row.massNumber+":"+row.requestedMode);
   if(row.massNumber>1)
     check(row.sourceProof?.status==="SOURCE_VERIFIED",
       "NOV02_NATIVE_ALTERNATE_SOURCE_PROOF_MISSING:"+row.massNumber);
 }
 check(massUi.cases.length===6,"NOV02_NATIVE_SIX_FORMULARY_MODE_COMBINATIONS_INCOMPLETE");
 check(massUi.succession?.decision?.contextualStatus==="EXPLICIT_CIRCUMSTANCES" &&
   massUi.succession?.decision?.massNumber===2,
   "NOV02_RITUS_XIV_PREPARED_PROVENANCE_MISSING");
 check(massUi.succession?.offertory?.length===1 &&
       massUi.succession?.purification?.length===1 &&
       massUi.succession?.nextPurification?.length===0,
   "NOV02_RITUS_XIV_EXPLICIT_CONDITIONAL_CUES_NOT_MATCHED");
 check(massUi.mobileDisplay?.checks?.length===2 &&
   massUi.mobileDisplay.checks.every(row=>{
     if(row.modeApplied!==row.mode||row.selectedCueRoot!==3)return false;
     const displayed=row.rubrics;
     return displayed.length===2 &&
       displayed.some(x=>x.cue==="AO.SM.C0112" && /épître/i.test(x.text)) &&
       displayed.some(x=>x.cue==="AO.SM.C0247" && /eau seulement/i.test(x.text)) &&
       !displayed.some(x=>x.cue==="AO.SM.C0248") &&
       row.paragraphNotes.length===0;
   }),
   "NOV02_RITUS_XIV_MOBILE_NATIVE_RENDERER_ALL_MODES_NOT_VERIFIED");
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