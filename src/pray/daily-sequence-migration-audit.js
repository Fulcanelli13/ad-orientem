/**
 * Migration audit for the existing 11/13 Morning/Evening prayer cards.
 *
 * Deliberately NOT imported by the production reader. Its job is to make
 * missing devotional stages explicit before any editor-approved transition.
 * No texts, release flags, or navigation behavior are changed here.
 */
import {
 MORNING_PRAYER_SEQUENCE_V381,EVENING_PRAYER_SEQUENCE_V381
} from "./traditional-pray-data.js";

const stage=(id,label,legacyIds,coverage,reason,policy="required")=>Object.freeze({
 id,label,legacyIds:Object.freeze(legacyIds),coverage,reason,policy
});

export const DAILY_PROPOSED_STAGE_COVERAGE=Object.freeze({
 morning:Object.freeze([
  stage("presence","Presence and adoration",["foundations_sign_of_cross"],"partial","Cross is an opening action, not a standalone act of adoration"),
  stage("thanksgiving","Thanksgiving",[],"missing","No Morning thanksgiving prayer in current eleven"),
  stage("holy-spirit","Invocation of the Holy Ghost",["sacrament_come_holy_spirit"],"existing","Current invocation present"),
  stage("offering","Morning Offering",[],"missing","No Morning Offering at all in current eleven"),
  stage("theological-acts","Faith, Hope and Charity",["foundations_act_of_faith","foundations_act_of_hope","foundations_act_of_love"],"existing","Separate current acts; alternative printed forms need individual editorial approval"),
  stage("petition-resolution","Petition and daily resolution",[],"missing","Current Contrition must not be mislabeled daily resolution"),
  stage("common-prayers","Our Father, Hail Mary and Creed",["foundations_our_father","foundations_hail_mary","foundations_apostles_creed"],"existing","Common prayers may be optional in Short, retained in Complete"),
  stage("marian-guardian","Marian and Guardian intercession",["foundations_guardian_angel"],"partial","Guardian present; separate Marian devotion may share existing Hail Mary and must not be duplicated"),
  stage("conclusion","Conclusion and doxology",["foundations_glory_be"],"existing","Existing Gloria Patri is present")
 ]),
 evening:Object.freeze([
  stage("presence","Presence and adoration",["foundations_sign_of_cross"],"partial","Cross is not sufficient Evening Adoration"),
  stage("thanksgiving","Evening Thanksgiving",[],"missing","No evening thanksgiving text in current thirteen"),
  stage("examen","Prayer for light and examination",["sacrament_come_holy_spirit","pray.nightly_examen"],"partial","Invocation and guided examination exist but a distinct historical prayer for light is missing"),
  stage("contrition","Contrition",["sacrament_act_of_contrition"],"existing","Current penitential act present"),
  stage("amendment","Purpose of amendment",[],"missing","Current Contrition may mention amendment, but cannot be attributed as the 1905 distinct Resolution"),
  stage("intercessions","Intercessions and faithful departed",["dead_de_profundis"],"partial","Prayers for departed present; living intercessions missing"),
  stage("marian","Marian devotion",["foundations_hail_mary","marian_hail_holy_queen"],"existing","Marian prayers present but should not be duplicated to satisfy common-prayer slot"),
  stage("night-protection","Night prayer and protection",[],"missing","No Salva nos, Visita quaesumus or equivalent nighttime collect in current thirteen"),
  stage("commendation","Final commendation",[],"missing","Glory Be is a doxology, not equivalent to In manus tuas")
 ])
});

export const DAILY_LEGACY_RETAINED_EXTRAS=Object.freeze({
 morning:Object.freeze(["sacrament_act_of_contrition"]),
 evening:Object.freeze([
   "foundations_our_father","foundations_apostles_creed",
   "foundations_act_of_faith","foundations_act_of_hope",
   "foundations_act_of_love","foundations_glory_be"
 ])
});

/**
 * Ensures every current reader ID is classified EXACTLY ONCE as part of
 * a future stage or as a retained optional devotional. This explicitly
 * prevents accidental prayer deletion during subsequent sequence work.
 */
export function auditDailyStageMigration(){
 const current={morning:MORNING_PRAYER_SEQUENCE_V381,evening:EVENING_PRAYER_SEQUENCE_V381};
 const report={};
 for(const daypart of ["morning","evening"]){
  const legacy=current[daypart].map(x=>x[0]);
  const assigned=[
   ...DAILY_PROPOSED_STAGE_COVERAGE[daypart].flatMap(s=>s.legacyIds),
   ...DAILY_LEGACY_RETAINED_EXTRAS[daypart]
  ];
  const unique=new Set(assigned);
  const missing=legacy.filter(id=>!unique.has(id));
  const duplicate=assigned.filter((id,i)=>assigned.indexOf(id)!==i);
  const unexpected=assigned.filter(id=>!legacy.includes(id));
  report[daypart]=Object.freeze({
   legacyCount:legacy.length,
   proposedStageCount:DAILY_PROPOSED_STAGE_COVERAGE[daypart].length,
   completeStageCoverage:DAILY_PROPOSED_STAGE_COVERAGE[daypart].filter(s=>s.coverage==="existing").length,
   partialStageCoverage:DAILY_PROPOSED_STAGE_COVERAGE[daypart].filter(s=>s.coverage==="partial").length,
   missingStageCoverage:DAILY_PROPOSED_STAGE_COVERAGE[daypart].filter(s=>s.coverage==="missing").length,
   retainedExtraCount:DAILY_LEGACY_RETAINED_EXTRAS[daypart].length,
   missing,duplicate,unexpected,
   safe:missing.length===0&&duplicate.length===0&&unexpected.length===0
  });
 }
 return Object.freeze(report);
}
