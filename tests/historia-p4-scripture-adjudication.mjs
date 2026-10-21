import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const file=(rel)=>JSON.parse(readFileSync(new URL(rel,import.meta.url),"utf8"));
const decisions=file("../data/research/historia-p4-edition-specific-reference-adjudication.v1.json");
const seams=file("../data/research/historia-p4-m20-m24-literary-seam-adjudication.v1.json");
const proof=file("../data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
assert.equal(decisions.hazards.length,5);
assert.equal(seams.findings.length,5);
assert.equal(decisions.policy.neverSynthesizeVerses,true);
assert.equal(decisions.policy.neverCrossAlignByNumericIndex,true);
assert.equal(seams.policy.editedP3VerseSelections,false);
assert.equal(seams.policy.acceptedNarrativeChanges,0);
assert.equal(seams.policy.readAloudAcceptances,0);
assert.equal(seams.policy.releaseApproval,false);
const storage={};
for(const book of ["Exodus","Mark","John","Acts"]){
 storage[book]={};
 for(const edition of editions){
  const json=file("../data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(json.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  storage[book][edition]=json;
 }
}
function locate(book,edition,chapter,verse){
 return storage[book][edition].verses.find(v=>v[0]===chapter&&v[1]===verse)?.[2]??null;
}
const byId=new Map(decisions.hazards.map(x=>[x.hazardId,x]));
assert.equal(byId.size,5);
for(const h of decisions.hazards){
 for(const edition of editions){
  const selection=h.editionResolution[edition];
  assert.ok(selection,"Missing edition-aware range "+h.hazardId+" "+edition);
  assert.equal(selection.endVerse,h.endByEdition[edition]);
  assert.equal(selection.startVerse,h.start);
  assert.equal(selection.resolvedSelection,h.book+" "+h.chapter+":"+h.start+"–"+h.endByEdition[edition]);
  const source=storage[h.book][edition].verses.filter(v=>v[0]===h.chapter&&v[1]>=h.start&&v[1]<=selection.endVerse);
  assert.equal(source.length,selection.verseEntries);
  assert.ok(source.every(v=>typeof v[2]==="string"&&v[2].trim()));
  if(h.classification==="CHAPTER_FINAL_BOUNDARY_BY_EDITION"){
   assert.equal(source.at(-1)?.[1],selection.endVerse);
   assert.equal(locate(h.book,edition,h.chapter,selection.endVerse+1),null);
  }
  if(h.semanticAnchor){
   const anchor=locate(h.book,edition,h.chapter,selection.semanticAnchorVerse);
   assert.ok(anchor);
   assert.match(anchor,/synagog|Capharn|Capernaum/i);
   assert.equal(selection.semanticAnchorIncludedInSelectedSpan,selection.semanticAnchorVerse<=selection.endVerse);
  }
 }
}
assert.deepEqual(editions.map(e=>byId.get("HS-VS-EXODUS40").editionResolution[e].endVerse),[36,36,38]);
assert.deepEqual(editions.map(e=>byId.get("HS-VS-MARK4").editionResolution[e].endVerse),[40,40,40]);
assert.deepEqual(editions.map(e=>byId.get("HS-VS-ACTS14").editionResolution[e].endVerse),[27,27,27]);
assert.deepEqual(editions.map(e=>byId.get("HS-VS-ACTS19").editionResolution[e].endVerse),[40,40,40]);
assert.deepEqual(editions.map(e=>byId.get("HS-VS-JOHN6").editionResolution[e].semanticAnchorVerse),[60,60,59]);
for(const edition of editions){
 assert.match(locate("Mark",edition,4,40),/fear|afraid|crainte/i);
 assert.match(locate("Acts",edition,19,40),/dismissed|congédia/i);
 assert.match(locate("Acts",edition,14,27),/disciples/i);
}
const f=new Map(seams.findings.map(x=>[x.movementId,x]));
assert.deepEqual([...f.keys()],["HS-M20","HS-M21","HS-M22","HS-M23","HS-M24"]);
for(const [id,s] of f){
 const m=proof.movements.find(v=>v.id===id);
 assert.ok(m,"Unknown movement "+id);
 assert.equal(s.productionGate?.startsWith("HOLD"),true);
 assert.match(s.decision,/NOT_APPLIED/);
}
assert.ok(f.get("HS-M20").currentBeatOrder.indexOf("H51-03")<f.get("HS-M20").currentBeatOrder.indexOf("H52-01"));
assert.ok(f.get("HS-M20").proposedBeatOrderIfEditorConfirms.indexOf("H52-01")<f.get("HS-M20").proposedBeatOrderIfEditorConfirms.indexOf("H51-03"));
assert.match(locate("Mark","dr-challoner",1,14),/John was delivered up/);
assert.match(locate("John","dr-challoner",1,35),/John stood/);
assert.match(locate("John","dr-challoner",6,44),/No man can come/);
assert.match(locate("John","dr-challoner",11,28),/called her sister Mary/);
assert.match(locate("John","dr-challoner",11,29),/cometh to him/);
assert.equal(f.get("HS-M22").decision,"GAP_BRIDGE_REVIEW_NOT_APPLIED");
assert.equal(f.get("HS-M24").decision,"SEAM_BRIDGE_REVIEW_NOT_APPLIED");
console.log("PASS P4: all five edition-specific bounds source-verified; 5 M20–M24 decisions remain editorial holds");
