import assert from "node:assert/strict";
import "./mass-scripture-feast-supplement.mjs";
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
assert.equal(raw.celebrations.length,8);
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
 assert.match(witness.witnessUrl,/^https:\/\/missale\.online\/proprium\/en\/tempore\//);
 for(const [slot,[card,field]] of Object.entries(pairs)){
  const {reference,latinIncipit}=witness.readings[slot];
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
  assert.equal(massScriptureContextForCard(card,prep({...proper,sourcePath:"Tempora/Pent09-0"})).state,"UNRESOLVED_REFERENCE");
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
assert.equal(count,16);
const special={sourcePath:"Tempora/Pent19-0",
 gospel:{lat:"Loquebatur Jesus principibus sacerdotum"},
 epistle:{lat:"Renovamini spiritu mentis"}};
assert.equal(massScriptureContextForCard({blocks:[{properSlot:"GOSPEL"},{properSlot:"EPISTLE_OR_LESSON"}]},prep(special)).state,
 "UNRESOLVED_REFERENCE","Never arbitrarily pick one of two Scripture readings on a mixed card");
console.log("PASS 8 original-source Mass Proper celebrations / 16 Scripture reading references, all checked against Latin incipits and source identity; explicit conflicts veto the index");
