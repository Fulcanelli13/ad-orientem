/** Exact Holy See 2005 French edition target for canonical Prayer comparison.
 * Does not certify a traditional French translation as verbatim 2005 wording.
 * Called only by the existing collapsible Prayer provenance surface.
 */
export const FRENCH_COMPENDIUM_URL_V1="https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html";
export const PRAYER_COMPENDIUM_FRENCH_IDS_V1=Object.freeze([
  "foundations_sign_of_cross",
  "foundations_our_father",
  "foundations_hail_mary",
  "foundations_glory_be",
  "foundations_apostles_creed",
  "sacrament_act_of_contrition",
  "foundations_act_of_faith",
  "foundations_act_of_hope",
  "foundations_act_of_love",
  "foundations_guardian_angel",
  "marian_hail_holy_queen",
  "marian_memorare",
  "weekday_magnificat",
  "adoration_anima_christi",
  "weekday_benedictus",
  "foundations_eternal_rest"
]);
export const PRAYER_FRENCH_COMPARATIVE_IDS_V1=Object.freeze([
  "foundations_our_father",
  "foundations_apostles_creed",
  "sacrament_act_of_contrition",
  "marian_hail_holy_queen",
  "marian_memorare",
  "weekday_magnificat",
  "adoration_anima_christi",
  "weekday_benedictus",
  "foundations_eternal_rest"
]);
const IDs=new Set(PRAYER_COMPENDIUM_FRENCH_IDS_V1);
const COMPARATORS=new Set(PRAYER_FRENCH_COMPARATIVE_IDS_V1);
export function prayerCompendiumFrenchWitness(id){
 const key=String(id||"");
 if(!IDs.has(key))return null;
 return Object.freeze({url:FRENCH_COMPENDIUM_URL_V1,isComparative:COMPARATORS.has(key)});
}
