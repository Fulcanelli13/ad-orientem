// Source-ID exact join of recovered original v43.33 saint-art COMPONENTS
// (historical image identities, NOT 311 unique Catholic saints) to the
// current Ad Orientem 2026 observed Roman calendar. No string-based identity
// promotion or art approval, and no calendar authority changes.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const historic=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const observed=read("artifacts/saints-calendar-census/saints-calendar-2026-observed-owner-census.json");
assert.equal(historic.schema,"ao.saints.v4333-original-311-historical-component-instances.v1");
assert.equal(historic.date_count,252);
assert.equal(historic.component_count,311);
assert.equal(observed.days.length,365);
const monthCounts=Object.fromEntries(Array.from({length:12},(_,i)=>[String(i+1).padStart(2,"0"),{days:0,components:0}]));
const daysMap=new Map(observed.days.map(d=>[d.date,d]));
const historyComponentSet=new Set();
const summary={historical_dates:0,historical_components:0,source_observance_occurrences:0,
 source_observed_as_principal:0,source_exactly_commemorated:0,source_no_exact_same_date_match:0,
 source_nominal_path_same_but_rank_or_color_changed:0,
 dates_with_at_least_one_principal_source:0,dates_with_only_commemorated_sources:0,
 dates_with_no_exact_observed_historic_source:0,
 no_exact_observed_with_sanctoral_source_variant:0,
 no_exact_observed_temporale_override:0,
 no_exact_observed_sunday_override:0,
 groups_or_traditions:0,source_evidence_overrides:0,
 unique_historical_ids:0, new_person_id_promotions:0,new_approved_artwork_bindings:0};
const distinctIds=new Set();
const rows=historic.rows.map(row=>{
 const date="2026-"+row.date,day=daysMap.get(date);
 assert(day,"Observed Calendar day absent "+date);
 const principalId=day.principal.source_id;
 const commIds=new Set((day.commemorations.canonical_rows||[]).map(c=>c.source_id).filter(Boolean));
 const normalize=value=>String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
 const source_observances=row.original_source_observances.map(o=>{
  const match=o.id===principalId?"EXACT_PRINCIPAL_SOURCE_ID":
              commIds.has(o.id)?"EXACT_NAMED_COMMEMORATION_SOURCE_ID":
              "NOT_EXACTLY_OBSERVED_ON_2026_NOMINAL_DATE";
  const firstTwo=id=>String(id).split(":").slice(0,2).join(":");
  const sameNominalSourceChangedRankColor=match==="NOT_EXACTLY_OBSERVED_ON_2026_NOMINAL_DATE"
    &&o.id!==principalId&&firstTwo(o.id)===firstTwo(principalId)
    &&normalize(o.title)===normalize(day.principal.title_en);
  if(sameNominalSourceChangedRankColor)summary.source_nominal_path_same_but_rank_or_color_changed++;
  summary.source_observance_occurrences++;
  if(match==="EXACT_PRINCIPAL_SOURCE_ID")summary.source_observed_as_principal++;
  else if(match==="EXACT_NAMED_COMMEMORATION_SOURCE_ID")summary.source_exactly_commemorated++;
  else summary.source_no_exact_same_date_match++;
  return{
   historical_source_id:o.id,
   historical_source_title:o.title,
   source_scope:o.scope_reason,
   original_art_scope_excluded:o.excluded_from_art_scope,
   observed_match_kind:match,
   possible_same_observance_source_rank_or_colour_revision:sameNominalSourceChangedRankColor,
   current_2026_source_id_if_candidate:sameNominalSourceChangedRankColor?principalId:null,
  };
 });
 const principal=source_observances.some(x=>x.observed_match_kind==="EXACT_PRINCIPAL_SOURCE_ID");
 const comm=source_observances.some(x=>x.observed_match_kind==="EXACT_NAMED_COMMEMORATION_SOURCE_ID");
 if(principal)summary.dates_with_at_least_one_principal_source++;
 else if(comm)summary.dates_with_only_commemorated_sources++;
 else{
  summary.dates_with_no_exact_observed_historic_source++;
  if(source_observances.some(x=>x.possible_same_observance_source_rank_or_colour_revision))
   summary.no_exact_observed_with_sanctoral_source_variant++;
  if(day.principal.observed_cycle==="temporale")summary.no_exact_observed_temporale_override++;
  if(/\bsunday\b/i.test(day.principal.title_en))summary.no_exact_observed_sunday_override++;
 }
 const components=row.components.map((c,i)=>{
  assert(c.historical_component_id&&!historyComponentSet.has(c.historical_component_id));
  historyComponentSet.add(c.historical_component_id);
  if(c.historical_identity_id)distinctIds.add(c.historical_identity_id);
  if(c.historical_representation_mode!=="individual")summary.groups_or_traditions++;
  if(c.historical_override)summary.source_evidence_overrides++;
  return{
   historical_component_id:c.historical_component_id,
   historical_identity_id:c.historical_identity_id,
   historical_display_name:c.display_name,
   historical_representation_mode:c.historical_representation_mode,
   historical_companion_model:c.companion_model,
   historical_override:!!c.historical_override,
   historical_identity_status:c.historical_identity_status,
   source_assignment_scope:"DATE_LEVEL_SOURCE_EVIDENCE_UNLESS_EXACT_ARCHIVED_COMPONENT_OVERRIDE_PROVIDES_OWN_LINK",
   canonical_current_saint_id:null,
   approved_current_artwork_id:null,
  };
 });
 assert(components.length);
 const m=row.date.slice(0,2);
 monthCounts[m].days++;monthCounts[m].components+=components.length;
 return{
  calendar_mm_dd:row.date,
  observed_date_2026:date,
  observed_main_source_id:principalId,
  observed_main_title:day.principal.title_en,
  observed_main_cycle:day.principal.observed_cycle,
  observed_exact_commemoration_ids:[...commIds],
  source_observances,
  historical_art_components:components,
  source_overlap_summary:principal?"SOME_HISTORICAL_SOURCE_IS_PRINCIPAL":
                         comm?"ONLY_EXACT_COMMEMORATIONS_MATCH":"NO_EXACT_HISTORICAL_SOURCE_MATCH_ON_DATE",
  person_identity_completeness:"NOT_CERTIFIED_FROM_SOURCE_DATE_JOIN",
  nominal_1962_title_count_claim:"NONE",
  image_coverage_status:"NOT_ASSESSED_AGAINST_CURRENT_PHYSICAL_ART_AND_RATINGS"
 };
});
summary.historical_dates=rows.length;
summary.historical_components=rows.reduce((n,r)=>n+r.historical_art_components.length,0);
summary.unique_historical_ids=distinctIds.size;
assert.equal(summary.historical_dates,252);
assert.equal(summary.historical_components,311);
assert.equal(summary.unique_historical_ids,307);
assert.equal(historyComponentSet.size,311);
assert.equal(summary.dates_with_at_least_one_principal_source+
 summary.dates_with_only_commemorated_sources+summary.dates_with_no_exact_observed_historic_source,252);
assert.equal(summary.source_observed_as_principal+summary.source_exactly_commemorated+summary.source_no_exact_same_date_match,
 summary.source_observance_occurrences);
for(const [m,values] of Object.entries(monthCounts)){
 const historicalMonth=historic.historical_monthly[m];
 assert.deepEqual([values.days,values.components],historicalMonth,"Frozen monthly source inventory drift "+m);
}
const output={
 schema:"ao.saints.v4333-art-components-to-observed-2026.v1",
 publication:"RESEARCH_ONLY_NO_CANONIZATION_OR_ART_PROMOTION",
 source_historical:"data/saints/historical-v4333-311-components.recovered.v1.json",
 source_observed:"tests/saints-calendar-year-census.mjs; 365-day original main Calendar owner observed 2026",
 join_rule:"Only exact original raw Sanctoral source IDs vs observed 2026 principal or named commemoration source IDs; no person-name substring joins",
 boundary:"One date can contain multiple raw observances and multiple artwork components; this does not assert one person per component, nor that all source titles were commemorated when one matches",
 source_sha:historic.frozen_original_sha256,
 summary,monthly:monthCounts,
 rows
};
const out=resolve(root,"artifacts/saints-calendar-census/saints-v4333-311-component-observed-2026-join.json");
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,JSON.stringify(output,null,2)+"\n");
console.log("PASS: 311 original v43.33 artwork-component records source-joined to 365 actual 2026 observed days: "+JSON.stringify(summary));
