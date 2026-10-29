import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {createAdventFirstVespersBoundedPinnedReader,
 parseAdventPreviewSourceSections}
 from "../src/office/advent-first-vespers-bounded-preview-reader.js";
import {assembleAdventI2026PrivatePreviewSession as assemble}
 from "../src/office/advent-first-vespers-preview-session.js";

const fixture={};
for(const lang of ["la","en","fr"]){
 fixture[lang]=JSON.parse(readFileSync(new URL(
  "../tests/fixtures/office/advent-i-preview-"+lang+".json",import.meta.url),"utf8"));
}
const ordinary=readFileSync(new URL(
 "../tests/fixtures/office/advent-i-preview-ordinary.txt",import.meta.url),"utf8");
const universal=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-universal-commemoration.json",import.meta.url),"utf8"));
const prefix="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
const loc={Latin:"la",English:"en",Francais:"fr"};
function fetcher({mutate=()=>{},onRead=()=>{}}={}){
 return async function read(url){
  assert.ok(url.startsWith(prefix),"source must be exact pinned original");
  const ref=url.slice(prefix.length);
  let content;
  if(ref==="Ordinarium/Vespera.txt")content=ordinary;
  else{
   const match=ref.match(/^(Latin|English|Francais)\/(.+)\.txt$/u);
   if(!match)throw Error("no locale or path fallback");
   const lang=loc[match[1]],path=match[2];
   const f=fixture[lang];
   if(f.leaves[path])content=f.leaves[path];
   else if(f.sections[path]){
    content=Object.entries(f.sections[path])
      .map(([heading,lines])=>"["+heading+"]\n"+lines.join("\n"))
      .join("\n\n")+"\n";
   }else throw Error("not in finite witness list:"+ref);
  }
  content=mutate(url,content)??content;
  onRead(url);
  return {ok:true,status:200,url,text:async()=>content};
 };
}
function reader(options){
 return createAdventFirstVespersBoundedPinnedReader({
  fetchSource:fetcher(options)
 });
}
test("private preview assembles ACTUAL pinned LA/EN/FR snippets into ordered reading cards without public release",async()=>{
 const calls=[];
 const source=reader({onRead:url=>calls.push(url)});
 const r=await assemble({
  ...source,universalWitness:universal,
  recitation:"SOLO",minister:"BELOW_DEACON"
 });
 assert.equal(r.status,"RESEARCH_PREVIEW_ASSEMBLED_NOT_RELEASED",r.reason);
 const p=r.preview;
 assert.equal(p.status,"PRIVATE_RESEARCH_PREVIEW_SOURCE_SEQUENCE_ONLY");
 assert.equal(p.sourceRevision,PIN);
 assert.equal(p.psalmPortions,5);
 assert.equal(p.antiphonUses,12);
 assert.equal(p.doxologyPositionsIncludingOpening,7);
 assert.equal(p.sourceCollectEndingOnce,true);
 assert.ok(p.blocks.length>30);
 assert.deepEqual(p.availableLanguages,["la","en","fr"]);
 assert.equal(p.calendarScope,"UNIVERSAL_ONLY");
 assert.equal(p.researchOnly,true);
 assert.equal(p.published,false);
 assert.equal(p.publishable,false);
 assert.equal(p.translationApproved,false);
 assert.equal(p.completeHourCertified,false);
 assert.equal(p.rightsApproved,false);
 assert.equal(calls.length,22);
 assert.equal(source.cachedDistinctFiles(),22);
 const hymn=p.blocks.find(x=>x.kind==="HYMN");
 assert.ok(hymn.texts.la.some(x=>x.includes("Creátor alme síderum")));
 assert.ok(hymn.texts.fr.some(x=>x.includes("Bienfaisant Créateur")));
 const ps=p.blocks.filter(x=>x.kind==="PSALM_PORTION");
 assert.deepEqual(ps.map(x=>x.sourceId),[
  "Psalterium/Psalmorum/Psalm143#1-8",
  "Psalterium/Psalmorum/Psalm143#9-15",
  "Psalterium/Psalmorum/Psalm144#1-7",
  "Psalterium/Psalmorum/Psalm144#8-13a",
  "Psalterium/Psalmorum/Psalm144#13b-21"
 ]);
 assert.equal(p.blocks.filter(x=>x.kind==="COLLECT_ENDING").length,1);
 const ending=p.blocks.find(x=>x.kind==="COLLECT_ENDING");
 assert.match(ending.texts.la.join(" "),/Qui vivis et regnas cum Deo Patre/u);
 assert.ok(p.blocks.some(x=>x.kind==="RESEARCH_CALENDAR_NOTICE"));
 assert.equal(p.blocks.some(x=>x.kind==="PATER_NOSTER"),false);
 assert.equal(p.blocks.some(x=>x.kind==="SECOND_DOMINE_EXAUDI_OMITTED"),false);
});
test("choir/deacon research has second Dominus response; solo cleric does not",async()=>{
 for(const [recitation,minister,hasSecond] of [
  ["SOLO","DEACON_OR_HIGHER",false],
  ["CHOIR_OR_COMMON","DEACON_OR_HIGHER",true],
  ["CHOIR_OR_COMMON","BELOW_DEACON",false]
 ]){
  const p=(await assemble({
   ...reader(),universalWitness:universal,recitation,minister
  })).preview;
  assert.ok(p,p?.reason);
  assert.equal(p.blocks.filter(x=>x.kind==="DISMISSAL_DIALOGUE_SOURCE_CANDIDATE").length,
   hasSecond?1:0);
  assert.equal(p.blocks.filter(x=>x.kind==="COLLECT_ENDING").length,1);
  assert.equal(p.publishable,false);
 }
});
test("missing French collect or appointed hymn withholds the entire preview",async()=>{
 for(const mutate of [
  (url,content)=>url.includes("/Francais/Tempora/Adv1-0.txt")?
   content.replace(/^\[Oratio\][\s\S]*?(?=\n\[[^\]]+\]|$)/mu,""):content,
  (url,content)=>url.includes("/English/Psalterium/Special/Major Special.txt")?
   content.replace(/\[Hymnus Adv Vespera\]/u,"[Other Hymn]"):content
 ]){
  const result=await assemble({
   ...reader({mutate}),universalWitness:universal,
   recitation:"SOLO",minister:"BELOW_DEACON"
  });
  assert.equal(result.status,"WITHHELD");
  assert.equal(result.preview,null);
  assert.equal(result.publishable,false);
 }
});
test("source reader rejects cross-language, missing/duplicated and unknown sections",async()=>{
 const source=reader();
 await assert.rejects(source.readSource("Tempora/Adv1-0","de"),/LANGUAGE_NOT_ALLOWED/);
 await assert.rejects(source.readSource("Sancti/11-29","la"),/NOT_ALLOWED/);
 await assert.rejects(source.readPsalmSource("Psalterium/Psalmorum/Psalm109","la"),/NOT_ALLOWED/);
 const allowed=new Set(["Ant Laudes"]);
 assert.throws(()=>parseAdventPreviewSourceSections(
  "[Ant Laudes]\nA complete text is present in the first section.\n[Ant Laudes]\nA second conflicting heading is forbidden.\n",allowed),/DUPLICATED_SECTION/);
 assert.throws(()=>parseAdventPreviewSourceSections(
  "[Something else]\nA\n",allowed),/RAW_SECTION_FILE_INVALID|REQUIRED_SOURCE_SECTION_MISSING/);
});
test("invalid local calendar or public-release flags never become a preview",async()=>{
 const x=await assemble({
  ...reader(),universalWitness:{...universal,calendarScope:"LOCAL"},
  recitation:"SOLO",minister:"BELOW_DEACON"
 });
 assert.equal(x.status,"WITHHELD");
 assert.equal(x.publishable,false);
});
