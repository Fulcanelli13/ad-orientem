// R34 is the canonical 24-item editorial selection; the R21/R22 research
// reviews are provenance owners, not a parallel Home publication bank.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const data=JSON.parse(readFileSync(
 "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json","utf8"));
assert.equal(data.schema,"AO_DYK_R34_HIGH_SIGNAL_24_REVIEW_SELECTION_V1");
assert.equal(data.status,"EDITORIAL_SELECTION_NOT_LIVE");
assert.equal(data.records.length,24);
assert.equal(data.priority_review_completion?.copied_records,17);
assert.equal(data.priority_review_completion?.existing_pilot_copy_records,7);
assert.equal(data.priority_review_completion?.publication_authorized,false);
assert.match(data.priority_review_completion?.duplication_gate||"",/NO_SEMANTIC_APPROVAL/);
assert.equal(data.counts.priority_24_bilingual_copy_collected,24);
assert.equal(data.counts.priority_24_independent_signoff,0);
assert.equal(data.counts.priority_24_release_authorized,0);
assert.equal(data.counts.priority_24_recorded_pdf_pages,24);
assert.equal(data.counts.priority_24_pdf_deep_link_browser_verified,0);
assert.equal(data.counts.priority_24_612_lexically_screened,24);
assert.equal(data.priority_lexical_screen_summary?.normalized_exact_en_collisions,0);
assert.equal(data.priority_lexical_screen_summary?.normalized_exact_fr_collisions,0);
assert.equal(data.priority_lexical_screen_summary?.source_id_collisions,0);
assert.equal(data.priority_lexical_screen_summary?.private_preview_count,612);
assert.equal(data.priority_lexical_screen_summary?.independent_semantic_approvals,0);
assert.equal(data.priority_lexical_screen_summary?.source_private_text_disclosed,false);
const lanes=new Map([["all-souls-november-2",7],["advent-christmas",6],
 ["roman-canon",3],["regional-customs",5],["seasonal-extra",3]]);
const actual=new Map();
const ids=new Set(),sources=new Set(),english=new Set(),french=new Set();
let pilot=0,recovered=0,pdfLocated=0,ritusLocated=0,approved=0,destVerified=0;
for(const item of data.records){
 assert.match(item.id,/^DYK-[A-Z0-9-]+$/);
 assert.ok(!ids.has(item.id),"Duplicate ID "+item.id);
 ids.add(item.id);
 assert.ok(!sources.has(item.source_id),"Duplicate source identity "+item.source_id);
 sources.add(item.source_id);
 actual.set(item.lane,(actual.get(item.lane)||0)+1);
 const copy=item.pilot_home_copy||item.editorial_review_copy;
 const source=item.pilot_source_folio||item.editorial_source_reference;
 assert.ok(copy?.en?.trim().length>35&&copy?.fr?.trim().length>35,
   "Missing recovered bilingual copy "+item.id);
 assert.ok(!english.has(copy.en)&&!french.has(copy.fr),"Duplicate final copy "+item.id);
 english.add(copy.en);french.add(copy.fr);
 assert.equal(copy.final_english_signoff,false);
 assert.equal(copy.final_french_signoff,false);
 assert.equal(item.editorial_approval,false);
 assert.equal(item.release_authorized,false);
 const lexical=item.priority_lexical_screen;
 assert.equal(lexical?.preview_bank_size,612);
 assert.equal(lexical?.exact_english_collision_count,0);
 assert.equal(lexical?.exact_french_collision_count,0);
 assert.equal(lexical?.exact_source_id_collision_count,0);
 assert.equal(lexical?.manual_semantic_novelty_approved,false);
 assert.equal(lexical?.publication_authorized,false);
 assert.ok(lexical.highest_english_token_jaccard>=0&&lexical.highest_english_token_jaccard<=1);
 assert.ok(lexical.highest_french_token_jaccard>=0&&lexical.highest_french_token_jaccard<=1);
 assert.equal(item.gate,"SOURCE_BOUND_EDITORIAL_REVIEW_ONLY");
 assert.equal(source?.source_record_id,item.source_id);
 assert.match(source?.url||source?.source_url||"",/^https:\/\//);
 const pages=source.pdf_pages_1based||[];
 if(item.source_family==="ROMAN_MASS_1962"&&!item.pilot_source_folio){
   assert.match(source.source_location_check||"",/NOT_PDF_FRAGMENT_BROWSER_CHECKED/);
   assert.match(source.source_text_anchor||"",/^(Bene|HOC|omnis)/);
 }
 if(pages.length){assert.ok(pages.every(n=>Number.isInteger(n)&&n>0));pdfLocated++;}
 else {assert.match(source.ritus_locator||"",/^[IVX]+\.\d+$/);ritusLocated++;}
 if(item.pilot_home_copy){
   pilot++;
   assert.equal(item.lane,"all-souls-november-2");
   assert.equal(item.pilot_destination_audit?.publishable_deep_link,false);
 }else{
   recovered++;
   assert.equal(copy.original_record_id,item.id);
   assert.equal(copy.original_record_source_id,item.source_id);
   assert.match(copy.original_review_file,/^dyk-r2[12]-/);
   assert.equal(source.browser_deep_link_checked,false);
   assert.equal(item.editorial_destination_audit?.verified_in_app,false);
   assert.equal(item.editorial_destination_audit?.publishable,false);
 }
 approved+=item.editorial_approval===true?1:0;
 destVerified+=(item.pilot_destination_audit?.publishable_deep_link===true||
   item.editorial_destination_audit?.publishable===true)?1:0;
}
assert.equal(pilot,7);assert.equal(recovered,17);
assert.equal(pdfLocated,24,"All priority facts have recorded page locators");
assert.equal(ritusLocated,0,"No priority fact should lack a recorded PDF page");
assert.equal(approved,0);
assert.equal(destVerified,0);
assert.deepEqual([...actual.entries()].sort(),[...lanes.entries()].sort());
const report={priority:24,bilingualRecovered:17,pilotBilingualPreserved:7,
 sourcePagesLocated:pdfLocated,ritusOnly:ritusLocated,
 independentSignedOff:0,verifiedPublishedDestinations:0,publications:0};
console.log("PASS R34 single 24-fact bilingual editorial master: "+JSON.stringify(report));
