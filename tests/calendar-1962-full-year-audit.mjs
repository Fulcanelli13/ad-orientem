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
      const {review1962OrdinaryForCalendarDay}=await import("/src/calendar/ordo-1962-ordinary-rule-review.js");
      const {review1962PrefaceForCalendarDay}=await import("/src/calendar/ordo-1962-preface-review.js");
      if(!resolver||typeof resolver.resolveDay!=="function")throw Error("Production day resolver unavailable");
      return Promise.all(ids.map(async date=>{
        try{
          const r=await resolver.resolveDay(date);
          const d=r?.day?.main||{},p=r?.proper?.data||{};
          const ordo=review1962OrdinaryForCalendarDay(r);
          const preface=review1962PrefaceForCalendarDay(r);
          const sourceRule=key=>{
            const decision=ordo[key];
            return {status:decision.status,value:decision.value,
              clause:decision.clause||null,sourceUrl:decision.sourceUrl||null};
          };
          const commRaw=r?.day?.commemorations||d.commemorations||r?.commemorations||[];
          const comms=(Array.isArray(commRaw)?commRaw:[commRaw]).map(x=>
            typeof x==="string"?x:String(x?.title||x?.name||x?.titleFr||x?.id||"")).filter(Boolean);
          return {
            date,status:String(r?.status||""),actualDate:String(r?.date||""),
            mainId:String(d.id||""),title:String(p.name||p.title?.en||d.title||d.name||""),
            provenance:{dayTitle:d.title??null,dayColour:d.color??d.colour??null,properTitle:p.name??p.title?.en??null,properColour:p.color??p.colour??null,colourPlan:r?.colourPlan??null,dayCommemorations:d.commemorations??null,properCommemorations:p.commemorations??null},
            rawRank:p.rank??d.rank??null,rawColour:(/^tempora:Quad6-5r:/.test(String(d.id??""))?r?.colourPlan?.primary:r?.colourPlan?.massColor)??p.color??p.colour??d.color??d.colour??r?.colourPlan?.name??null,
            commemorations:comms,properStatus:String(r?.proper?.status||""),
            properSourcePath:p.sourcePath??r?.proper?.sourcePath??null,
            source1960Preface:{status:r?.preface1960SourceDecision?.status??null,
              selected:r?.preface1960SourceDecision?.selected??null,
              rubric:r?.preface1960SourceDecision?.rubric??null},
            ordoRuleReview:{gloria:sourceRule("gloria"),credo:sourceRule("credo")},
            prefaceReview:{status:preface.status,reason:preface.reason,
              expected:preface.expected,actual:preface.actual,heading:preface.heading,
              clause:preface.clause,basis:preface.basis,sourceUrl:preface.sourceUrl,
              trilingualTextComplete:preface.trilingualTextComplete,
              autoPublish:preface.autoPublish},
            composition:{
              commemorations:(p.calendarCommemorations||[]).map(x=>({name:x.name,path:x.path,prayerSourcePath:x.prayerSourcePath||null,rank:x.rank})),
              collects:(p.collects||[]).length,secrets:(p.secrets||[]).length,
              postcommunions:(p.postcommunions||[]).length,
              nameFr:p.nameFr||null,
            },
            failed:!r||r.status==="failed"||!r.day?.main||r.date!==date,
            failure:String(r?.error||r?.proper?.error||""),
          };
        }catch(error){return {date,failed:true,status:"exception",failure:String(error?.message||error)};}
      }));
    },chunk);
    rows.push(...response);
  }
  // Issue #721: test the *real* pinned resolver across 2024–2029,
  // not only synthetic calendar cards or vernacular matching.
  // The independent rubric oracle below continues to adjudicate rank,
  // colour, feast and commemorations separately.
  const firstSundayAfterEpiphany=year=>{
    const jan7=new Date(Date.UTC(year,0,7));
    jan7.setUTCDate(jan7.getUTCDate()+(7-jan7.getUTCDay())%7);
    return jan7.toISOString().slice(0,10);
  };
  const lastOctoberSunday=year=>{
    const d=new Date(Date.UTC(year,9,31));
    d.setUTCDate(d.getUTCDate()-d.getUTCDay());
    return d.toISOString().slice(0,10);
  };
  const cycleCases=[];
  for(const year of [2024,2025,2026,2027,2028,2029]){
    for(const [date,cycle,reason] of [
      [lastOctoberSunday(year),"temporale","Christ the King"],
      [firstSundayAfterEpiphany(year),"temporale","Holy Family"],
      [year+"-01-06","temporale","Epiphany"],
      [year+"-12-25","temporale","Christmas"],
      [year+"-08-15","sanctorale","Assumption"],
      [year+"-12-08","sanctorale","Immaculate Conception"],
    ])cycleCases.push({date,cycle,reason});
  }
  cycleCases.push(
    {date:"2027-03-25",cycle:"temporale",reason:"Holy Thursday overrides Annunciation"},
    {date:"2027-04-05",cycle:"sanctorale",reason:"transferred Annunciation"},
    {date:"2024-03-25",cycle:"temporale",reason:"Holy Monday overrides Annunciation"},
    {date:"2024-04-08",cycle:"sanctorale",reason:"transferred Annunciation"}
  );
  const cycleEvidence=await page.evaluate(async cases=>{
    const {observedCycle}=await import("/src/calendar/observed-cycle.js");
    const resolver=globalThis.AO_RUNTIME_V8?.resolver;
    return Promise.all(cases.map(async x=>{
      try{
        const r=await resolver.resolveDay(x.date);
        // Changing display-language alias cannot change cycle ownership.
        const alias={...r,day:{...r?.day,main:{...r?.day?.main,title:"Unrelated display alias"}}};
        return {...x,actual:observedCycle(r),alias:observedCycle(alias),id:r?.day?.main?.id||null,failed:r?.status==="failed"||!r?.day?.main};
      }catch(error){return {...x,failed:true,error:String(error)}}
    }));
  },cycleCases);
  for(const x of cycleEvidence){
    assert.ok(!x.failed, "Cannot certify category; day did not resolve "+x.date+": "+JSON.stringify(x));
    assert.equal(x.actual,x.cycle, x.date+" "+x.reason+": "+JSON.stringify(x));
    assert.equal(x.alias,x.cycle, x.date+" "+x.reason+" changes classification when translated");
  }
  // Independent 2024/2027 source identity acceptance: the five historic
  // wrong/missing Calendar display names must be exposed from REAL resolver
  // records, not date-based hardcoding or synthetic testing fixtures.
  const disputedLabelCases=[
    {date:"2024-05-18",id:"tempora:Pasc6-6:1:r",en:"Vigil of Pentecost",fr:"Vigile de la Pentecôte"},
    {date:"2027-05-15",id:"tempora:Pasc6-6:1:r",en:"Vigil of Pentecost",fr:"Vigile de la Pentecôte"},
    {date:"2024-12-02",id:"sancti:12-02:3:r",en:"St Bibiana, Virgin and Martyr",fr:"Sainte Bibiane, vierge et martyre"},
    {date:"2027-12-02",id:"sancti:12-02:3:r",en:"St Bibiana, Virgin and Martyr",fr:"Sainte Bibiane, vierge et martyre"},
    {date:"2027-06-30",id:"sancti:06-30:3:r",en:"Commemoration of St Paul, Apostle",fr:"Commémoraison de saint Paul, apôtre"},
    {date:"2024-06-08",id:"commune:C10t:4:w",en:"Blessed Virgin Mary on Saturday",fr:"Sainte Vierge Marie le samedi"},
    {date:"2027-01-02",id:"commune:C10b:4:w",en:"Blessed Virgin Mary on Saturday",fr:"Sainte Vierge Marie le samedi"},
    {date:"2024-12-14",id:"tempora:Adv2-6:3:v",en:"Saturday after the Second Sunday of Advent",fr:"Samedi après le deuxième dimanche de l’Avent"}
  ];
  const observedLabels=await page.evaluate(async cases=>{
    const {calendarObservanceAlias}=await import("/src/calendar/observance-title.js");
    const resolver=globalThis.AO_RUNTIME_V8?.resolver;
    return Promise.all(cases.map(async entry=>{
      try{
        const resolution=await resolver.resolveDay(entry.date);
        return {date:entry.date,id:resolution?.day?.main?.id||null,
          failed:resolution?.status==="failed"||!resolution?.day?.main,
          en:calendarObservanceAlias(resolution,"en"),
          fr:calendarObservanceAlias(resolution,"fr")};
      }catch(error){return {date:entry.date,failed:true,error:String(error)};}
    }));
  },disputedLabelCases);
  for(const expected of disputedLabelCases){
    const actual=observedLabels.find(x=>x.date===expected.date);
    assert.ok(actual&&!actual.failed,"Archived Calendar title regression did not resolve: "+JSON.stringify(actual||expected));
    assert.equal(actual.id,expected.id,expected.date+" principal source identity drift");
    assert.equal(actual.en,expected.en,expected.date+" English display alias drift");
    assert.equal(actual.fr,expected.fr,expected.date+" French display alias drift");
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
  // Source-first issue #690 acceptance: preserving the displaced day in
  // the ordo must also result in actual second Mass orations; merely adding
  // a Calendar label is not a valid implementation.
  for(const [date,expectedId] of [
    ["2026-11-01",new RegExp("^Tempora/Pent[0-9]+-0")],
    ["2026-11-30",new RegExp("^Tempora/Adv1-1")],
    ["2026-12-08",new RegExp("^Tempora/Adv2-2")],
  ]){
    const row=rows.find(x=>x.date===date);
    assert.ok(!row.failed,date+": day unresolved: "+JSON.stringify(row));
    const c=row?.composition;
    assert.ok(c?.commemorations?.length>0,date+": no source-backed Proper commemoration");
    assert.ok(c.commemorations.some(x=>expectedId.test(x.path||"")),
      date+": original Temporale commemoration path absent");
    if(date.startsWith("2026-1")&&date!=="2026-11-01")
      assert.ok(c.commemorations.some(x=>new RegExp("^Tempora/Adv[12]-0$").test(x.prayerSourcePath||"")),
        date+": the Advent ferial collect/secret/postcommunion must cite the source Sunday");
    for(const key of ["collects","secrets","postcommunions"])
      assert.ok(c[key]>=2,date+": missing distinct Proper "+key+" for privileged commemoration");
  }
  assert.equal(normalizeRank(rows.find(x=>x.date==="2026-12-01")?.rawRank),3,
    "Ordinary Advent feria in early December must remain III class");
  assert.equal(normalizeRank(rows.find(x=>x.date==="2026-12-16")?.rawRank),2,
    "Advent Ember Wednesday must remain II class despite falling before 17 December");
  const vigil=rows.find(x=>x.date==="2026-05-23");
  assert.match(vigil?.title||"",/Vigil of Pentecost/,"Pentecost Vigil title must be canonical, not inherited Saturday title");
  assert.equal(vigil?.composition?.nameFr,"Vigile de la Pentecôte","French vigil label lost");

  const unresolved=rows.filter(x=>x.failed);
  const incomplete=rows.filter(x=>!x.failed&&(!x.title||normalizeRank(x.rawRank)===null||!normalizeColor(x.rawColour)));
  const discrepancies=checks.filter(x=>x.problems.length);
  const summary={
    year:2026,calendar:"GENERAL_ROMAN_1962",productionResolverDates:dates.length,
    resolved:rows.length-unresolved.length,unresolved:unresolved.length,
    missingTitleRankColour:incomplete.length,independentChecks:checks.length,
    independentlyMatched:checks.length-discrepancies.length,independentDiscrepancies:discrepancies.length,
    prefaceReview:{
      ruleAndTextAgree:rows.filter(x=>x.prefaceReview?.status==="RULE_TEXT_AGREE").length,
      sourceConflict:rows.filter(x=>x.prefaceReview?.status==="SOURCE_CONFLICT").length,
      unmapped:rows.filter(x=>x.prefaceReview?.status==="UNMAPPED").length,
      missingOrUnrecognized:rows.filter(x=>["UNCLASSIFIED_TEXT","TRANSLATIONS_INCOMPLETE"].includes(x.prefaceReview?.status)).length,
      specialOrUnavailable:rows.filter(x=>["NOT_MASS","WITHHELD"].includes(x.prefaceReview?.status)).length,
      editoriallyCertified:0,
      source:"RGMR_1960_482_499",
      limitation:"General Roman 1962 selected-day Preface identity and source-heading triage, not verified text or permission to replace Mass source."
    },
    fullYearIndependentlyCertified:false,
    ordoRules:{
      gloriaSupported:rows.filter(x=>x.ordoRuleReview?.gloria?.status==="RULE_SUPPORTED").length,
      credoSupported:rows.filter(x=>x.ordoRuleReview?.credo?.status==="RULE_SUPPORTED").length,
      bothSupported:rows.filter(x=>x.ordoRuleReview?.gloria?.status==="RULE_SUPPORTED"&&
        x.ordoRuleReview?.credo?.status==="RULE_SUPPORTED").length,
      withheldDates:rows.filter(x=>x.ordoRuleReview?.gloria?.status!=="RULE_SUPPORTED"||
        x.ordoRuleReview?.credo?.status!=="RULE_SUPPORTED").length,
      authority:"RGMR_1960_AND_ROMAN_BREVIARY_1960",
      limitation:"General Roman calendar rubric-match only; source-specific Mass selections and particular ordi not certified."
    },
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
  await writeFile(resolve(outputDir,"1962-2026-preface-review.json"),JSON.stringify({
    schema:"AO_1962_PREFACE_REVIEW_365_V1",year:2026,
    authority:"https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html",
    sourceScope:"GENERAL_ROMAN_1962_PRINCIPAL_MASS_ONLY",
    sourceResolverAuditOnly:true,changesReader:false,editorialCertification:false,
    counts:summary.prefaceReview,
    queue:rows.filter(x=>x.prefaceReview?.status!=="RULE_TEXT_AGREE").map(x=>({
      date:x.date,principalId:x.mainId,title:x.title,
      sourcePath:x.properSourcePath||null,rank:x.rawRank,
      ...x.prefaceReview
    })),
    rows:rows.map(x=>({date:x.date,principalId:x.mainId,title:x.title,rank:x.rawRank,
      sourcePath:x.properSourcePath||null,
      ...x.prefaceReview}))
  },null,2)+"\n","utf8");
  // Full 194-case backlog is derived from ACTUAL 2026 principal source rows.
  // The 142-slot Sanctoral witness register was checked separately against
  // original Latin source files. Never turn original rule observations into
  // an editor's approval of a Mass, Preface, translation or local practice.
  const sanctoralScreen=JSON.parse(await readFile(resolve(root,
    "data/research/1962-sanctoral-preface-source-screen-20261027.v1.json"),"utf8"));
  assert.equal(sanctoralScreen.schema,"AO_1962_SANCTORAL_PREFACE_SCREEN_20261027_V1");
  assert.equal(sanctoralScreen.cases?.length,142);
  const uniquePath=new Map(sanctoralScreen.cases.map(x=>[x.canonicalSourcePath,x]));
  assert.equal(uniquePath.size,142,"Source-file screen has duplicate identities");
  const cohorts={
    SANCTORAL_COMMON_FIRST_PASS:[],
    TEMPORAL_FORM_RULE_UNMAPPED:[],
    SATURDAY_BVM_COMMON_UNMAPPED:[],
    GENERIC_FERIA_UNMAPPED:[],
    LATER_OPTIONAL_PREFACE_AUTHORITY:[],
    SOURCE_MATCHED_SEASONAL_FERIA:[],
    SANCTORAL_MARIAN_SOURCE_CONFLICT:[],
    ORIGINAL_COMMON_SANCTORAL_MATCH:[],
  };
  for(const row of rows){
    const id=row.mainId,review=row.prefaceReview,sourcePath=row.properSourcePath;
    let group=null;
    if(review?.status==="RULE_TEXT_AGREE"&&
       /^SOURCE_MATCHED_INHERITED_(?:PASCHAL|ASCENSION)_FERIA$/.test(review.basis??""))
      group="SOURCE_MATCHED_SEASONAL_FERIA";
    else if(review?.status==="RULE_TEXT_AGREE"&&
       /^(?:EXPLICIT_1960_TRANSFIGURATION_COMMON|EXPLICIT_ASSUMPTION_VIGIL_COMMON)$/.test(review.basis??""))
      group="ORIGINAL_COMMON_SANCTORAL_MATCH";
    else if(review?.status==="SOURCE_CONFLICT"&&
       review.basis==="ORIGINAL_MARIAN_PREFATIO_SOURCE_1960")
      group="SANCTORAL_MARIAN_SOURCE_CONFLICT";
    else if(review?.status==="UNMAPPED"){
      if(id.startsWith("sancti:")){
        group=review.actual==="COMMUNIS"?"SANCTORAL_COMMON_FIRST_PASS":
          "LATER_OPTIONAL_PREFACE_AUTHORITY";
      }else if(id.startsWith("tempora:"))group="TEMPORAL_FORM_RULE_UNMAPPED";
      else if(id.startsWith("commune:"))group="SATURDAY_BVM_COMMON_UNMAPPED";
      else if(id===":feria:4:w")group="GENERIC_FERIA_UNMAPPED";
      else throw Error("Unknown unmapped source-family: "+row.date+" "+id);
    }
    if(!group)continue;
    const witness=uniquePath.get(sourcePath);
    cohorts[group].push({
      date:row.date,principalId:id,sourcePath,
      heading:review.heading,observedCategory:review.actual,
      decision:review.status,expected:review.expected,
      ruleClause:review.clause,evidenceUrl:review.sourceUrl,
      independentSourceWitness:witness?{
        originalUrl:witness.upstreamSourceUrl,
        originalPrefatioRuleTokens:witness.upstreamRuleTokens,
        sourceScreenStatus:witness.caseStatus,
        note:witness.reviewNote,
      }:null,
      autoPublish:false,changesReader:false,
    });
  }
  const sizes=Object.fromEntries(Object.entries(cohorts).map(([k,v])=>[k,v.length]));
  assert.deepEqual(sizes,{
    SANCTORAL_COMMON_FIRST_PASS:131,
    TEMPORAL_FORM_RULE_UNMAPPED:19,
    SATURDAY_BVM_COMMON_UNMAPPED:12,
    GENERIC_FERIA_UNMAPPED:10,
    LATER_OPTIONAL_PREFACE_AUTHORITY:2,
    SOURCE_MATCHED_SEASONAL_FERIA:9,
    SANCTORAL_MARIAN_SOURCE_CONFLICT:9,
    ORIGINAL_COMMON_SANCTORAL_MATCH:2,
  },"Bulk source cohorts changed: reconcile before reporting any coverage gain");
  assert.equal(Object.values(sizes).reduce((a,b)=>a+b,0),194,
    "The original 194-case worklist must account for every promotion and still-withheld case");
  const sanctoralReviewed=[...cohorts.SANCTORAL_COMMON_FIRST_PASS,
    ...cohorts.SANCTORAL_MARIAN_SOURCE_CONFLICT,
    ...cohorts.ORIGINAL_COMMON_SANCTORAL_MATCH];
  assert.equal(sanctoralReviewed.length,142);
  for(const x of sanctoralReviewed){
    assert.ok(x.independentSourceWitness,"One of the 142 source identities was never screened: "+x.date);
    assert.ok(x.sourcePath.startsWith("Sancti/"));
  }
  assert.equal(new Set(sanctoralReviewed.map(x=>x.sourcePath)).size,142);
  for(const x of cohorts.SANCTORAL_MARIAN_SOURCE_CONFLICT)
    assert.ok(x.independentSourceWitness.originalPrefatioRuleTokens.some(t=>/^Prefatio=Maria/.test(t)),
      x.date+" promoted without original Marian source witness");
  for(const x of cohorts.ORIGINAL_COMMON_SANCTORAL_MATCH)
    assert.ok(x.independentSourceWitness.originalPrefatioRuleTokens.some(t=>/Prefatio=Communis/.test(t)),
      x.date+" source did not expressly select Common");
  assert.equal(sanctoralScreen.cases.filter(x=>x.upstreamRuleTokens.length).length,11);
  const exactPromotions=["2026-04-15","2026-04-16","2026-04-17","2026-04-20",
    "2026-04-23","2026-05-06","2026-05-08","2026-05-21","2026-05-22"];
  assert.deepEqual(cohorts.SOURCE_MATCHED_SEASONAL_FERIA.map(x=>x.date),
    exactPromotions,"The adopted inherited-seasonal source family changed");
  assert.equal(summary.prefaceReview.unmapped,174);
  assert.equal(summary.prefaceReview.ruleAndTextAgree,130);
  assert.equal(summary.prefaceReview.sourceConflict,59);
  await writeFile(resolve(outputDir,"1962-2026-preface-bulk-triage.json"),JSON.stringify({
    schema:"AO_1962_PREFACE_2026_BULK_TRIAGE_V1",
    year:2026,sourceAuditRun:"Live 1962 shared canonical resolver and independent Preface audit",
    sourceRegister:"data/research/1962-sanctoral-preface-source-screen-20261027.v1.json",
    totalHistoricalUnmappedWorklist:194,
    newlySourceMatchedWithheldFromEditorialApproval:11,
    stillUnmapped:174,
    stillRawSourceConflicts:59,
    independentPrefacesEditoriallyCertified:0,
    groupSizes:sizes,
    sourceScope:"GENERAL_ROMAN_1962",
    automaticTextReplacement:false,automaticPublication:false,
    cohortRows:cohorts,
  },null,2)+"\n","utf8");
  console.log("CALENDAR_1962_PREFACE_BULK_TRIAGE="+JSON.stringify({
    groupSizes:sizes,matchedSeasonalFerias:9,matchedOriginalCommon:2,marianSourceConflicts:9,unmapped:174,
    originalUnmappedWorklist:194,
    originalSanctoralSourcesScreened:142,
    sourcePrefatioDirectivesObserved:11,
    unverifiedSourceSelectionsRemaining:174,
    editoriallyCertified:0,
  }));

  console.log("CALENDAR_1962_YEAR_AUDIT_SUMMARY="+JSON.stringify(summary));
  console.log("CALENDAR_1962_YEAR_AUDIT_TOP_FINDINGS="+JSON.stringify(discrepancies.slice(0,30).map(x=>({date:x.date,problems:x.problems,title:x.actual?.title,rank:x.actual?.rawRank,color:x.actual?.rawColour}))));
  assert.equal(rows.length,365,"Production resolver sweep must cover every day of 2026");
  // Full year *screening* does not confer independent certification, but
  // it must not misreport the living 2026 IV feria as a votive Mass.
  const oct26=rows.find(x=>x.date==="2026-10-26");
  assert.equal(oct26.mainId,":feria:4:w","Live general Roman feria identity changed");
  assert.equal(oct26.ordoRuleReview.gloria.value,false);
  assert.equal(oct26.ordoRuleReview.credo.value,false);
  const prefaceDays=new Map([
    ["2026-01-06","RULE_TEXT_AGREE"],
    ["2026-02-02","RULE_TEXT_AGREE"],
    ["2026-04-05","RULE_TEXT_AGREE"],
    ["2026-05-24","SOURCE_CONFLICT"],
    ["2026-06-07","RULE_TEXT_AGREE"],
    ["2026-06-14","RULE_TEXT_AGREE"],
    ["2026-10-07","SOURCE_CONFLICT"],
    ["2026-10-11","RULE_TEXT_AGREE"],
    ["2026-12-08","SOURCE_CONFLICT"]
  ]);
  for(const [date,status] of prefaceDays){
    const row=rows.find(x=>x.date===date);
    assert.equal(row?.prefaceReview?.status,status,
      date+" 1962 Preface rule should detect the real source heading without reader recovery");
  }
  // Regression: the already merged shared Mass source fix must remain
  // effective in the actual 2026 Calendar resolver, not merely the R17
  // reader. Compare against original 1960 source-rule credentials.
  for(const [date,principal,sourcePath] of [
    ["2026-06-07","tempora:Pent02-0r:2:g","Tempora/Pent02-0r"],
    ["2026-06-14","tempora:Pent03-0r:2:g","Tempora/Pent03-0r"]
  ]){
    const row=rows.find(x=>x.date===date);
    assert.equal(row?.mainId,principal,date+": protected 1962 Sunday changed");
    assert.equal(row?.properSourcePath,sourcePath,date+": underlying source changed");
    assert.equal(row?.source1960Preface?.status,"SOURCE_VERIFIED",
      date+": expected actual production Prefatio1960 override was not installed");
    assert.equal(row?.source1960Preface?.selected,"Trinitate");
    assert.equal(row?.source1960Preface?.rubric,"RGMR_494_B");
    assert.equal(row?.prefaceReview?.status,"RULE_TEXT_AGREE",
      date+": the Calendar audit does not see the repaired source");
    assert.match(row?.prefaceReview?.heading??"",/^de sanctissima Trinitate/i);
  }
  assert.equal(summary.prefaceReview.ruleAndTextAgree+summary.prefaceReview.sourceConflict+
    summary.prefaceReview.unmapped+summary.prefaceReview.missingOrUnrecognized+
    summary.prefaceReview.specialOrUnavailable,365,
    "All 365 days must receive exactly one audited Preface status");
  const rosary=rows.find(x=>x.date==="2026-10-07");
  assert.equal(rosary.ordoRuleReview.gloria.value,true);
  assert.equal(rosary.ordoRuleReview.credo.value,true);
  assert.ok(summary.ordoRules.bothSupported>60,"Ordo bulk rubric review unexpectedly lost coverage");
  assert.equal(new Set(rows.map(x=>x.date)).size,365,"Production resolver sweep must not repeat dates");
  if(process.env.AO_CALENDAR_AUDIT_STRICT==="1")
    assert.equal(unresolved.length+incomplete.length+discrepancies.length,0,"Full-year source audit has unresolved/discrepant data");
}finally{
  await browser?.close();
  await new Promise(ok=>server.close(ok));
}
