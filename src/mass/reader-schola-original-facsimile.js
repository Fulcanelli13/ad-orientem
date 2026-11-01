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
  ["https://gregobase.selapa.net/sources/2/908.png"],33)
]);
const byKey=new Map(catalogue.map(x=>[x.movement+"|"+x.selection,x]));
export const SCHOLA_1961_ORIGINAL_FACSIMILE_COUNT=catalogue.length;
export function schola1961OriginalFacsimile(movement,explicitSettingId){
  if(typeof movement!=="string"||typeof explicitSettingId!=="string")return null;
  return byKey.get(movement+"|"+explicitSettingId)??null;
}
