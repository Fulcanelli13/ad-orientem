/**
 * Saturday Compline: present canonical Psalm verse references while retaining
 * verbatim Divinum Officium source rows for provenance.
 *
 * Independent textual/numbering witnesses:
 *   - Consociatio Christi Regis, Psalterium Romanum iuxta ritum 1962 (2023),
 *     Saturday Compline, printed pp. 177-179.
 *   - Clementine Vulgate, Psalms 87 and 102.
 *
 * Psalm 87:1 is the superscription in Clementine biblical numbering;
 * "Domine, Deus salutis" correctly starts at 87:2. The pinned liturgical
 * stichs cross canonical boundaries 87:5-6 and 87:9-10; Psalm 102's
 * recitation stichs likewise cross 13-15 and 17-18. Do not turn a
 * recitation-stich ordinal into a misleading biblical citation.
 * Only the private reading projection applies this transformation.
 */
const SOURCE_87=Object.freeze([2,3,4,5,6,7,8,9,9,10,11,12,13,14,15,16,17,18,19]);
const PRINTED_87=Object.freeze([
 "2","3","4","5–6","6","7","8","9","9–10","10",
 "11","12","13","14","15","16","17","18","19"
]);
const SOURCE_102_A=Object.freeze([1,2,3,4,5,6,7,8,9,10,11,12]);
const SOURCE_102_B=Object.freeze([13,14,16,17,17,18,19,20,21,22]);
const PRINTED_102_B=Object.freeze([
 "13–14","14–15","16","17","17–18","18","19","20","21","22"
]);
const RULES=Object.freeze({
 "Psalterium/Psalmorum/Psalm87#2-19":Object.freeze({
  number:87,raw:SOURCE_87,display:PRINTED_87
 }),
 "Psalterium/Psalmorum/Psalm102#1-12":Object.freeze({
  number:102,raw:SOURCE_102_A,display:SOURCE_102_A.map(String)
 }),
 "Psalterium/Psalmorum/Psalm102#13-22":Object.freeze({
  number:102,raw:SOURCE_102_B,display:PRINTED_102_B
 })
});
export const SATURDAY_COMPLINE_PRINTED_PSALM_WITNESS=
 "Psalterium Romanum iuxta ritum 1962 (2023), pp. 177–179; Clementine Vulgate";
/**
 * Returns the unchanged frame for all other Office texts, a numbered
 * presentation frame for the two appointed Saturday psalms, or null if
 * the expected pinned source identity / sequence has changed.
 *
 * The prayer words, language alignment and source records are never
 * overwritten. A displayed span such as 102:13–14 explicitly indicates
 * a liturgical stich containing words from both canonical Bible verses.
 */
export function projectSaturdayComplinePsalmFrame(frame){
 if(frame?.kind!=="PSALM"||
   !/^Psalterium\/Psalmorum\/Psalm(?:87|102)#/u.test(frame.sourceId||""))
  return frame;
 const rule=RULES[frame.sourceId];
 const index=frame.subIndex;
 if(!rule||!Number.isInteger(index)||index<0||
   index>=rule.raw.length||frame.subTotal!==rule.raw.length||
   frame.focusType!=="PSALM_VERSE"||
   !frame.texts||!Array.isArray(frame.texts.la))
  return null;
 const rawLabel=rule.number+":"+rule.raw[index];
 const printLabel=rule.number+":"+rule.display[index];
 const displayTexts={};
 for(const [language,lines] of Object.entries(frame.texts)){
  if(!["la","en","fr"].includes(language)||!Array.isArray(lines)||
    lines.length!==1||typeof lines[0]!=="string")
   return null;
  const prefix=new RegExp("^"+rawLabel+" (.+)$","u");
  const match=prefix.exec(lines[0]);
  if(!match?.[1]?.trim())return null;
  displayTexts[language]=Object.freeze([match[1]]);
 }
 return Object.freeze({
  ...frame,label:printLabel,texts:Object.freeze(displayTexts),
  sourceTexts:frame.texts,sourceVerseLabel:rawLabel,
  printedVerseLabel:printLabel,sourceNumberingNormalized:true,
  originalSourceOnly:false,printConformed:true,
  printedPsalmWitness:SATURDAY_COMPLINE_PRINTED_PSALM_WITNESS
 });
}
