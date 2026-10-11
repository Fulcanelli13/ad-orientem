// Read-only Calendar -> Mass context. Never chooses a celebration, Proper,
// ceremony or R17 mode. An explicitly selected votive/Requiem/alternate
// source remains authoritative for the Mass actually followed.
import { buildLiturgicalYear } from "../calendar/liturgical-year.js";
import { calendarMassColour } from "../calendar/colour-projection.js";

const ISO=/^\d{4}-\d{2}-\d{2}$/;
const text=value=>typeof value==="string"&&value.trim()?value.trim():null;
const properOf=mass=>mass?.proper?.data??mass?.proper??null;
const validResolution=(state,date)=>{
  const row=state?.resolution;
  if(!row||state?.resolving||state?.selectedDate!==date||
     (row.date&&row.date!==date)||(row.day?.date&&row.day.date!==date)||
     row.status==="failed"||row.status==="unavailable"||!row.day?.main)return null;
  return row;
};
function calendarDay(legacy,state,date){
  const confirmed=validResolution(state,date);
  if(confirmed){
    const main=confirmed.day.main;
    return Object.freeze({
      source:"1962_RESOLVER",title:text(main.title)||text(main.name),
      rank:text(main.rank)||null,colour:text(calendarMassColour(confirmed)),
      principalId:text(main.id),ready:true
    });
  }
  // The host knows the *calendar* day separately from the actual selection.
  // Fallback is informational only; never describe it as resolver-verified.
  const host=legacy?.calendarDay;
  if(host&& (host.title||host.name)){
    return Object.freeze({
      source:"MASS_HOST_CALENDAR",title:text(host.title)||text(host.name),
      rank:text(host.rank),colour:text(host.color)||text(host.colour),
      principalId:text(host.id),ready:false
    });
  }
  return Object.freeze({source:"PENDING",title:null,rank:null,colour:null,principalId:null,ready:false});
}
function gospelReference(proper){
  const g=proper?.gospel;
  const entry=text(proper?.gospelReference)||text(proper?.gospelCitation)||
     text(g?.reference)||text(g?.citation)||text(g?.ref);
  // Do not turn a full Gospel passage into a misleading one-line citation.
  return entry && entry.length<=105?entry:null;
}
export function massCalendarPreflightContext(legacy,calendarState={},language="en"){
  const date=text(legacy?.date);
  const fr=String(language).toLowerCase().startsWith("fr");
  if(!date||!ISO.test(date))return Object.freeze({date:date??"",fr,
    season:null,calendar:Object.freeze({source:"PENDING",title:null,ready:false}),
    actual:Object.freeze({kind:"UNKNOWN",title:null,colour:null,gospel:null}),
    differs:false,sourceDate:null,openable:false});
  const calendar=calendarDay(legacy,calendarState,date);
  const selectedKind=String(legacy?.celebrationType??"CALENDAR").trim().toUpperCase();
  const kind=String(legacy?.exceptionalProfile||"").toLowerCase().includes("good-friday")
    ?"GOOD_FRIDAY":selectedKind;
  const actualTitle=text(legacy?.actualCelebration?.title)||
    text(legacy?.celebrationTitle)||
    (kind==="CALENDAR"?calendar.title:null);
  const proper=properOf(legacy);
  const alternate=legacy?.sourceDiagnostics?.actualMassSelection==="OBSERVED_SOURCE_DAY";
  const differs=alternate||!["CALENDAR","GOOD_FRIDAY"].includes(kind)||
    Boolean(actualTitle&&calendar.title&&actualTitle!==calendar.title);
  const actualColour=text(proper?.color)||text(proper?.colour)||
    text(legacy?.massColor)||(kind==="CALENDAR"&&!differs?calendar.colour:null);
  const period=buildLiturgicalYear(date).currentPeriod;
  return Object.freeze({
    date,fr,season:period?fr?period.fr:period.en:null,calendar,
    actual:Object.freeze({kind,title:actualTitle,colour:actualColour,
      gospel:gospelReference(proper),canStart:legacy?.canStart===true}),
    differs,sourceDate:alternate?text(legacy?.sourceDiagnostics?.actualMassSourceDate):null,
    openable:calendarState?.selectedDate===date
  });
}
// DOM helper: source fields are written as textContent, never interpolated
// as HTML. Different sources remain visibly separate.
export function fillMassCalendarPreflight(root,context){
  if(!root||!context)return false;
  const t=(en,fr)=>context.fr?fr:en;
  const field=(key,value)=>{
    const node=root.querySelector("[data-mass-calendar-"+key+"]");
    if(node)node.textContent=value??"";
  };
  field("heading",t("Liturgical context","Contexte liturgique"));
  field("date",context.date);
  field("season",context.season);
  field("day-label",t("Calendar observance","Jour du calendrier"));
  field("day",context.calendar.title||
    t("Calendar observance not yet available","Jour liturgique non encore disponible"));
  field("rank",context.calendar.rank);
  field("colour",context.calendar.colour?
    t("Calendar colour: ","Couleur du calendrier : ")+context.calendar.colour:null);
  field("actual-label",t("Mass selected","Messe choisie"));
  field("actual",context.actual.title||
    t("Selection awaiting source resolution","Célébration en attente de résolution"));
  field("actual-colour",context.actual.colour?
    t("Mass colour: ","Couleur de la messe : ")+context.actual.colour:null);
  field("gospel",context.actual.gospel?
    t("Selected Gospel: ","Évangile choisi : ")+context.actual.gospel:null);
  field("source",context.sourceDate?
    t("Proper from feast date ","Propre de la fête du ")+context.sourceDate:
    (context.calendar.source==="MASS_HOST_CALENDAR"?
    t("Host calendar context; awaiting full day confirmation",
      "Calendrier de la messe ; vérification du jour en attente"):null));
  const calendarAction=root.querySelector("[data-mass-calendar-open]");
  if(calendarAction){
    calendarAction.hidden=!context.openable;
    calendarAction.textContent=t("Full Calendar","Calendrier complet");
  }
  root.dataset.massCalendarDate=context.date;
  root.dataset.massCalendarSource=context.calendar.source;
  root.dataset.massActualKind=context.actual.kind;
  root.dataset.massCelebrationDifferent=String(context.differs);
  return true;
}
