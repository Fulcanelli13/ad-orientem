import fs from "node:fs";
import assert from "node:assert/strict";
import {
  auditCommunionProfile,
  auditSchedule,
  auditStatusAssertion,
  auditVenue,
} from "../src/find/contracts.js";
import {
  compareVenueCandidates,
  normalizeAddress,
} from "../src/find/entity-resolution.js";
import { RESEARCH_MASS_REVIEW_DAYS, expandResearchProviderSnapshot, publishableDirectoryRecords, scheduleFreshnessState } from "../src/find/data-service.js";
import { renderFindToString } from "../src/find/presentation.js";
import {
  buildCanonicalSspxDataset,
  mapSspxPlace,
} from "../tools/directory/import-sspx.mjs";

function readJson(relative) {
  return JSON.parse(fs.readFileSync(new URL(relative, import.meta.url), "utf8"));
}

const contract = readJson("../data/directory/directory-contract.v1.json");
const communities = readJson("../data/directory/communities.v1.json");
const sources = readJson("../data/directory/source-registry.v1.json");
const status = readJson("../data/directory/status-assertions.v1.json");
const scheduleFreshnessPolicy = readJson("../data/directory/research/schedule-freshness-policy.v1.json");
const ickspOverlapAudit = readJson("../data/directory/research/icksp-cross-provider-overlap-audit.v1.json");
const ickspAddressPrecisionAudit = readJson("../data/directory/research/icksp-address-precision-audit.v1.json");

const researchSnapshots = [
  readJson("../data/directory/generated/v19/diocesan.v1.json"),
  readJson("../data/directory/generated/v19/sspx-district-seed.v1.json"),
  readJson("../data/directory/generated/v19/sspx-france-first-party.v1.json"),
  readJson("../data/directory/generated/v19/sspx-france-second-pass.v1.json"),
  readJson("../data/directory/generated/v19/aasjmv.v1.json"),
  readJson("../data/directory/generated/v19/fsvf.v1.json"),
  readJson("../data/directory/generated/v19/canons-st-john-cantius.v1.json"),
  readJson("../data/directory/generated/v19/cmri.v1.json"),
  readJson("../data/directory/generated/v19/rci.v1.json"),
  readJson("../data/directory/generated/v19/cspv.v1.json"),
  readJson("../data/directory/generated/v19/smmd.v1.json"),
  readJson("../data/directory/generated/v19/icksp-federated.v1.json"),
];

const expectedResearchCounts = new Map([
  ["DIOCESAN",46],
  ["SSPX_DISTRICT_SEED",34],
  ["SSPX_FRANCE_FIRST_PARTY",89],
  ["SSPX_FRANCE_SECOND_PASS",30],
  ["AASJMV",6],
  ["FSVF",1],
  ["CANONS_ST_JOHN_CANTIUS",4],
  ["CMRI",142],
  ["RCI",31],
  ["SSPV_CSPV",19],
  ["SMMD",1],
  ["ICKSP_FEDERATED_V13",103],
]);
let researchVenueCount=0;
const researchVenueIds=new Set();
for(const snapshot of researchSnapshots){
  assert.equal(snapshot.schema,"AO_DIRECTORY_RESEARCH_PROVIDER_V1");
  assert.equal(snapshot.records.length,expectedResearchCounts.get(snapshot.provider),snapshot.provider+" record-count drift");
  const expanded=expandResearchProviderSnapshot(snapshot);
  const expectedExpandedCount=snapshot.provider==="ICKSP_FEDERATED_V13"?120:snapshot.records.length;
  assert.equal(expanded.venues.length,expectedExpandedCount,snapshot.provider+" physical venue expansion drift");
  assert.equal(expanded.ministries.length,expectedExpandedCount,snapshot.provider+" physical ministry expansion drift");
  assert.equal(expanded.schedules.length,expectedExpandedCount,snapshot.provider+" physical schedule expansion drift");
  researchVenueCount+=expanded.venues.length;
  for(const venue of expanded.venues){
    assert.equal(auditVenue(venue).length,0,venue.venue_id+" failed venue audit");
    assert.ok(!researchVenueIds.has(venue.venue_id),"duplicate research venue "+venue.venue_id);
    researchVenueIds.add(venue.venue_id);
  }
  for(const schedule of expanded.schedules)assert.equal(auditSchedule(schedule).length,0,schedule.schedule_id+" failed schedule audit");
  if(snapshot.provider==="DIOCESAN"){
    assert.ok(expanded.ministries.every(m=>m.liturgical_usage.family==="ROMAN"&&m.liturgical_usage.books==="1962"));
    assert.ok(expanded.venues.some(v=>/charleston-sacredheart/.test(v.venue_id)),"Charleston residue promotion missing");
    assert.ok(expanded.venues.some(v=>/binghamton-stmary/.test(v.venue_id)),"Binghamton residue promotion missing");
    assert.ok(expanded.venues.some(v=>/trenton-holyinnocents-neptune/.test(v.venue_id)),"Neptune residue promotion missing");
    assert.ok(expanded.venues.some(v=>/ny-holyinnocents-manhattan/.test(v.venue_id)),"Manhattan residue promotion missing");
    const manhattanIndex=expanded.venues.findIndex(v=>/ny-holyinnocents-manhattan/.test(v.venue_id));
    assert.ok(manhattanIndex>=0);
    assert.ok(expanded.ministries[manhattanIndex].liturgical_usage.evidence_source_ids.some(id=>/edition$/.test(id)),"Manhattan 1962 evidence must point to the edition source");
  }
  if(snapshot.provider==="SSPX_FRANCE_FIRST_PARTY"){
    assert.equal(expanded.venues.length,89);
    assert.equal(expanded.venues.filter(v=>v.publication_state==="CONDITIONAL_MASS").length,5);
    assert.ok(expanded.ministries.every(m=>m.community_id==="SSPX"&&m.liturgical_usage.books==="1962"));
    assert.ok(expanded.venues.every(v=>v.source_ids.length>0&&v.contact.schedule_url.some(u=>u.startsWith("https://laportelatine.org/lieux/"))));
    assert.ok(expanded.schedules.every(s=>s.service_type==="MASS"&&s.payload?.raw.startsWith("DIMANCHE")));
    const visible=publishableDirectoryRecords(expanded.venues.map((venue,i)=>({
      venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}],
    })));
    assert.equal(visible.length,89,"SSPX France confirmed Mass rows missing in Find");
  }
  if(snapshot.provider==="SSPX_FRANCE_SECOND_PASS"){
    assert.equal(expanded.venues.length,30,"Second France tranche changed unexpectedly");
    assert.equal(expanded.venues.filter(v=>v.publication_state==="CONDITIONAL_MASS").length,4);
    assert.ok(expanded.ministries.every(m=>m.community_id==="SSPX"&&m.liturgical_usage.books==="1962"));
    assert.ok(expanded.venues.every(v=>v.contact.schedule_url.some(u=>u.startsWith("https://laportelatine.org/lieux/"))));
    assert.ok(expanded.schedules.every(s=>s.service_type==="MASS"&&s.payload?.raw.length>10));
    const visible=publishableDirectoryRecords(expanded.venues.map((venue,i)=>({
      venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}],
    })));
    assert.equal(visible.length,30,"Held SSPX France source was incorrectly published or promoted venues disappeared");
  }
  if(snapshot.provider==="SSPX_DISTRICT_SEED"){
    assert.ok(expanded.ministries.every(m=>m.community_id==="SSPX"),"SSPX district source lost affiliation");
    assert.ok(expanded.venues.every(v=>v.upstream.provider_id==="SSPX_DISTRICT_SEED"),"SSPX origin lost");
    assert.equal(expanded.venues.filter(v=>v.publication_state==="CONDITIONAL_MASS").length,8);
    assert.ok(expanded.venues.every(v=>v.address.formatted&&v.contact.schedule_url.length),"SSPX seed missing physical address or district source");
    assert.ok(expanded.schedules.every(v=>v.source_ids.length===1&&v.verification?.state==="OFFICIAL_VERIFIED"),"SSPX seed requires official schedule evidence");
    const visible=publishableDirectoryRecords(expanded.venues.map((venue,i)=>({
      venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}],
    })));
    assert.equal(visible.length,34,"first-party SSPX district seed not visible in Find");
    const notVerified={...expanded.venues[0],publication_state:"PENDING_CURRENT_EVIDENCE"};
    assert.equal(publishableDirectoryRecords([{venue:notVerified,
      ministries:[{...expanded.ministries[0],schedules:[expanded.schedules[0]]}]}]).length,0,
      "unverified SSPX source incorrectly published");
  }
  if(snapshot.provider==="CMRI")assert.ok(expanded.ministries.every(m=>m.liturgical_usage.books!=="1962"),"CMRI was wrongly normalized to 1962");
  if(snapshot.provider==="RCI")assert.ok(expanded.ministries.every(m=>m.liturgical_usage.books==="PRE_1955"),"RCI pre-1955 profile drifted");
  if(snapshot.provider==="SSPV_CSPV")assert.ok(expanded.ministries.every(m=>m.liturgical_usage.books==="UNKNOWN"),"CSPV exact books were inferred");
  if(snapshot.provider==="CANONS_ST_JOHN_CANTIUS"){
    assert.ok(expanded.venues.some(v=>/sjc-001/.test(v.venue_id)),"St John Cantius current 1962 venue missing");
    assert.ok(expanded.venues.some(v=>/sjc-002/.test(v.venue_id)),"St Peter Volo current 1962 venue missing");
    assert.ok(expanded.ministries.every(m=>m.liturgical_usage.books==="1962"),"Canons 1962 profile drifted");
  }
  if(snapshot.provider==="ICKSP_FEDERATED_V13"){
    assert.ok(expanded.ministries.every(m=>m.community_id==="ICKSP"&&m.liturgical_usage.books==="1962"),"ICKSP supplement profile drifted");
    assert.equal(snapshot.records.filter(row=>row.svc==="MASS").length,90,"ICKSP current-Mass candidate count drifted");
    assert.equal(snapshot.records.filter(row=>row.svc==="SOURCE_ASSERTION").length,13,"ICKSP candidate assertion count drifted");
    assert.equal(expanded.schedules.filter(s=>s.service_type==="MASS").length,104,"ICKSP physical current-Mass count drifted");
    assert.equal(expanded.schedules.filter(s=>s.service_type==="SOURCE_ASSERTION").length,16,"ICKSP physical research-assertion count drifted");
    assert.equal(expanded.venues.filter(v=>v.upstream.parent_upstream_id).length,30,"ICKSP physical fan-out count drifted");
    assert.ok(expanded.venues.some(v=>/icksp-stg-001-lafox/.test(v.venue_id)),"Agen Lafox physical venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-027-conflans/.test(v.venue_id)),"Orleans Conflans physical venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-023-steulalie/.test(v.venue_id)),"Montpellier Sainte-Eulalie venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-124/.test(v.venue_id)&&v.name.official.includes("Holy Rosary")),"Ardee current Mass venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-068-randazzo/.test(v.venue_id)),"Randazzo physical venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-070-carmiano/.test(v.venue_id)),"Carmiano physical venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-072-rosariello/.test(v.venue_id)),"Naples Rosariello physical venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-stg-080-stedward/.test(v.venue_id)),"Plymouth St Edward physical venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-it-2026-alessandria/.test(v.venue_id)),"Alessandria post-v1.3 venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-it-2026-lucca/.test(v.venue_id)),"Lucca post-v1.3 venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-it-2026-orvieto/.test(v.venue_id)),"Orvieto post-v1.3 venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-it-2026-bientina/.test(v.venue_id)),"Bientina post-v1.3 venue missing");
    assert.ok(expanded.venues.some(v=>/icksp-it-2026-pistoia/.test(v.venue_id)),"Pistoia post-v1.3 venue missing");
    const byUpstream=new Map(expanded.venues.map(v=>[v.upstream.upstream_id,v]));
    assert.match(byUpstream.get("ICKSP-STG-040")?.address?.formatted??"",/338 West University Boulevard/,"Tucson street-level address missing");
    assert.match(byUpstream.get("ICKSP-STG-043")?.address?.formatted??"",/79 Church Street/,"Bridgeport street-level address missing");
    assert.match(byUpstream.get("ICKSP-STG-054")?.address?.formatted??"",/1828 Jay Street/,"Detroit street-level address missing");
    assert.match(byUpstream.get("ICKSP-STG-062")?.address?.formatted??"",/2457 Browns Lake Drive/,"Burlington street-level address missing");
    assert.match(byUpstream.get("ICKSP-STG-083")?.address?.formatted??"",/Doctor Esquerdo 44/,"Madrid street-level address missing");
    assert.match(byUpstream.get("ICKSP-STG-091")?.address?.formatted??"",/Teresa Gil 20/,"Valladolid street-level address missing");
    assert.equal(byUpstream.get("ICKSP-STG-108")?.address?.line1??null,null,"Mouila locality-only chapel was falsely upgraded to street precision");
  }
}
assert.equal(researchVenueCount,523,"research projection incl second SSPX France physical pass drift");
const ickspReconciliation=readJson("../data/directory/research/icksp-v13-reconciliation.json");
assert.equal(ickspReconciliation.research_unique_candidates,125);
assert.equal(ickspReconciliation.live_runtime_records,27);
assert.equal(ickspReconciliation.overlap_candidate_ids.length,27);
assert.equal(ickspReconciliation.missing_candidate_count,98);
assert.deepEqual(ickspReconciliation.publication_gate,{
  live_runtime_records:27,
  live_current_mass_records:26,
  federated_supplement_records:103,
  federated_current_mass_candidate_records:90,
  federated_physical_projection_records:120,
  federated_physical_current_mass_venues:104,
  publishable_current_mass_candidates_total:116,
  publishable_physical_mass_venues_total:130,
  nonpublishable_candidate_total:14,
  provider_presence_only_total:5,
  public_mass_suspended_total:1,
  restricted_or_special_access_total:2,
  seasonal_or_occasional_total:5,
  mass_eligibility_pending_total:1,
});
assert.equal(ickspReconciliation.newly_promoted_candidate_ids.length,49);
assert.deepEqual(ickspReconciliation.live_recovered_mass_candidate_ids,["ICKSP-STG-055"]);
assert.equal(ickspReconciliation.provider_presence_only_candidate_ids.length,5);
assert.equal(ickspReconciliation.public_mass_suspended_candidate_ids.length,1);
assert.equal(ickspReconciliation.restricted_or_special_access_candidate_ids.length,2);
assert.equal(ickspReconciliation.conditional_mass_evidence_not_promoted_ids.length,5);
assert.deepEqual(ickspReconciliation.no_published_current_times_candidate_ids,["ICKSP-STG-028"]);
assert.equal(ickspReconciliation.research_unique_candidates_v13,125);
assert.equal(ickspReconciliation.federated_missing_candidates_v13,98);
assert.equal(ickspReconciliation.post_v13_official_additions,5);
assert.equal(ickspReconciliation.canonical_current_candidates,130);
assert.equal(ickspReconciliation.post_v13_official_addition_ids.length,5);
assert.equal(ickspReconciliation.physical_venue_normalization.canonical_federated_candidates,103);
assert.equal(ickspReconciliation.physical_venue_normalization.fanout_additional_physical_records,17);
assert.equal(ickspReconciliation.physical_venue_normalization.total_physical_records,120);
assert.equal(ickspReconciliation.physical_venue_normalization.additional_publishable_mass_venues_from_fanout,14);
assert.equal(ickspReconciliation.physical_venue_normalization.physical_source_assertions,16);
assert.equal(ickspReconciliation.physical_venue_normalization.multi_venue_candidate_ids.length,13);
assert.equal(ickspReconciliation.remaining_country_normalization.italy_missing_from_v13.length,5);
assert.equal(ickspReconciliation.remaining_country_normalization.fanout_candidate_ids.length,4);
assert.equal(ickspReconciliation.remaining_country_normalization.naples_unscheduled_physical_venue.disposition,"SOURCE_ASSERTION_NO_PUBLISHED_CURRENT_MASS_TIME");
assert.equal(ickspReconciliation.ireland_northern_ireland_audit.current_official_locations.length,4);
assert.equal(ickspReconciliation.ireland_northern_ireland_audit.ardee_status,"PROMOTED_CURRENT_MASS");
assert.equal(ickspReconciliation.ireland_northern_ireland_audit.galway_current_sunday_time,"12:00");
assert.deepEqual(
  ickspReconciliation.ireland_northern_ireland_audit.negative_checks.map(x=>x.place).sort(),
  ["Waterford","Wexford"]
);

const ickspFederated=researchSnapshots.find(snapshot=>snapshot.provider==="ICKSP_FEDERATED_V13");
const expandedIcksp=expandResearchProviderSnapshot(ickspFederated);
const currentIckspMassSchedules=expandedIcksp.schedules.filter(schedule=>schedule.service_type==="MASS");
assert.equal(RESEARCH_MASS_REVIEW_DAYS,120);
assert.equal(scheduleFreshnessPolicy.rules.research_current_mass.review_days,RESEARCH_MASS_REVIEW_DAYS);
assert.ok(currentIckspMassSchedules.every(schedule=>/^2026-10-07T00:00:00Z$/.test(schedule.verification.checked_at)),"ICKSP current Mass schedules must preserve venue verification day");
assert.ok(currentIckspMassSchedules.every(schedule=>/^2027-02-04T23:59:59Z$/.test(schedule.verification.review_due_at)),"ICKSP current Mass schedules must carry review dates");
assert.ok(currentIckspMassSchedules.every(schedule=>scheduleFreshnessState(schedule,{now:new Date("2026-10-08T00:00:00Z")})==="CURRENT"));
assert.equal(scheduleFreshnessState(currentIckspMassSchedules[0],{now:new Date("2027-02-05T00:00:00Z")}),"REVIEW_DUE");
assert.equal(ickspOverlapAudit.scope.icksp_federated_physical_venues,120);
assert.deepEqual(ickspOverlapAudit.scope.compared_against,{
  ICKSP_LIVE:27,
  FSSP:404,
  IBP:34,
  DIOCESAN:46,
  CANONS_ST_JOHN_CANTIUS:4,
});
assert.equal(ickspOverlapAudit.result.credible_same_physical_place_duplicates,0);
assert.equal(ickspOverlapAudit.result.unresolved_overlap_candidates,0);
assert.equal(ickspOverlapAudit.reviewed_false_positives.length,1);
assert.equal(ickspAddressPrecisionAudit.scope.federated_physical_venues,120);
assert.equal(ickspAddressPrecisionAudit.scope.current_mass_physical_venues,104);
assert.deepEqual(ickspAddressPrecisionAudit.result,{
  street_or_property_level:103,
  locality_only:16,
  named_place_only:1,
  current_mass_locality_only:3,
});
assert.deepEqual(
  ickspAddressPrecisionAudit.current_mass_locality_only.map(row=>row.id).sort(),
  ["ICKSP-STG-108","ICKSP-STG-109","ICKSP-STG-111"]
);
const staleFindHtml=renderFindToString({
  language:"en",
  records:[{
    venue:{
      venue_id:"freshness-test",
      name:{official:"Freshness Test Church",alternate:[]},
      address:{city:"Test City",country_code:"US",formatted:"1 Test Street, Test City"},
      geo:{lat:null,lng:null,precision:"unknown",geocoding_source:null},
      contact:{phone:[],email:[],website:[],schedule_url:[]},
    },
    ministries:[{
      community_id:"ICKSP",
      liturgical_usage:{family:"ROMAN",books:"1962"},
      schedules:[{
        service_type:"MASS",
        mass_type:"UNKNOWN",
        payload:{raw:"Sunday 10:00"},
        verification:{checked_at:"2000-01-01T00:00:00Z",review_due_at:"2000-05-01T23:59:59Z"},
      }],
    }],
    sources:[],
  }],
  communities:[{id:"ICKSP",abbreviation:"ICKSP"}],
});
assert.match(staleFindHtml,/Schedule needs verification/,"Find did not surface stale schedule review state");
assert.match(staleFindHtml,/Checked 1 Jan 2000/,"Find did not surface schedule verification date");
const massIndex=expandedIcksp.schedules.findIndex(schedule=>schedule.service_type==="MASS");
const assertionIndex=expandedIcksp.schedules.findIndex(schedule=>schedule.service_type==="SOURCE_ASSERTION");
const residualIckspRows=ickspFederated.records.filter(row=>row.svc==="SOURCE_ASSERTION");
assert.equal(residualIckspRows.length,13);
assert.ok(residualIckspRows.every(row=>String(row.pr||"").startsWith("ICKSP_")),"residual ICKSP assertion lacks an explicit hold reason");
assert.ok(massIndex>=0&&assertionIndex>=0);
assert.equal(publishableDirectoryRecords([{
  venue:expandedIcksp.venues[massIndex],
  ministries:[{...expandedIcksp.ministries[massIndex],schedules:[expandedIcksp.schedules[massIndex]]}],
}]).length,1,"ICKSP current-Mass row was incorrectly suppressed");
assert.equal(publishableDirectoryRecords([{
  venue:expandedIcksp.venues[assertionIndex],
  ministries:[{...expandedIcksp.ministries[assertionIndex],schedules:[expandedIcksp.schedules[assertionIndex]]}],
}]).length,0,"ICKSP research assertion leaked into Find a Mass");
assert.equal(publishableDirectoryRecords([{
  venue:expandedIcksp.venues[massIndex],
  ministries:[{...expandedIcksp.ministries[massIndex],schedules:[]}],
}]).length,0,"ICKSP provider-presence row without a Mass schedule leaked into Find");
const generatedIckspVenues=readJson("../data/directory/generated/icksp/venues.v1.json");
const liveBayArea=generatedIckspVenues.records.find(v=>/bay-area/.test(v.venue_id));
const liveSanJose=generatedIckspVenues.records.find(v=>/immaculate-heart-of-mary-oratory/.test(v.venue_id));
const liveMerrillville=generatedIckspVenues.records.find(v=>/st-joseph-oratory/.test(v.venue_id));
const liveRome=generatedIckspVenues.records.find(v=>/basilica-dei-santi-celso-e-giuliano/.test(v.venue_id));
assert.equal(liveBayArea.address.city,"San Rafael","Bay Area live ICKSP locality regressed");
assert.equal(liveBayArea.address.postal_code,"94903");
assert.equal(liveSanJose.address.city,"San José","San Jose live ICKSP locality regressed");
assert.equal(liveSanJose.address.postal_code,"95128");
assert.equal(liveMerrillville.address.city,"Merrillville","Merrillville live ICKSP locality regressed");
assert.equal(liveMerrillville.address.postal_code,"46410");
assert.equal(liveRome.address.city,"Rome","Rome live ICKSP locality regressed");

const generatedIckspSchedules=readJson("../data/directory/generated/icksp/schedules.v1.json");
assert.equal(generatedIckspSchedules.records.length,26,"ICKSP live schedule count drifted");
assert.ok(generatedIckspSchedules.records.some(schedule=>/reno-nv-89502/.test(schedule.schedule_id)),"Reno current Mass schedule missing");
assert.ok(!generatedIckspSchedules.records.some(schedule=>/christ-the-king-sovereign-priest/.test(schedule.schedule_id)),"Chicago suspended public Mass leaked into live schedules");


assert.equal(contract.schema, "DIRECTORY_SOT_V1");
assert.equal(contract.version, "1.1.0");
assert.ok(contract.invariants.some(value => /una-cum/i.test(value)));
assert.ok(contract.invariants.some(value => /UNKNOWN/.test(value)));
assert.ok(contract.invariants.some(value => /Coordinates are assertions/i.test(value)));

assert.ok(communities.communities.some(item => item.id === "SSPX"));
assert.equal(communities.upstreamRelationshipPolicy.sspx.fsspx.defaultCommunityId, "SSPX");
assert.equal(communities.upstreamRelationshipPolicy.sspx.friend.defaultCommunityId, "OTHER");
assert.equal(communities.upstreamRelationshipPolicy.sspx.friend.canonicalConfidence, "REVIEW");

const sourceIds = new Set(sources.sources.map(item => item.id));
for (const required of [
  "SRC_SSPX_MAP_API",
  "SRC_SSPX_UNA_CUM_POLICY",
  "SRC_SSPX_UNA_CUM_2026",
  "SRC_DDF_SSPX_2026_07_02",
]) {
  assert.ok(sourceIds.has(required), `missing source registry id ${required}`);
}

const sspxProfile = status.communityProfiles.find(item => item.communityId === "SSPX");
assert.ok(sspxProfile);
assert.equal(sspxProfile.communionProfile.pope_named_in_canon, "YES");
assert.equal(sspxProfile.communionProfile.ordinary_named_in_canon, "YES");
assert.equal(auditCommunionProfile(sspxProfile.communionProfile).length, 0);
assert.equal(sspxProfile.statusAssertions[0].effectiveDate, "2026-07-02");
assert.equal(sspxProfile.statusAssertions[0].sourceId, "SRC_DDF_SSPX_2026_07_02");
assert.equal(auditStatusAssertion(sspxProfile.statusAssertions[0]).length, 0);

const unsupportedClaim = {
  recognises_current_pontiff: "YES",
  pope_named_in_canon: "YES",
  ordinary_named_in_canon: "UNKNOWN",
  position_family: "ROMAN_PONTIFF_RECOGNISED",
  evidence_source_ids: [],
};
assert.ok(auditCommunionProfile(unsupportedClaim).some(item => item.code === "MISSING_COMMUNION_EVIDENCE"));

const honestUnknown = {
  recognises_current_pontiff: "UNKNOWN",
  pope_named_in_canon: "UNKNOWN",
  ordinary_named_in_canon: "UNKNOWN",
  position_family: "UNKNOWN",
  evidence_source_ids: [],
};
assert.equal(auditCommunionProfile(honestUnknown).length, 0);

const sspxFixture = {
  crmId: "OPE-009999",
  slug: "saint-joseph-test-chapel",
  url: "https://map.fsspx.org/en/places/saint-joseph-test-chapel",
  name: "Saint Joseph Test Chapel",
  churchTitle: "St Joseph Church",
  kind: "chapel",
  alsoKinds: [],
  relationship: "fsspx",
  community: null,
  city: "Testville",
  countryCode: "FR",
  region: "Test Region",
  lat: 48.8566,
  lng: 2.3522,
  sundayMass: true,
  weekdayMass: false,
  address: {
    line1: "10 Rue Exemple",
    postalCode: "75000",
    city: "Testville",
    countryCode: "FR",
    country: "France",
  },
  phone: "+33 1 00 00 00 00",
  contactUrl: "https://example.test/contact",
  website: "https://example.test/",
  schedules: [
    {
      source: "drupal",
      kind: "sections",
      priority: 1,
      lang: "fr",
      payload: {
        title: "Horaires",
        sections: [{ label: "Dimanche", role: "sunday", lines: ["10h30 Messe chantée"] }],
      },
      updatedAt: "2026-10-06T08:00:00Z",
    },
  ],
  sources: { drupal: "https://example.test/schedule" },
  updatedAt: "2026-10-06T09:00:00Z",
};

const mapped = mapSspxPlace(sspxFixture);
assert.equal(mapped.ministry.community_id, "SSPX");
assert.equal(mapped.ministry.community_profile_ref, "SSPX");
assert.deepEqual(mapped.venue.contact.email, []);
assert.equal(mapped.venue.contact.contact_form[0], "https://example.test/contact");
assert.equal(mapped.schedules.length, 1);
assert.equal(mapped.schedules[0].payload.sections[0].role, "sunday");
assert.equal(auditVenue(mapped.venue).length, 0);
assert.equal(mapped.venue.geo.geocoding_source,"OFFICIAL_SOURCE");
assert.equal(mapped.venue.geo.precision,"address");
assert.ok(mapped.venue.geo.source_ref);

const noLocation = structuredClone(mapped.venue);
noLocation.venue_id = "ao-test-no-location";
noLocation.geo = { lat: null, lng: null };
noLocation.address = {
  line1: null,
  line2: null,
  postal_code: null,
  city: null,
  region: null,
  country_code: "FR",
  country: "France",
  formatted: null,
};
assert.ok(auditVenue(noLocation).some(item => item.code === "MISSING_LOCATION"));

const nullGeoFixture = {
  ...sspxFixture,
  crmId: "OPE-009997",
  slug: "no-geo-chapel",
  lat: null,
  lng: null,
};
const nullGeoMapped = mapSspxPlace(nullGeoFixture);
assert.equal(nullGeoMapped.venue.geo.lat, null);
assert.equal(nullGeoMapped.venue.geo.lng, null);

const friendFixture = {
  ...sspxFixture,
  crmId: "OPE-009998",
  slug: "friend-chapel",
  relationship: "friend",
  community: "Example Traditional Community",
};
const friendMapped = mapSspxPlace(friendFixture);
assert.equal(friendMapped.ministry.community_id, "OTHER");
assert.equal(friendMapped.ministry.affiliation_confidence, "REVIEW");
assert.equal(friendMapped.ministry.external_community_name, "Example Traditional Community");

assert.equal(normalizeAddress("10, Rue Exemple."), normalizeAddress("10 rue exemple"));

const sameVenueA = mapped.venue;
const sameVenueB = structuredClone(mapped.venue);
sameVenueB.venue_id = "ao-test-second";
sameVenueB.name.official = "Saint Joseph Church";
sameVenueB.geo = { ...sameVenueB.geo, lat: 48.85661, lng: 2.35221 };
assert.equal(compareVenueCandidates(sameVenueA, sameVenueB).classification, "AUTO_MERGE_SAFE");

const houseSameProperty = structuredClone(mapped.venue);
houseSameProperty.venue_id = "ao-test-house";
houseSameProperty.venue_type = "priory";
houseSameProperty.name.official = "Priory of Saint Joseph";
assert.notEqual(compareVenueCandidates(sameVenueA, houseSameProperty).classification, "AUTO_MERGE_SAFE");

const nullGeoTwinA = structuredClone(mapped.venue);
nullGeoTwinA.venue_id = "ao-null-geo-a";
nullGeoTwinA.geo = { lat: null, lng: null };
nullGeoTwinA.address = { ...nullGeoTwinA.address, formatted: "1 Example Street, Paris, France" };
const nullGeoTwinB = structuredClone(nullGeoTwinA);
nullGeoTwinB.venue_id = "ao-null-geo-b";
nullGeoTwinB.name.official = "Completely Different Chapel";
nullGeoTwinB.address = { ...nullGeoTwinB.address, formatted: "99 Other Avenue, Paris, France" };
assert.equal(compareVenueCandidates(nullGeoTwinA, nullGeoTwinB).classification, "DISTINCT");

const dataset = buildCanonicalSspxDataset([sspxFixture, friendFixture], {
  retrievedAt: "2026-10-07T09:00:00Z",
});
assert.equal(dataset.report.place_count, 2);
assert.equal(dataset.report.venue_count, 2);
assert.equal(dataset.report.ministry_count, 2);
assert.equal(dataset.report.schedule_assertion_count, 2);
assert.equal(dataset.report.geo_feature_count, 2);
assert.equal(dataset.report.duplicate_upstream_id_count, 0);

console.log("directory source-of-truth and SSPX importer: PASS");
