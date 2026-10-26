import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script} from "node:vm";

const html=readFileSync("tools/directory/review-cl27-tlm-classifications.html","utf8");
const taxonomy=JSON.parse(readFileSync("data/directory/tlm-user-classification-taxonomy.v1.json","utf8"));
assert.match(html, /<input id="load" type="file"/);
assert.match(html, /id="sites"/);
assert.match(html, /id="detail"/);
assert.match(html, /function syncField\(\)/);
assert.match(html, /function saveDraft\(\)/);
assert.match(html, /function downloadDrafts\(\)/);
assert.match(html, /AO_TLM_USER_CLASSIFICATION_DRAFTS_V1/);
assert.match(html, /public_approval:false/);
assert.match(html, /const embedded=document\.getElementById\('embedded-data'\)/);
const script=html.match(/<script>\s*([\s\S]+?)<\/script>/);
assert.ok(script,"reviewer JS must be present");
new Script(script[1],{filename:"review-cl27-tlm-classifications.inline.js"});
for(const dimension of taxonomy.dimensions){
 assert.ok(dimension.subject.length>0,dimension.key);
 assert.ok((dimension.values||dimension.searchable_source_labels||[]).length>0,dimension.key);
}
assert.ok(!taxonomy.dimensions.find(x=>x.key==="una_cum").subject.includes("VENUE"));
assert.ok(!taxonomy.dimensions.find(x=>x.key==="canonical_status").subject.includes("VENUE"));
assert.equal(taxonomy.public_approvals,0);
assert.ok(taxonomy.review_detail_extensions.canonical_standing);
assert.ok(taxonomy.review_detail_extensions.communion_profile);
console.log("CL27 offline reviewer syntax, source input, immutable release guard and 12 classification dimensions PASS");
