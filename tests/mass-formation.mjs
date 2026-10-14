import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
 MASS_FORMATION_SCRIPTURE_ANCHORS,massFormationScriptureForStage,massFormationScriptureHtml,
 MASS_FORMATION_SCRIPTURE_RELATIONSHIPS
} from "../src/learn/mass-formation-scripture-context.js";
import {parseScriptureContext} from "../src/scripture/context.js";
import {
  MASS_FORMATION_ROUTE,
  MASS_FORMATION_VERSION,
  ensureMassFormationRegistry,
} from "../src/learn/mass-formation.js";

const data=JSON.parse(readFileSync("data/learn/mass-formation-campion.v1.json","utf8"));
assert.equal(data.schema,"ao-mass-formation-campion-v1");
assert.equal(data.version,"1.0.0");
assert.equal(data.route,"learn.mass");
assert.equal(data.status,"SOURCE_BACKED_FORMATION");
assert.equal(data.stages.length,8);
assert.equal(data.stages.reduce((n,s)=>n+s.claims.length,0),24);
assert.equal(MASS_FORMATION_ROUTE,"learn.mass");
assert.equal(MASS_FORMATION_VERSION,"mass-formation-campion-v1");

assert.equal(MASS_FORMATION_SCRIPTURE_ANCHORS.length,18,
 "All 18 unique published-lesson biblical study passages must be present");
assert.deepEqual([...new Set(MASS_FORMATION_SCRIPTURE_ANCHORS.map(x=>x.stageId))],
 data.stages.map(x=>x.id),"Each of the eight published lessons needs contextual Scripture reading");
assert.equal(MASS_FORMATION_SCRIPTURE_ANCHORS.find(x=>x.id==="MFS12")?.reference,"Hebrews 7:1–17",
 "Full researched Melchisedech epistle reference must not be arbitrarily truncated");
for(const reference of ["Matthew 20:30–31","John 1:14"]){
 assert.equal(MASS_FORMATION_SCRIPTURE_ANCHORS.filter(x=>x.reference===reference).length,1,
   "Keep the missing contextual Bible witnesses available exactly once");
}
for(const item of MASS_FORMATION_SCRIPTURE_ANCHORS){
 const parsed=parseScriptureContext(item.reference);
 assert.ok(parsed,item.id+" must use the shared Catholic Bible parser");
 assert.ok(MASS_FORMATION_SCRIPTURE_RELATIONSHIPS[item.relationship]);
 assert.ok(data.stages.some(x=>x.id===item.stageId));
 assert.ok(!Object.hasOwn(item,"claimId"),
   "Study passages must not claim one-to-one proof of lesson propositions");
}
for(const stage of data.stages){
 const links=massFormationScriptureForStage(stage.id);
 assert.ok(links.length>=1,"No Scripture study links for "+stage.id);
 for(const french of [false,true]){
  const html=massFormationScriptureHtml(stage.id,{french});
  assert.equal((html.match(/data-ao-scripture-context=/g)||[]).length,links.length);
  assert.equal((html.match(/data-ao-mass-formation-anchor=/g)||[]).length,links.length);
  assert.ok(html.includes(french?"Approfondir dans la Bible":"Explore the Bible passages"));
  assert.ok(html.includes(french?"Missel de 1962":"1962 Missal"),
   "Scripture links must not claim to supersede the normative liturgical source");
  assert.ok(html.includes(french?"non une citation du rite":"not a quotation from the rite")||!links.some(x=>x.relationship==="COMPARATIVE_PASSAGE"));
 }
}
assert.equal(massFormationScriptureHtml("MF99"),"");
assert.doesNotMatch(JSON.stringify(MASS_FORMATION_SCRIPTURE_ANCHORS),/sourceWitness|reviewed|enabled/,
 "Teaching links may not grant textual editions or bypass provenance gates");
const bridge=JSON.parse(readFileSync("data/learn/research/mass-bible-canonical-scripture-bridge-20261014.v1.json","utf8"));
assert.equal(bridge.schema,"AO_MASS_BIBLE_CANONICAL_SCRIPTURE_BRIDGE_V1");
assert.equal(bridge.status,"SOURCE_RECONCILED_READER_ONLY_NO_EDITORIAL_PUBLICATION");
assert.equal(bridge.pinnedInputs.canonical39.pr,1193);
assert.equal(bridge.pinnedInputs.massBible26.pr,1082);
assert.deepEqual([bridge.counts.canonicalOwnersAvailable,bridge.counts.records,bridge.counts.uniqueCanonicalOwners,
 bridge.counts.readerEligible,bridge.counts.displayedLinks,bridge.counts.containedSubverses,
 bridge.counts.held,bridge.counts.versionSensitivePsalms,bridge.counts.variableProper,bridge.counts.newManuscriptPublications],
 [39,26,20,20,18,2,6,4,2,0]);
const idSet=new Set(),fromResearch=new Map();
for(const row of bridge.rows){
 assert.ok(!idSet.has(row.id),"Each of 26 research connections must have one canonical owner: "+row.id);
 idSet.add(row.id);
 assert.match(row.canonicalSectionId,/^AO\.(?:CARD|CANON)\.\d{2,3}$/);
 assert.equal(row.publicationApproved,false,"Do not promote unfinished historical manuscript claims");
 if(row.scriptureStudyLink){
  const target=MASS_FORMATION_SCRIPTURE_ANCHORS.find(x=>x.id===row.scriptureStudyLink.id);
  assert.ok(target,"Missing visible Scripture reference for "+row.id);
  assert.equal(target.reference,row.scriptureStudyLink.reference);
  assert.equal(target.stageId,row.scriptureStudyLink.displayLessonId);
  assert.ok(parseScriptureContext(row.scriptureStudyLink.upstreamReference),
   "Only source-identified Bible references may open the shared reader");
  if(row.scriptureStudyLink.alignment==="EXACT_PASSAGE")
    assert.equal(target.reference,row.scriptureStudyLink.upstreamReference);
  else assert.ok(["MB16","MB22"].includes(row.id),
    "A shorter verse may reuse a longer linked passage only with explicit research proof");
  assert.equal(row.scriptureStudyLink.noMassTextEquivalence,true);
 }else{
  assert.ok(row.heldReason,"Unresolved source must be deliberately withheld: "+row.id);
 }
 fromResearch.set(row.id,row);
}
assert.deepEqual([...idSet].sort(),Array.from({length:26},(_,i)=>"MB"+String(i+1).padStart(2,"0")));
assert.deepEqual([...fromResearch.values()].filter(x=>x.heldReason).map(x=>x.id),
 ["MB01","MB02","MB06","MB07","MB09","MB25"]);
assert.equal(new Set(bridge.rows.filter(x=>x.scriptureStudyLink).map(x=>x.scriptureStudyLink.id)).size,18);
assert.equal(bridge.rows.filter(x=>x.scriptureStudyLink?.alignment==="VERSE_WITHIN_LARGER_PASSAGE").length,2);
const sources=new Map(data.sources.map(s=>[s.id,s]));
assert.equal(sources.get("SRC-MR62").role,"NORMATIVE_1962");
assert.equal(sources.get("SRC-CAMPION-1954").role,"DISCOVERY_AND_EXPLANATORY");
assert.equal(sources.get("SRC-MEDIATOR-DEI").authority_type,"PAPAL_ENCYCLICAL");
for(const source of data.sources){
  assert.match(source.canonical_url,/^https:\/\//,source.id);
}
const ids=new Set();
for(const stage of data.stages){
  assert.ok(stage.title?.en&&stage.title?.fr,stage.id);
  assert.ok(stage.summary?.en&&stage.summary?.fr,stage.id);
  assert.equal(ids.has(stage.id),false,stage.id);ids.add(stage.id);
  for(const claim of stage.claims){
    assert.equal(ids.has(claim.id),false,claim.id);ids.add(claim.id);
    assert.ok(claim.text?.en&&claim.text?.fr,claim.id);
    assert.ok(claim.sources.length>0,claim.id);
    for(const sourceId of claim.sources)assert.ok(sources.has(sourceId),claim.id+" -> "+sourceId);
  }
}
const text=JSON.stringify(data);
assert.doesNotMatch(text,/Ad Orientem/,"Mass formation leaked product-brand commentary into learner content");
assert.match(text,/sacramental immolation is performed by the priest alone/);
assert.match(text,/Holy Communion pertains to the integrity of the Mass/);
assert.match(text,/The Victim is the same Christ/);

const base={
  get:id=>({id:"base."+id}),
  resolve:id=>({ok:true,id:"base."+id}),
  open:async()=>({ok:true,canonicalId:"base"}),
  list:()=>[{id:"base.item"}],
};
const fakeRuntime={open:async()=>true};
const win={AO_MODULES:base,AO_MASS_FORMATION_V1:fakeRuntime};
ensureMassFormationRegistry(win);
assert.equal(win.AO_MODULES.get("learn.mass").title,"Understand the Mass");
assert.equal((await win.AO_MODULES.open("learn.mass")).ok,true);
assert.equal((await win.AO_MODULES.open("other")).canonicalId,"base");
assert.equal(win.AO_MODULES.list({domain:"learn"}).filter(x=>x.id==="learn.mass").length,1);

console.log("PASS Campion Mass formation: 8 source-backed stages, 24 bilingual claims, modular learn.mass owner.");
