import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const m=read("data/geography/research/sacred-atlas-selected34-11-source-page-attribution-pd-identity-review-20261104.v1.json");
const old=read("data/geography/research/sacred-atlas-selected24-hold-closure-20261104.v1.json");
const decisions=read("data/geography/research/photo-finder-20261030/decisions.json").decisions;
const covers=read("data/geography/approved-place-media.v1.json");
assert.equal(m.schema,"AO_SACRED_ATLAS_SELECTED_34_RIGHTS_IDENTITY_SOURCE_PAGE_AUDIT_V1");
assert.equal(m.scope,"RESEARCH_ONLY_SOURCE_PAGE_VISUAL_NO_PUBLICATION");
assert.equal(m.rows.length,11);
assert.equal(m.counts.reviewed,11);
assert.equal(m.counts.author_evidence_from_source_page,5);
assert.equal(m.counts.unresolved_author,2);
assert.equal(m.counts.public_domain_basis_found,2);
assert.equal(m.counts.duplicate_site_holds,2);
assert.equal(m.counts.original_bytes_verified_by_this_review,0);
assert.equal(m.counts.published_covers_changed,0);
assert.equal(new Set(m.rows.map(x=>x.place_id)).size,11);
const frozen=new Map(old.rows.map(x=>[x.place_id,x]));
const released=new Set(covers.items.map(x=>x.place_id));
for(const x of m.rows){
 const old=frozen.get(x.place_id);
 assert.ok(old,"Unknown previously selected hold");
 assert.equal(x.source_title,old.source_title);
 assert.equal(x.original_sha1,old.sha1);
 assert.equal(decisions[x.place_id].files[0],old.source_title);
 assert.ok(x.source_page_review.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.equal(x.publication_authorized,false);
 assert.equal(x.exact_current_source_sha1_and_original_bytes_verified_in_this_review,false);
 assert.ok(!released.has(x.place_id));
 const label=x.source_claim_type;
 if(label==="AUTHOR_NOT_VERIFIABLY_IDENTIFIED")assert.equal(x.source_named_credit,null);
 if(label.startsWith("AUTHOR_IDENTIFIED"))assert.ok(x.source_named_credit);
 if(label.startsWith("DUPLICATE"))assert.ok(x.next_gate.startsWith("RECONCILE_"));
 if(label.startsWith("PUBLIC_DOMAIN"))assert.ok(x.next_gate.startsWith("VERIFY_"));
}
assert.equal(m.rows.find(x=>x.place_id==="place:FR:basilique-visitation-annecy").source_named_credit,
 "William Crochot (Wikimedia Medium69)");
assert.ok(m.rows.find(x=>x.place_id==="place:IT:basilica-santa-maria-degli-angeli-assisi").source_named_credit.includes("Erbsloeh"));
assert.equal(m.rows.find(x=>x.place_id==="place:GT:esquipulas-black-christ-basilica").source_claim_type,
 "PUBLIC_DOMAIN_AUTHOR_DEDICATION_SOURCE_PAGE");
assert.equal(m.rows.find(x=>x.place_id==="place:SB:holy-cross-cathedral-honiara").source_claim_type,
 "PUBLIC_DOMAIN_US_FEDERAL_GOVERNMENT_SOURCE_PAGE");
console.log("SACRED ATLAS EXISTING SOURCE RIGHTS REVIEW PASS: 5 named credits, 2 unresolved, 2 PD bases, 2 duplicate Place holds; no image approved.");
