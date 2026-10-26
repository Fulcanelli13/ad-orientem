import assert from "node:assert/strict";
import "./historia-p3-first-slice-evidence.mjs";
import "./historia-p3-m04-m10-literary-review.mjs";
import "./historia-p3-m11-m19-literary-review.mjs";
import "./historia-p3-p4-m20-m37-reconciliation.mjs";
import "./historia-p3-continuous-full-story-seam-audit.mjs";
import "./historia-p3-five-p0-source-minimum-adjudication.mjs";
import "./historia-p3-p0-incontext-integrity-review.mjs";
import "./historia-p3-p1-twenty-seam-disposition.mjs";
import "./historia-p3-p2-eleven-seam-disposition.mjs";
import "./historia-p3-unified-editorial-release-worklist.mjs";
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
assert.equal(proof.totals.briefEditorialContextNotes,29);
assert.equal(proof.literaryReviewProgress.movementsDeskExamined,37);
assert.equal(proof.literaryReviewProgress.fullSequentialReadthroughComplete,false);
// Ensure the single research reader actually shows the authored, attributed
// *editorial candidates*, not older explanatory metadata or synthetic Bible.
// Editorial references sometimes cross chapter boundaries. The shared reader
// parser accepts a single chapter at a time; preserve the original citation
// while validating *both* original endpoints rather than changing source data.
function validEditorialSourceReference(ref){
 if(parseScriptureContext(ref))return true;
 const match=ref.match(/^(.+?) (\d+):(\d+)[–-](\d+):(\d+)$/);
 return !!match&&!!parseScriptureContext(match[1]+" "+match[2]+":"+match[3])&&
  !!parseScriptureContext(match[1]+" "+match[4]+":"+match[5]);
}
const originalContext=proof.movements.flatMap(m=>m.beats.filter(b=>b.kind==="EDITORIAL_CONTEXT_NOT_BIBLE"));
const preScriptureConnectors=proof.movements.flatMap(m=>m.beats.filter(b=>b.beforeScriptureConnectorCandidate).map(b=>b.beforeScriptureConnectorCandidate));
assert.equal(originalContext.length,29);
assert.equal(preScriptureConnectors.length,9);
assert.equal(new Set(preScriptureConnectors.map(c=>c.id)).size,9);
for(const beat of originalContext){
 const candidate=beat.editorialReadingCandidate;
 assert.ok(candidate&&candidate.text&&candidate.text.length>15,"Missing proposed literary text: "+beat.id);
 assert.equal(candidate.publicationApproved,false);
 assert.ok(candidate.sourceReferences?.length>0,"Unsourced editorial note "+beat.id);
 for(const ref of candidate.sourceReferences)assert.ok(validEditorialSourceReference(ref),"Unparsed note source "+ref);
}
for(const candidate of preScriptureConnectors){
 assert.ok(candidate.text&&candidate.sourceReferences?.length>0,"Missing source-supported connector");
 assert.equal(candidate.accepted,false);
 assert.equal(candidate.publicationApproved,false);
 for(const ref of candidate.sourceReferences)assert.ok(validEditorialSourceReference(ref),"Unparsed connector source "+ref);
}
assert.match(html,/Proposed editorial transition · not Scripture · not approved/);
assert.match(html,/Proposed continuity · not Scripture · not approved/);
assert.match(html,/draft\.text/);
assert.match(html,/connector\.text/);
assert.doesNotMatch(html,/make\("p",beat\.explanation\)/);
assert.equal(proof.literaryReviewProgress.seamRestorationsThisPass,2);
assert.equal(proof.literaryReviewProgress.scriptureVersesRestoredThisPass,3);
assert.equal(proof.movements.filter(m=>m.literaryDeskPass?.editorialApproval===false).length,37);
assert.equal(proof.literaryReviewProgress.historicSourceBridgesAbsorbedIntoEssentialText,1);
assert.equal(proof.literaryReviewProgress.oralReadingsApproved,0);
assert.equal(proof.totals.sourceBridgeCandidates,16);
const afterTrials=proof.movements.flatMap(m=>m.beats.filter(b=>b.afterSelectedReadthroughTrial)
 .map(b=>({movement:m.id,beat:b})));
assert.deepEqual(afterTrials.map(x=>x.beat.id),["H20-01","H64-01"]);
assert.deepEqual(afterTrials.map(x=>x.beat.afterSelectedReadthroughTrial.refs),
 [["Exodus 12:29–30"],["John 19:31–37"]]);
for(const {beat} of afterTrials){
 const trial=beat.afterSelectedReadthroughTrial;
 assert.equal(trial.accepted,false);
 assert.equal(trial.publicationApproved,false);
 assert.equal(trial.originalUnitRefsUnmodified,true);
 for(const ref of trial.refs){
  assert.ok(!beat.refs.includes(ref),"Trial verse must not silently become selected Scripture");
  const parsed=parseScriptureContext(ref);
  assert.ok(parsed);
  for(const edition of ["dr-challoner","cpdv-2009","crampon-1923"]){
   const verses=new Map(get("data/scripture/witness/"+edition+"/"+parsed.passage.book+".json")
    .verses.map(([ch,v,t])=>[ch+":"+v,t]));
   for(let v=parsed.passage.verseStart;v<=parsed.passage.verseEnd;v++)
    assert.ok(verses.get(parsed.passage.chapter+":"+v)?.trim(),edition+" missing trial "+ref);
  }
 }
}
const middle=p3JudasTrial(proof);
function p3JudasTrial(source){
 const beat=source.movements.find(m=>m.id==="HS-M27")?.beats.find(b=>b.id==="H63-02");
 assert.ok(beat);
 assert.deepEqual(beat.refs,["Matthew 27:1–2","Matthew 27:11–26"]);
 const trial=beat.betweenSelectedReadthroughTrial;
 assert.ok(trial);
 assert.deepEqual(trial.refs,["Matthew 27:3–10"]);
 assert.equal(trial.afterReference,"Matthew 27:1–2");
 assert.equal(trial.beforeReference,"Matthew 27:11–26");
 assert.equal(trial.accepted,false);
 assert.equal(trial.publicationApproved,false);
 assert.equal(trial.originalUnitRefsUnmodified,true);
 assert.equal(trial.excludedFromMainSourceSelection,true);
 return trial;
}
assert.ok(middle);
assert.ok(html.includes("if(!bridge&&showBridges&&(!highPriorityBridgesOnly||isPriorityHistoriaBridge(beat))&&between?.afterReference===reference)"),
 "Judas witness comparison must be hidden unless explicitly opted in");
assert.ok(html.includes("Source omission remains in the main manuscript"));
const betweenRenderer=html.split("if(!bridge&&showBridges&&(!highPriorityBridgesOnly||isPriorityHistoriaBridge(beat))&&between?.afterReference===reference)")[1]
 .split("section.append(compare);held++;")[0];
assert.ok(betweenRenderer&&!betweenRenderer.includes("previous=pp")&&!betweenRenderer.includes("previous=p"),
 "Optional original witness must not close omitted main-source boundaries");
assert.ok(html.includes("const afterTrial=beat.afterSelectedReadthroughTrial"));
assert.ok(html.includes("if(!bridge&&showBridges&&(!highPriorityBridgesOnly||isPriorityHistoriaBridge(beat))&&afterTrial)"),"Research trials must be opt-in, never main reading");
assert.ok(html.includes("The main reading still omits this text"));
const researchTrialRenderer=html.split("const afterTrial=beat.afterSelectedReadthroughTrial")[1].split("host.append(compare);held++;")[0];
assert.ok(researchTrialRenderer&&!researchTrialRenderer.includes("previous=p"),
 "Trial source must not change the canonical omitted-seam pointer");
assert.equal(proof.totals.independentlyReadAndApproved,false);
assert.equal(proof.displayRules.neverCombineDifferentWitnessText,true);
assert.equal(proof.displayRules.showEveryDroppedSpanBetweenAdjacentScriptureFragments,true);
const originalA=new Map(economy.decisions.map(x=>[x.unitId,x]));
const originalB=new Map(desk.contextDecisions.filter(x=>x.readthroughDecision==="MANDATORY_BRIEF_CONTEXT").map(x=>[x.unitId,x]));
const originalBridges=new Map(desk.sourceBridgeCandidates.filter(x=>x.id!=="HS-CF-04").map(x=>[x.id,x]));
assert.deepEqual(proof.historicallyProposedBridgeStatus.absorbedByCompleteNativeReading,["HS-CF-04"]);
const seenA=new Set(),seenB=new Set(),seenBridges=new Set(),newOwnedBridges=new Set();
const p3OwnedBridgeToMovement={"HS-P3-CF-12":"HS-M33","HS-P3-CF-13":"HS-M34","HS-P3-CF-14":"HS-M35","HS-P3-CF-15":"HS-M37","HS-P3-CF-16":"HS-M37","HS-P3-CF-17":"HS-M20"};
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
   assert.ok(!seenBridges.has(beat.id)&&!newOwnedBridges.has(beat.id),"Duplicate proposed additional Scripture source");
   if(Object.hasOwn(p3OwnedBridgeToMovement,beat.id)){
    assert.equal(m.id,p3OwnedBridgeToMovement[beat.id]);
    if(beat.id==="HS-P3-CF-12")assert.equal(beat.reference,"Acts 14:26–27");
    assert.equal(beat.p3SourceOwnership,"NEW_INDEPENDENT_SCRIPTURE_SOURCE_BRIDGE_NOT_ORIGINAL_V18_ESSENTIAL");
    assert.equal(beat.editorialOwnerId,beat.id);
    assert.equal(beat.proposedScriptureNotAccepted,true);
    assert.equal(beat.publicationApproved,false);
    assert.equal(originalBridges.has(beat.id),false);
    newOwnedBridges.add(beat.id);
   }else{
    seenBridges.add(beat.id);
    assert.equal(originalBridges.get(beat.id)?.movementId,m.id);
    assert.equal(beat.reference,originalBridges.get(beat.id).reference);
   }
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
assert.deepEqual([...newOwnedBridges].sort(),Object.keys(p3OwnedBridgeToMovement).sort());
assert.equal(proof.p4LateMovementDraft.originalSourceBridgeCandidatesPreserved,10);
assert.equal(proof.p4LateMovementDraft.revisedTotalSourceBridgeCandidates,16);
assert.equal(proof.movements.find(x=>x.id==="HS-M34").beats.some(x=>x.id==="H73-02"),false,
 "Philippi jail conversion may not become an obligatory story");
assert.deepEqual(proof.movements.find(x=>x.id==="HS-M34").beats.map(x=>x.id),
 ["HS-CF-10","HS-CF-11","HS-P3-CF-13","H73-07"]);
assert.ok(proof.movements.find(x=>x.id==="HS-M24").beats.find(x=>x.id==="HS-CF-05"));
assert.ok(proof.movements.find(x=>x.id==="HS-M28").beats.find(x=>x.id==="HS-CF-06"));
assert.equal(proof.movements.find(x=>x.id==="HS-M10").beats.find(x=>x.id==="H22-02").refs[0],"Exodus 20:1–17");
assert.equal(proof.movements.find(x=>x.id==="HS-M18").beats.some(x=>x.id==="H45-01"||x.id==="H45-02"),false,
 "The two genealogies remain separate views, not compulsory verse lists");
for(const needle of ["historiaProofMovement","historiaProofEdition","historiaProofBridges",
 "proofSourceBridge","proofGap","showHistoriaMovement","toggleHistoriaProof"]){
 assert.ok(html.includes(needle),"Single existing workbench must render the complete source sequence: "+needle);
}
assert.equal(proof.movements.find(x=>x.id==="HS-M03").beats.some(x=>x.id==="H07-01"),false);
assert.equal(proof.movements.find(x=>x.id==="HS-M13").beats.some(x=>x.id==="HS-CF-04"),false);
assert.equal(proof.movements.find(x=>x.id==="HS-M14").beats.some(x=>x.id==="H34-02"),false);
assert.equal(proof.movements.find(x=>x.id==="HS-M19").beats.some(x=>x.id==="H48-02"),false);
assert.match(proof.movements.find(x=>x.id==="HS-M16").title,/Judah's fall/);
for(const [id,expected] of [
 ["H22-01",["Exodus 19:1–8"]],
 ["H30-01",["1Samuel 16:1–13"]],
 ["H33-01",["2Samuel 7:1–16"]],
 ["H39-01",["2Kings 17:3–8","2Kings 17:13–18"]],
 ["H35-02",["1Kings 6:1"]],
 ["H36-02",["1Kings 12:1–5","1Kings 12:13–20"]],
 ["H43-02",["Ezra 6:14–16","Ezra 6:19–22"]]
]){
 const beat=proof.movements.flatMap(x=>x.beats).find(x=>x.id===id);
 assert.deepEqual(beat.refs,expected);
 assert.equal(beat.publicationApproved,false);
}

for(const [id,expected] of [
 ["H11-02",["Genesis 15:1–6","Genesis 15:9–10","Genesis 15:13–14","Genesis 15:17–18"]],
 ["H13-01",["Genesis 22:1–19"]],
 ["H16-03",["Genesis 41:14–16","Genesis 41:25–30","Genesis 41:33–45"]],
 ["H21-03",["Exodus 14:5–10","Exodus 14:13–16","Exodus 14:19–23","Exodus 14:26–31"]]
]){
 const beat=proof.movements.flatMap(x=>x.beats).find(x=>x.id===id);
 assert.deepEqual(beat.refs,expected);
 assert.equal(beat.publicationApproved,false);
}
for(const beat of proof.movements.slice(0,19).flatMap(x=>x.beats).filter(x=>x.kind==="EDITORIAL_CONTEXT_NOT_BIBLE")){
 assert.ok(!/^(Mention|Identify|Keep|Indicate|Use|Name|State)\b/i.test(beat.explanation),
 "A readable text proof cannot contain instructions to the editor in place of transition prose");
 assert.match(beat.explanation,/\((?:Genesis|Exodus|Numbers|Deuteronomy|Ruth|1 Samuel|2 Samuel|1 Kings|Isaiah|Nehemiah|1 Maccabees|2 Maccabees|Luke|Matthew) /,
 "Every reader-facing transition must carry a source attribution");
 assert.equal(beat.editorialTextApproved,false);
}
assert.ok(necessity.units.length===217);
console.log("PASS Historia continuous proof: 37 movements, 93 real Scripture units, 29 visibly distinct context notes, 16 held source candidates (10 original, 6 P3-owned), "+scriptureVerses+" verse displays validated in CPDV + Douay; no character filler or extra Bible experience");
