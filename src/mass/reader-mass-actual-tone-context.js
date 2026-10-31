// M04 — actual Mass / calendar-to-music bridge, never a new Calendar
// or Proper resolver. The observed 1962 DayResolver's same-date PRINCIPAL
// identity and its exact Proper donor must both match the selected Mass.
import {romanClassTier} from "../calendar/roman-class-tier.js";
import {MASS_TONE_CONTEXT_SCHEMA,MASS_TONE_CONTEXT_OWNER}
 from "./reader-mass-1962-tone-family.js";

const freeze=Object.freeze;
const ID=/^(tempora|sancti):([A-Za-z0-9-]+):([1-4]):([a-z]{1,3})$/i;
const PATH=/^(tempora|sancti)\/([A-Za-z0-9-]+)$/i;
const DATE=/^\d{4}-\d{2}-\d{2}$/;
const chosenProperPath=p=>String(p?.data?.sourcePath??p?.sourcePath??"").trim();
const normType=kind=>String(kind??"CALENDAR").trim().toUpperCase().replace(/[ -]/g,"_");
function sameDayOfWeek(iso,weekday){
 if(!DATE.test(String(iso??"")))return false;
 const d=new Date(iso+"T12:00:00Z");
 return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===iso&&d.getUTCDay()===weekday;
}
function calendarMassOfDay(legacy){
 const actual=String(legacy?.celebrationId??"mass_of_day");
 const requested=String(legacy?.requestedCelebrationId??actual);
 return normType(legacy?.celebrationType)==="CALENDAR" &&
   (actual==="mass_of_day")&&(requested==="mass_of_day");
}
function sourceKind(main,stem,origin,rank,date){
 // Trusted metadata from the *resolved principal*, never displayed feast
 // titles or the season of a requested Mass. Contradictory metadata is held.
 const kind=String(main?.principalLiturgicalKind??main?.massKind??"").toUpperCase();
 const map={
  SUNDAY:"SUNDAY",FERIA:"FERIA",VIGIL:"VIGIL",
  FEAST:"FESTIVE_MASS",FESTIVE_MASS:"FESTIVE_MASS",
  OCTAVE_DAY:"WITHIN_APPROVED_OCTAVE",
  HOLY_THURSDAY_MASS:"HOLY_THURSDAY_MASS",
  EASTER_VIGIL_MASS:"EASTER_VIGIL_MASS",
 };
 if(kind){
  // A selected principal's classified 'Sunday' must agree with the day.
  if(!Object.hasOwn(map,kind))return null;
  if(kind==="SUNDAY"&&!sameDayOfWeek(date,0))return null;
  return map[kind];
 }
 if(origin==="tempora"){
  // The pinned Temporale source key's terminal -0 means Sunday.
  // The civil weekday is a second CHECK, never sufficient authority alone.
  const terminal=/-([0-6])$/.exec(stem);
  if(!terminal || !sameDayOfWeek(date,Number(terminal[1])))return null;
  if(terminal[1]==="0")return "SUNDAY";
  // The 1962 Holy Thursday and Easter/Pentecost octave Masses are not
  // ordinary ferias; without their dedicated typed source evidence hold.
  if(/^Quad6-4$/i.test(stem))return "HOLY_THURSDAY_MASS";
  if(/^(?:Pasc0|Pent01)-[1-6]$/i.test(stem))return null;
  if(/^Quad6-6$/i.test(stem))return null;
  return "FERIA";
 }
 if(origin==="sancti"){
  // The original 1962 Nativity vigil has its own printed I-class tone rule.
  if(stem==="12-24"&&rank===1)return "VIGIL";
  if(/^11-02m[123]$/.test(stem))return null; // All Souls is Requiem.
  // The witnessed PRINCIPAL I–III sanctoral Mass is a festive Mass, not
  // an optional commemoration. IV-class candidate remains unresolved.
  return rank<=3?"FESTIVE_MASS":null;
 }
 return null;
}
/** Never trust a rank/title printed in a preflight field on its own.
 * Only the authenticated same-date DayResolver principal, an exactly
 * matching source Proper, and an unoverridden Mass-of-day can authorize
 * the common prayer-tone context. The Requiem predicate already owns
 * its source-verified ferial exception in M03.
 */
export function deriveActualMassMusicToneContext({
 legacy=null,calendarResolution=null,selectedProper=null,overlays=[],
 distinctRite=null
}={}){
 if(!legacy?.canStart||!calendarMassOfDay(legacy)||
    distinctRite || overlays.includes("REQUIEM"))return null;
 const date=String(legacy.date??"");
 const day=calendarResolution;
 if(!DATE.test(date)||day?.date!==date||
   day?.status!=="ready"||!day?.day?.main||
   day?.proper?.status!=="ready")return null;
 const main=day.day.main;
 const found=ID.exec(String(main.id??""));
 const selected=PATH.exec(chosenProperPath(selectedProper));
 const canonical=PATH.exec(chosenProperPath(day.proper));
 if(!found||!selected||!canonical)return null;
 const [,origin,stem,tier]=found,rank=Number(tier);
 if(selected[1].toLowerCase()!==origin.toLowerCase()||
    canonical[1].toLowerCase()!==origin.toLowerCase()||
    selected[2].toLowerCase()!==stem.toLowerCase()||
    canonical[2].toLowerCase()!==stem.toLowerCase())return null;
 const printedRank=main.rank==null?rank:romanClassTier(main.rank);
 if(printedRank!==rank)return null;
 const celebrationKind=sourceKind(main,stem,origin.toLowerCase(),rank,date);
 if(!celebrationKind)return null;
 return freeze({
  schema:MASS_TONE_CONTEXT_SCHEMA,sourceOwner:MASS_TONE_CONTEXT_OWNER,
  verified:true,celebrationKind,liturgicalClass:rank,
  sourcePrincipalId:main.id,
  sourcePath:chosenProperPath(selectedProper),
  sourceDate:date,
  evidence:"SAME_DATE_CANONICAL_PRINCIPAL_AND_SELECTED_PROPER",
  // Different musical sources govern Kyriale, Gospel and dismissal.
  onlyForCommonMassPrayerTones:true
 });
}
