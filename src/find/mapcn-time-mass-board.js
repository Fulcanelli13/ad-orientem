// MapCN Uptime Monitor pattern adapted to Ad Orientem directory and 1962 season.
// READ-ONLY: schedule text stays source wording; no live/next Mass inference.
import {scheduleFreshnessState} from "./data-service.js";
import {buildLiturgicalYear} from "../calendar/liturgical-year.js";

const arr=x=>Array.isArray(x)?x:[];
const str=x=>String(x??"").trim();
const isSourceUrl=x=>/^https:\/\/[^\s<>"']+$/i.test(str(x));
export function validTimeMassDate(value){
  if(!/^(19|20)\d{2}-\d{2}-\d{2}$/.test(str(value)))return false;
  const d=new Date(value+"T12:00:00Z");
  return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===value;
}
function bestSource(item,schedule){
  const record=item?.raw??{};
  const sourceIds=new Set(arr(schedule?.source_ids));
  const sources=arr(record.sources).filter(s=>sourceIds.has(s.source_id)&&isSourceUrl(s.url));
  const official=sources.find(s=>/OFFICIAL|PRIMARY/i.test(str(s.authority)+" "+str(s.source_type)));
  const exact=official||sources[0];
  if(exact)return {label:str(exact.title||exact.publisher||"Schedule source"),url:exact.url,exact:true};
  const published=arr(record.venue?.contact?.schedule_url).find(isSourceUrl);
  if(published)return {label:"Venue schedule page",url:published,exact:false};
  const itemSource=arr(item.source_links).find(s=>isSourceUrl(s.url));
  return itemSource?{label:str(itemSource.title||"Directory source"),url:itemSource.url,exact:false}:null;
}
function scheduleEvidence(item,asOf){
  const record=item.raw||{};
  const schedule=arr(record.ministries).flatMap(m=>arr(m.schedules))
    .filter(row=>row?.service_type==="MASS"&&str(row?.payload?.raw));
  const exact=schedule.filter(row=>arr(row.source_ids).length&&bestSource(item,row)?.exact);
  const checked=exact.filter(row=>["OFFICIAL_LIVE","OFFICIAL_VERIFIED","RECENTLY_VERIFIED"].includes(str(row.verification?.state)));
  const fresh=checked.filter(row=>scheduleFreshnessState(row,{now:new Date(asOf+"T12:00:00Z")})==="CURRENT");
  const due=checked.filter(row=>scheduleFreshnessState(row,{now:new Date(asOf+"T12:00:00Z")})==="REVIEW_DUE");
  const chosen=fresh[0]||checked[0]||schedule[0]||null;
  const evidence=chosen?bestSource(item,chosen):bestSource(item,null);
  let status="LISTING_ONLY";
  if(fresh.length)status="SOURCE_REVIEW_CURRENT";
  else if(due.length)status="REVIEW_DUE";
  else if(checked.length)status="SOURCE_ATTESTED";
  else if(schedule.length)status="RAW_UNCONFIRMED";
  return {status,raw:str(chosen?.payload?.raw),source:evidence,
    checkedAt:str(chosen?.verification?.checked_at||chosen?.verification?.verified_at),
    dueAt:str(chosen?.verification?.review_due_at),
    rawCount:schedule.length};
}
const ranks={SOURCE_REVIEW_CURRENT:0,SOURCE_ATTESTED:1,REVIEW_DUE:2,RAW_UNCONFIRMED:3,LISTING_ONLY:4};
export function buildTimeMassBoard({projection,asOf,date,query="",evidence="ALL",limit=24,language="en"}={}){
  if(!validTimeMassDate(date)||!validTimeMassDate(asOf))throw new Error("Invalid source-bound time or calendar date");
  const year=buildLiturgicalYear(date),period=year.currentPeriod;
  const all=arr(projection?.byLens?.tlm).filter(item=>item?.kind==="TLM_VENUE"&&item?.raw?.venue?.venue_id);
  const dedupe=new Map();
  for(const item of all){
    const id=str(item.source_id||item.raw.venue.venue_id);
    if(!id||dedupe.has(id))continue;
    const ev=scheduleEvidence(item,asOf);
    dedupe.set(id,{id,name:str(item.title),place:str(item.subtitle),
      affiliation:str(item.eyebrow),indicative:Boolean(item.geo?.approximate),
      status:ev.status,raw:ev.raw,source:ev.source,checkedAt:ev.checkedAt,
      dueAt:ev.dueAt,rawCount:ev.rawCount});
  }
  const q=str(query).toLocaleLowerCase();
  const filtered=[...dedupe.values()].filter(row=>
    (evidence==="ALL"||row.status===evidence)&&
    (!q||(row.name+" "+row.place+" "+row.affiliation+" "+row.raw).toLocaleLowerCase().includes(q)));
  filtered.sort((a,b)=>(ranks[a.status]??9)-(ranks[b.status]??9)||a.name.localeCompare(b.name));
  const counts={SOURCE_REVIEW_CURRENT:0,SOURCE_ATTESTED:0,REVIEW_DUE:0,RAW_UNCONFIRMED:0,LISTING_ONLY:0};
  for(const row of dedupe.values())counts[row.status]++;
  return {
    date,asOf,season:language==="fr"?period.fr:period.en,
    seasonSummary:language==="fr"?period.summaryFr:period.summaryEn,
    seasonColour:period.color,yearLabel:year.label,
    nextPeriod:year.nextPeriod?{date:year.nextPeriod.start,
      name:language==="fr"?year.nextPeriod.fr:year.nextPeriod.en}:null,
    total:dedupe.size,matched:filtered.length,
    counts,rows:filtered.slice(0,Math.min(120,Math.max(12,Number(limit)||24))),
    // Changing the liturgical date NEVER filters Mass venues by presumed weekly
    // occurrence. Calendar itself resolves exact feasts; schedules require
    // church-local exceptions, time zones and an authoritative next-Mass engine.
    authoritativeDay:false,computedNextMass:false,
  };
}
