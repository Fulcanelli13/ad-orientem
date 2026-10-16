import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {applySaintsReleaseBoundary,SAINTS_CHANNELS} from "../src/find/saints-release-policy.js";
import {projectSaintResearchShrinePlaces,renderSaintResearchShrineSheet} from "../src/find/saints-shrine-map-research.js";
import {projectSaintSourceIndexItems} from "../src/find/saints-source-index.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const evidence=read("data/saints/w78-shrine-person-source-evidence-20261016.v1.json");
const source=read("data/saints/existing-shrine-geography-readiness-20261016.v1.json");
const cross=read("data/saints/cross-module-source-reconciliation-20261015.v1.json");
const ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
const priorCurated=read("data/saints/w78-113-shrine-name-source-evidence-20261016.v1.json");
const dataset={
 saintsShrineReadiness:source,saintsW78Evidence:evidence,
 saintsOwnerIndex:read("data/saints/read-only-calendar-art-index-20261015.v1.json"),
 geography:read("data/geography/seed-registry.v1.json"),
 shrines:read("data/shrines/shrines-pilgrimages-seed.v1.json")
};
assert.equal(evidence.schema,"ao.saints.w78-119-shrine-name-owner-source-evidence.v1");
assert.equal(evidence.status,"READ_ONLY_SOURCE_MATCH_NOT_CANONICAL_IDENTITY_ART_OR_MAP_APPROVAL");
assert.equal(evidence.records.length,119);
assert.equal(new Set(evidence.records.map(x=>x.legacy_shrine_person_or_group_name)).size,119);
assert.equal(evidence.summary.previous_exact_one,50);
assert.equal(evidence.summary.previous_exact_collisions,6);
assert.equal(evidence.summary.previous_unmatched,63);
assert.equal(evidence.summary.formerly_unmatched_with_documented_alias_to_existing_key,9);
assert.equal(evidence.summary.formerly_unmatched_with_relic_subject_evidence,45);
assert.equal(evidence.summary.formerly_unmatched_with_sacred_art_subject_evidence,14);
assert.equal(evidence.summary.formerly_unmatched_without_exact_or_documented_alias_key,54);
const reviewBuckets={EXACT_FULL_NAME_SINGLE:50,EXACT_FULL_NAME_COLLISION:6,PREVIOUSLY_RECORDED_ALIAS_LEAD:9,OTHER_CURATED_VARIANT_LEAD_UNAPPROVED:16,NO_SUPPORTED_LEDGER_KEY_LEAD:38};
for(const [bucket,count] of Object.entries(reviewBuckets))assert.equal(evidence.summary.cross_w78_name_key_partition[bucket],count);
assert.equal(evidence.summary.cross_w78_name_key_partition.distinct_unmatched_names_with_existing_key_leads,25);
assert.equal(evidence.summary.cross_w78_name_key_partition.curated_variant_leads_overlapping_previously_documented_aliases,8);
assert.equal(evidence.summary.cross_w78_name_key_partition.original_names_with_any_exact_or_existing_key_lead,81);
assert.equal(evidence.summary.cross_w78_name_key_partition.still_without_any_ledger_key_lead,38);
const batch=evidence.summary.source_reference_batch_20261016;
assert.deepEqual([batch.individual_alias_reference_lookups,batch.collective_alias_reference_lookups,batch.doctor_archived_owner_pairs_for_comparison,batch.existing_bridge_preserved,batch.collision_context_hold,batch.unchanged_source_cases],[23,2,4,1,1,88]);
assert.equal(batch.person_identity_certifications_added,0);
assert.equal(batch.geographic_pins_added,0);
assert.deepEqual([evidence.summary.w80_institutional_subject_sweep.original_shrine_only_records_reviewed,evidence.summary.w80_institutional_subject_sweep.with_official_subject_evidence,evidence.summary.w80_institutional_subject_sweep.original_608_key_gaps_remain],[15,15,38]);
assert.equal(evidence.summary.w80_institutional_subject_sweep.new_canonical_identity_keys,0);
assert.deepEqual(evidence.source_safety_hold.affected_saint_shrine_names,["Saint Beuno","Saint Winefride"]);
assert.equal(evidence.source_safety_hold.original_source_registry_modified,false);
const W80=evidence.records.filter(x=>x.institutional_subject_evidence_review);
assert.equal(W80.length,15);
assert.equal(W80.reduce((n,x)=>n+x.institutional_subject_evidence_review.references.length,0),21);
for(const row of W80){
 assert.equal(row.residual_source_owner_research_tier,"SHRINE_INSTITUTIONAL_REFERENCE_ONLY_NO_LEDGER_KEY");
 assert.equal(row.institutional_subject_evidence_review.canonical_identity_approved,false);
 assert.equal(row.institutional_subject_evidence_review.saint_person_shrine_link_production_authorized,false);
 for(const ref of row.institutional_subject_evidence_review.references){
  assert.match(ref.url,/^https:\/\//);
  assert(ref.issuer&&ref.claim_scope&&ref.evidence_mode);
  assert.equal(ref.canonical_identity_equivalence_approved,false);
  assert.equal(ref.relic_authenticity_certified,false);
 }
}
assert.deepEqual(evidence.summary.residual_source_owner_38_tiers,{
 SHARED_RELIC_OWNER_SUBJECT_NO_LEDGER_KEY:2,
 RELIC_OWNER_SUBJECT_NO_LEDGER_KEY:19,
 ART_RESEARCH_ONLY_NO_LEDGER_KEY:2,
 SHRINE_INSTITUTIONAL_REFERENCE_ONLY_NO_LEDGER_KEY:15,
 duplicated_relic_owner_subjects_across_all_119:3,
 duplicated_louis_de_montfort_name_strings:2,
 distinct_relic_subject_ids_total:92,
 relational_person_identity_approvals:0
});
assert.equal(evidence.summary.distinct_original_physical_site_ids,121);
assert.equal(evidence.summary.original_shrine_association_edges,145);
assert.equal(evidence.summary.source_reconciliation_tiers.TRUNCATED_HISTORICAL_SOURCE_KEY_CHECK,2);
assert.equal(evidence.summary.entity_type_guards.BLESSED_NOT_CANONIZED,3);
assert.equal(evidence.summary.entity_type_guards.GROUP_OR_COMPOUND_NOT_ONE_PERSON,4);
assert.equal(evidence.summary.entity_type_guards.ANGELIC_NOT_HUMAN,1);
const originals=new Map(source.rows.map(x=>[x.legacy_name_literal,x]));
const ownerSources=new Map(cross.rows.map(x=>[x.legacy_name,x]));
const keys=new Set(ledger.records.map(x=>x.source_key));
const priorVariants=new Map(priorCurated.no_exact_key.filter(x=>x.source_key_candidate).map(x=>[x.shrine_source_name,x.source_key_candidate]));
assert.equal(priorVariants.size,24);
const bucketTotals={};
for(const x of evidence.records){
 const originalStatus=x.source_key_review_bucket;
 const resolution=x.cross_owner_reference_reconciliation;
 assert(resolution&&resolution.source_identity_approved===false&&resolution.canonical_saint_id_created===false&&resolution.calendar_mass_authorized===false&&resolution.shrine_person_life_relation_approved===false);
 if(["PREVIOUSLY_RECORDED_ALIAS_LEAD","OTHER_CURATED_VARIANT_LEAD_UNAPPROVED"].includes(originalStatus)){
  assert.equal(resolution.source_references.length,1);
  assert(["PERSON_SOURCE_REFERENCE_LOOKUP_AVAILABLE","GROUP_SOURCE_REFERENCE_LOOKUP_AVAILABLE"].includes(resolution.status));
  assert.equal(resolution.lookup_scope,"RESEARCH_INDEX_ONLY");
  assert(keys.has(resolution.source_references[0].existing_source_key));
 }
 if(originalStatus==="EXACT_FULL_NAME_COLLISION"){
  assert.equal(resolution.source_references.length,2);
  assert(resolution.status==="MATCHING_HISTORICAL_DOCTOR_SOURCE_PAIR_OWNER_SIGNOFF_PENDING"||resolution.status==="EXISTING_CROSS_OWNER_SOURCE_BRIDGE_CONFIRMED"||resolution.status==="HOLD_COMPETING_SOURCES_PENDING_OWNER_ATTESTATION");
 }
 const old=originals.get(x.legacy_shrine_person_or_group_name);
 const owner=ownerSources.get(x.legacy_shrine_person_or_group_name);
 assert(old&&owner,"Original source owner record absent");
 assert.equal(x.canonical_person_id_approved,null);
 assert.equal(x.human_person_identity_certified_by_this_pass,false);
 assert.equal(x.authorized_artwork_id,null);
 assert.equal(x.new_geographical_pin_created,false);
 assert.deepEqual(x.exact_existing_source_keys,old.candidate_source_keys);
 assert.deepEqual(x.original_shrine_relationships.map(x=>x.place_id),old.physical_place_associations.map(x=>x.place_id));
 assert(x.unique_cross_source_key_candidates.every(x=>keys.has(x)));
 assert(Array.isArray(x.curated_variant_existing_key_leads));
 assert(Array.isArray(x.shared_original_relic_subject_name_references));
 for(const peer of x.shared_original_relic_subject_name_references){
  const other=evidence.records.find(y=>y.legacy_shrine_person_or_group_name===peer.other_shrine_name);
  assert(other&&other.external_owner_evidence.relic_subjects.some(y=>y.subject_id===peer.shared_owner_subject_id));
  assert(x.external_owner_evidence.relic_subjects.some(y=>y.subject_id===peer.shared_owner_subject_id));
  assert.equal(peer.relation,"SHARED_RELIC_RESEARCH_SUBJECT_NOT_CERTIFIED_PERSON_ALIAS");
 }
 if(x.source_key_review_bucket==="NO_SUPPORTED_LEDGER_KEY_LEAD")assert(x.residual_source_owner_research_tier);
 else assert.equal(x.residual_source_owner_research_tier,null);
 assert.deepEqual(x.curated_variant_existing_key_leads.map(y=>y.source_key),priorVariants.has(x.legacy_shrine_person_or_group_name)?[priorVariants.get(x.legacy_shrine_person_or_group_name)]:[]);
 assert(x.curated_variant_existing_key_leads.every(y=>keys.has(y.source_key)&&y.canonical_person_identity_approved===false&&y.shrine_person_relation_certified===false));
 bucketTotals[x.source_key_review_bucket]=(bucketTotals[x.source_key_review_bucket]??0)+1;
 assert.deepEqual(x.external_owner_evidence.relic_subjects.map(s=>s.subject_id),owner.relic_subjects.map(s=>s.subject_id));
 assert.deepEqual(x.external_owner_evidence.sacred_art_subjects.map(s=>s.subject_id),owner.sacred_art_subjects.map(s=>s.subject_id));
 assert(x.original_shrine_relationships.every(p=>p.source_ids.length&&p.canonical_person_to_place_link_authorized===false));
 assert(x.external_owner_evidence.sacred_art_subjects.every(s=>s.image_release!=="PRODUCTION_APPROVED"));
}
assert.deepEqual(bucketTotals,reviewBuckets);
assert.equal(evidence.records.find(x=>x.legacy_shrine_person_or_group_name==="Saint Wenceslas").source_key_review_bucket,"PREVIOUSLY_RECORDED_ALIAS_LEAD");
for(const n of ["Saint John the Evangelist","Saint Luke the Evangelist"]){
 assert.equal(evidence.records.find(x=>x.legacy_shrine_person_or_group_name===n).source_reconciliation_tier,"TRUNCATED_HISTORICAL_SOURCE_KEY_CHECK");
}
for(const n of ["Saint Michael the Archangel","Uganda Martyrs","The Three Magi","Saint Siviard; Saint Columba of Sens; Saint Lupus of Sens"]){
 const x=evidence.records.find(r=>r.legacy_shrine_person_or_group_name===n);
 assert(x.person_kind_guard!=="NAMED_PERSON_CANDIDATE_STATUS_UNREVIEWED");
}
const publicData=applySaintsReleaseBoundary(dataset);
assert.equal(publicData.saintsW78Evidence,null);
assert.equal(publicData.saintsShrineReadiness,null);
assert.equal(projectSaintResearchShrinePlaces(publicData).length,0);
const research=applySaintsReleaseBoundary(dataset,SAINTS_CHANNELS.RESEARCH_PREVIEW);
const projected=projectSaintResearchShrinePlaces(research);
const indexItems=new Map(["historical","later","doctors"].flatMap(scope=>projectSaintSourceIndexItems(research,scope).map(x=>[x.item_id,x])));
const siteNameRelations=new Map(projected.flatMap(site=>site.associated_saint_name_sources.map(x=>[x.source_saint_name,x])));
for(const record of evidence.records){
 const source=siteNameRelations.get(record.legacy_shrine_person_or_group_name);
 assert(source);
 assert.equal(source.cross_source_review_status,record.cross_owner_reference_reconciliation.status);
 for(const link of source.cross_source_index_links){
  assert(indexItems.has(link.item_id),"Navigation to absent source index record "+link.item_id);
  assert(["historical","later","doctors"].includes(link.scope));
 }
 if(record.cross_owner_reference_reconciliation.lookup_scope==="NONE")assert.equal(source.cross_source_index_links.length,0);
 if(["PREVIOUSLY_RECORDED_ALIAS_LEAD","OTHER_CURATED_VARIANT_LEAD_UNAPPROVED"].includes(record.source_key_review_bucket))assert(source.cross_source_index_links.length>=1);
}
assert(siteNameRelations.get("Uganda Martyrs").cross_source_index_links.some(x=>x.item_id==="saints:group:uganda-martyrs-22"));
assert(siteNameRelations.get("Saint Maurice and the Theban martyrs").cross_source_index_links.some(x=>x.item_id==="saints:historic:group.maurice-theban-legion"));
assert.equal(siteNameRelations.get("Saint Francis of Assisi").cross_source_index_links.length,0);
for(const name of ["Saint Louis de Montfort","Saint Louis-Marie de Montfort"]){
 const relation=siteNameRelations.get(name);
 assert.equal(relation.shared_relic_subject_other_shrine_names.length,1);
 assert.notEqual(relation.shared_relic_subject_other_shrine_names[0],name);
 assert.equal(relation.cross_source_index_links.length,0,"Same relic research subject cannot invent a 608-ledger source key");
}
assert(siteNameRelations.get("Saint Dominic").shared_relic_subject_other_shrine_names.includes("Saint Dominic de Guzmán"));
assert(siteNameRelations.get("Saint Nicholas of Myra").shared_relic_subject_other_shrine_names.includes("Saint Nicholas"));
assert.equal(siteNameRelations.get("Saint Anthony of Padua").cross_source_index_links.length,2);
for(const r of W80){
 const mapped=siteNameRelations.get(r.legacy_shrine_person_or_group_name);
 assert(mapped.institutional_subject_source_links.length===r.institutional_subject_evidence_review.references.length);
 assert(mapped.institutional_subject_source_links.every(x=>!["stwinefrideswell.org.uk","www.stwinefrideswell.org.uk"].includes(new URL(x.url).hostname)));
}
const holywell=projected.find(p=>p.place_id==="place:GB:holywell-st-winefride");
assert(holywell&&holywell.associated_saint_name_sources.some(x=>x.source_saint_name==="Saint Beuno"));
assert(holywell.associated_saint_name_sources.some(x=>x.source_saint_name==="Saint Winefride"));
assert(holywell.associated_saint_name_sources.every(x=>x.official_source_links.every(s=>!new URL(s.href).hostname.includes("stwinefrideswell.org.uk"))));
assert(holywell.associated_saint_name_sources.every(x=>x.institutional_subject_source_links.some(s=>new URL(s.url).hostname==="www.stwinefridesshrine.org")));
assert(holywell.associated_saint_name_sources.every(x=>x.source_ids.some(id=>id==="SHR-HOLYWELL-CONTACT")));
assert.equal(projected.length,121);
assert.equal(projected.filter(x=>x.map_publishable).length,119);
assert.equal(projected.reduce((n,x)=>n+x.associated_saint_name_sources.length,0),145);
assert(projected.flatMap(x=>x.associated_saint_name_sources).some(x=>x.external_relic_subject_ids.length));
assert(projected.flatMap(x=>x.associated_saint_name_sources).some(x=>x.recorded_alias_source_keys.length));
assert(projected.flatMap(x=>x.associated_saint_name_sources).some(x=>x.curated_variant_source_key_leads.includes("saint.giuseppina-bakhita")));
assert(projected.flatMap(x=>x.associated_saint_name_sources).every(x=>Array.isArray(x.curated_variant_source_key_leads)));
assert(projected.every(x=>x.artwork_id===null&&x.saints.length===0));
const withArt=projected.find(x=>x.associated_saint_name_sources.some(n=>n.external_art_research_subject_ids.length));
assert(withArt);
for(const lang of ["en","fr"]){
 const html=renderSaintResearchShrineSheet({language:lang,selected:withArt});
 assert(html.includes("aoSaintSourceEvidenceStatus"));
 assert(html.includes(lang==="fr"?"non approuvés":"Unapproved art research subjects"));
 const holywellHtml=renderSaintResearchShrineSheet({language:lang,selected:holywell});
 assert(!holywellHtml.includes("stwinefrideswell.org.uk"));
 assert(holywellHtml.includes("stwinefridesshrine.org"));
 assert(holywellHtml.includes("SHR-HOLYWELL-CONTACT"));
 const variantLocation=projected.find(x=>x.associated_saint_name_sources.some(n=>n.curated_variant_source_key_leads.includes("saint.giuseppina-bakhita")));
 assert(variantLocation,"Expected an existing shrine association for Josephine Bakhita");
 const navHtml=renderSaintResearchShrineSheet({language:lang,selected:variantLocation});
 assert(navHtml.includes("saint.giuseppina-bakhita"));
 assert(navHtml.includes("data-saint-crosslink-scope=\"later\""));
 assert(navHtml.includes("data-saint-crosslink-target=\"saints:modern:saint.giuseppina-bakhita\""));
 const montfortPlace=projected.find(x=>x.associated_saint_name_sources.some(n=>n.source_saint_name==="Saint Louis de Montfort"));
 assert(renderSaintResearchShrineSheet({language:lang,selected:montfortPlace}).includes("Saint Louis-Marie de Montfort"));
 assert(!html.includes("<img"));
 assert(!html.includes("data-calendar-mass"));
}
console.log("PASS W78 119 names: 50 exact, 6 ambiguous, 9 prior aliases, 16 other curated leads, 38 without existing key leads; source-linked 145 physical relations, zero new identities/pins/art");
