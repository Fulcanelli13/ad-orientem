import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {scripturePassage} from "../src/scripture/catalogue.js";
const load=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const corpus=load("../data/mass/distinct-rite-scripture-order.v1.json");
const graphs=load("../data/mass/special-days-core.v1.1.json").graphs;
assert.equal(corpus.rites.length,2);
assert.equal(corpus.status,"SOURCE_VERIFIED_ORDER_RESEARCH_ONLY_NOT_UI_LINKED");
const expected=[
 ["GOOD_FRIDAY_1962","GF",["Hosea","Exodus","John"]],
 ["EASTER_VIGIL_1962","EV",["Genesis","Exodus","Isaiah","Deuteronomy"]]
];
const seen=new Set();let count=0,crossChapter=0;
for(const [riteId,graphId,bookOrder] of expected){
 const rite=corpus.rites.find(x=>x.riteId===riteId);
 assert.ok(rite,riteId);
 assert.equal(rite.entries.length,bookOrder.length);
 assert.match(rite.witnessUrl,/^https:\/\/www\.missalemeum\.com\/en\/widgets\/propers\/2026-04-0[34]/);
 const states=graphs[graphId];
 assert.ok(Array.isArray(states)&&states.length>25);
 const ids=states.map(x=>x.id);
 let lastPosition=-1;
 for(const [position,entry] of rite.entries.entries()){
  assert.equal(entry.order,position+1,"Source order must be natural, never numeric L-suffix sorted");
  assert.equal(entry.scriptureSegments[0].book,bookOrder[position]);
  assert.ok(entry.nativeStateIds.length>0);
  assert.ok(entry.scriptureSegments.length>=1);
  for(const stateId of entry.nativeStateIds){
   assert.ok(ids.includes(stateId),riteId+" unknown native state "+stateId);
   assert.ok(!seen.has(stateId),stateId+" reused by two source readings");
   seen.add(stateId);
   assert.ok(ids.indexOf(stateId)>lastPosition,riteId+" source rite chronology changed");
   lastPosition=ids.indexOf(stateId);
   assert.ok(!/-(OREM|KNEEL|RISE)$/.test(stateId), "Orations and bodily cues are not a reading");
  }
  for(const segment of entry.scriptureSegments){
   assert.deepEqual(scripturePassage(segment),segment,
    "Canonical Catholic book/chapter invalid in "+riteId+" "+entry.role);
  }
  const spans=entry.scriptureSegments.length>1;
  if(spans)crossChapter++;
  assert.match(entry.status,/(NOT_YET_RUNTIME_LINKED|CROSS_CHAPTER)/,
   "Research citation must not acquire spurious published UI status");
  assert.ok(!Object.hasOwn(entry,"commentaryUrl"),"No improvised patristic attribution");
  count++;
 }
}
assert.equal(count,7);
assert.equal(crossChapter,3);
assert.equal(seen.size,9); // Two lessons + three Good Friday Passion states + four Vigil prophecy states.
const GF=corpus.rites.find(x=>x.riteId==="GOOD_FRIDAY_1962");
assert.deepEqual(GF.entries[2].nativeStateIds,["GF-PASS-310","GF-PASS-320","GF-PASS-330"],
 "Passion death-pause boundaries must never be collapsed into a single native cue");
assert.equal(GF.entries[2].displayReference,"John 18:1–40; 19:1–42");
const EV=corpus.rites.find(x=>x.riteId==="EASTER_VIGIL_1962");
assert.deepEqual(EV.entries.map(x=>x.nativeStateIds[0]),
 ["EV-LESS-01-READ","EV-LESS-02-READ","EV-LESS-03-READ","EV-LESS-04-READ"]);
assert.equal(EV.entries[1].displayReference,"Exodus 14:24–31; 15:1");
assert.equal(EV.entries[2].displayReference,"Isaiah 4:2–6");
assert.equal(corpus.excludedFromTheseReadings.length,4);
const palm=corpus.palmSunday;
assert.equal(palm.riteId,"PALM_SUNDAY_1962");
assert.equal(palm.canonicalSourcePath,"Tempora/Quad6-0");
assert.equal(palm.precedingRiteGospel.nativeStateId,"PALM-GSP-020");
assert.equal(palm.precedingRiteGospel.displayReference,"Matthew 21:1–9");
assert.equal(palm.massPassion.standardMassProperSlot,"GOSPEL");
assert.equal(palm.massPassion.nativeStateId,undefined,"No invented palm native state for Mass Passion");
assert.equal(palm.massPassion.displayReference,"Matthew 26:36–75; 27:1–60");
assert.equal(palm.massPassion.status,"SOURCE_VERIFIED_MASS_PROPER_SEGMENTED_CONTEXT_AVAILABLE");
const palmGraph=load("../data/mass/special-days-extension.v1.3.json").graphs.PALM;
assert.equal(palmGraph.length,12);
assert.ok(palmGraph.some(x=>x.id===palm.precedingRiteGospel.nativeStateId&&x.phase==="GOSPEL"));
const palmPayload=load("../data/presentation/reader-palm.v1.json");
const latin=text=>String(text??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").replaceAll("æ","ae").replaceAll("Æ","ae").replaceAll("œ","oe").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
assert.ok(latin(palmPayload.texts.gospel).includes(latin(palm.precedingRiteGospel.latinIncipit)),"Palm source Gospel text no longer matches source witness");
for(const item of [palm.precedingRiteGospel,palm.massPassion]){
 for(const segment of item.scriptureSegments)assert.deepEqual(scripturePassage(segment),segment);
}
const vigilMass=EV.afterLitanyMass;
assert.equal(vigilMass.handoffNativeStateId,"EV-MASS-700");
assert.ok(graphs.EV.some(x=>x.id===vigilMass.handoffNativeStateId&&x.phase==="MASS_HANDOFF"));
assert.deepEqual(vigilMass.readings.map(x=>x.properSlot),["EPISTLE_OR_LESSON","GOSPEL"]);
assert.deepEqual(vigilMass.readings.map(x=>x.displayReference),["Colossians 3:1–4","Matthew 28:1–7"]);
for(const row of vigilMass.readings){
 assert.ok(row.status==="PROPER_TEXT_HANDOFF_MATCH_REQUIRED");
 assert.ok(row.latinIncipit.length>=16);
 assert.equal(row.nativeStateIds,undefined,"The Kyrie handoff must not be misrepresented as an EV reading state");
 assert.equal(row.scriptureSegments.length,1);
 assert.deepEqual(scripturePassage(row.scriptureSegments[0]),row.scriptureSegments[0]);
}
const feast=load("../data/mass/scripture-feast-reading-supplement.v1.json");
assert.ok(feast.holds.some(x=>x.sourcePath==="Tempora/Quad6-0"&&x.slot==="GOSPEL"));
assert.ok(load("../data/mass/scripture-segmented-proper.v1.json").readings.some(x=>x.sourcePath==="Tempora/Quad6-0"&&x.slot==="GOSPEL"));
assert.ok(!feast.celebrations.some(x=>x.sourcePath==="Tempora/Quad6-6"),"Special Vigil Mass must not be imported into ordinary generic source registry");

console.log("PASS native GF/EV 7 readings + Palm two distinct Gospels + Vigil post-litany 2 Mass Proper slots, no unsafe context capsules");
