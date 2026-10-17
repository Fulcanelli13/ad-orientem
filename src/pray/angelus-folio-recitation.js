/**
 * Presentation-only division of canonical Marian prayer text for communal
 * recitation. No source text is retranslated or silently completed here.
 * A missing recognised division fails closed to the original continuous text.
 */
export const ANGELUS_FOLIO_RECITATION_VERSION="angelus-folio-recitation-v1";

export function angelusCommunalParts(text,kind="hail"){
 const original=String(text??"").trim();
 if(!original)return null;
 // Traditional response begins at Sancta Maria / Holy Mary / Sainte Marie.
 const halves=kind==="hail"
  ? original.match(/^([\s\S]*?\b(?:Jesus|Iesus|Jésus|Jésus-Christ)[.!]?)(\s+)(Holy Mary|Sancta Maria|Sainte Marie|Sainte-Marie)([\s\S]*)$/i)
  : kind==="doxology"
  ? original.match(/^([\s\S]*?\b(?:Holy Spirit|Spiritui Sancto|Saint-Esprit)[.,]?)(\s+)(As it was|Sicut erat|comme il était|comme il est)([\s\S]*)$/i)
  : null;
 if(halves)return Object.freeze([
  Object.freeze({role:"leader",text:halves[1].trim()}),
  Object.freeze({role:"response",text:(halves[3]+halves[4]).trim()})
 ]);
 if(kind==="collect"){
  const amen=original.match(/^([\s\S]+?)\s+(Amen\.|Ainsi soit-il\.)$/i);
  if(amen)return Object.freeze([
   Object.freeze({role:"leader",text:amen[1].trim()}),
   Object.freeze({role:"response",text:amen[2].trim()})
  ]);
 }
 return null;
}
export function stripGloriaRepetition(text){
 return String(text??"").replace(/\s*\((?:three times|trois fois|ter)\)\s*$/i,"").trim();
}
