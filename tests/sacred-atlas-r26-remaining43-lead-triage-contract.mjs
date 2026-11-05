import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const ledger=read("data/geography/research/sacred-atlas-r26-43remaining-source-lead-triage-20261104.v1.json");
const recovered=read("data/geography/research/sacred-atlas-round26-existing21-cover-triage-20261104.v1.json");
const cross=read("data/geography/research/sacred-atlas-existing-first-151-photo-reconciliation-20261104.v1.json");
const cat=read("data/geography/research/sacred-atlas-undecided66-bulk-category-candidate-screen-20261104.v1.json");
const metadata=read("data/geography/research/sacred-atlas-round14-85-full-source-metadata-20261104.v1.json");
const tri=read("data/geography/research/sacred-atlas-round17-all35-source-triage-20261104.v1.json");
const geotag=read("data/geography/research/sacred-atlas-round18-30-geotagged-curated-triage-20261104.v1.json");
const sourceCat=new Map(cat.all_66_queue_status.map(x=>[x.place_id,x]));
const sourceTri=new Map(tri.rows.map(x=>[x.place_id,x]));
const sourceGeo=new Map(geotag.all_30_sites.map(x=>[x.place_id,x]));
const valid=new Map(cross.rows.map(x=>[x.place_id,x]));
assert.equal(ledger.schema,"AO_SACRED_ATLAS_R26_REMAINING_43_EXISTING_SOURCE_LEAD_TRIAGE_V1");
assert.equal(ledger.publication,"RESEARCH_ONLY_NO_SOURCE_BYTE_RELEASE");
assert.equal(ledger.baseline.canonical_places,530);
assert.equal(ledger.baseline.approved_covers,379);
assert.equal(ledger.rows.length,43);
assert.equal(new Set(ledger.rows.map(x=>x.place_id)).size,43);
assert.equal(recovered.rows.length,23);
const all66=new Set([...ledger.rows,...recovered.rows].map(x=>x.place_id));
assert.equal(all66.size,66,"23+43 must exactly reconstruct original undecided queue");
const original66=new Set(cross.rows.filter(x=>x.recovery_state.startsWith("UNREVIEWED")).map(x=>x.place_id));
assert.deepEqual([...all66].sort(),[...original66].sort());
const expected={
 FILE_TITLE_LEADS_NOT_ORIGINAL_VERIFIED:5,
 COMMONS_CATEGORY_ONLY_UNSUPPORTED_FORMAT:1,
 EXISTING_ORIGINAL_TOO_SMALL:2,
 PRIMARY_CUSTODIAN_SOURCE_RIGHTS_UNKNOWN:7,
 ARCHITECTURAL_FREEDOM_OF_PANORAMA_HOLD:1,
 NEARBY_GEOTAGGED_IMAGES_NOT_SITE_VERIFIED:10,
 NO_VETTED_EXACT_FILE_LEAD:17
};
const current={};
for(const r of ledger.rows){
 const old=valid.get(r.place_id),site=sourceTri.get(r.place_id),category=sourceCat.get(r.place_id),nearby=sourceGeo.get(r.place_id);
 assert.ok(old&&old.recovery_state==="UNREVIEWED_NO_BYTE_VERIFIED_ORIGINAL");
 assert.equal(r.place_name,old.place_name);
 assert.equal(r.original_finder_decision,"NO_DECISION");
 assert.equal(r.original_bytes_verified,false);
 assert.equal(r.user_cover_choice_made,false);
 assert.equal(r.photo_rights_approved,false);
 assert.equal(r.publication_authorized,false);
 assert.equal(r.near_place_not_equal_exact_site,true);
 assert.equal(r.nearby_geotagged_count,nearby?.nearby_file_count||0);
 assert.equal(r.nearby_geotagged_screen,nearby?.source_screen||null);
 assert.equal(r.source_decision_status,category?.discovery_status||null);
 const oldFile=site?.source_candidates||[];
 assert.equal(r.candidate_file_title_leads.length,oldFile.length);
 for(let i=0;i<oldFile.length;i++){
  const claim=oldFile[i],copy=r.candidate_file_title_leads[i];
  assert.equal(copy.title,claim.source_title||claim.title||null);
  assert.equal(copy.url,claim.source_page||claim.url||null);
  assert.equal(copy.original_sha1_verified,false);
  assert.equal(copy.original_bytes_verified,false);
  assert.equal(copy.license_verified,false);
  assert.equal(copy.publication_authorized,false);
 }
 const oldCust=site?.custodian_or_identity_leads||[];
 assert.equal(r.official_or_custodian_site_leads.length,oldCust.length);
 for(let i=0;i<oldCust.length;i++){
  assert.equal(r.official_or_custodian_site_leads[i].url,oldCust[i].url);
  assert.equal(r.official_or_custodian_site_leads[i].photo_publication_authorized,false);
 }
 const oldMeta=metadata.results.filter(x=>x.place_id===r.place_id);
 assert.equal(r.prior_exact_source_metadata_claims.length,oldMeta.length);
 for(let i=0;i<oldMeta.length;i++){
  assert.equal(r.prior_exact_source_metadata_claims[i].title,oldMeta[i].source_title);
  assert.equal(r.prior_exact_source_metadata_claims[i].status,oldMeta[i].status);
  assert.equal(r.prior_exact_source_metadata_claims[i].original_bytes_verified,false);
 }
 current[r.work_group]=(current[r.work_group]||0)+1;
 const expectGroup=r.candidate_file_title_leads.length?"FILE_TITLE_LEADS_NOT_ORIGINAL_VERIFIED":
   r.existing_category_index_leads.length?"COMMONS_CATEGORY_ONLY_UNSUPPORTED_FORMAT":
   oldMeta.some(x=>x.status==="HOLD_ORIGINAL_TOO_SMALL")?"EXISTING_ORIGINAL_TOO_SMALL":
   oldCust.length?"PRIMARY_CUSTODIAN_SOURCE_RIGHTS_UNKNOWN":
   category?.discovery_status==="ARCHITECTURAL_RIGHTS_HOLD"?"ARCHITECTURAL_FREEDOM_OF_PANORAMA_HOLD":
   (nearby?.nearby_file_count||0)>0?"NEARBY_GEOTAGGED_IMAGES_NOT_SITE_VERIFIED":"NO_VETTED_EXACT_FILE_LEAD";
 assert.equal(r.work_group,expectGroup);
}
assert.deepEqual(current,expected);
assert.deepEqual(ledger.summary.groups,expected);
assert.equal(ledger.summary.previously_verified_originals,0);
assert.equal(ledger.summary.newly_approved_photos,0);
assert.equal(ledger.summary.newly_published_photos,0);
assert.equal(ledger.summary.downloaded_originals_in_this_triage,0);
assert.ok(ledger.rows.find(x=>x.place_id==="place:TO:st-anthony-padua-basilica-nukualofa")
 .work_group==="ARCHITECTURAL_FREEDOM_OF_PANORAMA_HOLD");
assert.ok(ledger.rows.find(x=>x.place_id==="place:MU:pere-laval-sainte-croix")
 .work_group==="EXISTING_ORIGINAL_TOO_SMALL");
console.log("SACRED ATLAS R26 ALL66: 23 with previously verified originals plus 43 source-lead / negative-evidence queues; exactly 66 undecided, 0 new approved or published.");
