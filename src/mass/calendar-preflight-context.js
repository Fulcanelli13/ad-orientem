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
// Use only the resolved, same-date 1962 calendar. A commemoration is NOT a
// separate selected Mass; it supplies additional orations to the primary Mass.
function namedCommemorations(confirmed,fr){
  if(!confirmed)return Object.freeze([]);
  // In the live 1962 resolver, day.main.commemorations may be a structural
  // token list with no display names, while day.commemorations has canonical
  // titled observances. Prefer the first SOURCE collection with real names.
  for(const raw of [confirmed.day?.commemorations,
    confirmed.day?.main?.commemorations,confirmed.commemorations]){
    const entries=Array.isArray(raw)?raw:raw==null?[]:[raw];
    const names=entries.map(value=>typeof value==="string"?value:
      fr?text(value?.titleFr)||text(value?.nameFr)||text(value?.title)||text(value?.name):
         text(value?.title)||text(value?.titleFr)||text(value?.name)||text(value?.nameFr))
      .map(text).filter(value=>value&&/[A-Za-zÀ-ÿ]/.test(value));
    if(names.length)return Object.freeze([...new Set(names)]);
  }
  return Object.freeze([]);
}
function properOrationReadiness(proper,expected,fr){
  if(!proper||typeof proper!=="object")return Object.freeze({status:"PENDING",counts:null});
  const fields=[["collects","collect"],["secrets","secret"],["postcommunions","postcommunion"]];
  const groups=fields.map(([plural,singular])=>Array.isArray(proper[plural])&&proper[plural].length?
    proper[plural]:proper[singular]?[proper[singular]]:[]);
  const counts=Object.freeze(groups.map(rows=>rows.length));
  const complete=groups.every(rows=>rows.length>=expected && rows.every(row=>
    Boolean(text(row?.lat??row?.la)&&text(row?.[fr?"fr":"en"]))));
  return Object.freeze({status:complete?"COMPLETE":"INCOMPLETE",counts});
}
function gospelReference(proper){
  const g=proper?.gospel;
  const entry=text(proper?.gospelReference)||text(proper?.gospelCitation)||
     text(g?.reference)||text(g?.citation)||text(g?.ref);
  // Do not turn a full Gospel passage into a misleading one-line citation.
  return entry && entry.length<=105?entry:null;
}
export function massCalendarPreflightContext(legacy,calendarState={},language="en",{form=null}={}){
  const date=text(legacy?.date);
  const fr=String(language).toLowerCase().startsWith("fr");
  if(!date||!ISO.test(date))return Object.freeze({date:date??"",fr,
    season:null,calendar:Object.freeze({source:"PENDING",title:null,ready:false}),
    actual:Object.freeze({kind:"UNKNOWN",title:null,colour:null,gospel:null}),
    commemorations:Object.freeze([]),commemorationOrations:Object.freeze({status:"NOT_APPLICABLE",counts:null}),
    commemorationApplies:false,differs:false,sourceDate:null,openable:false});
  const calendar=calendarDay(legacy,calendarState,date);
  const selectedKind=String(legacy?.celebrationType??"CALENDAR").trim().toUpperCase();
  const exceptional=String(legacy?.exceptionalProfile??legacy?.distinctRite??"").toLowerCase();
  const kind=/good[-_]friday/.test(exceptional)?"GOOD_FRIDAY":
    /easter[-_]vigil/.test(exceptional)?"EASTER_VIGIL":selectedKind;
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
  const commemorations=namedCommemorations(validResolution(calendarState,date),fr);
  // Source calendar and Mass owner use distinct display-title conventions.
  // A wording difference alone must never suppress an actual commemoration.
  const selectedOwner=text(legacy?.actualCelebration?.id)||
    text(legacy?.celebrationId);
  const sameOwner=!selectedOwner||selectedOwner==="mass_of_day"||
    !calendar.principalId||selectedOwner===calendar.principalId;
  const commemorationApplies=commemorations.length>0&&kind==="CALENDAR"&&
    !alternate&&sameOwner;
  // Counting source orations is NOT a rubrical decision. The 1962 Proper
  // source owner must certify which commemorations apply to the chosen Mass
  // form; this read-only context may never infer it from calendar names.
  const selectedForm=form==null?null:String(form).trim().toUpperCase();
  const sourceDecision=proper?.commemorationFormDecision;
  const certified=Boolean(selectedForm&&sourceDecision?.status==="CERTIFIED"&&
    sourceDecision?.source==="1962_PROPER_RESOLVER"&&
    sourceDecision?.form===selectedForm&&
    Number.isInteger(sourceDecision?.appliedCount)&&
    sourceDecision.appliedCount>=0&&
    sourceDecision.appliedCount<=commemorations.length&&
    sourceDecision?.calendarCount===commemorations.length);
  const counts=commemorationApplies?
    properOrationReadiness(proper,commemorations.length+1,fr):
    Object.freeze({status:"NOT_APPLICABLE",counts:null});
  const commemorationOrations=!commemorationApplies?counts:
    selectedForm&&!certified?
      Object.freeze({status:"FORM_RULES_UNVERIFIED",counts:counts.counts}):
      certified&&sourceDecision.appliedCount===0?
        Object.freeze({status:"NOT_APPLIED_TO_FORM",counts:counts.counts}):
        certified?
          properOrationReadiness(proper,sourceDecision.appliedCount+1,fr):
          counts;
  const commemorationPrayerApplies=!commemorationApplies?false:
    certified?sourceDecision.appliedCount>0:null;
  return Object.freeze({
    date,fr,season:period?fr?period.fr:period.en:null,calendar,
    actual:Object.freeze({kind,title:actualTitle,colour:actualColour,
      gospel:gospelReference(proper),canStart:legacy?.canStart===true}),
    commemorations,commemorationOrations,commemorationApplies,commemorationPrayerApplies,
    form:selectedForm,
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
  const names=context.commemorations??[];
  const commemorationBlock=root.querySelector("[data-mass-calendar-commemoration]");
  if(commemorationBlock)commemorationBlock.hidden=names.length===0;
  field("commemoration-label",t("Also commemorated today","Également commémorée aujourd’hui"));
  field("commemoration-name",names.join(" · "));
  const prayerStatus=context.commemorationOrations?.status;
  const prayerMessage=!context.commemorationApplies?
    t("The selected celebration differs from the calendar Mass; these additional prayers are not automatically included.",
      "La célébration choisie diffère de la messe du jour ; ces prières ne sont pas ajoutées automatiquement.") :
    prayerStatus==="FORM_RULES_UNVERIFIED"?
    t("The Calendar lists this commemoration, but its prayer applicability for the selected Mass form is not yet verified. The additional orations must not be assumed.",
      "Le calendrier mentionne cette commémoraison, mais son application à la forme de messe choisie n'est pas encore vérifiée. Les oraisons supplémentaires ne doivent pas être présumées.") :
    prayerStatus==="NOT_APPLIED_TO_FORM"?
    t("This commemoration remains listed in the Calendar; the source-selected Mass form does not include its additional prayers.",
      "Cette commémoraison figure au calendrier ; les oraisons supplémentaires ne sont pas retenues pour la forme de messe choisie.") :
    prayerStatus==="COMPLETE"?
    t("After the principal Collect, Secret and Postcommunion, the priest also says the corresponding commemoration prayers.",
      "Après la collecte, la secrète et la postcommunion du jour, le prêtre dit également celles de la commémoraison.") :
    prayerStatus==="INCOMPLETE"?
    t("The commemoration requires additional Collect, Secret and Postcommunion prayers, but their complete Latin and translation are not yet available in the selected Proper.",
      "La commémoraison exige une collecte, une secrète et une postcommunion supplémentaires, mais leurs textes latins et traduits sont incomplets dans le propre choisi.") :
    t("The commemoration adds a Collect, Secret and Postcommunion. The selected Proper is still being resolved.",
      "La commémoraison ajoute une collecte, une secrète et une postcommunion. Le propre est encore en cours de résolution.");
  field("commemoration-prayers",prayerMessage);
  if(commemorationBlock)commemorationBlock.dataset.massCommemorationReadiness=prayerStatus??"NOT_APPLICABLE";
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
