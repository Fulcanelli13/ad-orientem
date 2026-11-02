import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRAY_CANONICAL_DATA_V435930 as corpus } from "../src/pray/canonical-data.js";
const doc=JSON.parse(readFileSync(new URL("../data/pray/compendium-witness-collation-b01.v1.json",import.meta.url),"utf8"));
const audit=JSON.parse(readFileSync(new URL("../data/pray/prayer-source-presentation-audit.v1.json",import.meta.url),"utf8"));
assert.equal(doc.schema,"AO_PRAYER_COMPENDIUM_WITNESS_COLLATION_B01_V1");
assert.equal(doc.items.length,16);
assert.equal(new Set(doc.items.map(x=>x.id)).size,16);
const sourceFamily=new Set(audit.identities.filter(x=>
 x.actual_runtime_source_selection?.url===doc.sourceWitnesses.en.url).map(x=>x.id));
assert.equal(sourceFamily.size,16,"Vatican Compendium family must stay source-scoped");
assert.deepEqual(new Set(doc.items.map(x=>x.id)),sourceFamily);
const reviewed=doc.items.filter(x=>x.status!=="NOT_REVIEWED_IN_BATCH_01");
assert.equal(reviewed.length,4);
assert.equal(doc.items.filter(x=>x.status==="NOT_REVIEWED_IN_BATCH_01").length,12);
assert.equal(reviewed.filter(x=>x.status==="FORM_ALIGNED_NOT_VERBATIM_CERTIFIED").length,3);
assert.equal(reviewed.filter(x=>x.status==="TRADITIONAL_VARIANT_NOT_EXACT_WITNESS").length,1);
assert.deepEqual(new Set(reviewed.map(x=>x.id)),new Set([
 "foundations_sign_of_cross","foundations_our_father","foundations_hail_mary","foundations_glory_be"
]));
for(const x of doc.items){
 const prayer=corpus.prayers[x.id];
 assert.ok(prayer,"Collation record must resolve existing canonical Prayer text: "+x.id);
 assert.ok(prayer.en&&prayer.fr&&prayer.la,"Trilingual forms cannot be assumed when absent: "+x.id);
 assert.equal(x.sourceGroup,"VATICAN_2005_COMPENDIUM");
 assert.ok(!/FULLY_CERTIFIED|VERBATIM_CERTIFIED$/.test(x.status)||x.status==="FORM_ALIGNED_NOT_VERBATIM_CERTIFIED","No uncrosschecked publication");
 if(x.languages){
  for(const lang of ["en","fr","la"])assert.ok(x.languages[lang]?.length>20);
  assert.ok(x.witnessSections.length>=2&&x.next.length>20);
 }
}
assert.match(corpus.prayers.foundations_our_father.fr,/qui êtes aux cieux/);
assert.match(corpus.prayers.foundations_our_father.fr,/ne nous laissez pas succomber/);
assert.match(corpus.prayers.foundations_our_father.la,/quotidianum/);
assert.ok(doc.policy.noSilentCanonicalRewrite&&doc.policy.traditionalFrenchMustNotBeReplacedByContemporaryCompendium);
assert.equal(doc.counts.fullyCertified,0);
assert.equal(doc.policy.authoritativeTextCertificationAtThisStage,0);
assert.equal(doc.counts.sourceFamilySize,doc.items.length);
assert.equal(doc.counts.independentlyReviewedForms,reviewed.length);
console.log("PASS Compendium batch 01: 16 source-group records, 4 independent comparative reviews, traditional French protected, 0 false full certifications.");
