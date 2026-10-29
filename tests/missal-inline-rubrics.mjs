import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {publishedMissalRubricsForParagraph,withPublishedMissalParagraphRubrics} from "../src/mass/reader-missal-rubrics.js";
import {withPublishedCanonParagraphRubrics} from "../src/mass/reader-canon-published-rubrics.js";
import {normalizeReaderMoment} from "../src/mass/reader-dom.js";

const source=JSON.parse(readFileSync(new URL("../data/presentation/reader-rubric-events.v1.json",import.meta.url),"utf8"));
const mk=(id,cues)=>({id,sourceCueIds:cues,kind:"TEXT",primary:"Original Latin",secondary:"Translation"});
const cited=source.sources.find(x=>x.id==="MR62_RITUS").url;
const selected=source.items.filter(x=>x.actor==="PRIEST"&&x.authorityClass==="1962_NORMATIVE"&&
 x.sources.includes("MR62_RITUS")&&x.kind!=="STATE"&&x.kind!=="BELL");
assert.equal(selected.length,52,"Expected frozen published 1962 priest gesture/action denominator");
const rows=selected.map(x=>mk(x.cueId,[x.cueId]));
const uniqueCueIds=[...new Set(selected.map(x=>x.cueId))];
let renderedIds=[];
for(const cueId of uniqueCueIds){
 const p=publishedMissalRubricsForParagraph(mk(cueId,[cueId]),source,{form:"LOW",language:"en"});
 renderedIds.push(...p.filter(x=>x.kind!=="STATE").map(x=>x.id));
 assert.ok(p.filter(x=>x.kind!=="STATE").every(x=>x.sourceCueId===cueId&&x.sourceUrl===cited&&
   x.displayText.startsWith("The priest ")&&x.observedNow===false),
   cueId+" lost source or observation boundary");
}
assert.equal(renderedIds.length,52,"52 original actions must appear once in ordinary Low Missal");
assert.equal(new Set(renderedIds).size,52,"Duplicate action IDs");
for(const cueId of uniqueCueIds){
 const p=publishedMissalRubricsForParagraph(mk(cueId,[cueId]),source,{form:"LOW",language:"fr"});
 assert.ok(p.length>0 && p.filter(x=>x.kind!=="STATE").every(x=>x.displayText.startsWith("Le prêtre ")&&x.observedNow===false),
  cueId+" lacks original French Missal direction");
}
const wrong=publishedMissalRubricsForParagraph(mk("x",["AO.SM.C0161"]),null);
assert.deepEqual(wrong,[]);
const publishedNoncanon=publishedMissalRubricsForParagraph(mk("offertory",["AO.SM.C0111"]),source,{form:"LOW"});
assert.deepEqual(publishedNoncanon.map(x=>x.id),["AO.RUB.C0111.01","AO.RUB.C0111.02","AO.RUB.C0111.03"]);
assert.equal(withPublishedCanonParagraphRubrics([mk("offertory",["AO.SM.C0111"])],source)[0].publishedCanonRubrics,undefined,
 "LIVE Canon bridge must not absorb MISSAL-only non-Canon content");
const safeSolemn=publishedMissalRubricsForParagraph(mk("chalice",["AO.SM.C0115"]),source,{form:"SOLEMN"});
assert.deepEqual(safeSolemn.map(x=>x.id),["AO.RUB.C0115.01","AO.RUB.C0115.02"]);
assert.ok(!safeSolemn.some(x=>x.id==="AO.RUB.C0115.03"),"Mixed-role Solemn chalice action must not be assigned to priest");
const solemnCanon=publishedMissalRubricsForParagraph(mk("canon",["AO.SM.C0181"]),source,{form:"SOLEMN"});
assert.ok(!solemnCanon.some(x=>x.id==="AO.RUB.C0181.04"),"Existing Canon Solemn fail-closed ownership must survive");
assert.equal(publishedMissalRubricsForParagraph(mk("unrelated",["AO.SM.C0280"]),source).length,0);
assert.equal(publishedMissalRubricsForParagraph(mk("synthetic",[]),source).length,0);
assert.equal(publishedMissalRubricsForParagraph({id:"derived",sourceCueIds:[],sourceAnchorCueId:"AO.SM.C0174"},source).length,0);
assert.equal(publishedMissalRubricsForParagraph(mk("other",["AO.SM.C0155"]),source,{form:"REQUIEM"}).length,0);
for(const event of selected){
 const corrupted=structuredClone(source);
 corrupted.items.find(x=>x.id===event.id).authorityClass="EDITORIAL_DRAFT";
 assert.ok(!publishedMissalRubricsForParagraph(mk("draft",[event.cueId]),corrupted).some(x=>x.id===event.id),
   event.id+" must fail closed if certification is removed");
}
const tampered=structuredClone(source);
tampered.items.push({...selected[0],id:"AO.RUB.C0010.99",label:"BOWS HEAD"});
assert.ok(!publishedMissalRubricsForParagraph(mk("extra",[selected[0].cueId]),tampered).some(x=>x.id==="AO.RUB.C0010.99"),
 "New apparently normative rows need an explicit allowlist and cannot auto-publish");
const enriched=withPublishedMissalParagraphRubrics([mk("main",["AO.SM.C0155"]),mk("synthetic",[]),mk("offertory",["AO.SM.C0111"])],source,{form:"LOW",language:"fr"});
assert.equal(enriched.length,3,"Missal source paragraphs must not be changed or inserted");
assert.equal(enriched[1].publishedMissalRubrics,undefined);
assert.equal(enriched[2].publishedMissalRubrics[0].sourceCueId,"AO.SM.C0111");
const normal=normalizeReaderMoment({paragraphs:enriched});
assert.equal(normal.paragraphs[0].publishedMissalRubrics[0].observedNow,false);
assert.equal(normal.paragraphs[1].publishedMissalRubrics.length,0);
const invalid=normalizeReaderMoment({paragraphs:[{
  id:"invented",sourceCueIds:["AO.SM.C0010"],
  publishedMissalRubrics:[{owner:"RESEARCH",sourceCueId:"AO.SM.C0010",
  review:"DRAFT",actor:"PRIEST",sourceId:"MR62_RITUS",observedNow:false,displayText:"Invented gesture"}]
}]});
assert.equal(invalid.paragraphs[0].publishedMissalRubrics.length,0);
assert.ok(Object.isFrozen(normal.paragraphs[0].publishedMissalRubrics));
// Existing 1962 priest "canonical digits" rubric: two persistent states,
// no extra source clock, no blessing or minister inferred from opening a page.
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 for(const language of ["en","fr"]){
  const start=publishedMissalRubricsForParagraph(mk("consecration",["AO.SM.C0174"]),source,{form,language});
  const end=publishedMissalRubricsForParagraph(mk("ablutions",["AO.SM.C0248"]),source,{form,language});
  const s=start.filter(x=>x.kind==="STATE"),e=end.filter(x=>x.kind==="STATE");
  assert.deepEqual(s.map(x=>x.id),["AO.RUB.C0174.06"],form+" start not anchored");
  assert.deepEqual(e.map(x=>x.id),["AO.RUB.C0248.01"],form+" end not anchored");
  for(const x of [...s,...e]){
   assert.equal(x.actor,"PRIEST");
   assert.equal(x.observedNow,false);
   assert.equal(x.sourceUrl,cited);
   assert.equal(x.review,"EXISTING_PUBLISHED_R17_1962_RUBRIC");
   assert.ok(x.displayText.length>50);
  }
  if(language==="fr"){
   assert.match(s[0].displayText,/pouce et l’index/);
   assert.match(e[0].displayText,/ablution/);
  }else{
   assert.match(s[0].displayText,/after replacing the elevated Host/i);
   assert.match(e[0].displayText,/purification/i);
  }
  const normalized=normalizeReaderMoment({paragraphs:withPublishedMissalParagraphRubrics([
   mk("veneration",["AO.SM.C0174"]),mk("purification",["AO.SM.C0248"])
  ],source,{form,language})});
  for(const p of normalized.paragraphs)assert.equal(p.publishedMissalRubrics.filter(
   x=>["AO.RUB.C0174.06","AO.RUB.C0248.01"].includes(x.id)
  ).length,1,"State not available in actual inline Missal bridge");
 }
}
for(const id of ["AO.RUB.C0174.06","AO.RUB.C0248.01"]){
 const invalid=structuredClone(source);
 invalid.items.find(x=>x.id===id).authorityClass="EDITORIAL_DRAFT";
 const cue=id==="AO.RUB.C0174.06"?"AO.SM.C0174":"AO.SM.C0248";
 assert.ok(!publishedMissalRubricsForParagraph(mk("tampered",[cue]),invalid).some(x=>x.id===id),
   "Uncertified persistent state leaked into published Missal "+id);
}
for(const id of ["AO.SM.C0161","AO.SM.C0174","AO.SM.C0181"]){
 const bells=publishedMissalRubricsForParagraph(mk("bell",[id]),source).filter(x=>x.actor==="SERVER");
 assert.equal(bells.length,0,"Uncertified independent bell stage auto-published");
}

// C0204 has a 1962 normative gesture-matrix record but no exact approved
// artwork or R17 event. It must print at its own paragraph in BOTH modes
// without mutating the historical 52-action / 414-crosswalk denominators.
const matrix=JSON.parse(readFileSync(new URL("../data/mass/gesture-matrix.v1.json",import.meta.url),"utf8"));
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 for(const language of ["en","fr"]){
  const input=mk("minor-elevation",["AO.SM.C0204"]);
  const opts={form,language,gestureMatrix:matrix};
  const row=publishedMissalRubricsForParagraph(input,source,opts);
  assert.equal(row.length,1,"Missing C0204 source-only action "+form+" "+language);
  const x=row[0];
  assert.equal(x.id,"GM.P.C0204.01");
  assert.equal(x.owner,"CERTIFIED_1962_MATRIX_TEXT_ONLY");
  assert.equal(x.review,"EXACT_1962_GESTURE_MATRIX_RUBRIC");
  assert.equal(x.sourceId,"MR62_RITUS");
  assert.equal(x.sourceUrl,cited);
  assert.equal(x.observedNow,false);
  assert.equal(x.kind,"MATRIX_TEXT_ONLY");
  assert.match(x.displayText,language==="fr"?/élève légèrement le calice/:/raises the chalice slightly/);
  const projection=withPublishedMissalParagraphRubrics([input],source,opts);
  assert.equal(projection.length,1,"No added prayer row or section");
  const normalized=normalizeReaderMoment({paragraphs:projection});
  assert.equal(normalized.paragraphs[0].publishedMissalRubrics.length,1,
    "Text-only source rubric lost in normalizer");
  assert.equal(normalized.paragraphs[0].publishedMissalRubrics[0].id,x.id);
 }
}
assert.equal(publishedMissalRubricsForParagraph(mk("c0204",["AO.SM.C0204"]),source).length,0,
 "A missing canonical matrix must fail closed");
assert.equal(publishedMissalRubricsForParagraph(
 mk("derived",[]),source,{gestureMatrix:matrix}).length,0,
 "A synthetic/source-anchor-only row cannot borrow C0204");
for(const mutation of [
 x=>{x.items.find(y=>y.id==="GM.P.C0204.01").iconKey="priest_elevation";},
 x=>{x.items.find(y=>y.id==="GM.P.C0204.01").authorityClass="EDITORIAL";},
 x=>{x.items.find(y=>y.id==="GM.P.C0204.01").label="GENERIC ELEVATION";}
]){
 const bad=structuredClone(matrix);mutation(bad);
 assert.equal(publishedMissalRubricsForParagraph(mk("bad",["AO.SM.C0204"]),
  source,{gestureMatrix:bad}).length,0,"Unverified source must not promote artwork or text");
}
const badMinor=normalizeReaderMoment({paragraphs:[{
 id:"fake",sourceCueIds:["AO.SM.C0204"],
 publishedMissalRubrics:[{id:"GM.P.C0204.02",sourceCueId:"AO.SM.C0204",
   owner:"CERTIFIED_1962_MATRIX_TEXT_ONLY",review:"EXACT_1962_GESTURE_MATRIX_RUBRIC",
   kind:"MATRIX_TEXT_ONLY",actor:"PRIEST",sourceId:"MR62_RITUS",observedNow:false,
   displayText:"Fabricated action"}]
}]});
assert.equal(badMinor.paragraphs[0].publishedMissalRubrics.length,0,
 "Unapproved matrix identity cannot pass normalization");

console.log("PASS 52 existing approved priest actions + 2 published canonical-digits STATE annotations (EN/FR, four forms); bells remain unpromoted.");
