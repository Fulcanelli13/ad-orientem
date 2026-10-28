/**
 * B11: all nine existing Good Death prayers grouped by devotional purpose.
 * The distinct acts remain distinct. The 1909/2021 St Joseph Litany
 * choice is an edition switch INSIDE its existing source card, not a tenth
 * stage, replacement prayer, or newly invented canonical text.
 */
export const GOOD_DEATH_PRAYER_PURPOSES=Object.freeze({
 ordinary:Object.freeze([
  Object.freeze({id:"joseph",titleEn:"St Joseph",titleFr:"Saint Joseph",relationship:"distinct",
   ids:Object.freeze(["devotion_litany_st_joseph","devotion_ad_te_beate_ioseph","devotion_memorare_st_joseph"])}),
  Object.freeze({id:"virtues",titleEn:"Faith, hope & charity",titleFr:"Foi, espérance et charité",relationship:"distinct",
   ids:Object.freeze(["foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love"])}),
  Object.freeze({id:"contrition",titleEn:"Contrition",titleFr:"Contrition",relationship:"distinct",
   ids:Object.freeze(["sacrament_act_of_contrition"])}),
  Object.freeze({id:"mary",titleEn:"Our Lady",titleFr:"Notre-Dame",relationship:"distinct",
   ids:Object.freeze(["foundations_hail_mary"])}),
  Object.freeze({id:"aspirations",titleEn:"Short invocations",titleFr:"Invocations brèves",relationship:"distinct",
   ids:Object.freeze(["aspirations"])})
 ])
});
