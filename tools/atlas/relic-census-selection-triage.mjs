#!/usr/bin/env node
// Non-publishing subject → object → custodian research comparison.
// It is deliberately impossible to promote map pins or certify saints from this script.
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const files=[
 "data/explore/worldwide-relic-subject-census.research.v1.json",
 ...[2,3,4,5,6].map(n=>`data/explore/worldwide-relic-subject-census.wave${n}.research.v1.json`)
];
const [w1,w2,w3,w4,w5,w6]=files.map(read);
const geo=read("data/geography/seed-registry.v1.json");
const knownPlaces=new Map(geo.places.map(x=>[x.place_id,x.name.official]));
const sourceObjects=[
 ...w1.institutional_custody_evidence.map(x=>({id:x.evidence_id,subject_id:x.subject_id,place:x.reported_custodian,source:x.source_url,role:x.source_role,status:x.custody_finding,material:x.object_material_kind})),
 ...w2.custody_claims.map(x=>({id:x.evidence_id,subject_id:x.subject_id,place:x.reported_custodian,source:x.source_url,role:x.source_role,status:x.custody_status,material:x.material_kind})),
 ...w3.custody_claims.map(x=>({id:x.evidence_id,subject_id:x.subject_id,place:x.reported_custodian,source:x.source_url,role:x.source_role,status:x.custody_status,material:x.material_kind})),
 ...w4.new_institutional_case_reviews.map(x=>({id:x.evidence_id,subject_id:x.subject_id,place:x.reported_custodian,source:x.source_url,role:x.source_role,status:x.reported_custody_status,material:x.material_kind})),
 ...w5.new_cases.map(x=>({id:x.case_id,subject_id:x.subject_id,place:x.claimed_custodian,source:x.source_url,role:x.source_role,status:x.custody_status,material:x.material_kind})),
 ...w6.screened_cases.map(x=>({id:x.case_id,subject_id:x.subject_id,place:x.reported_site,source:x.source_url,role:x.source_role,status:x.custody_status,material:x.material_kind}))
];
const legacy=w1.legacy_object_crosswalk;
const wave3Devotion=new Map(w3.devotional_significance_reviews.map(x=>[x.subject_id,x]));
const labels=new Map(w1.subjects.map(s=>[s.subject_id,s.label_en]));
const sourceIds=new Set();
for(const c of sourceObjects){
 if(!labels.has(c.subject_id))throw Error("Unknown subject "+c.subject_id);
 if(sourceIds.has(c.id))throw Error("Duplicate evidence "+c.id);
 sourceIds.add(c.id);
 if(!c.source?.startsWith("https://"))throw Error("Bad source "+c.id);
}
const negative=/HISTORIC|ANCIENT_|NO_PRESENT|NOT_RECOVER|LOST|DESTROY|MEMORIAL|MARTYRDOM|MARTYR_BODY|MARTYR_ASHES|UNCONFIRMED|UNVERIFIED|UNRESOLVED|TEMPORARY|TRAVEL|MOVEMENT|NOT_PROVEN|UNDETERMINED|MIXED|UNKNOWN|CURRENT_CUSTODIAN_UNCONFIRMED/i;
const classify=(record)=>{
 if(negative.test(record.status||"")||negative.test(record.material||""))return "HISTORIC_OR_UNRESOLVED_DO_NOT_CLAIM_BODILY_CUSTODY";
 if(/BODILY|BODY|REMAINS|FRAGMENT|SKULL|MAJOR_PART/.test(record.material||""))return "BODILY_CUSTODY_CANDIDATE_ATTRIBUTION_UNVERIFIED";
 if(/GARMENT|TEXTILE|PASSION|CONTACT|CLOTH/.test(record.material||""))return "ASSOCIATED_OR_SACRED_OBJECT_CLASS_UNVERIFIED";
 return "UNCLASSIFIED_OBJECT_OR_SITE";
};
const rows=w1.systematic_subject_backlog.map(t=>{
 const subj=t.subject_id;
 const cases=sourceObjects.filter(x=>x.subject_id===subj);
 const prior=legacy.filter(x=>x.subject_id===subj);
 const distinctEvidenceSources=[...new Set([...cases.map(x=>x.source),...prior.map(x=>x.primary_or_institutional_source_url)])];
 const placeEvidence=new Map();
 for(const c of cases){
  const key=(c.place||"UNKNOWN").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/-+$/,"");
  if(!placeEvidence.has(key))placeEvidence.set(key,{site:c.place||"UNKNOWN",evidence_ids:[],screened_object_types:[],research_qualifications:[]});
  const p=placeEvidence.get(key);p.evidence_ids.push(c.id);p.screened_object_types.push(c.material);p.research_qualifications.push(classify(c));
 }
 for(const l of prior){
  const key="canonical:"+l.custody_place_id;
  if(!placeEvidence.has(key))placeEvidence.set(key,{site:knownPlaces.get(l.custody_place_id)||l.custody_place_id,existing_place_id:l.custody_place_id,evidence_ids:[],screened_object_types:[],research_qualifications:[]});
  const p=placeEvidence.get(key);p.evidence_ids.push(l.legacy_relic_id);p.screened_object_types.push(l.material_research_bucket);p.research_qualifications.push("LEGACY_CUSTODY_LINK_NOT_REAUTHENTICATED");
 }
 const linkedSites=[...placeEvidence.values()].map(p=>({...p,screened_object_types:[...new Set(p.screened_object_types)],research_qualifications:[...new Set(p.research_qualifications)],publication_status:"REVIEW_ONLY_NO_MAP_WRITE"}));
 const ongoing=cases.filter(c=>classify(c)==="BODILY_CUSTODY_CANDIDATE_ATTRIBUTION_UNVERIFIED");
 return {subject_id:subj,name:labels.get(subj),coverage_family:t.coverage_family,reported_case_count:cases.length,legacy_object_count:prior.length,documentary_source_count:distinctEvidenceSources.length,devotional_signal:wave3Devotion.get(subj)?.cult_reach_signal||"NO_STANDARDIZED_DEVOTIONAL_REACH_DECISION",liturgical_calendar_1962:"NOT_CERTIFIED",popularity_vs_obscurity:"NOT_SCORED_IN_THIS_CENSUS",bodily_custody_candidate_count:ongoing.length,sites_for_editorial_comparison:linkedSites,world_map_decision:"REQUIRES_HUMAN_SOURCE_AND_SIGNIFICANCE_GATE",relic_authentication:"NOT_CERTIFIED_BY_THIS_CENSUS"};
});
const byId=new Map(rows.map(x=>[x.subject_id,x]));
const report={schema:"SACRED_ATLAS_RELIC_SUBJECT_COMPARATIVE_TRIAGE_V1",global_exhaustiveness:false,subjects:rows.length,cases:sourceObjects.length,preserved_legacy_relics:legacy.length,subjects_with_bodily_custody_candidates:rows.filter(x=>x.bodily_custody_candidate_count).length,subjects_with_multiple_reported_sites:rows.filter(x=>x.sites_for_editorial_comparison.length>1).length,map_pins_added:0,rows};
if(process.argv.includes("--json"))console.log(JSON.stringify(report,null,2));
else console.log(JSON.stringify({schema:report.schema,subjects:report.subjects,cases:report.cases,legacy_relics:report.preserved_legacy_relics,subjects_with_bodily_custody_candidates:report.subjects_with_bodily_custody_candidates,subjects_with_multiple_reported_sites:report.subjects_with_multiple_reported_sites,world_map_pins_added:0,examples:["subject:saint-thomas-the-apostle","subject:saint-francis-xavier","subject:saint-martha-of-bethany","subject:saint-pedro-calungsod"].map(id=>({id,found:!!byId.get(id),sites:byId.get(id)?.sites_for_editorial_comparison.length}))},null,2));
