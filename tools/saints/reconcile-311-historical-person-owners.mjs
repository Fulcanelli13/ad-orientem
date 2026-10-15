// Crosswalk ORIGINAL 311 historical art components with source-owned person,
// art identity rules, relic subject research and reviewed five-star candidates.
// Safe/read-only: no painting approval, relic authentication or saint publication.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const own=resolve(root,"artifacts/saints-owner-inputs");
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const hist=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const pilot=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const bridge=read("data/saints/parallel-owner-identity-bridge-20261015.v1.json");
const relic=read("data/explore/worldwide-relic-subject-census.research.v1.json");
const doctors=read("artifacts/saints-owner-inputs/calendar-doctors-38.json");
const living=read("artifacts/saints-owner-inputs/calendar-living-6.json");
const post=read("artifacts/saints-owner-inputs/calendar-post1960-258.json");
const art=read("artifacts/saints-owner-inputs/art-w62-historical-expectations.json");
const w64=read("artifacts/saints-owner-inputs/art-w64-rated5-saints-pilot-candidates.json");
assert.equal(hist.component_count,311);
assert.equal(hist.rows.length,252);
assert.equal(relic.subjects.length,161);
assert.equal(doctors.doctors.length,38);
assert.equal(post.persons.length,258);
assert.equal(living.persons.length,6);
const byId=(rows,key)=>new Map(rows.filter(x=>x[key]).map(x=>[x[key],x]));
const doctor=byId(doctors.doctors,"canonicalPersonId");
const livingId=byId(living.persons,"id");
const postId=byId(post.persons,"id");
const relicId=byId(relic.subjects,"subject_id");
const oldArtwork=byId(art.historyIdentityInputs.legacyArtRuleIDs,"canonicalLegacyId");
const pilotById=byId(pilot.people,"saint_id");
const artPilotById=byId(w64.saintPilotPortraitArtworkCandidates,"canonicalSaintId");
const reviewedLinks=byId(bridge.identity_links,"calendar_person_id");
assert.equal(artPilotById.size,2);
assert.equal(reviewedLinks.size,bridge.identity_links.length);
const expectedKindCounts={saint:244,group:58,event:7,angel:2};
const identityNamespaces=Object.fromEntries(Object.keys(expectedKindCounts).map(x=>[x,0]));
const output=[];
const componentSeen=new Set();
for(const entry of hist.rows)for(const part of entry.components){
 const historicalId=part.historical_identity_id;
 assert(historicalId && /^[a-z]+\.[a-z0-9-]+$/.test(historicalId));
 assert(part.historical_component_id&&!componentSeen.has(part.historical_component_id));
 componentSeen.add(part.historical_component_id);
 const namespace=historicalId.split(".")[0];
 assert(namespace in expectedKindCounts,"Unaccounted liturgical source identity kind "+namespace);
 identityNamespaces[namespace]++;
 const isSaint=namespace==="saint";
 // Existing shared canonical IDs are compared exactly. An ID namespace match
 // is editorial evidence, not a Vatican canonization or current-portrait approval.
 const doctorRecord=doctor.get(historicalId);
 const livingRecord=livingId.get(historicalId);
 const postRecord=postId.get(historicalId);
 const oldArt=oldArtwork.get(historicalId);
 const relicKey=isSaint?"subject:saint-"+historicalId.slice(6):null;
 const relicRecord=relicKey?relicId.get(relicKey):null;
 const exactPersonOwner=[doctorRecord&&"CALENDAR_DOCTORS_38",
   livingRecord&&"CALENDAR_LIVING_6",
   postRecord&&"CALENDAR_POST1960_258"].filter(Boolean);
 const crossOwner=reviewedLinks.get(historicalId);
 const approvedLink=crossOwner&&crossOwner.status.startsWith("EXACT_SUPPORTED_")
  &&pilotById.has(crossOwner.saints_id)?crossOwner:null;
 // Historical Margaret Mary does not have a Calendar-reviewed person link
 // but she has a *person-level source* 1962 identity/civil-date verification.
 const mMarg=historicalId==="saint.margaret-mary-alacoque"&&entry.date==="10-17"
  &&pilotById.has("saint:margaret-mary-alacoque");
 const pilotId=approvedLink?.saints_id??(mMarg?"saint:margaret-mary-alacoque":null);
 const proposedFive=pilotId?artPilotById.get(pilotId):null;
 const exactPortrait=proposedFive?{
   artwork_id:proposedFive.artworkId,
   user_score:proposedFive.sourceScore,
   physical_reproduction_release_allowed:proposedFive.releaseAllowed,
   review_state:"USER_SCORE_5_SOURCE_CANDIDATE_NOT_APPROVED_MASTER_OR_RIGHTS",
   date_and_subject_support:approvedLink?"EXACT_REVIEWED_CROSS_OWNER_ID":"EXACT_HISTORICAL_SOURCE_ID_AND_DAY_2026_RESEARCH",
   attribution:proposedFive.artworkTitle,
 }:null;
 assert(!exactPortrait||exactPortrait.user_score===5&&!exactPortrait.physical_reproduction_release_allowed);
 const categories=[];
 if(doctorRecord)categories.push({
   code:"DOCTOR_OF_CHURCH",role:"EXISTING_CALENDAR_ROSTER",
   effective_2026_declaration_record:doctorRecord.declarationDate||null,
   historical_1962_licence:"DO_NOT_INFER_HISTORICAL_TITLE_FROM_LATER_DECLARATION"
 });
 const holdReason=namespace==="group"?"ONE_GROUP_PROFILE_DO_NOT_EXPAND_MEMBERS":
  namespace==="event"?"LITURGICAL_EVENT_NOT_CANONICAL_SAINT_PERSON":
  namespace==="angel"?"ANGELIC_FIGURE_NOT_HUMAN_PERSON":
  "NO_EDITORIALLY_CERTIFIED_NEW_PERSON_CREATED";
 output.push({
  historical_component_id:part.historical_component_id,
  nominal_mm_dd:entry.date,
  historical_identity_id:historicalId,
  historical_display_name:part.display_name,
  archived_representation_mode:part.historical_representation_mode,
  identity_namespace:namespace,
  identity_scope:holdReason,
  identity_source_matches:{
   calendar_doctor_id:doctorRecord?.canonicalPersonId??null,
   calendar_living_id:livingRecord?.id??null,
   calendar_post1960_id:postRecord?.id??null,
   matched_person_owner_by_exact_id:exactPersonOwner,
   sacred_art_historical_rule_id:oldArt?.canonicalLegacyId??null,
   relic_candidate_subject_id:relicRecord?.subject_id??null,
   relic_candidate_status:relicRecord?"EXACT_SLUG_MECHANICAL_ONLY_REQUIRES_PERSON_AND_RELIC_ATTRIBUTION_REVIEW":null,
  },
  existing_saints_pilot_id:pilotId,
  pilot_link_status:approvedLink?"REVIEWED_SAME_PERSON_CALENDAR_LINK":
    mMarg?"HISTORICAL_AND_OBSERVED_1962_SOURCE_DATE_CASE_REQUIRES_EDITORIAL_SIGNOFF":null,
  current_classification_candidates:categories,
  five_star_existing_source_portrait_candidate:exactPortrait,
  new_person_record_created:false,
  current_artwork_binding_created:false,
  verified_relic_custody_added:false,
 });
}
for(const [key,n] of Object.entries(expectedKindCounts))
 assert.equal(identityNamespaces[key],n,"Original frozen historical kind census drift "+key);
assert.equal(output.length,311);
assert.equal(componentSeen.size,311);
const uniq=new Set(output.map(x=>x.historical_identity_id));
assert.equal(uniq.size,307);
const counts={
 historical_component_occurrences:output.length,historical_date_keys:hist.rows.length,
 distinct_historical_identity_ids:uniq.size,historical_namespace_occurrences:identityNamespaces,
 calendar_doctor_exact_ids:output.filter(x=>x.identity_source_matches.calendar_doctor_id).length,
 calendar_living_exact_ids:output.filter(x=>x.identity_source_matches.calendar_living_id).length,
 calendar_post1960_exact_ids:output.filter(x=>x.identity_source_matches.calendar_post1960_id).length,
 historical_art_identity_rule_exact_ids:output.filter(x=>x.identity_source_matches.sacred_art_historical_rule_id).length,
 relic_subject_slug_candidates:output.filter(x=>x.identity_source_matches.relic_candidate_subject_id).length,
 saints_pilot_person_links:output.filter(x=>x.existing_saints_pilot_id).length,
 five_star_source_portrait_candidates_unreleased:output.filter(x=>x.five_star_existing_source_portrait_candidate).length,
 new_verified_person_records:0,current_art_promotions:0,relic_authentications:0,
};
assert.equal(counts.calendar_doctor_exact_ids,13);
assert.equal(counts.calendar_living_exact_ids,2);
assert.equal(counts.calendar_post1960_exact_ids,0);
assert.equal(counts.historical_art_identity_rule_exact_ids,89);
assert.equal(counts.relic_subject_slug_candidates,40);
assert.equal(counts.saints_pilot_person_links,2);
assert.equal(counts.five_star_source_portrait_candidates_unreleased,2);
assert(output.some(x=>x.historical_identity_id==="event.conversion-paul"&&x.identity_namespace==="event"
  &&x.archived_representation_mode==="individual"),
 "Historic UI representation 'individual' cannot override event identity");
assert(output.every(x=>x.identity_namespace!=="group"||x.identity_scope==="ONE_GROUP_PROFILE_DO_NOT_EXPAND_MEMBERS"));
const archiveDate=output.filter(x=>x.nominal_mm_dd==="10-03");
assert(archiveDate.some(x=>x.historical_identity_id==="saint.therese-lisieux"
 &&x.existing_saints_pilot_id==="saint:therese-of-lisieux"));
const nov=output.filter(x=>x.nominal_mm_dd==="10-17");
assert(nov.some(x=>x.historical_identity_id==="saint.margaret-mary-alacoque"
 &&x.existing_saints_pilot_id==="saint:margaret-mary-alacoque"));
assert(output.every(x=>!x.new_person_record_created&&!x.current_artwork_binding_created&&!x.verified_relic_custody_added));
const result={
 schema:"ao.saints.historical-311-cross-owner-identity-triage.v1",
 status:"EXACT_KEY_MATCH_AND_REVIEW_CANDIDATES_ONLY",
 source_historical:"data/saints/historical-v4333-311-components.recovered.v1.json",
 source_owners:{
  calendar_doctors:"calendar/1224-living-sanctoral-pilot pinned Doctors roster",
  calendar_living:"calendar/1224-living-sanctoral-pilot pinned modern six",
  calendar_canonizations:"calendar/1224-living-sanctoral-pilot pinned official 258",
  sacred_art_legacy:"research/w60-sanctoral-art-physical-dedupe-20261015 pinned W62",
  sacred_art_five:"research/w60-sanctoral-art-physical-dedupe-20261015 pinned W64",
  relic:"data/explore/worldwide-relic-subject-census.research.v1.json",
 },
 rules:[
  "Full 311 distinct historical component instances preserved, NOT 311 unique saints",
  "Human saint person, group, angel and event identities determined by historical namespace, not individual display mode",
  "Exact shared namespace/ID matches are evidence links, not universal canonical person/feast status",
  "Relic subject slug resemblance does not independently authenticate a relic or subject person",
  "Five-star user image rating does not certify reproduction rights, image master, correct crop, photograph or publication",
  "Existing user no-art decisions and rejected original artwork rules prevail over inferred suggestions",
  "Later Doctor declarations do not retrospectively alter 1962 liturgical status",
  "No 1962 Calendar, modern memorial, physical Place, art master, saint profile or relic object is modified"
 ],
 counts,instances:output};
const dest=resolve(root,"artifacts/saints-calendar-census/saints-v4333-311-owner-identity-and-art-review.json");
mkdirSync(dirname(dest),{recursive:true});
writeFileSync(dest,JSON.stringify(result,null,2)+"\n");
console.log("PASS historical 311 exact owner identity triage: "+JSON.stringify(counts));
