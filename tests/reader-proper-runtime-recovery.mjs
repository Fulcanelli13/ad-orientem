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

// A III-class Mass with a genuine commemorated saint has principal orations
// already translated, but the historical composer may omit the French side of
// the appended commemoration. The exact source owns that missing French text.
const extra={
  la:new Map([
    ["Oratio",["Sanctórum Mártyrum tuórum nos, Dómine, Sérgii, Bacchi, Marcélli et Apuléji beáta mérita prosequántur.","$Per Dominum"]],
    ["Secreta",["Majestátem tuam nobis, Dómine, quǽsumus, hæc hóstia reddat immolánda placátam.","$Per Dominum"]],
    ["Postcommunio",["Sacraméntis, Dómine, muniámur accéptis: et sanctórum Mártyrum tuórum Sérgii, Bacchi, Marcélli et Apuléji intercessióne.","$Per Dominum"]],
  ]),
  en:new Map([
    ["Oratio",["May the blessed merits of Your holy Martyrs, Sergius, Bacchus, Marcellus and Apuleius.","$Per Dominum"]],
    ["Secreta",["By the worthy prayer of Your Saints, we beseech You, O Lord.","$Per Dominum"]],
    ["Postcommunio",["May we be strengthened, O Lord, by the sacrament we have received.","$Per Dominum"]],
  ]),
  fr:new Map([
    ["Oratio",["Faites, Seigneur, que les mérites de vos saints Martyrs Serge, Bacchus, Marcel et Apulée, nous soient acquis.","$Per Dominum"]],
    ["Secreta",["Que cette hostie qui vous sera sacrifiée apaise votre majesté, nous vous en prions.","$Per Dominum"]],
    ["Postcommunio",["Que les sacrements que nous avons reçus, Seigneur, nous fortifient.","$Per Dominum"]],
  ]),
};
const full=section=>({lat:extra.la.get(section)[0],en:extra.en.get(section)[0],fr:""});
const extended={...authoritative,data:{
  ...authoritative.data,
  sourcePath:"Sancti/10-08",
  calendarCommemorations:[{path:"Sancti/10-08c",prayerSourcePath:"Sancti/10-08c"}],
  collects:[{lat:"Principal Latin collect",en:"Principal English collect",fr:"Collecte principale"},full("Oratio")],
  secrets:[{lat:"Principal Latin secret",en:"Principal English secret",fr:"Secrète principale"},full("Secreta")],
  postcommunions:[{lat:"Principal Latin postcommunion",en:"Principal English postcommunion",fr:"Postcommunion principale"},full("Postcommunio")],
}};
const commCalls=[];
const commemorativeResolver={
  async resolveSource(path,language){
    commCalls.push([path,language]);
    if(path==="Sancti/10-08c")return {map:language==="fr"?new Map():extra[language]};
    if(path==="Sancti/10-07cc"&&language==="fr")return {map:extra.fr};
    throw Error("Unexpected source "+path+" / "+language);
  },
};
const fixed=await recoverReaderProperOmissions(extended,{hostResolver:commemorativeResolver});
for(const [field,section] of [["collects","Oratio"],["secrets","Secreta"],["postcommunions","Postcommunio"]]){
  assert.equal(fixed.data[field].length,2,field+" lost the commemoration");
  assert.equal(fixed.data[field][0],extended.data[field][0],field+" changed the principal prayer");
  assert.equal(fixed.data[field][1].lat,extended.data[field][1].lat,field+" changed appointed Latin");
  assert.equal(fixed.data[field][1].en,extended.data[field][1].en,field+" changed existing English");
  assert.match(fixed.data[field][1].fr,/Par Notre-Seigneur Jésus-Christ/,field+" failed exact source-based French recovery");
}
assert.equal(commCalls.length,12,"Each of three orations must use the pinned LA/EN and historical French alias");
assert.equal(commCalls.filter(([path,lang])=>path==="Sancti/10-07cc"&&lang==="fr").length,3);
const wrongLatin={...extended,data:{...extended.data,collects:[extended.data.collects[0],{lat:"Different martyr entirely and an unmatching Latin collect body.",en:"Existing English",fr:""}]}};
const held=await recoverReaderProperOmissions(wrongLatin,{hostResolver:commemorativeResolver});
assert.equal(held.data.collects[1].fr,"","Mismatched saint/oration was falsely repaired");
const unproven={...extended,data:{...extended.data,calendarCommemorations:[]}};
const unchanged=await recoverReaderProperOmissions(unproven,{hostResolver:commemorativeResolver});
assert.equal(unchanged,unproven,"No certified commemoration source must leave proper unchanged");

console.log("PASS reader Proper runtime recovery: exact missing base sections recovered without overriding host text.");
