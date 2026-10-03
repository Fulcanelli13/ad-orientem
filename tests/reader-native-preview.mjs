import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { legacyReaderStateSnapshot, prepareNativeReaderPreview } from "../src/mass/reader-native-preview.js";

const load=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const data={
  sectionMap:load("../data/presentation/reader-section-map.v0.13.1.json"),
  lowCorpus:load("../data/presentation/reader-text-low.v1.json"),
  sungCorpus:load("../data/presentation/reader-text-sung.v1.json"),
};
const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("I","Introit"),collects:[t("C","Collect")],epistle:t("E","Epistle"),
  gradual:t("G","Gradual"),sequence:{lat:"",en:""},gospel:t("Gsp","Gospel"),
  offertory:t("O","Offertory"),secrets:[t("S","Secret")],preface:t("P","Preface"),
  communion:t("Cm","Communion"),postcommunions:[t("Pc","Postcommunion")],
};
const prepared={
  session:{resolvedMass:{
    schema:"ao-resolved-mass-v2",date:"2026-10-04",form:"MISSA_CANTATA_INCENSE",
    presentationMode:"LIVE",calendarCelebration:{id:"day",type:"CALENDAR"},
    actualCelebration:{id:"holy_rosary",type:"VOTIVE",title:"Holy Rosary"},
    explicitlySelectedCelebration:true,proper:{status:"READY",data:proper},
    overlays:["VOTIVE_PROPER"],precedingRites:[],followingActions:[],distinctRite:null,
  }},
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"},
};
const ready=await prepareNativeReaderPreview({prepared,presentationData:data});
assert.equal(ready.model.totalCards,30);
assert.equal(ready.model.cards[14].title,"Consecration of the Sacred Host");
assert.equal(ready.model.cards[15].title,"Consecration of the Chalice");

const nodes={
  "#stationText":{textContent:"ALTAR"},
  "#postureText":{textContent:"KNEEL"},
  "#gestureText":{textContent:"BOW"},
  "#responseText":{textContent:"Amen"},
  "#voiceText":{textContent:"LOW VOICE"},
  "#scholaDock":{classList:{contains:x=>x==="show"}},
  "#scholaStreamLine":{textContent:"Sanctus"},
};
const snapshot=legacyReaderStateSnapshot({querySelector:s=>nodes[s]??null});
assert.equal(snapshot.priestPosition.label,"ALTAR");
assert.equal(snapshot.posture.label,"KNEEL");
assert.equal(snapshot.gesture.label,"BOW");
assert.equal(snapshot.response.label,"Amen");
assert.equal(snapshot.priestVoice.label,"LOW VOICE");
assert.equal(snapshot.schola.label,"Sanctus");

let blocked=false;
try{
  await prepareNativeReaderPreview({
    prepared:{...prepared,session:{resolvedMass:{...prepared.session.resolvedMass,overlays:["REQUIEM"]}}},
    presentationData:data,
  });
}catch(error){blocked=/not yet certified for overlay REQUIEM/.test(String(error.message))}
assert.equal(blocked,true,"unsupported special graph did not fail closed");

console.log("native reader preview: PASS — R17 owns cards; legacy state donation is explicit and temporary.");
