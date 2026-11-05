import assert from "node:assert/strict";
import {test} from "node:test";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2} from "../src/pray/essential-holy-card-parts.js";
import {
 ESSENTIAL_PRAYER_WITNESS_POLICY_V1,
 ESSENTIAL_PRAYER_WITNESS_POLICY_VERSION,
 essentialPrayerWitnessPolicy,
 essentialPrayerEditorialReading
} from "../src/pray/essential-prayer-witness-policy.v1.js";

const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
test("Nineteen source-witness policies correspond one to one with the curated collection",()=>{
 assert.equal(ESSENTIAL_PRAYER_WITNESS_POLICY_VERSION,"ao-essential-witness-policy-20261105.v1");
 assert.deepEqual(Object.keys(ESSENTIAL_PRAYER_WITNESS_POLICY_V1).sort(),
  [...ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2].sort());
 assert.equal(ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2.length,19);
 for(const id of ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2){
  const p=prayers[id],policy=essentialPrayerWitnessPolicy(id);
  assert.ok(policy&&policy.alignment&&policy.review,id+" witness policy missing");
  for(const language of ["la","en","fr"])assert.ok(p[language]?.trim(),id+" lacks source "+language);
 }
 assert.equal(essentialPrayerWitnessPolicy("benediction_versicles"),null,
  "Non-Essential sources may not be silently relabelled");
});

test("Traditional French Pater is retained and not described as the modern Compendium",()=>{
 const p=prayers.foundations_our_father;
 assert.match(p.fr,/Notre Père, qui êtes aux cieux/);
 assert.match(p.fr,/ne nous laissez pas succomber à la tentation/);
 assert.match(p.la,/Panem nostrum quotidianum/);
 const policy=essentialPrayerWitnessPolicy(p.id);
 assert.equal(policy.faces.fr.status,"historical_variant");
 assert.match(policy.faces.fr.witness,/1906/);
 assert.match(policy.faces.fr.url,/wikisource/);
 assert.match(policy.faces.la.note||policy.faces.la.witness,/quotidianum/);
 assert.equal(essentialPrayerEditorialReading(p.id,"fr",p),null);
});

test("French Act of Hope printed witness and editorial reading are kept separate",()=>{
 const p=prayers.foundations_act_of_hope;
 assert.match(p.fr,/Dans cette foi, puis-je vivre et mourir\./);
 assert.match(p.la,/In hac spe vívere et mori státuo\./);
 assert.match(p.en,/In this hope I intend to live and die\./);
 const alt=essentialPrayerEditorialReading(p.id,"fr",p);
 assert.ok(alt,"Source-backed editorial French Hope correction not prepared");
 assert.equal(alt.kind,"editorial_correction");
 assert.match(alt.text,/Dans cette espérance, puis-je vivre et mourir\./);
 assert.doesNotMatch(alt.text,/Dans cette foi/);
 assert.equal(alt.sourceText,p.fr,"Printed source must remain available unchanged");
 assert.equal(alt.text.replace("Dans cette espérance","Dans cette foi"),p.fr,
  "Editorial variant must change one transparent substantive token only");
 assert.equal(essentialPrayerEditorialReading(p.id,"la",p),null);
 assert.equal(essentialPrayerEditorialReading("foundations_act_of_faith","fr",prayers.foundations_act_of_faith),null);
 assert.equal(essentialPrayerEditorialReading(p.id,"fr",{fr:"unrelated historical formula"}),null);
});

test("Historical formulas are not falsely aligned or completed",()=>{
 for(const id of ["foundations_act_of_faith","sacrament_act_of_contrition",
  "foundations_act_of_love","foundations_guardian_angel","foundations_morning_offering"]){
  assert.notEqual(essentialPrayerWitnessPolicy(id).alignment,"literal_translation",
   "Different historical formulations must not be represented as line-by-line translations");
 }
 assert.match(prayers.foundations_act_of_love.fr,/pour l’amour de vous\.$/);
 assert.doesNotMatch(prayers.foundations_act_of_love.fr,/Amen/);
 assert.match(prayers.foundations_guardian_angel.en,/my guardian dear/);
 assert.match(prayers.foundations_guardian_angel.la,/Ángele Dei/);
 for(const id of ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2){
  const {la}=prayers[id];
  assert.doesNotMatch(la,/\b(?:Sicvt|sicvt|tvvm|svnt)\b/);
 }
});
