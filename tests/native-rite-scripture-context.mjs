import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createGoodFridayReaderController} from "../src/mass/reader-good-friday.js";
import {createPalmReaderController} from "../src/mass/reader-palm.js";
import {nativeRiteScriptureContext} from "../src/mass/scripture-native-rite-context.js";
import {NATIVE_RITE_SCRIPTURE_READINGS,NATIVE_RITE_SCRIPTURE_VERSION}
  from "../src/mass/scripture-native-rite-index.js";
import {scriptureSegmentsReference} from "../src/scripture/segments.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const register=load("../data/mass/native-rite-scripture-release.v1.json");
assert.equal(register.version,NATIVE_RITE_SCRIPTURE_VERSION);
assert.deepEqual(register.nativeReadings,NATIVE_RITE_SCRIPTURE_READINGS,
  "Native runtime citation index diverged from source-owned ledger");
assert.equal(register.nativeReadings.length,9);
const nativeKeys=new Set();
for(const entry of register.nativeReadings){
 const key=entry.rite+"|"+entry.stateId;
 assert.ok(!nativeKeys.has(key),"A native reading must have one source owner");
 nativeKeys.add(key);
 assert.equal(scriptureSegmentsReference(entry.segments),entry.reference);
 assert.match(entry.witnessUrl,/^https:\/\//);
 assert.ok(entry.latinIncipit.length>20);
}
const core=load("../data/mass/special-days-core.v1.1.json");
const gfPayload=load("../data/presentation/reader-good-friday.v1.json");
const gf=createGoodFridayReaderController({graph:core.graphs.GF,payload:gfPayload});
const gfPreview={
 root:{dataset:{}},
 getGoodFridayState:()=>gf.project(),
 getCurrentCard:()=>gf.project().card,
};
const gfPrepared={session:{plan:{kind:"DISTINCT_RITE",rite:"GOOD_FRIDAY"}}};
const expected=[
 ["GF-LESS-110","Hosea 6:1–6",1],
 ["GF-LESS-210","Exodus 12:1–11",1],
 ["GF-PASS-310","John 18:1–40; 19:1–30",2],
 ["GF-PASS-330","John 19:31–42",1]
];
for(const [id,reference,count] of expected){
 gf.goToRecord(id);
 const result=nativeRiteScriptureContext(gfPreview,gfPrepared);
 assert.equal(result?.state,"READY",id+" must match native source and Latin");
 assert.equal(result?.reference,reference);
 assert.equal(result?.segments.length,count);
 assert.equal(result?.nativeStateId,id);
 assert.equal(result?.provenance,"NATIVE_1962_RITE_STATE_LATIN_SOURCE_BOUND");
}
gf.goToRecord("GF-PASS-320");
assert.equal(nativeRiteScriptureContext(gfPreview,gfPrepared),null,
  "Good Friday death-pause cue is not a new Bible reading and must not receive a capsule");
gf.goToRecord("GF-LESS-120");
assert.equal(nativeRiteScriptureContext(gfPreview,gfPrepared),null,
  "Oremus/Flectamus after a Lesson is not the Lesson");
gf.goToRecord("GF-PASS-310");
assert.equal(nativeRiteScriptureContext(gfPreview,{session:{plan:{kind:"MASS",rite:"GOOD_FRIDAY"}}}),null,
  "A fake ordinary Mass cannot inherit a Good Friday native citation");
assert.equal(nativeRiteScriptureContext(gfPreview,{session:{plan:{kind:"DISTINCT_RITE",rite:"EASTER_VIGIL"}}}),null,
  "Native state citations must not cross ritual graphs");
const tamperedLatin={...gf.project(),card:{...gf.project().card,paragraphs:
 gf.project().card.paragraphs.map(x=>x.id==="GF-PASS-A1"?{...x,latin:"Textus corruptus"}:x)}};
assert.equal(nativeRiteScriptureContext({...gfPreview,getGoodFridayState:()=>tamperedLatin},gfPrepared),null,
  "A changed Latin Passion must invalidate its Scripture control");
const missingEnding={...gf.project(),card:{...gf.project().card,paragraphs:
 gf.project().card.paragraphs.map((x,i,all)=>i===all.length-1?{...x,latin:x.latin.replace("tradidit spiritum","aliud")}:x)}};
assert.equal(nativeRiteScriptureContext({...gfPreview,getGoodFridayState:()=>missingEnding},gfPrepared),null,
  "Pre-death Passion link cannot survive deletion of the death cue");
const palmGraph=load("../data/mass/special-days-extension.v1.3.json").graphs.PALM;
const palmPayload=load("../data/presentation/reader-palm.v1.json");
const palm=createPalmReaderController({graph:palmGraph,payload:palmPayload});
palm.goTo("PALM-R03");
const palmPreview={
 root:{dataset:{r17NativeEvent:"palm"}},
 getPalmState:()=>palm.project(),
 getCurrentCard:()=>palm.project().card,
};
const palmPrepared={session:{plan:{kind:"MASS"}}};
const procession=nativeRiteScriptureContext(palmPreview,palmPrepared);
assert.equal(procession?.reference,"Matthew 21:1–9");
assert.equal(procession?.nativeStateId,"PALM-GSP-020");
assert.equal(procession?.segments.length,1);
palmPreview.root.dataset.r17NativeEvent="mass";
assert.equal(nativeRiteScriptureContext(palmPreview,palmPrepared),null,
 "The pre-procession Gospel must disappear after Mass handoff");
palmPreview.root.dataset.r17NativeEvent="palm";
palm.goTo("PALM-R04");
assert.equal(nativeRiteScriptureContext(palmPreview,palmPrepared),null,
 "Palm processional chant must not inherit its preceding Gospel");
palm.goTo("PALM-R03");
const changedPalm={...palm.project(),card:{...palm.project().card,paragraphs:
 palm.project().card.paragraphs.map(x=>x.id==="PALM-R03-03"?{...x,latin:"Non evangelium"}:x)}};
assert.equal(nativeRiteScriptureContext({...palmPreview,
 getPalmState:()=>changedPalm,getCurrentCard:()=>changedPalm.card},palmPrepared),null);
const ev=load("../data/presentation/reader-easter-vigil.v1.json");
assert.match(ev.donor.prophecies.lat,/Isaias 4:2–6/);
assert.doesNotMatch(ev.donor.prophecies.lat,/Isaias 4:1–6/);
assert.ok(ev.donor.prophecies.lat.length<300,
 "Vigil retains only a summary: never treat it as source-verified Bible text");
const falseEaster={
 root:{dataset:{r17NativeEvent:"easter-vigil"}},
 getEasterVigilState:()=>({step:{recordId:"EV-LESS-03-READ"}}),
 getCurrentCard:()=>({id:"PROPHECY_3"})
};
assert.equal(nativeRiteScriptureContext(falseEaster,{session:{plan:{kind:"COMPOSITE_DISTINCT_RITE",rite:"EASTER_VIGIL"}}}),null,
 "A native Prophecy source ID alone must not publish Bible context before Latin text is present");
const mass=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
const preview=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(mass,/nativeRiteScriptureContext\(preview,prepared\)/);
assert.match(mass,/data-r17-native-rite-record/);
assert.match(preview,/root\.dataset\.r17NativeRiteRecord=controller\.project\(\)\.step/);
assert.match(preview,/root\.dataset\.r17NativeRiteRecord=kind/);
console.log("PASS native Scripture Context: 4 source-bound Good Friday moments, Palm preceding Gospel, death pause/chant/Latin vetoes, Easter Vigil summary safely held");
