import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {createAdventFirstVespersBoundedPinnedReader,
 parseAdventPreviewSourceSections}
 from "../src/office/advent-first-vespers-bounded-preview-reader.js";
import {assembleAdventI2026PrivatePreviewSession as assemble}
 from "../src/office/advent-first-vespers-preview-session.js";
import {buildAdventI2026ReadingFocus as buildFocus}
 from "../src/office/advent-first-vespers-reading-focus.js";

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
   const lang=loc[match[1]],path=decodeURIComponent(match[2]);
   const f=fixture[lang];
   if(f.leaves[path])content=f.leaves[path];
   else if(f.sections[path]){
    content=Object.entries(f.sections[path])
      .map(([heading,lines])=>"["+heading+"]\n"+lines.join("\n"))
      .join("\n\n")+"\n";
   }else throw Error("not in finite witness list:"+ref);
  }
  content=mutate(decodeURIComponent(url),content)??content;
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

test("focused reading retains 37 liturgical events, exactly 40+10 verse rows and six hymn stanzas",async()=>{
 const result=await assemble({...reader(),universalWitness:universal,
  recitation:"SOLO",minister:"BELOW_DEACON"});
 assert.equal(result.status,"RESEARCH_PREVIEW_ASSEMBLED_NOT_RELEASED",result.reason);
 const p=result.preview;
 const focus=buildFocus({preview:p});
 assert.equal(focus.status,"RESEARCH_VERSE_AND_STANZA_FOCUS_NOT_CERTIFIED",focus.reason);
 assert.equal(focus.originalEventCount,37);
 assert.equal(focus.focusFrameCount,86);
 assert.equal(focus.frames.length,86);
 assert.equal(focus.psalmVerseRows,40);
 assert.equal(focus.magnificatVerseRows,10);
 assert.equal(focus.hymnStanzas,6);
 assert.equal(focus.allLanguagesAlignedByPinnedSourceOrdinals,true);
 assert.equal(focus.sourceTextAltered,false);
 assert.equal(focus.published,false);
 assert.equal(focus.publishable,false);
 assert.deepEqual([...new Set(focus.frames.map(x=>x.eventIndex))],
  [...Array(37).keys()]);
 assert.equal(focus.frames.filter(x=>x.kind==="COLLECT_ENDING").length,1);
 assert.equal(focus.frames.filter(x=>x.kind==="RESEARCH_CALENDAR_NOTICE").length,1);
 const ps=focus.frames.filter(x=>x.focusType==="PSALM_VERSE");
 assert.equal(ps.length,40);
 assert.ok(ps.filter(x=>x.label==="143:2").length===2);
 assert.ok(ps.filter(x=>x.label==="144:13a").length===1);
 assert.ok(ps.filter(x=>x.label==="144:13b").length===1);
 for(const [eventIndex,block] of p.blocks.entries()){
  const fr=focus.frames.filter(x=>x.eventIndex===eventIndex);
  assert.ok(fr.length>=1);
  if(block.kind==="RESEARCH_CALENDAR_NOTICE")continue;
  for(const lang of ["la","en","fr"]){
   const after=block.kind==="PSALM_PORTION"?
    [fr.map(x=>x.texts[lang][0]).join("\n")]:
   block.kind==="MAGNIFICAT"?
    fr.map(x=>x.texts[lang][0]):
   block.kind==="HYMN"?
    fr.flatMap((x,i)=>i===0?[...x.texts[lang]]:["\n",...x.texts[lang]]):
    fr[0].texts[lang];
   assert.deepEqual(after,block.texts[lang],
    "Source content altered: "+lang+" "+block.kind+" "+eventIndex);
  }
 }
});
test("focused reading rejects missing French verse, lost hymn stanza and forged release flags",async()=>{
 const result=await assemble({...reader(),universalWitness:universal,
  recitation:"SOLO",minister:"BELOW_DEACON"});
 const original=result.preview;
 assert.equal(buildFocus({preview:{...original,published:true}}).status,"WITHHELD");
 assert.equal(buildFocus({preview:{...original,translationApproved:true}}).status,"WITHHELD");
 assert.equal(buildFocus({preview:{...original,blockCount:36}}).status,"WITHHELD");
 for(const edit of [
  blocks=>{
   const x=blocks.find(x=>x.kind==="PSALM_PORTION");
   x.texts={...x.texts,fr:[x.texts.fr[0].split("\n").slice(1).join("\n")]};
  },
  blocks=>{
   const x=blocks.find(x=>x.kind==="HYMN");
   x.texts={...x.texts,en:x.texts.en.filter((t,i)=>i!==4)};
  },
  blocks=>{
   const x=blocks.find(x=>x.kind==="MAGNIFICAT");
   x.texts={...x.texts,la:x.texts.la.slice(1)};
  }
 ]){
  const blocks=structuredClone(original.blocks);
  edit(blocks);
  const r=buildFocus({preview:{...original,blocks}});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.frames.length,0);
  assert.equal(r.published,false);
 }
});
