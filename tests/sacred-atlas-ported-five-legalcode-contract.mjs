import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const file="data/geography/research/sacred-atlas-ported5-original-licence-legal-code-review-20261104.v1.json";
const m=read(file);
const h=read("data/geography/research/sacred-atlas-selected24-hold-closure-20261104.v1.json");
const audit=read("data/geography/research/sacred-atlas-selected24-current-source-findings-20261104.v1.json");
const photos=read("data/geography/approved-place-media.v1.json");
const selections=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
const holds=new Map(h.rows.filter(x=>x.classification==="PORTED_CC_LEGAL_CODE").map(x=>[x.place_id,x]));
const aud=new Map(audit.rows.map(x=>[x.place_id,x]));
const approved=new Set(photos.items.map(x=>x.place_id));
assert.equal(m.schema,"AO_SACRED_ATLAS_PORTED_FIVE_CC_LICENCE_REFERENCES_V1");
assert.equal(m.status,"RESEARCH_ONLY_NO_PUBLICATION");
assert.equal(m.rows.length,5);
assert.equal(holds.size,5);
assert.equal(m.counts.new_published_covers,0);
assert.equal(m.counts.originals_byte_verified_by_this_work,0);
assert.equal(new Set(m.rows.map(x=>x.place_id)).size,5);
const exact=new Map([
["place:NL:heiloo-olv-ter-nood","https://creativecommons.org/licenses/by-sa/3.0/nl/legalcode"],
["place:HU:mariapocs-greek-catholic-basilica","https://creativecommons.org/licenses/by-sa/2.5/hu/legalcode.hu"],
["place:AT:wallfahrtsbasilika-maria-schnee-luggau","https://creativecommons.org/licenses/by-sa/3.0/at/legalcode"],
["place:DE:wieskirche","https://creativecommons.org/licenses/by-sa/2.0/de/legalcode"],
["place:CZ:bazilika-svaty-hostyn","https://creativecommons.org/licenses/by/3.0/pl/legalcode"]]);
for(const r of m.rows){
 const old=holds.get(r.place_id);assert.ok(old,"Must be in selected regional hold set");
 assert.equal(r.original_first_choice,old.source_title);
 assert.equal(r.original_commons_source,old.source_page);
 assert.equal(r.expected_original_sha1,old.sha1);
 assert.deepEqual(r.expected_original_dimensions,old.dimensions);
 assert.equal(r.photographer,old.claimed_author);
 assert.equal(r.photo_license_claim,old.claimed_license);
 assert.equal(r.original_commons_deed_link,old.original_license_url);
 assert.equal(r.independently_located_country_specific_cc_legal_code,exact.get(r.place_id));
 assert.equal(selections[r.place_id].files[0],old.source_title);
 assert.equal(aud.get(r.place_id).verification_status,"PORTED_CC_REQUIRES_EXACT_LEGAL_CODE_AND_APP_WHITELIST");
 assert.equal(r.publication_authorized,false);
 assert.equal(r.allow_global_license_whitelist_update,false);
 assert.ok(r.needs_live_commons_match&&r.needs_original_byte_check&&r.needs_exact_building_identity&&r.needs_underlying_architecture_check);
 assert.ok(!approved.has(r.place_id));
}
console.log("SACRED ATLAS PORTED FIVE PASS: 5 exact selected source licences identified, 0 originals/approvals inferred, no global whitelist.");
