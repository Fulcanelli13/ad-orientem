// The ICRSP France 8 November 2026 Sunday Ordo explicitly orders "Or. pro Papa".
// Keep the general Roman 1962 Sunday Proper (one oration in each group) unchanged.
// Add the separately sourced papal oration only after an explicit institute choice.
// https://icrspfrance.fr/ordo.php?d=2026-11-08#j2026-11-08
import {icrspFranceOrdoForDate} from "../calendar/icrsp-france-ordo-evidence.js";
import {ICRSP_NOV06_PRO_PAPA_SOURCE} from "./icrsp-nov06-pro-papa-orations.js";

const DATE="2026-11-08";
const PRINCIPAL="tempora:Epi5-0:2:g";
const PATH="Tempora/Epi5-0";
const FORM="LOW";
const GROUPS=Object.freeze(["collects","secrets","postcommunions"]);
const SINGLE=Object.freeze({collects:"collect",secrets:"secret",postcommunions:"postcommunion"});
const selectedByHost=new WeakMap();
const hold=(proper,reason)=>Object.freeze({status:"UNVERIFIED",reason,proper});
const complete=row=>row&&["lat","en","fr"].every(k=>
 typeof row[k]==="string"&&row[k].trim());
const inputProper=p=>p?.data&&typeof p.data==="object"?p.data:p;
const dateOrdo=()=>icrspFranceOrdoForDate(DATE);
export function icrspNov08SundaySourceAttested(){
 const o=dateOrdo(),m=o?.mass;
 return o?.date===DATE&&o?.scope==="ICRSP_FRANCE_PARTICULAR_ORDO"&&
   o?.status==="SOURCE_ATTESTED"&&m?.kind==="SUNDAY"&&m?.principalId===PRINCIPAL&&
   m?.properPath===PATH&&m?.introit==="Dicit Dominus"&&m?.class===2&&
   m?.colour==="GREEN"&&m?.gloria===true&&m?.credo===true&&
   m?.prayerForPope===true&&m?.preface?.en==="Holy Trinity";
}
export function selectIcrspNov08SundayMass({win=globalThis,dateIso}={}){
 const state=win?.AO_RUNTIME_V8?.store?.getState?.();
 const r=state?.resolution,host=win?.AO_CELEBRATION_API?.getResolvedMass?.();
 const api=win?.AO_CELEBRATION_API,bridge=win?.AO_R17_BROWSER_ENTRY;
 if(dateIso!==DATE||state?.selectedDate!==DATE||r?.date!==DATE||
    !icrspNov08SundaySourceAttested()||r?.status!=="ready"||
    r?.day?.main?.id!==PRINCIPAL||r?.proper?.data?.sourcePath!==PATH||
    host?.date!==DATE)
   return Object.freeze({ok:false,reason:"ICRSP_SUNDAY_SOURCE_OR_DATE_UNVERIFIED"});
 if(typeof api?.select!=="function"||typeof bridge?.selectTodayOption!=="function")
   return Object.freeze({ok:false,reason:"ICRSP_SUNDAY_MASS_OWNER_UNAVAILABLE"});
 selectedByHost.delete(win);
 api.select("mass_of_day");
 const a=win?.AO_CELEBRATION_ARCH_V1;
 if(a?.actualCelebration?.id!=="mass_of_day"&&
    win?.AO_CELEBRATION_API?.getResolvedMass?.()?.celebrationId!=="mass_of_day")
   return Object.freeze({ok:false,reason:"GENERAL_SUNDAY_MASS_NOT_SELECTED"});
 if(bridge.selectTodayOption("form",FORM)!==true)
   return Object.freeze({ok:false,reason:"LOW_MASS_FORM_NOT_ACCEPTED"});
 selectedByHost.set(win,Object.freeze({date:DATE,path:PATH,principal:PRINCIPAL,form:FORM}));
 return Object.freeze({ok:true,date:DATE,form:FORM,path:PATH,
  extraPrayer:"ORATIO_PRO_PAPA",sourceOrdo:dateOrdo().sourceOrdo});
}
export function isExplicitIcrspNov08SundaySelection({win=globalThis,dateIso}={}){
 const selected=win&&typeof win==="object"?selectedByHost.get(win):null;
 const state=win?.AO_RUNTIME_V8?.store?.getState?.();
 const a=win?.AO_CELEBRATION_ARCH_V1;
 const mass=win?.AO_CELEBRATION_API?.getResolvedMass?.();
 return Boolean(selected&&dateIso===DATE&&state?.selectedDate===DATE&&
  state?.resolution?.day?.main?.id===PRINCIPAL&&
  state?.resolution?.proper?.data?.sourcePath===PATH&&
  mass?.date===DATE&&mass?.celebrationId==="mass_of_day"&&
  (!a?.actualCelebration||a.actualCelebration.id==="mass_of_day"));
}
export function projectIcrspNov08SundayProPapaOrations({
 proper,date,form,actualCelebrationId,votiveBasis,explicitInstituteSelection=false
}={}){
 if(explicitInstituteSelection!==true)
  return Object.freeze({status:"NOT_APPLICABLE",proper});
 if(!icrspNov08SundaySourceAttested()||date!==DATE)
  return hold(proper,"ICRSP_SUNDAY_ORDO_OR_DATE_MISSING");
 if(form!==FORM||![null,"mass_of_day"].includes(actualCelebrationId)||
    votiveBasis!=null)
  return hold(proper,"ICRSP_SUNDAY_SELECTED_FORM_OR_KIND_CHANGED");
 const envelope=proper?.data&&typeof proper.data==="object"?proper:null;
 const data=inputProper(proper);
 if(data?.sourcePath!==PATH||data?.principalCelebrationId&&
    data.principalCelebrationId!==PRINCIPAL)
  return hold(proper,"ICRSP_SUNDAY_PRINCIPAL_SOURCE_MISMATCH");
 const originals={};
 for(const key of GROUPS){
  const entries=Array.isArray(data?.[key])?data[key]:
    data?.[SINGLE[key]]?[data[SINGLE[key]]]:[];
  if(entries.length!==1||!complete(entries[0]))
   return hold(proper,"ONE_COMPLETE_SUNDAY_PRAYER_PER_GROUP_REQUIRED_"+key);
  originals[key]=entries[0];
 }
 const contract=Object.freeze({
  id:"ICRSP_FRANCE_2026-11-08_SUNDAY_PRO_PAPA",date:DATE,form:FORM,
  celebrationId:"mass_of_day",votiveBasis:null,sourcePath:PATH,
  sourceOrdo:dateOrdo().sourceOrdo,sourceScope:dateOrdo().scope,
  universalPrescription:false,
  orations:Object.freeze(Object.fromEntries(GROUPS.map(key=>[key,
   Object.freeze([Object.freeze({purpose:"PRINCIPAL"}),
    Object.freeze({sourcePath:ICRSP_NOV06_PRO_PAPA_SOURCE.prayerPath,
     purpose:"ORATIO_PRO_PAPA",text:ICRSP_NOV06_PRO_PAPA_SOURCE.prayers[key]})])])))
 });
 const additions=Object.fromEntries(GROUPS.map(key=>[key,Object.freeze([
  originals[key],Object.freeze({
   ...ICRSP_NOV06_PRO_PAPA_SOURCE.prayers[key],
   sourcePath:ICRSP_NOV06_PRO_PAPA_SOURCE.prayerPath,
   liturgicalPurpose:"ORATIO_PRO_PAPA",date:DATE
  })
 ])]));
 const decision=Object.freeze({
  status:"SOURCE_ATTESTED",scope:dateOrdo().scope,date:DATE,form:FORM,
  principal:PATH,sourceOrdo:contract.sourceOrdo,
  additionalPrayer:"PRO_PAPA",groupCounts:Object.freeze({
   collects:2,secrets:2,postcommunions:2
  }),notCalendarCommemoration:true,notUniversalSelection:true
 });
 const next=Object.freeze({...data,...additions,
  sourceOrdoExpectation:contract,proPapaOrationDecision:decision});
 return Object.freeze({status:"APPLIED",contract,decision,
  proper:envelope?Object.freeze({...envelope,data:next}):next});
}
