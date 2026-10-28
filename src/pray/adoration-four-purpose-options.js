import {createPrayerPurposeIndex,normalizePrayerPurposeSelection} from "./prayer-purpose-index.js";

/**
 * B10: optional *whole* historically sourced prayers within the existing
 * Four Ends stages. Not a second devotional sequence, not replacements for
 * the canonical core prayer, and never presented as same-text editions.
 *
 * Gratitude is currently spontaneous prayer with an optional Glory Be.
 * There is no verified context-neutral historical Thanksgiving alternative
 * in the core Prayer library; deliberately do not misclassify a prayer after
 * meals or Communion just to populate that purpose.
 */
export const ADORATION_FOUR_OPTIONAL_SOURCE_IDS=Object.freeze({
 adoration:Object.freeze(["adoration_litany_blessed_sacrament"]),
 reparation:Object.freeze(["sacred_heart_short_prayer"]),
 petition:Object.freeze(["church_prayer_for_pope"])
});
const defs=Object.freeze(Object.fromEntries(Object.entries(ADORATION_FOUR_OPTIONAL_SOURCE_IDS).map(([purpose,ids])=>
 [purpose,Object.freeze([Object.freeze({id:purpose,relationship:"distinct",ids})])])));
export const ADORATION_FOUR_OPTION_INDEX=createPrayerPurposeIndex(defs,ADORATION_FOUR_OPTIONAL_SOURCE_IDS);
export const ADORATION_FOUR_SOURCE_LABELS=Object.freeze({
 adoration_litany_blessed_sacrament:Object.freeze({en:"Litany of the Blessed Sacrament",fr:"Litanies du Saint-Sacrement"}),
 sacred_heart_short_prayer:Object.freeze({en:"Act of Reparation · Pius XI",fr:"Acte de réparation · Pie XI"}),
 church_prayer_for_pope:Object.freeze({en:"Prayer for the Pope",fr:"Prière pour le pape"})
});
export function adorationFourOptionFor(purpose,id){
 return ADORATION_FOUR_OPTIONAL_SOURCE_IDS[purpose]?.includes(id)?id:null;
}
export function normalizedAdorationFourChoices(raw){
 // The UI stores one exact optional source ID per Four Ends purpose.
 // Adapt the flat storage shape to the shared classifier's phase/group shape.
 const nested=Object.fromEntries(Object.keys(ADORATION_FOUR_OPTIONAL_SOURCE_IDS).map(purpose=>
  [purpose,{[purpose]:raw?.[purpose]}]));
 const checked=normalizePrayerPurposeSelection(ADORATION_FOUR_OPTION_INDEX,nested);
 return Object.fromEntries(Object.entries(checked).flatMap(([purpose,group])=>
  group[purpose] ? [[purpose,group[purpose]]] : []));
}
