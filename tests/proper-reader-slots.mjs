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

const missing=properToReaderSlots({...proper,gospel:{}});
assert.equal(missing.ready,false);
assert.ok(missing.missing.includes("GOSPEL"));
assert.throws(()=>assertReaderProperReady(missing),/GOSPEL/);

const tf=(lat,fr)=>({lat,en:"",fr});
const frenchProper={
  sourcePath:"Sancti/10-07",
  introit:tf("Gaudeámus","Réjouissons-nous"),
  collects:[tf("Deus, cujus Unigénitus","Ô Dieu, dont le Fils unique")],
  epistle:tf("Ab initio","Dès le commencement"),
  gradual:tf("Propter veritatem","À cause de la vérité"),
  sequence:{lat:"",en:"",fr:""},
  gospel:tf("In illo tempore","En ce temps-là"),
  offertory:tf("In me gratia","En moi est toute grâce"),
  secrets:[tf("Fac nos","Faites que nous")],
  preface:tf("Vere dignum","Il est vraiment juste"),
  communion:tf("Florete flores","Fleurissez, fleurs"),
  postcommunions:[tf("Sanctissimae Genetricis","Par les prières de la très sainte Mère")],
};
const frenchMapped=properToReaderSlots(frenchProper,{language:"fr"});
assert.equal(frenchMapped.ready,true);
assert.equal(frenchMapped.missing.length,0);
assert.equal(frenchMapped.slots.INTROIT.data.paragraphs[0].vernacular,"Réjouissons-nous");
assert.equal(frenchMapped.slots.GOSPEL.data.paragraphs[0].vernacular,"En ce temps-là");

console.log("Proper → reader slots: PASS — exact v3.4.6 Proper shape, English/French vernacular, no duplicate Gradual/Alleluia.");
