// Direct scans of the 1961 printed Solesmes witnesses for the 24 archived
// Gregorian Mass-participation excerpts. These are ORIGINAL SOURCE PLATES,
// not exported transcriptions and not evidence of note-by-note agreement.
// Verified against the source links on the matching GregoBase chant pages.
// One source may need multiple printed plates to show the whole formula.
export const PRINTED_PLATE_INDEX_SCHEMA="ao-mass-participation-1961-plate-index-v1";
const LU="https://gregobase.selapa.net/sources/3/";
const GR="https://gregobase.selapa.net/sources/2/";
const plate=(book,page,url)=>Object.freeze({book,page,url,
 printedWitness:true,noteByNoteCollation:"PENDING",publicScoreApproval:false});
const witness=(sourceId,plates)=>Object.freeze({
 sourceId,chantRecord:"https://gregobase.selapa.net/chant.php?id="+sourceId,
 plates:Object.freeze(plates),facsimileMatchesSourceIdentity:true,
 sourceNoteByNoteParity:"UNVERIFIED",publicScoreApproved:false});
export const PARTICIPATION_1961_PRINTED_PLATES=Object.freeze([
 witness(4449,[plate("Liber Usualis · Solesmes 1961","109",LU+"220.png")]),
 witness(4450,[plate("Liber Usualis · Solesmes 1961","109",LU+"220.png")]),
 witness(4487,[plate("Liber Usualis · Solesmes 1961","98",LU+"209.png")]),
 witness(4490,[plate("Liber Usualis · Solesmes 1961","106",LU+"217.png")]),
 witness(4491,[plate("Liber Usualis · Solesmes 1961","107",LU+"218.png")]),
 witness(7282,[plate("Liber Usualis · Solesmes 1961","110",LU+"221.png")]),
 witness(4327,[plate("Liber Usualis · Solesmes 1961","110",LU+"221.png")]),
 witness(961,[plate("Graduale Romanum · Solesmes 1961","29*",GR+"906.png")]),
 witness(749,[plate("Graduale Romanum · Solesmes 1961","64*",GR+"941.png")]),
 witness(2901,[
  plate("Liber Usualis · Solesmes 1961","39",LU+"150.png"),
  plate("Liber Usualis · Solesmes 1961","40",LU+"151.png")
 ]),
 witness(823,[
  plate("Graduale Romanum · Solesmes 1961","102*",GR+"979.png"),
  plate("Liber Usualis · Solesmes 1961","1815",LU+"2060.png")
 ])
]);
const map=new Map(PARTICIPATION_1961_PRINTED_PLATES.map(w=>[w.sourceId,w]));
if(map.size!==11)throw new Error("DUPLICATED_1961_PRINTED_SOURCE_RECORD");
export const printedPlatesForParticipationScore=(sourceId)=>map.get(Number(sourceId))??null;
