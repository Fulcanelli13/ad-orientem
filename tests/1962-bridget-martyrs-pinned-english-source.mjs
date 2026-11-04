import assert from "node:assert/strict";
import {recoverReaderProperOmissions}
 from "../src/mass/reader-proper-runtime-recovery.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";

// The three originals were source-reviewed across the pinned Missale Meum
// Latin Sancti/10-08c and Divinum Officium Latin/English Sancti/10-07cc.
// Short identifiable prayer incipits suffice for mock section plumbing;
// full original Latin parity is independently enforced in the browser path.
const lat=Object.freeze({
 Oratio:"Sanctórum Martyrum tuórum nos, Dómine, Sérgii, Bacchi, Marcélli et Apuléji beáta mérita prosequántur: et tuo semper fáciant amóre fervéntes.",
 Secreta:"Majestátem tuam nobis, Dómine, quǽsumus, hæc hóstia reddat immolánda placátam, tuórum digna postulatióne Sanctórum.",
 Postcommunio:"Sacraméntis, Dómine, muniámur accéptis: et sanctórum Mártyrum tuórum Sérgii, Bacchi, Marcélli et Apuléji intercessióne."
});
const en=Object.freeze({
 Oratio:"May the blessed merits of Your holy Martyrs, Sergius, Bacchus, Marcellus and Apuleius, continually benefit us, O Lord.",
 Secreta:"By the worthy prayer of Your Saints, we beseech You, O Lord, may this victim cause Your Majesty to be appeased in us.",
 Postcommunio:"May we be strengthened, O Lord, by the sacrament we have received, and protected through the intercession of Your holy Martyrs."
});
const fr=Object.freeze({
 Oratio:"Faites, Seigneur, que les mérites de vos saints Martyrs Serge, Bacchus, Marcel et Apulée, nous soient acquis.",
 Secreta:"Que cette hostie qui vous sera sacrifiée apaise votre majesté, nous vous en prions, Seigneur.",
 Postcommunio:"Que les sacrements que nous avons reçus, Seigneur, nous fortifient."
});
const base={lat:"Principal authentic Latin body",en:"Principal authenticated English",fr:"Principal original French"};
const sections=[["collects","Oratio"],["secrets","Secreta"],["postcommunions","Postcommunio"]];
function proper(extra={}){
 return {sourcePath:"Sancti/10-08",
  calendarCommemorations:[{path:"Sancti/10-08c",prayerSourcePath:"Sancti/10-08c"}],
  epistle:base,
  ...Object.fromEntries(sections.map(([field,id])=>
   [field,[base,{lat:lat[id],en:"",fr:""}]])),...extra};
}
function resolver({alterLatin=false}={}){
 return {resolveSource:async(path,language)=>{
  const original=path==="Sancti/10-08c",alias=path==="Sancti/10-07cc";
  if(!original&&!alias)return {map:new Map()};
  const sourceLanguage=language==="la"?lat:language==="en"?en:fr;
  const m=new Map();
  for(const [field,id] of sections){
   const body=original
    ? (language==="la"?lat[id]:"")
    : (language==="la"?lat[id]+(alterLatin?" Récensio ad alia verba.":""):
       sourceLanguage[id]);
   m.set(id,body?[body,"$Per Dominum"]:[]);
  }
  return {map:m};
 }};
}
const apply=(p,r=resolver())=>recoverReaderProperOmissions(p,{
 hostResolver:r,principalCelebrationId:"sancti:10-08:3:w",
 calendarDate:"2026-10-08"
});
const original=proper(),restored=await apply(original);
assert.equal(restored.sourcePath,original.sourcePath);
assert.equal(original.collects[1].en,"","original donor mutated");
assert.equal(restored.sourceEditorialCorrections?.filter(x=>
 x.id==="1962_10_08C_MARTYRS_PINNED_ENGLISH_ORATIONS").length,3);
for(const [field,id] of sections){
 assert.strictEqual(restored[field][0],original[field][0],
  "principal St Bridget prayer changed");
 assert.ok(restored[field][1].en.startsWith(en[id].slice(0,25)));
 assert.ok(restored[field][1].fr.startsWith(fr[id].slice(0,25)));
 assert.equal(restored[field][1].lat,original[field][1].lat);
}
for(const language of ["en","fr"]){
 const slots=properToReaderSlots(restored,{language});
 for(const slot of ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"])
  assert.equal(slots.slots[slot].status,"READY",language+":"+slot);
}
const mismatch=await apply(proper(),resolver({alterLatin:true}));
for(const [field] of sections){
 assert.equal(mismatch[field][1].en,"",
  "Latin near-match must never approve an English oration");
}
assert.equal((mismatch.sourceEditorialCorrections??[]).filter(x=>
 x.id==="1962_10_08C_MARTYRS_PINNED_ENGLISH_ORATIONS").length,0);
const other=await apply(proper({calendarCommemorations:[{
 path:"Sancti/10-08x",prayerSourcePath:"Sancti/10-08x"}]}));
for(const [field] of sections)assert.equal(other[field][1].en,"",
 "Another saint's Oratio may not use the fixed 10-08c English alias");
const named=await apply(proper({collects:[base,{lat:lat.Oratio,en:"Already authenticated English",fr:""}]}));
assert.equal(named.collects[1].en,"Already authenticated English",
 "Original nonempty source translation replaced");
console.log("PASS exact 10-08c Sergius/Bacchus/Marcellus/Apuleius English prayers, full Latin parity, principal unchanged, all negative aliases held");
