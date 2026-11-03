/**
 * Resolve the actual source-language face of a prayer without translating it.
 * Used by direct Prayer cards and the Novena's reused canonical prayers.
 * The application's requested locale must not be mistaken for provenance.
 */
const filled=value=>typeof value==="string"&&value.trim().length>0;

export function prayerSourceFacesV1(record,requested="en"){
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
