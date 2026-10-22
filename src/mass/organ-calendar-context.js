// Calendar-to-Mass source bridge for the EXISTING 1958 organ-permission engine.
// The Calendar's 1962 day resolver authorizes a dated liturgical-year period;
// neither the user's civil date alone nor a Proper's feast name does so.
import {addDaysIso,buildLiturgicalYear} from "../calendar/liturgical-year.js";

const freeze=Object.freeze;
const ISO=/^\d{4}-\d{2}-\d{2}$/;
const PERIOD_TO_SEASON=freeze({
  "advent":"ADVENT","christmas":"CHRISTMAS","epiphany":"EPIPHANY",
  "after-epiphany":"ORDINARY","septuagesima":"SEPTUAGESIMA",
  "lent":"LENT","passion":"PASSIONTIDE","easter":"EASTER",
  "ascension":"EASTER","pentecost":"PENTECOST","after-pentecost":"ORDINARY",
});
const EXPLICIT_SEASONS=freeze({
  ADVENT:"ADVENT",CHRISTMAS:"CHRISTMAS",CHRISTMASTIDE:"CHRISTMAS",
  EPIPHANY:"EPIPHANY",SEPTUAGESIMA:"SEPTUAGESIMA",SEXAGESIMA:"SEPTUAGESIMA",
  QUINQUAGESIMA:"SEPTUAGESIMA",LENT:"LENT",PASSIONTIDE:"PASSIONTIDE",
  PASSION:"PASSIONTIDE",EASTER:"EASTER",EASTERTIDE:"EASTER",
  ASCENSIONTIDE:"EASTER",PENTECOST:"PENTECOST",
  "AFTER EPIPHANY":"ORDINARY","AFTER PENTECOST":"ORDINARY",
  ORDINARY:"ORDINARY"
});
const token=value=>String(value??"").trim().toUpperCase().replace(/[_-]/g," ").replace(/\s+/g," ");
function explicitSeason(resolution){
  // Only the observed Calendar DAY can corroborate the temporal period.
  // The selected Proper could be votive, a saint, Requiem or alternate Mass.
  const day=resolution?.day?.main??{};
  const raw=[day.season,day.seasonName,day.tempus,
    resolution?.liturgicalSeason,resolution?.season];
  for(const value of raw){
    const key=token(value);
    if(key)return EXPLICIT_SEASONS[key]??"UNRECOGNIZED";
  }
  return null;
}

/**
 * Called in the pre-Mass host with a completed, same-date 1962 day resolution.
 * The already-established year-wheel owns season boundaries (no second calendar).
 * Certifies from the dated year: Gaudete/Laetare (§83b) and September Ember
 * ferias (§81c). Does not certify: extraordinary or local feast exceptions (§83a),
 * a different selected Mass, or whether an organ is actually being played.
 */
export function verifiedOrganContextFrom1962Calendar({
  date=null,calendarResolution=null,selectedCalendarDate=null,
  calendarResolving=false,observedSource=false,celebrationType=null,
  distinctRite=null,
}={}){
  if(typeof date!=="string"||!ISO.test(date))return null;
  if(calendarResolving||selectedCalendarDate!==date)return null;
  const r=calendarResolution;
  if(!r||r.date!==date||["failed","unavailable","pending"].includes(
    String(r.status??"").toLowerCase())||!r.day?.main?.id)return null;
  if(distinctRite==="GOOD_FRIDAY"||distinctRite==="EASTER_VIGIL")return null;
  const year=buildLiturgicalYear(date);
  const period=year?.currentPeriod;
  const season=PERIOD_TO_SEASON[period?.id]??null;
  if(!season||date<period.start||date>period.end)return null;
  const resolverSeason=explicitSeason(r);
  if(resolverSeason && resolverSeason!==season)return null;
  // Which Mass the calendar resolved: the seasonal (temporal) day, or a
  // saint's feast that replaced it ("tempora:" / "sancti:" day ids, or the
  // Proper's Tempora/ / Sancti/ source path).
  const dayId=String(r.day.main.id);
  const properPath=String(r.proper?.data?.sourcePath??r.proper?.sourcePath??"");
  const sanctoral=/^sancti:/i.test(dayId)||/^Sancti\//.test(properPath);
  // §83(a): holy days of obligation, local holidays, patronal, titular and
  // dedication feasts lift the Advent/Lent restriction. Which feasts qualify
  // is local, so for a saint's feast in a restricted season make no claim.
  if(["ADVENT","LENT","PASSIONTIDE"].includes(season)&&sanctoral)return null;
  // §83(b): organ only on the third Sunday of Advent and the fourth of Lent.
  const gaudete=addDaysIso(year.start,14);
  const laetare=addDaysIso(year.easter,-21);
  const organOnlySunday=date===gaudete||date===laetare;
  // §81(c): September Ember days (Wednesday, Friday and Saturday after the
  // third Sunday of September, 1960 rubrics) when the ferial Mass is said.
  const civilYear=Number(date.slice(0,4));
  const sept15=`${civilYear}-09-15`;
  const thirdSundaySept=addDaysIso(sept15,(7-new Date(sept15+"T12:00:00").getDay())%7);
  const septEmber=[3,5,6].map(n=>addDaysIso(thirdSundaySept,n)).includes(date);
  const septEmberFerial=septEmber&&!sanctoral;
  // A completed 1962 resolution is necessary but never sufficient for
  // exceptional Holy Week instrumental permissions.
  const triduumStart=addDaysIso(year.easter,-3);
  const triduumEnd=addDaysIso(year.easter,-1);
  const triduumDate=date>=triduumStart&&date<=triduumEnd;
  const ordinaryCalendarMass=String(celebrationType??"CALENDAR").toUpperCase()==="CALENDAR" &&
    !observedSource;
  const properProfile=token(r.proper?.data?.riteProfile??r.day.main?.profile);
  const identifiedHolyThursday=ordinaryCalendarMass&&date===triduumStart &&
    properProfile==="HOLY THURSDAY MASS";
  // Never attach ordinary rules to a special Holy Week office or a Mass
  // whose celebration context has not been source certified.
  if(triduumDate&&!identifiedHolyThursday)return null;
  return freeze({
    source:"LITURGICAL_PLAN_1962",verified:true,
    date,season,calendarDayId:String(r.day.main.id),
    periodOwner:"CALENDAR_LITURGICAL_YEAR_VERIFIED_1962_DAY",
    triduum:identifiedHolyThursday,
    holyThursdayMass:identifiedHolyThursday,
    holyThursdayChrism:false,
    septEmberFerial,organOnlySunday,exceptionalFeastConfirmed:false,
    lowMassInterferingInstrumentalCustom:false,
    actuallyPlaying:"UNKNOWN",notAnObservation:true,
  });
}
