import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveOrdinarySpeaker, correctSungPreparatoryAmen, SUNG_ORDINARY_INTONATION_CUES } from "../src/mass/reader-speaker-roles.js";
import { buildNativeScholaTracks } from "../src/mass/reader-schola.js";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";

const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const low=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-low.v1.json",import.meta.url),"utf8"));
const byCue=corpus=>new Map(corpus.blocks.flatMap(block=>(block.units??[]).map(u=>[u.cue_id,u])));
const sungUnits=byCue(sung),lowUnits=byCue(low);
for(const [cue,role,marker] of [
  ["AO.SM.C0020","PRIEST","S."],
  ["AO.SM.C0025","MINISTERS","M."],
  ["AO.SM.C0027","MINISTERS","M."],
]){
  assert.equal(resolveOrdinarySpeaker(sungUnits.get(cue)).role,role);
  assert.ok(String(lowUnits.get(cue)?.latin).startsWith(marker),
    cue+": published Low Mass speaker witness not found");
  assert.equal(correctSungPreparatoryAmen(cue,sungUnits.get(cue).latin),marker+" Amen.");
  assert.equal(correctSungPreparatoryAmen(cue,lowUnits.get(cue).latin,{form:"LOW"}),lowUnits.get(cue).latin);
}
for(const cue of SUNG_ORDINARY_INTONATION_CUES){
  assert.equal(resolveOrdinarySpeaker(sungUnits.get(cue)).role,"PRIEST",cue+": celebrant intonation misowned");
}
assert.equal(resolveOrdinarySpeaker(sungUnits.get("AO.SM.C0055")).role,"SCHOLA");
assert.equal(resolveOrdinarySpeaker(sungUnits.get("AO.SM.C0091")).role,"SCHOLA");
assert.equal(resolveOrdinarySpeaker(sungUnits.get("AO.SM.C0136")).role,"RESPONDERS");
assert.equal(resolveOrdinarySpeaker(sungUnits.get("AO.SM.C0133")).role,"PRIEST",
  "priest's private Amen must not become a congregational response");

const t=(lat,en)=>({lat,en});
const properToSlots=properToReaderSlots({
  introit:t("Introitus","Introit"),gradual:t("Graduale","Gradual"),
  sequence:t("Sequentia","Sequence"),offertory:t("Offertorium","Offertory"),
  communion:t("Communio","Communion"),
});
const tracks=buildNativeScholaTracks({sungCorpus:sung,properSlots:properToSlots,
  prepared:{session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}}});
assert.equal(tracks.tracks.find(t=>t.id==="GLORIA").segments[0].cueId,"AO.SM.C0055");
assert.equal(tracks.tracks.find(t=>t.id==="CREDO").segments[0].cueId,"AO.SM.C0091");
assert.ok(tracks.tracks.find(t=>t.id==="GLORIA").segments.every(s=>s.cueId!=="AO.SM.C0054"));
assert.ok(tracks.tracks.find(t=>t.id==="CREDO").segments.every(s=>s.cueId!=="AO.SM.C0090"));

console.log("Mass line ownership: PASS — preparatory Amens, intonations, responders and Schola entrance.");
