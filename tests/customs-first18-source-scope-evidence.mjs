import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../data/customs/master/"+p,import.meta.url),"utf8"));
const evidence=load("customs-first18-source-scope-evidence-review-20261026.v1.json");
const thirty=load("customs-editorial-thirty-review-units-20261026.v1.json");
const decisions=load("customs-thirty-action-identity-reconciliation-20261026.v1.json");
const original=load("working-master.v1.json");
const eighteen=load("customs-18-unpublished-bilingual-editorial-review-20261026.v1.json");
assert.equal(evidence.schema,"AO_CUSTOMS_FIRST18_SOURCE_SCOPE_EVIDENCE_REVIEW_20261026_V1");
assert.equal(evidence.records.length,18);
assert.equal(evidence.counts.scope_support_found,18);
assert.equal(evidence.counts.complete_primary_claim_and_copy_signed_off,0);
assert.equal(evidence.counts.calendar_publication_approved,0);
assert.equal(evidence.policy.no_canonically_certified_source_independence,true);
const candidates=decisions.records.filter(r=>r.identity_route_proposed==="PROPOSE_DISTINCT_BOUNDARIED_CUSTOM");
assert.equal(candidates.length,18);
assert.deepEqual(evidence.records.map(r=>r.review_key),candidates.map(r=>r.review_key));
const packet=new Map(thirty.rows.map(x=>[x.review_key,x]));
const urls=new Set();
let originalLinks=0,alternates=0,sourceRisks=0;
for(const r of evidence.records){
 const originalRow=packet.get(r.review_key);
 assert.ok(originalRow,"Evidence identity must exist in previously reviewed thirty");
 assert.equal(r.title_en,originalRow.titles.en);
 assert.deepEqual(r.original_linked_urls_preserved,originalRow.source_urls);
 assert.match(r.source_support.verified_url,/^https:\/\//);
 assert.equal(r.source_support.url_already_in_master,originalRow.source_urls.includes(r.source_support.verified_url));
 assert.ok(r.source_support.supports_claim_en.length>90);
 assert.ok(r.source_specific_risk.explanation_en.length>90);
 assert.ok(r.source_specific_risk.flag.length>=8);
 assert.equal(r.new_custom_id,null);
 assert.equal(r.publication_state,"RESEARCH_ONLY");
 assert.equal(r.identity_not_duplicate_final_approval,false);
 for(const k of ["source_claims_final_human_approval","english_french_final_approval","liturgical_1962_authority_approved","calendar_date_publication_approved"])
   assert.equal(r[k],false,"No fabricated approval "+r.review_key);
 assert.ok(r.unverified_claims.length>=3);
 if(r.source_support.url_already_in_master)originalLinks++;else alternates++;
 urls.add(r.source_support.verified_url);sourceRisks++;
}
assert.equal(originalLinks,17);
assert.equal(alternates,1);
assert.equal(urls.size,18);
assert.equal(sourceRisks,18);
const key="CANDIDATE-STPATRICK-RIBBON";
const master=original.records.find(x=>x.id===key);
const old=eighteen.profiles.find(x=>x.working_master_id===key);
const review=thirty.rows.find(x=>x.review_key==="MASTER:"+key);
const source=evidence.records.find(x=>x.review_key===review.review_key);
assert.ok(master&&old&&review&&source);
for(const name of ["description_en","history_en"]){
 assert.ok(master[name].includes("1680s"),name);
 assert.ok(!master[name].includes("1681"));
}
for(const name of ["description_fr","history_fr"]){
 assert.ok(master[name].includes("années 1680"),name);
 assert.ok(!master[name].includes("1681"));
}
assert.deepEqual(old.bilingual.description,{en:master.description_en,fr:master.description_fr});
assert.deepEqual(review.copy.history,{en:master.history_en,fr:master.history_fr});
assert.equal(source.source_specific_risk.flag,"HISTORICAL_DATE_COPY_CORRECTED_PENDING_FINAL_EDITORIAL");
assert.equal(evidence.records.find(x=>x.review_key==="MASTER:CANDIDATE-IRISH-CHRISTMAS-CANDLE")?.source_support.url_already_in_master,false);
for(const k of ["MASTER:CANDIDATE-STJOHN-BONFIRE","MASTER:CUST-ASSUMPTION-TIVOLI-INCHINATA","MASTER:CUST-ASSUMPTION-SASSARI-CANDELIERI"])
 assert.equal(evidence.records.find(x=>x.review_key===k).source_specific_risk.flag.match(/SCOPE_ONLY|LOCALLY_DATED_ACTION/)!==null,true);
console.log("PASS first18 claim-scope audit: 18 verified narrow cited witnesses (17 existing URLs plus one alternative), all date/rite/source caveats retained; corrected St Patrick date synced EN/FR; no identity or publication approval");
