// Source-preserving join between the *observed* 2026 day resolver, Calendar's
// nominal protected feasts / Doctors, and Art's historical occurrence targets.
// Caller supplies pinned read-only owner JSONs; never mutates their registries.
import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve,dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const input=resolve(root,"artifacts/saints-calendar-census/saints-calendar-2026-observed-owner-census.json");
const own=resolve(root,"artifacts/saints-owner-inputs");
const read=file=>JSON.parse(readFileSync(file,"utf8"));
const snapshot=read(input);
const protectedFeasts=read(resolve(own,"calendar-protected-70.json"));
const doctors=read(resolve(own,"calendar-doctors-38.json"));
const artHistory=read(resolve(own,"art-w62-historical-expectations.json"));
const artYear=read(resolve(own,"art-w63-dated-source-evidence.json"));
assert.equal(snapshot.schema,"ao.saints.2026-observed-liturgical-day-census.v1");
assert.equal(snapshot.days.length,365);
assert.equal(protectedFeasts.feasts.length,70);
assert.equal(doctors.doctors.length,38);
assert.equal(artYear.dates.length,365);
const historical=artHistory.historyIdentityInputs;
assert.equal(historical.expectedHistoricalMonthCounts.length,12);
assert.equal(historical.identityLocks.length,36);
const count=(rows)=>rows.reduce((n,x)=>n+x,0);
assert.equal(count(historical.expectedHistoricalMonthCounts.map(x=>x.saintBearingDates)),252);
assert.equal(count(historical.expectedHistoricalMonthCounts.map(x=>x.componentOccurrences)),311);
const byDate=new Map(snapshot.days.map(x=>[x.date,x]));
const allDaysByPrincipalId=new Map();
for(const d of snapshot.days){
 const id=d.principal.source_id;
 if(!allDaysByPrincipalId.has(id))allDaysByPrincipalId.set(id,[]);
 allDaysByPrincipalId.get(id).push(d.date);
}
const normal=value=>String(value??"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const monDay=d=>d.slice(5);
function eventEvidence(day,sourceId){
 const lists=day?.commemorations||{};
 const ids=(lists.canonical_rows||[]).filter(row=>row.source_id===sourceId);
 const labels=(lists.labels_en||[]).filter(Boolean);
 const proper=(lists.proper_prayers||[]).filter(x=>x.path||x.prayer_source_path);
 return {exact_ids:ids.map(x=>x.source_id),named_labels:labels,
   prayer_paths:proper.map(x=>x.path),prayer_source_paths:proper.map(x=>x.prayer_source_path)};
}
function evaluateSource(sourceId,md){
 const date="2026-"+md;
 const day=byDate.get(date);
 assert(day,"Missing observed target day "+date);
 const exactPrincipal=day.principal.source_id===sourceId;
 const sources=allDaysByPrincipalId.get(sourceId)||[];
 const comm=eventEvidence(day,sourceId);
 // The source ID may occur in Proper orations even when it is not the
 // principal. That alone does not establish a canonical named saint identity.
 const inferredProperPath=/^sancti:([^:]+):/.exec(sourceId)?.[1]??null;
 const prayerCandidate=inferredProperPath?comm.prayer_paths.some(x=>
   x.toLowerCase()==="sancti/"+inferredProperPath.toLowerCase()):false;
 const status=exactPrincipal?"OBSERVED_PRINCIPAL_ON_NOMINAL_DATE":
   comm.exact_ids.length?"COMMEMORATED_BY_EXACT_CANONICAL_ID_ON_DATE":
   sources.length?"SOURCE_ID_OBSERVED_ON_ANOTHER_DATE":
   prayerCandidate?"SANCTORAL_PRAYER_PATH_POSSIBLE_COMM_NO_PERSON_ASSERTION":
   "NOT_VISIBLE_AS_EXACT_ID_IN_THIS_YEAR_OBSERVED_OWNER";
 return {date,nominal_source_id:sourceId,source_match_status:status,
   observed_main_source_id:day.principal.source_id,
   observed_main_cycle:day.principal.observed_cycle,
   observed_main_title:day.principal.title_en,
   other_dates_with_source_id:sources.filter(d=>d!==date),
   commemoration_exact_source_ids:comm.exact_ids,
   commemoration_labels:comm.named_labels,
   commemoration_proper_paths:comm.prayer_paths,
   observation_scope:"ONE_YEAR_OWNER_OUTPUT_NOT_INDEPENDENT_NOMINAL_1962_PROPER_VERDICT"};
}
const protectedRows=protectedFeasts.feasts.map(f=>{
 const base=evaluateSource(f.resolverIdentity,f.monthDay);
 const isUnobserved=base.source_match_status==="NOT_VISIBLE_AS_EXACT_ID_IN_THIS_YEAR_OBSERVED_OWNER";
 const observedOverrideType=isUnobserved?
   (/\bsunday\b/i.test(base.observed_main_title)?"OBSERVED_SUNDAY_MAIN":
   base.observed_main_cycle==="temporale"?"OBSERVED_NON_SUNDAY_TEMPORA_MAIN":"OTHER_SOURCE_MAIN_REVIEW"):null;
 return {nominal_mm_dd:f.monthDay,title_for_review:f.titleForReview,
   source_owner_status:f.identityMatchStatus,
   source_owner_2024_2027_archived_evidence:f.evidence?.source??null,
   observed_override_type:observedOverrideType,
   ...base};
});
const doctorsRows=doctors.doctors.map(d=>{
 const id=d.observanceSourceIdentity||null,md=d.liturgicalDate1962||null;
 const status=id&&md?evaluateSource(id,md):null;
 return {calendar_person_id:d.canonicalPersonId,name:d.name,
  doctor_declaration_after_1962:!!d.recognitionAfter1962,
  nominal_1962_identity:id,nominal_mm_dd:md,
  source_status:d.status1962??null,
  observation:status,
  held_reason:!id?"NO_1962_SOURCE_ID_IN_DOCTOR_OWNER_NOT_NEGATIVE_FEAST_CLAIM":null};
});
const artHistoricalLocks=historical.identityLocks.map(lock=>{
 const day=byDate.get("2026-"+lock.date);
 assert(day,"Missing observed historical lock date "+lock.date);
 return {mm_dd:lock.date,legacy_identity:lock.canonicalId,
   observed_principal_source_id:day.principal.source_id,
   observed_principal_title:day.principal.title_en,
   observed_cycle:day.principal.observed_cycle,
   commemoration_titles:day.commemorations.labels_en,
   same_person_verified:false,
   status:"HISTORICAL_DATE_LOCK_NOT_CANONICAL_PERSON_MATCH"};
});
const artResearchByDate=new Map(artYear.dates.map(d=>[d.date,d]));
const artDateRows=snapshot.days.map(d=>{
 const source=artResearchByDate.get(d.date);
 assert(source,"Missing Art owner's date "+d.date);
 const research=artYear.documentedSourceAssociations.find(r=>r.date===d.date);
 const claimedId=source.observedPrincipalIdFromScopedCrosswalk;
 const scopedIdConflict=!!claimedId&&claimedId!==d.principal.source_id;
 return {date:d.date,observed_principal_id:d.principal.source_id,
   art_owner_scoped_principal_id:claimedId,
   source_id_conflict:scopedIdConflict,
   art_owner_candidate_relation_state:source.candidateRelationState,
   scoped_candidate_links:source.scopedArtworkResearchLinks,
   surviving_unapproved_links:source.nonRejectedSourceCandidateLinks,
   excluded_by_user_rating_links:source.original0to2RejectedLinks,
   source_assoc_originals:(research?.exactAssociations||[]).length+(research?.contextualAssociations||[]).length,
   published_image_proven:false,calendar_coverage_certified:false};
});
const counts=rows=>Object.fromEntries([...new Set(rows.map(r=>r.source_match_status))].map(k=>[k,rows.filter(r=>r.source_match_status===k).length]));
const all=artDateRows.filter(x=>x.source_id_conflict);
assert.equal(all.length,0,"Art source evidence disagrees with the real observed principal source ID; owner review required");
const nonobservedProtected=protectedRows.filter(x=>x.source_match_status==="NOT_VISIBLE_AS_EXACT_ID_IN_THIS_YEAR_OBSERVED_OWNER");
const mainTypeCount=Object.fromEntries([...new Set(nonobservedProtected.map(x=>x.observed_override_type))].map(
 key=>[key,nonobservedProtected.filter(x=>x.observed_override_type===key).length]));
const doctorStatusCount=Object.fromEntries([...new Set(doctorsRows.map(x=>x.observation?.source_match_status??"NO_1962_SOURCE_ID_IN_OWNER"))].map(
 key=>[key,doctorsRows.filter(x=>(x.observation?.source_match_status??"NO_1962_SOURCE_ID_IN_OWNER")===key).length]));
const out={
 schema:"ao.saints.2026-cross-owner-source-reconciliation.v1",
 publication:"RESEARCH_ONLY_NO_CALENDAR_OR_ART_OWNER_MUTATION",
 input_provenance:{
  source_owner:"original Ad Orientem 365 day resolver; source snapshot in this workflow",
  protected:"Calendar PR #1226, pinned source JSON",
  doctors:"Calendar PR #1226, pinned source JSON",
  history:"Sacred Art PR #1231 W62 historical 252-day/311-occurrence expectation",
  art_2026:"Sacred Art PR #1231 W63 limited date-research sources",
 },
 safeguards:[
  "2026 observed source does not exhaust nominal 1962 feast, commemorations, transfers or local religious propers",
  "70 protected feast entries may be Lord/Marian/angel/event subjects and are not automatically 70 saint persons",
  "Doctor-of-the-Church declaration and 1962 liturgical observance are independent fields",
  "36 W62 historical date locks do not serialize all 311 saint-group occurrences",
  "Artwork candidate links, including unrejected ones, are not image approval or proof of user-facing image coverage",
  "An oration source path alone does not certify the person being commemorated",
  "No source-owned 1962 Calendar, metadata, Person ID or painting is changed",
 ],
 counts:{
  protected_total:protectedRows.length,protected_statuses:counts(protectedRows),
  protected_nonobserved_main_types:mainTypeCount,doctor_statuses:doctorStatusCount,
  doctors_total:doctorsRows.length,
  doctors_with_1962_source_id:doctorsRows.filter(x=>x.observation).length,
  doctors_with_observed_principal_on_2026_nominal_day:doctorsRows.filter(x=>x.observation?.source_match_status==="OBSERVED_PRINCIPAL_ON_NOMINAL_DATE").length,
  historical_dates_expected:252,historical_component_occurrences_expected:311,
  serialized_historical_date_locks:artHistoricalLocks.length,
  art_owner_dates:artDateRows.length,
  art_scoped_source_ids_different_from_actual:all.length,
  dated_art_scoped_candidate_dates:artDateRows.filter(x=>x.scoped_candidate_links>0).length,
  dates_with_approved_image_in_this_reconciliation:0,
 },
 protected_source_rows:protectedRows,doctor_source_rows:doctorsRows,
 historical_art_date_locks:artHistoricalLocks,
 year_art_owner_date_join:artDateRows};
const target=resolve(root,"artifacts/saints-calendar-census/saints-2026-protected-doctors-historicart-crosswalk.json");
mkdirSync(dirname(target),{recursive:true});
writeFileSync(target,JSON.stringify(out,null,2)+"\n");
assert.equal(protectedRows.length,70);assert.equal(doctorsRows.length,38);
assert.equal(artHistoricalLocks.length,36);assert.equal(artDateRows.length,365);
assert(protectedRows.every(x=>x.nominal_source_id&&x.source_match_status));
console.log("PASS pinned Calendar/Art cross-owner observed-source reconciliation: "+JSON.stringify(out.counts));
