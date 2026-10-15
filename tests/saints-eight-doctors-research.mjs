import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const draft=read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json");
const taxonomy=read("data/saints/classification-taxonomy.v1.json");
const frozen=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const pilots=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const calendar=read("artifacts/saints-owner-inputs/calendar-doctors-38.json");
const aliases=read("data/saints/1962-doctors-historical-id-alias-review.v1.json");
assert.equal(draft.schema,"ao.saints.holiness-first-eight-doctors-research-batch.v1");
assert.equal(draft.publication,"RESEARCH_ONLY_NO_APP_VISIBILITY");
assert.equal(draft.people.length,8);
const codes=new Set(taxonomy.families.roles);
const extraordinary=new Set(taxonomy.families.extraordinary_accounts);
const matched=new Set(),byDate=new Map(frozen.rows.map(x=>[x.date,x]));
const aliasIds=new Map(aliases.proposed_pairs.map(x=>[x.calendar_person_id,x.historical_identity_id]));
const roster=new Map(calendar.doctors.map(x=>[x.canonicalPersonId,x]));
const src=val=>{try{const u=new URL(val);return u.protocol==="https:"&&u.hostname==="www.vatican.va"&&
 u.pathname.startsWith("/content/benedict-xvi/en/audiences/");}catch{return false;}};
let factCount=0,experienceCount=0,sourceHolds=0;
for(const p of draft.people){
 assert(!matched.has(p.calendar_person_id),"Duplicate person");
 matched.add(p.calendar_person_id);
 const r=roster.get(p.calendar_person_id);
 assert(r,"Draft Doctor not recorded in existing Calendar 38-person roster");
 assert.equal(p.historical_identity_id,aliasIds.get(p.calendar_person_id)||p.calendar_person_id);
 assert.equal(p.nominal_1962_date,r.liturgicalDate1962);
 assert(byDate.get(p.nominal_1962_date)?.components.some(x=>x.historical_identity_id===p.historical_identity_id),"Historical source identity/date absent");
 assert.equal(p.recognition_status,"SAINT");
 assert.equal(p.publication,"NOT_APP_VISIBLE");
 assert.equal(p.editorial_status,"RESEARCHED_DRAFT_NEEDS_SECOND_PERSON_LEVEL_REVIEW");
 assert.equal(p.approved_artwork_id,null);
 assert.deepEqual(p.canonical_place_ids,[]);
 assert.equal(p.map_pin_count,0);
 assert.equal(p.classifications.formal_honours[0]?.code,"DOCTOR_OF_CHURCH");
 assert(p.classifications.roles.length>=3);
 for(const c of p.classifications.roles)assert(codes.has(c.code),"Unknown role "+c.code);
 for(const l of ["en","fr"]){
  assert(p.name[l]?.length>=7);
  assert(p.why_honoured[l]?.length>=100,"Substantive holiness explanation missing "+p.calendar_person_id+" "+l);
 }
 assert(p.source_urls.length>0&&p.source_urls.every(src));
 assert.equal(p.biography_facts.length,3);
 for(const fact of p.biography_facts){
  assert(fact.claim_id?.startsWith(p.calendar_person_id+".fact."));
  assert(fact.en?.length>45&&fact.fr?.length>45);
  assert(fact.source_urls.length>0&&fact.source_urls.every(x=>p.source_urls.includes(x)&&src(x)));
  factCount++;
 }
 const hold=["saint.augustine-hippo","saint.alphonsus-liguori"].includes(p.calendar_person_id);
 assert.equal(p.person_identity_1962_status,
  hold?"HISTORICAL_NEW_SOURCE_COLOUR_DIFFERENCE_REVIEW_HOLD":"HISTORICAL_AND_CALENDAR_CROSSWALK_SEPARATE");
 if(hold)sourceHolds++;
 for(const e of p.extraordinary_accounts){
  assert(extraordinary.has(e.kind),"Unclassified extraordinary account");
  assert(e.en?.length>100&&e.fr?.length>100);
  assert(src(e.source)&&p.source_urls.includes(e.source),"Exact Vatican account source required");
  assert(e.attribution==="REPORTED_IN_HAGIOGRAPHY_NOT_VERIFIED_BY_AD_ORIENTEM");
  assert(e.status?.includes("ACCOUNT")||e.status?.includes("VISION"));
  experienceCount++;
 }
}
assert.equal(factCount,24);assert.equal(experienceCount,2);assert.equal(sourceHolds,2);
assert.equal(draft.totals.new_person_drafts,8);
assert.equal(draft.totals.fact_claims,factCount);
assert.equal(draft.totals.source_backed_extraordinary_reports,experienceCount);
assert.equal(draft.totals.people_added_to_app,0);
assert.equal(draft.totals.photographs_approved,0);
assert(!draft.people.some(x=>pilots.people.some(y=>y.saint_id===x.calendar_person_id.replace(/^saint\./,"saint:"))));
assert.equal(draft.people.find(x=>x.calendar_person_id==="saint.thomas-aquinas").extraordinary_accounts[0].kind,"CHRIST_LOCUTION_ACCOUNT",
 "Reported words from a crucifix must not be mislabelled as an apparition");
assert.equal(draft.people.find(x=>x.calendar_person_id==="saint.catherine-siena").extraordinary_accounts[0].kind,"CHRIST_APPARITION_ACCOUNT");
// Separate historical-life metadata: do not infer birthdays from feast dates or
// silently turn an approximate medieval year into a spurious exact ISO day.
const allowedPrecisions=new Set([
 "APPROXIMATE_YEAR","YEAR_RANGE","YEAR","EXACT_DATE",
 "EXACT_DATE_NEEDS_SECOND_SOURCE","EXACT_DATE_PLACE_AWAITING_SEPARATE_CHECK"
]);
for(const p of draft.people){
 const v=p.life_events_review;
 assert.equal(v?.review_status,"RESEARCH_SOURCED_BIRTH_DEATH_NOT_SECOND_EDITOR_SIGNED");
 assert.equal(v.feast_scope,"CALENDAR_OWNER_PENDING_CONSULT_EXISTING_NOMINAL_1962_DATE");
 assert.equal(v.artwork_scope,"SACRED_ART_OWNER_PENDING_NO_IMAGE_PROMOTION");
 for(const key of ["birth","death"]){
   const event=v[key];
   assert(allowedPrecisions.has(event?.date_precision),p.calendar_person_id+" "+key+" invalid date precision");
   for(const lang of ["en","fr"]){
     assert(event.date_label?.[lang]?.length>2,p.calendar_person_id+" "+key+" missing "+lang+" date label");
     assert(event.place?.[lang]?.length>3,p.calendar_person_id+" "+key+" missing "+lang+" birthplace or deathplace");
   }
   const u=new URL(event.source_url);
   assert.equal(u.hostname,"www.vatican.va");
   assert.equal(u.protocol,"https:");
   if(event.iso_date)assert(/^\d{4}-\d{2}-\d{2}$/.test(event.iso_date));
   if(["APPROXIMATE_YEAR","YEAR_RANGE","YEAR"].includes(event.date_precision))
     assert.equal(event.iso_date,null,"Imprecise date must not get fake exact ISO birthday");
 }
}
assert(draft.people.some(p=>p.life_events_review.birth.date_precision==="YEAR_RANGE"),
 "Medieval birth uncertainty must be explicitly retained");

const enrichedDoctors=new Set(["saint.gregory-great","saint.john-chrysostom","saint.francis-sales",
 "saint.alphonsus-liguori","saint.augustine-hippo","saint.bonaventure"]);
assert.equal(draft.people.filter(p=>p.editorial_expansion).length,6);
for(const p of draft.people.filter(p=>enrichedDoctors.has(p.calendar_person_id))){
 assert.equal(p.editorial_expansion.status,"SOURCE_ANCHORED_BILINGUAL_RESEARCH_REVISION_NOT_APPROVED");
 assert(p.editorial_expansion.source_urls.length>0);
 assert(p.editorial_expansion.source_urls.every(u=>p.source_urls.includes(u)));
 const joined=lang=>[p.why_honoured[lang],...p.biography_facts.map(x=>x[lang])].join(" ").trim().split(/\s+/).length;
 assert(joined("en")>=110&&joined("en")<=150);
 assert(joined("fr")>=110,"French research life should not be abridged relative to English");
}

assert.equal(draft.people.filter(x=>x.reader_biography).length,5);
console.log("PASS eight source-backed bilingual Doctor life drafts, 24 per-claim sources, two qualified private accounts, no release mutations");
