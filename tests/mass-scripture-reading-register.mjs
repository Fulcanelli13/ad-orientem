import assert from "node:assert/strict";
import "./mass-scripture-feast-supplement.mjs";
import "./scripture-segmented-context.mjs";
import "./mass-scripture-secondary-witness.mjs";
import {readFileSync} from "node:fs";
import {VERIFIED_MASS_SCRIPTURE_READINGS,VERIFIED_MASS_SCRIPTURE_VERSION}
 from "../src/mass/scripture-reading-witness-index.js";
import {registeredMassReading,massScriptureContextForCard}
 from "../src/mass/scripture-reading-context.js";
import {parseScriptureContext} from "../src/scripture/context.js";
const raw=JSON.parse(readFileSync(new URL("../data/mass/scripture-reading-witness-register.v1.json",import.meta.url),"utf8"));
assert.equal(VERIFIED_MASS_SCRIPTURE_VERSION,raw.version);
assert.deepEqual(VERIFIED_MASS_SCRIPTURE_READINGS,raw.celebrations,
 "Compiled reading index diverged from the auditable source register");
assert.equal(raw.celebrations.length,50);
assert.equal(raw.policy.identity,"EXACT_RESOLVED_PROPER_SOURCE_PATH_AND_MATCHING_LATIN_READINGS");
const paths=new Set();
const gospelCard={blocks:[{properSlot:"GOSPEL",blockId:"AO.SM.B018"}]};
const epistleCard={blocks:[{properSlot:"EPISTLE_OR_LESSON",blockId:"AO.SM.B012"}]};
const pairs={GOSPEL:[gospelCard,"gospel"],EPISTLE_OR_LESSON:[epistleCard,"epistle"]};
const prep=proper=>({session:{resolvedMass:{proper:{status:"READY",sourcePath:proper.sourcePath,data:proper}}}});
let count=0;
for(const witness of raw.celebrations){
 assert.ok(!paths.has(witness.sourcePath),"Duplicate source path "+witness.sourcePath);
 paths.add(witness.sourcePath);
 const direct=/^https:\/\/github\.com\/DivinumOfficium\/divinum-officium\/blob\/master\/web\/www\/missa\/Latin\/Tempora\/[A-Za-z0-9-]+-0\.txt$/;
 const old=/^https:\/\/missale\.online\/proprium\/en\/tempore\//;
 assert.ok(old.test(witness.witnessUrl)||direct.test(witness.witnessUrl),
   "Source must be exact Roman Missal Latin file or legacy independently witnessed Missale: "+witness.sourcePath);
 if(direct.test(witness.witnessUrl))
   assert.equal(witness.witnessUrl.endsWith("/"+witness.sourcePath.split("/").at(-1)+".txt"),true,
     "Source link points to a different Sunday Proper");
 for(const [slot,[card,field]] of Object.entries(pairs)){
  const spec=witness.readings[slot];
  if(!spec){
    const held=witness.sourceHolds?.find(x=>x.slot===slot);
    assert.ok(held,"Every missing Sunday slot must carry an explicit source hold");
    const empty={sourcePath:witness.sourcePath,[field]:{lat:"Unverified other Latin Proper"}};
    assert.equal(registeredMassReading(empty,slot),null);
    continue;
  }
  const {reference,latinIncipit}=spec;
  const biblical=parseScriptureContext(reference);
  assert.ok(biblical?.passage,reference);
  assert.ok(latinIncipit.length>=12,witness.sourcePath+" "+slot);
  const proper={sourcePath:witness.sourcePath,[field]:{lat:"Lectio. "+latinIncipit+".",en:"Study sample, not Bible text"}};
  const resolved=registeredMassReading(proper,slot);
  assert.equal(resolved?.reference,reference,witness.sourcePath+" "+slot);
  assert.equal(resolved?.witnessUrl,witness.witnessUrl);
  assert.equal(resolved?.provenance,"MATCHED_1962_PROPER_PATH_AND_LATIN_INCIPIT");
  assert.equal(massScriptureContextForCard(card,prep(proper)).reference,reference);
  // Unrecognized and switched sourcePath must not inherit a Sunday citation.
  assert.equal(registeredMassReading({...proper,sourcePath:"Sancti/10-07"},slot),null);
  assert.equal(massScriptureContextForCard(card,prep({...proper,sourcePath:"Tempora/UNLISTED-0"})).state,"UNRESOLVED_REFERENCE");
  assert.equal(registeredMassReading({...proper,[field]:{lat:"Completely unrelated Latin passage."}},slot),null);
  assert.equal(registeredMassReading({...proper,[field]:{en:"English only, no verified Latin identity"}},slot),null);
  // An actual contradictory or unparseable first-party source reference
  // vetoes the external index rather than being silently overwritten.
  const conflict={...proper,[field]:{...proper[field],reference:"John 1:1"}};
  if(reference!=="John 1:1")
    assert.equal(massScriptureContextForCard(card,prep(conflict)).state,"UNRESOLVED_REFERENCE");
  const invalid={...proper,[field]:{...proper[field],reference:"Unreviewed manuscript 31"}};
  assert.equal(massScriptureContextForCard(card,prep(invalid)).state,"UNRESOLVED_REFERENCE");
  const confirmed={...proper,[field]:{...proper[field],reference}};
  assert.equal(massScriptureContextForCard(card,prep(confirmed)).provenance,"EXPLICIT_RESOLVED_PROPER_REFERENCE");
  count++;
 }
}
assert.equal(count,95);
const special={sourcePath:"Tempora/Pent19-0",
 gospel:{lat:"Loquebatur Jesus principibus sacerdotum"},
 epistle:{lat:"Renovamini spiritu mentis"}};
assert.equal(massScriptureContextForCard({blocks:[{properSlot:"GOSPEL"},{properSlot:"EPISTLE_OR_LESSON"}]},prep(special)).state,
 "UNRESOLVED_REFERENCE","Never arbitrarily pick one of two Scripture readings on a mixed card");
// All five formerly deferred paths are source-owned, not calendar-created fallbacks.
const inheritedSourcePaths={
 "Tempora/Pent03-0":"Tempora/Pent03-0r",
 "Tempora/PentEpi3-0":"Tempora/Epi3-0",
 "Tempora/PentEpi4-0":"Tempora/Epi4-0",
 "Tempora/PentEpi5-0":"Tempora/Epi5-0",
 "Tempora/PentEpi6-0":"Tempora/Epi6-0"
};
for(const [sourcePath,sourceOwner] of Object.entries(inheritedSourcePaths)){
 const alias=raw.celebrations.find(row=>row.sourcePath===sourcePath);
 assert.ok(alias,sourcePath+" requires source-bound entry");
 assert.equal(alias.witnessUrl.endsWith("/"+sourcePath.split("/")[1]+".txt"),true);
 for(const [slot,spec] of Object.entries(alias.readings)){
  assert.equal(spec.immediateSourceOwner??spec.sourceOwner,sourceOwner,sourcePath+" "+slot+" direct alias");
  const ultimateOwner=sourcePath==="Tempora/PentEpi5-0"&&slot==="EPISTLE_OR_LESSON"?"Tempora/Epi1-0":sourceOwner;
  assert.equal(spec.sourceOwner,ultimateOwner,sourcePath+" "+slot+" true Latin section owner");
  const field=slot==="GOSPEL"?"gospel":"epistle";
  const proper={sourcePath,[field]:{lat:"Lectio. "+spec.latinIncipit+"."}};
  assert.equal(registeredMassReading(proper,slot)?.reference,spec.reference);
  assert.equal(registeredMassReading({...proper,sourcePath:"Tempora/UNLISTED-0"},slot),null);
  assert.equal(registeredMassReading({...proper,[field]:{lat:"Unrelated text"}},slot),null);
 }
}
assert.equal(raw.celebrations.length,50);
console.log("PASS 50 source-checked temporal Sunday Mass Proper identities / 95 single-range Scripture references, exact Latin/source identity and inherited/split-reading holds; explicit conflicts veto the index");
