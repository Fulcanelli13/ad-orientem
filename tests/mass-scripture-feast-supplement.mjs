import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {parseScriptureContext} from "../src/scripture/context.js";
import {VERIFIED_MASS_FEAST_READINGS,VERIFIED_MASS_FEAST_VERSION}
  from "../src/mass/scripture-feast-reading-index.js";
import {registeredMassReading,massScriptureContextForCard}
  from "../src/mass/scripture-reading-context.js";

const data=JSON.parse(readFileSync(new URL("../data/mass/scripture-feast-reading-supplement.v1.json",import.meta.url),"utf8"));
assert.equal(VERIFIED_MASS_FEAST_VERSION,data.version);
assert.deepEqual(VERIFIED_MASS_FEAST_READINGS,data.celebrations,"Feast runtime mirror drifted from documented source of truth");
assert.equal(data.celebrations.length,20);
assert.equal(data.holds.length,7);
assert.ok(data.holds.some(x=>x.sourcePath==="Tempora/Quad6-3"&&x.reason.includes("MULTIPLE_DISTINCT_LESSONS")&&x.biblicalSections.includes("Isaiah 62:11")));
assert.ok(data.holds.some(x=>x.sourcePath==="Tempora/Quad6-2"&&x.slot==="GOSPEL"));
const witnessPaths=new Set();
const slots={GOSPEL:["gospel",{blocks:[{properSlot:"GOSPEL"}]}],
 EPISTLE_OR_LESSON:["epistle",{blocks:[{properSlot:"EPISTLE_OR_LESSON"}]}]};
let refs=0;
const prep=proper=>({session:{resolvedMass:{proper:{status:"READY",sourcePath:proper.sourcePath,data:proper}}}});
for(const row of data.celebrations){
 assert.ok(!witnessPaths.has(row.sourcePath),"Duplicate Major Feast Proper "+row.sourcePath);
 witnessPaths.add(row.sourcePath);
 assert.ok(/^https:\/\/(?:missale\.online\/proprium\/en\/|www\.missalemeum\.com\/(?:en\/widgets\/propers\/|en\/calendar\/))/.test(row.witnessUrl),"Invalid external 1962 witness: "+row.witnessUrl);
 for(const [slot,entry] of Object.entries(row.readings)){
   assert.ok(Object.hasOwn(slots,slot),"Unexpected source slot");
   const [field,card]=slots[slot];
   assert.ok(parseScriptureContext(entry.reference)?.passage,row.sourcePath+" "+slot+" invalid Bible passage");
   assert.ok(entry.latinIncipit.length>=16,"Weak Latin incipit: "+row.sourcePath+" "+slot);
   const proper={sourcePath:row.sourcePath,[field]:{lat:"Léctio: "+entry.latinIncipit+". Et alia.",en:"not licensed biblical text"}};
   const found=registeredMassReading(proper,slot);
   assert.equal(found?.reference,entry.reference,row.sourcePath+" "+slot);
   assert.equal(found?.witnessUrl,row.witnessUrl);
   assert.equal(found?.provenance,"MATCHED_1962_PROPER_PATH_AND_LATIN_INCIPIT");
   const live=massScriptureContextForCard(card,prep(proper));
   assert.equal(live?.reference,entry.reference);
   assert.equal(live?.state,"READY");
   assert.equal(massScriptureContextForCard(card,prep({...proper,sourcePath:"Sancti/01-01"})).state,"UNRESOLVED_REFERENCE",
      "Feast reading leaked onto another Proper");
   assert.equal(registeredMassReading({...proper,[field]:{lat:"Textus alter ab hoc die"}},slot),null,
      "Wrong Latin passage received a copied feast source");
   assert.equal(registeredMassReading({...proper,[field]:{en:"No latin source delivered"}},slot),null);
   const conflicting={...proper,[field]:{...proper[field],reference:"Jude 1:1"}};
   assert.equal(massScriptureContextForCard(card,prep(conflicting)).state,"UNRESOLVED_REFERENCE",
      "Canonical source metadata conflict must veto Missal index");
   const invalid={...proper,[field]:{...proper[field],reference:"Unreviewed witness §3"}};
   assert.equal(massScriptureContextForCard(card,prep(invalid)).state,"UNRESOLVED_REFERENCE",
      "Unrecognized explicit reference must fail closed");
   refs++;
 }
 const missing=Object.keys(slots).filter(slot=>!row.readings[slot]);
 for(const slot of missing){
   const [field,card]=slots[slot];
   const proper={sourcePath:row.sourcePath,[field]:{lat:"Other authentic Latin but uncatalogued"}};
   assert.equal(registeredMassReading(proper,slot),null,
     "Held/discontinuous reading must not get an invented continuous citation");
   assert.equal(massScriptureContextForCard(card,prep(proper)).state,"UNRESOLVED_REFERENCE");
 }
}
assert.equal(refs,36);
assert.equal(witnessPaths.size,20);
const held=new Set(data.holds.map(x=>x.sourcePath+"|"+x.slot));
assert.ok(held.has("Tempora/Pent02-5|EPISTLE_OR_LESSON"));
assert.ok(held.has("Tempora/Quad6-0|GOSPEL"));
assert.ok(held.has("Tempora/Quad6-5|DISTINCT_GOOD_FRIDAY"));
assert.ok(held.has("Tempora/Quad6-6|DISTINCT_EASTER_VIGIL"));
for(const entry of data.holds){
 if(entry.slot.startsWith("DISTINCT_"))assert.ok(!entry.witnessUrl,
   "A distinct-rite hold cannot masquerade as another celebration's Proper");
}
const sacred=data.celebrations.find(x=>x.sourcePath==="Tempora/Pent02-5");
assert.equal(sacred.readings.EPISTLE_OR_LESSON,undefined);
assert.ok(data.holds.find(x=>x.sourcePath===sacred.sourcePath).biblicalSections.length===2);
const annunciation=data.celebrations.find(x=>x.sourcePath==="Sancti/03-25");
assert.equal(annunciation.readings.EPISTLE_OR_LESSON.reference,"Isaiah 7:10–15");
const trinity=data.celebrations.find(x=>x.sourcePath==="Tempora/Pent01-0");
assert.equal(trinity.readings.EPISTLE_OR_LESSON.reference,"Romans 11:33–36");
console.log("PASS Feast + Holy Week Scripture supplement: 20 source-verified Propers, 36 guarded contextual references, 7 explicit source holds");
