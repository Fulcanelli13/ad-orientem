import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {Script,createContext,runInContext} from "node:vm";

const html=readFileSync("tools/directory/review-cl27-tlm-classifications.html","utf8");
const taxonomy=JSON.parse(readFileSync("data/directory/tlm-user-classification-taxonomy.v1.json","utf8"));
assert.match(html, /<input id="load" type="file"/);
assert.match(html, /<input id="importDrafts" type="file"/);
assert.match(html, /function importExistingDrafts\(payload\)/);
assert.match(html, /function downloadDrafts\(\)/);
assert.match(html, /IMPORTED_PENDING_INDEPENDENT_CHECK/);
assert.match(html, /Import rejected; existing drafts preserved/);
assert.match(html, /source_baseline!=='CL27'/);
assert.match(html, /x\.public_approval!==false/);
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
// Exercise the actual offline import function without browser/network dependencies.
const fakeInputs=new Map();
const documentStub={getElementById(id){
 if(id==="embedded-data")return null;
 if(!fakeInputs.has(id))fakeInputs.set(id,{value:"",textContent:"",files:[],addEventListener(){}});
 return fakeInputs.get(id);
}};
const context=createContext({document:documentStub});
new Script(script[1],{filename:"review-cl27-tlm-classifications.inline.js"}).runInContext(context);
runInContext("data={taxonomy:{dimensions:[{key:'una_cum',subject:['MINISTRY','CELEBRATION'],values:['YES','NO','UNKNOWN']}]}};byId.set('RG-TEST',{});render=()=>{};",context);
const draft={physical_site_context:"RG-TEST",field:"una_cum",subject_type:"MINISTRY",subject_id:"unverified-ministry",
 value:"UNKNOWN",source_ids:[],source_type:"USER_SUBMISSION",source_url:null,recorded_at:null,
 evidence_excerpt:null,public_approval:false};
context.payload={schema:"AO_TLM_USER_CLASSIFICATION_DRAFTS_V1",source_baseline:"CL27",
 status:"RESEARCH_ONLY_UNREVIEWED",records:[draft]};
assert.equal(runInContext("importExistingDrafts(payload).added",context),1);
assert.equal(runInContext("importExistingDrafts(payload).added",context),0,"reimport must deduplicate");
assert.equal(runInContext("drafts.length",context),1);
context.payload.records=[{...draft,public_approval:true}];
assert.throws(()=>runInContext("importExistingDrafts(payload)",context),/public-approved claims/);
assert.equal(runInContext("drafts.length",context),1,"rejected import must retain previous work");

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
