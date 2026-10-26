import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const audit=read("data/research/historia-salutis-p3-m04-m10-literary-review-20261023.v1.json");
const proof=read(audit.sourceOwner.proof);
const crosswalk=read(audit.sourceOwner.crosswalk);
const chapters=read(audit.sourceOwner.readingChapters);
const stops=buildBibleAtlas(read(audit.sourceOwner.atlas).entries);
const events=new Map(stops.map(s=>[s.eventKey,s]));
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const witness=new Map();
function passage(reference){
 const m=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(reference||"");
 assert.ok(m,"Source reference must have one named biblical book and chapter: "+reference);
 return {book:m[1],chapter:+m[2],start:+m[3],end:+(m[4]||m[3])};
}
function editionMap(book,edition){
 const key=edition+"/"+book;
 if(!witness.has(key)){
  const src=read("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(src.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(src.editionId,edition);
  assert.equal(src.book,book);
  witness.set(key,new Map(src.verses.map(v=>[v[0]+":"+v[1],v[2]])));
 }
 return witness.get(key);
}
function validInEdition(ref,edition){
 const p=passage(ref),map=editionMap(p.book,edition);
 if(p.end<p.start)return false;
 for(let verse=p.start;verse<=p.end;verse++){
  if(!map.get(p.chapter+":"+verse)?.trim())return false;
 }
 return true;
}
function inside(a,b){
 return a.book===b.book&&a.chapter===b.chapter&&a.start>=b.start&&a.end<=b.end;
}
assert.equal(audit.schema,"ao.historia.p3.m04-m10-source-critical-literary-review.v1");
assert.equal(audit.status,"SOURCE_WITNESS_DESK_RECOMMENDATIONS_NOT_APPLIED_OR_APPROVED");
assert.deepEqual(audit.reviews.map(v=>v.movementId),
 ["HS-M04","HS-M05","HS-M06","HS-M07","HS-M08","HS-M09","HS-M10"]);
assert.equal(proof.movements.length,37);
assert.equal(stops.length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(chapters.readingChapters.length,54);
assert.equal(crosswalk.arcs.length,12);
assert.equal(crosswalk.covenants.length,7);
assert.equal(audit.policy.allEnglishAndFrenchTranslationsAreUncollated,true);
assert.equal(audit.policy.theatreSceneAndGeolocationPublication,false);
assert.equal(audit.policy.proposedAdditionalScriptureAlwaysHeld,true);
let beatCount=0,scriptureCount=0,editorialCount=0,bridgeCount=0,issueCount=0,linkCount=0;
const ids=new Set();
for(const row of audit.reviews){
 const m=proof.movements.find(m=>m.id===row.movementId);
 assert.ok(m,"Cannot create a new movement in review");
 assert.deepEqual(row.beatIdsInCurrentOrder,m.beats.map(b=>b.id));
 assert.deepEqual(row.sourceOwnerChapterIds,m.originalResearchChapterIds);
 assert.deepEqual(row.researchReadingChapterIds,chapters.readingChapters.filter(ch=>
  ch.originalChapterIds.some(id=>m.originalResearchChapterIds.includes(id))).map(ch=>ch.id));
 assert.deepEqual(row.arcIds,crosswalk.arcs.filter(arc=>
  arc.chapterIds.some(id=>m.originalResearchChapterIds.includes(id))).map(arc=>arc.id));
 assert.equal(row.publicationApproved,false);
 assert.equal(row.oralReadthroughAccepted,false);
 assert.equal(row.editorialApproved,false);
 const beats=new Map(m.beats.map(b=>[b.id,b]));
 for(const b of m.beats){
  beatCount++;
  assert.equal(b.publicationApproved??false,false);
  if(b.kind==="SCRIPTURE"){
   scriptureCount++;
   for(const ed of editions)for(const ref of b.semanticEditionAlignment?.selectedReferencesByEdition?.[ed]||b.refs)
    assert.ok(validInEdition(ref,ed),ed+" missing selected "+ref);
  }else if(b.kind==="SOURCE_BRIDGE_CANDIDATE"){
   bridgeCount++;
   for(const ed of editions)assert.ok(validInEdition(b.reference,ed),ed+" missing held "+b.reference);
  }else if(b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"){
   editorialCount++;
   const c=b.editorialReadingCandidate;
   assert.ok(c?.text&&c.publicationApproved===false&&c.sourceReferences.length);
   for(const ed of editions)for(const ref of c.sourceReferencesByEdition?.[ed]||c.sourceReferences)
    assert.ok(validInEdition(ref,ed),"Editorial citation must respect selected edition: "+ed+" "+ref);
  }else assert.fail("Unknown beat type "+b.kind);
 }
 for(const issue of row.issues){
  issueCount++;assert.ok(!ids.has(issue.id));ids.add(issue.id);
  assert.equal(issue.publicationApproved,false);
  assert.equal(issue.oralReviewed,false);
  assert.ok(issue.sourceBoundedFinding.length>35);
  assert.ok(editions.some(ed=>validInEdition(issue.reference,ed)),
   "Research citation not found in any witness "+issue.reference);
 }
 for(const link of row.atlasEvidenceLinks){
  linkCount++;
  const b=beats.get(link.beatId),stop=events.get(link.atlasEventKey);
  assert.ok(b&&stop,"Cannot invent a source beat or canonical Atlas event");
  assert.ok(ATLAS_READING_CHAPTERS.some(ch=>ch.eventKeys.includes(stop.eventKey)),
   "Original Atlas event not a canonical navigation member");
  assert.equal(link.sourceOnly,true);
  assert.equal(link.noNewAtlasOwnership,true);
  const source=passage(link.sourceReference),atlas=passage(stop.reference);
  if(b.kind==="SCRIPTURE"){
   assert.ok(b.refs.includes(link.sourceReference),"Link must cite an original selected source span");
  }else if(b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"){
   assert.ok(b.editorialReadingCandidate.sourceReferences.includes(link.sourceReference),
    "Do not turn a prose-only reference into an accepted Bible episode");
  }else assert.fail("Held Scripture cannot automatically gain an Atlas event link");
  if(link.relation==="EXACT_SOURCE")assert.equal(link.sourceReference,stop.reference);
  else if(["SELECTED_WITHIN_ATLAS","EDITORIAL_BASIS_WITHIN_ATLAS"].includes(link.relation))
   assert.ok(inside(source,atlas),"Not a proper quoted subspan: "+link.sourceReference+" / "+stop.reference);
  else if(link.relation==="ATLAS_WITHIN_SELECTED")
   assert.ok(inside(atlas,source),"Atlas event not inside selected witness text");
  else if(link.relation==="EDITION_SENSITIVE_CONTAINMENT_ENGLISH_ONLY"){
   assert.ok(inside(atlas,source));
   assert.equal(link.beatId,"H15-02");
   assert.ok(proof.movements.find(m=>m.id==="HS-M05").beats.find(b=>b.id==="H15-02")
    .semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"][0]==="Genesis 32:23–33");
  }else assert.fail("New Atlas relationship requires explicit source review: "+link.relation);
 }
}
assert.deepEqual({beatCount,scriptureCount,editorialCount,bridgeCount,issueCount,linkCount},
 {beatCount:31,scriptureCount:22,editorialCount:7,bridgeCount:2,issueCount:23,linkCount:16});
assert.equal(audit.totals.originalBeatIds,beatCount);
assert.equal(audit.totals.scriptureBeats,scriptureCount);
assert.equal(audit.totals.editorialBeats,editorialCount);
assert.equal(audit.totals.heldBridgeBeats,bridgeCount);
assert.equal(audit.totals.issues,issueCount);
assert.equal(audit.totals.atlasEvidenceLinks,linkCount);
assert.equal(audit.totals.published,0);
assert.equal(audit.totals.oralApproved,0);
assert.ok(audit.reviews.find(m=>m.movementId==="HS-M08").issues.some(
 x=>x.reference==="Exodus 12:29–30"&&x.disposition==="P0_TRIAL_NATIVE_SCRIPTURE_NOT_ACCEPTED"));
const jacob=proof.movements.find(m=>m.id==="HS-M05").beats.find(b=>b.id==="H15-02").semanticEditionAlignment;
assert.deepEqual(jacob.selectedReferencesByEdition["crampon-1923"],["Genesis 32:23–33"]);
assert.deepEqual(jacob.selectedReferencesByEdition["dr-challoner"],["Genesis 32:22–32"]);
const cloud=proof.movements.find(m=>m.id==="HS-M10").beats.find(b=>b.id==="H23-02").editorialReadingCandidate;
assert.deepEqual(cloud.sourceReferencesByEdition["dr-challoner"],["Exodus 40:16–21","Exodus 40:32–36"]);
assert.deepEqual(cloud.sourceReferencesByEdition["crampon-1923"],["Exodus 40:16–21","Exodus 40:34–38"]);
console.log("PASS Historia M04-M10: 31 existing beats, 23 source issues, 16 Atlas links, three edition-specific witnesses, no false release or event identity");
