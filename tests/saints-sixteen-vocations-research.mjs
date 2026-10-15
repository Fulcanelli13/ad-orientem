import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=f=>JSON.parse(readFileSync(new URL("../"+f,import.meta.url),"utf8"));
const draft=read("data/saints/holiness-first-sixteen-cross-vocation-research.v1.json");
const taxonomy=read("data/saints/classification-taxonomy.v1.json");
const hist=read("data/saints/historical-v4333-311-components.recovered.v1.json");
const pilot=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const doctors=read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json");
const calendar=read("artifacts/saints-owner-inputs/calendar-post1960-258.json");
assert.equal(draft.schema,"ao.saints.holiness-first-sixteen-cross-vocation-research.v1");
assert.equal(draft.publication,"RESEARCH_ONLY_NOT_APP_VISIBLE");
assert.equal(draft.people.length,16);
const allowed=new Set(taxonomy.families.roles),events=new Set(taxonomy.families.extraordinary_accounts);
const byHistoric=new Map(hist.rows.map(x=>[x.date,x]));
const modern=new Map(calendar.persons.map(x=>[x.id,x]));
const nativeIds=new Set(pilot.people.map(x=>x.saint_id));
const oldDraftIds=new Set(doctors.people.map(x=>x.calendar_person_id));
const names=new Set();
let facts=0,extra=0,histLinks=0,modernLinks=0,eachRole=new Set();
for(const p of draft.people){
 assert(!names.has(p.person_id),"Duplicate person identity "+p.person_id);
 names.add(p.person_id);
 assert(/^saint\.[a-z0-9-]+$/.test(p.person_id),"Expected single person, not an unexpanded martyr group");
 assert(!nativeIds.has(p.person_id)&&!oldDraftIds.has(p.person_id),"Saint person reused from an existing life draft");
 assert.equal(p.publication,"RESEARCH_ONLY_NOT_APP_VISIBLE");
 assert.equal(p.editorial_status,"SECOND_PERSON_LEVEL_REVIEW_REQUIRED");
 assert.equal(p.recognition_status,"SAINT");
 assert.equal(p.artwork_master_id,null);
 assert.deepEqual(p.place_ids,[]);
 assert.equal(p.new_pins,0);
 for(const lang of ["en","fr"]){
   assert(p.name?.[lang]?.length>=7);
   assert(p.why_honoured?.[lang]?.length>=90,"Lack of substantive holiness-first biography "+p.person_id+" "+lang);
 }
 assert.equal(p.biography_facts.length,3,"Need precisely three concrete sourced claims "+p.person_id);
 const sources=p.source_urls||[];
 assert(sources.length>=1);
 for(const x of sources){const u=new URL(x);assert.equal(u.protocol,"https:");assert(["www.vatican.va","press.vatican.va"].includes(u.hostname));}
 for(const f of p.biography_facts){
  assert(f.claim_id?.startsWith(p.person_id+".fact."));
  assert(f.en?.length>=45&&f.fr?.length>=45);
  assert(f.source_urls.length>=1);
  assert(f.source_urls.every(x=>sources.includes(x)),"Missing claim-specific Holy See URL");
  facts++;
 }
 assert.equal(p.classification.formal_honours.length,0,"Do not infer Doctor/Patron status");
 for(const r of p.classification.roles){assert(allowed.has(r.code),"Unlisted category "+r.code);eachRole.add(r.code);}
 assert(p.classification.roles.length>=2);
 if(p.historical_311_id){
  assert.equal(p.historical_311_id,p.person_id,"Historical ID must match exactly until reviewed aliases");
  assert(/^\d\d-\d\d$/.test(p.historical_311_nominal_month_day));
  const h=byHistoric.get(p.historical_311_nominal_month_day);
  assert(h?.components.some(c=>c.historical_identity_id===p.person_id),"Date and historical person source mismatch");
  assert.equal(p.calendar_1962_relation,"HISTORICAL_ART_COMPONENT_EXACT_PERSON_DATE_NOT_ALL_YEAR_1962_FEAST_PROOF");
  histLinks++;
 }else{
  assert.equal(p.historical_311_nominal_month_day,null);
  assert.equal(p.calendar_1962_relation,"NOT_IN_311_ART_COMPONENTS_DOES_NOT_MEAN_NOT_IN_1962_CALENDAR");
 }
 if(p.official_post1960_calendar_owner_id){
   assert.equal(p.official_post1960_calendar_owner_id,p.person_id);
   assert(modern.has(p.person_id),"Unregistered modern saint or wrong Calendar ID");
   assert.equal(modern.get(p.person_id).calendar1962SourceId,null);
   modernLinks++;
 }
 for(const ev of p.extraordinary_accounts){
  assert(events.has(ev.kind),"Unknown extraordinary kind");
  assert(ev.event_id.startsWith(p.person_id+".event."));
  assert(ev.en?.length>=100&&ev.fr?.length>=100);
  assert(ev.status&&ev.attribution.includes("REPORTED"));
  assert(ev.source_urls.every(x=>sources.includes(x)));
  extra++;
 }
}
assert.equal(facts,48);assert.equal(extra,2);
assert.equal(histLinks,7);assert.equal(modernLinks,5);
assert([...["MARTYR","MISSIONARY","CHARITY_TO_POOR","FOUNDER","PASTOR","MYSTIC"]].every(k=>eachRole.has(k)));
for(const id of ["saint.maximilian-kolbe","saint.damien-de-veuster","saint.teresa-benedicta-cross-stein","saint.elizabeth-ann-seton","saint.jeanne-jugan"])
 assert(modern.has(id));
assert.equal(draft.people.find(x=>x.person_id==="saint.francis-assisi").extraordinary_accounts[0].kind,"STIGMATA_ACCOUNT");
assert.equal(draft.people.find(x=>x.person_id==="saint.faustina-kowalska").extraordinary_accounts[0].kind,"CHRIST_APPARITION_ACCOUNT");
assert(!draft.people.some(p=>p.person_id==="saint.francis-assisi"&&p.historical_311_id!==null),
 "Absence from historical visual components is not a negative Calendar finding");
assert.equal(draft.counts.new_bilingual_life_drafts,16);
assert.equal(draft.counts.new_fact_claims,48);
assert.equal(draft.counts.extraordinary_accounts,2);
assert.equal(draft.counts.historical_311_exact_date_links,7);
assert.equal(draft.counts.official_post1960_index_links,5);
assert.equal(draft.counts.new_app_visible,0);
assert.equal(draft.counts.new_place_pins,0);
assert.equal(draft.counts.new_approved_artworks,0);
// Research chronology is attached separately from the existing fact-level biographies.
// It cannot imply a Calendar feast, an original map location or a new artwork.
const precisions=new Set(["EXACT_DATE","EXACT_DATE_PLACE_REVIEW",
 "EXACT_DATE_PLACE_DISPUTED","UNKNOWN","APPROXIMATE_TRADITIONAL_YEAR",
 "CONFLICTING_DAY","CONTESTED_DATE_OR_YEAR","APPROXIMATE_YEAR_RANGE","PROBABLE_EXACT_DAY"]);
let uncertainLifeEvents=0;
for(const p of draft.people){
 const review=p.life_events_review;
 assert.equal(review?.review_status,"RESEARCH_SOURCED_BIRTH_DEATH_NOT_SECOND_EDITOR_SIGNED");
 assert.equal(review.feast_scope,"CALENDAR_OWNER_PENDING_NO_INFERRED_LITURGICAL_OBSERVANCE");
 assert.equal(review.artwork_scope,"SACRED_ART_OWNER_PENDING_NO_IMAGE_PROMOTION");
 for(const key of ["birth","death"]){
   const e=review[key];
   assert(precisions.has(e?.date_precision),"Unknown precision: "+p.person_id+" "+key);
   for(const lang of ["en","fr"]){
     assert(e.date_label?.[lang]?.length>=3,p.person_id+" "+key+" missing "+lang+" date");
     assert(e.place?.[lang]?.length>=5,p.person_id+" "+key+" missing "+lang+" place");
   }
   const u=new URL(e.source_url);assert.equal(u.protocol,"https:");
   if(e.iso_date)assert(/^\d{4}-\d{2}-\d{2}$/.test(e.iso_date),"Invalid exact ISO date");
   if(["UNKNOWN","APPROXIMATE_TRADITIONAL_YEAR","CONFLICTING_DAY","CONTESTED_DATE_OR_YEAR","APPROXIMATE_YEAR_RANGE","PROBABLE_EXACT_DAY"].includes(e.date_precision)){
     uncertainLifeEvents++;assert.equal(e.iso_date,null,"Uncertain historical life date must not be fake exact ISO");
   }
 }
}
assert.equal(uncertainLifeEvents,6,"Preserve six explicit uncertain birth/death events");
assert.equal(draft.people.find(x=>x.person_id==="saint.maria-goretti").life_events_review.death.iso_date,
 "1902-07-06","Do not confuse assault day/location with hospital death");
assert.equal(draft.people.find(x=>x.person_id==="saint.ignatius-antioch").life_events_review.birth.date_precision,
 "UNKNOWN","Do not invent Ignatius's birth");
assert.equal(draft.people.find(x=>x.person_id==="saint.louise-de-marillac").life_events_review.birth.date_precision,
 "EXACT_DATE_PLACE_DISPUTED","Paris/Le Meux birthplace disagreement must remain flagged");

const newExpanded=new Set(["saint.francis-xavier","saint.vincent-de-paul","saint.john-bosco",
 "saint.john-mary-vianney","saint.rose-of-lima","saint.charles-borromeo","saint.maria-goretti",
 "saint.damien-de-veuster","saint.louise-de-marillac","saint.faustina-kowalska",
 "saint.teresa-benedicta-cross-stein","saint.elizabeth-ann-seton"]);
assert.equal(draft.people.filter(p=>p.editorial_expansion).length,12);
for(const p of draft.people.filter(p=>newExpanded.has(p.person_id))){
 assert.equal(p.editorial_expansion.status,"SOURCE_ANCHORED_BILINGUAL_RESEARCH_REVISION_NOT_APPROVED");
 assert(p.editorial_expansion.source_urls.length>0);
 assert(p.editorial_expansion.source_urls.every(u=>p.source_urls.includes(u)));
 const joined=lang=>[p.why_honoured[lang],...p.biography_facts.map(x=>x[lang])].join(" ").trim().split(/\s+/).length;
 assert(joined("en")>=110&&joined("en")<=150);
 assert(joined("fr")>=110);
}

assert.equal(draft.people.filter(x=>x.reader_biography).length,16);
assert(draft.people.every(x=>x.reader_biography?.en && x.reader_biography?.fr && x.publication==="RESEARCH_ONLY_NOT_APP_VISIBLE"));
console.log("PASS 16 distinct EN/FR holiness-first saint drafts, 48 sourced facts, 2 qualified extraordinary accounts, 7 historic and 5 official post-1960 owner links; 0 published changes");
