// Explicitly selected, institute-scoped Mass entry, never a universal
// substitution of the canonical 1962 calendar/Office.
// Source: https://icrspfrance.fr/ordo.php?d=2026-11-07#j2026-11-07
import {icrspFranceOrdoForDate} from "../calendar/icrsp-france-ordo-evidence.js";

const selectedByHost=new WeakMap();
export const ICRSP_2026_11_06_SACRED_HEART=Object.freeze({
 date:"2026-11-06",id:"sacred_heart",path:"Votive/Pent02-5",
 basis:"first_friday",form:"LOW",gloria:true,credo:false,
 votiveClass:3,introit:"Cogitationes",
 source:"https://icrspfrance.fr/ordo.php?d=2026-11-06#j2026-11-06"
});
export const ICRSP_2026_11_07_IMMACULATE_HEART=Object.freeze({
 date:"2026-11-07",id:"immaculate_heart",path:"Votive/08-22r",
 basis:"first_saturday",form:"LOW",gloria:true,credo:false,
 votiveClass:3,introit:"Adeamus",
 source:"https://icrspfrance.fr/ordo.php?d=2026-11-07#j2026-11-07"
});
const appointments=Object.freeze({
 "2026-11-06":ICRSP_2026_11_06_SACRED_HEART,
 "2026-11-07":ICRSP_2026_11_07_IMMACULATE_HEART
});
export function icrspNovember2026Appointment(dateIso){
 return appointments[String(dateIso??"")]??null;
}
export function isExplicitIcrspNovemberLowMassSelection({win=globalThis,dateIso}={}){
 const spec=icrspNovember2026Appointment(dateIso);
 const state=win?.AO_RUNTIME_V8?.store?.getState?.();
 const arch=win?.AO_CELEBRATION_ARCH_V1;
 const selected=win&&typeof win==="object"?selectedByHost.get(win):null;
 return Boolean(spec && selected?.date===spec.date &&
  selected?.id===spec.id && selected?.basis===spec.basis &&
  state?.selectedDate===spec.date &&
  arch?.actualCelebration?.id===spec.id &&
  arch?.votiveBasis===spec.basis);
}
// Keep the original 6 November API available to existing callers/tests.
export function isExplicitIcrspFirstFridaySelection(args={}){
 return args.dateIso==="2026-11-06"&&
  isExplicitIcrspNovemberLowMassSelection(args);
}
export function selectIcrspNovemberLowMass({win=globalThis,dateIso}={}){
 const spec=icrspNovember2026Appointment(dateIso);
 const state=win?.AO_RUNTIME_V8?.store?.getState?.();
 if(!spec||state?.selectedDate!==spec.date)
  return Object.freeze({ok:false,reason:"ICRSP_SOURCE_DATE_MISMATCH"});
 const ordo=icrspFranceOrdoForDate(spec.date);
 if(ordo?.scope!=="ICRSP_FRANCE_PARTICULAR_ORDO"||
    ordo?.mass?.introit!==spec.introit||
    ordo?.mass?.class!==spec.votiveClass||
    ordo?.mass?.prayerForPope!==true||
    ordo?.mass?.gloria!==spec.gloria||ordo?.mass?.credo!==spec.credo)
  return Object.freeze({ok:false,reason:"ICRSP_VERIFIED_ORDO_CHANGED"});
 const definition=win?.AO_CELEBRATION_CATALOGUE?.[spec.id];
 if(definition?.type!=="votive"||definition?.path!==spec.path)
  return Object.freeze({ok:false,reason:"ICRSP_VOTIVE_PROPER_OWNER_MISMATCH"});
 const api=win?.AO_CELEBRATION_API,bridge=win?.AO_R17_BROWSER_ENTRY;
 if(typeof api?.select!=="function"||
    typeof api?.setVotiveBasis!=="function"||
    typeof bridge?.selectTodayOption!=="function")
  return Object.freeze({ok:false,reason:"SOURCE_MASS_OWNER_UNAVAILABLE"});
 // Any prior explicit authorization becomes invalid before host selection.
 selectedByHost.delete(win);
 api.select(spec.id);
 const arch=win?.AO_CELEBRATION_ARCH_V1;
 if(arch?.actualCelebration?.id!==spec.id)
  return Object.freeze({ok:false,reason:"VOTIVE_SELECTION_NOT_ACCEPTED"});
 const rubric=api.setVotiveBasis(spec.basis);
 if(arch.votiveBasis!==spec.basis||
    rubric?.votiveClass!==spec.votiveClass||
    rubric?.gloria!==spec.gloria||rubric?.credo!==spec.credo||
    !["permitted","permittedWithChanges"].includes(rubric?.status))
  return Object.freeze({ok:false,reason:"ICRSP_SPECIAL_VOTIVE_RUBRICS_NOT_CONFIRMED",
   rubricStatus:rubric?.status??null});
 if(bridge.selectTodayOption("form",spec.form)!==true)
  return Object.freeze({ok:false,reason:"LOW_MASS_FORM_NOT_ACCEPTED"});
 selectedByHost.set(win,Object.freeze({
  date:spec.date,id:spec.id,basis:spec.basis
 }));
 return Object.freeze({ok:true,id:spec.id,path:spec.path,form:spec.form,
  gloria:rubric.gloria,credo:rubric.credo,votiveClass:rubric.votiveClass,
  ready:arch.readiness?.loading===false&&Boolean(arch.resolvedProper)});
}
export function selectIcrspFirstFridayLowMass(args={}){
 if(args.dateIso!=="2026-11-06")
  return Object.freeze({ok:false,reason:"ICRSP_SOURCE_DATE_MISMATCH"});
 return selectIcrspNovemberLowMass(args);
}
export function selectIcrspFirstSaturdayLowMass(args={}){
 if(args.dateIso!=="2026-11-07")
  return Object.freeze({ok:false,reason:"ICRSP_SOURCE_DATE_MISMATCH"});
 return selectIcrspNovemberLowMass(args);
}
