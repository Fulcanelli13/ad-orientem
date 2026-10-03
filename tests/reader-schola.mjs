import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { properToReaderSlots } from "../src/mass/proper-reader-slots.js";
import { createNativeScholaController } from "../src/mass/reader-schola.js";

const sung=JSON.parse(readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const t=(lat,en)=>({lat,en});
const proper={
  introit:t("Introitus","Introit"),collect:t("Collecta","Collect"),epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia"),sequence:t("Sequentia","Sequence"),
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secret:t("Secreta","Secret"),preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),postcommunion:t("Postcommunio","Postcommunion"),
};
const properSlots=properToReaderSlots(proper);
const prepared={session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}};
const schola=createNativeScholaController({sungCorpus:sung,properSlots,prepared});
assert.equal(schola.supported,true);

for(const id of ["INTROIT","KYRIE","GLORIA","GRADUAL","ALLELUIA_TRACT_SEQUENCE","CREDO","OFFERTORY","SANCTUS_BENEDICTUS","AGNUS_DEI","COMMUNION"]){
  assert.ok(schola.trackIds.includes(id),"missing native Schola track "+id);
}

let s=schola.activateForCard(2);
assert.equal(s.trackId,"KYRIE");
assert.equal(s.schola.cueId,"AO.SM.C0044");
assert.equal(s.schola.owner,"R17_NATIVE_SCHOLA");
s=schola.next();
assert.equal(s.schola.cueId,"AO.SM.C0045");

s=schola.syncCue("AO.SM.C0056");
assert.equal(s.trackId,"GLORIA");
assert.equal(s.schola.cueId,"AO.SM.C0056");
assert.match(s.schola.latin,/Adorámus/);

s=schola.activateForCard(6);
assert.equal(s.trackId,"GRADUAL");
assert.equal(s.schola.latin,"Graduale et Alleluia");
s=schola.selectTrack("ALLELUIA_TRACT_SEQUENCE");
assert.equal(s.schola.latin,"Sequentia");

s=schola.activateForCard(13);
assert.equal(s.trackId,"SANCTUS_BENEDICTUS");
assert.equal(s.schola.cueId,"AO.SM.C0145");
const before=s.index;
s=schola.activateForCard(14);
assert.equal(s.trackId,"SANCTUS_BENEDICTUS");
assert.equal(s.index,before,"Canon card change fabricated Schola progress");

while(!schola.project().complete) schola.next();
const ended=schola.project();
assert.equal(ended.complete,true);
const last=ended.schola.segmentId;
assert.equal(schola.next().schola.segmentId,last,"completed Schola track looped to the beginning");

s=schola.activateForCard(4);
assert.equal(s.schola,null);
assert.equal(s.ownership,"R17_EXACT_SCHOLA_NONE");

console.log("native Schola: PASS — independent tracks, exact Ordinary cues, Proper tracks, no looping, no card-driven fake progress.");
