import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveOrdinarySpeaker, correctSungPreparatoryAmen, SUNG_ORDINARY_INTONATION_CUES } from "../src/mass/reader-speaker-roles.js";
import { buildNativeScholaTracks } from "../src/mass/reader-schola.js";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";

const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const low=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-low.v1.json",import.meta.url),"utf8"));
const byCue=corpus=>new Map(corpus.blocks.flatMap(block=>(block.units??[]).map(u=>[u.cue_id,u])));
const sungUnits=byCue(sung),lowUnits=byCue(low);
const audit=JSON.parse(readFileSync(new URL("../data/mass/ordinary-sung-speaker-audit.v1.json",import.meta.url),"utf8"));
assert.equal(audit.schema,"ao-ordinary-sung-speaker-audit-v1");
assert.equal(audit.records.length,280,"all 280 canonical Sung cues must have records");
assert.equal(new Set(audit.records.map(r=>r.cueId)).size,280);
assert.equal(new Set(audit.records.map(r=>r.blockId)).size,96);
assert.equal(audit.rawSha256,sung.source.rawSha256,"the actor audit must be tied to immutable donor hash");
const registry=new Map(audit.records.map(r=>[r.cueId,r]));
for(const block of sung.blocks){
  for(const unit of block.units??[]){
    const record=registry.get(unit.cue_id);
    assert.ok(record,unit.cue_id+": missing speaker record");
    assert.equal(record.blockId,block.Block_ID);
    assert.equal(record.sourceClock,unit.clock);
    assert.notEqual(record.role,"UNRESOLVED");
    const projected=resolveOrdinarySpeaker(unit,{form:"SUNG",blockId:block.Block_ID});
    assert.equal(projected.role,record.role,unit.cue_id+": registry diverges from runtime actor projection");
  }
}
assert.equal(registry.get("AO.SM.C0235").optionality,"LOCAL_CUSTOM_PRE1960_SURVIVAL",
  "second Confiteor must remain optional");
assert.equal(registry.get("AO.SM.C0235").role,"MINISTERS");
assert.equal(registry.get("AO.SM.C0238").role,"PRIEST");
assert.equal(registry.get("AO.SM.C0082").role,"GOSPEL_PROCLAIMER",
  "Solemn Gospel minister must not be hard-coded as the celebrant");
assert.equal(registry.get("AO.SM.C0259").role,"DISMISSAL_MINISTER",
  "Solemn dismissal must be form-sensitive");

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
// Four alternating Psalm 42 lines are typed responses, not an undifferentiated
// PUBLIC_TEXT paragraph. Keep their exact M. prefix for server ownership.
for(const cue of ["AO.SM.C0005","AO.SM.C0007","AO.SM.C0009","AO.SM.C0011"]){
  for(const [form,units] of [["LOW",lowUnits],["SUNG",sungUnits]]){
    const source=units.get(cue);
    const line=resolveOrdinarySpeaker(source,{form,blockId:"AO.SM.B003"});
    assert.equal(line.role,"MINISTERS",form+" / "+cue+" incorrect Psalm 42 speaker");
    assert.equal(line.kind,"RESPONSE",form+" / "+cue+" Psalm 42 must be a response");
    assert.match(source.latin,/^M\\. /u,form+" / "+cue+" missing original minister initial");
  }
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
  introit:t("Introitus","Introit"),collect:t("Collecta","Collect"),
  epistle:t("Epistola","Epistle"),gradual:t("Graduale","Gradual"),
  sequence:t("Sequentia","Sequence"),gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),secret:t("Secreta","Secret"),
  preface:t("Praefatio","Preface"),communion:t("Communio","Communion"),
  postcommunion:t("Postcommunio","Postcommunion"),
});
const tracks=buildNativeScholaTracks({sungCorpus:sung,properSlots:properToSlots,
  prepared:{session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}}});
assert.equal(tracks.tracks.find(t=>t.id==="GLORIA").segments[0].cueId,"AO.SM.C0055");
assert.equal(tracks.tracks.find(t=>t.id==="CREDO").segments[0].cueId,"AO.SM.C0091");
assert.ok(tracks.tracks.find(t=>t.id==="GLORIA").segments.every(s=>s.cueId!=="AO.SM.C0054"));
assert.ok(tracks.tracks.find(t=>t.id==="CREDO").segments.every(s=>s.cueId!=="AO.SM.C0090"));

console.log("Mass line ownership: PASS — all 280 cues assigned; preparatory Amens, intonations, conditional actors and Schola entrance.");
