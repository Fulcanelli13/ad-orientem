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

// Source-verified Ritus IV.3 priest bows are book text only. They must
// survive the real reader moment normalization, not merely a raw projector.
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 for(const language of ["en","fr"]){
  const subject=[mk("combined-gloria",["AO.SM.C0053","AO.SM.C0054"]),
    mk("adoramus",["AO.SM.C0056"])];
  const missal=withPublishedMissalParagraphRubrics(subject,source,
    {form,language,presentationMode:"MISSAL"});
  const normalized=normalizeReaderMoment({paragraphs:missal});
  assert.deepEqual(normalized.paragraphs.map(p=>p.publishedMissalRubrics.map(x=>x.id)),
   [["MR62.ADD.C0054.01"],["MR62.ADD.C0056.01"]],
   "Book-only source-note identities lost through real reader normalization");
  assert.ok(normalized.paragraphs.every(p=>p.publishedMissalRubrics.every(x=>
   x.actor==="PRIEST"&&x.observedNow===false&&
   x.owner==="MR62_1962_MISSAL_ONLY_GLORIA_BOWS")));
  const live=withPublishedMissalParagraphRubrics(subject,source,
    {form,language,presentationMode:"LIVE"});
  assert.ok(live.every(p=>!p.publishedMissalRubrics?.length),
   "Never auto-project priest IV.3 bow onto choir-owned LIVE words");
  const spoof=structuredClone(missal[1]);
  spoof.publishedMissalRubrics[0].sourceCueId="AO.SM.C0055";
  assert.equal(normalizeReaderMoment({paragraphs:[spoof]})
    .paragraphs[0].publishedMissalRubrics.length,0,
   "Source cue mismatch must never render a forged Missal rubric");
 }
}
console.log("PASS 52 existing approved priest actions + 2 published canonical-digits STATE annotations (EN/FR, four forms); bells remain unpromoted.");
