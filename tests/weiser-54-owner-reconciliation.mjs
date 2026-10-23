import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const earlier=read("../data/customs/research/weiser-custom-editorial-briefs-batch01.v1.json");
const wave=read("../data/customs/research/weiser-p1-final-integration-ledger.v1.json");
const decisions=read("../data/customs/research/weiser-54-editorial-owner-reconciliation.v1.json");
const baseline=read("../data/customs/customs-atlas-seed.v1.json");
const negative=read("../data/customs/negative-knowledge.v1.json");
const selectedIds=new Set(earlier.ready_for_editorial_review.map(c=>c.draft_id));
const laterIds=new Set(wave.drafts.map(c=>c.id));
const all=new Set([...selectedIds,...laterIds]);
assert.equal(selectedIds.size,12);
assert.equal(laterIds.size,42);
assert.equal(all.size,54);
assert.equal(decisions.source_to_target.length,54);
assert.equal(decisions.audit.editorial_drafts,54);
assert.equal(decisions.audit.app_publications_from_research,0);
assert.equal(baseline.customs.length,17);
assert.equal(negative.entries.length,7);
const seen=new Set();
for(const row of decisions.source_to_target){
 assert.ok(all.has(row.id),"unrecognized draft "+row.id);
 assert.ok(!seen.has(row.id),"draft assigned twice "+row.id);
 seen.add(row.id);
 assert.equal(row.automatic_publication,false);
 assert.ok(row.canonical_target.length>=7);
 assert.ok(row.reason.length>40,"material integration reason required");
 assert.ok(["ENRICH_EXISTING","NEW_CANONICAL_CANDIDATE","VARIANT_OF_NEW_CANDIDATE","OWNER_CONTENT_ONLY","REGIONAL_REFERENCE_ONLY","SOURCE_OR_RITUAL_HOLD"].includes(row.decision));
 if(row.decision==="NEW_CANONICAL_CANDIDATE")assert.ok(row.canonical_target.startsWith("CANDIDATE-"));
 if(row.decision==="VARIANT_OF_NEW_CANDIDATE")assert.ok(row.canonical_target.startsWith("CANDIDATE-"));
}
assert.equal(seen.size,54);
const groups=Object.groupBy(decisions.source_to_target,r=>r.decision);
for(const [status,expected] of Object.entries({
 ENRICH_EXISTING:14,NEW_CANONICAL_CANDIDATE:15,VARIANT_OF_NEW_CANDIDATE:2,
 OWNER_CONTENT_ONLY:9,REGIONAL_REFERENCE_ONLY:12,SOURCE_OR_RITUAL_HOLD:2
}))assert.equal((groups[status]||[]).length,expected);
const newRows=groups.NEW_CANONICAL_CANDIDATE;
assert.equal(new Set(newRows.map(x=>x.canonical_target)).size,15);
for(const row of groups.VARIANT_OF_NEW_CANDIDATE)
 assert.ok(newRows.some(n=>n.canonical_target===row.canonical_target),"variant has no canonical parent");
assert.equal(newRows.filter(x=>x.release_priority==="P0").length,6);
assert.equal(newRows.filter(x=>x.release_priority==="P1").length,5);
assert.equal(newRows.filter(x=>x.release_priority==="P2").length,4);
const releaseIds=[
"NDAY-001","PATR-001","MARI-001","SJOS-001","SANT-001","SCHR-001","SNIC-001",
"BLSS-002","BLSS-003","BLSS-004"];
assert.equal(new Set(releaseIds).size,10);
assert.equal(decisions.audit.combined_customs_before_extra_weiser,27);
assert.equal(decisions.audit.combined_attestations_before_extra_weiser,86);
assert.equal(decisions.audit.combined_sources_before_extra_weiser,96);
assert.equal(decisions.audit.combined_sot07_extensions_before_extra_weiser,11);
assert.ok(!decisions.source_to_target.some(x=>releaseIds.includes(x.canonical_target)&&x.decision==="NEW_CANONICAL_CANDIDATE"));
console.log("PASS Weiser 54 draft reconciliation: 15 unique new candidates (6 P0 / 5 P1 / 4 P2), 14 existing enrichments, 9 owner-only, 12 regional-only, 2 variants, 2 ritual holds, staged 10 IDs nonduplicated, 0 app publications.");
