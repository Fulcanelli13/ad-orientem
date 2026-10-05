import assert from "node:assert/strict";
import { recoverReaderProperOmissions } from "../src/mass/reader-proper-runtime-recovery.js";

const rows={
  la:new Map([
    ["Lectio",["!Ephes 4:23-28","Léctio Epístolæ."]],
    ["Secreta",["Hæc múnera, quǽsumus, Dómine.","$Per Dominum"]],
    ["Postcommunio",["Tua nos, Dómine, medicinális operátio.","$Per Dominum"]],
  ]),
  en:new Map([
    ["Lectio",["!Eph 4:23-28","Lesson from the letter."]],
    ["Secreta",["Grant, we beseech You, O Lord.","$Per Dominum"]],
    ["Postcommunio",["May Your healing power, O Lord.","$Per Dominum"]],
  ]),
  fr:new Map([
    ["Lectio",["!Ephes 4:23-28","Lecture de l’Épître."]],
    ["Secreta",["Ces offrandes, Seigneur.","$Per Dominum"]],
    ["Postcommunio",["Que votre action guérissante, Seigneur.","$Per Dominum"]],
  ]),
};
const calls=[];
const hostResolver={
  async resolveSource(path,language){
    calls.push([path,language]);
    return {map:rows[language],order:[...rows[language].keys()]};
  },
};

const broken={
  status:"READY",
  sourcePath:"Tempora/Pent19-0",
  data:{
    sourcePath:"Tempora/Pent19-0",
    introit:{lat:"Introitus",en:"Introit",fr:"Introït"},
    collects:[{lat:"Oratio",en:"Collect",fr:"Collecte"}],
    epistle:{},
    gradual:{lat:"Graduale",en:"Gradual",fr:"Graduel"},
    gospel:{lat:"Evangelium",en:"Gospel",fr:"Évangile"},
    offertory:{lat:"Offertorium",en:"Offertory",fr:"Offertoire"},
    secrets:[],
    preface:{lat:"Praefatio",en:"Preface",fr:"Préface"},
    communion:{lat:"Communio",en:"Communion",fr:"Communion"},
    postcommunions:[],
  },
};
const repaired=await recoverReaderProperOmissions(broken,{hostResolver});
assert.equal(repaired.status,"READY");
assert.equal(repaired.data.epistle.lat.includes("Léctio Epístolæ"),true);
assert.equal(repaired.data.epistle.fr.includes("Lecture de l’Épître"),true);
assert.equal(repaired.data.secrets.length,1);
assert.match(repaired.data.secrets[0].lat,/Hæc múnera/);
assert.match(repaired.data.secrets[0].en,/Through our Lord Jesus Christ/);
assert.match(repaired.data.secrets[0].fr,/Par Notre-Seigneur Jésus-Christ/);
assert.equal(repaired.data.postcommunions.length,1);
assert.match(repaired.data.postcommunions[0].fr,/action guérissante/);
assert.deepEqual(calls.map(x=>x[1]),["la","en","fr","la","en","fr","la","en","fr"]);

const authoritative={...broken,data:{...broken.data,epistle:{lat:"KEEP L",en:"KEEP E",fr:"KEEP F"},secrets:[{lat:"KEEP S",en:"KEEP S",fr:"KEEP S"}],postcommunions:[{lat:"KEEP P",en:"KEEP P",fr:"KEEP P"}]}};
calls.length=0;
const untouched=await recoverReaderProperOmissions(authoritative,{hostResolver});
assert.equal(untouched,authoritative,"complete host Proper should remain authoritative by identity");
assert.deepEqual(calls,[],"complete host Proper triggered unnecessary source recovery");

console.log("PASS reader Proper runtime recovery: exact missing base sections recovered without overriding host text.");
