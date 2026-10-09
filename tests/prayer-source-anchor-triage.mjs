import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRAY_EDITION_WITNESSES_V1 } from "../src/pray/prayer-edition-witnesses.v1.js";
const review=JSON.parse(readFileSync("data/pray/prayer-source-anchor-triage.v1.json","utf8"));
const cert=JSON.parse(readFileSync("data/pray/prayer-source-certification-inventory.v3.json","utf8"));
const aud=JSON.parse(readFileSync("data/pray/prayer-source-presentation-audit.v1.json","utf8"));
const missed=cert.prayers.filter(x=>x.collation?.status==="NOT_REVIEWED");
assert.equal(review.schema,"AO_PRAY_30_SOURCE_ANCHOR_TRIAGE_V1");
assert.deepEqual(review.items.map(x=>x.id),missed.map(x=>x.id));
assert.equal(new Set(review.items.map(x=>x.id)).size,30);
assert.equal(review.results.total,30);
assert.equal(review.results.web_text_inspected,27);
assert.equal(review.results.facsimile_not_inspected,2);
assert.equal(review.results.web_fetch_failed,1);
assert.equal(review.results.fully_certified,0);
for(const x of review.items){
 const previous=aud.identities.find(y=>y.id===x.id);
 assert.ok(previous,"no existing Prayer owner "+x.id);
 assert.equal(x.reference,previous.actual_runtime_source_selection.url,"underlying canonical reference changed unexpectedly "+x.id);
 assert.equal(x.source_link_outcome,"TRIAGED_NOT_FULLY_CERTIFIED");
 assert.equal(x.publishable_verbatim_certification,false,"uncertified verbatim prayer "+x.id);
}
for(const id of ["mass_confiteor","adoration_lord_i_am_not_worthy"]){
 const e=review.items.find(x=>x.id===id);
 assert.equal(e.inspection_method,"PDF_NOT_INSPECTED");
}
assert.equal(review.items.find(x=>x.id==="foundations_prayer_of_adoration").inspection_method,"WEB_FETCH_FAILED");
const st=PRAY_EDITION_WITNESSES_V1.devotion_litany_st_joseph;
assert.equal(st.url,"https://www.usccb.org/prayers/litany-saint-joseph");
assert.equal(st.secondaryUrl,"https://press.vatican.va/content/salastampa/en/bollettino/pubblico/2021/05/01/210501c.html");
assert.match(st.note.en,/complete English expanded litany/);
assert.match(st.note.fr,/litanies anglaises intégrales/);
console.log("PASS 30 Prayer anchor triage, no false certification, exact Saint Joseph source/authority links");
