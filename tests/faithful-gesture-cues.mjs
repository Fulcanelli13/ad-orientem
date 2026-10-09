import assert from "node:assert/strict";
import {
  extractCanonicalCueId,
  resolveFaithfulGestureForCue,
  GLORIA_CREDO_FAITHFUL_GESTURES,
} from "../src/mass/faithful-gesture-cues.js";

assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0056",gestureProfile:"GUIDED_1962"}),null,
  "customary Gloria bow leaked into GUIDED_1962");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0056",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0068",gestureProfile:"TRADITIONAL"}).type,"SIGN_OF_CROSS");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0090",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0101",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0104",gestureProfile:"TRADITIONAL"}).type,"SIGN_OF_CROSS");

const incarnatus=resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"ESSENTIAL"});
assert.equal(incarnatus.type,"GENUFLECT");
assert.equal(incarnatus.owner,"R17_RUBRICAL_CUE");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"GUIDED_1962"}).type,"GENUFLECT");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"TRADITIONAL",incarnatusAction:"KNEEL"}).type,"KNEEL");

assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0091",gestureProfile:"TRADITIONAL"}),null,
  "gesture inferred from adjacent Credo cue");

assert.equal(extractCanonicalCueId({currentCueId:"AO.SM.C0104"}),"AO.SM.C0104");
assert.equal(extractCanonicalCueId({current:{paragraph:{sourceCueId:"AO.SM.C0064"}}}),"AO.SM.C0064");
assert.equal(extractCanonicalCueId({random:"AO.SM.C0064"}),null);

// Source-backed language alignment: never silently invent or drift an
// English/French phrase away from the same exact Latin source cue.
import {readFileSync} from "node:fs";
const sung=JSON.parse(readFileSync("data/presentation/reader-text-sung.v1.json","utf8"));
const french=JSON.parse(readFileSync("data/presentation/reader-french-ordinary.v1.json","utf8"));
const sourced=new Map();
function collect(node){
  if(!node || typeof node!=="object")return;
  if(typeof node.cue_id==="string"){
    sourced.set(node.cue_id,node);
    return;
  }
  for(const value of Object.values(node)){
    if(Array.isArray(value))value.forEach(collect);
    else if(value && typeof value==="object")collect(value);
  }
}
collect(sung);
for(const [cueId,spec] of Object.entries(GLORIA_CREDO_FAITHFUL_GESTURES)){
  const source=sourced.get(cueId);
  assert.ok(source?.latin && source?.english && french.byCue[cueId],
    cueId+" lost its source-backed Latin/English/French pairing");
  for(const [name,anchor,actual] of [
    ["Latin",spec.anchorLat,source.latin],
    ["English",spec.anchorEn,source.english],
    ["French",spec.anchorFr,french.byCue[cueId]],
  ]){
    assert.ok(anchor && String(anchor).split(/\\s*(?:…|\\.\\.)\\s*/).every(fragment=>
      actual.toLocaleLowerCase().includes(fragment.toLocaleLowerCase())),
      cueId+" "+name+" word highlight is not a substring of its pinned source witness");
  }
}

console.log("faithful Gloria/Credo cue ownership: PASS");
