import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const base=load("data/mass/icksp-1962-full-icon-cue-screening-20261025.v1.json");
const a=load("data/mass/icksp-1962-icon-exception-adjudication-20261025.v1.json");
const matrix=load("data/mass/gesture-matrix.v1.json").items;
const source=load("data/presentation/reader-text-sung.v1.json").blocks.flatMap(b=>b.units??[]);
const actualLatin=new Map(source.map(x=>[x.cue_id,String(x.latin??"")]));
assert.equal(a.schema,"ao-icksp-1962-icon-exception-adjudication-v1");
assert.equal(a.counts.liveCodeChanges,0);
assert.equal(a.counts.canonicalIdChanges,0);
assert.equal(base.rows.length,279);
assert.equal(a.counts.lexicalCandidates,15);
assert.equal(a.counts.alreadyProtectedGloriaCredo,12);
assert.equal(a.counts.validNonliteralAnchor,1);
assert.equal(a.counts.alreadySuppressedCanonDuplicates,2);
const candidates=base.rows.filter(x=>x.sourceFlags.includes("FAITHFUL_SOURCE_TRIGGER_OUTSIDE_CUE_TEXT")).map(x=>x.cueId);
assert.deepEqual(a.lexicalAdjudications.map(x=>x.cueId),candidates,"Must adjudicate every source-screened lexical anomaly without extra invented cues");
const allowed=["RESOLVED_IN_ACTIVE_GLORIA_CREDO_EXACT_CUE_OWNER","VALID_SEMANTIC_EVENT_ANCHOR_NOT_LITERAL_LATIN_ERROR","ALREADY_SUPPRESSED_BY_ACTIVE_V183_CUE_CONTROLLER"];
for(const row of a.lexicalAdjudications){
  assert.ok(allowed.includes(row.disposition),row.cueId+" unknown disposition");
  assert.ok(actualLatin.has(row.cueId)&&actualLatin.has(row.legacyTriggerBelongsTo));
}
assert.equal(a.lexicalAdjudications.filter(x=>x.disposition===allowed[0]).length,12);
assert.equal(a.lexicalAdjudications.filter(x=>x.disposition===allowed[1]).length,1);
assert.equal(a.lexicalAdjudications.filter(x=>x.disposition===allowed[2]).length,2);
for(const cue of ["AO.SM.C0197","AO.SM.C0198"]){
 const row=a.lexicalAdjudications.find(x=>x.cueId===cue);
 assert.equal(row.legacyTriggerBelongsTo,"AO.SM.C0196");
}
assert.match(actualLatin.get("AO.SM.C0196"),/Nobis quoque peccatóribus/);
assert.doesNotMatch(actualLatin.get("AO.SM.C0197"),/Nobis quoque peccatóribus/);
const cueRuntime=readFileSync(new URL("../src/mass/reader-cue-state.js",import.meta.url),"utf8");
for(const id of ["AO.SM.C0197","AO.SM.C0198"])
 assert.match(cueRuntime,new RegExp('"' + id.replaceAll(".","\\.") + '"'));
assert.match(cueRuntime,/V183_GESTURE_SUPPRESS/);
const owner=readFileSync(new URL("../src/mass/reader-canonical-icons.js",import.meta.url),"utf8");
assert.match(owner,/GLORIA_CREDO_FAITHFUL_GESTURES/);
assert.match(owner,/isGloriaCredoCue/);
const arts=matrix.filter(x=>!x.iconKey);
assert.equal(arts.length,17);
assert.deepEqual(a.unboundArtDisposition.map(x=>x.gestureMatrixId),arts.map(x=>x.id),
 "Every exact-art hold must have one source-row disposition");
assert.equal(a.unboundArtDisposition.filter(x=>x.actor==="PRIEST").length,7);
assert.equal(a.unboundArtDisposition.filter(x=>x.actor==="FAITHFUL").length,10);
for(const row of a.unboundArtDisposition){
 assert.ok(row.reason?.length>25,"Insufficient icon hold adjudication: "+row.cueId);
 assert.equal(row.approvalRequiredBeforeNewArtwork,true);
}
assert.deepEqual(a.unboundArtDisposition.filter(x=>x.disposition==="ALREADY_HANDLED_BY_ACTIVE_EXACT_CUE_PROFILE").map(x=>x.cueId),["AO.SM.C0056"]);
assert.deepEqual(a.unboundArtDisposition.filter(x=>x.disposition==="ALREADY_HANDLED_BY_ACTIVE_RUBRICAL_CALENDAR_GATE").map(x=>x.cueId),["AO.SM.C0096"]);
console.log("PASS 15 lexical exceptions: 12 old Gloria/Credo duplicates blocked, 1 Gospel semantic anchor, 2 already-suppressed Canon duplicates; 17 unbound art records adjudicated, no runtime or frozen registry edits");
