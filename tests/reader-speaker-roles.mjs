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
// The generic SUNG donor is conditional, but *every* resolved Sung reader
// form must preserve the other 277 source-owned actors. This exhaustively
// prevents formFamily("SUNG") from erasing the chosen celebrant/deacon roles
// while protecting the Schola, priest-private and response source clocks.
const conditionalPublicCues=new Set(["AO.SM.C0082","AO.SM.C0084","AO.SM.C0259"]);
for(const [form,publicMinister] of [
  ["MISSA_CANTATA_SIMPLE","PRIEST"],
  ["MISSA_CANTATA_INCENSE","PRIEST"],
  ["SOLEMN","DEACON"],
]){
  let checked=0;
  for(const block of sung.blocks){
    for(const unit of block.units??[]){
      const expected=conditionalPublicCues.has(unit.cue_id)
        ?publicMinister:registry.get(unit.cue_id).role;
      const projected=resolveOrdinarySpeaker(unit,{form,blockId:block.Block_ID});
      assert.equal(projected.role,expected,
        form+"/"+unit.cue_id+": selected-form speaker disagrees with immutable 1962 source ownership");
      if(conditionalPublicCues.has(unit.cue_id)){
        assert.equal(projected.evidence,"1962_SELECTED_FORM_PUBLIC_GOSPEL_OR_DISMISSAL");
      }
      checked++;
    }
  }
  assert.equal(checked,280,form+": incomplete selected-form speaker coverage");
}
// A response must remain a response, regardless of whether its live
// minister is the priest, subdeacon, deacon, choir or congregation.
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
  const source=form==="LOW"?low:sung;
  for(const block of source.blocks){
    for(const unit of block.units??[]){
      const latin=String(unit.latin??"").trim();
      if(!/^(?:℟[.]|R[.])[ ]*/u.test(latin))continue;
      const role=resolveOrdinarySpeaker(unit,{form,blockId:block.Block_ID}).role;
      assert.ok(["RESPONDERS","MINISTERS"].includes(role),
        form+"/"+unit.cue_id+": printed response cannot acquire priest/deacon role");
    }
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
    assert.ok(String(source.latin).startsWith("M. "),form+" / "+cue+" missing original minister initial");
  }
}

for(const cue of ["AO.SM.C0045","AO.SM.C0047","AO.SM.C0049","AO.SM.C0051"]){
  const lowLine=resolveOrdinarySpeaker(lowUnits.get(cue),{form:"LOW",blockId:"AO.SM.B015"});
  const sungLine=resolveOrdinarySpeaker(sungUnits.get(cue),{form:"SUNG",blockId:"AO.SM.B015"});
  assert.equal(lowLine.role,"MINISTERS",cue+" Low Mass Kyrie must be assigned to the server");
  assert.equal(lowLine.kind,"RESPONSE",cue+" Low Mass Kyrie should be typed as a response");
  assert.equal(sungLine.role,"SCHOLA",cue+" sung Kyrie must retain independent schola ownership");
  assert.notEqual(sungLine.kind,"RESPONSE",cue+" sung choir part is not a server dialogue");
}
// Low Mass Gospel is proclaimed by the celebrant and the Low
// dismissal is his, whereas Solemn Gospel/dismissal are minister roles.
for(const cue of ["AO.SM.C0082","AO.SM.C0084","AO.SM.C0259"]){
  const lowLine=resolveOrdinarySpeaker(lowUnits.get(cue),{
    form:"LOW",blockId:cue==="AO.SM.C0259"?"AO.SM.B090":
      cue==="AO.SM.C0082"?"AO.SM.B024":"AO.SM.B025",
  });
  assert.equal(lowLine.role,"PRIEST",cue+" low celebrant ownership lost");
}
assert.equal(resolveOrdinarySpeaker(sungUnits.get("AO.SM.C0082"),{
  form:"SUNG",blockId:"AO.SM.B024",
}).role,"GOSPEL_PROCLAIMER");
assert.equal(resolveOrdinarySpeaker(sungUnits.get("AO.SM.C0259"),{
  form:"SUNG",blockId:"AO.SM.B090",
}).role,"DISMISSAL_MINISTER");

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
