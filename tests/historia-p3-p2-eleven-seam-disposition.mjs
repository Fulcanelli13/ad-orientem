import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";
import {ATLAS_READING_CHAPTERS} from "../src/find/bible-atlas-reading-chapters.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const ledger=read("data/research/historia-salutis-p3-p2-eleven-seam-disposition-20261023.v1.json");
const full=read(ledger.sourceOwners.audit.path);
const proof=read(ledger.sourceOwners.p3Proof.path);
const p1=read(ledger.sourceOwners.priorityOneRegister.path);
const editions=["dr-challoner","cpdv-2009","crampon-1923"];
const owners=new Map(proof.movements.flatMap(m=>m.beats.map(b=>[b.id,{...b,fromMovement:m.id}])));
const cache=new Map();
function parse(ref){
 const r=/^([1-3]?[A-Za-z]+) (\d+):(\d+)(?:[–-](\d+))?$/.exec(ref||"");
 assert.ok(r,"Unrecognized Catholic Bible source reference: "+ref);
 const x={book:r[1],chapter:+r[2],lo:+r[3],hi:+(r[4]||r[3])};
 assert.ok(x.hi>=x.lo);
 return x;
}
function texts(ref,edition){
 const p=parse(ref),key=edition+"/"+p.book;
 if(!cache.has(key)){
  const w=read("data/scripture/witness/"+edition+"/"+p.book+".json");
  assert.equal(w.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
  assert.equal(w.editionId,edition);assert.equal(w.book,p.book);
  cache.set(key,new Map(w.verses.map(([ch,v,t])=>[ch+":"+v,t])));
 }
 const book=cache.get(key),result=[];
 for(let v=p.lo;v<=p.hi;v++){
  const verse=book.get(p.chapter+":"+v);
  assert.ok(verse?.trim(),"No source witness "+edition+" "+p.book+" "+p.chapter+":"+v);
  result.push(verse);
 }
 return result;
}
function ownedRefs(b){
 if(b.kind==="SCRIPTURE")return b.refs;
 if(b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE")return b.editorialReadingCandidate.sourceReferences;
 if(b.kind==="SOURCE_BRIDGE_CANDIDATE")return [b.reference,...(b.readthroughTrial?.refs||[])];
 assert.fail("No new original beat kind");
}
assert.equal(ledger.schema,"ao.historia.p3.p2-eleven-seam-evidence-disposition.v1");
assert.equal(ledger.status,"ALL_P2_SEAMS_TRIAGED_SOURCE_DESK_ONLY_RELEASE_NOT_APPROVED");
assert.equal(ledger.policies.noAlteredScriptureSelectedText,true);
assert.equal(ledger.policies.noCanonAtlasEventsAdded,true);
assert.equal(ledger.policies.exactVerseNativeWitnessesOnly,true);
assert.equal(ledger.policies.noAutomaticPublicationApproval,true);
assert.equal(ledger.policies.keepCanonicalEndingOmissionExplicit,true);
assert.equal(buildBibleAtlas(read("data/explore/bible-places-compact.v1.json").entries).length,151);
assert.equal(ATLAS_READING_CHAPTERS.length,37);
assert.equal(proof.movements.length,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(p1.totals.totalP1,20);
const p2=full.betweenMovementSeams.filter(s=>s.priority==="P2");
assert.equal(p2.length,11);
assert.deepEqual(ledger.priorityTwoHinges.map(x=>x.hingeId),p2.map(x=>x.id));
const categories=["CONTIGUOUS_SOURCE_SUFFICIENT","EXISTING_EDITORIAL_CONTEXT_SUFFICIENT",
 "VISIBLE_CANONICAL_AUTHOR_LABEL","UNAPPROVED_CANONICAL_BOOK_ENDING_DECISION"];
const tally=Object.fromEntries(categories.map(x=>[x,0]));
for(let i=0;i<ledger.priorityTwoHinges.length;i++){
 const s=ledger.priorityTwoHinges[i],actual=p2[i];
 assert.equal(s.priority,"P2");
 assert.equal(s.fromMovement,actual.fromMovement);
 assert.equal(s.toMovement,actual.toMovement);
 assert.equal(s.lastSelectedOriginalSource,actual.fromLastSelectedSource);
 assert.equal(s.firstSelectedOriginalSource,actual.toFirstSelectedSource);
 assert.equal(s.seamType,actual.seamClass);
 assert.ok(categories.includes(s.classification));
 tally[s.classification]++;
 assert.ok(s.existingP3SourceBeatIds.length>=2);
 assert.ok(s.sourceWitnessReferences.length>=2);
 assert.ok(s.sourceCriticalFinding.length>=75);
 assert.ok(s.nonSourcePresentation.length>=20);
 const items=s.existingP3SourceBeatIds.map(id=>owners.get(id));
 assert.ok(items.every(Boolean),"All P2 source owners must already exist");
 assert.ok(items.some(b=>b.fromMovement===s.fromMovement));
 assert.ok(items.some(b=>b.fromMovement===s.toMovement));
 const recorded=items.flatMap(ownedRefs);
 for(const ref of s.sourceWitnessReferences){
  assert.ok(recorded.includes(ref),
   "P2 source cannot silently cite unwitnessed/or unowned P3 quotation "+s.hingeId+" "+ref);
  for(const edition of editions)assert.ok(texts(ref,edition).length>=1);
 }
 assert.equal(s.selectedScriptureEdits,0);
 assert.equal(s.newAtlasEvents,0);
 assert.equal(s.bookEndingCertified,false);
 assert.equal(s.editorialPublicationApproved,false);
 assert.equal(s.oralReadthroughAccepted,false);
 assert.equal(s.printedEditionCollationCertified,false);
}
assert.deepEqual(tally,{
 CONTIGUOUS_SOURCE_SUFFICIENT:6,
 EXISTING_EDITORIAL_CONTEXT_SUFFICIENT:1,
 VISIBLE_CANONICAL_AUTHOR_LABEL:3,
 UNAPPROVED_CANONICAL_BOOK_ENDING_DECISION:1
});
assert.deepEqual(ledger.totals,{
 p2Hinges:11,alreadyCoveredByNativeSelectedSources:6,
 existingEditorialContextAdequate:1,gospelAttributionPresentation:3,
 trueCanonicalEndingStillHeld:1,sourceVerseAdditions:0,publicationApprovals:0
});
assert.deepEqual(ledger.completeThirtySixSeamPosition,{
 p0:5,p1:20,p2:11,all36DeskClassified:true,noneCertifiedForPublication:true
});
assert.equal(ledger.apocalypseEnding.ownedMovement,"HS-M37");
assert.equal(ledger.apocalypseEnding.existingSelectedEndsAt,"Revelation 22:5");
assert.equal(ledger.apocalypseEnding.fullBookEndsAt,"Revelation 22:21");
assert.equal(ledger.apocalypseEnding.unselectedGapBeforeEpilogue,"Revelation 22:6–19");
assert.equal(ledger.apocalypseEnding.oralAndTheologicalDecision,false);
assert.equal(ledger.apocalypseEnding.publicationApproved,false);
const finalMovement=proof.movements.at(-1);
assert.equal(finalMovement.id,"HS-M37");
assert.deepEqual(finalMovement.beats.filter(b=>b.kind==="SCRIPTURE").flatMap(b=>b.refs),
 ["Revelation 21:1–7","Revelation 22:1–5"]);
assert.equal(finalMovement.beats.find(b=>b.id==="HS-P3-CF-15").reference,"Revelation 21:9–10");
assert.deepEqual(finalMovement.beats.find(b=>b.id==="HS-P3-CF-15").readthroughTrial.refs,
 ["Revelation 21:9–11"]);
assert.equal(finalMovement.beats.find(b=>b.id==="HS-P3-CF-16").reference,"Revelation 22:20–21");
assert.equal(finalMovement.beats.find(b=>b.id==="HS-P3-CF-16").publicationApproved,false);
const variants=ledger.apocalypseEnding.options;
assert.deepEqual(variants.map(x=>x.id),[
 "SHORT_TRUE_CANONICAL_ENDING","FIVE_VERSE_FINAL_INVITATION_AND_WARNING","FULL_APOCALYPSE_BOOK_EPILOGUE"
]);
assert.deepEqual(variants.map(x=>x.refs),[
 ["Revelation 22:20–21"],["Revelation 22:17–21"],["Revelation 22:6–21"]
]);
assert.equal(ledger.sourceOwners.witnesses.length,3);
for(const ed of editions){
 const record=ledger.sourceOwners.witnesses.find(x=>x.edition===ed);
 assert.equal(record.path,"data/scripture/witness/"+ed+"/Revelation.json");
 assert.ok(record.sha.length===40);
 for(const option of variants){
  assert.equal(option.publicationApproved,false);
  assert.equal(option.printedEditionCollated,false);
  assert.equal(option.oralReadthroughAccepted,false);
  const native=option.refs.flatMap(ref=>texts(ref,ed));
  assert.deepEqual(option.measure[ed],{
   verseEntries:native.length,wordCount:native.join(" ").trim().split(/\s+/).length,
   sourceStatus:"UNCOLLATED_SOURCE_WITNESS"
  });
 }
 assert.equal(texts("Revelation 22:21",ed).length,1);
}
const divergence=ledger.apocalypseEnding.meaningfulWitnessDivergence;
assert.equal(divergence.verse,"Revelation 22:19");
assert.equal(divergence.status,"WITNESS_TEXTUAL_VARIANT_IDENTIFIED_NOT_PRINT_COLLATED");
assert.match(texts("Revelation 22:19","dr-challoner")[0],/book of life/i);
assert.match(texts("Revelation 22:19","cpdv-2009")[0],/Book of Life/i);
assert.match(texts("Revelation 22:19","crampon-1923")[0],/arbre de la vie/i);
assert.equal(ledger.apocalypseEnding.options[0].measure["dr-challoner"].wordCount,28);
assert.equal(ledger.apocalypseEnding.options[1].measure["dr-challoner"].wordCount,142);
assert.equal(ledger.apocalypseEnding.options[2].measure["dr-challoner"].wordCount,442);
assert.ok(!finalMovement.beats.some(b=>b.kind==="SCRIPTURE"&&b.refs.some(x=>x.includes("22:20"))),
 "Canonical epilogue has not been automatically selected");
console.log("PASS Historia 11 P2 hinges: six native-sequence, one already editorial, three Gospel attribution, one Revelation ending held; three independently measured options/three Catholic witnesses; all 36 seams desk triaged, none published.");
