/**
 * B07 audit: eligible *complete* source prayers that may be chosen in place
 * of one daily stage, while retaining their existing optional-devotion use.
 *
 * This is intentionally a whitelist, NOT slot-name matching. Some historical
 * prayers emphasize just one aspect of a combined St Pius X opening. The UI
 * must disclose that narrower emphasis rather than suggest textual parity.
 * This registry contains no actual prayer text, URLs or translations.
 */
export const REVIEWED_DAILY_STAGE_ALTERNATIVES=Object.freeze({
 "b11-lasance-morning-adoration-thanksgiving":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"praise",label:"Lasance · Adoration",scope:"narrower"}),
 "moran-1883-morning-thanksgiving":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"praise",label:"Moran · Adoration",scope:"narrower"}),
 "b10-bbg-1925-apostleship-morning-offering":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"offering",label:"Blessed Be God · Offering",scope:"narrower"}),
 "b09-lasance-apostleship-my-god":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"offering",label:"Lasance · My God",scope:"narrower"}),
 "b09-lasance-apostleship-o-jesus":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"offering",label:"Lasance · O Jesus",scope:"narrower"}),
 "pocket-1899-morning-sacred-heart-offering":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"offering",label:"Pocket Prayer Book · Offering",scope:"narrower"}),
 "moran-1883-morning-good-intention":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"offering",label:"Moran · Good Intention",scope:"narrower"}),
 "fr-1905-morning-thanks-offering":Object.freeze({
  daypart:"morning",slot:"daily-prayer",focus:"thanks-offering",label:"Exercices · Offrande",scope:"narrower"}),
 "b11-lasance-evening-adoration-thanksgiving-light":Object.freeze({
  daypart:"evening",slot:"daily-prayer",focus:"praise",label:"Lasance · Thanksgiving",scope:"narrower"}),
 "b09-fr1905-evening-adoration":Object.freeze({
  daypart:"evening",slot:"daily-prayer",focus:"adoration",label:"Exercices · Adoration",scope:"narrower"}),
 "b09-fr1905-evening-thanksgiving":Object.freeze({
  daypart:"evening",slot:"daily-prayer",focus:"thanksgiving",label:"Exercices · Remerciement",scope:"narrower"}),
 "b09-fr1905-evening-contrition":Object.freeze({
  daypart:"evening",slot:"contrition",focus:"contrition",label:"Exercices · Contrition",scope:"same-act"})
});
export function reviewedDailyAlternative(id,daypart,slot){
 const rule=Object.prototype.hasOwnProperty.call(REVIEWED_DAILY_STAGE_ALTERNATIVES,id)
  ?REVIEWED_DAILY_STAGE_ALTERNATIVES[id]:null;
 return rule&&rule.daypart===daypart&&rule.slot===slot?rule:null;
}
