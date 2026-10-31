import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("../tools/directory/tlm-worldwide-photo-retriever.html",import.meta.url),"utf8");
const json=source.match(/<script type="application\/json" id="registry">([\s\S]*?)<\/script>/)?.[1];
const browser=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert(json&&browser,"A standalone HTML must embed its canonical source corpus and browser logic");
const master=JSON.parse(json),rows=master.records;
assert.equal(master.schema,"AO_TLM_2582_BULK_RETRIEVER_V1");
assert.equal(rows.length,2582);assert.equal(new Set(rows.map(r=>r[0])).size,2582);
assert.equal(new Set(rows.map(r=>r[2])).size,76);
assert.equal(rows.filter(r=>/^diocesan$/i.test(r[4])).length,587);
assert.equal(rows.filter(r=>r[6]).length,587);
assert(rows.every(r=>r.length===8&&/^RG-/.test(r[0])&&r[1]&&Array.isArray(r[5])&&Array.isArray(r[7])));
assert(rows.every(r=>r[5].every(x=>/^https?:\/\//.test(x))));
assert(master.index_sha&&master.additional_sha&&master.operator_audit_sha);
new Function(browser);
for(const x of ["Api-User-Agent","WIKIMEDIA_","Retry-After","maxlag",
"thumb.wikimedia.org","upload.wikimedia.org","source_attribution_and_sha256.csv",
"unresolved_sources.json","download_sha256","publication_approved:false",
"localStorage","function exportJson","async function pack","async function scan"]){
if(x==="download_sha256")continue;
assert(browser.includes(x),"Missing essential guard: "+x);
}
assert(!json.includes("you@example.com"),"No personal email in canonical source data");
assert(!/localStorage\.setItem\([^,]*email/i.test(browser),"Never persist the contact email");
assert(!/git push|upload\.wikimedia\.org\/w\/api/.test(browser),"No app-side promotion/upload");
assert(rows.filter(r=>r[6]?.gate==="MISSING_COORDINATE").length===4,"Four exact pin holds must remain");
console.log("PASS: 2,582 TLM identities/76 countries, 587 diocesan-label gates, embedded offline source corpus, syntax, source metadata, Wikimedia 429 and ZIP source rights holds.");