import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {unknownResearchClassification,validateClassificationAssertion} from "../src/find/classification-evidence.js";
import {stageG0ResearchVenues} from "../src/find/g0-research-venues.js";

const schema=JSON.parse(readFileSync("data/directory/classification-contract.v1.json","utf8"));
const audit=JSON.parse(readFileSync("data/directory/research/b92-classification-coverage-20261026.v1.json","utf8"));
assert.equal(schema.schema,"AO_DIRECTORY_CLASSIFICATION_EVIDENCE_V1");
assert.equal(audit.counts.source_venue_rows,2715);
assert.equal(audit.counts.historical_canonical_site_ids,2612);
assert.equal(audit.counts.exact_literal_1962_edition,4);
assert.equal(audit.counts.una_cum_source_assertions_direct,0);
assert.equal(audit.counts.mapped_source_alias_ids,5);
assert.equal(audit.counts.timetable_rows_unchanged,4681);
assert.equal(audit.four_literal_missal_leads.length,4);
const status=JSON.parse(readFileSync("data/directory/status-assertions.v1.json","utf8"));
assert.equal(status.communityProfiles.length,4);
assert.deepEqual(new Set(status.communityProfiles.map(x=>x.communityId)),
  new Set(["SSPX","FSSP","ICKSP","IBP"]));
assert.equal(audit.existing_community_level_registry.community_profiles_total,4);
for(const profile of status.communityProfiles){
  assert.ok(profile.communionProfile.evidence_source_ids.length>0);
  if(profile.communityId==="SSPX")assert.equal(profile.communionProfile.pope_named_in_canon,"YES");
  else assert.equal(profile.communionProfile.pope_named_in_canon,"UNKNOWN");
}
// Community policy is contextual evidence, not a site/celebration Una Cum override.
assert.equal(audit.counts.una_cum_source_assertions_direct,0);
assert.equal(new Set(audit.four_literal_missal_leads.map(r=>r.source_id)).size,4);
const ownerEdition=JSON.parse(readFileSync("data/directory/research/b92-missal1962-four-owner-witness-review-20261026.v1.json","utf8"));
assert.equal(ownerEdition.cases.length,4);
assert.equal(ownerEdition.direct_owner_confirmed,3);
assert.equal(ownerEdition.edition_hold,1);
assert.deepEqual(new Set(ownerEdition.cases.map(c=>c.source_id)),
  new Set(audit.four_literal_missal_leads.map(c=>c.source_id)));
for(const c of ownerEdition.cases){
 assert.match(c.owner_page,/^https:\/\//);
 assert.equal(c.una_cum,"UNKNOWN");
 assert.equal(c.ministry_binding,"PENDING");
 assert.equal(c.schedule_certification,"NOT_CHANGED");
 if(c.verification==="OWNER_PAGE_DIRECT_WITNESS")assert.equal(c.missal_edition,"1962");
 else assert.equal(c.missal_edition,"UNKNOWN");
}

const unknown=unknownResearchClassification({source_label:"Una Voce / diocesan coetus"});
assert.equal(unknown.una_cum,"UNKNOWN");
assert.equal(unknown.missal_edition,"UNKNOWN");
assert.equal(unknown.liturgical_use,"UNKNOWN");
assert.equal(unknown.organizer_role,"UNKNOWN");
assert.equal(unknown.venue_owner_type,"UNKNOWN");
assert.equal(unknown.community_label_state,"SOURCE_TEXT_ONLY");
assert.equal(unknown.evidence_assertions.length,0);
assert.ok(Object.isFrozen(unknown));

for(const field of ["una_cum","organizer_role","missal_edition","ecclesial_position"]){
 assert.throws(()=>validateClassificationAssertion({
  field,value:field==="una_cum"?"YES":field==="missal_edition"?"1962":
   field==="organizer_role"?"LAY_ASSOCIATION":"SEDEVACANTIST",
  subject_type:field==="ecclesial_position"?"MINISTRY":"MINISTRY",
  subject_id:"test-ministry",
 }),/evidence source IDs/);
}
assert.throws(()=>validateClassificationAssertion({
 field:"una_cum",value:"YES",subject_type:"VENUE",subject_id:"test-church",
 source_ids:["official"],source_type:"PARISH_OFFICIAL",recorded_at:"2026-10-26",
}),/Invalid classification subject/);
const edition=validateClassificationAssertion({
 field:"missal_edition",value:"1962",subject_type:"CELEBRATION",
 subject_id:"test-celebration",source_ids:["owner-1962-edition"],
 recorded_at:"2026-10-26",source_type:"PARISH_OFFICIAL",
 evidence_maturity:"SOURCE_REPORTED_UNREVIEWED",
});
assert.equal(edition.reviewed,false);
assert.equal(edition.value,"1962");
assert.ok(Object.isFrozen(edition));
const confirmed=validateClassificationAssertion({...edition,evidence_maturity:"DIRECT_WITNESS_REVIEWED"});
assert.equal(confirmed.reviewed,true);

const live=JSON.parse(readFileSync("data/directory/research/canonical-g0-site-admissions-b84-b90-20261026.v1.json","utf8"));
const staged=stageG0ResearchVenues(live);
assert.equal(staged.records.length,34);
for(const r of staged.records){
 assert.equal(r.research.classification.una_cum,"UNKNOWN");
 assert.equal(r.research.classification.missal_edition,"UNKNOWN");
 assert.equal(r.research.classification.organizer_role,"UNKNOWN");
 assert.equal(r.ministries.length,0);
 assert.equal(r.venue.map_publishable,false);
}
console.log("PASS directory B92 classification: 2715-source offline audit + 34 private venue unknown-safety, no church-level Una Cum inference");
