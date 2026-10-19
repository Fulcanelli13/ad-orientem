import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {BELL_CUE_BINDINGS} from "../src/mass/reader-transients.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const inventory=read("../data/research/1962-cross-rite-bell-cue-inventory.v1.json");
const music=read("../data/research/mass-special-rite-music-events-20261019.v1.json");
const events=[1,2,3,4,5,6].flatMap(n=>read("../data/mass/mc-events-0"+n+".v1.json").events);
const index=new Map(events.map(x=>[x.id,x]));
assert.equal(inventory.status,"RESEARCH_ONLY_NOT_RUNTIME_AUTHORITY");
assert.equal(inventory.rules.triduumBellSilenceOverridesOrdinary,true);
assert.equal(inventory.rules.actualSoundRequiresExplicitObservation,true);
assert.equal(inventory.rules.clapperNeverRenderedAsBellIcon,true);
assert.equal(inventory.rules.choirTimingNotPriestTiming,true);
assert.equal(inventory.rules.consecratoryWordsNeverBell,true);
assert.deepEqual(inventory.ordinaryMass.map(x=>x.sourceCueId),
 BELL_CUE_BINDINGS.map(x=>x.cueId));
const soundRecords=new Set();
for(const item of inventory.ordinaryMass){
 assert.deepEqual(item.canonicalEventIds,
  BELL_CUE_BINDINGS.find(x=>x.cueId===item.sourceCueId).canonicalEventIds);
 assert.equal(item.soundStatus,"EXPECTED_NOT_HEARD");
 assert.ok(item.sources.includes("roman1962"));
 assert.ok(item.forms.LOW,"Low Mass must be explicitly considered for every ordinary cue");
 for(const id of item.canonicalEventIds){
  const ev=index.get(id);
  assert.ok(ev?.soundEvents?.some(x=>x.type==="ALTAR_BELL"&&x.audible===true),id+" needs a certified sound event");
  soundRecords.add(id);
 }
}
assert.equal(inventory.ordinaryMass.length,5);
assert.equal(soundRecords.size,7);
assert.equal(inventory.ordinaryMass.find(x=>x.id==="BEFORE_FAITHFUL_COMMUNION").forms.LOW,
 "SOURCE_NOT_CERTIFIED_IN_MC_GRAPH_REVIEW_REQUIRED");
assert.equal(index.get("MC-COM-185").forms.LOW,"UNAVAILABLE_UNCERTIFIED");
const srcRites=new Map(music.rites.map(x=>[x.id,x]));
assert.equal(srcRites.size,10);
assert.deepEqual(new Set(inventory.specialRites.map(x=>x.id)),new Set(srcRites.keys()));
for(const rite of inventory.specialRites){
 assert.equal(rite.sourceFile,srcRites.get(rite.id).sourceFile);
 assert.equal(rite.lifecycle,srcRites.get(rite.id).lifecycle);
 assert.equal(rite.automaticNewBellCue,false,rite.id+" would create unverified bell");
 assert.ok(rite.bellPolicy);
 assert.ok(existsSync(new URL("../"+rite.sourceFile,import.meta.url)),rite.sourceFile);
}
const e=new Map(inventory.additionalContexts.map(x=>[x.id,x]));
assert.deepEqual(new Set(e.keys()),new Set([
 "HOLY_THURSDAY_GLORIA","EASTER_VIGIL_GLORIA","BENEDICTION","TENEBRAE","REQUIEM_MASS",
]));
const specialCore=read("../data/mass/special-days-core.v1.1.json");
assert.equal(specialCore.mass_overlays.EASTER_VIGIL.modify_mc["MC-0013"].insert_signal,
 "CHURCH_BELLS_AT_GLORIA");
assert.equal(e.get("EASTER_VIGIL_GLORIA").status,
 "GRAPH_SIGNAL_EXISTS_NATIVE_CUE_RECONCILIATION_PENDING");
assert.equal(e.get("BENEDICTION").instrument,"ALTAR_BELL");
assert.equal(e.get("TENEBRAE").status,"NO_BELL_AND_STREPITUS_NOT_MANDATORY");
assert.ok(inventory.gaps.some(x=>x.startsWith("Low Mass conditional communion")));
for(const [key,url] of Object.entries(inventory.sources)){
 assert.ok(url.startsWith("https://") || existsSync(new URL("../"+url,import.meta.url)),
  key+" must cite a concrete online witness or exact repository path");
}
console.log("PASS 1962 cross-rite bell inventory: 5 ordinary cue moments / 7 sound events, 4 Mass forms, 10 native special rites, 5 exceptional contexts, Low Mass Communion and Holy Week gaps quarantined.");
