// Public original-print REFERENCES, not unverified digital GABC scores.
// These are literal, external 1961 Solesmes printed-source page images,
// shown only for an explicitly selected Kyriale setting in a LOCAL music plan.
// No source is inferred from the day, Mass card, or observed Schola singing.
const PDF="https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf";
const source=(movement,selection,title,pages,images,pdfPage)=>Object.freeze({
  movement,selection,title,
  edition:"Graduale Romanum · Solesmes 1961",printedPages:Object.freeze(pages),
  originalPageImages:Object.freeze(images),
  originalEditionPdf:PDF+"#page="+pdfPage,
  status:"ORIGINAL_PRINT_FACSIMILE_REFERENCE",
  inferredFromCalendar:false,observedParishPerformance:false,
  gabcMusicallyCertified:false,audioApproved:false
});
const catalogue=Object.freeze([
 source("KYRIE","MASS_16","Kyrie XVI",["54*"],["https://gregobase.selapa.net/sources/2/931.png"],56),
 source("KYRIE","MASS_11","Kyrie XI · Orbis factor",["38*","39*"],
  ["https://gregobase.selapa.net/sources/2/915.png","https://gregobase.selapa.net/sources/2/916.png"],40),
 source("KYRIE","MASS_08","Kyrie VIII · De Angelis",["28*","29*"],
  ["https://gregobase.selapa.net/sources/2/905.png","https://gregobase.selapa.net/sources/2/906.png"],30),
 source("GLORIA","MASS_08","Gloria VIII",["29*","30*"],
  ["https://gregobase.selapa.net/sources/2/906.png","https://gregobase.selapa.net/sources/2/907.png"],31),
 source("CREDO","CREDO_03","Credo III",["64*","65*","66*"],
  ["https://gregobase.selapa.net/sources/2/941.png","https://gregobase.selapa.net/sources/2/942.png","https://gregobase.selapa.net/sources/2/943.png"],66),
 source("SANCTUS_BENEDICTUS","MASS_08","Sanctus VIII · Benedictus",["30*","31*"],
  ["https://gregobase.selapa.net/sources/2/907.png","https://gregobase.selapa.net/sources/2/908.png"],32),
 source("AGNUS_DEI","MASS_08","Agnus Dei VIII",["31*"],
  ["https://gregobase.selapa.net/sources/2/908.png"],33),
 // Additional GABC research references: source scans are historical printed
 // Solesmes 1961 folios, not approval of the corresponding transcription.
 source("KYRIE","MASS_17","Kyrie XVII",["55*"],
  ["https://gregobase.selapa.net/sources/2/932.png"],57),
 source("KYRIE","MASS_18","Kyrie XVIII",["57*"],
  ["https://gregobase.selapa.net/sources/2/934.png"],59),
 source("GLORIA","MASS_11","Gloria XI",["39*","40*"],
  ["https://gregobase.selapa.net/sources/2/916.png",
   "https://gregobase.selapa.net/sources/2/917.png"],41),
 source("SANCTUS_BENEDICTUS","MASS_11","Sanctus XI · Benedictus",["40*","41*"],
  ["https://gregobase.selapa.net/sources/2/917.png",
   "https://gregobase.selapa.net/sources/2/918.png"],42),
 source("AGNUS_DEI","MASS_11","Agnus Dei XI",["41*"],
  ["https://gregobase.selapa.net/sources/2/918.png"],43),
 // Eight new explicit local selections, linked to complete 1961 printed
 // page spans (not edited, engraved or certified printed note by note).
 source("KYRIE","MASS_01","Kyrie I · Lux et origo",["4*","5*"],
  ["https://gregobase.selapa.net/sources/2/881.png",
   "https://gregobase.selapa.net/sources/2/882.png"],6),
 source("GLORIA","MASS_01","Gloria I",["5*","6*"],
  ["https://gregobase.selapa.net/sources/2/882.png",
   "https://gregobase.selapa.net/sources/2/883.png"],7),
 source("SANCTUS_BENEDICTUS","MASS_01","Sanctus I · Benedictus",["6*","7*"],
  ["https://gregobase.selapa.net/sources/2/883.png",
   "https://gregobase.selapa.net/sources/2/884.png"],8),
 source("AGNUS_DEI","MASS_01","Agnus Dei I",["7*"],
  ["https://gregobase.selapa.net/sources/2/884.png"],9),
 source("SANCTUS_BENEDICTUS","MASS_17","Sanctus XVII · Benedictus",["56*"],
  ["https://gregobase.selapa.net/sources/2/933.png"],58),
 source("AGNUS_DEI","MASS_17","Agnus Dei XVII",["57*"],
  ["https://gregobase.selapa.net/sources/2/934.png"],59),
 source("SANCTUS_BENEDICTUS","MASS_18","Sanctus XVIII · Benedictus",["58*"],
  ["https://gregobase.selapa.net/sources/2/935.png"],60),
 source("AGNUS_DEI","MASS_18","Agnus Dei XVIII",["58*"],
  ["https://gregobase.selapa.net/sources/2/935.png"],60)
]);
const byKey=new Map(catalogue.map(x=>[x.movement+"|"+x.selection,x]));
export const SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT=catalogue.length;
export function schola1961OriginalFacsimile(movement,explicitSettingId){
  if(typeof movement!=="string"||typeof explicitSettingId!=="string")return null;
  return byKey.get(movement+"|"+explicitSettingId)??null;
}
