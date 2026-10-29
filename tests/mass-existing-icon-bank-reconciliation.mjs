// Bank-only reconciliation: an historical cue crosswalk is not the current
// 1962 runtime icon authority. Never infer minor elevation from Offertory labels.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {canonicalIconKeysForReaderState,actionMeaning,canonicalKey}
  from "../src/mass/reader-canonical-icons.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const audit=read("data/presentation/mass-existing-icon-bank-reconciliation-20261025.v1.json");
const canonical=read("data/presentation/mass-icon-canonical-set-20261021.v1.json");
const crosswalk=read("data/presentation/mass-icon-final-cue-crosswalk-20261020.v1.json");
const lock=read("data/presentation/mass-icon-final-user-lock-20261020.v1.json");
const priestActions=read("data/presentation/reader-priest-actions.v1.json").items;
const gesture=read("data/mass/gesture-matrix.v1.json").items;
const meaning=new Map(canonical.meanings.map(x=>[x.meaningId,x]));
const byLock=new Map(lock.items.map(x=>[x.id,x]));
const byAction=new Map(priestActions.map(x=>[x.cueId,x]));
const oldAction=new Map(crosswalk.rows.filter(x=>x.lane==="priest_action").map(x=>[x.cueId,x]));
assert.equal(audit.authority,"AUDIT_ONLY_NO_RUNTIME_REBIND");
assert.equal(audit.approvedSequence.length,10);
assert.equal(audit.unresolvedMeanings.length,10);
assert.deepEqual(audit.unresolvedMeanings.map(x=>x.meaningId),canonical.gaps.map(x=>x.meaningId),
  "Candidate audit drifted from real canonical gap IDs");
const used=new Set();
for(const rec of audit.approvedSequence){
 assert.ok(!used.has(rec.cueId),"duplicated phase: "+rec.cueId);
 used.add(rec.cueId);
 const m=meaning.get(rec.meaningId),a=byAction.get(rec.cueId),asset=byLock.get(rec.assetId);
 assert.ok(m&&a&&asset,rec.cueId+": missing canonical action, source cue or approval");
 assert.equal(m.assetId,rec.assetId,rec.cueId+": action asset changed");
 assert.equal(m.status,"locked",rec.cueId+": art not canonical locked");
 assert.equal(asset.rejected,false,rec.cueId+": rejected art");
 assert.ok(["approved","repurposed"].includes(asset.status),rec.cueId+": not approved or repurposed");
 assert.ok(existsSync(new URL("../"+m.path,import.meta.url)),rec.cueId+": file absent");
 const resolved=canonical.actionCueOverrides[rec.cueId] ??
  canonical.actionLabelMap[a.label];
 assert.equal(resolved,rec.meaningId,rec.cueId+": source action no longer selects intended art");
 assert.equal(actionMeaning(a,{form:"MISSA_CANTATA_SIMPLE",cueId:rec.cueId}),rec.meaningId);
 assert.equal(canonicalIconKeysForReaderState({form:"MISSA_CANTATA_SIMPLE",cueId:rec.cueId,priestAction:a}).priestActionIconKey,canonicalKey(rec.meaningId));
}
const requiredPhases={
 "AO.SM.C0110":"OFFERTORY_HOST","AO.SM.C0114":"OFFERTORY_CHALICE",
 "AO.SM.C0174":"MAJOR_ELEVATION_HOST","AO.SM.C0181":"MAJOR_ELEVATION_CHALICE",
 "AO.SM.C0216":"FRACTION","AO.SM.C0221":"COMMINGLING",
 "AO.SM.C0232":"PRIEST_COMMUNION_HOST","AO.SM.C0234":"PRIEST_COMMUNION_CHALICE",
 "AO.SM.C0247":"FIRST_ABLUTION_CHALICE","AO.SM.C0248":"SECOND_ABLUTION_FINGERS"
};
assert.deepEqual(Object.fromEntries(audit.approvedSequence.map(x=>[x.cueId,x.phase])),requiredPhases);

// The 20 Oct preview originally reversed both ablutions. The current
// crosswalk is now reconciled to the source-correct 21 Oct canonical meaning;
// retain the historical mistake as a non-live audit record only.
for(const fix of audit.historicalCorrection){
 assert.notEqual(oldAction.get(fix.cueId)?.assetId,fix.oldCrosswalk,
   "Reversed historical purification icon reintroduced");
 assert.equal(oldAction.get(fix.cueId)?.assetId,fix.canonical,
   "Published source-correct ablution icon no longer matches the original");
 assert.equal(canonical.actionCueOverrides[fix.cueId],fix.canonical.replace("ao_purify_chalice","priest.action.purify_chalice").replace("ao_purify_fingers","priest.action.purify_fingers"));
 assert.equal(meaning.get(canonical.actionCueOverrides[fix.cueId])?.assetId,fix.canonical);
}
const notSame=(a,b)=>assert.notEqual(meaning.get(a)?.assetId,meaning.get(b)?.assetId);
notSame("priest.action.offer_host","priest.action.elevate_host");
notSame("priest.action.offer_chalice","priest.action.elevate_chalice");
notSame("priest.action.fraction","priest.action.commingling");
notSame("priest.action.purify_chalice","priest.action.purify_fingers");
for(const [cueId,label,target] of [
 ["AO.SM.C0204","MINOR ELEVATION","priest.action.minor_elevation"],
 ["AO.SM.C0242","SHOWS SACRED HOST","priest.action.shows_host"]
]){
 assert.equal(byAction.get(cueId)?.label,label);
 assert.equal(actionMeaning(byAction.get(cueId),{cueId,form:"MISSA_CANTATA_SIMPLE"}),target);
 assert.equal(canonicalKey(target),null,
  cueId+" must not borrow Offertory or Consecration pictograms without exact approval");
}
for(const [cue,gestureType,iconKey] of [
 ["AO.SM.C0084","GOSPEL_BOOK_AND_BODY_CROSSES","gospel_crosses"],
 ["AO.SM.C0269","GOSPEL_BOOK_AND_BODY_CROSSES","gospel_crosses"],
 ["AO.SM.C0117","JOIN_HANDS","hands_joined"],
 ["AO.SM.C0263","JOIN_HANDS","hands_joined"],
 ["AO.SM.C0090","HEAD_BOW","head_bow"],
]){
 assert.ok(gesture.some(x=>x.actor==="PRIEST"&&x.cueId===cue&&
   x.gesture===gestureType&&x.iconKey===iconKey&&x.iconStatus==="V46_SEMANTIC_BINDING"),
  "Historical priest gesture assignment lost: "+cue);
}
// Frozen matching artwork does not itself override a later user status.
for(const id of ["v46_communion","v46_gospel","v46_incense"])
 assert.ok(byLock.get(id)?.rejected,id+" must remain rejected");
assert.equal(byLock.get("v46_priest_elevate_host_rich")?.name,"Priest offers Host");
assert.equal(byLock.get("v46_priest_elevate_chalice_rich")?.name,"Priest offers Chalice");
assert.ok(existsSync(new URL("../assets/recovered/ao-live-blessing.svg",import.meta.url)),
  "Recovered frozen blessing candidate absent");
console.log("Mass approved bank reconciliation: PASS — 10 distinct approved action phases, both ablutions in corrected order, 10 gap candidates reviewed without illicit rebindings.");
