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
const twoCollects=completeFrenchCommemoration.slots.COLLECT_SET.data.paragraphs;
assert.equal(twoCollects.length,4,"separate Collect groups must include intermediate Amen and second Oremus");
assert.deepEqual(twoCollects.map(x=>x.id),[
  "COLLECT_SET.1","COLLECT_SET.1.AMEN","COLLECT_SET.2.OREMUS","COLLECT_SET.2",
]);
assert.equal(twoCollects[1].kind,"RESPONSE");
assert.equal(twoCollects[1].speakerRole,"RESPONDERS");
assert.equal(twoCollects[2].speakerRole,"PRIEST");
assert.equal(twoCollects[2].latin,"Orémus.");
assert.equal(twoCollects[2].vernacular,"Prions.");
for(const [property,slot] of [["secrets","SECRET_SET"],["postcommunions","POSTCOMMUNION_SET"]]){
 const mixed=properToReaderSlots({...proper,[property]:[t("Oratio","Prayer"),{lat:"Commemoratio",en:"",fr:""}]});
 assert.equal(mixed.ready,false,slot+" silently filtered a missing commemoration");
 assert.ok(mixed.missing.includes(slot));
}
const missing=properToReaderSlots({...proper,gospel:{}});
assert.equal(missing.ready,false);
assert.ok(missing.missing.includes("GOSPEL"));
assert.throws(()=>assertReaderProperReady(missing),/GOSPEL/);

// Two source-owned III/IV-class commemorations are ONE additional
// liturgical group with two focus paragraphs, never a guessed third Collect.
const joinTwo=(label)=>({
 lat:"Lat "+label+" A\n\nLat "+label+" B\nPer Dominum. Amen.",
 fr:"FR "+label+" A\n\nFR "+label+" B\nPar Notre-Seigneur. Ainsi soit-il.",
 oneConclusion:{status:"CERTIFIED",kind:"MULTIPLE_COMMEMORATIONS",
   segments:{
     lat:{principal:"Lat "+label+" A",additional:"Lat "+label+" B",
       conclusion:"Per Dominum. Amen."},
     fr:{principal:"FR "+label+" A",additional:"FR "+label+" B",
       conclusion:"Par Notre-Seigneur. Ainsi soit-il."},
   }
 }
});
const sourceDecision={status:"CERTIFIED",source:"1962_PROPER_RESOLVER",
  form:"LOW",calendarCount:2,appliedCount:2,prayerGroupCount:2};
const multiJoined=properToReaderSlots({...frenchProper,
 collects:[{lat:"Prima",fr:"Collecte principale"},joinTwo("COLLECT")],
 secrets:[{lat:"Prima",fr:"Secrète principale"},joinTwo("SECRET")],
 postcommunions:[{lat:"Prima",fr:"Postcommunion principale"},joinTwo("POST")],
 calendarCommemorations:[{path:"Sancti/01-19"},{path:"Sancti/01-19o"}],
 appliedCommemorations:[{path:"Sancti/01-19"},{path:"Sancti/01-19o"}],
 commemorationFormDecision:sourceDecision,
},{language:"fr"});
assert.equal(multiJoined.ready,true,
  "Two source prayers under ONE conclusion must not be counted as three groups");
for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"]){
 const p=multiJoined.slots[slot].data.paragraphs;
 const publicPrayer=slot!=="SECRET_SET";
 assert.deepEqual(p.map(x=>x.id),publicPrayer?[
   slot+".1",slot+".1.AMEN",slot+".2.OREMUS",
   slot+".2.FIRST_COMMEMORATION",slot+".2.SECOND_COMMEMORATION",
 ]:[
   slot+".1",slot+".2.FIRST_COMMEMORATION",slot+".2.SECOND_COMMEMORATION",
 ],slot+" correct prayer/response/versicle sequence");
 const pair=p.filter(x=>x.prayerRole==="FIRST_COMMEMORATION"||
   x.prayerRole==="SECOND_COMMEMORATION");
 assert.equal(pair.length,2,slot+" two separate focus paragraphs");
 assert.equal(pair[0].liturgicalGroup,slot+".2");
 assert.equal(pair[1].liturgicalGroup,slot+".2",
   "the third source oration must not fabricate a third concluded group");
 assert.match(pair[1].vernacular,/Ainsi soit-il\.$/);
 assert.equal(p.filter(x=>x.id.endsWith(".OREMUS")).length,publicPrayer?1:0,
   "never add a public Oremus to Secrets or repeat it within joined commemorations");
 assert.equal(p.filter(x=>x.id.endsWith(".AMEN")).length,publicPrayer?1:0,
   "never invent a response to silent Secrets");
}
const corrupted=properToReaderSlots({...frenchProper,
 collects:[{lat:"Prima",fr:"Collecte principale"},
   {...joinTwo("COLLECT"),fr:"Unrelated alteration"}],
 appliedCommemorations:sourceDecision.calendarCount?[
   {path:"Sancti/01-19"},{path:"Sancti/01-19o"}]:[],
 commemorationFormDecision:sourceDecision,
},{language:"fr"});
assert.equal(corrupted.slots.COLLECT_SET.status,"MISSING",
  "A broken shared conclusion must NEVER be presented as ready");

console.log("Proper → reader slots: PASS — EN/FR vernacular projection, certified suppressions, no duplicate Gradual/Alleluia.");
