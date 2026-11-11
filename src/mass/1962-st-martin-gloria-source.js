// Correct an upstream false 'no Gloria' flag for the exact ordinary
// 1962 Mass of St Martin of Tours. This is a liturgical-source adjudication,
// not a menu override: the 1960 General Rubrics require Gloria for this
// white III-class Sanctoral feast (RGMR 431).
// Independently published 11 Nov 2026 Ordos:
// https://ordo.fsspx.org/en/day/2026-11-11?texts=ordinary
// https://icrspfrance.fr/textes-de-la-messe.php?d=2026-11-11
import {review1962OrdinaryForCalendarDay} from "../calendar/ordo-1962-ordinary-rule-review.js";

const path="Sancti/11-11";
const id="sancti:11-11:3:w";
const outside=proper=>Object.freeze({proper,gloria:null,sourceDecision:null});
const sourcePath=proper=>String(proper?.data?.sourcePath??proper?.sourcePath??"");

export function reconcile1962StMartinGloria({legacy,proper,calendarResolution,overlays=[],distinctRite=null}={}){
 const result=outside(proper);
 if(!legacy||!proper||!calendarResolution)return result;
 const actual=proper.data??proper;
 const original=calendarResolution.proper?.data??calendarResolution.proper;
 // Exclude observed-source Masses, votives, Requiems, nuptial and
 // other distinct rites. A church's actual choice always owns its own rubric.
 if(!/^\d{4}-11-11$/.test(String(legacy.date??""))||
    String(legacy.calendarDay?.id??"")!==id||
    String(legacy.requestedCelebrationId??"mass_of_day")!=="mass_of_day"||
    String(legacy.celebrationId??"mass_of_day")!=="mass_of_day"||
    !["CALENDAR","MASS_OF_DAY"].includes(String(legacy.celebrationType??"CALENDAR").toUpperCase())||
    legacy.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY"||
    String(legacy.properSource??path)!==path||
    sourcePath(proper)!==path||
    calendarResolution.date!==legacy.date||
    calendarResolution.status!=="ready"||
    calendarResolution.day?.main?.id!==id||
    calendarResolution.proper?.status!=="ready"||
    String(original?.sourcePath??"")!==path||
    distinctRite||
    overlays.some(x=>["REQUIEM","VOTIVE_PROPER","NUPTIAL"].includes(String(x).toUpperCase()))||
    actual?.requestedCelebrationId&&actual.requestedCelebrationId!=="mass_of_day"||
    /(?:votive|requiem|mass_of_dead)/i.test(String(actual.riteProfile??actual.profile??"")))
  return result;
 const ordinance=review1962OrdinaryForCalendarDay(calendarResolution).gloria;
 // No title-matching, date-only override or unverifiable 'feast' guess.
 if(ordinance?.status!=="RULE_SUPPORTED"||ordinance.value!==true)return result;
 // Do not rewrite a healthy source: this repairs only the observed conflict.
 if(legacy.gloria!==false&&actual.hasGloria!==false)return result;
 const revised=Object.freeze({...actual,hasGloria:true});
 const corrected=proper.data?Object.freeze({...proper,data:revised}):revised;
 return Object.freeze({
  proper:corrected,gloria:true,
  sourceDecision:Object.freeze({
   scope:"EXACT_ROMAN_1962_SANCTORAL_MASS_OF_DAY",
   principalId:id,sourcePath:path,date:legacy.date,
   priorLegacyGloria:legacy.gloria??null,priorProperGloria:actual.hasGloria??null,
   decision:true,source:ordinance.sourceUrl,clause:ordinance.clause,
   reconciliation:"GENERAL_RUBRICS_CONTRADICT_FALSE_UPSTREAM_PROPER_FLAG"
  })
 });
}
