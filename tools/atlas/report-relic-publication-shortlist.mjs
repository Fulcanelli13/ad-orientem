#!/usr/bin/env node
// Source-first publication preview; this script reads research artifacts but never alters the atlas.
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const reach=read("data/explore/relic-subject-devotional-reach.review.v1.json");
const selected=read("data/explore/relic-atlas-site-selection.review.v1.json");
const special=read("data/explore/relic-exceptional-sacred-objects.review.v1.json");
const byPlace=new Map();
for(const s of selected.site_decisions){
 let k=s.candidate_site_key;
 if(!byPlace.has(k))byPlace.set(k,{site_key:k,name:s.site_name,existing_place_id:s.existing_place_id,subjects:[],highest_recommendation:"",source_urls:new Set(),candidate_for_new_publication:!s.existing_place_id});
 const item=byPlace.get(k);
 item.subjects.push(s.subject_id);
 for(const u of s.evidence_sources)item.source_urls.add(u);
 const priority={"WORLD_ANCHOR":3,"REGIONAL_ANCHOR":2,"HISTORICAL_ASSOCIATION":1};
 if((priority[s.visibility_recommendation]||0)>(priority[item.highest_recommendation]||0))item.highest_recommendation=s.visibility_recommendation;
}
const places=[...byPlace.values()].map(x=>({...x,source_urls:[...x.source_urls],subjects:[...new Set(x.subjects)],release_gate:x.existing_place_id?"EXISTING_PIN_NO_CHANGE":"NEEDS_OFFICIAL_ADDRESS_GEO_AND_ACCESS_VALIDATION"}));
const summary={
 schema:"SACRED_ATLAS_RELIC_SELECTION_PREVIEW_V1",
 priority_subject_count:reach.rows.length,
 religious_scope_evidence_cases:reach.rows.filter(x=>x.assessed_devotional_reach!=="UNASSESSED").length,
 scope_unassessed:reach.rows.filter(x=>x.assessed_devotional_reach==="UNASSESSED").length,
 saint_relic_site_associations:selected.site_decisions.length,
 distinct_saint_relic_sites:places.length,
 existing_site_reuse:places.filter(x=>x.existing_place_id).length,
 new_site_candidates:places.filter(x=>!x.existing_place_id).length,
 repeated_site_subject_associations:selected.site_decisions.length-places.length,
 exceptional_sacred_object_groupings:special.groups.length,
 excluded_or_context_only_cases:selected.nonpublication_cases.length,
 production_pins_created:0
};
if(summary.distinct_saint_relic_sites!==selected.summary.unique_sites)throw Error("Selected sites drifted");
if(summary.new_site_candidates!==selected.summary.new_distinct_sites)throw Error("New Place candidate count drifted");
if(process.argv.includes("--json"))console.log(JSON.stringify({...summary,places},null,2));
else console.log(JSON.stringify(summary,null,2));
