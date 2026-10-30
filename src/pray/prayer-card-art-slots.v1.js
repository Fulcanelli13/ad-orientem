/** Derived, identity-only projection of data/pray/art-placement-slots-20261030.v1.json.
 * 48 prayer-card vignette slots. Does not approve any artwork for publication.
 * The referenced canonical source owns subject eligibility, rotation and editorial decisions.
 */
export const PRAYER_CARD_ART_SLOT_SCHEMA_V1="AO_PRAYER_CARD_ART_BINDINGS_V1";
export const PRAYER_CARD_ART_SLOT_BY_PRAYER_ID=Object.freeze({
  "foundations_morning_offering": "COV-foundations_morning_offering",
  "weekday_benedictus": "COV-weekday_benedictus",
  "foundations_sign_of_cross": "COV-foundations_sign_of_cross",
  "foundations_our_father": "COV-foundations_our_father",
  "foundations_hail_mary": "COV-foundations_hail_mary",
  "foundations_glory_be": "COV-foundations_glory_be",
  "foundations_apostles_creed": "COV-foundations_apostles_creed",
  "sacrament_act_of_contrition": "COV-sacrament_act_of_contrition",
  "foundations_act_of_faith": "COV-foundations_act_of_faith",
  "foundations_act_of_hope": "COV-foundations_act_of_hope",
  "foundations_act_of_love": "COV-foundations_act_of_love",
  "foundations_guardian_angel": "COV-foundations_guardian_angel",
  "foundations_grace_before_meals": "COV-foundations_grace_before_meals",
  "foundations_grace_after_meals": "COV-foundations_grace_after_meals",
  "foundations_prayer_of_adoration": "COV-foundations_prayer_of_adoration",
  "mass_confiteor": "COV-mass_confiteor",
  "sacrament_come_holy_spirit": "COV-sacrament_come_holy_spirit",
  "traditional_veni_sancte_sequence": "COV-traditional_veni_sancte_sequence",
  "adoration_anima_christi": "COV-adoration_anima_christi",
  "adoration_spiritual_communion": "COV-adoration_spiritual_communion",
  "benediction_o_salutaris": "COV-benediction_o_salutaris",
  "benediction_tantum_ergo": "COV-benediction_tantum_ergo",
  "benediction_divine_praises": "COV-benediction_divine_praises",
  "adoration_litany_blessed_sacrament": "COV-adoration_litany_blessed_sacrament",
  "benediction_versicles": "COV-benediction_versicles",
  "adoration_lord_i_am_not_worthy": "COV-adoration_lord_i_am_not_worthy",
  "mass_devotion_leonine": "COV-mass_devotion_leonine",
  "benediction_adoremus_ps116": "COV-benediction_adoremus_ps116",
  "devotion_consecration_christ_king": "COV-devotion_consecration_christ_king",
  "sacred_heart_short_prayer": "COV-sacred_heart_short_prayer",
  "sacred_heart_aspiration_trust": "COV-sacred_heart_aspiration_trust",
  "marian_hail_holy_queen": "COV-marian_hail_holy_queen",
  "marian_memorare": "COV-marian_memorare",
  "weekday_magnificat": "COV-weekday_magnificat",
  "marian_consecration_immaculate_heart": "COV-marian_consecration_immaculate_heart",
  "sub_tuum": "COV-sub_tuum",
  "litany_loreto_1962": "COV-litany_loreto_1962",
  "litany_loreto_current": "COV-litany_loreto_current",
  "devotion_prayer_st_michael": "COV-devotion_prayer_st_michael",
  "devotion_memorare_st_joseph": "COV-devotion_memorare_st_joseph",
  "devotion_st_anthony_lost_items": "COV-devotion_st_anthony_lost_items",
  "devotion_litany_st_joseph": "COV-devotion_litany_st_joseph",
  "devotion_ad_te_beate_ioseph": "COV-devotion_ad_te_beate_ioseph",
  "church_prayer_for_pope": "COV-church_prayer_for_pope",
  "foundations_eternal_rest": "COV-foundations_eternal_rest",
  "dead_de_profundis": "COV-dead_de_profundis",
  "dead_fidelium_deus": "COV-dead_fidelium_deus",
  "dead_eternal_rest_singular": "COV-dead_eternal_rest_singular"
});
export function prayerCardArtSlot(prayerId){
 const key=String(prayerId??"");
 return Object.hasOwn(PRAYER_CARD_ART_SLOT_BY_PRAYER_ID,key)?PRAYER_CARD_ART_SLOT_BY_PRAYER_ID[key]:null;
}
export function prayerCardArtAttributes(prayerId){
 const id=prayerCardArtSlot(prayerId);
 // Binding is deliberately unassigned until a distinct artwork and original
 // image pass editorial, licence, frame and crop verification.
 return id?' data-ao-art-slot-id="'+id+'" data-ao-art-binding="unassigned" data-ao-art-surface="prayer-card"':"";
}
