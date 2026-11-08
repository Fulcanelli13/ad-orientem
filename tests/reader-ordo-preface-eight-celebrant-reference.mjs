import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 PREFACE_CELEBRANT_INLINE_SCORES,
 PREFACE_CELEBRANT_INLINE_SCHEMA,
 prefaceCelebrantInlineScoresForParagraph
} from "../src/mass/reader-preface-celebrant-inline-reference.js";
import {PARTICIPATION_REFERENCE_SCORES,participationReferenceScoresForParagraph}
 from "../src/mass/reader-participation-reference-scores.js";
import {APPROVED_MASS_INLINE_GABC} from "../src/mass/reader-inline-chant-approved.js";

const source=JSON.parse(readFileSync(new URL(
 "../data/research/mass-music-m05-cc0-gabc-seven-20261031.v1.json",
 import.meta.url),"utf8"));
const sung=JSON.parse(readFileSync(new URL(
 "../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const cueRecords=sung.blocks.flatMap(b=>b.cues??b.Cues??b.records??[]);
const byCue=new Map(cueRecords.map(c=>[c.cue_id,c]));
assert.equal(PREFACE_CELEBRANT_INLINE_SCHEMA,"ao-ordo-preface-1961-8-celebrant-reference-v1");
assert.equal(PREFACE_CELEBRANT_INLINE_SCORES.length,8);
assert.deepEqual([...new Set(PREFACE_CELEBRANT_INLINE_SCORES.map(s=>s.toneFamily))].sort(),
 ["FERIAL","SOLEMN"]);
const places=[
 {id:"AO.SM.C0135",latin:"Per ómnia sæcula sæculórum.",index:0},
 {id:"AO.SM.C0137",latin:"℣. Dóminus vobíscum.",index:2},
 {id:"AO.SM.C0139",latin:"℣. Sursum corda.",index:4},
 {id:"AO.SM.C0141",latin:"℣. Grátias agámus Dómino",index:6,second:"AO.SM.C0142"}
];
for(const row of places){
 const src=byCue.get(row.id);
 assert.equal(src?.latin,row.latin,"Never map a source score to an inferred Latin line: "+row.id);
 if(row.second)assert.equal(byCue.get(row.second)?.latin,"Deo nostro.");
}
const norm=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/æ/gi,"ae").replace(/œ/gi,"oe").replace(/j/gi,"i")
 .toLowerCase().replace(/[^a-z0-9]+/g,"");
const resolved=(kind)=>({schema:"ao-resolved-mass-v2",form:"MISSA_CANTATA_INCENSE",distinctRite:"NONE",
 actualCelebration:{type:"TEMPORAL"},provenance:{musicToneContext:{
  schema:"ao-1962-sourced-tone-context-v1",sourceOwner:"1962_PROPER_RESOLVER",
  verified:true,celebrationKind:kind,liturgicalClass:kind==="FERIA"?4:2
 }}});
const partsFor=(row,joined=true)=>{
 const ps=row.sourceCueIds.map((cue,i)=>({
  id:"X"+i,sourceCueIds:[cue],speakerRole:"PRIEST",kind:"TEXT",
  primary:row.sourceCueLatin[i],secondary:"Translation "+i
 }));
 return joined&&ps.length===2?[{id:"COMPOSITE",sourceCueIds:[...row.sourceCueIds],
  speakerRole:"PRIEST",kind:"TEXT",primary:row.sourceLatin,secondary:"Translation"}]:ps;
};
const matches=(p,paragraphs,mass)=>prefaceCelebrantInlineScoresForParagraph({
 paragraph:p,paragraphs,form:"MISSA_CANTATA_INCENSE",resolvedMass:mass
});
for(const [srcId,tone,kind] of [[4449,"SOLEMN","SUNDAY"],[4450,"FERIAL","FERIA"]]){
 const original=source.scores.find(s=>s.sourceId===srcId);
 const full=original.gabc.split("%%")[1].split("(::)").map(x=>x.trim()).filter(Boolean);
 assert.equal(full.length,8);
 const items=PREFACE_CELEBRANT_INLINE_SCORES.filter(s=>s.sourceId===srcId);
 assert.equal(items.length,4);
 for(const row of items){
  const body=row.gabc.split("%%")[1].split("(::)")[0].trim();
  const expected=full[row.sourcePhraseIndex].startsWith("(c3)")
   ?full[row.sourcePhraseIndex]:"(c3) "+full[row.sourcePhraseIndex];
  assert.equal(body,expected,"Exact 1961 GABC phrase preserved "+row.id);
  assert.equal(row.publicScoreApproved,false);
  assert.equal(row.kind,"CELEBRANT_INTONATION");
  assert.equal(row.toneFamily,tone);
  assert.equal(row.sourceCueIds[0],places.find(p=>p.index===row.sourcePhraseIndex)?.id);
  assert.equal(norm(row.sourceLatin),norm(row.sourceCueLatin.join(" ")));
  for(const joined of row.sourceCueIds.length===2?[true,false]:[false]){
   const paragraphs=partsFor(row,joined),first=paragraphs[0];
   assert.deepEqual(matches(first,paragraphs,resolved(kind)).map(s=>s.id),[row.id],
    "Source-verified "+tone+" cue must appear in actual Ordo "+row.id);
   assert.equal(matches(first,paragraphs,resolved(kind==="SUNDAY"?"FERIA":"SUNDAY")).length,0,
    "Never borrow the wrong rubrical family");
   assert.equal(prefaceCelebrantInlineScoresForParagraph({
    paragraph:first,paragraphs,form:"LOW",resolvedMass:resolved(kind)}).length,0,
    "Low Mass never gets Sung dialogue notation");
   assert.equal(matches({...first,primary:"different Latin",secondary:"different"},[
    {...first,primary:"different Latin",secondary:"different"},...paragraphs.slice(1)
   ],resolved(kind)).length,0);
   assert.equal(matches(first,[...paragraphs,first],resolved(kind)).length,0,
    "Duplicate source cues cannot force a melody");
  }
 }
}
for(const cue of places.map(x=>x.id)){
 const previous=PARTICIPATION_REFERENCE_SCORES.filter(s=>s.sourceCueIds?.[0]===cue&&s.eventId==="PREFACE_DIALOGUE");
 assert.equal(previous.length,0,"Celebrant phrases were not already in the response registry");
}
assert.equal(PARTICIPATION_REFERENCE_SCORES.filter(s=>s.eventId==="PREFACE_DIALOGUE").length,8,
 "Preserve all eight existing Preface response-tone candidates");
assert.equal(APPROVED_MASS_INLINE_GABC.length,2,
 "Only the existing two approved Ite VIII score fragments remain publicly approved");
console.log("PASS 8 new source-exact celebrant Preface turns, 8 existing response-tone scores, C0141+C0142 composite and split cues, actual-tone guard, Low no-notation, no public approvals");
