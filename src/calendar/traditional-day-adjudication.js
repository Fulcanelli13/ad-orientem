// Source-bound advisory bridge for a *living traditional* Calendar.
// Never changes the 1962 resolver, Mass Proper, reader, ICS, or a celebrant's choice.
// Governing sources: 1960 General Rubrics §§92-114; 1962 RGMR §§356-361;
// Cum sanctissima (2020), nn. 1-8. See the adjacent adjudication matrix.
import { assessOptionalPost1960SaintCelebration } from "./optional-post1960-saint-review.js";

const DATE=/^\d{4}-\d{2}-\d{2}$/;
function validDate(value){
  return typeof value==="string"&&DATE.test(value)&&
    !Number.isNaN(Date.parse(value+"T12:00:00Z"))&&
    new Date(value+"T12:00:00Z").toISOString().slice(0,10)===value;
}
const witnessId=value=>typeof value==="string"&&/^[a-z][a-z0-9_-]*:[a-z0-9:-]+$/i.test(value)?value:null;
// Rank and colour suffixes encode a *resolved instance*, not another saint.
export const base1962Identity=value=>String(value||"").replace(/:[1-4]:[a-z]{1,3}$/i,"");
function commemorationSourceId(item){
  if(typeof item==="string")return witnessId(item);
  return witnessId(item?.id)||witnessId(item?.sourceId)||
    witnessId(item?.resolverIdentity)||null;
}

// Records may be supplied by different 1962 resolver adapters as strings
// or objects. Unlike visible *names*, date codes do not prove identity.
// Follow the resolver's precedence of collections: named resolved-day data
// first, then historical fallback. Never union unrelated source containers,
// since a lower-priority list may contain *candidates*, not actual observances.
// Retain string- and object-form source IDs; never infer from date codes/titles.
export function canonical1962Commemorations(resolution){
  const containers=[
    resolution?.day?.commemorations,
    resolution?.day?.main?.commemorations,
    resolution?.commemorations
  ];
  const values=containers
    .map(x=>Array.isArray(x)?x:x==null?[]:[x])
    .find(items=>items.some(item=>Boolean(commemorationSourceId(item))))||[];
  const out=[],seen=new Set();
  for(const item of values){
    const id=commemorationSourceId(item),key=base1962Identity(id);
    if(!id||seen.has(key))continue;
    seen.add(key);
    out.push(Object.freeze({sourceId:id,identity:key}));
  }
  return Object.freeze(out);
}

const decision=(status,reason,extra={})=>Object.freeze({
  status,reason,...extra,massInsertionAuthorized:false,changes1962Principal:false
});
function ordinalClass(value){
  if(Number.isInteger(value)&&value>=1&&value<=4)return value;
  const s=String(value||"").toUpperCase().trim();
  if(/^[1-4]$/.test(s))return Number(s);
  const m=s.match(/^(?:CLASS(?:IS)?\s*)?(IV|III|II|I)(?:\s*CLASS(?:IS)?)?$/);
  return m?({I:1,II:2,III:3,IV:4})[m[1]]:null;
}

// This checks numeric and categorical admissibility, NOT that an oration
// exists or the celebrant has chosen it. RG 111(a)-(d), 112-114.
export function reviewCommemorationAddition({
  dayClass,sunday=false,massForm="UNSPECIFIED",conventual=false,
  candidateKind="ORDINARY",candidateFeastClass=null,candidateId=null,
  existing=[]
}={}){
  const rank=ordinalClass(dayClass),kind=String(candidateKind||"").toUpperCase();
  if(!rank||!["PRIVILEGED","ORDINARY"].includes(kind))
    return decision("INDETERMINATE","DAY_CLASS_OR_COMMEMORATION_KIND_UNVERIFIED");
  const normalized=Array.isArray(existing)?existing:[];
  const identity=base1962Identity(candidateId);
  if(identity&&normalized.some(x=>base1962Identity(typeof x==="string"?x:x?.id||x?.sourceId)===identity))
    return decision("ALREADY_PRESENT","SAME_IDENTITY_MUST_NOT_BE_COMMEMORATED_TWICE");
  // RG 111(a) also restricts non-conventual sung Masses, irrespective of rank.
  const sungNonconventual=massForm==="SUNG"&&!conventual;
  if((rank===1||sungNonconventual)&&kind!=="PRIVILEGED")
    return decision("BLOCKED","RG_111A_RESTRICTS_TO_PRIVILEGED");
  if(rank===1||sungNonconventual)
    return decision("REVIEW_REQUIRED","PRIVILEGED_ONLY_OTHER_RUBRICS_AND_PRECEDENCE_APPLY",{source:"RG_111A"});
  const privileged=normalized.some(x=>typeof x==="object"&&x?.kind==="PRIVILEGED");
  if(rank===2&&sunday){
    if(kind==="ORDINARY"&&ordinalClass(candidateFeastClass)!==2)
      return decision("BLOCKED","RG_111B_SUNDAY_REQUIRES_SECOND_CLASS_FEAST");
    if(kind==="ORDINARY"&&privileged)
      return decision("BLOCKED","RG_111B_PRIVILEGED_TAKES_PRIORITY");
    if(normalized.length)
      return decision("REVIEW_REQUIRED","RG_111B_ONE_ONLY_PRECEDENCE_MUST_BE_RESOLVED",{maxCommemorations:1});
    return decision("REVIEW_REQUIRED","RG_111B_WITHIN_CATEGORY_NOT_AUTOMATIC",{maxCommemorations:1});
  }
  const max=rank===2?1:2;
  if(normalized.length>=max)
    return decision("BLOCKED","RG_111_MAXIMUM_ALREADY_REACHED",{maxCommemorations:max});
  return decision("REVIEW_REQUIRED",rank===2?"RG_111C_REQUIRES_PROPER_AND_PRECEDENCE":"RG_111D_REQUIRES_PROPER_AND_PRECEDENCE",{maxCommemorations:max});
}

// Reuse the existing Cum sanctissima evaluator instead of inventing
// a second proper/rank engine. Its positive result remains advisory.
export function reviewNewSaintMassChoice({
  date,saint,observedDay,protectedFeasts,sourceObservance=null
}={}){
  // Production resolver returns {day:{main,...}}, whereas the original
  // evaluator consumes {main,...}. The compact source-read model separately
  // retains the Vatican date source but omits pilot.observances: join only
  // an exact source-certified Vatican General Calendar witness.
  const normalizedDay=observedDay?.day?.main?observedDay.day:observedDay;
  const observed=
    sourceObservance?.subjectId===saint?.id &&
    sourceObservance.authorityScope==="GENERAL_ROMAN_VATICAN_DECREE" &&
    sourceObservance.universalStatus==="CERTIFIED_BY_DECREE" &&
    sourceObservance.monthDay===String(date||"").slice(5) &&
    /^https:\/\/(?:www|press)\.vatican\.va\//.test(sourceObservance.sourceUrl||"") &&
    /^\d{4}-\d{2}-\d{2}$/.test(sourceObservance.publishedOn||"") &&
    sourceObservance.publishedOn<=date
      ? {calendar:"CURRENT_ROMAN_GENERAL",monthDay:sourceObservance.monthDay,
          sourceIds:[sourceObservance.sourceUrl],publishedOn:sourceObservance.publishedOn}
      : null;
  const reviewSaint=observed
    ? {...saint,observances:[...(saint?.observances||[]),observed]}
    : saint;
  const evaluation=assessOptionalPost1960SaintCelebration({
    date,saint:reviewSaint,observedDay:normalizedDay,protectedFeasts
  });
  return Object.freeze({...evaluation,
    candidateOnly:evaluation.status==="CANDIDATE_NEEDS_AUTHORITY_AND_RUBRICAL_REVIEW",
    original1962PrincipalId:observedDay?.day?.main?.id||observedDay?.main?.id||observedDay?.id||null,
    omittedHistoricalFeastCommemoration:"REQUIRES_SOURCE_AND_PRAYER_REVIEW",
    selectedFormularyId:null,changes1962Principal:false,
    massInsertionAuthorized:false
  });
}

// External solemnities are distinct from a Sunday Mass commemoration.
// RGMR 356-361 as amended in 1962; requires exact source, date and scope.
export function reviewExternalSolemnity({
  feastDate,targetDate,targetDayClass,basis=null,sourceUrl=null,
  localityId=null,ordinaryAssignedDate=false
}={}){
  if(!validDate(feastDate)||!validDate(targetDate))
    return decision("INDETERMINATE","SOURCE_DATES_REQUIRED");
  const dayClass=ordinalClass(targetDayClass);
  if(!dayClass)return decision("INDETERMINATE","TARGET_DAY_CLASS_UNVERIFIED");
  if(dayClass===1)return decision("BLOCKED","EXTERNAL_SOLEMNITY_MASS_NOT_ON_CLASS_I_DAY");
  const lawfulKinds=new Set(["SACRED_HEART","ROSARY","PRINCIPAL_PATRON","CHURCH_DEDICATION",
    "CHURCH_TITULAR","RELIGIOUS_FOUNDER","LOCAL_ORDINARY_POPULAR_CELEBRATION","SPECIAL_INDULT"]);
  if(!lawfulKinds.has(basis)||!/^https:\/\//.test(String(sourceUrl||"")))
    return decision("UNVERIFIED","ENTITLEMENT_BY_LAW_OR_INDULT_NOT_ESTABLISHED");
  if(["PRINCIPAL_PATRON","CHURCH_DEDICATION","CHURCH_TITULAR",
    "RELIGIOUS_FOUNDER","LOCAL_ORDINARY_POPULAR_CELEBRATION","SPECIAL_INDULT"].includes(basis)&&!localityId)
    return decision("UNVERIFIED","PARTICULAR_JURISDICTION_NOT_IDENTIFIED");
  if(basis==="LOCAL_ORDINARY_POPULAR_CELEBRATION"&&!ordinaryAssignedDate)
    return decision("UNVERIFIED","LOCAL_ORDINARY_DETERMINATION_REQUIRED");
  const target=new Date(targetDate+"T12:00:00Z");
  const sunday=target.getUTCDay()===0;
  const delta=Math.round((Date.parse(targetDate+"T12:00:00Z")-Date.parse(feastDate+"T12:00:00Z"))/86400000);
  if(basis==="ROSARY"&&!(sunday&&targetDate.slice(5)>="10-01"&&targetDate.slice(5)<="10-07"))
    return decision("BLOCKED","ROSARY_EXTERNAL_SOLEMNITY_FIRST_SUNDAY_OCTOBER");
  if(basis!=="ROSARY"&&!ordinaryAssignedDate&&basis!=="SPECIAL_INDULT"&&
     !(feastDate===targetDate||(sunday&&Math.abs(delta)<=6)))
    return decision("UNVERIFIED","SUNDAY_NOT_IMMEDIATELY_ADJACENT_TO_FEAST");
  return decision("REVIEW_REQUIRED","RGMR_356_361_EXTERNAL_SOLEMNITY_NOT_SUNDAY_COMMEMORATION",{
    category:"POSSIBLE_VOTIVE_SECOND_CLASS_MASS",sourceUrl,localityId,
    massCountAndDayRestrictionsStillApply:true
  });
}

// One canonical identity per person/group across visible layers. A separate
// modern date remains an association, never a *second 1962* observance.
// Crosswalk is explicit; never infer identities from matching vernacular names.
export function reconcileHonouredToday({
  resolution,secondaryCards=[],particularObservances=[],canonicalPersonForSourceId={}
}={}){
  const principalId=resolution?.day?.main?.id||resolution?.main?.id||null;
  const commemorations=canonical1962Commemorations(resolution);
  const sourceIds=[principalId,...commemorations.map(x=>x.sourceId)].filter(Boolean);
  const already=new Set(sourceIds.map(x=>canonicalPersonForSourceId[x]||
    canonicalPersonForSourceId[base1962Identity(x)]).filter(Boolean));
  const cards=[],duplicates=[];
  for(const card of [...secondaryCards,...particularObservances]){
    const id=card?.id||card?.subjectId||null;
    if(!id)continue;
    if(already.has(id)){duplicates.push(id);continue}
    already.add(id);
    cards.push(Object.freeze({...card,calendarAuthority:card?.calendarAuthority||"SUPPLEMENTARY_NOT_MASS_INSTRUCTION"}));
  }
  return Object.freeze({
    principalSourceId:principalId,commemorations,
    supplementaryHonours:Object.freeze(cards),
    suppressedDuplicatePersonIds:Object.freeze(duplicates),
    massReaderUnchanged:true,
    validation:"IDENTITY_CROSSWALK_REQUIRED_FOR_COMPLETE_DEDUPLICATION"
  });
}
