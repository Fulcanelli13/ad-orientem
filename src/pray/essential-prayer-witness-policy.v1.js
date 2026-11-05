/**
 * Essential Prayer source/translation policy, 5 Nov 2026.
 *
 * This is a witness reconciliation overlay, NOT a second prayer corpus.
 * The canonical records retain all original la/en/fr text bytes.
 * "Present" is not equivalent to original-print text certification.
 */
import {ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2} from "./essential-holy-card-parts.js";

export const ESSENTIAL_PRAYER_WITNESS_POLICY_VERSION="ao-essential-witness-policy-20261105.v1";

const VATICAN_EN="https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_en.html";
const VATICAN_FR="https://www.vatican.va/archive/compendium_ccc/documents/archive_2005_compendium-ccc_fr.html";
const FRENCH_1905="https://fr.wikisource.org/wiki/Cat%C3%A9chisme_illustr%C3%A9_des_v%C3%A9rit%C3%A9s_n%C3%A9cessaires/Pri%C3%A8res";

/**
 * Per-face source scope. Never claim that distinct traditional French,
 * English and Latin prayer formulas are word-for-word translations.
 *
 * Source statuses:
 * - original_witness: wording preserved against stated source
 * - historical_variant: traditional prayer witness differs from another edition
 * - corresponding_formula: authentically attested but not a literal alignment
 * - source_review: source field exists; needs independent edition collation
 * - editorial_correction: the preferred reader wording is consciously NOT verbatim
 */
export const ESSENTIAL_PRAYER_WITNESS_POLICY_V1=Object.freeze({
 foundations_sign_of_cross:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_our_father:Object.freeze({
  alignment:"historical_variant",
  review:"historical_variant",
  note:"French uses the older vous / laissez pas succomber form, not the 2005 Compendium's tu / soumets form. Keep the source text.",
  faces:Object.freeze({
   fr:Object.freeze({status:"historical_variant",witness:"Catéchisme illustré des vérités nécessaires, Prières (1905)",url:FRENCH_1905}),
   la:Object.freeze({status:"historical_variant",witness:"Traditional Latin Pater noster; spelling quotidianum (Compendium prints cotidianum)",url:VATICAN_FR}),
   en:Object.freeze({status:"corresponding_formula",witness:"Vatican Compendium, English prayer formula",url:VATICAN_EN})
  })
 }),
 foundations_hail_mary:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_glory_be:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_apostles_creed:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 sacrament_act_of_contrition:Object.freeze({
  alignment:"corresponding_formula",
  review:"historical_variant",
  note:"French and English/Latin printed contrition formulas differ in near occasion of sin and penance clauses; do not present as identical sentences.",
  faces:Object.freeze({
   fr:Object.freeze({status:"corresponding_formula",witness:"French Vatican Compendium Acte de contrition",url:VATICAN_FR}),
   en:Object.freeze({status:"corresponding_formula",witness:"English Vatican Compendium Act of Contrition",url:VATICAN_EN}),
   la:Object.freeze({status:"corresponding_formula",witness:"Latin Vatican Compendium Actus contritionis",url:VATICAN_EN})
  })
 }),
 foundations_act_of_faith:Object.freeze({
  alignment:"corresponding_formula",
  review:"historical_variant",
  note:"English includes explicit Trinity/Incarnation/Judgement clauses not printed word-for-word in the official Latin or French face.",
  faces:Object.freeze({
   en:Object.freeze({status:"corresponding_formula",witness:"Vatican Compendium Act of Faith",url:VATICAN_EN}),
   fr:Object.freeze({status:"corresponding_formula",witness:"Vatican Compendium Acte de foi",url:VATICAN_FR}),
   la:Object.freeze({status:"corresponding_formula",witness:"Vatican Compendium Actus fidei",url:VATICAN_EN})
  })
 }),
 foundations_act_of_hope:Object.freeze({
  alignment:"printed_witness_with_editorial_reading",
  review:"historical_variant",
  note:"The official French Compendium prints 'Dans cette foi' in its Acte d'espérance, while Latin reads 'In hac spe' and English reads 'In this hope'. Preserve the printed French face and offer an explicitly editorial corrected reading separately.",
  faces:Object.freeze({
   en:Object.freeze({status:"original_witness",witness:"Vatican Compendium Act of Hope",url:VATICAN_EN}),
   la:Object.freeze({status:"original_witness",witness:"Vatican Compendium Actus spei",url:VATICAN_EN}),
   fr:Object.freeze({status:"original_witness",witness:"Vatican Compendium Acte d'espérance (including 'Dans cette foi')",url:VATICAN_FR})
  })
 }),
 foundations_act_of_love:Object.freeze({
  alignment:"corresponding_formula",
  review:"historical_variant",
  note:"The published French Acte de charité ends earlier than Latin/English; do not manufacture an extra sentence or Amen.",
  faces:Object.freeze({
   fr:Object.freeze({status:"original_witness",witness:"Vatican Compendium Acte de charité",url:VATICAN_FR}),
   en:Object.freeze({status:"corresponding_formula",witness:"Vatican Compendium Act of Love",url:VATICAN_EN}),
   la:Object.freeze({status:"corresponding_formula",witness:"Vatican Compendium Actus caritatis",url:VATICAN_EN})
  })
 }),
 foundations_guardian_angel:Object.freeze({
  alignment:"historical_variant",
  review:"historical_variant",
  note:"English is the traditional rhymed 'Angel of God, my guardian dear' adaptation; Latin and French follow Angele Dei, not word-for-word English verse.",
  faces:Object.freeze({
   en:Object.freeze({status:"historical_variant",witness:"Traditional English Guardian Angel rhyme; exact edition collation pending",url:null})
  })
 }),
 foundations_prayer_of_adoration:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 marian_memorare:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 sacrament_come_holy_spirit:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 devotion_prayer_st_michael:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 sacred_heart_aspiration_trust:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_eternal_rest:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_grace_before_meals:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_grace_after_meals:Object.freeze({alignment:"corresponding_formula",review:"source_review"}),
 foundations_morning_offering:Object.freeze({
  alignment:"historical_variant",
  review:"historical_variant",
  note:"English USCCB Morning Offering; the French and Latin devotional versions are separately witnessed and cannot be labelled verbatim translations of the English source."
 })
});

/**
 * The *only* editorial correction proposed in this pass, held outside the
 * canonical French source field until reader-language preference is reviewed.
 * It fixes the incoherent hope/faith word in the prayer for devotional use.
 * No claim that the 2005 French printed witness said 'espérance'.
 */
const FRENCH_HOPE_PRINTED_CLAUSE="Dans cette foi, puis-je vivre et mourir.";
const FRENCH_HOPE_EDITORIAL_CLAUSE="Dans cette espérance, puis-je vivre et mourir.";
export function essentialPrayerEditorialReading(id,language,record){
 if(id!=="foundations_act_of_hope"||language!=="fr")return null;
 const original=record?.fr;
 if(typeof original!=="string"||original.split(FRENCH_HOPE_PRINTED_CLAUSE).length!==2)return null;
 return Object.freeze({
  text:original.replace(FRENCH_HOPE_PRINTED_CLAUSE,FRENCH_HOPE_EDITORIAL_CLAUSE),
  language:"fr",
  kind:"editorial_correction",
  sourceText:original,
  note:"Editorial corrected devotional wording; original French Vatican Compendium witness retained unchanged.",
  sourceUrl:VATICAN_FR
 });
}

export function essentialPrayerWitnessPolicy(id){
 if(!ESSENTIAL_HOLY_CARD_COLLECTION_IDS_V2.includes(id))return null;
 return ESSENTIAL_PRAYER_WITNESS_POLICY_V1[id]||null;
}
