import assert from "node:assert/strict";
import {test} from "node:test";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {
 ESSENTIAL_HOLY_CARD_IDS_V1,
 ESSENTIAL_HOLY_CARD_COLLECTION_GROUPS_V2,
 ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2,
 essentialHolyCardDisplayTitle
} from "../src/pray/essential-holy-card-parts.js";
import {claudeHolyCard,claudeHolyCardCase} from "../src/pray/claude-holy-card.js";

const texts=PRAY_CANONICAL_DATA_V435930.prayers;
const escape=s=>String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");

test("Essential Prayers shelf is exactly 16 core and three optional daily cards",()=>{
 assert.equal(ESSENTIAL_HOLY_CARD_COLLECTION_GROUPS_V2.core.length,16);
 assert.equal(ESSENTIAL_HOLY_CARD_COLLECTION_GROUPS_V2.daily.length,3);
 assert.equal(ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2.length,19);
 assert.equal(new Set(ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2).size,19);
 assert.deepEqual(ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2,[
  ...ESSENTIAL_HOLY_CARD_COLLECTION_GROUPS_V2.core,
  ...ESSENTIAL_HOLY_CARD_COLLECTION_GROUPS_V2.daily
 ]);
 assert.equal(ESSENTIAL_HOLY_CARD_IDS_V1.length,32);
 assert.equal(Object.keys(texts).length,48,"All canonical Prayer texts must remain intact");
 for(const id of ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2){
  assert.ok(ESSENTIAL_HOLY_CARD_IDS_V1.includes(id),id+" lost source Holy Card membership");
  assert.ok(texts[id],id+" missing canonical text");
 }
 for(const moved of [
  "mass_confiteor","marian_consecration_immaculate_heart",
  "adoration_anima_christi","adoration_spiritual_communion","benediction_versicles",
  "adoration_lord_i_am_not_worthy","devotion_memorare_st_joseph",
  "devotion_consecration_christ_king","church_prayer_for_pope",
  "sacred_heart_short_prayer","devotion_ad_te_beate_ioseph",
  "dead_fidelium_deus","dead_eternal_rest_singular"
 ]){
  assert.ok(!ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2.includes(moved),moved+" improperly remains on the Essentials shelf");
  assert.ok(texts[moved],"Moved prayer must remain available in canonical source: "+moved);
 }
});

test("Every selected prayer retains complete existing Latin, English and French witnesses",()=>{
 for(const id of ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2){
  const p=texts[id];
  for(const l of ["la","en","fr"]){
   assert.ok(typeof p[l]==="string"&&p[l].trim().length>0,id+" missing "+l);
  }
  assert.ok(essentialHolyCardDisplayTitle(id,p,"en").trim());
  assert.ok(essentialHolyCardDisplayTitle(id,p,"fr").trim());
 }
 // Ecclesiastical orthography: Latin uses 'u' as a vowel and 'v' as a consonant.
 assert.match(texts.foundations_glory_be.la,/\bSicut erat in principio\b/);
 assert.match(texts.foundations_our_father.la,/\btuum\b/);
 assert.match(texts.sacrament_come_holy_spirit.la,/\bVeni, Sancte Spiritus\b/);
 for(const id of ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2){
  assert.doesNotMatch(texts[id].la,/\bsicvt\b|\btvvm\b|\bsvnt\b/i,id);
 }
});

test("Correct titles are presentation-only; English and French labels are distinct",()=>{
 assert.equal(essentialHolyCardDisplayTitle("foundations_act_of_love",texts.foundations_act_of_love,"en"),"Act of Charity");
 assert.equal(essentialHolyCardDisplayTitle("foundations_act_of_love",texts.foundations_act_of_love,"fr"),"Acte de charité");
 assert.equal(essentialHolyCardDisplayTitle("foundations_prayer_of_adoration",texts.foundations_prayer_of_adoration,"fr"),"Mon Seigneur et mon Dieu");
 assert.equal(essentialHolyCardDisplayTitle("foundations_grace_after_meals",texts.foundations_grace_after_meals,"en"),"Thanksgiving After Meals");
 assert.equal(essentialHolyCardDisplayTitle("foundations_eternal_rest",texts.foundations_eternal_rest,"en"),"Eternal Rest");
 const en=claudeHolyCardCase({ids:ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2,prayers:texts,esc:escape,locale:"en"});
 const fr=claudeHolyCardCase({ids:ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2,prayers:texts,esc:escape,locale:"fr"});
 for(const page of [en,fr]){
  assert.equal((page.match(/data-p435930-lib-open=/g)||[]).length,19);
  assert.ok(!page.includes('data-p435930-lib-open="mass_confiteor"'));
 }
 assert.match(en,/Act of Charity/);
 assert.match(fr,/Acte de charité/);
 assert.match(fr,/Mon Seigneur et mon Dieu/);
});

test("Moving a prayer never breaks its original reversible Holy Card reader",()=>{
 for(const id of ESSENTIAL_HOLY_CARD_IDS_V1){
  const p=texts[id];
  const card=claudeHolyCard({id,p,face:p.la?"la":"en",esc:escape});
  assert.match(card,/data-p435930-essential-card-turn/,"Original Holy Card lost for "+id);
 }
 assert.match(runtime,/ESSENTIAL_HOLY_CARD_IDS_V1\.includes\(id\)/);
 assert.match(runtime,/claudeHolyCardCase\(\{ids:ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2/);
 assert.match(runtime,/ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2\.indexOf\(id\)/);
 assert.match(runtime,/ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2\[next\]/);
});

test("Source variants are not silently rewritten to imply literal parallel translations",()=>{
 // The Vatican's French Compendium appendix ends its Act of Hope with
 // 'Dans cette foi', while the Latin source says 'In hac spe'.
 // Review this discrepancy separately; do not overwrite either witness
 // or pretend those are the same phrase in a tap-to-translate UI.
 assert.match(texts.foundations_act_of_hope.fr,/Dans cette foi, puis-je vivre et mourir/);
 assert.match(texts.foundations_act_of_hope.la,/In hac spe vivere|In hac spe vívere/);
 // English-only historical consecration remains outside the trilingual shelf.
 assert.ok(texts.marian_consecration_immaculate_heart.en);
 assert.equal(texts.marian_consecration_immaculate_heart.fr,"");
 assert.equal(texts.marian_consecration_immaculate_heart.la,"");
});
