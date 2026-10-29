/**
 * Universal Roman 1960 Office source KEY planner and narrowly scoped
 * metadata reader. Does not download, compose, store or publish Office text.
 *
 * A path proposal is NOT proof that the file exists. A parsed [Rank] value
 * is NOT a 1960 rank, RG91 table slot or Office appointment. Rubric-specific
 * repeated [Rank]/[Rule] variants may be lost in a flattened Map; therefore
 * all returned classifications stay unresolved until a condition-preserving
 * Office source parser and independent ordo supply the decision.
 */
import {buildLiturgicalYear} from "../calendar/liturgical-year.js";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const OFFICE_UNIVERSAL_KEY_SCHEMA="ao.office.universal-source-keys.v1";
export const OFFICE_SOURCE_DESCRIPTOR_SCHEMA="ao.office.source-descriptor.v1";
const DAY=/^\d{4}-\d{2}-\d{2}$/;
const SOURCE=/^(?:Sancti\/\d\d-\d\d|Tempora\/Adv[1-4]-[0-6])$/;
const toDate=s=>new Date(s+"T12:00:00Z");
const iso=d=>d.toISOString().slice(0,10);
const validDay=s=>typeof s==="string"&&DAY.test(s)&&!Number.isNaN(toDate(s).getTime())&&iso(toDate(s))===s;
const difference=(a,b)=>Math.round((toDate(b)-toDate(a))/86400000);
const padded=n=>String(n).padStart(2,"0");

export function planUniversalOfficeKeys(date){
 if(!validDay(date))throw Error("OFFICE_UNIVERSAL_DATE_INVALID");
 const year=Number(date.slice(0,4));
 const mmdd=date.slice(5);
 const leads=[Object.freeze({
  owner:"SANCTORAL_FIXED_DATE_RESEARCH_LEAD",path:"Sancti/"+mmdd,
  sourceExists:"NOT_CHECKED",officeAppointed:false,officeRankDetermined:false
 })];
 // Advent source keys follow the actual Sunday-based liturgical cycle,
 // never a direct month/day mapping. No claim that the proper should win
 // over a coincident feast or Christmas Vigil.
 const start=buildLiturgicalYear(year+"-12-24").start;
 if(date>=start&&date<=year+"-12-24"){
  const offset=difference(start,date),week=Math.floor(offset/7)+1,weekday=offset%7;
  if(week>=1&&week<=4){
   leads.push(Object.freeze({
    owner:"ADVENT_TEMPORAL_RESEARCH_LEAD",
    path:"Tempora/Adv"+week+"-"+weekday,
    sourceExists:"NOT_CHECKED",officeAppointed:false,
    officeRankDetermined:false
   }));
  }
 }
 return Object.freeze({
  schema:OFFICE_UNIVERSAL_KEY_SCHEMA,date,
  sourceRevision:DIVINUM_OFFICIUM_PIN,status:"SOURCE_PATH_LEADS_ONLY",
  officePrecedenceResolved:false,sourceTextsRead:false,downloads:0,
  keys:Object.freeze(leads)
 });
}
export function planUniversalOfficeKeysForYear(year){
 if(!Number.isInteger(year)||year<1900||year>2099)
  throw Error("OFFICE_UNIVERSAL_YEAR_INVALID");
 const days=[];
 for(let d=new Date(Date.UTC(year,0,1,12));d.getUTCFullYear()===year;
   d.setUTCDate(d.getUTCDate()+1))days.push(planUniversalOfficeKeys(iso(d)));
 const temporal=days.reduce((n,d)=>n+d.keys.filter(k=>k.owner==="ADVENT_TEMPORAL_RESEARCH_LEAD").length,0);
 return Object.freeze({
  schema:OFFICE_UNIVERSAL_KEY_SCHEMA,year,status:"SOURCE_PATH_LEADS_ONLY",
  totalDays:days.length,fixedSanctoralPathLeads:days.length,
  adventTemporalPathLeads:temporal,
  totalProposedSourcePaths:days.length+temporal,
  actualSourceFilesVerified:0,officeDaysIndependentlySelected:0,
  textsParsed:0,downloads:0,days:Object.freeze(days)
 });
}
function section(map,id){
 const lines=map.get(id);
 if(!Array.isArray(lines))return null;
 if(lines.some(line=>typeof line!=="string"))throw Error("OFFICE_DESCRIPTOR_SECTION_CORRUPT");
 return lines.map(x=>x.trim()).filter(Boolean);
}
function metadataText(lines,max){
 if(!lines?.length)return null;
 const value=lines.find(v=>!v.startsWith(";")&&!v.startsWith("("))??null;
 if(!value)return null;
 if(value.length>max||/[<>\u0000-\u001f]/u.test(value))
  throw Error("OFFICE_DESCRIPTOR_VALUE_INVALID");
 return value;
}
/**
 * Parse only metadata from the host's already parsed source-section Map.
 * Do NOT assume conditional rank alternatives were retained by that Map.
 * This output never contains a raw prayer, hymn, psalm or lesson.
 */
export function projectOfficeDescriptorMetadata({path,parsed}={}){
 if(typeof path!=="string"||!SOURCE.test(path)||!parsed||
  !(parsed.map instanceof Map)||parsed.sourceRevision!==DIVINUM_OFFICIUM_PIN||
  parsed.sourcePath!==path||parsed.language!=="la")
  throw Error("OFFICE_DESCRIPTOR_SOURCE_PROVENANCE_INVALID");
 const title=metadataText(section(parsed.map,"Officium"),160);
 const rank=section(parsed.map,"Rank");
 const rules=section(parsed.map,"Rule");
 // Some source files omit Officium (All Souls has [Rank] only).
 if(!title&&!rank?.length&&!rules?.length)
  throw Error("OFFICE_DESCRIPTOR_METADATA_MISSING");
 const rawRank=rank?.find(line=>line.includes(";;")&&!line.startsWith("("))??null;
 const rankColumns=rawRank?.split(";;").map(x=>x.trim())??[];
 const rankLabel=rankColumns[1]||null;
 if(rankLabel&&rankLabel.length>80)throw Error("OFFICE_DESCRIPTOR_RANK_LABEL_INVALID");
 const rawRules=rules??[];
 const possibleConditional=Boolean([...(rank??[]),...rawRules]
  .some(line=>/\(.*(?:rubrica|sed |nisi )/iu.test(line)));
 const sourceLabels=Object.freeze({
  title:title??null,
  rankLabel:rankLabel??null,
  rankSectionPresent:Boolean(rank?.length),
  ruleSectionPresent:Boolean(rawRules.length),
  ruleLineCount:rawRules.length,
  possibleConditionalRuleLines:possibleConditional
 });
 return Object.freeze({
  schema:OFFICE_SOURCE_DESCRIPTOR_SCHEMA,sourcePath:path,
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourceLanguage:"la",
  sourceMetadata:sourceLabels,sourceFileObserved:true,
  status:"PINNED_METADATA_OBSERVED_UNADJUDICATED",
  flattenedSectionsMayOmitConditionalVariants:true,
  numericRankNot1960Class:true,
  class:null,rg91TablePosition:null,hasFirstVespers:null,
  hasSecondVespers:null,officePrecedenceResolved:false,
  printedEditionCertified:false,translatedTextVerified:false,
  sourceRightsReviewed:false,publishable:false,published:false
 });
}
/**
 * Same host contract as Mass `resolveSource`; this is a bounded, user-driven
 * single-date metadata read only. It never loops over an annual corpus.
 */
export function createUniversalOfficeMetadataReader({hostResolver,maxDocuments=48}={}){
 if(typeof hostResolver?.resolveSource!=="function"||
    hostResolver.sourceRevision!==DIVINUM_OFFICIUM_PIN||
    !Number.isInteger(maxDocuments)||maxDocuments<1||maxDocuments>96)
  throw Error("OFFICE_DESCRIPTOR_PINNED_HOST_REQUIRED");
 const cache=new Map();
 async function readOne(path){
  if(!SOURCE.test(path))throw Error("OFFICE_DESCRIPTOR_PATH_INVALID");
  if(!cache.has(path)){
   const pending=Promise.resolve().then(()=>
     hostResolver.resolveSource(path,"la","office-metadata-only")).then(parsed=>{
      if(parsed?.sourceRevision!=null&&parsed.sourceRevision!==DIVINUM_OFFICIUM_PIN)
       throw Error("OFFICE_DESCRIPTOR_PIN_MISMATCH");
      if(parsed?.sourcePath!=null&&parsed.sourcePath!==path)
       throw Error("OFFICE_DESCRIPTOR_PATH_MISMATCH");
      if(parsed?.language!=null&&parsed.language!=="la")
       throw Error("OFFICE_DESCRIPTOR_LANGUAGE_MISMATCH");
      return projectOfficeDescriptorMetadata({path,parsed:{
       map:parsed?.map,sourceRevision:DIVINUM_OFFICIUM_PIN,
       sourcePath:path,language:"la"
      }});
     });
   cache.set(path,pending);
   if(cache.size>maxDocuments)cache.delete(cache.keys().next().value);
   pending.catch(()=>{if(cache.get(path)===pending)cache.delete(path)});
  }
  return cache.get(path);
 }
 async function readDate(date,{kind}={}){
  const keys=planUniversalOfficeKeys(date).keys;
  const lead=keys.find(k=>k.owner===kind);
  if(!lead)throw Error("OFFICE_DESCRIPTOR_KEY_NOT_IN_DATE");
  return readOne(lead.path);
 }
 return Object.freeze({
  readDate,readOne,cachedSourceCount:()=>cache.size,
  clearCache:()=>cache.clear()
 });
}
