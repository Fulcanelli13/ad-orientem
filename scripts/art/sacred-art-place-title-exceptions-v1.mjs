/** Exact-work geographic-title disambiguations for the frozen research index.
 * San Polo names the Venetian church setting for the Via Crucis cycle; it is
 * not a depicted saint. Preserve the frozen SNT-PATRONS lexical hit as source
 * evidence, but do not propagate it to the derived SAINTS artwork category.
 * These twelve records are provisional, NOT photo or devotional approvals.
 */
export const SACRED_ART_PLACE_TITLE_EXCEPTIONS_V1=Object.freeze([
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-01-hrist-ondemned-to-eath",
  title:"San Polo Via Crucis — Station 01: Christ Condemned to Death",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-02-esus-akes-p-the-ross",
  title:"San Polo Via Crucis — Station 02: Jesus Takes Up the Cross",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-03-irst-all",
  title:"San Polo Via Crucis — Station 03: First Fall",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-04-esus-eets-is-other",
  title:"San Polo Via Crucis — Station 04: Jesus Meets His Mother",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-05-imon-of-yrene-elps",
  title:"San Polo Via Crucis — Station 05: Simon of Cyrene Helps",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-06-eronica-ipes-is-ace",
  title:"San Polo Via Crucis — Station 06: Veronica Wipes His Face",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-07-econd-all",
  title:"San Polo Via Crucis — Station 07: Second Fall",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-08-esus-ddresses-the-omen-of-erusalem",
  title:"San Polo Via Crucis — Station 08: Jesus Addresses the Women of Jerusalem",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-09-hird-all",
  title:"San Polo Via Crucis — Station 09: Third Fall",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-10-tripping-of-is-arments",
  title:"San Polo Via Crucis — Station 10: Stripping of His Garments",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-11-ailing-to-the-ross",
  title:"San Polo Via Crucis — Station 11: Nailing to the Cross",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 }),
 Object.freeze({
  workGroupId:"CANONICAL::ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross",
  title:"San Polo Via Crucis — Station 12: Death on the Cross",
  artist:"Giandomenico Tiepolo",
  excludedTag:"SNT-PATRONS",
  reason:"SAN_POLO_IS_GEOGRAPHIC_SERIES_TITLE_NOT_DEPICTED_SAINT"
 })
]);
const byId=new Map(SACRED_ART_PLACE_TITLE_EXCEPTIONS_V1.map(x=>[x.workGroupId,x]));
export function lexicalPlaceTitleException(work,tag){
 const rule=byId.get(work?.workGroupId);
 return rule?.title===work?.title&&rule?.artist===work?.artist&&rule.excludedTag===tag
  ?rule:null;
}
