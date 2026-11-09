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


/**
 * Print-conforming Sunday Compline display for 29–30 November 2026.
 *
 * The printed 2008 Diurnale Romanum (pp. 104–106) and the 2023
 * Psalterium Romanum (pp. 30–31) appoint Psalms 4, 90, 133.
 * Psalm 4:2 and 133:1 divide across two separate liturgical stichs.
 * Keep these source sublabels (2a/2b and 1a/1b), rather than inventing
 * a distinct biblical verse number or displaying machine prefixes.
 */
const SUNDAY_COMPLINE_PSALM_SOURCE_LABELS=Object.freeze({
 "Psalterium/Psalmorum/Psalm4#2-10":Object.freeze([
  "2a","2b","3","4","5","6","7","8","9","10"
 ]),
 "Psalterium/Psalmorum/Psalm90#1-16":Object.freeze([
  "1","2","3","4","5","6","7","8","9","10","11","12",
  "13","14","15","16"
 ]),
 "Psalterium/Psalmorum/Psalm133#1-3":Object.freeze([
  "1a","1b","2","3"
 ])
});
export const SUNDAY_COMPLINE_PRINTED_PSALM_WITNESS=
 "2008 Diurnale Romanum, pp. 104–106; 2023 Psalterium Romanum, pp. 30–31";
export function projectSundayComplinePsalmFrame(frame){
 if(frame?.kind!=="PSALM"||
    !/^Psalterium\/Psalmorum\/Psalm(?:4|90|133)#/u.test(frame.sourceId||""))
  return frame;
 const printed=SUNDAY_COMPLINE_PSALM_SOURCE_LABELS[frame.sourceId];
 const i=frame.subIndex;
 if(!printed||!Number.isInteger(i)||i<0||i>=printed.length||
    frame.subTotal!==printed.length||frame.focusType!=="PSALM_VERSE"||
    !frame.texts?.la)return null;
 const number=/Psalm(4|90|133)#/u.exec(frame.sourceId)?.[1];
 if(!number)return null;
 const label=number+":"+printed[i],texts={};
 for(const [language,lines] of Object.entries(frame.texts)){
  if(!["la","en","fr"].includes(language)||!Array.isArray(lines)||
     lines.length!==1||typeof lines[0]!=="string")return null;
  const prefix=new RegExp("^"+label+" (.+)$","u").exec(lines[0]);
  if(!prefix?.[1]?.trim())return null;
  texts[language]=Object.freeze([prefix[1]]);
 }
 return Object.freeze({
  ...frame,label,texts:Object.freeze(texts),sourceTexts:frame.texts,
  sourceVerseLabel:label,printedVerseLabel:label,
  sourceNumberingNormalized:true,originalSourceOnly:false,
  printConformed:true,printedPsalmWitness:SUNDAY_COMPLINE_PRINTED_PSALM_WITNESS
 });
}


/**
 * Ferial Compline printed-Psalter stich labels. The 1960 Roman Psalter
 * divides certain biblical verses across recitation stichs, so labels
 * MUST follow the exact source rows and may legitimately repeat.
 * E.g. Psalm 69:4 and 69:6 have two recitation stichs, while
 * Psalm 12 references extend across canonical verse boundaries.
 *
 * Exact full Latin words independently compared with the Clementine
 * Vulgate Project source: nine psalms / 1,536 word tokens, with ten
 * enumerated orthographic variants, but NOT a facsimile of Mame 1961.
 * 2008 Diurnale and 2023 Psalterium affirm weekday appointments.
 */
const FERIAL_COMPLINE_SOURCE_LABELS=Object.freeze(
 Object.fromEntries(Object.entries({"Psalterium/Psalmorum/Psalm11#2-9":["11:2","11:3","11:4","11:5","11:6a","11:6b","11:7","11:8","11:9"],"Psalterium/Psalmorum/Psalm12#1-6":["12:1","12:2","12:3","12:4b","12:5b","12:6b"],"Psalterium/Psalmorum/Psalm15#1-11":["15:1","15:3","15:4a","15:4b","15:5","15:6","15:7","15:8","15:9","15:10","15:11"],"Psalterium/Psalmorum/Psalm33#2-11":["33:2","33:3","33:4","33:5","33:6","33:7","33:8","33:9","33:10","33:11"],"Psalterium/Psalmorum/Psalm33#12-23":["33:12","33:13","33:14","33:15","33:16","33:17","33:18","33:19","33:20","33:21","33:22","33:23"],"Psalterium/Psalmorum/Psalm60#2-9":["60:2","60:3","60:4","60:5","60:6","60:7","60:8","60:9"],"Psalterium/Psalmorum/Psalm69#2-6":["69:2","69:3","69:4","69:4","69:5","69:6","69:6"],"Psalterium/Psalmorum/Psalm70#1-12":["70:1","70:2","70:3","70:3","70:4","70:5","70:6","70:7","70:8","70:9","70:10","70:11","70:12"],"Psalterium/Psalmorum/Psalm70#13-24":["70:13","70:14","70:15","70:16","70:17","70:18","70:18","70:19","70:20","70:21","70:22","70:23","70:24"],"Psalterium/Psalmorum/Psalm76#2-13":["76:2","76:3","76:4","76:5","76:6","76:7","76:8","76:9","76:10","76:11","76:12","76:13"],"Psalterium/Psalmorum/Psalm76#14-21":["76:14","76:15","76:17","76:18","76:18","76:19","76:20","76:21"],"Psalterium/Psalmorum/Psalm85#1-17":["85:1","85:2","85:3","85:5","85:6","85:7","85:8","85:9","85:10","85:11","85:12","85:13","85:14","85:15","85:16","85:17"]}).map(([key,labels])=>
  [key,Object.freeze(labels)]))
);
export const FERIAL_COMPLINE_PRINTED_PSALM_WITNESS=
 "Clementine Vulgate Project full-text witness; 2008 Diurnale and 2023 Psalterium weekday appointment";
export function projectFerialComplinePsalmFrame(frame){
 if(frame?.kind!=="PSALM"||
    !/^Psalterium\/Psalmorum\/Psalm(?:11|12|15|33|60|69|70|76|85)#/u.test(frame.sourceId||""))
  return frame;
 const labels=FERIAL_COMPLINE_SOURCE_LABELS[frame.sourceId];
 const index=frame.subIndex;
 if(!labels||!Number.isInteger(index)||index<0||index>=labels.length||
    frame.subTotal!==labels.length||frame.focusType!=="PSALM_VERSE"||
    !frame.texts?.la)return null;
 const prefixLabel=labels[index];
 const rendered={};
 for(const [language,lines] of Object.entries(frame.texts)){
  if(!["la","en","fr"].includes(language)||!Array.isArray(lines)||
     lines.length!==1||typeof lines[0]!=="string")return null;
  if(!lines[0].startsWith(prefixLabel+" "))return null;
  const clean=lines[0].slice(prefixLabel.length+1)
    // Parenthesized 4a/5a/etc are source-numbering cues, never words.
    .replace(/\s*\(\d+[ab]?\)\s*/gu," ")
    .replace(/\s{2,}/gu," ").trim();
  if(!clean||/\(\d+[ab]?\)/u.test(clean))return null;
  rendered[language]=Object.freeze([clean]);
 }
 return Object.freeze({
  ...frame,label:prefixLabel,texts:Object.freeze(rendered),
  sourceTexts:frame.texts,sourceVerseLabel:prefixLabel,
  printedVerseLabel:prefixLabel,sourceNumberingNormalized:true,
  originalSourceOnly:false,printConformed:true,
  printedPsalmWitness:FERIAL_COMPLINE_PRINTED_PSALM_WITNESS
 });
}


/** Original psalter Psalm 6/7 recitation stichs, independently compared
 * against the complete separate Clementine Vulgate transcription:
 * 337 normalized words, zero spelling or lexical discrepancies.
 * This does NOT certify 1961 Mame Psalter facsimile typography. */
const MONDAY_COMPLINE_SOURCE_LABELS=Object.freeze({
 "Psalterium/Psalmorum/Psalm6#2-11":Object.freeze([
  "6:2","6:3","6:4","6:5","6:6","6:7","6:8","6:9","6:10","6:11"]),
 "Psalterium/Psalmorum/Psalm7#2-10":Object.freeze([
  "7:2","7:3","7:4","7:5","7:6","7:7a","7:7b","7:8b","7:9b","7:10"]),
 "Psalterium/Psalmorum/Psalm7#11-18":Object.freeze([
  "7:11","7:12","7:13","7:14","7:15","7:16","7:17","7:18"])
});
export const MONDAY_COMPLINE_LATIN_WITNESS=
 "Pinned Divinum Officium Psalm 6/7; independent Clementine Vulgate Project, 337 exact words";
export function projectMondayComplinePsalmFrame(frame){
 if(frame?.kind!=="PSALM"||
    !/^Psalterium\/Psalmorum\/Psalm(?:6|7)#/u.test(frame.sourceId||""))
  return frame;
 const labels=MONDAY_COMPLINE_SOURCE_LABELS[frame.sourceId];
 const index=frame.subIndex;
 if(!labels||!Number.isInteger(index)||index<0||index>=labels.length||
    frame.subTotal!==labels.length||frame.focusType!=="PSALM_VERSE"||
    !frame.texts?.la)return null;
 const label=labels[index],texts={};
 for(const [language,rows] of Object.entries(frame.texts)){
  if(!["la","en","fr"].includes(language)||!Array.isArray(rows)||
     rows.length!==1||typeof rows[0]!=="string"||
     !rows[0].startsWith(label+" "))return null;
  const clear=rows[0].slice(label.length+1)
    .replace(/\s*\(\d+[ab]?\)\s*/gu," ").replace(/\s{2,}/gu," ").trim();
  if(!clear||/\(\d+[ab]?\)/u.test(clear))return null;
  texts[language]=Object.freeze([clear]);
 }
 return Object.freeze({...frame,label,texts:Object.freeze(texts),
  sourceTexts:frame.texts,sourceVerseLabel:label,printedVerseLabel:label,
  sourceNumberingNormalized:true,originalSourceOnly:false,
  printConformed:true,printedPsalmWitness:MONDAY_COMPLINE_LATIN_WITNESS});
}
