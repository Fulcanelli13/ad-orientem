/**
 * The five source-defined blocks of the Leonine prayers after Low Mass.
 * Source-owned text, not a new rite. Does not infer fulfillment, completion
 * or an obligation to recite it after Mass.
 */
export const LEONINE_SOURCE_BLOCKS=Object.freeze([
 Object.freeze({en:"Hail Mary · three times",fr:"Je vous salue Marie · trois fois"}),
 Object.freeze({en:"Salve Regina · response",fr:"Salve Regina · répons"}),
 Object.freeze({en:"Collect",fr:"Oraison"}),
 Object.freeze({en:"Prayer to Saint Michael",fr:"Prière à saint Michel"}),
 Object.freeze({en:"Most Sacred Heart",fr:"Sacré-Cœur de Jésus"})
]);
export function leonineSourceSections(value){
 const text=String(value??"");
 if(!text)return null;
 const blocks=text.split("\n----\n");
 if(blocks.length!==LEONINE_SOURCE_BLOCKS.length||blocks.some(x=>!x.trim()))
  return null; // fail closed if the canonical witness changes
 return Object.freeze(blocks.map((block,i)=>{
  // Display line units are source-owned; stanza and versicle punctuation are
  // not fabricated. Keep original raw block for exact reconstruction checks.
  const paragraphs=block.split(/\n+/).filter(x=>x.trim()).map(raw=>Object.freeze({
   text:raw,
   role:/^\s*℣\./.test(raw)?"versicle":/^\s*℟\./.test(raw)?"response":"prose"
  }));
  return Object.freeze({
   index:i,raw:block,label:LEONINE_SOURCE_BLOCKS[i],paragraphs:Object.freeze(paragraphs)
  });
 }));
}
