import {buildLiturgicalYear} from "../calendar/liturgical-year.js";
// Curated Customs + Glossary discoveries for the existing Home DYK surface.
// The source is the extensible bilingual discovery projection. Historical source
// provenance remains in the separate research registry, not in the app bundle.
const SOURCE=new URL("../../data/did-you-know/dyk-customs-glossary-520.v1.json",import.meta.url);
const SCHEMA="AO_DYK_CUSTOMS_GLOSSARY_520_V1";
const DISCOVERY_TOPICS=new Set(["CUSTOMS","PILGRIMAGE","CHURCH_HISTORY","LITURGY","DEVOTION","DOCTRINE","LATIN","ARCHITECTURE","CANON_LAW"]);
const LITURGICAL_PERIODS=new Set(["advent","christmas","epiphany","after-epiphany","septuagesima","lent","passion","easter","ascension","pentecost","after-pentecost"]);
const OBSERVANCES=new Set(["HOLY_THURSDAY","GOOD_FRIDAY","HOLY_SATURDAY","PALM_SUNDAY","LAETARE","ASH_WEDNESDAY","EASTER_MONDAY","PENTECOST_TUESDAY","PENTECOST_MONDAY","CORPUS_CHRISTI","TRINITY_SUNDAY","ASCENSION","SACRED_HEART","SEPTUAGESIMA","CHRIST_KING","MINOR_ROGATIONS","GREATER_ROGATION","HOLY_WEEK","EASTER","PENTECOST","SHROVE_TUESDAY"]);

const isUrl=s=>typeof s==="string"&&/^https:\/\/[^\s<>"']+$/.test(s);
const clean=s=>typeof s==="string"?s.trim():"";
const validDate=s=>{
 if(typeof s!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;
 const d=new Date(s+"T12:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s;
};
const norm=s=>clean(s).normalize("NFKC").toLocaleLowerCase().replace(/\s+/g," ");
const calendarField=(value,allowed,max=6)=>{
 if(!Array.isArray(value)||value.length<1||value.length>max)return false;
 const seen=new Set(value);
 return seen.size===value.length&&value.every(v=>typeof v==="string"&&allowed(v));
};
const validMonthDay=value=>{
 if(typeof value!=="string"||!/^\d{2}-\d{2}$/.test(value))return false;
 const d=new Date("2024-"+value+"T12:00:00Z");
 return !Number.isNaN(d.getTime())&&d.toISOString().slice(5,10)===value;
};
function validContext(c){
 if(c===undefined)return true;
 if(!c||typeof c!=="object"||Array.isArray(c))return false;
 const keys=Object.keys(c);
 return keys.length>=1&&keys.every(k=>["fixed_dates","observances","seasons"].includes(k))&&
  (c.fixed_dates===undefined||calendarField(c.fixed_dates,validMonthDay,8))&&
  (c.observances===undefined||calendarField(c.observances,v=>OBSERVANCES.has(v),4))&&
  (c.seasons===undefined||calendarField(c.seasons,v=>LITURGICAL_PERIODS.has(v),6));
}

let pending=null;
export function loadDyk520Release(win=globalThis){
 if(pending)return pending;
 pending=Promise.resolve().then(async()=>{
  const r=await win.fetch(SOURCE,{cache:"no-store"});
  if(!r?.ok)throw Error("DYK_520_UNAVAILABLE");
  return r.json();
 }).catch(error=>{pending=null;throw error;});
 return pending;
}
// Validate the entire publication input: malformed rows never become Home facts.
export function dyk520Candidates(data,date){
 if(!validDate(date)||data?.schema!==SCHEMA||
    data.release_stage!=="INTEGRATED_CONTENT"||
    data.counts?.customs!==378||data.counts?.glossary<142||
    data.count!==data.counts.customs+data.counts.glossary||
    !Array.isArray(data.records)||data.records.length!==data.count)return [];
 const ids=new Set(),titles={en:new Set(),fr:new Set()},facts={en:new Set(),fr:new Set()};
 let customs=0,glossary=0;
 for(const r of data.records){
  if(!/^DYK-[A-Z0-9-]+$/.test(r?.id||"")||ids.has(r.id)||
     !["CUSTOMS","GLOSSARY"].includes(r.category)||
     !clean(r.title?.en)||!clean(r.title?.fr)||
     clean(r.fact?.en).length<25||clean(r.fact?.fr).length<25||
     !clean(r.source?.id)||!isUrl(r.source?.url)||
     !Array.isArray(r.source.alternative_urls)||
     !r.source.alternative_urls.every(isUrl)||
     (r.glossary_concept_id!==undefined&&
       (r.category!=="GLOSSARY"||!/^G\d{3}$/.test(r.glossary_concept_id)||
       !r.id.includes("-"+r.glossary_concept_id+"-")))||
     (r.calendar_cue!==undefined&&!["FIRST_FRIDAY","FIRST_SATURDAY"].includes(r.calendar_cue))||
     !DISCOVERY_TOPICS.has(r.discovery_topic)||
     !validContext(r.calendar_context))return [];
  ids.add(r.id);
  for(const lang of ["en","fr"]){
   const title=norm(r.title[lang]),fact=norm(r.fact[lang]);
   if(titles[lang].has(title)||facts[lang].has(fact))return [];
   titles[lang].add(title);facts[lang].add(fact);
  }
  if(r.category==="CUSTOMS")customs++;else glossary++;
 }
 if(customs!==data.counts.customs||glossary!==data.counts.glossary)return [];
 return data.records.map(r=>({
  id:r.id,category:r.category,title:r.title,
  pilot_home_copy:r.fact,source_family:"CURATED_CUSTOMS_GLOSSARY_2026",
  source_id:r.source.id,source:r.source,
  glossary_concept_id:r.glossary_concept_id??(/^DYK-GL-(G\d{3})-\d{2}$/.exec(r.id)?.[1]??null),
  discovery_topic:r.discovery_topic,calendar_cue:r.calendar_cue??null,
  calendar_context:r.calendar_context??null
 }));
}
export function dyk520Model(data,id,date,language="en"){
 const row=dyk520Candidates(data,date).find(r=>r.id===id);
 if(!row)return null;
 const fr=language==="fr";
 return Object.freeze({
  id:row.id,language:fr?"fr":"en",
  title:row.title[fr?"fr":"en"],
  fact:row.pilot_home_copy[fr?"fr":"en"],
  label:row.category==="CUSTOMS"?
    (fr?"Coutumes et traditions":"Customs and traditions"):
    (fr?"Découvertes du glossaire":"Glossary discoveries"),
  sourceId:row.source_id,sourceUrl:row.source.url,
  glossaryConceptId:row.glossary_concept_id,
  links:[{page:null,url:row.source.url,
    label:fr?"Consulter la source":"Read the source"}],
  published:true
 });
}

// Educational relevance is not a declaration that a custom is the principal
// Mass or feast observed under the 1962 rubrics. Calendar remains authoritative.
// All date calculations use the shared year model, never a DYK-specific Easter.
const shiftIso=(date,days)=>new Date(Date.parse(date+"T12:00:00Z")+days*86400000).toISOString().slice(0,10);
const isoOrdinal=date=>Math.floor(Date.parse(date+"T12:00:00Z")/86400000);
function calendarFor(date){
 const year=buildLiturgicalYear(date),e=year.easter;
 const plus=n=>shiftIso(e,n);
 const corpus=plus(60),pentecost=plus(49),christKing=()=>{
  const y=Number(date.slice(0,4));
  const oct31=y+"-10-31",day=new Date(oct31+"T12:00:00Z").getUTCDay();
  return shiftIso(oct31,-day);
 };
 return {
  period:year.currentPeriod.id,
  events:{
   HOLY_THURSDAY:[plus(-3)],GOOD_FRIDAY:[plus(-2)],HOLY_SATURDAY:[plus(-1)],
   PALM_SUNDAY:[plus(-7)],LAETARE:[plus(-21)],ASH_WEDNESDAY:[plus(-46)],
   EASTER_MONDAY:[plus(1)],PENTECOST_TUESDAY:[plus(51)],PENTECOST_MONDAY:[plus(50)],
   CORPUS_CHRISTI:[corpus],TRINITY_SUNDAY:[plus(56)],ASCENSION:[plus(39)],
   SACRED_HEART:[plus(68)],SEPTUAGESIMA:[plus(-63)],CHRIST_KING:[christKing()],
   MINOR_ROGATIONS:[plus(36),plus(37),plus(38)],GREATER_ROGATION:[date.slice(0,4)+"-04-25"],
   HOLY_WEEK:[-6,-5,-4,-3,-2,-1].map(plus),EASTER:[e],
   PENTECOST:[pentecost],SHROVE_TUESDAY:[plus(-47)]
  }
 };
}
function monthlyCueMatches(r,date){
 if(!r.calendar_cue)return true;
 const day=Number(date.slice(8,10)),weekday=new Date(date+"T12:00:00Z").getUTCDay();
 return day<=7&&(r.calendar_cue==="FIRST_FRIDAY"?weekday===5:weekday===6);
}
function contextualMatches(r,date,year,{near=false}={}){
 const c=r.calendar_context;
 if(!c)return false;
 const isoDates=[date,...(near?[-2,-1,1,2].map(n=>shiftIso(date,n)):[])];
 const dates=new Set(isoDates),monthDays=new Set(isoDates.map(x=>x.slice(5)));
 if(c.fixed_dates?.some(md=>monthDays.has(md)))return true;
 if(c.observances?.some(key=>(year.events[key]||[]).some(d=>dates.has(d))))return true;
 if(c.seasons?.includes(year.period))return true;
 return false;
}
// Evergreen items stay available all year. Contextual items are eligible only
// near their reviewed dates, on the named movable observance, or in season.
export function dyk520EligibleCandidates(data,date){
 if(!validDate(date))return [];
 const rows=dyk520Candidates(data,date),year=calendarFor(date);
 return rows.filter(r=>monthlyCueMatches(r,date)&&
  (!r.calendar_context||contextualMatches(r,date,year,{near:true})));
}
// First Fridays/Saturdays have the highest priority, then exact dates and
// named movable observances. Seasonal cards are favoured on two of three days;
// the remaining days retain full eligible-bank variety.
export function dyk520CalendarCandidates(data,date){
 if(!validDate(date))return [];
 const rows=dyk520EligibleCandidates(data,date);
 if(!rows.length)return [];
 const cue=rows.filter(r=>r.calendar_cue);
 if(cue.length)return cue;
 const year=calendarFor(date),md=date.slice(5);
 const exact=rows.filter(r=>r.calendar_context&&(
  r.calendar_context.fixed_dates?.includes(md)||
  r.calendar_context.observances?.some(key=>(year.events[key]||[]).includes(date))));
 if(exact.length)return exact;
 if(isoOrdinal(date)%3===0)return [];
 return rows.filter(r=>r.calendar_context?.seasons?.includes(year.period));
}
