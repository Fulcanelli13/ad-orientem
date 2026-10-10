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


// The October 8 shape is one principal prayer + one source-owned ordinary
// commemoration in each of the three oration groups. Recover the missing
// French commemoration, not an English fallback or another copy of St Bridget.
const ownedPaths=["Sancti/10-08","Sancti/10-07cc"];
const sections=[["collects","Oratio"],["secrets","Secreta"],["postcommunions","Postcommunio"]];
const sourceOrations=new Map();
for(const [index,owner] of ownedPaths.entries()){
  for(const language of ["la","en","fr"]){
    const map=new Map();
    for(const [,section] of sections){
      const body=language==="la"
        ? (index===0?"Dómine Deus noster, qui beátæ Birgíttæ intercessióne":"Sanctórum Mártyrum tuórum nos, Dómine, Sérgii")
        : language==="fr"
          ? (index===0?"Seigneur notre Dieu, par l’intercession de Brigitte":"Faites, Seigneur, que les mérites des saints Martyrs")
          : (index===0?"O Lord God, through Saint Bridget":"May the blessed merits of Your holy Martyrs");
      map.set(section,[body+" "+section+".","$Per Dominum"]);
    }
    sourceOrations.set(owner+"|"+language,map);
  }
}
const tracked=[];
const sourceOwnerResolver={async resolveSource(path,language){
  tracked.push([path,language]);
  const map=sourceOrations.get(path+"|"+language);
  if(!map)return {map:new Map(),order:[]};
  return {map,order:[...map.keys()]};
}};
const basePrayers=Object.fromEntries(sections.map(([field,section])=>[field,ownedPaths.map((p,index)=>({
  lat:sourceOrations.get(p+"|la").get(section)[0],
  en:sourceOrations.get(p+"|en").get(section)[0],
  fr:index===0?sourceOrations.get(p+"|fr").get(section)[0]:""
}))]));
const multi={
  ...authoritative,
  data:{
    ...authoritative.data,
    sourcePath:ownedPaths[0],
    calendarCommemorations:[{path:ownedPaths[1],prayerSourcePath:ownedPaths[1],inseparable:false}],
    ...basePrayers,
  }
};
const restored=await recoverReaderProperOmissions(multi,{hostResolver:sourceOwnerResolver});
for(const [field] of sections){
  assert.equal(restored.data[field].length,2,"lost a commemorative "+field);
  assert.equal(restored.data[field][0].fr,multi.data[field][0].fr,"overwrote the host principal prayer");
  assert.match(restored.data[field][1].fr,/mérites des saints Martyrs/);
  assert.match(restored.data[field][1].fr,/Par Notre-Seigneur Jésus-Christ/);
  assert.deepEqual(restored.data[field][1].lat,multi.data[field][1].lat);
}
assert.equal(tracked.every(([path])=>path===ownedPaths[1]),true,
  "recovered the commemoration from the wrong source owner");
const {properToReaderSlots}=await import("../src/mass/proper-reader-slots.js");
assert.equal(properToReaderSlots(restored.data,{language:"fr"}).ready,true,
  "two-oratio French source recovery did not restore the source-first R17 reader");
const wrongLatin={...multi,data:{...multi.data,
  collects:[multi.data.collects[0],{...multi.data.collects[1],lat:"Unrelated martyr oration",fr:""}]}};
const refused=await recoverReaderProperOmissions(wrongLatin,{hostResolver:sourceOwnerResolver});
assert.equal(refused.data.collects[1].fr,"","mismatched source path silently acquired another feast's prayer");
assert.equal(properToReaderSlots(refused.data,{language:"fr"}).ready,false);

console.log("PASS reader Proper runtime recovery: exact missing base sections recovered without overriding host text.");
