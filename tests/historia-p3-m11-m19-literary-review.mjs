import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const audit=read("data/research/historia-salutis-p3-m11-m19-literary-review-20261023.v1.json");
const proof=read(audit.sourceOwners.p3Proof);
const crosswalk=read(audit.sourceOwners.p0Crosswalk);
const chapters=read(audit.sourceOwners.p3ChapterProjection);
const atlas=buildBibleAtlas(read(audit.sourceOwners.canonicalAtlas).entries);
const atlasByKey=new Map(atlas.map(x=>[x.eventKey,x]));
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const witnesses=new Map();
function parse(ref){
 const a=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(ref||"");
 assert.ok(a,"Unexpected source reference syntax "+ref);
 const result={book:a[1],chapter:+a[2],first:+a[3],last:+(a[4]||a[3])};
 assert.ok(result.last>=result.first);
 return result;
}
function within(small,large){
 return small.book===large.book&&small.chapter===large.chapter&&
  small.first>=large.first&&small.last<=large.last;
}
function witness(book,edition){
 const k=edition+"/"+book;
 if(!witnesses.has(k)){
  const data=read("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(data.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(data.book,book);assert.equal(data.editionId,edition);
  witnesses.set(k,new Map(data.verses.map(([c,v,t])=>[c+":"+v,t])));
 }
 return witnesses.get(k);
}
function citationExists(ref,ed){
 const p=parse(ref),verses=witness(p.book,ed);
 for(let v=p.first;v<=p.last;v++)if(!verses.get(p.chapter+":"+v)?.trim())return false;
 return true;
}
assert.equal(audit.schema,"ao.historia.p3.m11-m19-source-critical-literary-review.v1");
assert.equal(audit.status,"THREE_WITNESS_DESK_EVIDENCE_AND_EDITORIAL_RECOMMENDATIONS_ONLY");
assert.equal(audit.policies.finalSequentialOralReadthrough,false);
assert.equal(audit.policies.catholicEditorialSignoff,false);
assert.equal(audit.policies.citationsAreWITNESS_UNCOLLATED,true);
assert.equal(audit.policies.noNewAtlasEventKeys,true);
assert.equal(atlas.length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(chapters.readingChapters.length,54);
assert.equal(crosswalk.covenants.length,7);
assert.equal(proof.movements.length,37);
assert.deepEqual(audit.reviews.map(m=>m.movementId),
 ["HS-M11","HS-M12","HS-M13","HS-M14","HS-M15","HS-M16","HS-M17","HS-M18","HS-M19"]);
const counts={movements:0,originalBeats:0,scriptureBeats:0,editorialBeats:0,heldBridgeBeats:0,sourceBoundedDecisions:0,atlasCrossrefs:0,literaryAcceptance:0,publicationApprovals:0};
const issueIds=new Set(),linkedEvents=new Set();
for(const row of audit.reviews){
 counts.movements++;
 const movement=proof.movements.find(x=>x.id===row.movementId);
 assert.ok(movement,"Must preserve existing movement keys");
 assert.deepEqual(row.sourceBeatIds,movement.beats.map(b=>b.id));
 assert.deepEqual(row.originalOutlineIds,movement.originalResearchChapterIds);
 assert.deepEqual(row.readingChapterIds,chapters.readingChapters.filter(c=>
  c.originalChapterIds.some(k=>movement.originalResearchChapterIds.includes(k))).map(c=>c.id));
 assert.deepEqual(row.arcIds,crosswalk.arcs.filter(c=>
  c.chapterIds.some(k=>movement.originalResearchChapterIds.includes(k))).map(c=>c.id));
 assert.equal(row.editorialApproval,false);
 assert.equal(row.oralAcceptance,false);
 assert.equal(row.publicationApproved,false);
 const beats=new Map(movement.beats.map(b=>[b.id,b]));
 for(const beat of movement.beats){
  counts.originalBeats++;
  assert.equal(beat.publicationApproved??false,false);
  if(beat.kind==="SCRIPTURE"){
   counts.scriptureBeats++;
   for(const edition of editions){
    const refs=beat.semanticEditionAlignment?.selectedReferencesByEdition?.[edition]||beat.refs;
    for(const ref of refs)assert.ok(citationExists(ref,edition),"Missing selected "+edition+" "+ref);
   }
  }else if(beat.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"){
   counts.editorialBeats++;
   assert.equal(beat.editorialReadingCandidate?.publicationApproved,false);
   assert.ok(beat.editorialReadingCandidate?.sourceReferences?.length>0);
  }else if(beat.kind==="SOURCE_BRIDGE_CANDIDATE"){
   counts.heldBridgeBeats++;
   assert.equal(beat.publicationApproved,false);
  }else assert.fail("No unrecognized public narrative type "+beat.kind);
 }
 for(const issue of row.decisions){
  counts.sourceBoundedDecisions++;
  assert.ok(!issueIds.has(issue.id));issueIds.add(issue.id);
  assert.ok(issue.rationale.length>40&&issue.disposition);
  assert.equal(issue.publicationApproved,false);
  assert.equal(issue.oralReadthroughAccepted,false);
  assert.equal(issue.sourceEditionPrintedCollation,false);
  for(const edition of editions){
   assert.ok(citationExists(issue.sourceRef,edition),"Editorial claim source not in "+edition+": "+issue.sourceRef);
  }
 }
 for(const link of row.atlasLinks){
  counts.atlasCrossrefs++;
  const beat=beats.get(link.beatId),destination=atlasByKey.get(link.atlasEventKey);
  assert.ok(beat&&destination,"Source-only link cannot create fake Atlas key/beat");
  assert.ok(ATLAS_READING_CHAPTERS.some(c=>c.eventKeys.includes(link.atlasEventKey)),
    "Existing canonical 37 chapters must own linked Atlas key");
  assert.equal(link.status,"SOURCE_RESEARCH_LINK_NOT_PUBLICATION_AUTHORIZATION");
  const linkedRef=parse(link.ref),atlasRef=parse(destination.reference);
  const isSelected=beat.kind==="SCRIPTURE";
  const srcs=isSelected?beat.refs:beat.editorialReadingCandidate?.sourceReferences||[];
  if(link.relation==="EXACT_SELECTED"){
   assert.ok(isSelected&&srcs.includes(link.ref));
   assert.equal(link.ref,destination.reference);
  }else if(link.relation==="SELECTED_WITHIN_ATLAS"){
   assert.ok(isSelected&&srcs.includes(link.ref)&&within(linkedRef,atlasRef));
  }else if(link.relation==="ATLAS_WITHIN_SELECTED"){
   assert.ok(isSelected&&srcs.some(src=>within(atlasRef,parse(src))));
  }else if(link.relation==="EDITORIAL_SOURCE_WITHIN_ATLAS"){
   assert.ok(!isSelected&&srcs.includes(link.ref)&&within(linkedRef,atlasRef));
  }else if(link.relation==="EDITORIAL_EXACT_SOURCE"){
   assert.ok(!isSelected&&srcs.includes(link.ref)&&link.ref===destination.reference);
  }else if(link.relation==="EDITORIAL_SOURCE_WITHIN_ATLAS_WIDER"){
   assert.ok(!isSelected&&link.ref===destination.reference);
   assert.ok(srcs.some(ref=>within(linkedRef,parse(ref))),
    "Cannot collapse two Egypt episodes into one canonical event");
  }else assert.fail("Unreviewed relation "+link.relation);
  linkedEvents.add(link.atlasEventKey);
 }
}
assert.deepEqual(counts,audit.totals);
const isaiah=proof.movements.find(m=>m.id==="HS-M15").beats.find(b=>b.id==="H38-03");
assert.deepEqual(isaiah.refs,["Isaiah 9:1–6"]);
assert.deepEqual(isaiah.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],
 ["Isaiah 8:23","Isaiah 9:1–5"]);
assert.match(witness("Isaiah","dr-challoner").get("9:6"),/CHILD IS BORN/i);
assert.match(witness("Isaiah","cpdv-2009").get("9:6"),/child is born/i);
assert.match(witness("Isaiah","crampon-1923").get("9:5"),/enfant nous est né/i);
assert.match(witness("Isaiah","crampon-1923").get("8:23"),/Zabulon/i);
assert.ok(!atlasByKey.has("biblical:passage:2samuel-7-12-16"),
 "David covenant may not invent an Atlas event");
assert.ok(!atlasByKey.has("biblical:passage:jeremiah-31-31-34"),
 "New Covenant may not invent an Atlas event");
assert.ok(!atlasByKey.has("biblical:passage:1maccabees-2-15-28"),
 "Mattathias protest is not the existing Atlas 2:1–5 event");
assert.equal(audit.reviews.find(m=>m.movementId==="HS-M17").sourceBeatIds.length,5);
assert.equal(audit.reviews.find(m=>m.movementId==="HS-M19").atlasLinks.filter(l=>l.beatId==="H49-03").length,2);
assert.ok(linkedEvents.size<=counts.atlasCrossrefs);
console.log("PASS Historia M11–M19: 42 source-owned beats, 46 attested review decisions, 23 nonpublishing Atlas links, and Isaiah 8:23/9:1–5 Catholic witness protection");
