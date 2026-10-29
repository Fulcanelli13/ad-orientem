import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {writeFile,mkdir} from "node:fs/promises";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildGoodFridayReader,createGoodFridayReaderController} from "../src/mass/reader-good-friday.js";
import {buildEasterVigilReader,createEasterVigilReaderController} from "../src/mass/reader-easter-vigil.js";
import {buildCorpusChristiProcessionPayload,createCorpusChristiProcessionReaderController} from "../src/mass/reader-corpus-christi.js";
import {buildRequiemAbsolutionPayload,createRequiemAbsolutionReaderController} from "../src/mass/reader-requiem-absolution.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const load=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const core=load("data/mass/special-days-core.v1.1.json");
const ext=load("data/mass/special-days-extension.v1.3.json");
const GF=load("data/presentation/reader-good-friday.v1.json");
const EV=load("data/presentation/reader-easter-vigil.v1.json");
const CORPUS=load("data/presentation/reader-corpus-christi.v1.json");
const ABS=load("data/presentation/reader-requiem-absolution.v1.json");
const report={schema:"ao-exceptional-rite-source-focus-matrix-v1",scenarios:[],
 sourceCoverage:{},failures:[],limitations:[
  "Source-model coverage is not computed-opacity or finger-scroll certification.",
  "The 1962 Good Friday personal veneration branch and optional 2008 prayer must retain distinct source attribution.",
  "Font/Baptism choices, Corpus sacramental events, burial conditions and lay participation are observational, not inferred from date.",
  "Physical phone/browser rendering is an independent acceptance gate."
 ]};
const assertRows=(rows,context)=>{
 const seen=new Set();
 for(const row of rows){
  assert.ok(String(row.id||"").trim(),context+": missing source paragraph ID");
  assert.ok(!seen.has(row.id),context+": duplicate source paragraph "+row.id);
  seen.add(row.id);
  // The Absolution has source-owned bilingual explanatory rubrics, not Latin
  // prayers. Preserve the Latin-text requirement on every other source row.
  if(row.kind==="RUBRIC" && context.startsWith("requiem-absolution/")){
   assert.equal(row.owner,"RITUALE_1952_ABSOLUTION",context+": unidentified rubric source");
   assert.equal(row.observedNow,false,context+": book rubric claimed observation");
   assert.ok(/^ABS-0(?:10|20|30|40|50)$/.test(String(row.sourceRecordId??"")),
     context+": rubric not anchored to certified ABS graph");
   assert.match(String(row.sourceUrl??""),/^https:\/\//);
   assert.ok(String(row.english??"").trim() && String(row.french??"").trim(),
     context+": missing bilingual ceremonial direction "+row.id);
   assert.equal(row.latin,undefined,context+": editorial rubric mistaken for original Latin prayer");
  }else{
   assert.ok(String(row.latin||"").trim(),context+": empty Latin reading "+row.id);
  }
  assert.ok(String(row.kind||"").trim(),context+": missing reading kind "+row.id);
 }
 return seen.size;
};
const inspect=(name,items,fields={})=>{
 let paragraphs=0,blankStates=0;
 const idSet=new Set(),surfaces=new Set(),uniqueParagraphs=new Set();
 for(const item of items){
  const id=item.recordId??item.id;
  assert.ok(id&&!idSet.has(id),name+" missing/duplicated record "+id);
  idSet.add(id);
  const surface=item.surfaceKey??item.id;
  surfaces.add(surface);
  const rows=item.paragraphs??[];
  paragraphs+=assertRows(rows,name+"/"+id);
  if(!rows.length)blankStates++;
  rows.forEach(p=>uniqueParagraphs.add(surface+":"+p.id));
 }
 const data={id:name,sourceRecords:items.length,surfaces:surfaces.size,
   rowOccurrences:paragraphs,uniqueParagraphs:uniqueParagraphs.size,
   sourceIds:[...idSet],blankStates,...fields};
 report.scenarios.push(data);
 console.log("EXCEPTIONAL_SOURCE_CASE="+JSON.stringify({
  id:name,records:items.length,surfaces:surfaces.size,
  rows:paragraphs,blankStates
 }));
 return data;
};

// Good Friday: exercise every active record, branches and exact ceremonial cues.
const goodFridayGraph=core.graphs.GF,gfUnion=new Set();
for(const venerationMode of ["PERSONAL","CORPORATE_SILENT"]){
 for(const willReceiveCommunion of [false,true]){
  for(const jewishPrayerVariant of ["PRINTED_1962","HOLY_SEE_2008"]){
   const name="good-friday/"+venerationMode+"/communion-"+willReceiveCommunion+"/"+jewishPrayerVariant;
   const built=buildGoodFridayReader({graph:goodFridayGraph,payload:GF,
    venerationMode,willReceiveCommunion,jewishPrayerVariant});
   inspect(name,built.steps,{sourceGraph:"GF"});
   built.steps.forEach(x=>gfUnion.add(x.recordId));
   const ctrl=createGoodFridayReaderController({graph:goodFridayGraph,payload:GF,
    venerationMode,willReceiveCommunion,jewishPrayerVariant});
   for(const step of built.steps){
    const state=ctrl.goToRecord(step.recordId);
    assert.equal(state.step.recordId,step.recordId,name+" cannot navigate source record");
    assert.equal(state.card.id,step.surfaceKey,name+" source-owned surface drift");
   }
   assert.equal(ctrl.project().ordinaryMassGraphActive,false);
   assert.equal(built.steps.some(x=>x.recordId==="GF-COM-850"),willReceiveCommunion);
   assert.equal(built.steps.some(x=>x.recordId==="GF-VEN-650"),venerationMode==="CORPORATE_SILENT");
   assert.equal(built.steps.some(x=>x.recordId==="GF-VEN-620"),venerationMode==="PERSONAL");
  }
 }
}
assert.deepEqual([...gfUnion].sort(),goodFridayGraph.map(x=>x.id).sort(),
 "Good Friday source records lost across participant/liturgical branches");
report.sourceCoverage.goodFriday={graph:goodFridayGraph.length,visited:gfUnion.size};
const pass=buildGoodFridayReader({graph:goodFridayGraph,payload:GF}).steps;
assert.equal(pass.find(x=>x.recordId==="GF-PASS-320")?.posture,"KNEEL");
assert.equal(pass.find(x=>x.recordId==="GF-PASS-330")?.posture,"STAND");
for(let n=1;n<=9;n++){
 const i=String(n).padStart(2,"0"),kneel=pass.find(x=>x.recordId==="GF-SOP-"+i+"-K"),
  rise=pass.find(x=>x.recordId==="GF-SOP-"+i+"-R");
 assert.ok(kneel?.paragraphs.some(x=>x.id==="GF-SOP-"+i+"-K"&&
   x.sourceIds?.includes(kneel.recordId)),"Missing source-locked Flectamus "+i);
 assert.ok(rise?.paragraphs.some(x=>x.id==="GF-SOP-"+i+"-R"&&
   x.sourceIds?.includes(rise.recordId)),"Missing source-locked Levate "+i);
}

// Easter Vigil: all three Font placements and optional baptisms, including
// the projected handoff into the Mass, with no invented liturgical sequence.
const easterGraph=core.graphs.EV,evUnion=new Set();
for(const fontMode of ["NONE","IN_CHURCH","SEPARATE_BAPTISTERY"]){
 for(const baptismPresent of fontMode==="NONE"?[false]:[false,true]){
  const name="easter-vigil/"+fontMode+"/baptisms-"+baptismPresent;
  const built=buildEasterVigilReader({graph:easterGraph,payload:EV,fontMode,baptismPresent});
  inspect(name,built.steps,{sourceGraph:"EV"});
  built.steps.forEach(x=>evUnion.add(x.recordId));
  assert.equal(built.steps.at(-1)?.recordId,"EV-MASS-700");
  assert.ok(built.steps.at(-1)?.handoffToMass);
  const ctrl=createEasterVigilReaderController({graph:easterGraph,payload:EV,fontMode,baptismPresent});
  for(const step of built.steps){
   const state=ctrl.goToRecord(step.recordId);
   assert.equal(state.step.recordId,step.recordId,name+": failed to navigate record");
   assert.equal(state.card.id,step.surfaceKey,name+": source-owned surface drift");
  }
  assert.equal(built.steps.some(x=>x.recordId==="EV-BAPT-430"),baptismPresent);
  const fontId=fontMode==="NONE"?"EV-FONT-410":
    fontMode==="IN_CHURCH"?"EV-FONT-420":"EV-FONT-440";
  assert.ok(built.steps.some(x=>x.recordId===fontId),name+": incorrect Font branch");
  if(fontMode==="SEPARATE_BAPTISTERY"&&baptismPresent)
   assert.ok(built.steps.findIndex(x=>x.recordId==="EV-FONT-440")<
    built.steps.findIndex(x=>x.recordId==="EV-BAPT-430"),"Font blessing must precede baptisms");
 }
}
assert.deepEqual([...evUnion].sort(),easterGraph.map(x=>x.id).sort(),
 "Easter Vigil source records lost across Font/baptism branches");
report.sourceCoverage.easterVigil={graph:easterGraph.length,visited:evUnion.size};

// Corpus Christi is a following action, never enabled by the date alone.
const corpusGraph=ext.graphs.CORPUS;
const cc=createCorpusChristiProcessionReaderController({graph:corpusGraph,payload:CORPUS});
inspect("corpus-christi/source",cc.cards,{sourceGraph:"CORPUS"});
assert.equal(cc.cards.length,6);
assert.equal(cc.project().card.id,"CORPUS-R01");
cc.setSacramentalState("MONSTRANCE_PLACED_IN_CELEBRANT_HANDS");
assert.equal(cc.project().card.id,"CORPUS-R02");
cc.setSacramentalState("PROCESSION_ACTIVE");
assert.equal(cc.project().card.id,"CORPUS-R03");
assert.equal(cc.project().posture,"LOCAL_REVERENT");
cc.setProcessionParticipant(true);
assert.equal(cc.project().posture,"PROCESSIONAL");
cc.setProcessionParticipant(false);
assert.equal(cc.project().posture,"LOCAL_REVERENT");
cc.setSacramentalState("BLESSED_SACRAMENT_REPLACED_ON_ALTAR");
assert.equal(cc.project().card.id,"CORPUS-R04");
cc.next();assert.equal(cc.project().card.id,"CORPUS-R05");
cc.setSacramentalState("BENEDICTION_COMPLETE");
assert.equal(cc.project().card.id,"CORPUS-R06");
assert.equal(cc.project().handoff,"POST_MASS_LIFECYCLE");
assert.throws(()=>cc.setSacramentalState("DATE_IS_CORPUS_CHRISTI"),/Unsupported/);
report.sourceCoverage.corpusChristi={graph:corpusGraph.length,
 visited:new Set(cc.cards.flatMap(x=>x.sourceRecordIds)).size};

// Requiem: body-absent/present and burial-path variants, with lay-participant
// posture only when explicitly selected.
const absGraph=ext.graphs.ABS,absUnion=new Set();
for(const bodyPresent of [false,true]){
 for(const burialProcession of [false,true]){
  const name="requiem-absolution/body-"+bodyPresent+"/burial-"+burialProcession;
  const built=buildRequiemAbsolutionPayload({graph:absGraph,payload:ABS,bodyPresent,burialProcession});
  inspect(name,built.cards,{sourceGraph:"ABS"});
  built.cards.flatMap(x=>x.sourceRecordIds).forEach(x=>absUnion.add(x));
  assert.equal(built.cards.some(x=>x.id==="ABS-R02"),bodyPresent);
  assert.equal(built.cards.some(x=>x.id==="ABS-R05"),bodyPresent&&burialProcession);
  const ctrl=createRequiemAbsolutionReaderController({graph:absGraph,payload:ABS,
   bodyPresent,burialProcession});
  for(const card of built.cards)assert.equal(ctrl.goTo(card.id).card.id,card.id);
  ctrl.setBurialParticipant(false);
  if(ctrl.project().card?.actorScope==="FAITHFUL_PARTICIPATING"){
   assert.equal(ctrl.project().posture,null,name+": burial posture leaked to nonparticipant");
   ctrl.setBurialParticipant(true);
   assert.equal(ctrl.project().posture,"PROCESSIONAL");
  }
 }
}
assert.deepEqual([...absUnion].sort(),absGraph.map(x=>x.id).sort(),
 "Requiem Absolution lost a source record across body/burial variants");
report.sourceCoverage.requiemAbsolution={graph:absGraph.length,visited:absUnion.size};

const out=resolve(root,"artifacts/exceptional-rite-focus");
await mkdir(out,{recursive:true});
await writeFile(resolve(out,"exceptional-rite-source-matrix.json"),JSON.stringify(report,null,2));
await writeFile(resolve(out,"exceptional-rite-source-summary.txt"),
 report.scenarios.map(x=>[x.id,"records="+x.sourceRecords,"surfaces="+x.surfaces,
 "rows="+x.rowOccurrences,"stateOnly="+x.blankStates].join(" ")).join("\n")+"\n");
console.log("EXCEPTIONAL_SOURCE_TOTAL="+JSON.stringify({
 scenarios:report.scenarios.length,sourceCoverage:report.sourceCoverage,
 rows:report.scenarios.reduce((n,x)=>n+x.rowOccurrences,0)
}));
