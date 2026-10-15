// Build a non-authoritative visual/content demand index from a real day-resolver
// snapshot. Do not manufacture saint identities from liturgical feast titles.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {mkdirSync} from "node:fs";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const input=resolve(root,"artifacts/saints-calendar-census/saints-calendar-2026-observed-owner-census.json");
const output=resolve(root,"artifacts/saints-calendar-census/saints-2026-daily-subject-demand-review.json");
const audit=JSON.parse(readFileSync(input,"utf8"));
assert.equal(audit.schema,"ao.saints.2026-observed-liturgical-day-census.v1");
assert.equal(audit.days.length,365);
const src=(text)=>String(text??"").trim();
const hint=title=>{
 const name=src(title).toLowerCase();
 if(!name)return "TITLE_UNAVAILABLE_REVIEW";
 if(/\b(?:blessed virgin|virgin mary|our lady|immaculate|mary|marian|assumption|purification|annunciation|visitation|rosary)\b/.test(name))
   return "MARIAN_OR_MARIAN_CONTEXT_REVIEW";
 if(/\b(?:of our lord|of the lord|christ|jesus|saviour|precious blood|transfiguration|eucharist|epiphany)\b/.test(name))
   return "CHRISTOLOGICAL_OR_EVENT_REVIEW";
 if(/\b(?:saints|sts\.|martyrs|brothers|companions|seven holy|holy innocents)\b/.test(name))
   return "COLLECTIVE_OR_GROUP_REVIEW";
 if(/\b(?:st\.|saint|holy)\b/.test(name))
   return "INDIVIDUAL_OR_PERSON_TITLE_REVIEW";
 if(/\b(?:feria|sunday|saturday|vigil|octave)\b/.test(name))
   return "LITURGICAL_DAY_OR_EVENT_REVIEW";
 return "UNCLASSIFIED_SOURCE_TITLE_REVIEW";
};
const rows=audit.days.map(day=>{
 const p=day.principal,comm=day.commemorations;
 const main=p.observed_cycle==="sanctorale"?{
   entry_type:"OBSERVED_SANCTORAL_PRINCIPAL_TITLE",
   source_id:p.source_id,title_en:p.title_en,title_fr:p.title_fr,
   title_hint:hint(p.title_en),identity_id:null,identity_state:"PERSON_GROUP_OR_EVENT_ADJUDICATION_PENDING",
   physical_artwork_id:null,art_status:"NOT_CHECKED_AGAINST_APPROVED_ART_OWNER"}:null;
 const names=comm.labels_en.map((label,i)=>({
   entry_type:"OBSERVED_NAMED_COMMEMORATION_TITLE",
   // No synthetic identity is added when source material only has a name.
   source_id:comm.canonical_rows.find(x=>x.title===label)?.source_id||null,
   title_en:label,title_fr:comm.labels_fr[i]??null,
   title_hint:hint(label),identity_id:null,
   identity_state:"NO_PERSON_ID_ASSIGNMENT_FROM_TEXT_ALONE",
   physical_artwork_id:null,art_status:"NOT_CHECKED_AGAINST_APPROVED_ART_OWNER",
   prayer_source_paths:comm.proper_prayers.map(x=>x.prayer_source_path).filter(Boolean),
 }));
 return {date:day.date,principal_source_id:p.source_id,principal_title_en:p.title_en,
   observed_source_cycle:p.observed_cycle,source_proper_rank:p.raw_rank,
   candidate_subject_demands:[...(main?[main]:[]),...names],
   candidate_count:Number(Boolean(main))+names.length,
   calendar_artwork_daily_coverage:"NOT_YET_AUDITED",
   saint_of_day_artwork_coverage:"NOT_YET_AUDITED"};
});
assert.equal(rows.length,365);
const n=rows.reduce((n,x)=>n+x.candidate_count,0);
assert.equal(n,165+117);
const observedIds=new Set(audit.days.map(x=>x.principal.source_id));
assert(rows.every(x=>observedIds.has(x.principal_source_id)));
assert(rows.every(x=>x.candidate_subject_demands.every(d=>
  d.identity_id===null&&d.physical_artwork_id===null
  &&d.identity_state&&d.title_hint)));
const stats={days:365,source_observed_sanctoral_main_titles:165,
 named_commemoration_occurrences:117,unadjudicated_illustration_subject_mentions:n,
 days_with_any_subject_mentions:rows.filter(x=>x.candidate_count>0).length,
 group_title_hints:rows.flatMap(x=>x.candidate_subject_demands).filter(x=>x.title_hint==="COLLECTIVE_OR_GROUP_REVIEW").length,
 marian_context_title_hints:rows.flatMap(x=>x.candidate_subject_demands).filter(x=>x.title_hint==="MARIAN_OR_MARIAN_CONTEXT_REVIEW").length,
 identities_promoted_to_people:0,artwork_masters_selected:0};
mkdirSync(dirname(output),{recursive:true});
writeFileSync(output,JSON.stringify({
 schema:"ao.saints.2026-observed-daily-subject-demand.v1",status:"EDITORIAL_QUEUE_ONLY",
 source_run:"https://github.com/Fulcanelli13/ad-orientem/actions/runs/38729330632",
 source_extractor:"tests/saints-calendar-year-census.mjs",
 source_file:"saints-calendar-2026-observed-owner-census.json",
 policy:"No automatic saints from headings; feast titles may represent persons, martyrs groups, Marian/christological events or commemorations of ferias. Illustration needs are UNREVIEWED and not evidence of a suitable image.",
 counters:stats,days:rows},null,2)+"\n");
console.log("PASS Saints day subject and illustration-demand review index: "+JSON.stringify(stats));
