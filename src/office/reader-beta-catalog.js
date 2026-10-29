/**
 * Date/Hour navigation for the internal Divine Office beta.
 *
 * This is intentionally a TINY verified-offering register, not a generated
 * 8,760-slot catalogue or a new ordo. Each newly usable Hour is added only
 * after its source-first assembly and 1960 selection exist. The reader is
 * reusable across dates/Hours; unavailable dates never fall back to a
 * reconstructed Proper, Mass calendar, or Divinum Officium CGI output.
 */
export const OFFICE_BETA_CATALOG_SCHEMA="ao.office.beta-catalog.v1";
export const OFFICE_BETA_HOURS=Object.freeze([
 "MATINS","LAUDS","PRIME","TERCE","SEXT","NONE","VESPERS","COMPLINE"
]);
// Only two *research* assemblies for this date are currently implemented.
// This is NOT an approved, live, or published liturgical Office.
const ENTRIES=Object.freeze([
 Object.freeze({
  key:"advent-i-2026-first-vespers",
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  hour:"VESPERS",officePart:"FIRST",
  label:"First Vespers · First Sunday of Advent",
  assembly:"ADVENT_I_2026_SOURCE_FIRST",
  recitation:"SOLO",minister:"BELOW_DEACON",
  sourceRevision:"126a07f91ede04664108abb6fb20ace3f4de14b9",
  languages:Object.freeze(["la","en","fr"]),
  precedenceResearchOnly:true,completeHourCertified:false,
  translationsApproved:false,rightsApproved:false,
  publishable:false,published:false
 }),
 Object.freeze({
  key:"advent-i-2026-saturday-compline",
  civilDate:"2026-11-28",officeDate:"2026-11-28",
  hour:"COMPLINE",officePart:null,
  label:"Saturday Compline · Eve of Advent I",
  assembly:"SATURDAY_COMPLINE_2026_SOURCE_FIRST",
  recitation:"SOLO",minister:"BELOW_DEACON",
  sourceRevision:"126a07f91ede04664108abb6fb20ace3f4de14b9",
  languages:Object.freeze(["la","en","fr"]),
  precedenceResearchOnly:true,completeHourCertified:false,
  translationsApproved:false,rightsApproved:false,
  publishable:false,published:false
 })
]);
function validDate(s){
 if(typeof s!=="string"||!/^\d{4}-\d\d-\d\d$/u.test(s))return false;
 const t=new Date(s+"T12:00:00Z");
 return !Number.isNaN(t.getTime())&&t.toISOString().slice(0,10)===s;
}
function unavailable(reason,request){
 return Object.freeze({
  schema:OFFICE_BETA_CATALOG_SCHEMA,status:"NOT_AVAILABLE",
  reason,request,entry:null,canPreview:false,
  publicReaderEnabled:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
export function reviewOfficeBetaSelection({date,hour}={}){
 const request=Object.freeze({date,hour});
 if(!validDate(date)||!OFFICE_BETA_HOURS.includes(hour))
  return unavailable("INVALID_DATE_OR_CANONICAL_HOUR",request);
 const entry=ENTRIES.find(e=>e.civilDate===date&&e.hour===hour);
 if(!entry)return unavailable("DATE_HOUR_NOT_YET_IMPLEMENTED",request);
 if(entry.publishable!==false||entry.published!==false||
    entry.rightsApproved!==false||entry.completeHourCertified!==false||
    entry.translationsApproved!==false||entry.languages.length!==3)
  return unavailable("RESEARCH_ONLY_CANDIDATE_UNSAFE",request);
 return Object.freeze({
  schema:OFFICE_BETA_CATALOG_SCHEMA,
  status:"SOURCE_FIRST_RESEARCH_PREVIEW_AVAILABLE",
  request,entry,canPreview:true,
  publicReaderEnabled:false,completeHourCertified:false,
  rightsApproved:false,publishable:false,published:false
 });
}
export function officeBetaImplementedHours(){
 return Object.freeze(ENTRIES.map(e=>Object.freeze({
  key:e.key,civilDate:e.civilDate,officeDate:e.officeDate,
  hour:e.hour,officePart:e.officePart,label:e.label,
  status:"SOURCE_FIRST_RESEARCH_PREVIEW_ONLY",
  publishable:false,published:false
 })));
}
