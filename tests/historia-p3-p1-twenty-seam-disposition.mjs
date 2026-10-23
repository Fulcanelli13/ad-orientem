import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const ledger=read("data/research/historia-salutis-p3-p1-twenty-seam-disposition-20261023.v1.json");
const p3=read(ledger.owners.p3Proof.path),audit=read(ledger.owners.fullSequenceAudit.path),p4=read(ledger.owners.parallelP4.path);
const editionIds=["dr-challoner","cpdv-2009","crampon-1923"];
const beatMap=new Map(p3.movements.flatMap(m=>m.beats.map(b=>[b.id,{...b,movementId:m.id}])));
const witnessCache=new Map();
function parse(ref){
 const m=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(ref||"");
 assert.ok(m,"Unexpected source range syntax: "+ref);
 const p={book:m[1],chapter:+m[2],start:+m[3],end:+(m[4]||m[3])};
 assert.ok(p.end>=p.start);
 return p;
}
function witness(ed,book){
 const key=ed+"/"+book;
 if(!witnessCache.has(key)){
  const w=read("data/scripture/witness/"+ed+"/"+book+".json");
  assert.equal(w.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(w.editionId,ed);assert.equal(w.book,book);
  witnessCache.set(key,new Map(w.verses.map(([c,v,text])=>[c+":"+v,text])));
 }
 return witnessCache.get(key);
}
function measure(refs,ed){
 const unique=new Set(),texts=[];
 for(const ref of refs){
  const p=parse(ref),lookup=witness(ed,p.book);
  for(let v=p.start;v<=p.end;v++){
   const key=p.book+" "+p.chapter+":"+v;
   assert.ok(!unique.has(key),"No double count within optional source trial "+key);
   unique.add(key);
   const t=lookup.get(p.chapter+":"+v);
   assert.ok(t?.trim(),"Uncollated witness passage missing "+ed+" "+key);
   texts.push(t.trim());
  }
 }
 return {verseEntries:texts.length,sourceWords:texts.join(" ").split(/\s+/).length,
         sourceStatus:"UNCOLLATED_SOURCE_WITNESS",validatedAgainstExistingCorpus:true};
}
assert.equal(ledger.schema,"ao.historia.p3.p1-twenty-seam-first-disposition.v1");
assert.equal(ledger.status,"COMPREHENSIVE_PRIORITY_ONE_RECONCILIATION_DESK_ONLY_NOT_EDITORIALLY_ACCEPTED");
assert.equal(ledger.policies.preserve93SourceUnits,true);
assert.equal(ledger.policies.noGospelHarmonizedDialogues,true);
assert.equal(ledger.policies.keep151CanonAtlasAnd37AtlasChapters,true);
assert.equal(ledger.policies.humanTheologicalSignoffStillRequired,true);
assert.equal(ledger.policies.neverConvertDeskDispositionToPublicationApproval,true);
assert.equal(p3.movements.length,37);
assert.equal(p3.totals.essentialUnits,93);
assert.equal(p3.totals.briefEditorialContextNotes,29);
assert.equal(buildBibleAtlas(read("data/explore/bible-places-compact.v1.json").entries).length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(p4.totals.movements,18);
const audited=audit.betweenMovementSeams.filter(s=>s.priority==="P1");
assert.equal(audited.length,20);
assert.equal(ledger.priorityOneHinges.length,20);
assert.deepEqual(ledger.priorityOneHinges.map(row=>row.hingeId),audited.map(s=>s.id));
const categories=[
 "SOURCE_CONNECTOR_ALREADY_PRESENT","DIRECT_SOURCE_LINK_ALREADY_PRESENT",
 "UNRESOLVED_OPTIONAL_SOURCE_TRIAL","HISTORICAL_JUMP_REQUIRES_EXPLICIT_PROVENANCE",
 "ATTRIBUTION_BOUNDARY_REQUIRES_DISPLAY","GENRE_ABRIDGMENT_REQUIRES_DISCLOSURE"
];
const byCat=Object.fromEntries(categories.map(c=>[c,0]));
for(const [i,entry] of ledger.priorityOneHinges.entries()){
 const original=audited[i];
 assert.equal(entry.fromMovement,original.fromMovement);
 assert.equal(entry.toMovement,original.toMovement);
 assert.equal(entry.sourceEnd,original.fromLastSelectedSource);
 assert.equal(entry.sourceStart,original.toFirstSelectedSource);
 assert.ok(categories.includes(entry.category));
 byCat[entry.category]++;
 assert.ok(entry.disposition.length>20&&entry.sourceCriticalFinding.length>100);
 assert.ok(entry.existingP3OwnerBeatIds.length>=2);
 assert.ok(entry.sourceBoundedEvidenceRefs.length>=2);
 const owners=entry.existingP3OwnerBeatIds.map(x=>beatMap.get(x));
 assert.ok(owners.every(Boolean),"Cannot create false original beat owners");
 assert.ok(owners.some(b=>b.movementId===entry.fromMovement));
 assert.ok(owners.some(b=>b.movementId===entry.toMovement));
 assert.equal(entry.originalSelectedPassagesUnmodified,true);
 assert.equal(entry.referenceWitnessPrintedCollationPending,true);
 assert.equal(entry.sourceDeskEvidenceNotPublicationApproval,true);
 assert.equal(entry.oralAndTheologicalApproval,false);
 for(const ref of entry.sourceBoundedEvidenceRefs)for(const ed of editionIds)
  assert.ok(measure([ref],ed).verseEntries>0);
}
assert.deepEqual(byCat,{
 SOURCE_CONNECTOR_ALREADY_PRESENT:9,DIRECT_SOURCE_LINK_ALREADY_PRESENT:4,
 UNRESOLVED_OPTIONAL_SOURCE_TRIAL:3,HISTORICAL_JUMP_REQUIRES_EXPLICIT_PROVENANCE:2,
 ATTRIBUTION_BOUNDARY_REQUIRES_DISPLAY:1,GENRE_ABRIDGMENT_REQUIRES_DISCLOSURE:1
});
assert.equal(ledger.totals.totalP1,20);
assert.equal(ledger.totals.alreadySourceBound,13);
assert.equal(ledger.totals.presentationDisclosureNeeded,4);
assert.equal(ledger.totals.originalWitnessTrialUnresolved,3);
assert.equal(ledger.totals.trialChoices,4);
assert.equal(ledger.totals.publicationApprovals,0);
assert.equal(ledger.totals.sourceSelectionEdits,0);
assert.deepEqual(ledger.optionalSourceComparisons.map(x=>x.hinge),["HS-HINGE-07","HS-HINGE-24","HS-HINGE-29"]);
assert.equal(ledger.witnessFileProvenance.length,9);
for(const f of ledger.witnessFileProvenance){
 assert.ok(f.sha?.length===40);
 assert.equal(f.path,"data/scripture/witness/"+f.edition+"/"+f.book+".json");
}
let trialCount=0;
for(const trial of ledger.optionalSourceComparisons){
 assert.equal(ledger.priorityOneHinges.find(x=>x.hingeId===trial.hinge).category,"UNRESOLVED_OPTIONAL_SOURCE_TRIAL");
 for(const c of trial.choices){
  trialCount++;
  assert.equal(c.publicationApproved,false);
  assert.equal(c.oralAcceptance,false);
  assert.ok(c.distinctiveReason.length>75);
  for(const ed of editionIds)assert.deepEqual(c.measurements[ed],measure(c.refs,ed));
 }
}
assert.equal(trialCount,4);
const owned=(id)=>beatMap.get(id);
const has=(arr,ref)=>arr.includes(ref);
assert.deepEqual(owned("HS-CF-05").readthroughTrial.refs,["John 11:45–53"]);
assert.deepEqual(owned("HS-CF-07").readthroughTrial.refs,["Acts 1:3–5"]);
assert.ok(!p3.movements.find(m=>m.id==="HS-M08").beats.some(b=>b.refs?.includes("Exodus 5:1–2")));
assert.ok(!p3.movements.find(m=>m.id==="HS-M07").beats.some(b=>b.refs?.includes("Exodus 5:1–2")));
assert.deepEqual(ledger.optionalSourceComparisons[0].choices.map(c=>c.refs),[["Exodus 5:1–2"],["Exodus 7:1–6"]]);
assert.equal(measure(["Exodus 5:1–2"],"dr-challoner").sourceWords,60);
assert.equal(measure(["Exodus 7:1–6"],"dr-challoner").sourceWords,151);
assert.equal(measure(["John 11:45–53"],"dr-challoner").sourceWords,181);
assert.equal(measure(["Acts 1:3–5"],"dr-challoner").sourceWords,78);
for(const ed of editionIds){
 const fr=ed==="crampon-1923";
 assert.match(witness(ed,"Exodus").get("5:2"),fr?/Qui est Yahweh/i:/Who is the Lord/i);
 assert.match(witness(ed,"John").get("11:51"),fr?/prophétisa/i:/prophesied|prophesying/i);
 assert.match(witness(ed,"Acts").get("1:3"),fr?/quarante jours/i:/forty days/i);
 assert.match(witness(ed,"Genesis").get("35:10"),fr?/Israël/i:/Israel/i);
 assert.match(witness(ed,"2Kings").get("17:18"),fr?/Juda/i:/Juda/i);
 assert.match(witness(ed,"Joshua").get("5:6"),fr?/quarante ans/i:/forty years/i);
}
const elijah=owned("H37-02").editorialReadingCandidate;
assert.deepEqual(elijah.sourceReferencesByEdition["crampon-1923"],
 ["1Kings 18:20–39","Isaiah 7:1–17","Isaiah 8:23","Isaiah 9:1–5","Isaiah 11:1–10","Isaiah 52:13–53:12"]);
assert.deepEqual(elijah.sourceReferencesByEdition["dr-challoner"],elijah.sourceReferences);
assert.deepEqual(elijah.sourceReferencesByEdition["cpdv-2009"],elijah.sourceReferences);
const oracle=owned("H38-03").semanticEditionAlignment;
assert.deepEqual(oracle.selectedReferencesByEdition["crampon-1923"],["Isaiah 8:23","Isaiah 9:1–5"]);
for(const ed of editionIds){
 const ref=ed==="crampon-1923"?"8:23":"9:1";
 assert.ok(witness(ed,"Isaiah").get(ref)?.length);
 assert.match(witness(ed,"Isaiah").get(ed==="crampon-1923"?"9:5":"9:6"),ed==="crampon-1923"?/enfant nous est né/i:/child is born/i);
}
const stephen=owned("H68-04").semanticEditionAlignment;
assert.deepEqual(stephen.selectedReferencesByEdition["crampon-1923"],["Acts 7:54–60"]);
assert.deepEqual(stephen.selectedReferencesByEdition["dr-challoner"],["Acts 7:54–59"]);
assert.deepEqual(stephen.selectedReferencesByEdition["cpdv-2009"],["Acts 7:54–59"]);
assert.match(witness("dr-challoner","Acts").get("7:59"),/Saul was consenting/i);
assert.match(witness("crampon-1923","Acts").get("7:60"),/Saul/i);
assert.deepEqual(ledger.additionalGroundedTimeWitnesses.map(x=>x.hinge),["HS-HINGE-10","HS-HINGE-25"]);
for(const record of ledger.additionalGroundedTimeWitnesses)
 for(const ref of record.references)for(const ed of editionIds)assert.ok(measure([ref],ed).verseEntries===1);
assert.equal(ledger.priorityOneHinges.every(r=>!r.oralAndTheologicalApproval&&r.sourceDeskEvidenceNotPublicationApproval),true);
console.log("PASS Historia 20 P1 transitions: 13 source-backed without new text, 4 source/genre display disclosures, 3 held passage reviews (4 original-witness alternatives), French Isaiah and Stephen alignments, zero selection or publication.");
