import assert from "node:assert/strict";
import {recover1962StClementPapalCommon as restore,
 CLEMENT_1962_SOURCE_SCHEMA} from "../src/mass/1962-st-clement-papal-common.js";
import {select1962CommemorationsForMassForm as select}
 from "../src/mass/1962-commemoration-form-source.js";
import {properToReaderSlots} from "../src/mass/proper-reader-slots.js";
import witness from "../data/mass/1962-st-clement-papal-common-nov23.v1.json" with {type:"json"};

const prayer=(name)=>Object.freeze({lat:"Oratio latina "+name,
 en:"English prayer "+name,fr:"Prière française "+name});
const fel=prayer("Felicitas"),principal=prayer("Clemens");
const legacySecret=Object.freeze({lat:
 "Múnera tibi, Dómine, obláta sanctífica: et, intercedénte beáto Cleménte Mártyre tuo atque Pontífice, per hæc nos a peccatórum nostrórum máculis emúnda.",
 en:"Old source English Secret",fr:""});
const legacyPost=Object.freeze({lat:
 "Córporis sacri et pretiósi Sánguinis repléti libámine, quǽsumus, Dómine, Deus noster: ut, quod pia devotióne gérimus.",
 en:"Old source English Postcommunion",fr:""});
const data=Object.freeze({sourcePath:"Sancti/11-23",
 collects:Object.freeze([principal,fel]),
 secrets:Object.freeze([legacySecret,fel]),
 postcommunions:Object.freeze([legacyPost,fel]),
 calendarCommemorations:Object.freeze([
  Object.freeze({path:"Sancti/11-23cc",prayerSourcePath:"Sancti/11-23cc",name:"St Felicity"})])});
const owner=Object.freeze({data,calendarDate:"2026-11-23",
 principalCelebrationId:"sancti:11-23:3:r"});
const corrected=restore(owner);
assert.ok(corrected,"source-pinned St Clement Common must recover");
assert.equal(corrected.sourcePath,"Sancti/11-23");
assert.strictEqual(corrected.collects,data.collects,"principal and commemorative Collects unchanged");
assert.strictEqual(corrected.secrets[1],fel,"Felicity Secret untouched");
assert.strictEqual(corrected.postcommunions[1],fel,"Felicity Postcommunion untouched");
assert.equal(corrected.sourceEditorialCorrections[0].schema,CLEMENT_1962_SOURCE_SCHEMA);
for(const field of ["secrets","postcommunions"]){
 for(const lang of ["lat","en","fr"]){
  assert.equal(corrected[field][0][lang],witness.recoveredPrayers[field][lang]);
  assert.ok(corrected[field][0][lang].includes("\n"),field+"/"+lang+" keeps conclusion");
 }
}
const calendarResolution={date:"2026-11-23",status:"ready",day:{
 main:{id:"sancti:11-23:3:r",path:"Sancti/11-23",rank:3},
 commemorations:[{id:"sancti:11-23cc:4:r",path:"Sancti/11-23cc",rank:4}]}
};
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const result=select({proper:corrected,calendarResolution,form});
 assert.equal(result.status,"CERTIFIED",form+" / "+result.reason);
 const expected=form==="LOW"?2:1;
 assert.equal(result.decision.appliedCount,expected-1);
 for(const [field,slot] of [["collects","COLLECT_SET"],["secrets","SECRET_SET"],["postcommunions","POSTCOMMUNION_SET"]]){
  assert.equal(result.proper[field].length,expected);
  for(const language of ["en","fr"]){
   const entry=properToReaderSlots(result.proper,{language}).slots[slot];
   assert.equal(entry.status,"READY",form+"/"+language+"/"+slot);
   assert.equal(entry.data.paragraphs.length,expected);
  }
 }
}
for(const bad of [
 {...owner,calendarDate:"2026-11-24"},
 {...owner,principalCelebrationId:"sancti:11-23:2:r"},
 {...owner,data:{...data,sourcePath:"Sancti/11-22"}},
 {...owner,data:{...data,calendarCommemorations:[]}},
 {...owner,data:{...data,calendarCommemorations:[{path:"Sancti/11-23cc",prayerSourcePath:"Sancti/11-22"}]}},
 {...owner,data:{...data,secrets:[{...legacySecret,lat:"Oblátis munéribus"},fel]}},
 {...owner,data:{...data,secrets:[{...legacySecret,fr:"French added without proof"},fel]}},
 {...owner,data:{...data,postcommunions:[legacyPost]}},
 {...owner,data:{...data,collects:[principal]}},
 {...owner,data:{...data,appliedCommemorations:[fel]}},
]){
 assert.equal(restore(bad),null,"foreign or altered source must fail closed");
}
assert.equal(data.secrets[0].fr,"","original source unchanged");
console.log("PASS: exact 1962 St Clement papal Common, all 3 languages, 4 forms, Felicity ownership, forged source holds.");
