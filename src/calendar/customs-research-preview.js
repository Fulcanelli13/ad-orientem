import {v384Dates} from "./traditional-year-v384.js";

// A non-live projection for already researched Customs. The authoritative
// 1962 Calendar computes Easter and Pentecost; no custom defines a Mass feast.
export const CUSTOMS_RESEARCH_PROJECTION_VERSION="customs-research-18-calendar-preview-v1";
const DATE=/^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH=/^(\d{4})-(\d{2})$/;
function checkMonth(s){
 const m=MONTH.exec(String(s||""));
 if(!m||Number(m[2])<1||Number(m[2])>12)throw new TypeError("Expected YYYY-MM");
 return {year:Number(m[1]),month:Number(m[2])};
}
function checkDay(s){
 const m=DATE.exec(String(s||""));
 if(!m)throw new TypeError("Expected YYYY-MM-DD");
 const iso=m[0],d=new Date(iso+"T12:00:00Z");
 if(Number.isNaN(d.getTime())||d.toISOString().slice(0,10)!==iso)throw new TypeError("Invalid ISO date");
 return {year:Number(m[1]),month:Number(m[2]),day:Number(m[3]),iso};
}
const localIso=(year,md)=>String(year)+"-"+md;
const shown=(record,anchor,period,mode,fr)=>Object.freeze({
 custom_id:record.candidate_id,
 title:fr?record.title.fr:record.title.en,
 description:fr?record.description.fr:record.description.en,
 optional_practice:fr?record.optional_practice.fr:record.optional_practice.en,
 caution:fr?record.caution.fr:record.caution.en,
 historical_context:fr?record.history.fr:record.history.en,
 period_label:period,
 representative_anchor:anchor,
 date_precision:mode,
 geographic_scope:Object.freeze([...record.geography]),
 local_event_required:record.calendar_context.local_event_required,
 local_event_confirmed:false,
 is_calendar_liturgy:false,
 is_existing_1962_feast:false,
 is_current_parish_announcement:false,
 publication_state:"RESEARCH_PREVIEW_NOT_PUBLISHED",
 source_refs:Object.freeze(record.original_source_claims.map(s=>Object.freeze({...s})))
});
function validate(records){
 if(!Array.isArray(records)||records.length!==18)throw new TypeError("Expected exactly 18 staged bilingual customs");
 const ids=new Set();
 for(const r of records){
  if(ids.has(r.candidate_id))throw new TypeError("Duplicate candidate ID");
  ids.add(r.candidate_id);
  if(!r.title?.en||!r.title?.fr||!r.description?.en||!r.description?.fr||
     !r.caution?.en||!r.caution?.fr||!r.source_ids?.length||
     !r.original_source_claims?.length||r.status!=="RESEARCH_CANDIDATE_NOT_PUBLISHED"||
     r.editorial?.ready_for_publication!==false||r.calendar_context?.calendar_event_automatically_published!==false)
    throw new TypeError("Incomplete or publication-unsafe research entry "+r.candidate_id);
 }
 return records;
}
function candidateMonth(record,year,month){
 const c=record.calendar_context,ym=String(year)+"-"+String(month).padStart(2,"0");
 if(c.type==="ADVENT_SEASON_ONLY"){
  const start=new Date(Date.UTC(year,10,27,12));
  while(start.getUTCDay()!==0)start.setUTCDate(start.getUTCDate()+1);
  const firstAdvent=start.toISOString().slice(0,10);
  if((month===11&&firstAdvent.slice(5,7)==="11")||month===12)
   return {anchor:null,period:"Advent (from "+firstAdvent+")",kind:"SEASON_ONLY_NO_EVENT_DATE"};
  return null;
 }
 if(c.type==="CHRISTMAS_SEASON_ONLY"){
  if(month===12||month===1)return {anchor:null,period:"Christmas season",kind:"SEASON_ONLY_NO_EVENT_DATE"};
  return null;
 }
 if(c.type==="MOVABLE_EASTER"||c.type==="MOVABLE_PENTECOST"){
  const d=v384Dates(year)[c.type==="MOVABLE_EASTER"?"easter":"pentecost"];
  if(!d.startsWith(ym))return null;
  return {anchor:d,period:c.type==="MOVABLE_EASTER"?"Easter season":"Pentecost",kind:"SEASON_FEAST_CONTEXT_NO_EVENT_CONFIRMATION"};
 }
 if(c.type==="FIXED_CONTEXT_DAY"||c.type==="FIXED_CONTEXT_RANGE"){
  const start=localIso(year,c.month_day),end=c.range_end?localIso(year,c.range_end):null;
  if(start.startsWith(ym))return {anchor:start,period:end?start+" to "+end:start,kind:"FIXED_HISTORICAL_CONTEXT_NOT_EVENT_CONFIRMATION"};
  if(end&&end.startsWith(ym))return {anchor:null,period:start+" to "+end,kind:"ONGOING_CONTEXT_NOT_LOCAL_EVENT_DATE"};
 }
 return null;
}
export function calendarStagedCustomsMonth(monthId,readModel,{fr=false}={}){
 const {year,month}=checkMonth(monthId),records=validate(readModel?.records);
 return Object.freeze(records.flatMap(r=>{
  const m=candidateMonth(r,year,month);
  if(!m)return [];
  return [shown(r,m.anchor,m.period,m.kind,fr)];
 }).sort((a,b)=>(a.representative_anchor??"9999").localeCompare(b.representative_anchor??"9999")||a.title.localeCompare(b.title)));
}
// Deliberately excludes all local-event candidates: a historic feast-date
// correspondence does not prove a real service/procession is happening.
export function calendarStagedHouseholdCustomsOnDate(date,readModel,{fr=false}={}){
 const {year,month,iso}=checkDay(date),records=validate(readModel?.records);
 return Object.freeze(records.filter(r=>{
  if(r.calendar_context.local_event_required)return false;
  const candidate=candidateMonth(r,year,month);
  return candidate?.anchor===iso;
 }).map(r=>{
  const m=candidateMonth(r,year,month);
  return shown(r,m.anchor,m.period,m.kind,fr);
 }));
}


/**
 * Non-live regional details for published Customs. Variants belong inside
 * their parent canonical article, not a second custom, feast or local event.
 * The 18-candidate date projection above remains unchanged.
 */
export function calendarStagedPublishedCustomVariants(parentCustomId,variantReadModel,{fr=false}={}){
 if(typeof parentCustomId!=="string"||!parentCustomId.trim())throw new TypeError("Expected parent custom ID");
 if(!Array.isArray(variantReadModel?.records)||variantReadModel.records.length!==22)
  throw new TypeError("Expected 22 source-bounded published-owner variants");
 const seen=new Set();
 for(const r of variantReadModel.records){
  if(seen.has(r.variant_id)||!r.owner_custom_id||!r.source_group_id||!r.content?.title_en||!r.content?.title_fr||
     !r.content?.history_en||!r.content?.history_fr||!r.content?.practice_or_context_en||
     !r.content?.practice_or_context_fr||r.presentation?.variant_not_extra_card!==true||
     r.presentation?.slot!=="EXISTING_CUSTOM_READER_REGIONAL_VARIANT"||
     r.editorial?.publication_authorized!==false||r.calendar?.feast_or_liturgical_rank_override_allowed!==false||
     !r.source?.url||!r.source?.observation_ids?.length)
   throw new TypeError("Invalid or publication-unsafe existing owner variant "+r.variant_id);
  seen.add(r.variant_id);
 }
 return Object.freeze(variantReadModel.records.filter(r=>r.owner_custom_id===parentCustomId).map(r=>Object.freeze({
  variant_id:r.variant_id,
  parent_custom_id:r.owner_custom_id,
  title:fr?r.content.title_fr:r.content.title_en,
  historical_context:fr?r.content.history_fr:r.content.history_en,
  optional_practice_or_context:fr?r.content.practice_or_context_fr:r.content.practice_or_context_en,
  region_labels:Object.freeze([...r.geographic_source_labels]),
  anchor_hint:r.calendar.anchor_key,
  date_approved:false,
  suggested_occurrence_date:null,
  source_reference:Object.freeze({url:r.source.url,printed_page:r.source.printed_page,
    observation_ids:Object.freeze([...r.source.observation_ids])}),
  is_new_custom_card:false,
  is_1962_liturgical_rubric:false,
  is_current_parish_announcement:false,
  indulgence_associated:false,
  publication_state:"RESEARCH_VARIANT_DETAIL_NOT_PUBLISHED"
 })));
}
