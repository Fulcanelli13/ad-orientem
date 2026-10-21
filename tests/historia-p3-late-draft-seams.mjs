import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=(path)=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const proof=get("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
assert.equal(proof.stage,"REAL_VERSE_READ_THROUGH_PROOF_NOT_APPROVED");
assert.equal(proof.totals.movements,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(proof.totals.briefEditorialContextNotes,29);
assert.equal(proof.totals.sourceBridgeCandidates,10);
assert.equal(proof.totals.independentlyReadAndApproved,false);
assert.equal(proof.p4LateMovementDraft.status,"SOURCE_BACKED_EDITS_APPLIED_ON_P3_DRAFT_NOT_APPROVED");
assert.equal(proof.p4LateMovementDraft.finishedCatholicPrintCollation,false);
assert.equal(proof.p4LateMovementDraft.finishedSequentialOralReading,false);
assert.equal(proof.p4LateMovementDraft.publicationApproved,false);
const ids=["HS-M20","HS-M21","HS-M22","HS-M24","HS-M29","HS-M31"];
assert.deepEqual(proof.p4LateMovementDraft.editedMovementIds,ids);
assert.deepEqual(proof.movements.map(m=>m.id),Array.from({length:37},(_,i)=>"HS-M"+String(i+1).padStart(2,"0")));
const m=id=>proof.movements.find(x=>x.id===id);
const beat=(id,bid)=>m(id).beats.find(x=>x.id===bid);
assert.deepEqual(m("HS-M20").beats.map(x=>x.id),["H51-01","H51-02","H52-01","H51-03"]);
assert.equal(m("HS-M21").title,"The Kingdom in Christ's teaching");
const expected=[
["HS-M22","H56-02",["John 6:26–35","John 6:41–46","John 6:47–59"],["John 6:26–35","John 6:47–59"],6],
["HS-M24","H58-04",["John 11:1–7","John 11:14–17","John 11:20–27","John 11:28–31","John 11:32–35","John 11:38–44"],["John 11:1–7","John 11:14–17","John 11:20–27","John 11:32–35","John 11:38–44"],4],
["HS-M29","H65-01",["John 20:1–3","John 20:4–5","John 20:6–9","John 20:10","John 20:11–18"],["John 20:1–3","John 20:6–9","John 20:11–18"],3],
["HS-M31","H67-01",["Acts 2:1–8","Acts 2:11–18","Acts 2:21","Acts 2:22–24","Acts 2:32–36","Acts 2:37–41"],["Acts 2:1–8","Acts 2:11–18","Acts 2:21","Acts 2:37–41"],8]
];
const editions=["cpdv-2009","dr-challoner","crampon-1923"];
const bookCaches={};
function verseRecord(edition,book,chapter,verse){
 const key=edition+":"+book;
 if(!bookCaches[key])bookCaches[key]=get("data/scripture/witness/"+edition+"/"+book+".json");
 return bookCaches[key].verses.find(x=>x[0]===chapter&&x[1]===verse)?.[2]??null;
}
function expand(reference){
 const x=reference.match(/^(John|Acts)\s+(\d+):(\d+)(?:–(\d+))?$/);
 assert.ok(x,"Expected one chapter range: "+reference);
 return {book:x[1],ch:Number(x[2]),start:Number(x[3]),end:Number(x[4]||x[3])};
}
let added=0;
for(const [mid,bid,refs,previous,expectedNew] of expected){
 const b=beat(mid,bid);
 assert.equal(b.kind,"SCRIPTURE");
 assert.equal(b.edition,"cpdv-2009");
 assert.equal(b.publicationApproved,false);
 assert.deepEqual(b.refs,refs);
 assert.equal(b.researchRevision.status,"SOURCE_RESTORED_RESEARCH_PROPOSAL_NOT_APPROVED");
 assert.deepEqual(b.researchRevision.priorCuratedRefs,previous);
 assert.equal(b.researchRevision.printingAndOralSignOffPending,true);
 assert.equal(b.researchRevision.retainsOriginalUnitId,true);
 const oldIds=new Set(previous.flatMap(r=>{const x=expand(r);return Array.from({length:x.end-x.start+1},(_,i)=>x.book+":"+x.ch+":"+(x.start+i))}));
 let n=0;
 for(const r of refs){
  const x=expand(r);
  for(let v=x.start;v<=x.end;v++){
   const id=x.book+":"+x.ch+":"+v;
   if(!oldIds.has(id))n++;
   for(const edition of editions)assert.ok(verseRecord(edition,x.book,x.ch,v),"Absent "+edition+" "+r+" verse "+v);
  }
 }
 assert.equal(n,expectedNew,"Incorrect incremental verse budget for "+mid);
 added+=n;
}
assert.equal(added,21);
assert.match(verseRecord("dr-challoner","John",11,28),/called her sister Mary/);
assert.match(verseRecord("dr-challoner","John",20,10),/departed again/);
assert.match(verseRecord("dr-challoner","John",6,44),/No man can come/);
assert.match(verseRecord("dr-challoner","Acts",2,22),/Jesus of Nazareth/);
assert.match(verseRecord("dr-challoner","Acts",2,36),/Lord and Christ/);
assert.equal(verseRecord("dr-challoner","Acts",7,60),null,"Do not invent Stephen's final verse");
assert.ok(verseRecord("crampon-1923","Acts",7,60),"Crampon Stephen's prayer is 7:60");
for(const movement of proof.movements){
 assert.equal(movement.readAloudAccepted,false);
 assert.equal(movement.readyForPublication,false);
 for(const x of movement.beats)assert.equal(x.publicationApproved??false,false);
}
console.log("PASS P3 draft: six controlled source corrections, +21 verses, canonical 37/93/29, print/oral/release holds intact");
