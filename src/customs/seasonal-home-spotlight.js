/* Existing published Customs seasonal editorial projection.
 * No Atlas, no new Calendar, no universal-rite claim, no daily completion.
 * Text/source content owned by calendarCustomArticle, chronology by 1962 year resolver.
 */
import { calendarCustomArticle, CALENDAR_CUSTOM_ARTICLE_IDS } from "../calendar/customs-read-model.js";
import { v384Dates } from "../calendar/traditional-year-v384.js";
import { buildLiturgicalYear, addDaysIso } from "../calendar/liturgical-year.js";
export const SEASONAL_CUSTOMS_PILOT = Object.freeze([
  {
    "id": "ADVT-001",
    "rule": "FIRST_ADVENT",
    "anchor": null,
    "score": 95,
    "before": 7,
    "after": 0,
    "home": true,
    "scope": "PRACTICAL_BROAD"
  },
  {
    "id": "ADVT-002",
    "rule": "FIRST_ADVENT",
    "anchor": null,
    "score": 62,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "PRACTICAL_BROAD"
  },
  {
    "id": "SNIC-001",
    "rule": "FIXED",
    "anchor": "12-06",
    "score": 62,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "REGIONAL_CONTEXT"
  },
  {
    "id": "XMAS-001",
    "rule": "FIXED",
    "anchor": "12-24",
    "score": 62,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "REGIONAL_CONTEXT"
  },
  {
    "id": "BLSS-003",
    "rule": "FIXED",
    "anchor": "12-27",
    "score": 65,
    "before": 3,
    "after": 0,
    "home": true,
    "scope": "MINISTERIAL_CAUTION"
  },
  {
    "id": "EPIP-002",
    "rule": "FIXED",
    "anchor": "01-06",
    "score": 71,
    "before": 3,
    "after": 0,
    "home": true,
    "scope": "HOUSEHOLD_TRADITION"
  },
  {
    "id": "EPIP-001",
    "rule": "FIXED",
    "anchor": "01-06",
    "score": 38,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "REGIONAL_CONTEXT"
  },
  {
    "id": "DOM-011",
    "rule": "FIXED",
    "anchor": "02-02",
    "score": 94,
    "before": 5,
    "after": 0,
    "home": true,
    "scope": "SACRAMENTAL_HOME_USE"
  },
  {
    "id": "BLSS-001",
    "rule": "FIXED",
    "anchor": "02-03",
    "score": 92,
    "before": 2,
    "after": 0,
    "home": true,
    "scope": "MINISTERIAL_CAUTION"
  },
  {
    "id": "SJOS-001",
    "rule": "FIXED",
    "anchor": "03-19",
    "score": 36,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "REGIONAL_CONTEXT"
  },
  {
    "id": "DOM-013",
    "rule": "MOVABLE",
    "anchor": "palm",
    "score": 98,
    "before": 5,
    "after": 0,
    "home": true,
    "scope": "SACRAMENTAL_HOME_USE"
  },
  {
    "id": "HTHU-001",
    "rule": "MOVABLE",
    "anchor": "holyThursday",
    "score": 97,
    "before": 2,
    "after": 0,
    "home": true,
    "scope": "PRACTICAL_BROAD"
  },
  {
    "id": "BLSS-004",
    "rule": "MOVABLE",
    "anchor": "holySaturday",
    "score": 75,
    "before": 2,
    "after": 0,
    "home": true,
    "scope": "MINISTERIAL_CAUTION"
  },
  {
    "id": "ROGA-001",
    "rule": "ROGATIONS",
    "anchor": null,
    "score": 89,
    "before": 3,
    "after": 0,
    "home": true,
    "scope": "PRIVATE_PRAYER_NOT_PARISH_RITE"
  },
  {
    "id": "DEV-001",
    "rule": "FIXED",
    "anchor": "05-01",
    "score": 90,
    "before": 3,
    "after": 0,
    "home": true,
    "scope": "DEVOTIONAL_MONTH_NOT_LITURGICAL_SEASON"
  },
  {
    "id": "MARI-002",
    "rule": "FIXED",
    "anchor": "05-01",
    "score": 49,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "OPTIONAL_HOUSEHOLD"
  },
  {
    "id": "BLSS-002",
    "rule": "FIXED",
    "anchor": "08-15",
    "score": 42,
    "before": 0,
    "after": 0,
    "home": false,
    "scope": "REGIONAL_MINISTERIAL"
  },
  {
    "id": "DEAD-001",
    "rule": "FIXED",
    "anchor": "11-02",
    "score": 95,
    "before": 4,
    "after": 0,
    "home": true,
    "scope": "PRAYER_FOR_DEAD"
  },
  {
    "id": "DEAD-003",
    "rule": "FIXED",
    "anchor": "11-02",
    "score": 94,
    "before": 2,
    "after": 0,
    "home": true,
    "scope": "PRAYER_FOR_DEAD"
  },
  {
    "id": "DOM-006",
    "rule": "SACRED_HEART",
    "anchor": null,
    "score": 74,
    "before": 5,
    "after": 0,
    "home": true,
    "scope": "FAMILY_CONSECRATION_DEVOTION"
  }
].map(row=>Object.freeze(row)));
const published = new Set(CALENDAR_CUSTOM_ARTICLE_IDS);
const valid = value => {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(value||"")))return false;
 const d=new Date(String(value)+"T12:00:00Z");
 return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
};
const utcDay = value => Date.parse(value+"T12:00:00Z")/86400000;
const diff = (from,to) => Math.round(utcDay(to)-utcDay(from));
function targetDates(rule,year){
 const yr=Number(year),day=v384Dates(yr);
 if(rule.rule==="FIXED")return [yr+"-"+rule.anchor];
 if(rule.rule==="MOVABLE")return [day[rule.anchor]].filter(Boolean);
 if(rule.rule==="FIRST_ADVENT"){
   // The existing liturgical-year resolver, not an app-invented feast rule.
   const preAdvent=buildLiturgicalYear(yr+"-11-15");
   return [addDaysIso(preAdvent.end,1)];
 }
 if(rule.rule==="ROGATIONS")return [yr+"-04-25",...day.minorRog];
 if(rule.rule==="SACRED_HEART")return [addDaysIso(day.corpus,8)];
 return [];
}
export function homeSeasonalCustomForDate(date){
 if(!valid(date))return null;
 const yr=Number(date.slice(0,4)),choices=[];
 for(const row of SEASONAL_CUSTOMS_PILOT){
   // Fail closed if source article is not in the accepted published catalogue.
   if(!row.home||!published.has(row.id))continue;
   const article=calendarCustomArticle(row.id);
   if(!article||!article.sources?.length||!article.title?.en||!article.title?.fr)continue;
   for(const year of [yr-1,yr,yr+1]){
     for(const feast of targetDates(row,year)){
       if(!feast||!valid(feast))continue;
       const daysUntil=diff(date,feast);
       if(daysUntil<-(row.after||0)||daysUntil>row.before)continue;
       const score=row.score+(daysUntil===0?3:0)-Math.max(0,daysUntil)*1.2;
       choices.push({id:row.id,article,contextDate:feast,daysUntil,score,editorialRole:row.scope,phase:daysUntil>0?"PREPARATION":daysUntil===0?"OCCASION":"AFTER"});
     }
   }
 }
 choices.sort((a,b)=>b.score-a.score||Math.abs(a.daysUntil)-Math.abs(b.daysUntil)||a.id.localeCompare(b.id));
 return choices.length?Object.freeze(choices[0]):null;
}
export function seasonalCustomsPilotCoverage(){
 return Object.freeze({total:SEASONAL_CUSTOMS_PILOT.length,homeEligible:SEASONAL_CUSTOMS_PILOT.filter(x=>x.home).length,
 allIdsPublished:SEASONAL_CUSTOMS_PILOT.every(x=>published.has(x.id)),
 noCountryFilter:true,releaseGate:"PUBLISHED_CANONICAL_ONLY"});
}
