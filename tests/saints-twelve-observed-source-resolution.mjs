// Verify bulk reconciliation of exactly 12 person-like Calendar source headings.
// This does NOT certify 12 newly discovered saints or change liturgical sources.
import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const file="data/saints/observed-2026-twelve-person-source-reconciliation.v1.json";
const x=read(file),historical=read("data/saints/historical-v4333-311-components.recovered.v1.json"),
  ledger=read("data/saints/full-calendar-exact-source-key-ledger-20261016.v1.json");
assert.equal(x.schema,"ao.saints.observed-2026-twelve-personlike-source-reconciliation.v1");
assert.equal(x.records.length,12);
assert.equal(new Set(x.records.map(r=>r.observed_source_id)).size,12);
assert.equal(x.counts.same_date_archived_individual_subject_anchors,9);
assert.equal(x.counts.special_historical_companion_or_commemoration_overrides,2);
assert.equal(x.counts.held_apostolic_conflict,1);
const expectedIds=[
 "commemoration:12-04-barbara:4:r","inseparable:sancti:06-29-petrus",
 "sancti:05-16:3:w","sancti:06-18:3:w","sancti:06-19:3:w",
 "sancti:07-18:3:w","sancti:07-20:3:w","sancti:07-23:3:r",
 "sancti:07-29:3:w","sancti:08-28:3:w","sancti:11-13:3:w","sancti:11-14:3:r"];
assert.deepEqual(x.records.map(r=>r.observed_source_id).sort(),expectedIds.sort());
const groups=new Map();
for(const r of x.records){
 assert(/^2026-\d\d-\d\d$/.test(r.observed_date_2026));
 assert(r.observed_title_en.length>5&&r.documentation_note.length>70);
 assert.equal(r.person_identity_is_canonically_certified,false);
 assert.equal(r.published_1962_observance_approved,false);
 assert.equal(r.authorized_artwork_id,null);
 assert.equal(r.physical_geography_id,null);
 const category=r.source_owner_comparison_status;
 groups.set(category,(groups.get(category)??0)+1);
 const sameDate=historical.rows.find(x=>x.date===r.observed_date_2026.slice(5));
 assert(sameDate,"Archive missing the observed 2026 nominal date "+r.observed_date_2026);
 assert.deepEqual(r.historical_observance_source_ids,sameDate.original_source_observances.map(x=>x.id));
 // These 12 source IDs are precisely absent from the raw historical observance
 // inventory; archival person subject keys are a different namespace.
 assert(!r.historical_observance_source_ids.includes(r.observed_source_id));
 if(category==="HELD_APOSTOLIC_SOURCE_CONTEXT_CONFLICT"){
   assert.equal(r.documented_archived_subject_key,null);
   assert.equal(r.documented_archived_component_id,null);
   assert.equal(r.observed_source_id,"inseparable:sancti:06-29-petrus");
   assert(sameDate.components.some(x=>x.historical_identity_id==="saint.peter-apostle"));
   assert(sameDate.components.some(x=>x.historical_identity_id==="saint.paul-apostle"));
 }else{
   assert(r.documented_archived_subject_key?.startsWith("saint."));
   assert(ledger.records.some(x=>x.source_key===r.documented_archived_subject_key));
   const archived=sameDate.components.find(x=>x.historical_component_id===r.documented_archived_component_id);
   assert(archived&&archived.historical_identity_id===r.documented_archived_subject_key);
   assert.equal(archived.historical_representation_mode,"individual");
   assert.equal(archived.historical_identity_status,"RESOLVED");
   if(category==="SPECIAL_OVERRIDE_COMMEMORATION_REVIEW"||
      category==="SPECIAL_OVERRIDE_COMPANIONS_REVIEW")assert.equal(archived.historical_override,true);
   if(category==="NOMINAL_DATE_EXACT_PERSON_ARCHIVE_DIFFERENT_SOURCE_CODE")assert.equal(archived.historical_override,false);
 }
}
assert.equal(groups.get("NOMINAL_DATE_EXACT_PERSON_ARCHIVE_DIFFERENT_SOURCE_CODE"),9);
assert.equal(groups.get("SPECIAL_OVERRIDE_COMMEMORATION_REVIEW"),1);
assert.equal(groups.get("SPECIAL_OVERRIDE_COMPANIONS_REVIEW"),1);
assert.equal(groups.get("HELD_APOSTOLIC_SOURCE_CONTEXT_CONFLICT"),1);
const queue="artifacts/saints-calendar-census/saints-2026-observed-42-source-gaps.json";
if(existsSync(resolve(root,queue))){
 const gaps=read(queue);
 assert.equal(gaps.missing_ids.length,42);
 const persons=gaps.missing_ids.filter(y=>y.provisional_kind==="INDIVIDUAL_OR_PERSON_TITLE_REVIEW");
 assert.equal(persons.length,12);
 assert.deepEqual(persons.map(y=>y.source_id).sort(),expectedIds.sort());
 for(const r of x.records){
  const g=persons.find(y=>y.source_id===r.observed_source_id);
  assert(g.dates.includes(r.observed_date_2026));
  assert(g.titles.includes(r.observed_title_en));
 }
}
console.log("PASS 12 observed personlike source gaps: 9 same-date historical subjects, 2 explicit override cases, 1 held Peter/Paul context; zero identity promotions");
