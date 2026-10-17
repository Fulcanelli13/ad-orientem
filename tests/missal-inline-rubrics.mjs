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
 renderedIds.push(...p.map(x=>x.id));
 assert.ok(p.every(x=>x.sourceCueId===cueId&&x.sourceUrl===cited&&
   x.displayText.startsWith("The priest ")&&x.observedNow===false),
   cueId+" lost source or observation boundary");
}
assert.equal(renderedIds.length,52,"52 original actions must appear once in ordinary Low Missal");
assert.equal(new Set(renderedIds).size,52,"Duplicate action IDs");
for(const cueId of uniqueCueIds){
 const p=publishedMissalRubricsForParagraph(mk(cueId,[cueId]),source,{form:"LOW",language:"fr"});
 assert.ok(p.length>0 && p.every(x=>x.displayText.startsWith("Le prêtre ")&&x.observedNow===false),
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
console.log("PASS 52 existing published Ritus servandus priest directions (33 outside Canon + 19 Canon), EN/FR, Missal-only, Solemn actor guard, no invented cues, no extra Mass cards.");
