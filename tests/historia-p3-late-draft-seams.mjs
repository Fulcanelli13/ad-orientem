import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const proof=read("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const get=id=>{const m=proof.movements.find(v=>v.id===id);assert.ok(m,id);return m;};
const getBeat=(id,bid)=>{const v=get(id).beats.find(b=>b.id===bid);assert.ok(v,bid);return v;};
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const cache={};
const source=(book,edition)=>cache[book+edition]??(cache[book+edition]=read("data/scripture/witness/"+edition+"/"+book+".json"));
function verse(book,edition,c,v){return source(book,edition).verses.find(x=>x[0]===c&&x[1]===v)?.[2]??null}
function ids(refs,edition){
 const set=new Set();
 for(const r of refs){
  const m=r.match(/^(Genesis|Acts|John|Matthew|Revelation) (\d+):(\d+)(?:–(\d+))?$/);
  assert.ok(m,"Unexpected Scripture span "+r);
  for(let n=+m[3];n<=+(m[4]||m[3]);n++){
   assert.ok(verse(m[1],edition,+m[2],n),"Missing "+edition+" "+r+" verse "+n);
   set.add(m[1]+":"+m[2]+":"+n);
  }
 }
 return set;
}
assert.equal(proof.schema,"ao.historia.v18.continuous-scripture-proof.v1");
assert.equal(proof.stage,"REAL_VERSE_READ_THROUGH_PROOF_NOT_APPROVED");
assert.equal(proof.totals.movements,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(proof.totals.briefEditorialContextNotes,29);
assert.equal(proof.totals.sourceBridgeCandidates,16);
assert.equal(proof.totals.independentlyReadAndApproved,false);
const meta=proof.p4LateMovementDraft;
assert.equal(meta.status,"SOURCE_BACKED_EDITS_APPLIED_ON_P3_DRAFT_NOT_APPROVED");
assert.equal(meta.finishedCatholicPrintCollation,false);
assert.equal(meta.finishedSequentialOralReading,false);
assert.equal(meta.printedTextCollationRequired,true);
assert.equal(meta.publicationApproved,false);
assert.equal(meta.originalSourceBridgeCandidatesPreserved,10);
assert.equal(meta.revisedTotalSourceBridgeCandidates,16);
assert.equal(meta.additionalOriginalUnitVerseInsertions,19);
assert.equal(meta.newIndependentSourceBridgesFromBatch.length,5);
assert.deepEqual(proof.movements.map(m=>m.id),Array.from({length:37},(_,i)=>"HS-M"+String(i+1).padStart(2,"0")));
for(const id of ["HS-M20","HS-M21","HS-M22","HS-M24","HS-M26","HS-M27","HS-M29","HS-M31","HS-M32","HS-M33","HS-M34","HS-M35","HS-M36","HS-M37"])
 assert.ok(meta.editedMovementIds.includes(id),"Research edited-movement record missing "+id);
assert.deepEqual(get("HS-M20").beats.map(b=>b.id),["H51-01","H51-02","HS-P3-CF-17","H52-01","H51-03"]);
assert.equal(get("HS-M21").title,"The Kingdom in Christ's teaching");
assert.equal(get("HS-M26").title,"The Last Supper");
const expansions=[
 {mid:"HS-M22",id:"H56-02",before:["John 6:26–35","John 6:47–59"],after:["John 6:26–35","John 6:36–40","John 6:41–46","John 6:47–59"],lastBefore:["John 6:26–35","John 6:41–46","John 6:47–59"],extra:11},
 {mid:"HS-M24",id:"H58-04",before:["John 11:1–7","John 11:14–17","John 11:20–27","John 11:32–35","John 11:38–44"],after:["John 11:1–7","John 11:14–17","John 11:20–27","John 11:28–31","John 11:32–35","John 11:38–44"],extra:4},
 {mid:"HS-M29",id:"H65-01",before:["John 20:1–3","John 20:6–9","John 20:11–18"],after:["John 20:1–3","John 20:4–5","John 20:6–9","John 20:10","John 20:11–18"],extra:3},
 {mid:"HS-M31",id:"H67-01",before:["Acts 2:1–8","Acts 2:11–18","Acts 2:21","Acts 2:37–41"],after:["Acts 2:1–10","Acts 2:11–18","Acts 2:21","Acts 2:22–24","Acts 2:32–36","Acts 2:37–41"],extra:10},
 {mid:"HS-M32",id:"H69-01",before:["Acts 9:1–11","Acts 9:17–22"],after:["Acts 9:1–11","Acts 9:12–16","Acts 9:17–22"],extra:5},
 {mid:"HS-M32",id:"H70-01",before:["Acts 10:1–6","Acts 10:9–16","Acts 10:19–20","Acts 10:24","Acts 10:28–29","Acts 10:33–48"],lastBefore:["Acts 10:1–6","Acts 10:7–8","Acts 10:9–16","Acts 10:19–20","Acts 10:24","Acts 10:28–29","Acts 10:30–32","Acts 10:33–48"],after:["Acts 10:1–6","Acts 10:7–8","Acts 10:9–16","Acts 10:19–20","Acts 10:21–23","Acts 10:24","Acts 10:28–29","Acts 10:30–32","Acts 10:33–48"],extra:8},
 {mid:"HS-M33",id:"H72-01",before:["Acts 15:1–2","Acts 15:5–11","Acts 15:13–20","Acts 15:22–29"],after:["Acts 15:1–2","Acts 15:4–11","Acts 15:12","Acts 15:13–20","Acts 15:22–29"],extra:2}
];
let delta=0;
for(const e of expansions){
 const b=getBeat(e.mid,e.id);
 assert.equal(b.kind,"SCRIPTURE");
 assert.equal(b.edition,"cpdv-2009");
 assert.equal(b.publicationApproved,false);
 assert.deepEqual(b.refs,e.after);
 assert.equal(b.researchRevision.status,"SOURCE_RESTORED_RESEARCH_PROPOSAL_NOT_APPROVED");
 assert.equal(b.researchRevision.printingAndOralSignOffPending,true);
 assert.equal(b.researchRevision.retainsOriginalUnitId,true);
 assert.deepEqual(b.researchRevision.priorCuratedRefs,e.lastBefore||e.before);
 for(const ed of editions){
  const original=ids(e.before,ed),curated=ids(e.after,ed);
  assert.equal(curated.size-original.size,e.extra,"Wrong verse delta "+e.id+" "+ed);
 }
 delta+=e.extra;
}
assert.equal(delta,43,"Original 40-verse continuity batch plus 3 later source-seam restorations");
for(const [mid,bid,inserted] of [["HS-M31","H67-01",["Acts 2:9","Acts 2:10"]],["HS-M33","H72-01",["Acts 15:4"]]]){
 const r=getBeat(mid,bid).subsequentLiterarySeamRepair;
 assert.equal(r.status,"RESEARCH_SOURCE_COORDINATE_REPAIRED_NOT_APPROVED");
 assert.deepEqual(r.restoredSourceVerses,inserted);
 assert.equal(r.threeWitnessLocationsChecked,true);
 assert.equal(r.publicationApproved,false);
}
assert.equal(proof.literaryReviewProgress.movementsDeskExamined,37);
assert.equal(proof.literaryReviewProgress.fullSequentialReadthroughComplete,false);
assert.equal(getBeat("HS-M32","H69-01").researchRevision.sourceWitnessTextFlags[0].status,"PRINTED_EDITION_COLLATION_REQUIRED_NO_AUTO_CORRECTION");
assert.match(verse("Acts","cpdv-2009",9,12),/Paul saw/);
assert.match(verse("Acts","dr-challoner",9,12),/he saw a man/);
const originalBridgeIds=["HS-CF-01","HS-CF-02","HS-CF-03","HS-CF-05","HS-CF-06","HS-CF-07","HS-CF-08","HS-CF-09","HS-CF-10","HS-CF-11"];
const newBridgeDefinitions=[
 ["HS-P3-CF-12","HS-M33","Acts 14:26–27"],
 ["HS-P3-CF-13","HS-M34","Acts 28:17–22"],
 ["HS-P3-CF-14","HS-M35","Revelation 4:1–2"],
 ["HS-P3-CF-15","HS-M37","Revelation 21:9–10"],
 ["HS-P3-CF-16","HS-M37","Revelation 22:20–21"],
 ["HS-P3-CF-17","HS-M20","John 1:29–34"]
];
const bridges=proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE").map(b=>({...b,movementId:m.id})));
assert.equal(bridges.length,16);
assert.equal(new Set(bridges.map(x=>x.id)).size,16);
assert.deepEqual(bridges.filter(x=>originalBridgeIds.includes(x.id)).map(x=>x.id).sort(),originalBridgeIds.sort());
for(const [id,mid,r] of newBridgeDefinitions){
 const b=getBeat(mid,id);
 assert.equal(b.kind,"SOURCE_BRIDGE_CANDIDATE");
 assert.equal(b.reference,r);
 assert.equal(b.editorialOwnerId,id);
 assert.equal(b.p3SourceOwnership,"NEW_INDEPENDENT_SCRIPTURE_SOURCE_BRIDGE_NOT_ORIGINAL_V18_ESSENTIAL");
 assert.equal(b.status,"UNAPPROVED_SOURCE_COORDINATE_REFERENCE");
 assert.equal(b.publicationApproved,false);
 for(const ed of editions)ids([r],ed);
}
assert.deepEqual(get("HS-M33").beats.map(b=>b.id),["H71-01","H71-02","HS-P3-CF-12","H72-01"]);
assert.deepEqual(get("HS-M34").beats.map(b=>b.id),["HS-CF-10","HS-CF-11","HS-P3-CF-13","H73-07"]);
assert.deepEqual(get("HS-M37").beats.map(b=>b.id),["H78-01","HS-P3-CF-15","H78-02","HS-P3-CF-16"]);
const burial=getBeat("HS-M28","HS-CF-06");
assert.equal(burial.researchCuration.originalBridgeOwnershipRetained,true);
assert.equal(burial.researchCuration.publicationApproved,false);
assert.match(verse("John","dr-challoner",19,42),/laid Jesus/);
assert.match(verse("Acts","dr-challoner",14,26),/door of faith to the Gentiles/);
const stephen=getBeat("HS-M31","H68-04").semanticEditionAlignment;
assert.equal(stephen.selectedReferencesByEdition["dr-challoner"][0],"Acts 7:54–59");
assert.equal(stephen.selectedReferencesByEdition["cpdv-2009"][0],"Acts 7:54–59");
assert.equal(stephen.selectedReferencesByEdition["crampon-1923"][0],"Acts 7:54–60");
assert.equal(stephen.lastPrayerAndDeathByEdition["crampon-1923"],"Acts 7:60");
assert.equal(verse("Acts","dr-challoner",7,60),null);
assert.equal(verse("Acts","cpdv-2009",7,60),null);
assert.match(verse("Acts","crampon-1923",7,60),/imputez pas ce péché/);
const bread=getBeat("HS-M22","H56-02").semanticEditionAlignment;
assert.equal(bread.synagogueSentenceVerse["cpdv-2009"],"John 6:60");
assert.equal(bread.synagogueSentenceVerse["crampon-1923"],"John 6:59");
assert.equal(bread.noBlindNumericAlignment,true);
for(const id of ["HS-M35","HS-M36","HS-M37"]){
 const v=get(id).genreRules;
 assert.equal(v.modernEarthCoordinatesApproved,false);
 assert.equal(v.publicationApproved,false);
}
assert.equal(get("HS-M37").genreRules.appendedEpilogueStillUnapproved,true);

assert.equal(meta.allSourceBridgeCoordinatesTriaged,true);
assert.equal(meta.sourceBridgeCandidateCount,16);
assert.equal(meta.optionalPassageRawVerseEntries,66);
assert.equal(meta.allBridgePrintedEditionsPending,true);
assert.equal(meta.allBridgePublicationApprovals,0);
let bridgeEntries=0;
for(const b of bridges){
 const c=b.completeSourceDeskReview;
 assert.equal(c.status,"COORDINATES_SOURCE_PRESENT_EDITORIAL_DECISION_PENDING");
 assert.equal(c.exactPassage,b.reference);
 assert.equal(c.sourceTextCopiedIntoRegistry,false);
 assert.equal(c.printedEditionVerified,false);
 assert.equal(c.oralReadAloudAccepted,false);
 assert.equal(c.publicationApproved,false);
 assert.equal(c.noImplicitCanonicalEventOrPlaceIdentity,true);
 assert.ok(c.role&&c.editorialRationale);
 const match=b.reference.match(/^(Genesis|John|Acts|Revelation) (\d+):(\d+)(?:–(\d+))?$/);
 assert.ok(match,"Unrecognized source-bridge Bible ref "+b.reference);
 const entries=+(match[4]||match[3])-(+match[3])+1;
 for(const ed of editions){
  assert.equal(c.sourceEditions[ed].verseEntries,entries);
  assert.match(c.sourceEditions[ed].blobSha,/^[a-f0-9]{40}$/);
  ids([b.reference],ed);
 }
 bridgeEntries+=entries;
}
assert.equal(bridgeEntries,66);
for(const m of proof.movements.filter(x=>x.sequence>=20)){
 let previous=null;
 for(const b of m.beats){
  if(b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE")continue;
  const references=b.kind==="SOURCE_BRIDGE_CANDIDATE"?[b.reference]:b.refs;
  for(const r of references){
   const found=r.match(/^([1-3]?[A-Za-z]+)\s+(\d+):(\d+)(?:–(?:(\d+):)?(\d+))?$/);
   assert.ok(found,"Unparseable movement source range "+r);
   const here={book:found[1],startCh:+found[2],startV:+found[3],endCh:+(found[4]||found[2]),endV:+(found[5]||found[3])};
   if(previous&&previous.book===here.book){
    assert.ok(here.startCh>previous.endCh||(here.startCh===previous.endCh&&here.startV>previous.endV),
      "Chronological source inversion/duplicate within "+m.id+": "+previous.endCh+":"+previous.endV+" -> "+r);
   }
   previous=here;
  }
 }
}
assert.ok(meta.editorialHolds.some(x=>x.movementId==="HS-M27"&&x.reference==="Matthew 27:3–10"&&x.publicationApproved===false));
assert.equal(get("HS-M27").beats.some(x=>x.id==="HS-P3-CF-18"),false);

assert.equal(proof.movements.reduce((n,m)=>n+m.beats.filter(b=>b.kind==="SCRIPTURE").length,0),93);
assert.equal(proof.movements.reduce((n,m)=>n+m.beats.filter(b=>b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE").length,0),29);
for(const m of proof.movements){
 assert.equal(m.readAloudAccepted,false);
 assert.equal(m.readyForPublication,false);
 for(const b of m.beats)assert.equal(b.publicationApproved??false,false);
}
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.ok(html.includes('id="historiaProofBridges" type="checkbox" checked'),"Readthrough includes unapproved source options clearly labelled");
assert.ok(html.includes("Unapproved source-bridge candidate"),"Candidate provenance must remain visible");
console.log("PASS Historia P3 broad source-adjudication: 37 movements/93 A/29 context, +43 verses in A across two research seam passes, 10 original+6 P3-owned bridge candidates, Stephen/French and visionary holds");
