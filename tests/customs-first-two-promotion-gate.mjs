import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {calendarCustomArticle,CALENDAR_CUSTOM_ARTICLE_IDS} from "../src/calendar/customs-read-model.js";
import {CUSTOMS_EDITORIAL_PREVIEW_ARTICLES,CUSTOMS_EDITORIAL_PREVIEW_DATE_HOOKS} from "../src/calendar/customs-editorial-preview.js";
const packet=JSON.parse(readFileSync(new URL("../data/customs/review/calendar-first-two-promotion-packet.20261024.v1.json",import.meta.url),"utf8"));
const seed=JSON.parse(readFileSync(new URL("../data/customs/customs-atlas-seed.v1.json",import.meta.url),"utf8"));
const ids=new Set(seed.customs.map(x=>x.custom_id)),published=new Set(seed.customs.filter(x=>x.publication_state==="PUBLISHED").map(x=>x.custom_id));
assert.equal(packet.schema,"AO_CUSTOMS_FIRST_TWO_PUBLICATION_TECHNICAL_PACKET_20261024_V1");
assert.equal(seed.customs.length,38);
assert.equal(published.size,35);
assert.equal(CALENDAR_CUSTOM_ARTICLE_IDS.length,35);
assert.equal(packet.records.length,2);
assert.equal(packet.hold.length,3);
assert.equal(packet.summary.actually_published,0);
assert.equal(packet.summary.ids_proposed_not_allocated,2);
assert.deepEqual(packet.records.map(x=>x.proposed_canonical_id),["EPIP-003","DOM-014"]);
assert.equal(CUSTOMS_EDITORIAL_PREVIEW_ARTICLES.length,5);
assert.equal(CUSTOMS_EDITORIAL_PREVIEW_DATE_HOOKS.length,6);
for(const x of packet.records){
 assert.ok(!ids.has(x.proposed_canonical_id),"Attempted to override frozen canonical ID");
 assert.equal(x.publication_state,"STAGED_NOT_PUBLISHED");
 assert.equal(x.canonical_master_allocated,false);
 for(const gate of ["publisher_approval","editorial_english_signoff","editorial_french_signoff"])
  assert.equal(x[gate],false,"No synthetic human approval for "+x.proposed_canonical_id);
 assert.equal(calendarCustomArticle(x.proposed_canonical_id),null);
 assert.equal(calendarCustomArticle(x.provisional_research_article_id),null);
 const draft=calendarCustomArticle(x.provisional_research_article_id,{editorialPreview:true});
 assert.ok(draft?.editorialPreview,"Missing source-bounded preview "+x.provisional_research_article_id);
 assert.equal(draft.releaseUnit,x.release_unit);
 for(const key of ["title","description","history","meaning","practice","caution","occasion","scope"]){
  assert.ok(x.article_bilingual_candidate[key].en.length>=8&&x.article_bilingual_candidate[key].fr.length>=8,key);
  assert.deepEqual(draft[key],x.article_bilingual_candidate[key],"Bilingual content must derive from existing reviewed research draft");
 }
 assert.ok(x.source_group_ids.length>=1);
 assert.ok(x.reviewed_public_url_claims.length>=2);
 assert.ok(x.reviewed_public_url_claims.every(s=>/^https:\/\//.test(s.url)&&s.claim.length>=35));
 assert.ok(x.editorial_cautions.length>=3);
 assert.equal(x.source_check_state,"EXTERNALLY_CORROBORATED_CLAIM_BOUNDS_2026_10_24");
}
const chalk=packet.records[0],crib=packet.records[1];
assert.ok(chalk.editorial_cautions.includes("CATHOLIC_HOME_DEVOTION_NOT_PRIESTLY_RITE"));
assert.ok(chalk.reviewed_public_url_claims.some(s=>s.id==="DPP-2001-EPIPHANY"));
assert.ok(crib.editorial_cautions.includes("NOT_THE_END_OF_1962_CHRISTMAS_SEASON"));
assert.ok(crib.editorial_cautions.includes("DISTINCT_FROM_BLESSED_CANDLE_OWNER_DOM-011"));
assert.equal(packet.hold.some(x=>x.release_unit==="CU-REVIEW-003"),true);
assert.equal(packet.hold.some(x=>x.release_unit==="CU-REVIEW-005"),true);
console.log("PASS two source-adjudicated first release candidates, 3 local-context holds, 35 published unchanged, no synthetic approvals or canonical ID collisions.");