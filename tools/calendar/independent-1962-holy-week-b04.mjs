// B04: 1962 Holy Week external-rubric crosswalk against real native readers.
// This tests source owners, chronological boundary and conditional branch
// structure. It is NOT full diplomatic or facsimile proof of every Latin word.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {buildPalmPayload} from "../../src/mass/reader-palm.js";
import {buildHolyThursdayPostPayload} from "../../src/mass/reader-holy-thursday-post.js";
import {buildGoodFridayReader} from "../../src/mass/reader-good-friday.js";
import {buildEasterVigilReader} from "../../src/mass/reader-easter-vigil.js";
import {compileMassPlan,makeResolvedMass} from "../../src/mass/session-engine.js";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const load=async x=>JSON.parse(await readFile(resolve(root,x),"utf8"));
const ledger=await load("data/mass/independent-1962-holy-week-b04.v1.json");
const core=await load("data/mass/special-days-core.v1.1.json");
const extension=await load("data/mass/special-days-extension.v1.3.json");
const palm=await load("data/presentation/reader-palm.v1.json");
const ht=await load("data/presentation/reader-holy-thursday-post.v1.json");
const gf=await load("data/presentation/reader-good-friday.v1.json");
const ev=await load("data/presentation/reader-easter-vigil.v1.json");
const prophecy=await load("data/presentation/reader-easter-vigil-prophecies.v1.json");
const scripture=await load("data/mass/distinct-rite-scripture-order.v1.json");
const strict=process.argv.includes("--strict");
assert.equal(ledger.rites.length,4);
assert.equal(ledger.datedChecks.length,3);
const report={schema:"AO_1962_HOLY_WEEK_B04_RUNTIME_CROSSWALK",
 edition:"1962_RESTORED_HOLY_WEEK_NOT_PRE_1955",
 evidenceClass:ledger.evidenceClass,criticalTextStatus:ledger.criticalTextStatus,
 checks:[],dates:[],sourceObservations:0,summary:{}};
const add=(rite,claim,ok,details)=>report.checks.push({rite,claim,passed:!!ok,details:details??null});
const fold=s=>String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
  .replace(/æ/gi,"ae").replace(/œ/gi,"oe").toLowerCase().replace(/j/g,"i")
  .replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ");
const within=(ids,subset)=>{
 let cursor=0;
 for(const id of ids)if(id===subset[cursor])cursor++;
 return cursor===subset.length;
};
const byId=id=>ledger.rites.find(z=>z.id===id);
function checkGraph(key,graph,payloadBuilder){
 const row=byId(key);
 add(key,"exact-1962-native-graph-size",graph?.length===row.recordCount,
   {expected:row.recordCount,actual:graph?.length,source:row.authority});
 add(key,"source-matched-ritual-state-order",within(graph?.map(z=>z.id)||[],row.graphOrder),
   {expectedOrdered:row.graphOrder,source:row.authority});
 add(key,"no-duplicated-ritual-state-ids",new Set(graph?.map(z=>z.id)).size===graph?.length);
 try{
   const b=payloadBuilder();add(key,"native-reader-build-without-legacy-fallback",!!b);
   return b;
 }catch(e){add(key,"native-reader-build-without-legacy-fallback",false,String(e));return null;}
}
const palmBuilt=checkGraph("PALM_1962",extension.graphs.PALM,()=>buildPalmPayload({graph:extension.graphs.PALM,payload:palm}));
add("PALM_1962","separate-preprocession-Gospel-Matthew-21",/Matt(h)?ew 21:1|Matt 21:1/i.test(
  extension.graphs.PALM.find(x=>x.id==="PALM-GSP-020")?.source_locator||""));
for(const proof of byId("PALM_1962").latinIncipits){
 const source=String(palm.texts[proof.field]||"");
 add("PALM_1962","sourced-Latin-incipit-"+proof.field,fold(source).includes(fold(proof.incipit)),
   {incipit:proof.incipit,source:byId("PALM_1962").additional});
}
add("PALM_1962","Palm-rite-seven-reader-cards",palmBuilt?.cards?.length===7);
add("PALM_1962","Palm-procession-native-Mass-handoff",palmBuilt?.cards?.at(-1)?.handoff==="INTROIT"&&palmBuilt.cards.at(-1).ordinaryOpeningSuppressed===true&&palmBuilt.cards.at(-1).normalLastGospel===false);
const palmMass=compileMassPlan(makeResolvedMass({date:"2027-03-21",form:"MISSA_CANTATA_INCENSE",
 presentationMode:"MISSAL",calendarCelebration:{id:"palm-sunday",type:"CALENDAR"},precedingRites:["PALM"]}));
add("PALM_1962","procession-branch-suppresses-foot-prayers",palmMass.massEntry==="INTROIT");
add("PALM_1962","procession-branch-omits-normal-Last-Gospel",palmMass.normalLastGospel===false);
add("PALM_1962","procession-stays-distinct-from-ordinary-Mass",palmMass.precedingGraphs?.includes("PALM")===true);
add("PALM_1962","pre-1955-palm-multiple-collects-not-imported",palmBuilt?.cards?.[0]?.paragraphs?.length===7);

const holyBuilt=checkGraph("HOLY_THURSDAY_1962",extension.graphs.HT_POST,
 ()=>buildHolyThursdayPostPayload({graph:extension.graphs.HT_POST,payload:ht}));
add("HOLY_THURSDAY_1962","Pange-Lingua-stanzas-then-Tantum-Ergo",ht.pangeLingua.length===4&&ht.tantumErgo.length===2);
add("HOLY_THURSDAY_1962","stripping-Psalm-21-is-not-summary",ht.stripping.psalm21Pian.length>=10&&ht.stripping.psalm21Pian.join(" ").length>2500);
add("HOLY_THURSDAY_1962","stripping-follows-translation",within(extension.graphs.HT_POST.map(x=>x.id),["HT-TRN-010","HT-STRIP-010","HT-POST-900"]));
add("HOLY_THURSDAY_1962","reader-six-cards-with-no-universal-stripping-posture",
 holyBuilt?.cards?.length===6&&holyBuilt.cards[4].posture==="LOCAL_OR_INHERIT");
const htPlan=compileMassPlan(makeResolvedMass({date:"2027-03-25",form:"MISSA_CANTATA_INCENSE",presentationMode:"SIMPLE",
 calendarCelebration:{id:"holy-thursday",type:"CALENDAR"},followingActions:["HOLY_THURSDAY_POST"]}));
add("HOLY_THURSDAY_1962","post-Mass-reposition-is-explicit-following-action",
 htPlan.followingGraphs?.includes("HOLY_THURSDAY_POST")===true&&htPlan.lifecycle?.followingAction?.active===true);
add("HOLY_THURSDAY_1962","no-final-blessing-or-Last-Gospel",htPlan.blessingAllowed===false&&htPlan.normalLastGospel===false);

const gfBuilt=checkGraph("GOOD_FRIDAY_1962",core.graphs.GF,
 ()=>buildGoodFridayReader({graph:core.graphs.GF,payload:gf}));
add("GOOD_FRIDAY_1962","separate-Liturgy-of-Passion-not-Mass",
 gfBuilt?.ordinaryMassGraphActive===false&&gfBuilt?.steps.every(x=>x.recordId.startsWith("GF-")));
add("GOOD_FRIDAY_1962","nine-ordered-intercession-intentions",
 gf.solemnPrayers.map(x=>x.key).join("|")===byId("GOOD_FRIDAY_1962").solemnPrayerNames.join("|"));
for(let n=1;n<=9;n++){
 const num=String(n).padStart(2,"0");
 const entries=gfBuilt?.steps||[];
 add("GOOD_FRIDAY_1962","solemn-prayer-"+num+"-kneel-and-rise",
  entries.some(x=>x.recordId==="GF-SOP-"+num+"-K"&&x.posture==="KNEEL")
  &&entries.some(x=>x.recordId==="GF-SOP-"+num+"-R"&&x.posture==="STAND"));
}
const jew=gf.solemnPrayers.find(x=>x.key==="CONVERSION_OF_JEWS")?.variants;
add("GOOD_FRIDAY_1962","default-1962-Jewish-prayer-not-later-2008",
 gfBuilt?.jewishPrayerVariant==="PRINTED_1962"
 &&!!jew?.PRINTED_1962&&!!jew?.HOLY_SEE_2008
 &&!/perfid/i.test(jew.PRINTED_1962.intention+" "+jew.PRINTED_1962.prayer));
add("GOOD_FRIDAY_1962","Passion-complete-pre-and-post-death-text",
 gf.passion.preDeath.length>=20&&gf.passion.postDeath.length>=3
 &&gf.passion.preDeath.join(" ").length>6500&&gf.passion.postDeath.join(" ").length>800);
add("GOOD_FRIDAY_1962","Passion-Death-kneel-pause-then-rise",
 gfBuilt?.steps.find(x=>x.recordId==="GF-PASS-320")?.posture==="KNEEL"
 &&gfBuilt?.steps.find(x=>x.recordId==="GF-PASS-330")?.posture==="STAND");
add("GOOD_FRIDAY_1962","three-Ecce-Lignum-unveilings",
 gf.cross.repetitions===3 && ["GF-X-521","GF-X-522","GF-X-523"].every(id=>gfBuilt?.steps.some(x=>x.recordId===id)));
add("GOOD_FRIDAY_1962","personal-cross-veneration-without-corporate-auto-fallback",
 gfBuilt?.venerationMode==="PERSONAL"&&!gfBuilt.steps.some(x=>x.recordId==="GF-VEN-650"));
const withCommunion=buildGoodFridayReader({graph:core.graphs.GF,payload:gf,willReceiveCommunion:true});
add("GOOD_FRIDAY_1962","faithful-Communion-branch-is-opt-in",
 !gfBuilt?.steps.some(x=>x.recordId==="GF-COM-850")
 &&withCommunion.steps.some(x=>x.recordId==="GF-COM-850"));
add("GOOD_FRIDAY_1962","three-final-prayers-after-Communion",gf.conclusion.length===3);

const evBuilt=checkGraph("EASTER_VIGIL_1962",core.graphs.EV,
 ()=>buildEasterVigilReader({graph:core.graphs.EV,payload:ev}));
add("EASTER_VIGIL_1962","exactly-four-not-twelve-1962-prophecies",
 prophecy.readings.length===4&&evBuilt?.steps.filter(x=>/-READ$/.test(x.recordId)).length===4);
add("EASTER_VIGIL_1962","prophecy-Scripture-identity-and-order",
 prophecy.readings.map(x=>x.reference).join("|")===byId("EASTER_VIGIL_1962").appointedProphecies.join("|"));
add("EASTER_VIGIL_1962","four-complete-Latin-reading-text-bodies",
 prophecy.readings.every(x=>x.latinParagraphs.join(" ").length>=600));
add("EASTER_VIGIL_1962","four-lesson-kneel-rise-rubrics",
 [1,2,3,4].every(n=>{const pre="EV-LESS-"+String(n).padStart(2,"0")+"-";
 const ix=core.graphs.EV.map(x=>x.id);
 return within(ix,[pre+"READ",pre+"OREM",pre+"KNEEL",pre+"RISE"]);}));
add("EASTER_VIGIL_1962","three-ordered-Lumen-Christi-states",
 evBuilt?.steps.filter(x=>/^EV-LUM-1[123]0$/.test(x.recordId)).length===3);
add("EASTER_VIGIL_1962","Exsultet-complete-not-summary",ev.donor.exsultet.lat.length>=3500);
for(const mode of ["NONE","IN_CHURCH","SEPARATE_BAPTISTERY"]){
 const built=buildEasterVigilReader({graph:core.graphs.EV,payload:ev,fontMode:mode,
  baptismPresent:mode==="SEPARATE_BAPTISTERY"});
 const required=mode==="NONE"?"EV-FONT-410":mode==="IN_CHURCH"?"EV-FONT-420":"EV-FONT-440";
 add("EASTER_VIGIL_1962","independently-owned-font-branch-"+mode,built.steps.some(x=>x.recordId===required)&&built.steps.at(-1)?.recordId==="EV-MASS-700");
}
add("EASTER_VIGIL_1962","two-litany-halves-separated-by-font-and-renewal",
 within(core.graphs.EV.map(x=>x.id),["EV-LIT1-400","EV-REN-500","EV-LIT2-600","EV-MASS-700"]));
add("EASTER_VIGIL_1962","Lauds-Benedictus-preserved",ev.donor.lauds.lat.includes("Benedíctus"));

const scriptural=scripture.rites;
add("GOOD_FRIDAY_1962","scriptural-witness-three-canonical-Readings",
 scriptural.find(x=>x.riteId==="GOOD_FRIDAY_1962")?.entries?.map(x=>x.displayReference).join("|")===
 byId("GOOD_FRIDAY_1962").appointedLessons.join("|"));
add("EASTER_VIGIL_1962","scriptural-witness-four-canonical-Readings",
 scriptural.find(x=>x.riteId==="EASTER_VIGIL_1962")?.entries?.map(x=>x.displayReference).join("|")===
 byId("EASTER_VIGIL_1962").appointedProphecies.join("|"));

const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
 const loc=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
 const file=resolve(root,"."+loc);
 if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
 const bytes=await readFile(file);
 res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:45000});
 const slots={palm:"PALM_1962",holyThursday:"HOLY_THURSDAY_1962",
   goodFriday:"GOOD_FRIDAY_1962",easterVigil:"EASTER_VIGIL_1962"};
 for(const row of ledger.datedChecks)for(const [kind,rite] of Object.entries(slots)){
  const date=row[kind];
  const result=await page.evaluate(async date=>{
   const res=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
   const p=res?.proper?.data;
   return {status:res?.status,rank:res?.day?.main?.rank??null,
     mainId:res?.day?.main?.id||null,source:p?.sourcePath||null,
     diagnosticErrors:res?.diagnostic?.errors?.slice(0,3)||[]};
  },date);
  const pass=result.status==="ready"&&result.rank===1;
  report.dates.push({date,kind,rite,expectedClass:1,...result,pass,
    sourceUrl:byId(rite).authority});
  console.log("B04_HOLY_WEEK_DATE "+JSON.stringify({date,rite,...result,pass}));
 }
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
const fail=report.checks.filter(x=>!x.passed);
const dateFail=report.dates.filter(x=>!x.pass);
report.summary={independent1962Contracts:report.checks.length,passed:report.checks.length-fail.length,
 failed:fail.map(x=>({rite:x.rite,claim:x.claim,details:x.details})),
 datedObservations:report.dates.length,datedReadyAndClassI:report.dates.length-dateFail.length,
 datesReviewNeeded:dateFail.map(x=>x.date),
 fullPrintedTextCollation:"NOT CERTIFIED; manuscript/printed-facsimile critical image and all Latin/EN/FR prayer lines remain open",
 excluded:"pre-1955 Palm/Easter Vigil, routine Mass assumptions for Good Friday, unconditional font/veneration branches"};
await mkdir(resolve(root,"artifacts"),{recursive:true});
const out=resolve(root,"artifacts/independent-1962-holy-week-b04.json");
await writeFile(out,JSON.stringify(report,null,2)+"\n");
console.log("B04_HOLY_WEEK_SUMMARY "+JSON.stringify(report.summary));
if(strict&&(fail.length||dateFail.length))process.exitCode=2;
