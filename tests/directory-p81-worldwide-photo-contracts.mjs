import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const plan=JSON.parse(read("data/directory/research/p81-all-2579-direct-commons-plan.v1.json"));
assert.equal(plan.schema,"AO_P81_ONE_WAVE_ALL_2579_COMMONS_DIRECT_SOURCE_SEARCH_V1");
assert.equal(plan.total_anchors,2579);
assert.equal(plan.total_countries,76);
assert.equal(plan.shards,11);
assert.equal(plan.parallel_workers,3);
assert.equal(plan.publication,"RESEARCH_ONLY_NO_VISUAL_APPROVAL_NO_PUBLICATION");
const py=read("tools/directory/discover-commons-p81-worldwide.py");
for(const x of ["P81_SITE_RECORD=","original_sha1_bytes_verified","source_media_candidates","SEARCH_SUCCESS_EMPTY","SOURCE_ERROR_NOT_ZERO_RESULTS"]){assert.ok(py.includes(x));}
const wf=read(".github/workflows/p81-worldwide-2579-commons-search.yml");
assert.ok(wf.includes("shard: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"));
assert.ok(wf.includes("max-parallel: 3"));
assert.ok(wf.includes("P81-ONE-2579-DIRECTORY-COMMONS-SOURCE-CAMPAIGN"));
assert.ok(wf.includes("contents: read")&&!wf.includes("contents: write"));
console.log("PASS P81: one 2579-anchor research campaign, no small editorial waves or publication.");
