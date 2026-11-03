/**
 * Historical Novena proper text is source-owned, not translated by the reader.
 * A missing UI-locale witness must never conceal an existing EN/FR/LA original.
 * The English toggle applies only to an actual bilingual source pair.
 */
const filled=v=>typeof v==="string"&&v.trim().length>0;

export function novenaSourceWitnessFaceV1(input,requested="en",showEnglish=false){
 const source=typeof input==="string"?{en:input}:input&&typeof input==="object"?input:{};
 const preferred=requested==="fr"?"fr":"en";
 const en=filled(source.en),fr=filled(source.fr),la=filled(source.la);
 const canToggleEnglish=preferred==="fr"&&en&&fr;
 const language=canToggleEnglish&&showEnglish?"en":
  filled(source[preferred])?preferred:en?"en":fr?"fr":la?"la":null;
 return Object.freeze({
  text:language?source[language]:"",
  language,
  fallback:language!==null&&language!==preferred,
  requestedUnavailable:!filled(source[preferred]),
  canToggleEnglish
 });
}
