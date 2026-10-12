// Shared source-first 1962 Mass-form oration projection.
// Certified scope: source-identified single II-class Sunday feast and privileged Sunday / Advent feria.
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
 * Privileged classes follow 1960 General Rubrics §§108, 111(a), 113
 * and Missal §434(a). The resolved source owns the identity and ranks.
 * Do not equate the Mission Sunday §453 prayer under one conclusion with
 * an ordinary Calendar commemoration.
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
  const sunday=new Date(String(calendarResolution.date)+"T12:00:00Z").getUTCDay()===0;
  const only=comms[0],sources=array(data.calendarCommemorations).filter(x=>!x?.inseparable);
  // Calendar identity is the named weekday path, NOT necessarily its
  // prayer text's inherited Sunday template (e.g. Advent Adv1-1 / Adv1-0).
  // Require the actual observance paths to match before considering aliases.
  const namedSource=sources[0]??null;
  const observedPath=canonical(only?.path);
  const prayerPath=canonical(namedSource?.prayerSourcePath??namedSource?.path);
  const inSeasonAlias=/^tempora\/adv[1-4]-[1-6]$/.test(observedPath)&&
    prayerPath===observedPath.replace(/-[1-6]$/,"-0");
  const admissiblePrayerSource=prayerPath===observedPath||inSeasonAlias;
  const identified=comms.length===1&&sources.length===1&&
    canonical(namedSource.path)===observedPath&&admissiblePrayerSource&&
    canonical(data.sourcePath??envelope?.sourcePath)===canonical(main.path)&&
    !only.inseparable&&!namedSource.inseparable;
  if(!identified)return untouched(proper,"RUBRICAL_CLASSIFICATION_PENDING");
  const mainId=String(main.id??""),commId=String(only.id??"");
  const ordinarySunday=sunday&&Number(main.rank)===2&&Number(only.rank)===2&&
    /^tempora:[a-z0-9-]+-0:2:/i.test(mainId)&&
    /^sancti:/i.test(commId)&&!only.privileged;
  // §108(a): an impeded Sunday is privileged in every Mass form; the
  // principal universal I-class feast keeps its own source identity.
  const privilegedSunday=sunday&&Number(main.rank)===1&&Number(only.rank)===2&&
    /^sancti:[0-9]{2}-[0-9]{2}:1:/i.test(mainId)&&
    /^tempora:[a-z0-9-]+-0:2:/i.test(commId)&&
    /^Tempora\/[A-Za-z0-9]+-0$/i.test(String(only.path??""));
  // §108(e): a displaced Advent feria is privileged even in Sung Mass.
  // The prayerSourcePath may be the canonical Sunday-template alias but
  // the actual commemoration PATH must identify the named weekday.
  const privilegedAdvent=/^sancti:[0-9]{2}-[0-9]{2}:[12]:/i.test(mainId)&&
    [1,2].includes(Number(main.rank))&&Number(only.rank)===3&&
    /^tempora:Adv[1-4]-[1-6]:3:/i.test(commId)&&
    /^Tempora\/Adv[1-4]-[1-6]$/i.test(String(only.path??""));
  const scope=privilegedSunday?"PRIVILEGED_SUNDAY_UNDER_I_CLASS_SANCTORAL":
    privilegedAdvent?"PRIVILEGED_ADVENT_FERIA_UNDER_SANCTORAL":
    ordinarySunday?"II_CLASS_SUNDAY_SINGLE_II_CLASS_SANCTORAL_FEAST_NON_CONVENTUAL":null;
  if(!scope)return untouched(proper,"RUBRICAL_CLASSIFICATION_PENDING");
  if(!GROUPS.every(key=>array(data[key]).length===2&&data[key].every(sourceText)))
    return untouched(proper,"ORATION_SOURCE_INCOMPLETE");
  const include=privilegedSunday||privilegedAdvent||normalizedForm==="LOW";
  const applied=include?comms:[],omitted=include?[]:comms;
  const decision=Object.freeze({
    status:"CERTIFIED",source:"1962_PROPER_RESOLVER",form:normalizedForm,
    calendarCount:1,appliedCount:applied.length,
    scope,
    authorities:Object.freeze(["1960_GENERAL_RUBRICS_108_111_113","1960_MISSAL_RUBRICS_433_434"]),
    mainId,commemorationId:commId
  });
  const selected=Object.freeze({...data,
    collects:Object.freeze((include?data.collects:data.collects.slice(0,1)).slice()),
    secrets:Object.freeze((include?data.secrets:data.secrets.slice(0,1)).slice()),
    postcommunions:Object.freeze((include?data.postcommunions:data.postcommunions.slice(0,1)).slice()),
    // Keep the complete Calendar inventory distinct from prayers at this Mass.
    appliedCommemorations:Object.freeze(applied.map(x=>Object.freeze({...x}))),
    omittedCommemorations:Object.freeze(omitted.map(x=>Object.freeze({...x}))),
    commemorationFormDecision:decision,
  });
  const result=envelope?Object.freeze({...envelope,data:selected}):selected;
  return Object.freeze({status:"CERTIFIED",reason:null,proper:result,decision});
}
