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
console.log("PASS Good Friday 3 and Easter Vigil 4 authentic 1962 biblical reading identities, order and separate native rites");
