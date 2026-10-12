import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=path=>JSON.parse(readFileSync(new URL("../data/"+path,import.meta.url),"utf8"));
const r=load("mass/ritus-1962-priest-cue-owner-reconciliation13.v1.json");
const historic=load("mass/alphonsus-fortescue-direct-book-evidence-batch02.v1.json");
const a=load("mass/alphonsus-fortescue-semantic-reconciliation-remaining97.v1.json");
const b=load("mass/alphonsus-fortescue-low-sung-differences-adjudicated.v1.json");
const gm=load("mass/gesture-matrix.v1.json");
const pos=load("presentation/reader-priest-positions.v1.json");
const voices=load("presentation/reader-priest-voices.v1.json");
const responses=load("presentation/reader-responses.v1.json");
const actions=load("presentation/reader-priest-actions.v1.json");
const sung=load("presentation/reader-text-sung.v1.json");
const low=load("presentation/reader-text-low.v1.json");
const b1=load("mass/ritus-1962-verified-ceremonial-batch01.v1.json");
const b2=load("mass/ritus-1962-solemn-ministers-batch02.v1.json");

const units=corpus=>new Map(corpus.blocks.flatMap(b=>(b.units??[])
 .filter(x=>/^AO\.SM\.C\d{4}$/.test(x.cue_id))
 .map(x=>[x.cue_id,{unit:x,macro:b.Macro_ID}])));
const s=units(sung),l=units(low),byEvidence=new Map(historic.items.map(e=>[e.id,e]));
const review=new Map([...a.items,...b.items].map(e=>[e.id,e]));
const byRec=new Map(r.items.map(e=>[e.id,e]));
assert.equal(s.size,279);assert.equal(l.size,275);
assert.deepEqual(r.counts,{alreadyCovered:4,partiallyCovered:3,stillRequiresIntegration:6});
assert.equal(r.items.length,13);
assert.equal(new Set(r.items.map(e=>e.id)).size,13);
assert.equal(r.policy.noRuntimeChange,true);
assert.equal(r.policy.priestClockIndependentOfSchola,true);
assert.equal(r.policy.noNewPerIpsumOrDomineNonSumDignusGestures,true);

for(const item of r.items){
  const original=review.get(item.idFromBookReview);
  assert(original,"review parent missing "+item.id);
  assert.equal(item.originalCanonicalCue,original.cueId);
  const evidence=byEvidence.get(item.sourceBookEvidenceRecordId);
  assert(evidence,"book evidence missing "+item.id);
  assert.equal(evidence.cueId,item.originalCanonicalCue);
  assert.equal(evidence.alphonsusEvidence.printedPage,item.sourcePrintedPage);
  assert(s.has(item.originalCanonicalCue)&&l.has(item.originalCanonicalCue));
  assert.equal(item.notApprovedForLive,true);
  assert.equal(item.congregationMandate,false);
  assert.equal(item.cueTextMutation,false);
  assert(item.finding.length>65&&item.nextAction.length>40,"insufficient analysis "+item.id);
}
const get=id=>byRec.get("AO.CER.REC."+String(id).padStart(2,"0"));
assert.equal(get(1).stage,"BEFORE_C0001");
assert.equal(get(2).stage,"BEFORE_C0001");
assert.equal(s.get(get(3).originalCanonicalCue).unit.latin.startsWith("Deus"),true);
assert.equal(b2.events.find(x=>x.id==="MR62.SOL.B02.017").anchorType,"BEFORE_CUE");
assert.equal(b2.events.find(x=>x.id==="MR62.SOL.B02.017").actor,"DEACON");
assert.equal(b1.events.find(x=>x.id==="B01-014").condition,"NOT_REQUIEM");
assert.equal(b1.events.find(x=>x.id==="B01-015").condition,"REQUIEM");
assert.match(s.get("AO.SM.C0150").unit.latin,/pétimus/i);
assert.match(s.get("AO.SM.C0151").unit.latin,/uti accepta/i);
assert.equal(gm.items.find(x=>x.id==="GM.P.C0151.01").triggerLatin,"uti accepta habeas et benedícas");
assert.equal(get(5).status,"REQUIRES_CUE_REANCHOR");
const chal=gm.items.filter(x=>x.cueId==="AO.SM.C0181"&&x.actor==="PRIEST");
assert(chal.some(x=>x.gesture==="GENUFLECT"));
assert.equal(b1.events.filter(x=>x.cueId==="AO.SM.C0181"&&x.actor==="PRIEST"&&Number.isInteger(x.microOrder)).length,4);
assert.equal(s.get("AO.SM.C0076").unit.clock,"USER_RESPONSE");
assert.equal(l.get("AO.SM.C0076").unit.clock,"MINISTER_RESPONSE");
assert(!responses.items.some(x=>x.cueId==="AO.SM.C0076"),"new response record requires owner review");
assert.equal(get(7).status,"PARTIALLY_MODELED_ROLE_NEEDS_REVIEW");
assert.equal(pos.items.find(x=>x.cueId==="AO.SM.C0081").routeId,"MOVE_CENTER_TO_GOSPEL_MISSAL");
assert.equal(pos.items.find(x=>x.cueId==="AO.SM.C0082").station,"ALTAR_GOSPEL_MISSAL");
for(const cue of ["AO.SM.C0145","AO.SM.C0148"]){
 assert.equal(s.get(cue).unit.clock,"SCHOLA_PUBLIC");
 assert(gm.items.some(x=>x.cueId===cue&&x.actor==="PRIEST"&&x.displayPrimary),
 "Need independent priest clock at "+cue);
}
assert.equal(get(9).status,"REQUIRES_INDEPENDENT_PRIEST_CLOCK");
assert.equal(get(10).status,"REQUIRES_INDEPENDENT_PRIEST_CLOCK");
assert.equal(voices.items.find(x=>x.cueId==="AO.SM.C0196").voice,"BRIEFLY AUDIBLE / THEN LOW");
assert.equal(voices.items.find(x=>x.cueId==="AO.SM.C0196").scope,"EVENT_ONLY");
assert.equal(s.get("AO.SM.C0211").unit.latin,"Amen.");
assert(!actions.items.some(x=>x.cueId==="AO.SM.C0211"&&/PATEN/.test(x.label)),
 "A newly introduced paten event needs a dedicated form-state review");
for(const cue of ["AO.SM.C0229","AO.SM.C0230","AO.SM.C0231"]){
 assert(gm.items.some(x=>x.cueId===cue&&x.actor==="PRIEST"&&x.gesture==="BREAST_STRIKE"));
 assert(actions.items.some(x=>x.cueId===cue&&x.label==="STRIKES BREAST"));
}
assert.equal(get(13).status,"ALREADY_MODELED_TRIPLE_GESTURE");
assert.equal(r.highestImpactUnresolved.length,5);
console.log("PASS Mass owner reconciliation: 13 sourced issues = 4 already handled, 3 partial, 6 requiring integration; 2 Schola clock hazards and 1 altar-kiss reanchor.");
