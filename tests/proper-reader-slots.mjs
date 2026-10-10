import assert from "node:assert/strict";
import { properToReaderSlots, assertReaderProperReady } from "../src/mass/proper-reader-slots.js";

const t=(lat,en)=>({lat,en,fr:""});
const proper={
  sourcePath:"Sancti/10-07",
  introit:t("Introitus","Introit"),
  collects:[t("Collecta","Collect")],
  epistle:t("Epistola","Epistle"),
  gradual:t("Graduale et Alleluia","Gradual and Alleluia"),
  sequence:{lat:"",en:"",fr:""},
  gospel:t("Evangelium","Gospel"),
  offertory:t("Offertorium","Offertory"),
  secrets:[t("Secreta","Secret")],
  preface:t("Praefatio","Preface"),
  communion:t("Communio","Communion"),
  postcommunions:[t("Postcommunio","Postcommunion")],
};
const mapped=properToReaderSlots(proper);
assert.equal(mapped.ready,true);
assert.equal(mapped.missing.length,0);
assert.equal(mapped.slots.INTROIT.status,"READY");
assert.equal(mapped.slots.GRADUAL.data.paragraphs[0].latin,"Graduale et Alleluia");
assert.equal(mapped.slots.ALLELUIA_TRACT_SEQUENCE.status,"NOT_APPLICABLE");
assert.equal(assertReaderProperReady(mapped),mapped);

const withSequence=properToReaderSlots({...proper,sequence:t("Dies irae","Day of wrath")});
assert.equal(withSequence.slots.ALLELUIA_TRACT_SEQUENCE.status,"READY");
assert.equal(withSequence.slots.ALLELUIA_TRACT_SEQUENCE.data.paragraphs[0].vernacular,"Day of wrath");

const frenchProper={
  ...proper,
  introit:{lat:"Introitus",en:"",fr:"Introït"},
  collects:[{lat:"Collecta",en:"",fr:"Collecte"}],
  epistle:{lat:"Epistola",en:"",fr:"Épître"},
  gradual:{lat:"Graduale",en:"",fr:"Graduel"},
  gospel:{lat:"Evangelium",en:"",fr:"Évangile"},
  offertory:{lat:"Offertorium",en:"",fr:"Offertoire"},
  secrets:[{lat:"Secreta",en:"",fr:"Secrète"}],
  preface:{lat:"Praefatio",en:"",fr:"Préface"},
  communion:{lat:"Communio",en:"",fr:"Communion"},
  postcommunions:[{lat:"Postcommunio",en:"",fr:"Postcommunion"}],
};
const french=properToReaderSlots(frenchProper,{language:"fr"});
assert.equal(french.ready,true,"French Proper failed reader readiness");
assert.equal(french.slots.INTROIT.data.paragraphs[0].vernacular,"Introït");
const frenchSuppressed=properToReaderSlots({...frenchProper,communion:{}},{
  language:"fr",
  notApplicableSlots:["COMMUNION"],
});
assert.equal(frenchSuppressed.ready,true,"French Proper lost certified NOT_APPLICABLE support");
assert.equal(frenchSuppressed.slots.COMMUNION.status,"NOT_APPLICABLE");

// A translated first prayer must never hide an untranslated additional
// commemoration in the actual rendered Mass Proper.
const commemoration={...proper,collects:[t("Oratio","Collect"),{lat:"Commemoratio",en:"",fr:"Commémoraison"}]};
const missingCommemoration=properToReaderSlots(commemoration,{language:"en"});
assert.equal(missingCommemoration.ready,false,"Reader silently dropped the second collect");
assert.equal(missingCommemoration.slots.COLLECT_SET.status,"MISSING");
assert.ok(missingCommemoration.missing.includes("COLLECT_SET"));
assert.throws(()=>assertReaderProperReady(missingCommemoration),/COLLECT_SET/);
const completeFrenchCommemoration=properToReaderSlots({...frenchProper,collects:[
 {lat:"Oratio",en:"",fr:"Collecte"},{lat:"Commemoratio",en:"",fr:"Commémoraison"}
]},{language:"fr"});
assert.equal(completeFrenchCommemoration.ready,true);
assert.equal(completeFrenchCommemoration.slots.COLLECT_SET.data.paragraphs.length,2);
for(const [property,slot] of [["secrets","SECRET_SET"],["postcommunions","POSTCOMMUNION_SET"]]){
 const mixed=properToReaderSlots({...proper,[property]:[t("Oratio","Prayer"),{lat:"Commemoratio",en:"",fr:""}]});
 assert.equal(mixed.ready,false,slot+" silently filtered a missing commemoration");
 assert.ok(mixed.missing.includes(slot));
}
const missing=properToReaderSlots({...proper,gospel:{}});
assert.equal(missing.ready,false);
assert.ok(missing.missing.includes("GOSPEL"));
assert.throws(()=>assertReaderProperReady(missing),/GOSPEL/);

console.log("Proper → reader slots: PASS — EN/FR vernacular projection, certified suppressions, no duplicate Gradual/Alleluia.");
