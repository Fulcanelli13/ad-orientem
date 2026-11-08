/**
 * Recurring Temporal Office SOURCE KEY leads (no Office appointment).
 *
 * These rules follow inspected filenames and pinned headings. They do not
 * determine 1960 precedence, transfers, commemoration, variant, local Office,
 * English/French availability or complete Hour sequences.
 *
 * The last after-Pentecost Sunday is Pent24 regardless of the number of
 * intervening Sundays. Do NOT manufacture Pent25/26/etc by incrementing.
 */
import {buildLiturgicalYear} from "../calendar/liturgical-year.js";
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
export const OFFICE_TEMPORAL_LEADS_SCHEMA="ao.office.temporal-source-leads.v1";
const DAY=/^\d{4}-\d\d-\d\d$/;
const at=x=>new Date(x+"T12:00:00Z");
const iso=d=>d.toISOString().slice(0,10);
const valid=x=>typeof x==="string"&&DAY.test(x)&&!Number.isNaN(at(x).getTime())&&iso(at(x))===x;
const diff=(a,b)=>Math.round((at(b)-at(a))/86400000);
const plus=(a,n)=>{const d=at(a);d.setUTCDate(d.getUTCDate()+n);return iso(d)};
const pad=x=>String(x).padStart(2,"0");
function lead(path,owner,context="RECURRENCE_SOURCE_PATH_LEAD"){
 return Object.freeze({path,owner,context,filenameVerified:false,
  officeAppointed:false,sourceVariantSelected:false,
  class:null,rg91TablePosition:null});
}
/**
 * Pure chronology-to-source *candidate* rules. The other calendar is
 * consulted for Easter/Advent arithmetic ONLY, never Mass-office ranking.
 */
export function planTemporalOfficeLeads(date){
 if(!valid(date))throw Error("OFFICE_TEMPORAL_DATE_INVALID");
 const year=Number(date.slice(0,4));
 const easter=buildLiturgicalYear(year+"-04-01").easter;
 const advent=buildLiturgicalYear(year+"-12-24").start;
 const relative=diff(easter,date),sun=at(date).getUTCDay();
 const leads=[],uncertainties=[];
 // Christmas octave and early January files are supplementary source keys,
 // not necessarily a proper Office for the named date.
 const monthDay=date.slice(5);
 if(monthDay>="12-26"&&monthDay<="12-31")
  leads.push(lead("Tempora/Nat"+monthDay.slice(3),"NATIVITY_DATE_METADATA"));
 if(monthDay>="01-01"&&monthDay<="01-12")
  leads.push(lead("Tempora/Nat"+monthDay.slice(3),"NATIVITY_DATE_METADATA"));
 // Epi1-0 is the Sunday after 6 January (Holy Family in the 1960 source).
 const jan6=year+"-01-06",jan6Day=at(jan6).getUTCDay();
 const epiFirstSunday=plus(jan6,((7-jan6Day)%7)||7);
 const sept=plus(easter,-63);
 if(date>=year+"-01-14"&&date<sept&&date>=epiFirstSunday){
  const w=Math.floor(diff(epiFirstSunday,date)/7)+1;
  if(w>=1&&w<=6)leads.push(lead("Tempora/Epi"+w+"-"+sun,"POST_EPIPHANY_WEEK_SOURCE"));
  else uncertainties.push("EPIPHANY_SUNDAY_COUNT_EXCEEDS_SOURCE_FAMILY");
 }
 // Three Sundays of pre-Lent; Quadp3-3 is confirmed Ash Wednesday.
 if(relative>=-63&&relative<=-47){
  const w=Math.floor((relative+63)/7)+1;
  leads.push(lead("Tempora/Quadp"+w+"-"+sun,"PRELENT_WEEK_SOURCE"));
 }
 if(relative>=-46&&relative<=-43){
  leads.push(lead("Tempora/Quadp3-"+sun,
   "ASH_WEDNESDAY_TO_SATURDAY_SOURCE"));
 }
 // Lent I through Palm/Holy Saturday, including Passion Sunday as Quad5.
 if(relative>=-42&&relative<=-1){
  const w=Math.floor((relative+42)/7)+1;
  leads.push(lead("Tempora/Quad"+w+"-"+sun,
   relative>=-7?"HOLY_WEEK_SOURCE_KEY_NOT_ORDO":"LENT_WEEK_SOURCE"));
  if(relative>=-3)uncertainties.push("TRIDUUM_SPECIAL_OFFICE_AND_TENEBRAE");
 }
 // Easter week through Pentecost octave. Pasc7-0 is Pentecost Sunday.
 if(relative>=0&&relative<=55){
  const w=Math.floor(relative/7);
  leads.push(lead("Tempora/Pasc"+w+"-"+sun,
   w===7?"PENTECOST_OCTAVE_SOURCE_KEY":"PASCHAL_WEEK_SOURCE"));
 }
 // First Sunday after Pentecost is Trinity: Pent01-0.
 const afterPent=plus(easter,56);
 if(date>=afterPent&&date<advent){
  const w=Math.floor(diff(afterPent,date)/7)+1;
  const finalSunday=plus(advent,-7);
  if(date>=finalSunday){
   leads.push(lead("Tempora/Pent24-"+sun,"FINAL_POST_PENTECOST_WEEK"));
  }else if(w>=1&&w<=23){
   leads.push(lead("Tempora/Pent"+pad(w)+"-"+sun,"POST_PENTECOST_WEEK_SOURCE"));
  }else{
   uncertainties.push("RESUMED_EPIPHANY_SUNDAYS_AND_PRE_FINAL_POST_PENTECOST");
  }
 }
 // Advent is already covered in the canonical key planner; do not
 // duplicate or add conflicting winter chronology in this module.
 return Object.freeze({
  schema:OFFICE_TEMPORAL_LEADS_SCHEMA,date,sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"SOURCE_PATH_LEADS_NOT_LITURGICAL_APPOINTMENT",
  leads:Object.freeze(leads),uncertainties:Object.freeze(uncertainties),
  officePrecedenceResolved:false,conditionalRubricsResolved:false,
  anyOfficeTextRead:false,published:false
 });
}
export function planTemporalOfficeYear(year){
 if(!Number.isInteger(year)||year<1900||year>2099)
  throw Error("OFFICE_TEMPORAL_YEAR_INVALID");
 const dates=[];
 for(let d=new Date(Date.UTC(year,0,1,12));d.getUTCFullYear()===year;d.setUTCDate(d.getUTCDate()+1))
  dates.push(planTemporalOfficeLeads(iso(d)));
 const families={},unresolved={};
 for(const day of dates){
  for(const l of day.leads)families[l.owner]=(families[l.owner]??0)+1;
  for(const flag of day.uncertainties)unresolved[flag]=(unresolved[flag]??0)+1;
 }
 return Object.freeze({
  schema:OFFICE_TEMPORAL_LEADS_SCHEMA,year,
  civilDays:dates.length,totalCandidateKeys:dates.reduce((s,d)=>s+d.leads.length,0),
  families:Object.freeze(families),uncertainties:Object.freeze(unresolved),
  sourceTextFilesRead:0,appointedOffices:0,published:0,
  dates:Object.freeze(dates)
 });
}
