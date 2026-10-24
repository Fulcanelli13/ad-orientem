#!/usr/bin/env node
import fs from "node:fs";
import assert from "node:assert/strict";
const P="data/research/";
const read=f=>JSON.parse(fs.readFileSync(P+f,"utf8"));
const j=read("sacred-art-b48-383-preserved-image-and-publication-gates.json");
const p=read("sacred-art-b27-physical-summary.json");
const last=read("sacred-art-b47-383-offline-preview-no-publication-closeout.json");
const csv=fs.readFileSync(P+"sacred-art-b48-383-photo-preservation-ledger.csv","utf8");
assert.equal(j.schema,"AO_B48_ALL_383_SACRED_ART_PHYSICAL_PRESERVATION_AND_RELEASE_CENSUS_V1");
assert.equal(j.active_frozen_artworks,383);
assert.equal(j.frozen_artwork_catalogue_total,451);
assert.equal(j.frozen_rejected,68);
assert.equal(j.frozen_approved_historical_decisions,107);
assert.equal(j.B26_older_original_physical_files_previously_byte_verified,290);
assert.equal(j.B26_older_original_bytes_previously_byte_verified,3076497763);
assert.equal(j.B26_older_original_distinct_SHA,p.distinct_binary_sha256);
assert.equal(j['B26_older_active_artwork_IDs_with_SHA-linked_original'],245);
assert.equal(j.B29_B44_later_archive_original_file_count,122);
assert.equal(j.B29_B44_later_archive_image_bytes,710773181);
assert.equal(j.combined_early_and_later_image_file_instances_before_crosswave_dedupe,412);
assert.equal(j.combined_early_and_later_image_bytes_before_crosswave_dedupe,3787270944);
assert.equal(j.active_with_some_actual_research_original_source,360);
assert.equal(j.active_with_provisional_complete_object_research_photo,358);
assert.equal(j.active_with_partial_only_research_source,2);
assert.equal(j.active_without_any_stable_physical_research_source,23);
assert.equal(j.active_missing_complete_object_photo,25);
assert.equal(j.active_with_some_actual_research_original_source,last.artworks_with_any_research_source);
assert.equal(j.active_with_provisional_complete_object_research_photo,last.artworks_with_complete_object_source);
assert.equal(j.noncomplete_artwork_ids.length,25);
assert.equal(j.partial_only_artwork_ids.length,2);
assert.equal(j.missing_any_artwork_ids.length,23);
assert.equal(new Set(j.noncomplete_artwork_ids).size,25);
assert.equal(new Set(j.missing_any_artwork_ids).size,23);
assert.deepEqual(new Set(j.noncomplete_artwork_ids),
 new Set([...j.missing_any_artwork_ids,...j.partial_only_artwork_ids]));
assert.ok(j.partial_only_artwork_ids.includes("G28-003"));
assert.ok(j.partial_only_artwork_ids.includes("ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel"));
const cohorts=j.B27_B33_B34_B35_B41_source_cohort_counts;
assert.deepEqual(cohorts,{
 "B19_B25_EXACT_SHA_ARCHIVED":245,
 "B29_B33_P0_RESEARCH_ARCHIVED":63,
 "B34_LEGACY_SOURCE_ARCHIVED":35,
 "B35_B41_FULL_SOURCE_RESEARCH_ARCHIVED":15,
 "B35_B41_PARTIAL_ONLY_RESEARCH_ARCHIVED":2,
 "MISSING_EXACT_RESEARCH_ORIGINAL":23
});
assert.equal(Object.values(cohorts).reduce((a,b)=>a+b,0),383);
assert.equal(j.remote_unpublished_B26_primary_tar_count,16);
assert.equal(j.all_required_remote_archives_exist_as_unpublished_drafts,true);
assert.ok(j.remote_unpublished_B26_extra_supplementary_tar_count>=1);
assert.ok(j.remote_unpublished_newer_research_tar_count>=18);
assert.equal(j.B26_remote_release_evidence.B26_primary_asset_bytes>3_000_000_000,true);
assert.equal(j.B26_remote_release_evidence.all_required_draft,true);
assert.equal(j.fully_publishable_end_to_end_certified_from_combined_record,0);
assert.match(j.full_publishing_certification_status,/NOT_YET_RECONCILED/);
assert.equal(j.frozen_approved_107_not_equivalent_to_commercial_photo_permissions,true);
assert.equal(j.source_rights_or_artwork_approvals_created,0);
assert.equal(j.canonical_451_artwork_records_changed,0);
assert.equal(j.production_app_changed,false);
assert.equal(j.strict_zero_euro,true);
const lines=csv.trim().split(/\r?\n/);
assert.equal(lines.length,384);
assert.match(lines[0],/^artwork_id,title,artist,frozen_decision/);
assert.equal(j.catalogue_artworks_with_recorded_physical_SHA_provenance+
  j.catalogue_artworks_with_physical_source_but_no_recorded_individual_SHA <=383,true);
assert.equal(j.repo_git_tracked_image_files_hashed>=0,true);
assert.equal(j.catalogue_artworks_with_matching_image_SHA_inside_current_git_tree<=383,true);
assert.ok(j.limitations.some(x=>x.includes("122 later research image files")));
console.log("B48_FULL383_PASS 245 B26 exact SHA-linked +63 P0 +35 legacy +15 later complete +2 partial +23 no exact source, 290 older image instances plus 122 recent renditions, 383 stable frozen audit, 25 full-object gaps, all draft archives still available and €0.");
