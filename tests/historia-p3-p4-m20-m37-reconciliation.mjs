import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const data=read("data/research/historia-salutis-p3-p4-m20-m37-reconciliation-20261023.v1.json");
const p3=read(data.primaryProof.path);
const chapters=read(data.existingPrimaryOwners.chapters);
const crosswalk=read(data.existingPrimaryOwners.covenantCrosswalk);
const atlas=buildBibleAtlas(read(data.existingPrimaryOwners.atlas).entries);
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const witnessCache=new Map();
const statuses=[
 "alreadyInUnapprovedP3SelectedScripture",
 "alreadyExistingUnapprovedP3HeldBridge",
 "existingUnapprovedSourceComparisonTrial",
 "stillOutsideP3SourceAndHeldText"
];
function expand(reference){
 const p=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(reference||"");
 assert.ok(p,"Unknown canonical source coordinate "+reference);
 const lo=+p[3],hi=+(p[4]||p[3]);assert.ok(hi>=lo);
 return Array.from({length:hi-lo+1},(_,i)=>p[1]+" "+p[2]+":"+(lo+i));
}
function witness(edition,book){
 const k=edition+"/"+book;
 if(!witnessCache.has(k)){
  const j=read("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(j.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(j.editionId,edition);assert.equal(j.book,book);
  witnessCache.set(k,new Map(j.verses.map(([c,v,text])=>[book+" "+c+":"+v,text])));
 }
 return witnessCache.get(k);
}
const allResolved=new Set();
const count=Object.fromEntries(statuses.map(s=>[s,0]));
let allCandidates=0,beatCount=0;
assert.equal(data.schema,"ao.historia.p3-p4.m20-m37-canonical-reconciliation.v1");
assert.equal(data.status,"CROSS_BRANCH_SOURCE_DESK_RECONCILIATION_NOT_APPLIED_EDITORIAL_ACCEPTANCE");
assert.equal(data.rules.neverMergeOldP4FullBranch,true);
assert.equal(data.rules.p3IsCanonicalDraftSource,true);
assert.equal(data.rules.noProductionContentChanged,true);
assert.equal(data.rules.selectedMeansSourceReadingOnlyNotApproved,true);
assert.equal(data.rules.noPrintedEditionCollationOrOralApproval,true);
assert.equal(atlas.length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(chapters.readingChapters.length,54);
assert.equal(crosswalk.covenants.length,7);
assert.equal(p3.movements.length,37);
assert.equal(p3.totals.essentialUnits,93);
assert.equal(data.parallelReviewSources.length,3);
assert.ok(data.parallelReviewSources.every(x=>x.branch==="research/historia-p4-continuity-theatre-20261021"));
assert.equal(data.reviews.length,18);
assert.deepEqual(data.reviews.map(m=>m.movementId),p3.movements.slice(19).map(m=>m.id));
for(const row of data.reviews){
 const m=p3.movements.find(m=>m.id===row.movementId);
 assert.deepEqual(row.originalP3BeatIds,m.beats.map(b=>b.id));
 assert.deepEqual(row.originalP3OutlineIds,m.originalResearchChapterIds);
 assert.deepEqual(row.p3ProvisionalReadingChapterIds,chapters.readingChapters.filter(ch=>
   ch.originalChapterIds.some(x=>m.originalResearchChapterIds.includes(x))).map(ch=>ch.id));
 assert.deepEqual(row.p3CovenantArcIds,crosswalk.arcs.filter(arc=>
   arc.chapterIds.some(x=>m.originalResearchChapterIds.includes(x))).map(arc=>arc.id));
 assert.equal(row.publicationApproved,false);
 assert.equal(row.acceptedForOralReading,false);
 assert.equal(row.certifiedPrintedCatholicEdition,false);
 assert.equal(row.p4TheatreEventsApproved,false);
 assert.equal(row.approvalTransferForbidden,true);
 assert.ok(row.parallelP4IssueId?.startsWith("HS-P4-"));
 assert.ok(row.disposition&&row.p3GroundedExplanation.length>60);
 beatCount+=row.originalP3BeatIds.length;
 const bucketSource=(kind)=>new Set(m.beats.filter(b=>b.kind===kind)
  .flatMap(b=>(kind==="SCRIPTURE"?b.refs:[b.reference]).flatMap(expand)));
 const selected=bucketSource("SCRIPTURE");
 const held=bucketSource("SOURCE_BRIDGE_CANDIDATE");
 const trial=new Set(m.beats.flatMap(b=>[...(b.afterSelectedReadthroughTrial?.refs||[]),...(b.betweenSelectedReadthroughTrial?.refs||[])]).flatMap(expand));
 const candidates=[...new Set(row.parallelP4CandidateRanges.flatMap(expand))];
 allCandidates+=candidates.length;
 assert.equal(row.parallelP4HistoricalAdditionalVerseEntries,candidates.length);
 const computed=Object.fromEntries(statuses.map(s=>[s,[]]));
 for(const v of candidates){
  const name=selected.has(v)?statuses[0]:held.has(v)?statuses[1]:trial.has(v)?statuses[2]:statuses[3];
  computed[name].push(v);count[name]++;allResolved.add(v);
  const p=/^([1-3]?[A-Za-z]+) \d+:\d+$/.exec(v);
  assert.ok(p);
  for(const ed of editions)assert.ok(witness(ed,p[1]).get(v)?.trim(),"Unattested candidate "+ed+" "+v);
 }
 assert.deepEqual(row.reconciliation,computed,"Do not conflate stale P4 recommendations and newer P3 selections "+m.id);
}
assert.equal(data.totals.movements,18);
assert.equal(data.totals.sourceOwnedP3Beats,beatCount);
assert.equal(data.totals.p4HistoricalCandidateVerses,allCandidates);
assert.equal(allCandidates,69);
assert.equal(beatCount,53);
for(const key of statuses)assert.equal(data.totals[key],count[key]);
assert.deepEqual(count,{
 alreadyInUnapprovedP3SelectedScripture:33,
 alreadyExistingUnapprovedP3HeldBridge:28,
 existingUnapprovedSourceComparisonTrial:8,
 stillOutsideP3SourceAndHeldText:0
});
const row=id=>data.reviews.find(m=>m.movementId===id);
assert.deepEqual(row("HS-M27").reconciliation.existingUnapprovedSourceComparisonTrial,expand("Matthew 27:3–10"));
assert.deepEqual(row("HS-M27").reconciliation.stillOutsideP3SourceAndHeldText,[]);
const judas=p3.movements.find(m=>m.id==="HS-M27").beats.find(b=>b.id==="H63-02");
assert.deepEqual(judas.refs,["Matthew 27:1–2","Matthew 27:11–26"]);
assert.deepEqual(judas.betweenSelectedReadthroughTrial.refs,["Matthew 27:3–10"]);
assert.equal(judas.betweenSelectedReadthroughTrial.accepted,false);
assert.equal(judas.betweenSelectedReadthroughTrial.publicationApproved,false);
assert.equal(judas.betweenSelectedReadthroughTrial.excludedFromMainSourceSelection,true);
for(const ed of editions)assert.match(witness(ed,"Matthew").get("Matthew 27:3"),/Judas/i);

assert.deepEqual(row("HS-M20").originalP3BeatIds,["H51-01","H51-02","HS-P3-CF-17","H52-01","H51-03"]);
assert.equal(row("HS-M21").title,"The Kingdom in Christ's teaching");
assert.equal(row("HS-M26").title,"The Last Supper");
assert.deepEqual(row("HS-M22").reconciliation.alreadyInUnapprovedP3SelectedScripture,expand("John 6:36–46"));
assert.deepEqual(row("HS-M24").reconciliation.alreadyInUnapprovedP3SelectedScripture,expand("John 11:28–31"));
assert.deepEqual(row("HS-M29").reconciliation.alreadyInUnapprovedP3SelectedScripture,[
 ...expand("John 20:4–5"),...expand("John 20:10")]);
assert.deepEqual(row("HS-M31").reconciliation.alreadyInUnapprovedP3SelectedScripture,[
 ...expand("Acts 2:22–24"),...expand("Acts 2:32–36")]);
assert.deepEqual(row("HS-M32").reconciliation.alreadyInUnapprovedP3SelectedScripture,[
 ...expand("Acts 9:15–16"),...expand("Acts 10:7–8"),...expand("Acts 10:30–32")]);
const stephen=p3.movements.find(m=>m.id==="HS-M31").beats.find(b=>b.id==="H68-04");
assert.deepEqual(stephen.semanticEditionAlignment.selectedReferencesByEdition["crampon-1923"],["Acts 7:54–60"]);
assert.deepEqual(stephen.semanticEditionAlignment.selectedReferencesByEdition["dr-challoner"],["Acts 7:54–59"]);
assert.ok(!data.reviews.some(r=>r.acceptedForOralReading||r.publicationApproved));
console.log("PASS Historia P3↔P4 reconciliation: 18 movements, 53 P3 beats, 69 earlier source options = 33 selected (unapproved) + 28 held + 8 optional exact-text trials, 3 Catholic witnesses, 151 original Atlas events, no publication");
