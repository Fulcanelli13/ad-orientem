import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const desk=read("../data/research/historia-p4-m25-m37-literary-seam-adjudication.v1.json");
const proof=read("../data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const queue=read("../data/research/historia-p4-m20-m37-literary-review-queue.v1.json");
const early=read("../data/research/historia-p4-m20-m24-literary-seam-adjudication.v1.json");
const budget=read("../data/research/historia-p4-late-movement-bridge-verse-budget.v1.json");
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const books=["Matthew","Luke","John","Acts","Revelation"];
const bib={};
for(const book of books){
 bib[book]={};
 for(const edition of editions){
  const w=read("../data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(w.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  bib[book][edition]=w.verses;
 }
}
function parse(ref){
 const m=ref.match(/^(Matthew|Luke|John|Acts|Revelation) (\d+):(\d+)(?:[–—-](?:(\d+):)?(\d+))?$/);
 assert.ok(m,"Invalid reference "+ref);
 return {book:m[1],ch:+m[2],v:+m[3],endCh:+(m[4]||m[2]),endV:+(m[5]||m[3])};
}
function verse(book,ed,ch,n){return bib[book][ed].find(x=>x[0]===ch&&x[1]===n)?.[2]??null}
function readRange(r,edition){
 const a=parse(r);
 return bib[a.book][edition].filter(x=>(x[0]>a.ch||x[0]===a.ch&&x[1]>=a.v)&&(x[0]<a.endCh||x[0]===a.endCh&&x[1]<=a.endV));
}
assert.equal(desk.status,"SOURCE_ANCHORED_PROPOSED_EDITORIAL_DECISIONS_NOT_APPLIED");
assert.equal(desk.movements.length,13);
assert.equal(desk.counts.highPriorityP0Rows,6);
assert.equal(desk.controls.appliedNarrativeReorderings,0);
assert.equal(desk.controls.appliedScriptureBridges,0);
assert.equal(desk.controls.publishedChanges,0);
assert.equal(desk.controls.sourceTextFabricationForbidden,true);
assert.equal(desk.controls.apocalypticCoordinatesForbidden,true);
const ids=new Set([...early.findings.map(x=>x.movementId),...desk.movements.map(x=>x.movementId)]);
assert.equal(ids.size,18);
assert.deepEqual([...ids],Array.from({length:18},(_,i)=>"HS-M"+(i+20)));
for(const [i,issue] of desk.movements.entries()){
 assert.equal(issue.movementId,"HS-M"+(i+25));
 assert.equal(issue.productionGate,"HOLD");
 assert.equal(issue.proposalStatus,"RESEARCH_RECOMMENDATION_NOT_APPLIED");
 assert.equal(issue.originalP3Unmodified,true);
 assert.equal(issue.oralReadingSignedOff,false);
 assert.equal(issue.actorAndParallelAccountsApproved,false);
 const movement=proof.movements.find(m=>m.id===issue.movementId);
 const backlog=queue.movements.find(m=>m.movementId===issue.movementId);
 assert.ok(movement);
 assert.ok(backlog);
 assert.equal(backlog.publicationApproved,false);
 assert.equal(backlog.readAloudAccepted,false);
 const canonical=movement.beats.filter(b=>b.kind==="SCRIPTURE").flatMap(b=>b.refs||[]);
 assert.deepEqual(issue.selectedScriptureReferences,canonical);
 const held=movement.beats.filter(b=>b.kind==="SOURCE_BRIDGE_CANDIDATE").map(b=>({id:b.id,reference:b.reference}));
 assert.deepEqual(issue.originalHeldBridgeCandidates,held);
 for(const bridge of issue.proposedAdditionalSelectedScripture){
  assert.equal(canonical.includes(bridge),false,"Candidate must not be falsely represented as already selected: "+bridge);
 }
 for(const [reference,matches] of Object.entries(issue.anchorEvidence)){
  const a=parse(reference);
  for(const edition of editions){
   const chosen=readRange(reference,edition);
   assert.equal(chosen.length,matches.editionVerseEntries[edition]);
   if(reference==="Acts 7:60"&&edition!=="crampon-1923"){
    assert.equal(chosen.length,0,"Do not invent an English Acts 7:60");
   }else{
    assert.ok(chosen.length>0,"Absent Scripture: "+reference+" "+edition);
   }
  }
 }
}
const byId=new Map(desk.movements.map(m=>[m.movementId,m]));
assert.deepEqual(byId.get("HS-M29").proposedAdditionalSelectedScripture,["John 20:4–5","John 20:10"]);
assert.match(verse("John","dr-challoner",20,10),/departed again/i);
assert.equal(byId.get("HS-M28").originalHeldBridgeCandidates.some(b=>b.id==="HS-CF-06"),true);
assert.equal(byId.get("HS-M30").originalHeldBridgeCandidates.some(b=>b.id==="HS-CF-07"),true);
assert.equal(byId.get("HS-M31").originalHeldBridgeCandidates.some(b=>b.id==="HS-CF-08"),true);
assert.equal(byId.get("HS-M26").originalHeldBridgeCandidates.some(b=>b.id==="HS-CF-09"),true);
assert.equal(byId.get("HS-M34").originalHeldBridgeCandidates.some(b=>b.id==="HS-CF-11"),true);
assert.equal(byId.get("HS-M32").proposedAdditionalSelectedScripture.includes("Acts 10:30–32"),true);
assert.equal(byId.get("HS-M33").proposedAdditionalSelectedScripture.includes("Acts 14:26–27"),true);
assert.match(verse("Acts","dr-challoner",14,26),/assembled the church/);
const martyrdom=byId.get("HS-M31").crossEditionSemanticAnchor.verseByEdition;
assert.equal(martyrdom["dr-challoner"],"Acts 7:59");
assert.equal(martyrdom["cpdv-2009"],"Acts 7:59");
assert.equal(martyrdom["crampon-1923"],"Acts 7:60");
assert.match(verse("Acts","dr-challoner",7,59),/lay not this sin/i);
assert.match(verse("Acts","crampon-1923",7,60),/imputez pas ce péché/);
assert.equal(verse("Acts","dr-challoner",7,60),null);
assert.equal(verse("Acts","cpdv-2009",7,60),null);
assert.equal(byId.get("HS-M35").proposedAdditionalSelectedScripture.includes("Revelation 4:1–2"),true);
assert.equal(byId.get("HS-M36").proposedAdditionalSelectedScripture.length,0);
assert.equal(byId.get("HS-M37").proposedAdditionalSelectedScripture.includes("Revelation 21:9–10"),true);
assert.match(verse("Revelation","dr-challoner",21,9),/angels/i);
assert.match(verse("Revelation","dr-challoner",22,20),/Come, Lord Jesus/);
assert.equal(budget.status,"UNAPPROVED_EDITORIAL_DRY_RUN_DO_NOT_PUBLISH");
assert.equal(budget.totals.movements,18);
assert.equal(budget.totals.originalSelectedVerseEntries,444);
assert.equal(budget.totals.candidateAdditionalVerseEntries,69);
assert.equal(budget.totals.ifAllAcceptedVerseEntries,513);
assert.equal(budget.totals.movementsWithProposedScripture,13);
assert.equal(budget.policy.budgetFromSingleDouayWitnessOnly,true);
assert.equal(budget.policy.everyBridgeUnapproved,true);
assert.equal(budget.policy.automaticallyApplyAllOptionalBridges,false);
assert.deepEqual(budget.movements.map(x=>x.movementId),Array.from({length:18},(_,i)=>"HS-M"+(20+i)));
for(const entry of budget.movements){
 assert.equal(entry.proposalAccepted,false);
 assert.equal(entry.sourceOwnerEdited,false);
 assert.equal(entry.douayWitnessVerseBudget.alreadySelected+entry.douayWitnessVerseBudget.additionalIfAccepted,entry.douayWitnessVerseBudget.proposedTotal);
 const late=desk.movements.find(x=>x.movementId===entry.movementId);
 if(late)assert.deepEqual(entry.optionalCandidateRanges,late.proposedAdditionalSelectedScripture);
}
assert.deepEqual(budget.movements.find(x=>x.movementId==="HS-M29").optionalCandidateRanges,["John 20:4–5","John 20:10"]);
assert.equal(budget.movements.find(x=>x.movementId==="HS-M31").douayWitnessVerseBudget.additionalIfAccepted,11);
console.log("PASS: all 18 late movements source-audited, M25–M37 held recommendations, Stephen edition-safe verse and Resurrection agency preserved");
