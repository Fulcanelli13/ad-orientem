/**
 * F11 sung Benedictio text. The existing canonical data owns every word,
 * language, edition and source citation. This module only aligns already
 * attested two-stanza O Salutaris and Tantum Ergo texts for reading.
 * Never create a Latin hymn from a vernacular source or vice versa.
 */
export const F11_SUNG_HYMNS=Object.freeze({
 benediction_o_salutaris:Object.freeze({linesPerStanza:4}),
 benediction_tantum_ergo:Object.freeze({linesPerStanza:6})
});
export function benedictionSungStanzas(id,latin,vernacular){
 const config=F11_SUNG_HYMNS[id];
 if(!config||typeof latin!=="string"||typeof vernacular!=="string"||!latin.trim()||!vernacular.trim())return null;
 function two(source){
  const blank=source.indexOf("\n\n");
  if(blank>=0){
   const a=source.slice(0,blank),b=source.slice(blank+2);
   if(a.trim()&&b.trim())return Object.freeze([a,b]);
   return null;
  }
  const lines=source.split("\n");
  if(lines.length!==2*config.linesPerStanza)return null;
  const boundary=lines.slice(0,config.linesPerStanza).join("\n").length;
  return Object.freeze([source.slice(0,boundary),source.slice(boundary+1)]);
 }
 const la=two(latin),v=two(vernacular);
 if(!la||!v)return null;
 return Object.freeze([0,1].map(i=>Object.freeze({
  index:i,latin:la[i],vernacular:v[i]
 })));
}
