/**
 * B08: evidence-bound classification of *complete* preconciliar prayers.
 * Never present narrower-purpose devotion as an interchangeable version
 * of St Pius X's one combined opening prayer. Historical source IDs, text,
 * provenance and original 1905/1913 ordering belong to the source corpus.
 */
export const REVIEWED_DAILY_STAGE_ALTERNATIVES=Object.freeze({
 "ignatius_suscipe_lasance_1908_en":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",
  label:"St Ignatius · Suscipe (Lasance 1908)",scope:"narrower"}),
 "ignatius_suscipe_lasance_1908_la":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",
  label:"S. Ignatius · Suscipe (Latine)",scope:"narrower"}),
 "b11-lasance-morning-adoration-thanksgiving":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"thanksgiving",label:"Lasance · Adoration & thanks",scope:"narrower"}),
 "moran-1883-morning-thanksgiving":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"thanksgiving",label:"Moran · Thanksgiving",scope:"narrower"}),
 "b10-bbg-1925-apostleship-morning-offering":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",label:"Blessed Be God",scope:"narrower"}),
 "b09-lasance-apostleship-my-god":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",label:"Lasance · My God",scope:"narrower"}),
 "b09-lasance-apostleship-o-jesus":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",label:"Lasance · O Jesus",scope:"narrower"}),
 "pocket-1899-morning-sacred-heart-offering":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",label:"Pocket Prayer Book",scope:"narrower"}),
 "moran-1883-morning-good-intention":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",label:"Moran · Good Intention",scope:"narrower"}),
 "fr-1905-morning-thanks-offering":Object.freeze({
  daypart:"morning",slot:"daily-prayer",purpose:"offering",label:"Exercices · Offrande",scope:"narrower"}),
 "b11-lasance-evening-adoration-thanksgiving-light":Object.freeze({
  daypart:"evening",slot:"daily-prayer",purpose:"thanksgiving",label:"Lasance · Evening thanks",scope:"narrower"}),
 "b09-fr1905-evening-adoration":Object.freeze({
  daypart:"evening",slot:"daily-prayer",purpose:"adoration",label:"Exercices · Adoration",scope:"narrower"}),
 "b09-fr1905-evening-thanksgiving":Object.freeze({
  daypart:"evening",slot:"daily-prayer",purpose:"thanksgiving",label:"Exercices · Remerciement",scope:"narrower"}),
 "b09-fr1905-evening-contrition":Object.freeze({
  daypart:"evening",slot:"contrition",purpose:"contrition",label:"Exercices · Contrition",scope:"same-act"})
});
export const DAILY_PURPOSES=Object.freeze({
 morning:Object.freeze(["offering","thanksgiving"]),
 evening:Object.freeze(["thanksgiving","adoration"])
});
/** Only *same-act* candidates replace an existing printed stage. */
export function reviewedDailyAlternative(id,daypart,slot){
 const rule=Object.prototype.hasOwnProperty.call(REVIEWED_DAILY_STAGE_ALTERNATIVES,id)
  ?REVIEWED_DAILY_STAGE_ALTERNATIVES[id]:null;
 return rule&&rule.scope==="same-act"&&rule.daypart===daypart&&rule.slot===slot?rule:null;
}
/** Narrower prayers have their own optional purpose, never a source substitute. */
export function reviewedDailyPurpose(id,daypart,purpose){
 const rule=Object.prototype.hasOwnProperty.call(REVIEWED_DAILY_STAGE_ALTERNATIVES,id)
  ?REVIEWED_DAILY_STAGE_ALTERNATIVES[id]:null;
 return rule&&rule.scope==="narrower"&&rule.daypart===daypart&&rule.slot==="daily-prayer"&&rule.purpose===purpose?rule:null;
}
