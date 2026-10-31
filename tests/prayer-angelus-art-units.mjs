import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as DATA} from "../src/pray/canonical-data.js";
import {resolveArtworkRuntimeIdentity} from "../src/pray/artwork-runtime-identity.v1.js";

const resolve=(form,type,latinText,previousSlot=null,unitIndex=0)=>
 resolveArtworkRuntimeIdentity({owner:"angelusUnit",form,type,latinText,previousSlot,unitIndex});
const angelus=DATA.angelus.la;
const regina=DATA.regina.la;
const invocations=angelus.split("\n").filter(line=>/^V[.]\s/.test(line));
const responses=regina.split("\n").filter(line=>/^℣[.]\s/.test(line));
assert.equal(invocations.length,4,"Canonical Angelus invocation count drifted");
assert.equal(responses.length,3,"Canonical Regina invocations changed");
const slots=["STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.angelus-07","STG-pray.angelus-08"];
for(const [i,verse] of invocations.entries()){
 const art=resolve("angelus","vr",verse,null,i);
 assert.equal(art.slot,slots[i],"Wrong event image for Latin invocation: "+verse);
 assert.equal(art.publicationReady,false);
 assert.equal(art.assetUrl,null);
}
for(let i=0;i<3;i++){
 const art=resolve("angelus","hail","Ave Maria, gratia plena",slots[i],i*2+1);
 assert.equal(art.slot,slots[i],"Hail Mary must retain its preceding invocation's scene");
 assert.equal(art.fit,"HAIL_MARY_INHERITS_PRECEDING_INVOCATION");
}
assert.equal(resolve("angelus","hail","Ave Maria").slot,"COV-pray.angelus",
 "An unpaired Hail Mary must not guess which narrative it illustrates");
assert.equal(resolve("angelus","collect","Oremus. Gratiam tuam").slot,"STG-pray.angelus-09");
assert.equal(resolve("angelus","prayer","unclassified").slot,"COV-pray.angelus");
for(const [i,verse] of responses.entries()){
 const expected=i===0?"STG-pray.angelus_regina-01":"STG-pray.angelus_regina-02";
 assert.equal(resolve("regina","vr",verse,null,i).slot,expected,
 "Regina: do not manufacture one unit per editorial illustration");
}
assert.equal(resolve("regina","collect","Oremus. Deus").slot,"STG-pray.angelus_regina-04");
assert.equal(resolve("regina","vr","Unrecognised text").slot,"COV-pray.angelus_regina");
assert.equal(resolve("regina","prayer","Unrecognised text").publicationReady,false);
const presentation=readFileSync("src/pray/presentation-runtime.js","utf8");
assert.ok(presentation.includes("stampArtworkRuntimeIdentity(unit,{owner:'angelusUnit'"),
 "Actual Angelus cards are missing semantic slot stamping");
assert.ok(presentation.includes("stampPrayerArtworkDomEvidence(unit)"),
 "Angelus card-specific DOM artwork audit missing");
assert.ok(!presentation.includes("STG-pray.angelus-0"),
 "Presentation UI must not assign Angelus artwork by hardcoded ordinal positions");
console.log(JSON.stringify({
 gate:"CANONICAL_ANGELUS_AND_REGINA_SEMANTIC_RUNTIME_ARTWORK_PARITY",
 angelusNarrativeVersicles:4,angelusHailMaryInheritance:3,
 reginaVersicles:3,productionArtworksReleased:0,
 publicationReady:false
},null,2));
