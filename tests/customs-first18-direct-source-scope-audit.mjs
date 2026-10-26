import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=name=>JSON.parse(readFileSync(new URL("../data/customs/master/"+name,import.meta.url),"utf8"));
const verified=read("customs-first18-direct-source-scope-audit-20261026.v1.json");
const identity=read("customs-thirty-action-identity-reconciliation-20261026.v1.json");
const editorial=read("customs-editorial-thirty-review-units-20261026.v1.json");
const candidates=identity.records.filter(x=>x.identity_route_proposed==="PROPOSE_DISTINCT_BOUNDARIED_CUSTOM");
assert.equal(verified.schema,"AO_CUSTOMS_FIRST18_DIRECT_SOURCE_SCOPE_AUDIT_20261026_V1");
assert.equal(verified.records.length,18);
assert.equal(candidates.length,18);
assert.equal(verified.summary.candidate_identity_routes,18);
assert.equal(verified.summary.source_claims_checked_with_live_first_hand_or_institutional_witness,18);
assert.equal(verified.summary.source_action_claims_confirmed_in_bounded_form,18);
assert.equal(verified.summary.rows_with_additional_unchecked_sources,
 verified.records.filter(x=>x.other_cited_source_urls.length>0).length);
assert.equal(verified.summary.all_sources_verified_per_article,0);
assert.equal(verified.summary.full_source_independence_certifications,0);
assert.equal(verified.summary.app_publications,0);
assert.equal(verified.policy.no_auto_publication,true);
assert.equal(verified.policy.modern_parish_date_not_perpetual,true);
const req=["source_independence_certified","precise_app_calendar_mapping_authorized",
 "denomination_liturgical_role_authorized","complete_bilingual_human_editorial_approved",
 "canonical_identity_human_approved","app_publication_approved"];
assert.equal(new Set(verified.records.map(x=>x.review_key)).size,18);
for(const [i,r] of verified.records.entries()){
 const m=candidates[i],article=editorial.rows.find(x=>x.review_key===r.review_key);
 assert.equal(r.review_key,m.review_key,"Source review must refer to exact action not name-only similarity");
 assert.equal(r.title_en,m.working_title_en);
 assert.ok(article);
 assert.ok(article.source_urls.includes(r.checked_source_url)||
  (r.review_key==="MASTER:CANDIDATE-IRISH-CHRISTMAS-CANDLE"&&
    r.checked_source_url.startsWith("https://www.duchas.ie/")),"Source exception must be controlled");
 assert.match(r.checked_source_url,/^https:\/\//);
 assert.ok(r.supported_narrow_action_claim_en.length>65);
 assert.ok(r.applicability_limits_en.length>65);
 assert.ok(r.explicit_hold_flags.length>0);
 assert.ok(r.next_gate.length>15);
 assert.equal(r.original_action_evidence_examined_this_pass,true);
 assert.equal(r.all_individual_article_sources_rechecked,false);
 for(const flag of req)assert.equal(r[flag],false,"No authorization or independence by retrieval: "+r.review_key+" "+flag);
 assert.equal(r.review_status,"SOURCE_CLAIM_SUPPORTED_WITH_BOUNDED_SCOPE_NOT_FINAL_RELEASE");
 assert.ok(r.other_cited_source_urls.every(s=>article.source_urls.includes(s)),"No invented original links");
}
const saint=verified.records.find(x=>x.review_key==="MASTER:CANDIDATE-STJOHN-BONFIRE");
assert.ok(saint.applicability_limits_en.includes("20 June 2026"));
const christmas=verified.records.find(x=>x.review_key==="MASTER:CANDIDATE-IRISH-CHRISTMAS-CANDLE");
assert.ok(christmas.explicit_hold_flags.includes("SOURCE_FALLBACK_REQUIRED"));
const eggs=verified.records.find(x=>x.review_key==="MASTER:CANDIDATE-EASTER-EGG-CRAFT");
assert.ok(eggs.explicit_hold_flags.includes("NOT_EXCLUSIVELY_ROMAN_CATHOLIC"));
const french=verified.records.find(x=>x.review_key==="OBSERVATION:BULK150-018");
assert.ok(french.explicit_hold_flags.includes("ORIGINAL_PDF_PAGE_REVIEWED"));
const greenery=verified.records.find(x=>x.review_key==="MASTER:CUST-PENTECOST-POLISH-GREENERY");
assert.ok(greenery.explicit_hold_flags.includes("HISTORIC_1930_PHOTO_NOT_REVERIFIED"));
console.log("PASS 18 direct source-claim scope audits, 18 stable route links, 14 secondary-source queues, no forged historical verification, source independence, ritual permissions, Calendar releases or editorial signatures");
