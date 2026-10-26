import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const raw=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const read=p=>JSON.parse(raw(p));
const audit=read("data/research/historia-salutis-p3-p0-incontext-integrity-review-20261023.v1.json");
const proof=read(audit.sourceOwners.proof.path);
const min=read(audit.sourceOwners.minimumLedger.path);
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const idx=new Map();
function passage(ref){
 const q=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(ref);
 assert.ok(q,"Must use native Bible source coordinates: "+ref);
 return {book:q[1],ch:+q[2],first:+q[3],last:+(q[4]||q[3])};
}
function witness(ed,book){
 const k=ed+"/"+book;
 if(!idx.has(k)){
  const d=read("data/scripture/witness/"+ed+"/"+book+".json");
  assert.equal(d.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  idx.set(k,new Map(d.verses.map(([ch,v,text])=>[ch+":"+v,text])));
 }
 return idx.get(k);
}
function span(ref,ed){
 const p=passage(ref),source=witness(ed,p.book),parts=[];
 assert.ok(p.first<=p.last,"Invalid reverse range "+ref);
 for(let v=p.first;v<=p.last;v++){
  const text=source.get(p.ch+":"+v);
  assert.ok(text?.trim(),ed+" source missing or blank "+p.book+" "+p.ch+":"+v);
  parts.push(text);
 }
 return {verses:parts.length,words:parts.join(" ").trim().split(/\s+/).length};
}
assert.equal(audit.schema,"ao.historia.p3.p0-seam-incontext-textual-integrity-review.v1");
assert.equal(audit.status,"NONPUBLISHING_SOURCE_IN_CONTEXT_COMPARISON_NOT_AN_ORAL_READING");
assert.equal(audit.policies.newCompulsoryPassages,0);
assert.equal(audit.policies.humanReadAloudStillRequired,true);
assert.equal(audit.policies.humanTheologicalReviewRequired,true);
assert.equal(audit.policies.sourceWordsNotEdited,true);
assert.equal(audit.policies.existingSelectedScriptureUnchanged,true);
assert.equal(audit.policies.allEditorialConnectionsNamedAsEditorial,true);
assert.equal(buildBibleAtlas(read("data/explore/bible-places-compact.v1.json").entries).length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(proof.movements.length,37);
assert.equal(proof.totals.essentialUnits,93);
assert.deepEqual(audit.sections.map(s=>s.hinge),min.options.map(s=>s.hinge));
const types=["EXISTING_SELECTED_SCRIPTURE_RESEARCH_NOT_APPROVED","OPTIONAL_ORIGINAL_SCRIPTURE_NOT_APPROVED",
 "EDITORIAL_SOURCE_CONTEXT_UNAPPROVED","REQUIRED_EDITORIAL_GENRE_LABEL_NOT_BIBLE"];
let trialCount=0,segmentCount=0,roles=0;
for(const flow of audit.sections){
 const hinge=min.options.find(o=>o.hinge===flow.hinge);
 assert.ok(hinge);
 assert.equal(flow.sourceOwner,hinge.destination);
 assert.equal(flow.firstSelectedAfter,undefined);
 assert.equal(flow.leadIn,hinge.lastSelectedBefore);
 assert.equal(flow.mainFirst,hinge.firstSelectedAfter);
 assert.equal(flow.passesMechanicalCausalTest,true);
 assert.ok(flow.editorialFinding.length>160);
 assert.ok(flow.theologyRisk.length>75);
 assert.ok(flow.essentialVerseRoles.length>=4);
 for(const [ref,role] of flow.essentialVerseRoles){
  roles++;
  assert.ok(role.length>17);
  for(const ed of editions)assert.ok(span(ref,ed).verses>=1);
 }
 for(const block of flow.proposedSequence){
  segmentCount++;
  assert.ok(types.includes(block.kind));
  const owner=proof.movements.flatMap(m=>m.beats).find(b=>b.id===block.originalBeatId);
  assert.ok(owner,"Cannot invent beat "+block.originalBeatId);
  const allowed=owner.kind==="SCRIPTURE"?owner.refs:owner.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"?
    owner.editorialReadingCandidate.sourceReferences:
    [owner.reference,...(owner.readthroughTrial?.refs||[])];
  const optional=owner.readthroughTrial?.refs||owner.afterSelectedReadthroughTrial?.refs||
    (owner.reference?[owner.reference]:[]);
  if(block.kind==="OPTIONAL_ORIGINAL_SCRIPTURE_NOT_APPROVED"){
   trialCount++;
   assert.equal(owner.kind==="SOURCE_BRIDGE_CANDIDATE"||owner.kind==="SCRIPTURE",true);
   assert.ok(block.refs.every(r=>optional.includes(r)),"Native optional source must be explicitly owned and still unapproved");
  }
  if(block.kind==="EXISTING_SELECTED_SCRIPTURE_RESEARCH_NOT_APPROVED"){
   assert.equal(owner.kind,"SCRIPTURE");
   assert.ok(block.refs.every(r=>allowed.includes(r)),"Do not fabricate a selected biblical passage");
  }
  if(block.kind==="REQUIRED_EDITORIAL_GENRE_LABEL_NOT_BIBLE")
   assert.equal(owner.kind,"EDITORIAL_CONTEXT_NOT_BIBLE");
  for(const ed of editions){
   const refs=block.refsByEdition?.[ed]||block.refs;
   assert.ok(Array.isArray(refs));
   for(const r of refs)span(r,ed);
  }
 }
}
assert.equal(segmentCount,19);
assert.equal(trialCount,7);
assert.equal(audit.totals.criticalHinges,5);
assert.equal(audit.totals.inContextSegments,segmentCount);
assert.equal(audit.totals.unapprovedScriptureTrials,trialCount);
assert.equal(audit.totals.humanOralAcceptances,0);
assert.equal(audit.totals.originalTextSelectedPassagesAltered,0);
const genesis=proof.movements.find(m=>m.id==="HS-M03").beats.find(b=>b.id==="H05-02").editorialReadingCandidate;
assert.deepEqual(genesis.sourceReferencesByEdition,audit.genealogyCorrection.sourceRefByEdition);
assert.deepEqual(genesis.sourceReferences,["Genesis 4:25–26","Genesis 5:28–32"]);
assert.equal(witness("dr-challoner","Genesis").has("5:32"),false);
assert.equal(witness("cpdv-2009","Genesis").has("5:32"),false);
assert.match(witness("dr-challoner","Genesis").get("5:31"),/Noe.*begot Sem, Cham, and Japheth/i);
assert.match(witness("cpdv-2009","Genesis").get("5:31"),/Noah.*Shem, Ham, and Japheth/i);
assert.match(witness("crampon-1923","Genesis").get("5:32"),/Noé.*Sem, Cham et Japheth/i);
for(const ed of editions){
 const first=ed==="crampon-1923"?"Genesis 5:28–32":"Genesis 5:28–31";
 assert.equal(genesis.sourceReferencesByEdition[ed][1],first);
 assert.equal(span(first,ed).verses,ed==="crampon-1923"?5:4);
}
const anno=raw("data/research/historia-salutis-p3-assembled-dr-challoner.v1.md");
const reading=raw("data/research/historia-salutis-p3-continuous-research-reading-dr-challoner.v1.md");
assert.ok(anno.includes("Genesis 4:25–26; Genesis 5:28–31"));
assert.ok(reading.includes("Genesis 4:25–26; Genesis 5:28–31"));
assert.ok(!anno.includes("Genesis 5:28–32"));
assert.ok(!reading.includes("Genesis 5:28–32"));
const tabernacle=proof.movements.find(m=>m.id==="HS-M10").beats
 .find(b=>b.id==="H23-02").editorialReadingCandidate;
assert.deepEqual(tabernacle.sourceReferencesByEdition["dr-challoner"],["Exodus 40:16–21","Exodus 40:32–36"]);
assert.deepEqual(tabernacle.sourceReferencesByEdition["cpdv-2009"],["Exodus 40:16–21","Exodus 40:32–36"]);
assert.deepEqual(tabernacle.sourceReferencesByEdition["crampon-1923"],["Exodus 40:16–21","Exodus 40:34–38"]);
for(const ed of editions)for(const p of tabernacle.sourceReferencesByEdition[ed])span(p,ed);
assert.ok(anno.includes("Exodus 40:16–21; Exodus 40:32–36"));
assert.ok(reading.includes("Exodus 40:16–21; Exodus 40:32–36"));
assert.ok(!anno.includes("Exodus 40:16–21; Exodus 40:34–38"));
assert.ok(!reading.includes("Exodus 40:16–21; Exodus 40:34–38"));
const j=audit.john19IntegrityEconomy;
assert.deepEqual([j.testimonyAndPiercingRef,j.burialRef],["John 19:31–37","John 19:38–42"]);
assert.equal(j.readingOnlyComparison,true);
assert.equal(j.doctrinalVerdict,"UNAPPROVED_NEEDS_CATHOLIC_HUMAN_COMMENTARY_AND_LITURGICAL_REVIEW");
assert.equal(j.testimonyAndPiercingDouayWords,span("John 19:31–37","dr-challoner").words);
assert.equal(j.burialDouayWords,span("John 19:38–42","dr-challoner").words);
assert.equal(j.wholeTrialDouayWords,j.testimonyAndPiercingDouayWords+j.burialDouayWords);
assert.equal(j.incrementalPiercedSideSecondsAt130Wpm,Math.round(j.testimonyAndPiercingDouayWords/130*60));
assert.equal(j.wholePassageSecondsAt130Wpm,Math.round(j.wholeTrialDouayWords/130*60));
const passion=audit.sections.find(x=>x.hinge==="HS-HINGE-28");
assert.equal(passion.independentTheologicalWitnessReview.notAutomaticallyDiscarded,true);
assert.equal(passion.independentTheologicalWitnessReview.status,"NO_HUMAN_THEOLOGICAL_SIGNOFF");
assert.equal(passion.independentTheologicalWitnessReview.doctrinalTopicsPresentInSource.length,4);
assert.equal(passion.independentTheologicalWitnessReview.interpretiveTopicsHeldOutsideNarration.length,4);
for(const ed of editions){
 const w=witness(ed,"John");
 assert.match(w.get("19:34"),ed==="crampon-1923"?/sang.*eau/i:/blood.*water/i);
 assert.match(w.get("19:35"),ed==="crampon-1923"?/témoignage.*vrai/i:/testimony.*true/i);
 assert.match(w.get("19:36"),ed==="crampon-1923"?/Écriture/i:/Scripture/i);
 assert.match(w.get("19:38"),ed==="crampon-1923"?/Joseph d.Arimathie/i:/Joseph.*Arimathea/i);
 assert.match(w.get("19:42"),ed==="crampon-1923"?/déposèrent Jésus/i:/laid Jesus|placed Jesus/i);
}
assert.ok(audit.sections.find(x=>x.hinge==="HS-HINGE-34").proposedSequence.some(x=>x.kind==="REQUIRED_EDITORIAL_GENRE_LABEL_NOT_BIBLE"));
console.log("PASS Historia five in-context source sequences: 19 research segments, 7 unapproved trial slots, John 19 eyewitness/testimony integrity, correct English Genesis 5:31 vs French 5:32, exact Douay manuscripts, zero publication or oral-theological approval");
