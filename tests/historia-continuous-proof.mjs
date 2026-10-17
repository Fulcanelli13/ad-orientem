import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseScriptureContext} from "../src/scripture/context.js";

const get=(path)=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const proof=get("data/research/historia-salutis-v18-continuous-reading-proof.v1.json");
const economy=get("data/research/historia-salutis-v18-essential-verse-economy.v1.json");
const desk=get("data/research/historia-salutis-v18-continuity-desk-pass.v1.json");
const necessity=get("data/research/historia-salutis-v18-necessity-audit.v1.json");
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");

assert.equal(proof.schema,"ao.historia.v18.continuous-scripture-proof.v1");
assert.equal(proof.stage,"REAL_VERSE_READ_THROUGH_PROOF_NOT_APPROVED");
assert.equal(proof.totals.movements,37);
assert.equal(proof.totals.essentialUnits,93);
assert.equal(proof.totals.briefEditorialContextNotes,32);
assert.equal(proof.totals.sourceBridgeCandidates,11);
assert.equal(proof.totals.independentlyReadAndApproved,false);
assert.equal(proof.displayRules.neverCombineDifferentWitnessText,true);
assert.equal(proof.displayRules.showEveryDroppedSpanBetweenAdjacentScriptureFragments,true);
const originalA=new Map(economy.decisions.map(x=>[x.unitId,x]));
const originalB=new Map(desk.contextDecisions.filter(x=>x.readthroughDecision==="MANDATORY_BRIEF_CONTEXT").map(x=>[x.unitId,x]));
const originalBridges=new Map(desk.sourceBridgeCandidates.map(x=>[x.id,x]));
const seenA=new Set(),seenB=new Set(),seenBridges=new Set();
let scriptureVerses=0,previousId=0;
const witnesses=new Map();
function fetchVerses(edition,book){
 const key=edition+" "+book;
 if(!witnesses.has(key)){
  const d=get("data/scripture/witness/"+edition+"/"+book+".json");
  assert.equal(d.editionId,edition);
  witnesses.set(key,new Set(d.verses.map(([c,v])=>c+":"+v)));
 }
 return witnesses.get(key);
}
function hasRef(reference){
 const parsed=parseScriptureContext(reference);
 assert.ok(parsed,"All research proof references must be parser-safe: "+reference);
 const p=parsed.passage;
 for(const edition of ["cpdv-2009","dr-challoner"]){
  const source=fetchVerses(edition,p.book);
  for(let verse=p.verseStart;verse<=p.verseEnd;verse++)
   assert.ok(source.has(p.chapter+":"+verse),
    "Missing "+edition+" "+reference+" verse "+verse);
 }
 scriptureVerses+=p.verseEnd-p.verseStart+1;
}
for(const m of proof.movements){
 assert.equal(m.sequence,++previousId);
 assert.equal(m.id,"HS-M"+String(previousId).padStart(2,"0"));
 assert.equal(m.readAloudAccepted,false);
 assert.equal(m.readyForPublication,false);
 assert.ok(m.beats.some(x=>x.kind==="SCRIPTURE"),"Each movement must carry decisive A Scripture");
 let sectionA=0,previousBeat="";
 for(const beat of m.beats){
  if(beat.kind==="SCRIPTURE"){
   assert.ok(!seenA.has(beat.id),"Duplicate decisive episode: "+beat.id);
   seenA.add(beat.id);sectionA++;
   const proposal=originalA.get(beat.id);
   assert.ok(proposal&&proposal.movementId===m.id,"Scripture beat must match original A source");
   assert.equal(beat.sourceV18,proposal.originalV18SourceReference);
   assert.equal(beat.publicationApproved,false);
   assert.equal(beat.edition,"cpdv-2009");
   for(const ref of beat.refs)hasRef(ref);
   if(proposal.halfVerseNotationInOriginal)
    assert.equal(beat.hasPartialVerseHold,true);
  }else if(beat.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"){
   assert.ok(!seenB.has(beat.id),"Duplicate contextual bridge "+beat.id);
   seenB.add(beat.id);
   assert.equal(originalB.get(beat.id)?.movementId,m.id);
   assert.equal(beat.explanation,originalB.get(beat.id).contextPurpose);
   assert.equal(beat.publicationApproved,false);
  }else{
   assert.equal(beat.kind,"SOURCE_BRIDGE_CANDIDATE");
   assert.ok(!seenBridges.has(beat.id),"Duplicate proposed additional Scripture source");
   seenBridges.add(beat.id);
   assert.equal(originalBridges.get(beat.id)?.movementId,m.id);
   assert.equal(beat.reference,originalBridges.get(beat.id).reference);
   assert.equal(beat.status,"UNAPPROVED_SOURCE_COORDINATE_REFERENCE");
   hasRef(beat.reference);
  }
  previousBeat=beat.kind;
 }
 assert.ok(sectionA>=1);
}
assert.deepEqual([...seenA].sort(),[...originalA.keys()].sort());
assert.deepEqual([...seenB].sort(),[...originalB.keys()].sort());
assert.deepEqual([...seenBridges].sort(),[...originalBridges.keys()].sort());
assert.equal(proof.movements.find(x=>x.id==="HS-M34").beats.some(x=>x.id==="H73-02"),false,
 "Philippi jail conversion may not become an obligatory story");
assert.deepEqual(proof.movements.find(x=>x.id==="HS-M34").beats.map(x=>x.id),
 ["HS-CF-10","HS-CF-11","H73-07"]);
assert.ok(proof.movements.find(x=>x.id==="HS-M24").beats.find(x=>x.id==="HS-CF-05"));
assert.ok(proof.movements.find(x=>x.id==="HS-M28").beats.find(x=>x.id==="HS-CF-06"));
assert.equal(proof.movements.find(x=>x.id==="HS-M10").beats.find(x=>x.id==="H22-02").refs[0],"Exodus 20:1–17");
assert.equal(proof.movements.find(x=>x.id==="HS-M18").beats.some(x=>x.id==="H45-01"||x.id==="H45-02"),false,
 "The two genealogies remain separate views, not compulsory verse lists");
for(const needle of ["historiaProofMovement","historiaProofEdition","historiaProofBridges",
 "proofSourceBridge","proofGap","showHistoriaMovement","toggleHistoriaProof"]){
 assert.ok(html.includes(needle),"Single existing workbench must render the complete source sequence: "+needle);
}
assert.ok(necessity.units.length===217);
console.log("PASS Historia continuous proof: 37 movements, 93 real Scripture units, 32 visibly distinct context notes, 11 held original-source candidates, "+scriptureVerses+" verse displays validated in CPDV + Douay; no character filler or extra Bible experience");
