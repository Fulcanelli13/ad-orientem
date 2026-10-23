import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const review=read("data/research/historia-salutis-p3-first-three-movements-editorial-evidence-20261023.v1.json");
const proof=read(review.sourceOwners.movementProof);
const crosswalk=read(review.sourceOwners.chapterCrosswalk);
const chapters=read(review.sourceOwners.readingChapterProjection);
const locations=read(review.sourceOwners.canonicalAtlas);
const existingAtlas=buildBibleAtlas(locations.entries);
const byEvent=new Map(existingAtlas.map(s=>[s.eventKey,s]));
const witnessNames=["dr-challoner","cpdv-2009","crampon-1923"];
const witnesses=Object.fromEntries(witnessNames.map(ed=>{
 const j=read("data/scripture/witness/"+ed+"/Genesis.json");
 assert.equal(j.book,"Genesis");
 assert.equal(j.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
 assert.equal(j.editionId,ed);
 return [ed,new Map(j.verses.map(([chapter,verse,words])=>[chapter+":"+verse,words]))];
}));
function parseReference(reference){
 const r=/^Genesis (\d+):(\d+)(?:[–-](\d+))?$/.exec(reference||"");
 assert.ok(r,"No same-book/cross-chapter assumption or invented Scripture coordinates: "+reference);
 return {chapter:Number(r[1]),start:Number(r[2]),end:Number(r[3]||r[2])};
}
function hasEveryVerse(reference){
 const {chapter,start,end}=parseReference(reference);
 assert.ok(end>=start);
 for(const ed of witnessNames){
  for(let n=start;n<=end;n++)
   assert.ok(witnesses[ed].get(chapter+":"+n)?.trim(),
    "The source witness has no text: "+ed+" "+reference+" at "+n);
 }
}
assert.equal(review.schema,"ao.historia.p3.first-slice-editorial-evidence.v1");
assert.equal(review.status,"TEXT_WITNESS_DESK_REVIEW_ONLY_NOT_ORAL_EDITORIAL_OR_PUBLICATION_ACCEPTANCE");
assert.deepEqual(review.reviewedMovements,["HS-M01","HS-M02","HS-M03"]);
assert.equal(review.movementReviews.length,3);
assert.equal(proof.movements.length,37);
assert.equal(existingAtlas.length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(chapters.readingChapters.length,54);
assert.equal(crosswalk.arcs.length,12);
assert.equal(crosswalk.covenants.length,7);
assert.equal(review.sourceWitnessObservations.printedEditionCollationComplete,false);
assert.equal(review.sourceWitnessObservations.textFaithfulnessCertified,false);
let totalBeats=0,scripture=0,context=0,bridges=0;
const shownEventKeys=new Set();
for(const record of review.movementReviews){
 const m=proof.movements.find(v=>v.id===record.movementId);
 assert.ok(m,"Review cannot invent an original movement");
 assert.deepEqual(record.currentBeatIds,m.beats.map(b=>b.id),"P3 beat identity/order drift");
 assert.deepEqual(record.sourceOutlineIds,m.originalResearchChapterIds,"Do not lose H06 or other outline IDs");
 const chaptersInMovement=chapters.readingChapters.filter(ch=>
  ch.originalChapterIds.some(id=>record.sourceOutlineIds.includes(id)));
 assert.deepEqual(record.researchChapterIds,chaptersInMovement.map(ch=>ch.id),
  "Movement and proposed reading chapters may overlap but cannot be joined by numeric index");
 const arcsInMovement=crosswalk.arcs.filter(a=>
  a.chapterIds.some(id=>record.sourceOutlineIds.includes(id)));
 assert.deepEqual(record.arcIds,arcsInMovement.map(a=>a.id));
 assert.equal(record.oralReadthroughAccepted,false);
 assert.equal(record.editorialApproved,false);
 assert.equal(record.publicationApproved,false);
 const beatMap=new Map(m.beats.map(b=>[b.id,b]));
 for(const b of m.beats){
  totalBeats++;
  if(b.kind==="SCRIPTURE"){scripture++;for(const ref of b.refs)hasEveryVerse(ref);}
  else if(b.kind==="SOURCE_BRIDGE_CANDIDATE"){bridges++;hasEveryVerse(b.reference);}
  else if(b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"){
   context++;
   assert.equal(b.editorialReadingCandidate?.publicationApproved,false);
  }else assert.fail("Unrecognized kind "+b.kind);
 }
 for(const link of record.atlasLinks){
  const beat=beatMap.get(link.beatId),dest=byEvent.get(link.atlasEventKey);
  assert.ok(beat&&dest,"Cannot invent or rename a source beat or Atlas event");
  assert.ok(ATLAS_READING_CHAPTERS.some(ch=>ch.eventKeys.includes(link.atlasEventKey)),
   "Atlas destination must already exist in the production reading chapter membership");
  assert.equal(dest.reference.startsWith("Genesis "),true);
  const selected=parseReference(link.sourceReference),source=parseReference(dest.reference);
  assert.equal(selected.chapter,source.chapter);
  assert.ok(selected.start>=source.start&&selected.end<=source.end,
   "A selected reference must lie inside the original Atlas passage");
  if(link.relation==="EXACT_SELECTED_REFERENCE"){
   assert.equal(beat.kind,"SCRIPTURE");
   assert.equal(dest.reference,link.sourceReference);
   assert.ok(beat.refs.includes(link.sourceReference));
  }else if(link.relation==="SELECTED_SUBPASSAGE"){
   assert.equal(beat.kind,"SCRIPTURE");
   assert.ok(beat.refs.includes(link.sourceReference));
   assert.ok(link.sourceReference!==dest.reference);
  }else if(link.relation==="EDITORIAL_SOURCE_REFERENCE_ONLY"){
   assert.equal(beat.kind,"EDITORIAL_CONTEXT_NOT_BIBLE");
   assert.ok(beat.editorialReadingCandidate.sourceReferences.includes(link.sourceReference));
  }else assert.fail("No unreviewed Atlas relation class "+link.relation);
  shownEventKeys.add(link.atlasEventKey);
 }
 for(const issue of record.literaryDecisions){
  assert.ok(issue.id&&issue.status&&!issue.status.includes("APPROVED"));
  for(const ref of issue.sourceRefs)hasEveryVerse(ref);
  if(issue.sourceBeatId)assert.ok(beatMap.has(issue.sourceBeatId));
 }
}
// The scene-to-movement story is NOT equivalent to the Atlas navigation's
// own 37 chapters; the first Noah paragraph H05 lives in R02/arc 1 while
// the remaining Noah movement spans R03/R04/arc 2.
const noah=review.movementReviews[2];
assert.deepEqual(noah.researchChapterIds,["R02","R03","R04"]);
assert.deepEqual(noah.unfilledResearchOutlineIds,["H06"]);
assert.equal(noah.arcIds.length,2);
assert.ok(noah.originalSourceOnlyBeatIds.includes("HS-CF-01"));
const genesis=(ed,chapter,verse)=>witnesses[ed].get(chapter+":"+verse);
assert.match(genesis("dr-challoner",3,15),/she shall crush/);
assert.match(genesis("cpdv-2009",3,15),/She will crush/);
assert.match(genesis("crampon-1923",3,15),/celle-ci/);
assert.match(genesis("dr-challoner",8,4),/seven and twentieth.*Armenia/);
assert.match(genesis("crampon-1923",8,4),/dix-septième.*Ararat/);
assert.deepEqual({totalBeats,scripture,context,bridges,atlasKeys:shownEventKeys.size},
 {totalBeats:12,scripture:9,context:2,bridges:1,atlasKeys:5});
assert.equal(review.totals.originalP3BeatsReviewed,totalBeats);
assert.equal(review.totals.sourceOwnedScriptureBeatCount,scripture);
assert.equal(review.totals.editorialBeatCount,context);
assert.equal(review.totals.heldP3BridgeCount,bridges);
assert.equal(review.totals.distinctCanonicalAtlasEventKeys,shownEventKeys.size);
assert.equal(review.totals.releaseReadyMovements,0);
assert.equal(review.totals.independentOralReadingsApproved,0);
console.log("PASS Historia first 3 research movements: 12 existing beats, 3 Catholic witnesses, 5 exact-owned Atlas destinations, retained H06 and strict nonpublication gates");
