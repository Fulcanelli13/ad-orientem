/**
 * Prayer subject browser v1 — the approved nine-family theological index.
 * This classification is NOT a new source of prayer text, source authority or
 * a publication gate. Only the 46 individually classified, already-published
 * canonical prayer identities are indexed in v1; their existing reader and
 * bilingual/Latin source owners remain unchanged.
 *
 * Distinct legacy canonical aliases without a separate independent work
 * identity remain accessible through the Library's All category, rather than
 * being guessed into a theological family. Research-only, source-only and
 * unverified supplementary works are intentionally not imported here.
 *
 * Classification basis: 2026-11-06 prayer-work identity registry, reviewed
 * through Stage 9 in draft PR #2594. Editorial status never changes here.
 */
export const PRAYER_SUBJECTS_V1=Object.freeze([
  {
    "id": "I",
    "en": "God, the Most Holy Trinity",
    "fr": "Dieu, la Très Sainte Trinité"
  },
  {
    "id": "II",
    "en": "Our Lord Jesus Christ",
    "fr": "Notre-Seigneur Jésus-Christ"
  },
  {
    "id": "III",
    "en": "The Holy Eucharist",
    "fr": "La Sainte Eucharistie"
  },
  {
    "id": "IV",
    "en": "The Holy Ghost",
    "fr": "Le Saint-Esprit"
  },
  {
    "id": "V",
    "en": "Our Lady",
    "fr": "Notre-Dame"
  },
  {
    "id": "VI",
    "en": "The Angels and Saints",
    "fr": "Les Anges et les Saints"
  },
  {
    "id": "VII",
    "en": "Holy Church and Every Need",
    "fr": "La Sainte Église et les intentions"
  },
  {
    "id": "VIII",
    "en": "Scriptural Prayer",
    "fr": "Prière scripturaire"
  },
  {
    "id": "IX",
    "en": "The Last Things",
    "fr": "Les Fins dernières"
  }
].map(x=>Object.freeze(x)));
export const PRAYER_CANONICAL_SUBJECT_IDS_V1=Object.freeze({
  "foundations_sign_of_cross": "I",
  "foundations_our_father": "I",
  "foundations_hail_mary": "V",
  "foundations_glory_be": "I",
  "foundations_apostles_creed": "I",
  "foundations_act_of_faith": "I",
  "foundations_act_of_hope": "I",
  "foundations_act_of_love": "I",
  "foundations_morning_offering": "II",
  "foundations_grace_before_meals": "I",
  "foundations_grace_after_meals": "I",
  "foundations_prayer_of_adoration": "III",
  "devotion_consecration_christ_king": "II",
  "sacred_heart_short_prayer": "II",
  "sacred_heart_aspiration_trust": "II",
  "sacrament_act_of_contrition": "I",
  "mass_confiteor": "I",
  "adoration_lord_i_am_not_worthy": "III",
  "mass_devotion_leonine": "III",
  "marian_hail_holy_queen": "V",
  "marian_memorare": "V",
  "weekday_magnificat": "VIII",
  "marian_consecration_immaculate_heart": "V",
  "sub_tuum": "V",
  "litany_loreto_1962": "V",
  "adoration_anima_christi": "III",
  "adoration_spiritual_communion": "III",
  "benediction_o_salutaris": "III",
  "benediction_tantum_ergo": "III",
  "benediction_divine_praises": "I",
  "adoration_litany_blessed_sacrament": "III",
  "benediction_versicles": "III",
  "benediction_adoremus_ps116": "III",
  "sacrament_come_holy_spirit": "IV",
  "traditional_veni_sancte_sequence": "IV",
  "weekday_benedictus": "VIII",
  "foundations_guardian_angel": "VI",
  "devotion_prayer_st_michael": "VI",
  "devotion_memorare_st_joseph": "VI",
  "devotion_litany_st_joseph": "VI",
  "devotion_ad_te_beate_ioseph": "VI",
  "devotion_st_anthony_lost_items": "VI",
  "church_prayer_for_pope": "VII",
  "foundations_eternal_rest": "IX",
  "dead_de_profundis": "VIII",
  "dead_fidelium_deus": "IX"
});
export function prayerSubjectFor(id){
 return PRAYER_CANONICAL_SUBJECT_IDS_V1[String(id||"")]||null;
}
export function prayerSubjectsForLibrary(prayers,subject="all"){
 const entries=Array.isArray(prayers)?prayers:[];
 if(subject==="all")return entries;
 if(!PRAYER_SUBJECTS_V1.some(s=>s.id===subject))return [];
 return entries.filter(p=>prayerSubjectFor(p?.id)===subject);
}
export function prayerSubjectCounts(prayers){
 const entries=Array.isArray(prayers)?prayers:[];
 const counts=Object.fromEntries(PRAYER_SUBJECTS_V1.map(x=>[x.id,0]));
 let unmapped=0;
 for(const p of entries){
  const subject=prayerSubjectFor(p?.id);
  if(subject&&Object.hasOwn(counts,subject))counts[subject]++;
  else unmapped++;
 }
 return Object.freeze({counts:Object.freeze(counts),unmapped,total:entries.length});
}
