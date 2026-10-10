import assert from "node:assert/strict";
import "./easter-vigil-prophecies-source.mjs";
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
assert.match(payload.donor.prophecies.lat,/Isaias 4:2–6/);
assert.match(payload.donor.prophecies.en,/Isaiah 4:2–6/);
assert.doesNotMatch(payload.donor.prophecies.lat,/Isaias 4:1–6/);
assert.ok(payload.donor.exsultet.lat.length>3500);
assert.ok(payload.donor.lauds.lat.includes("Benedíctus"));

let built=buildEasterVigilReader({graph,payload,fontMode:"IN_CHURCH",baptismPresent:false});
assert.equal(built.sourceRecordCount,38);
assert.ok(built.steps.some(x=>x.recordId==="EV-FONT-420"));
assert.ok(!built.steps.some(x=>x.recordId==="EV-FONT-410"));
assert.ok(!built.steps.some(x=>x.recordId==="EV-FONT-440"));
assert.ok(!built.steps.some(x=>x.recordId==="EV-BAPT-430"));

const inChurchFont=built.steps.find(x=>x.recordId==="EV-FONT-420").paragraphs;
assert.ok(inChurchFont.length>=25,"full blessing must show prayer, preface, candle and oils, not overview prose");
assert.ok(inChurchFont.some(x=>x.latin.includes("Omnípotens sempitérne Deus, adésto")));
assert.ok(inChurchFont.some(x=>x.latin.includes("Vere dignum et iustum est")));
assert.ok(inChurchFont.some(x=>x.latin.includes("Descéndat in hanc plenitúdinem fontis")));
assert.ok(inChurchFont.some(x=>x.latin.includes("Infúsio Chrísmatis")));
assert.ok(inChurchFont.some(x=>x.latin.includes("Commíxtio Chrísmatis")));
assert.ok(inChurchFont.every(x=>x.latin.length>5&&x.english.length>5&&x.french.length>5));
assert.equal(new Set(inChurchFont.map(x=>x.id)).size,inChurchFont.length,"no duplicate blessing paragraphs");
assert.ok(inChurchFont.some(x=>x.action==="LOWER_PASCHAL_CANDLE_INTO_WATER_AND_BREATHE_PSI"));
assert.equal(payload.font1962.segments.length,17);
assert.match(payload.font1962.status,/NOT_PRINTED_IMAGE_CERTIFIED/);
const inChurchTransfer=built.steps.find(x=>x.recordId==="EV-FONT-450").paragraphs;
assert.equal(inChurchTransfer.length,8,"Sicut cervus three-line canticle plus five font versicles/collect");
assert.match(inChurchTransfer[0].latin,/Sicut cervus/);
assert.match(inChurchTransfer[6].latin,/Omnípotens sempitérne Deus, réspice/);
assert.doesNotMatch(inChurchTransfer[6].latin,/adésto magnæ/,"do not repeat original blessing after procession");

assert.equal(built.steps.at(-1).recordId,"EV-MASS-700");
assert.equal(built.steps.at(-1).handoffToMass,true);

const litanyI=built.steps.find(x=>x.recordId==="EV-LIT1-400").paragraphs;
const litanyII=built.steps.find(x=>x.recordId==="EV-LIT2-600").paragraphs;
assert.equal(litanyI.length,92,"1962 Vigil first Litany must have 46 complete versicle/response pairs");
assert.equal(litanyII.length,60,"1962 Vigil second Litany must have 30 complete versicle/response pairs");
for(const [name,part] of [["first",litanyI],["second",litanyII]]){
  assert.ok(part.every((p,i)=>p.speaker===(i%2?"ALL":"CANTORS")),name+" Litany speaker role");
  assert.ok(part.every((p,i)=>p.kind===(i%2?"RESPONSE":"VERSICLE")),name+" Litany call-response kind");
  assert.ok(part.every(p=>p.latin&&p.english&&p.french&&p.english.startsWith(p.latin.slice(0,2))),name+" Litany trilingual alignment");
  assert.equal(new Set(part.map(p=>p.id)).size,part.length,name+" Litany row IDs");
}
assert.match(litanyI[litanyI.length-2].latin,/Omnes Sancti et Sanctæ Dei/);
assert.match(litanyII[0].latin,/Propítius esto/);
assert.match(litanyII[litanyII.length-2].latin,/Christe, audi nos/);
for(const [id,expected] of [["EV-REN-500",3],["EV-REN-510",6],["EV-REN-520",6],["EV-REN-530",4]]){
  const rows=built.steps.find(x=>x.recordId===id).paragraphs;
  assert.equal(rows.length,expected,id+" complete printed-1962 renewal text rows");
  assert.ok(rows.every(p=>p.english?.length>5&&p.french?.length>5),id+" trilingual text");
}
const vows=built.steps.find(x=>x.recordId==="EV-REN-510").paragraphs;
assert.deepEqual(vows.map(x=>x.speaker),["CELEBRANT","ALL","CELEBRANT","ALL","CELEBRANT","ALL"]);
const beliefs=built.steps.find(x=>x.recordId==="EV-REN-520").paragraphs;
assert.deepEqual(beliefs.map(x=>x.speaker),["CELEBRANT","ALL","CELEBRANT","ALL","CELEBRANT","ALL"]);
const pater=built.steps.find(x=>x.recordId==="EV-REN-530").paragraphs;
assert.match(pater[1].latin,/sed líbera nos a malo/);
assert.match(pater[2].latin,/Et Deus omnípotens/);
assert.equal(pater[3].speaker,"ALL");
assert.doesNotMatch(pater[1].latin,/…/);
assert.equal(payload.criticalTextB06.litanyFirstInvocations,46);
assert.equal(payload.criticalTextB06.litanySecondInvocations,30);
assert.match(payload.criticalTextB06.status,/NOT_ORIGINAL_PRINTED/);


const noFont=buildEasterVigilReader({graph,payload,fontMode:"NONE"});
assert.ok(noFont.steps.some(x=>x.recordId==="EV-FONT-410"));
assert.ok(!noFont.steps.some(x=>x.recordId==="EV-FONT-420"));
assert.ok(!noFont.steps.some(x=>x.recordId==="EV-FONT-450"));
assert.ok(!noFont.steps.some(x=>x.recordId==="EV-BAPT-430"));
assert.throws(()=>buildEasterVigilReader({graph,payload,fontMode:"NONE",baptismPresent:true}),/configured font/);


const separate=buildEasterVigilReader({graph,payload,fontMode:"SEPARATE_BAPTISTERY",baptismPresent:true});
assert.ok(separate.steps.some(x=>x.recordId==="EV-FONT-440"));
assert.ok(separate.steps.some(x=>x.recordId==="EV-FONT-450"));
assert.ok(separate.steps.some(x=>x.recordId==="EV-BAPT-430"));
const separateIds=separate.steps.map(x=>x.recordId);
assert.ok(separateIds.indexOf("EV-FONT-440")<separateIds.indexOf("EV-BAPT-430"),"baptisms cannot precede baptismal water blessing");
assert.ok(separateIds.indexOf("EV-BAPT-430")<separateIds.indexOf("EV-FONT-450"));
const separateFont=separate.steps.find(x=>x.recordId==="EV-FONT-440").paragraphs;
assert.ok(separateFont.length>=33);
assert.match(separateFont[0].latin,/Sicut cervus/);
assert.ok(separateFont.some(x=>x.latin.includes("Descéndat in hanc plenitúdinem fontis")));
assert.equal(separate.steps.find(x=>x.recordId==="EV-FONT-450").paragraphs.length,1,"return from separate baptistery is silent");
const baptismSurface=separate.steps.find(x=>x.recordId==="EV-BAPT-430").paragraphs;
assert.equal(baptismSurface.length,1);
assert.equal(baptismSurface[0].kind,"RUBRIC");
assert.match(baptismSurface[0].sourceStatus,/RITUAL_OWNER_UNRESOLVED/);
assert.doesNotMatch(baptismSurface[0].latin,/Ego te baptízo/,"not a fabricated baptismal formula");


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
const base=createMassReaderModel({resolvedMass:resolved,sectionMap,lowCorpus:low,sungCorpus:sung,canonSourceMap:canon,properNotApplicableSlots:["INTROIT","COMMUNION"]});
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
