// Shared source-first 1962 Mass-form oration projection.
// Narrow certified scope: one sourced II-class feast on a II-class Sunday.
// Never infer universal privileges from feast titles, colours or typography.
// 1960 General Rubrics 109-112 and Missal Rubrics 433-445:
// https://isidore.co/divinum/www/horas/Help/Rubrics/General%20Rubrics.html
// https://isidore.co/divinum/www/horas/Help/Rubrics/Missal1960%20rubrics.html

const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const GROUPS=["collects","secrets","postcommunions"];
const sourceText=row=>Boolean(row&&String(row.lat??row.la??"").trim()&&
  String(row.en??"").trim()&&String(row.fr??"").trim());
const array=value=>Array.isArray(value)?value:[];
function untouched(proper,reason){
  return Object.freeze({status:"UNVERIFIED",reason,proper});
}
function unwrap(proper){
  return proper?.data&&typeof proper.data==="object"?
    {data:proper.data,envelope:proper}: {data:proper,envelope:null};
}
function canonical(path){return String(path??"").trim().replace(/^\/+|\/+$/g,"").toLowerCase();}
function rowPath(row){return row?.prayerSourcePath??row?.path??null;}
function isCalendarMass(celebrationId){
  return [null,"","mass_of_day"].includes(celebrationId);
}
/**
 * Source-owned (rather than reader-owned) selection from an already resolved
 * 1962 day and its complete, ordered, trilingual Proper.
 * Other classes, extra commemorations, local and conventual variants remain
 * UNVERIFIED until their authoritative source classification is available.
 */
export function select1962CommemorationsForMassForm({
  proper,calendarResolution,form,celebrationId="mass_of_day",
  isConventual=false,observedSource=false,
}={}){
  const normalizedForm=String(form??"").toUpperCase();
  if(!FORMS.has(normalizedForm))return untouched(proper,"UNSUPPORTED_FORM");
  if(!isCalendarMass(celebrationId)||observedSource)return untouched(proper,"ALTERNATE_FORMULARY");
  if(isConventual!==false)return untouched(proper,"CONVENTUAL_RULES_NOT_VERIFIED");
  const {data,envelope}=unwrap(proper);
  const day=calendarResolution?.day,main=day?.main;
  if(!data||!main||calendarResolution?.status!=="ready"||!calendarResolution?.date)
    return untouched(proper,"SOURCE_DAY_UNAVAILABLE");
  if(String(data.sourcePath??envelope?.sourcePath??"").trim()==="")
    return untouched(proper,"PROPER_SOURCE_UNAVAILABLE");
  const comms=array(day.commemorations);
  if(comms.length===0)return untouched(proper,"NO_COMMEMORATIONS");
  // Under §111(b) a II-class Sunday allows an occurring II-class feast at
  // Low Mass. Under §111(a) this ordinary (non-privileged) commemoration is
  // omitted in a non-conventual Sung Mass. No inference is made for other days.
  const sunday=new Date(String(calendarResolution.date)+"T12:00:00Z").getUTCDay()===0;
  const only=comms[0],sources=array(data.calendarCommemorations).filter(x=>!x?.inseparable);
  const admissible=comms.length===1&&sources.length===1&&sunday&&
    Number(main.rank)===2&&Number(only.rank)===2&&
    /^tempora:[a-z0-9-]+-0:2:/i.test(String(main.id??""))&&
    /^sancti:/i.test(String(only.id??""))&&
    canonical(rowPath(sources[0]))===canonical(rowPath(only))&&
    !only.inseparable&&!only.privileged&&!sources[0].inseparable;
  if(!admissible)return untouched(proper,"RUBRICAL_CLASSIFICATION_PENDING");
  if(!GROUPS.every(key=>array(data[key]).length===2&&data[key].every(sourceText)))
    return untouched(proper,"ORATION_SOURCE_INCOMPLETE");
  const low=normalizedForm==="LOW";
  const applied=low?comms:[],omitted=low?[]:comms;
  const decision=Object.freeze({
    status:"CERTIFIED",source:"1962_PROPER_RESOLVER",form:normalizedForm,
    calendarCount:1,appliedCount:applied.length,
    scope:"II_CLASS_SUNDAY_SINGLE_II_CLASS_SANCTORAL_FEAST_NON_CONVENTUAL",
    authorities:Object.freeze(["1960_GENERAL_RUBRICS_109_111","1960_MISSAL_RUBRICS_434"]),
    mainId:String(main.id),commemorationId:String(only.id)
  });
  const selected=Object.freeze({...data,
    collects:Object.freeze((low?data.collects:data.collects.slice(0,1)).slice()),
    secrets:Object.freeze((low?data.secrets:data.secrets.slice(0,1)).slice()),
    postcommunions:Object.freeze((low?data.postcommunions:data.postcommunions.slice(0,1)).slice()),
    // Keep the complete Calendar inventory distinct from prayers at this Mass.
    appliedCommemorations:Object.freeze(applied.map(x=>Object.freeze({...x}))),
    omittedCommemorations:Object.freeze(omitted.map(x=>Object.freeze({...x}))),
    commemorationFormDecision:decision,
  });
  const result=envelope?Object.freeze({...envelope,data:selected}):selected;
  return Object.freeze({status:"CERTIFIED",reason:null,proper:result,decision});
}
