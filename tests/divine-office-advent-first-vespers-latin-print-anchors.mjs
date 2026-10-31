import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {reviewAdventLatinPrintedIncipits as review}
 from "../src/office/advent-first-vespers-latin-print-anchors.js";
const witness=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-latin-print-anchors.json",import.meta.url),"utf8"));
const proper="Tempora/Adv1-0",psalter="Psalterium/Psalmi/Psalmi major";
const segments=["143(1-8)","143(9-15)","144(1-7)",
 "144(8-'13a')","144('13b'-21)"];
function sources(){
 return new Map([
  [proper,{sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:proper,language:"la",
   map:new Map([
    ["Ant Vespera",["@:Ant Laudes"]],
    ["Ant Laudes",[
     "In illa die * stillabunt montes",
     "Jucundare, * filia Sion et exsulta",
     "Ecce Dominus veniet * et omnes",
     "Omnes sitientes * venite ad aquas",
     "Ecce veniet * Propheta magnus"
    ]],
    ["Capitulum Laudes",["!Rom 13:11",
     "v. Fratres: Hora est jam nos de somno surgere",
     "$Deo gratias"]],
    ["Ant 1",["Ecce nomen Domini * venit de longinquo"]],
    ["Oratio",["Excita quaesumus Domine potentiam tuam","$Qui vivis"]]
   ])}],
  [psalter,{sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:psalter,language:"la",
   map:new Map([["Day6 Vespera",segments.map(s=>"Source line;;"+s)]])}]
 ]);
}
const reader=src=>async path=>src.get(path);
test("8 real-print-preview incipit anchors match independently sourced Latin shape while zero certification",async()=>{
 const src=sources(),r=await review({witness,readSource:reader(src)});
 assert.equal(r.status,"EIGHT_PRINTED_INCIPIT_ANCHORS_MATCH_NOT_FULL_COLLATION");
 assert.equal(r.matchedPrintedIncipits,8);
 assert.deepEqual(r.receipts.map(x=>x.id),witness.anchors.map(x=>x.id));
 assert.equal(r.selectedPsalmPortions[3][1],"8-13a");
 assert.equal(r.printedTypicaCertified,false);
 assert.equal(r.fullHourTextCertified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("one altered Latin antiphon, collect or chapter blocks printed preview concordance",async()=>{
 for(const [name,replace] of [
  ["Ant Laudes",["In illa die * stillabunt montes","Wrong second antiphon",
   "Ecce Dominus veniet * et omnes","Omnes sitientes * venite ad aquas",
   "Ecce veniet * Propheta magnus"]],
  ["Ant 1",["Ecce rex * venit"]],
  ["Capitulum Laudes",["!Rom 13:11","v. Different chapter","$Deo gratias"]],
  ["Oratio",["Different collect","$Qui vivis"]]
 ]){
  const s=sources();s.get(proper).map.set(name,replace);
  assert.equal((await review({witness,readSource:reader(s)})).status,"WITHHELD");
 }
});
test("wrong 109 Sunday psalter, altered 13a/13b, missing alias or wrong pin hold",async()=>{
 const wrong=[
  s=>s.get(psalter).map.set("Day6 Vespera",[";;109",";;110",";;111",";;112",";;113"]),
  s=>s.get(psalter).map.set("Day6 Vespera",[";;143(1-8)",";;143(9-15)",
   ";;144(1-7)",";;144(8-13)",";;144(13-21)"]),
  s=>s.get(proper).map.delete("Ant Vespera"),
  s=>{s.get(proper).sourceRevision="not-the-pin"},
  s=>{s.get(proper).language="en"}
 ];
 for(const mutate of wrong){const s=sources();mutate(s);
  const r=await review({witness,readSource:reader(s)});
  assert.equal(r.status,"WITHHELD");assert.equal(r.publishable,false);
 }
});
test("manifest cannot claim 1961 printed approval or greater source coverage",async()=>{
 for(const alteration of [
  {typicaWitnessCertified:true},{fullHourTextCertified:true},
  {witnessType:"ORIGINAL_1961"},
  {acceptedScope:"FULL_HOUR"},{officePart:"SECOND"},
  {pinnedOfficeRevision:"wrong"},{anchors:witness.anchors.slice(0,7)}
 ]){
  const r=await review({witness:{...witness,...alteration},readSource:reader(sources())});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.matchedPrintedIncipits,0);
 }
});
