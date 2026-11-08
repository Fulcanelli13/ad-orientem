/**
 * Source-scoped research disambiguations, not picture authentication.
 *
 * The frozen 989-work file contains lexical title tags, including generic
 * CHR-MIRACLE / CHR-CRUCIFIX hits for named saints' events. Those are
 * useful evidence of lexical search, but not evidence of a Gospel event
 * involving Christ. Suppress only the identified false category in the
 * derived category index, retaining the original lexical tag verbatim.
 *
 * Identity (workGroupId + title + artist + original lexical tag) must match.
 * Do not generalize from an arbitrary title containing "Saint" — Christ can
 * appear in scenes that also explicitly name saints.
 */
export const SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1=Object.freeze([
 Object.freeze({
  workGroupId:"CANONICAL::cma-148758",
  title:"The Crucifixion of Saint Andrew",
  artist:"Caravaggio",
  excludedTag:"CHR-CRUCIFIX",
  reason:"NAMED_SAINT_MARTYRDOM_NOT_CRUCIFIXION_OF_CHRIST"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::B01-MARK-TINTORETTO-ACCADEMIA",
  title:"Miracle of the Slave (Saint Mark intervenes)",
  artist:"Jacopo Tintoretto",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLE_NOT_CHRISTS_PUBLIC_MINISTRY"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-eter-aul-ubens-iracles-of-aint-gnatius-of-oyola",
  title:"Miracles of Saint Ignatius of Loyola",
  artist:"Peter Paul Rubens",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLES_NOT_CHRISTS_PUBLIC_MINISTRY"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::W05-027",
  title:"The Crucifixion of Saint Peter",
  artist:"Caravaggio",
  excludedTag:"CHR-CRUCIFIX",
  reason:"NAMED_SAINT_MARTYRDOM_NOT_CRUCIFIXION_OF_CHRIST"
 }),
 Object.freeze({
  workGroupId:"REVIEW::cma:111479",
  title:"The Miracles of Saint James the Greater",
  artist:"Noël Nicolas Coypel (French, 1690–1734)",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLES_NOT_CHRISTS_PUBLIC_MINISTRY"
 }),
 Object.freeze({
  workGroupId:"REVIEW::commons:10289552",
  title:"A miracle by Saint Benedict",
  artist:"Luca Giordano",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLES_NOT_CHRISTS_PUBLIC_MINISTRY"
 }),
 Object.freeze({
  workGroupId:"REVIEW::commons:26597275",
  title:"French: Le Miracle de saint Just | The Miracle of Saint Justus \" \"",
  artist:"Peter Paul Rubens",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLES_NOT_CHRISTS_PUBLIC_MINISTRY"
 }),
 Object.freeze({
  workGroupId:"REVIEW::commons:29827917",
  title:"Saint Isabel of Portugal Healing the Wounds of a Sick Woman",
  artist:"Goya y Lucientes, Francisco",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLES_NOT_CHRISTS_PUBLIC_MINISTRY"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-eter-aul-ubens-iracles-of-aint-rancis-avier",
  title:"Miracles of Saint Francis Xavier",
  artist:"Peter Paul Rubens",
  excludedTag:"CHR-MIRACLE",
  reason:"NAMED_SAINT_MIRACLES_NOT_CHRISTS_PUBLIC_MINISTRY"
 })
]);
const byId=new Map(SACRED_ART_SAINT_SCOPE_EXCEPTIONS_V1.map(row=>[row.workGroupId,row]));
export function lexicalSaintScopeException(work,tag){
 const rule=byId.get(work?.workGroupId);
 return rule && rule.title===work?.title && rule.artist===work?.artist && rule.excludedTag===tag
  ?rule:null;
}
