import assert from "node:assert/strict";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=f=>JSON.parse(readFileSync(resolve(root,f),"utf8"));
const six=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const eight=read("data/saints/holiness-first-eight-doctors-research-20261015.v1.json");
const sixteen=read("data/saints/holiness-first-sixteen-cross-vocation-research.v1.json");
const deskReview=read("data/saints/held-24-editorial-desk-review.v1.json");
assert.equal(six.people.length,6);
assert.equal(eight.people.length,8);
assert.equal(sixteen.people.length,16);
const normalized=x=>x.replace(/^saint:/,"saint.").replace(/^blessed:/,"blessed.");
const entries=[
...six.people.map(x=>({id:normalized(x.saint_id),name:x.display_name.en,owner:"NATIVE_SIX_PROFILE_PILOT",
 biography_state:"PILOT_RESEARCH_APP_DRAFT",visible_on_public_pages:false,subject_kind:x.recognition_status,
 facts:x.biography_facts.length,extraordinary_reports:x.extraordinary_accounts.length,
 artwork_ready:x.approved_artwork_ids.length>0,map_location_scope:"SOURCE_OWNED_EXISTING_PLACES",
 life_data_status:x.life?.birth?.date&&x.life?.death?.date?"NATIVE_DATES_SOURCED_EDITORIAL_REVIEW":"MISSING_LIFE_DATES",
 birth_date_precision:x.life?.birth?.date?"EXACT_DATE":null,death_date_precision:x.life?.death?.date?"EXACT_DATE":null,
 celebration_scope:x.life?.celebration?.scope||"PENDING"})),
...eight.people.map(x=>({id:x.calendar_person_id,name:x.name.en,owner:"HELD_EIGHT_DOCTOR_DRAFTS",
 biography_state:x.editorial_status,visible_on_public_pages:false,subject_kind:"SAINT",
 facts:x.biography_facts.length,extraordinary_reports:x.extraordinary_accounts.length,
 artwork_ready:!!x.approved_artwork_id,map_location_scope:"NONE",
 life_data_status:x.life_events_review?.review_status?"HISTORICAL_DATES_RESEARCHED_NOT_APPROVED":"MISSING_LIFE_DATES",
 birth_date_precision:x.life_events_review?.birth?.date_precision??null,
 death_date_precision:x.life_events_review?.death?.date_precision??null,
 celebration_scope:"CALENDAR_OWNER_PENDING"})),
...sixteen.people.map(x=>({id:x.person_id,name:x.name.en,owner:"HELD_SIXTEEN_DIVERSE_DRAFTS",
 biography_state:x.editorial_status,visible_on_public_pages:false,subject_kind:x.recognition_status,
 facts:x.biography_facts.length,extraordinary_reports:x.extraordinary_accounts.length,
 artwork_ready:!!x.artwork_master_id,map_location_scope:"NONE",
 life_data_status:x.life_events_review?.review_status?"HISTORICAL_DATES_RESEARCHED_NOT_APPROVED":"MISSING_LIFE_DATES",
 birth_date_precision:x.life_events_review?.birth?.date_precision??null,
 death_date_precision:x.life_events_review?.death?.date_precision??null,
 celebration_scope:"CALENDAR_OWNER_PENDING"}))
];
assert.equal(entries.length,30);
assert.equal(new Set(entries.map(x=>x.id)).size,30,"30 lives must represent 30 distinct people, not duplicate owner profiles");
assert(entries.every(x=>x.id&&x.name&&x.facts>=3));
assert.equal(entries.filter(x=>x.owner==="NATIVE_SIX_PROFILE_PILOT").length,6);
assert.equal(entries.filter(x=>x.owner!=="NATIVE_SIX_PROFILE_PILOT").length,24);
assert(entries.every(x=>!x.visible_on_public_pages&&!x.artwork_ready));
assert.equal(entries.reduce((s,x)=>s+x.facts,0),6*3+8*3+16*3);
assert.equal(entries.reduce((s,x)=>s+x.extraordinary_reports,0),2+2+2);
assert(entries.some(x=>x.id==="blessed.jacques-desire-laval"&&x.subject_kind==="BEATIFIED_NOT_CANONIZED"));
assert.equal(deskReview.schema,"ao.saints.held-24-editorial-desk-review.v1");
assert.equal(deskReview.publication,"EDITORIAL_REVIEW_ONLY");
assert.equal(deskReview.records.length,24);
const heldIds=new Set(entries.filter(x=>x.owner!=="NATIVE_SIX_PROFILE_PILOT").map(x=>x.id));
const reviewedIds=deskReview.records.map(x=>x.person_id);
assert.equal(new Set(reviewedIds).size,24,"The same saint must not consume two review slots");
assert(reviewedIds.every(id=>heldIds.has(id)),"Desk review may not invent or duplicate saint identities");
assert([...heldIds].every(id=>reviewedIds.includes(id)),"Each of 24 held lives needs its own review decision");
assert(deskReview.records.every(x=>x.review_stage==="ASSISTANT_DESK_REVIEW_NOT_SECOND_PERSON_CERTIFICATION"
 && !x.eligible_for_publication && !x.calendar_1962_feast_certified_here && !x.user_rated_artwork_in_this_file));
assert(deskReview.records.every(x=>x.publication_blocks?.length>=1 && x.profile_emphasis?.length>30
 && x.claim_count===3),"Every held saint requires a specific editorial point and three unmodified source claims");
assert.equal(deskReview.scope.source_spot_checked,11);
assert.equal(deskReview.scope.source_pending_deeper_check,13);
assert.equal(deskReview.scope.released_people,0);
const deepDocs=deskReview.records.filter(x=>x.reader_biography_review);
assert.equal(deepDocs.length,13,"Exactly 13 previously deeper-held subjects should receive specific reader research");
assert.equal(deskReview.scope.primary_documents_checked_for_held_subjects,13);
assert.equal(deskReview.scope.primary_documents_need_additional_line_by_line_audit,13);
assert.equal(deskReview.scope.people_with_nonrepetitive_reader_biography,13);
assert(deepDocs.every(x=>x.source_anchor_check==="PRIMARY_DOCUMENT_REVIEWED_CLAIM_LEVEL_COPYEDIT_PENDING"
 && !x.reader_biography_review.second_editor_certified
 && x.reader_biography_review.primary_source_url.startsWith("https://")
 && x.reader_biography_review.finding.length>60));
const ownerHeld=[...eight.people,...sixteen.people], readerBios=ownerHeld.filter(x=>x.reader_biography);
assert.equal(readerBios.length,13,"No duplicate reader biographies, and no accidental publication");
const readerIds=new Set(readerBios.map(x=>x.calendar_person_id||x.person_id));
assert.deepEqual([...readerIds].sort(),deepDocs.map(x=>x.person_id).sort());
for(const p of readerBios){
 assert.equal(p.reader_biography.editorial_status,"SOURCE_CHECKED_READER_DRAFT_NOT_SECOND_EDITOR_APPROVED");
 assert(p.reader_biography.source_urls.length>0);
 for(const lang of ["en","fr"]){
   const biography=p.reader_biography[lang];
   assert(biography.length>300,"A readout is missing or trivial");
   const n=biography.trim().split(/\\s+/).length;
   assert(n>=100 && n<=165,"A polished inline biography is poorly sized: "+(p.person_id||p.calendar_person_id)+" "+lang+" "+n);
 }
 assert(!p.approved_artwork_id&&!p.artwork_master_id);
 assert(p.publication==="NOT_APP_VISIBLE"||p.publication==="RESEARCH_ONLY_NOT_APP_VISIBLE");
}

assert.equal(deskReview.scope.bios_with_sourced_longer_draft,24);
assert.equal(deskReview.scope.bios_below_compact_target,0);
assert(deskReview.records.every(row=>row.current_combined_biography_words.en>0
 && row.current_combined_biography_words.fr>0),"No empty bilingual review text");
assert(deskReview.records.filter(x=>x.first_source_supported_narrative_expansion).every(x=>x.current_combined_biography_words.en>=110
 && x.first_source_supported_narrative_expansion==="BILINGUAL_DRAFT_REVISED_NOT_HUMAN_APPROVED"),
 "All 24 drafts require substantive English text while retaining the approval hold");

assert(!entries.some(x=>x.id==="saint.francois-de-montmorency-laval"),
  "Do not replace Blessed Jacques-Désiré Laval with François de Montmorency-Laval");
const output={schema:"ao.saints.30-holiness-first-person-census.v1",status:"RESEARCH_CENSUS_NOT_A_30_PERSON_PUBLIC_APP",
 counts:{distinct_person_profiles:30,existing_native_six_profiles:6,additional_held_doctors:8,
 additional_held_other_vocations:16,not_yet_individually_editorially_signed_off:24,
 held_profiles_with_editorial_issue_register:deskReview.records.length,
 source_spot_checked_desk_review:deskReview.scope.source_spot_checked,
 desk_review_is_not_publication_approval:true,
 bilingual_reader_narrative_revisions:deskReview.scope.bios_with_sourced_longer_draft,
 held_reader_narratives_below_110_words:deskReview.scope.bios_below_compact_target,
 reviewed_nonrepetitive_readers:readerBios.length,
 deeper_source_records_retained_for_claim_line_audit:deepDocs.length,
 drafts_with_an_existing_map_lens_surface:6,public_pages_released_from_this_pr:0,
 individually_approved_new_portraits:0,additional_map_pins_created:0,
 native_six_life_date_records:entries.filter(x=>x.life_data_status==="NATIVE_DATES_SOURCED_EDITORIAL_REVIEW").length,
 held_researched_life_date_records:entries.filter(x=>x.life_data_status==="HISTORICAL_DATES_RESEARCHED_NOT_APPROVED").length,
 missing_life_dates:entries.filter(x=>x.life_data_status==="MISSING_LIFE_DATES").length,
 sourced_fact_summaries:entries.reduce((s,x)=>s+x.facts,0),
 historically_attributed_extraordinary_accounts:entries.reduce((s,x)=>s+x.extraordinary_reports,0)},
 caution:"30 content drafts do not mean 30 verified calendar entries, 30 map pins, 30 certified saint canonizations or 30 image-complete app profiles.",
 entries};
const path=resolve(root,"artifacts/saints-calendar-census/saints-30-holiness-first-person-census.json");
mkdirSync(resolve(root,"artifacts/saints-calendar-census"),{recursive:true});
writeFileSync(path,JSON.stringify(output,null,2)+"\n");
assert.equal(output.counts.native_six_life_date_records,6);
assert.equal(output.counts.held_researched_life_date_records,24);
assert.equal(output.counts.missing_life_dates,0);
console.log("PASS consolidated no-duplicate 30-person holiness-first research census: "+JSON.stringify(output.counts));
