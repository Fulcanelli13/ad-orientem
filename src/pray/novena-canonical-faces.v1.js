/**
 * Keep canonical novena prayers readable without claiming absent historical
 * translations. This resolver never translates or alters an original text.
 * The requested language is a UI preference, not evidence of source language.
 */
const filled=value=>typeof value==="string"&&value.trim().length>0;

export function novenaCanonicalFaceV1(record,requested="en"){
 const preferred=requested==="fr"?"fr":"en";
 const actual=filled(record?.[preferred])?preferred:
   filled(record?.en)?"en":filled(record?.fr)?"fr":null;
 return Object.freeze({
  vernacular:actual?record[actual]:"",
  vernacularLanguage:actual,
  latin:filled(record?.la)?record.la:"",
  fallback:actual!==null&&actual!==preferred
 });
}
