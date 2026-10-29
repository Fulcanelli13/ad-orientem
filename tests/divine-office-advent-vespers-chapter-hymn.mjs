import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA}
 from "../src/office/advent-first-vespers-source-sequence.js";
import {assembleAdventVespersChapterAndHymnResearch}
 from "../src/office/advent-vespers-chapter-hymn.js";

const pin=DIVINUM_OFFICIUM_PIN,langs=["la","en","fr"];
const proper="Tempora/Adv1-0",common="Psalterium/Special/Major Special";
const prayers="Psalterium/Common/Prayers";
function sequence(){
 return {schema:ADVENT_FIRST_VESPERS_RESEARCH_SCHEMA,
  status:"SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED",
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  sourceRevision:pin,officePart:"FIRST",
  psalmRowsVerifiedAsSourceCandidates:5,
  appointedOfficeVerified:false,completeHourVerified:false,
  publishable:false,published:false};
}
function hymn(language){
 const lines=[];
 for(let stanza=0;stanza<5;stanza++){
  if(stanza)lines.push("_");
  for(let verse=0;verse<4;verse++)
   lines.push((stanza===0&&verse===0?"v. ":"")+
    language+" stanza "+(stanza+1)+" source hymn line "+(verse+1)+".");
 }
 lines.push(language==="fr"?"Ainsi soit-il.":"Amen.");
 if(language!=="en")lines[0]="{:H-VespAdv:}"+lines[0];
 return lines;
}
function fixture({mutate=()=>{}}={}){
 const calls=[];
 const readSource=async(path,language)=>{
  calls.push([path,language]);
  const map=path===proper?new Map([["Capitulum Laudes",[
   language==="fr"?"!Rm 13:11":"!Rom 13:11",
   "v. "+language+" source Romans chapter.","$Deo gratias."
  ]]]):path===common?new Map([["Hymnus Adv Vespera",hymn(language)]])
   :new Map([["Deo gratias",["R. "+language+" source response."]]]);
  const doc={sourceRevision:pin,sourcePath:path,language,map};
  mutate(doc);
  return doc;
 };
 return {calls,readSource};
}
test("three-language Advent chapter and full hymn source sections assemble with exact source trail",async()=>{
 const f=fixture();
 const r=await assembleAdventVespersChapterAndHymnResearch({
  sourceSequence:sequence(),readSource:f.readSource
 });
 assert.equal(r.status,"THREE_LANGUAGE_CHAPTER_HYMN_SOURCE_UNVERIFIED");
 assert.equal(r.chapterAndHymnSourceSectionsLocated,6);
 assert.equal(f.calls.length,9);
 for(const lang of langs){
  assert.equal(r.languages[lang].chapter.citation,"Romans 13:11");
  assert.deepEqual(r.languages[lang].chapter.sourceTrace.map(x=>x.sourceId),[
   proper+"#Capitulum Laudes",prayers+"#Deo gratias"
  ]);
  assert.equal(r.languages[lang].hymn.sourceId,common+"#Hymnus Adv Vespera");
  assert.equal(r.languages[lang].hymn.sourceHymnNotationObserved,lang!=="en");
  assert.equal(r.languages[lang].hymn.sourceStanzaSeparators,4);
  assert.equal(r.languages[lang].chapter.chapterRubricallyAppointed,false);
  assert.equal(r.languages[lang].hymn.printedHymnCollated,false);
 }
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.printedEditionCertified,false);
 assert.equal(r.publishable,false);
});
test("missing French hymn or Prayers response withholds all three languages",async()=>{
 for(const mutate of [
  doc=>{if(doc.sourcePath===common&&doc.language==="fr")doc.map.delete("Hymnus Adv Vespera")},
  doc=>{if(doc.sourcePath===prayers&&doc.language==="fr")doc.map.delete("Deo gratias")}
 ]){
  const f=fixture({mutate});
  const r=await assembleAdventVespersChapterAndHymnResearch({
   sourceSequence:sequence(),readSource:f.readSource
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.reason,"OFFICE_ADVENT_CHAPTER_OR_HYMN_MISSING:fr");
  assert.equal(r.publishable,false);
 }
});
test("unknown source hymn markup and wrong Scripture chapter are rejected",async()=>{
 for(const mutate of [
  doc=>{if(doc.sourcePath===common&&doc.language==="la")
   doc.map.get("Hymnus Adv Vespera")[0]="{:H-Unknown:}v. Substitute Hymn"},
  doc=>{if(doc.sourcePath===proper&&doc.language==="en")
   doc.map.get("Capitulum Laudes")[0]="!Rom 15:11"},
  doc=>{if(doc.sourcePath===common&&doc.language==="fr")
   doc.map.get("Hymnus Adv Vespera").push("$Unresolved")},
 ]){
  const r=await assembleAdventVespersChapterAndHymnResearch({
   sourceSequence:sequence(),readSource:fixture({mutate}).readSource
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.publishable,false);
 }
});
test("source provenance mismatch on any language refuses the entire component",async()=>{
 const f=fixture({mutate:doc=>{
  if(doc.sourcePath===common&&doc.language==="fr")
   doc.sourceRevision="0".repeat(40);
 }});
 const r=await assembleAdventVespersChapterAndHymnResearch({
  sourceSequence:sequence(),readSource:f.readSource
 });
 assert.equal(r.reason,"OFFICE_ADVENT_CHAPTER_HYMN_SOURCE_IDENTITY_INVALID:fr");
});
test("unreviewed research handoff never invokes a source reader",async()=>{
 let reads=0;
 const r=await assembleAdventVespersChapterAndHymnResearch({
  sourceSequence:{...sequence(),completeHourVerified:true},
  readSource:async()=>{reads++;return {}}
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(reads,0);
});
