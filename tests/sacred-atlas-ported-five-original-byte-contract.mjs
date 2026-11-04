import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const manifest=read("data/geography/research/sacred-atlas-ported5-original-licence-legal-code-review-20261104.v1.json");
const decisions=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
const approved=read("data/geography/approved-place-media.v1.json");
const script=readFileSync("tools/atlas/verify-sacred-atlas-ported-five-originals.py","utf8");
assert.equal(manifest.schema,"AO_SACRED_ATLAS_PORTED_FIVE_CC_LICENCE_REFERENCES_V1");
assert.equal(manifest.status,"RESEARCH_ONLY_NO_PUBLICATION");
assert.equal(manifest.rows.length,5);
assert.equal(new Set(manifest.rows.map(x=>x.place_id)).size,5);
assert.equal(manifest.counts.new_published_covers,0);
assert.equal(manifest.counts.originals_byte_verified_by_this_work,0);
for(const x of manifest.rows){
 assert.equal(x.original_first_choice,decisions[x.place_id].files[0]);
 assert.equal(x.publication_authorized,false);
 assert.equal(x.needs_live_commons_match,true);
 assert.equal(x.needs_original_byte_check,true);
 assert.equal(x.allow_global_license_whitelist_update,false);
 assert.ok(x.original_commons_deed_link.startsWith("https://creativecommons.org/licenses/"));
 assert.ok(x.independently_located_country_specific_cc_legal_code.startsWith("https://creativecommons.org/licenses/"));
 assert.ok(!approved.items.some(i=>i.place_id===x.place_id));
}
for(const needle of [
 "MAX_FILE=20_000_000","MAX_BATCH=75_000_000","MAX_PIXELS=32_000_000",
 "if client.rate_limits>=2","raise RuntimeError(\"PAUSED_AFTER_TWO_COMMONS_429\")",
 "if sha!=row[\"expected_original_sha1\"]","hashlib.sha1(original).hexdigest()!=sha",
 "row[\"photographer\"].casefold() not in credit.casefold()",
 "if license_canon not in accepted","row[\"expected_original_dimensions\"]",
 "assert not row[\"publication_authorized\"]"
])assert.ok(script.includes(needle),"Missing source-first gate: "+needle);
assert.ok(!script.includes("COVERS.write_text(")&&!script.includes("GALLERY.write_text("));
assert.ok(!script.includes("assets/approved/place-media/"));
console.log("SACRED ATLAS REGIONAL CC FIVE SOURCE GATE: five exact editorial selections, bounded 20MB/32MP original checks, no public media mutation.");
