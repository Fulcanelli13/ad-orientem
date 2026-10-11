import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=name=>JSON.parse(readFileSync(new URL("../data/"+name,import.meta.url),"utf8"));
const corpus=read("presentation/reader-text-sung.v1.json");
const minister=read("mass/ritus-1962-solemn-ministers-batch02.v1.json");
const earlier=read("mass/ritus-1962-verified-ceremonial-batch01.v1.json");
const cues=new Map(corpus.blocks.flatMap(b=>(b.units||[]).map(u=>[u.cue_id,{macro:b.Macro_ID,latin:u.latin,branch:b.Branch_Status}])));
const ev=minister.events;
const get=id=>ev.find(e=>e.id==="MR62.SOL.B02."+id);

assert.equal(cues.size,279);
assert.equal(ev.length,67);
assert.equal(earlier.events.length,44);
assert.equal(minister.invariants.noRuntimeImport,true);
assert.equal(minister.invariants.preserveLIVE48,true);
assert.equal(minister.invariants.faithfulPostureUnchanged,true);
assert.equal(minister.sourceIdentity.massProfile,"SOLEMN");
assert.equal(minister.sourceIdentity.notApplicableToMissaCantata,true);
assert.equal(minister.authority.originalMissalLatinReview,"PENDING");

const ids=new Set();
const actors=new Set(["PRIEST","DEACON","SUBDEACON","ACOLYTES","THURIFER"]);
const anchors=new Set(["NEAR_CUE","BEFORE_CUE","AFTER_CUE","EXACT_CUE","WITHIN_TEXT_CUE","VISIBLE_STATE","BRANCH_ONLY_RITE_EVENT"]);
for(const e of ev){
  assert(!ids.has(e.id),"duplicate event "+e.id); ids.add(e.id);
  assert(actors.has(e.actor),e.id+" has invalid actor");
  assert(anchors.has(e.anchorType),e.id+" has invalid anchor type");
  assert.equal(e.formScope,"SOLEMN");
  assert.equal(e.latinFacsimileReviewed,false);
  assert.equal(e.runtimeCertified,false);
  assert.ok(e.condition && e.ritus && e.sourceUrl && e.shortRubricFr,e.id+" missing evidence/condition");
  assert.ok(e.sourceUrl.includes("ritus-servandus-translated-english/download/#page="),e.id+" missing primary PDF page");
  if(e.cueId)assert(cues.has(e.cueId),e.id+" loses source cue");
  else{
    assert.equal(e.anchorType,"BRANCH_ONLY_RITE_EVENT","missing cue but not branch event "+e.id);
    assert(e.branchMoment,e.id+" missing explicit stage");
  }
}
assert.equal(ev.filter(e=>e.actor==="DEACON").length,31);
assert.equal(ev.filter(e=>e.actor==="SUBDEACON").length,24);
assert.equal(ev.filter(e=>e.actor==="ACOLYTES").length,5);
assert.equal(ev.filter(e=>e.actor==="PRIEST").length,4);
assert.equal(ev.filter(e=>e.actor==="THURIFER").length,4);
assert.equal(ev.filter(e=>e.condition==="REQUIEM").length,12);

assert.equal(get("049").cueId,"AO.SM.C0209");
assert.match(cues.get(get("049").cueId).latin.normalize("NFD").replace(/\p{M}/gu,""),/dimitte nobis debita nostra/i,
  "Pater movement must trigger INSIDE the Pater text, not at block opening");
assert.equal(get("049").anchorType,"WITHIN_TEXT_CUE");
assert.equal(get("024").actionKey,"HOLD_PATEN_BEHIND_CELEBRANT_UNTIL_PATERNOSTER");
assert.equal(get("024").condition,"NOT_REQUIEM");
assert.equal(get("025").condition,"REQUIEM");
assert.equal(get("050").cueId,"AO.SM.C0209");\nassert.equal(get("050").anchorType,"WITHIN_TEXT_CUE");\nassert.equal(minister.reviewGates[0].status,"OPEN");

for(const id of ["003","006","007","008","010","011","012","023","024","030","032","040","045","046","050","051","054","055","056"])
 assert.equal(get(id).condition==="REQUIEM",false,id+" incorrectly enabled in Requiem");
for(const id of ["025","031","033","047","048","057","063","064","065","066","067"])
 assert.equal(get(id).condition,"REQUIEM",id+" has no Requiem guard");
for(const id of ["057","063"]){
 assert.equal(get(id).cueId,null,id+" attached to suppressed text");
 assert.equal(get(id).anchorType,"BRANCH_ONLY_RITE_EVENT");
}
assert.equal(get("065").actor,"ACOLYTES","Requiem Gospel book is supported by two acolytes (Ritus XIII.2)");
assert.equal(get("018").condition,"NOT_REQUIEM","Requiem water formula is not verified");
assert.equal(get("062").cueId,null,"Oratio super populum branch cannot fabricate an ordinary source cue");
assert.equal(get("061").condition,"ITE_MISSA_EST");
assert.equal(get("061").actor,"DEACON");
assert.equal(get("020").condition,"REQUIEM");
assert.equal(get("019").condition,"NOT_REQUIEM");

console.log("PASS 1962 Solemn-minister research QA: 67 actions, 5 actor lanes, 12 Requiem exceptions, no fabricated cues.");
