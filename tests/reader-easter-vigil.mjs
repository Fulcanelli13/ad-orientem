import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createEasterVigilReaderController,buildEasterVigilReader,projectEasterVigilMassModel} from "../src/mass/reader-easter-vigil.js";
import {createMassReaderModel} from "../src/mass/reader-model.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const core=load("../data/mass/special-days-core.v1.1.json");
const payload=load("../data/presentation/reader-easter-vigil.v1.json");
const sectionMap=load("../data/presentation/reader-section-map.v0.13.1.json");
const low=load("../data/presentation/reader-text-low.v1.json");
const sung=load("../data/presentation/reader-text-sung.v1.json");
const canon=load("../data/presentation/reader-canon-source-map.v1.json");
const graph=core.graphs.EV;

assert.equal(graph.length,38);
assert.equal(payload.schema,"ao-r33-easter-vigil-payload-v1");
assert.ok(payload.donor.exsultet.lat.length>3500);
assert.ok(payload.donor.lauds.lat.includes("Benedíctus"));

let built=buildEasterVigilReader({graph,payload,fontMode:"IN_CHURCH",baptismPresent:false});
assert.equal(built.sourceRecordCount,38);
assert.ok(built.steps.some(x=>x.recordId==="EV-FONT-420"));
assert.ok(!built.steps.some(x=>x.recordId==="EV-FONT-410"));
assert.ok(!built.steps.some(x=>x.recordId==="EV-FONT-440"));
assert.ok(!built.steps.some(x=>x.recordId==="EV-BAPT-430"));
assert.equal(built.steps.at(-1).recordId,"EV-MASS-700");
assert.equal(built.steps.at(-1).handoffToMass,true);

const noFont=buildEasterVigilReader({graph,payload,fontMode:"NONE"});
assert.ok(noFont.steps.some(x=>x.recordId==="EV-FONT-410"));
assert.ok(!noFont.steps.some(x=>x.recordId==="EV-FONT-420"));
assert.ok(!noFont.steps.some(x=>x.recordId==="EV-FONT-450"));

const separate=buildEasterVigilReader({graph,payload,fontMode:"SEPARATE_BAPTISTERY",baptismPresent:true});
assert.ok(separate.steps.some(x=>x.recordId==="EV-FONT-440"));
assert.ok(separate.steps.some(x=>x.recordId==="EV-FONT-450"));
assert.ok(separate.steps.some(x=>x.recordId==="EV-BAPT-430"));

for(let n=1;n<=4;n++){
  const s=String(n).padStart(2,"0");
  assert.equal(built.steps.find(x=>x.recordId===`EV-LESS-${s}-READ`).posture,"SIT");
  assert.equal(built.steps.find(x=>x.recordId===`EV-LESS-${s}-OREM`).posture,"STAND");
  assert.equal(built.steps.find(x=>x.recordId===`EV-LESS-${s}-KNEEL`).posture,"KNEEL");
  assert.equal(built.steps.find(x=>x.recordId===`EV-LESS-${s}-KNEEL`).action,"SILENT_PRAYER");
  assert.equal(built.steps.find(x=>x.recordId===`EV-LESS-${s}-RISE`).posture,"STAND");
}
assert.equal(built.steps.find(x=>x.recordId==="EV-EXS-210").objectState,"CANDLE_STATE_UNCONSTRAINED_NOT_PRESCRIBED");
assert.equal(built.steps.find(x=>x.recordId==="EV-REN-510").action,"RESPOND_ABRENUNTIAMUS");
assert.equal(built.steps.find(x=>x.recordId==="EV-REN-520").action,"RESPOND_CREDIMUS");
assert.equal(built.steps.find(x=>x.recordId==="EV-REN-540").action,"RECEIVE_ASPERSION");

const ctrl=createEasterVigilReaderController({graph,payload,fontMode:"IN_CHURCH"});
assert.equal(ctrl.project().step.recordId,"EV-FIRE-010");
ctrl.goToRecord("EV-LUM-110");
assert.equal(ctrl.project().action,"GENUFLECT_TOWARD_PASCHAL_CANDLE_AND_RESPOND_DEO_GRATIAS");
ctrl.goToRecord("EV-MASS-700");
assert.equal(ctrl.project().handoffToMass,true);

const t=(lat,en)=>({lat,en});
const proper={
  sourcePath:"Tempora/Pasc0-0",
  introit:t("",""),collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),gradual:t("Alleluia","Alleluia"),sequence:{lat:"",en:""},
  gospel:t("Evangelium","Gospel"),offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],preface:t("Praefatio","Preface"),
  communion:{status:"NOT_APPLICABLE"},postcommunions:[t("Postcommunio","Postcommunion")],
};
const resolved={
  schema:"ao-resolved-mass-v2",date:"2027-03-27",form:"SOLEMN",presentationMode:"LIVE",
  calendarCelebration:{id:"holy-saturday",type:"CALENDAR"},actualCelebration:{id:"easter-vigil",type:"CALENDAR"},
  explicitlySelectedCelebration:true,proper:{status:"READY",data:proper,sourcePath:"Tempora/Pasc0-0"},
  overlays:[],precedingRites:[],followingActions:[],distinctRite:null,
};
const base=createMassReaderModel({resolvedMass:resolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap:canon});
assert.equal(base.totalCards,39);
const vigilMass=projectEasterVigilMassModel(base,payload);
assert.equal(vigilMass.structureOwner,"EASTER_VIGIL_COMPOSITE_MASS");
assert.equal(vigilMass.cardBySequence(1).sourceSequence,2);
assert.equal(vigilMass.cardBySequence(1).title,"Kyrie");
assert.ok(!vigilMass.cards.some(x=>(x.sourceSequence??x.sequence)===21),"Agnus Dei leaked into Vigil Mass");
assert.ok(!vigilMass.cards.some(x=>(x.sourceSequence??x.sequence)===30),"Last Gospel leaked into Vigil Mass");
assert.equal(vigilMass.cardForEvent("MC-COM-150"),null,"peace prayer leaked into Vigil Mass");
assert.equal(vigilMass.cardForEvent("MC-COM-160"),null,"ministerial Pax leaked into Vigil Mass");
assert.equal(vigilMass.cardForEvent("MC-END-010"),null,"Communion antiphon leaked into Vigil Mass");
assert.ok(vigilMass.cards.some(x=>x.sectionId==="SP.EASTER_VIGIL.15"),"Lauds insertion missing after ablutions");
const laudsIndex=vigilMass.cards.findIndex(x=>x.sectionId==="SP.EASTER_VIGIL.15");
assert.equal((vigilMass.cards[laudsIndex-1].sourceSequence??vigilMass.cards[laudsIndex-1].sequence),26);
assert.equal((vigilMass.cards[laudsIndex+1].sourceSequence??vigilMass.cards[laudsIndex+1].sequence),27);
assert.ok(vigilMass.cards.find(x=>(x.sourceSequence??x.sequence)===22).blocks.every(b=>b.blockId!=="AO.SM.B069"));
assert.ok(vigilMass.cards.find(x=>(x.sourceSequence??x.sequence)===26).blocks.every(b=>b.blockId!=="AO.SM.B085"));

console.log("Easter Vigil composite reader: PASS — 38-state rite, branch-aware font/baptism flow, Kyrie Mass handoff, Vigil Mass omissions and Lauds insertion.");
