import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 DYK_526_PREVIEW_SCHEMA,DYK_526_RELEASE_SCHEMA,DYK_526_DEFAULT_ENABLED,
 dyk526ApprovedCandidates,dyk526Pick,dyk526Model
} from "../src/home/dyk-526-release-adapter.js";
import {dykHomeRotationSlot} from "../src/home/dyk-published-feed.js";

const path="data/research/did-you-know/release-candidates/ao-dyk-display-preview-526-RESEARCH_ONLY.v1.json";
const preview=JSON.parse(readFileSync(path,"utf8"));
const clone=value=>JSON.parse(JSON.stringify(value));
assert.equal(DYK_526_DEFAULT_ENABLED,false);
assert.equal(preview.schema,DYK_526_PREVIEW_SCHEMA);
assert.equal(preview.release_stage,"RESEARCH_ONLY");
assert.equal(preview.published,false);
assert.equal(preview.records.length,526);
assert.equal(preview.counts.priority,332);
assert.equal(preview.counts.reserve,194);
assert.equal(preview.counts.owner_approved,0);
assert.equal(preview.counts.publishable,0);

const ids=new Set();
for(const row of preview.records){
 assert.ok(!ids.has(row.id),"Duplicate staged ID "+row.id);ids.add(row.id);
 assert.ok(row.proposed_title?.en&&row.proposed_title?.fr);
 assert.ok(row.proposed_copy?.en&&row.proposed_copy?.fr);
 assert.ok(row.research_provenance?.source_ids_raw);
 assert.ok(row.research_provenance?.source_urls_raw);
 assert.equal(row.research_provenance.master_fact_id,row.id);
 assert.equal(row.eligibility,"RESEARCH_ONLY");
 for(const value of Object.values(row.release_gate))assert.equal(value,false);
}
assert.equal(ids.size,526);
assert.deepEqual(dyk526ApprovedCandidates(preview),[]);
assert.deepEqual(dyk526ApprovedCandidates(preview,{enabled:true}),[]);
assert.equal(dyk526Pick(preview,"2026-11-10",{enabled:true}),null);
assert.equal(dyk526Model(preview,preview.records[0].id,"2026-11-10","fr",{enabled:true}),null);

// Toggling individual gates in a research preview never promotes it.
const tamperedPreview=clone(preview);
tamperedPreview.global_release_authorized=true;
tamperedPreview.records[0].release_gate.owner_approved=true;
tamperedPreview.records[0].eligibility="APPROVED_FOR_LIVE";
assert.deepEqual(dyk526ApprovedCandidates(tamperedPreview,{enabled:true}),[]);

// A hypothetical, separately prepared and *explicitly* authorized release.
// Synthetic fixture only: neither this file nor the preview grants approval.
const first=clone(preview.records[0]);
first.eligibility="APPROVED_FOR_LIVE";
first.editorial.owner_decision="APPROVED";
first.editorial.copy_adjustment_pending=false;
for(const field of Object.keys(first.release_gate))first.release_gate[field]=true;
const url=first.research_provenance.source_urls_raw.split(/[;\n]/)[0].trim();
first.published_source={
 url,source_id:"TEST-SOURCE-1",source_record_id:"TEST-SOURCE-1",
 deep_link_verified:true
};
const approved={
 schema:DYK_526_RELEASE_SCHEMA,release_stage:"APPROVED_PARTIAL_LIVE",
 published:true,global_release_authorized:true,owner_release_decision:"APPROVED",
 records:[first]
};
assert.deepEqual(dyk526ApprovedCandidates(approved),[],"default runtime gate must be closed");
assert.equal(dyk526ApprovedCandidates(approved,{enabled:true}).length,1);
assert.equal(dyk526Pick(approved,"2026-11-10",{enabled:true})?.id,first.id);
assert.equal(dyk526Pick(approved,"2026-11-31",{enabled:true}),null);
assert.equal(dykHomeRotationSlot("2026-11-10",[first.id],[]),first.id);
const en=dyk526Model(approved,first.id,"2026-11-10","en",{enabled:true});
const fr=dyk526Model(approved,first.id,"2026-11-10","fr",{enabled:true});
assert.equal(en.title,first.proposed_title.en);
assert.equal(fr.title,first.proposed_title.fr);
assert.equal(en.fact,first.proposed_copy.en);
assert.equal(fr.fact,first.proposed_copy.fr);
assert.equal(fr.sourceUrl,url);
assert.equal(fr.links[0].url,url);
assert.equal(fr.published,true);
assert.equal(dyk526Model(approved,"DYK-UNKNOWN","2026-11-10","en",{enabled:true}),null);

for(const field of Object.keys(first.release_gate)){
 const broken=clone(approved);broken.records[0].release_gate[field]=false;
 assert.deepEqual(dyk526ApprovedCandidates(broken,{enabled:true}),[],"Withheld "+field);
}
for(const key of ["published","global_release_authorized"]){
 const broken=clone(approved);broken[key]=false;
 assert.deepEqual(dyk526ApprovedCandidates(broken,{enabled:true}),[],"Withheld "+key);
}
for(const [key,value] of [
 ["schema",DYK_526_PREVIEW_SCHEMA],
 ["release_stage","RESEARCH_ONLY"],
 ["owner_release_decision",null]
]){
 const broken=clone(approved);broken[key]=value;
 assert.deepEqual(dyk526ApprovedCandidates(broken,{enabled:true}),[]);
}
for(const mutator of [
 row=>{row.editorial.owner_decision=null;},
 row=>{row.editorial.copy_adjustment_pending=true;},
 row=>{row.proposed_title.fr="";},
 row=>{row.proposed_copy.en="";},
 row=>{row.research_provenance.master_fact_id="DYK-WRONG";},
 row=>{row.published_source.url="http://not-secure.test/source";},
 row=>{row.published_source.url="javascript:alert(1)";},
 row=>{row.published_source.deep_link_verified=false;},
 row=>{row.published_source.source_record_id="WRONG";},
 row=>{row.eligibility="RESEARCH_ONLY";}
]){
 const broken=clone(approved);mutator(broken.records[0]);
 assert.deepEqual(dyk526ApprovedCandidates(broken,{enabled:true}),[]);
}
// Never silently publish a subset of an ostensibly approved release if any
// bundled card lacks one of the required per-record certifications.
const mixedApproval=clone(approved);
const withheld=clone(first);
withheld.id="DYK-SYNTHETIC-WITHHELD";
withheld.research_provenance.master_fact_id=withheld.id;
withheld.published_source.source_id="SYNTHETIC-WITHHELD";
withheld.published_source.source_record_id="SYNTHETIC-WITHHELD";
withheld.proposed_title={en:"A withheld second card",fr:"Une seconde carte retenue"};
withheld.proposed_copy={en:"A distinct historical Catholic practice held back pending source certification.",
 fr:"Une pratique catholique ancienne distincte retenue dans l'attente de la vérification des sources."};
withheld.release_gate.source_reference_checked=false;
mixedApproval.records.push(withheld);
assert.deepEqual(dyk526ApprovedCandidates(mixedApproval,{enabled:true}),[],
 "A mixed approved/unapproved manifest must fail in its entirety");

const duplicateIds=clone(approved);duplicateIds.records.push(clone(first));
assert.deepEqual(dyk526ApprovedCandidates(duplicateIds,{enabled:true}),[]);

// Duplicate copy or bilingual titles must fail closed in an approved subset.
const duplicateTitles=clone(approved);const second=clone(first);
second.id="DYK-TEST-SECOND";
second.research_provenance.master_fact_id=second.id;
second.published_source.source_id="TEST-SOURCE-2";
second.published_source.source_record_id="TEST-SOURCE-2";
second.proposed_copy={en:"Another distinct and sufficiently long English discovery about the Catholic tradition.",fr:"Une autre découverte distincte et suffisamment longue au sujet de la tradition catholique."};
duplicateTitles.records.push(second);
assert.deepEqual(dyk526ApprovedCandidates(duplicateTitles,{enabled:true}),[]);
second.proposed_title={en:"Second distinct topic",fr:"Deuxième sujet distinct"};
assert.equal(dyk526ApprovedCandidates(duplicateTitles,{enabled:true}).length,2);
const p1=dyk526Pick(duplicateTitles,"2026-11-10",{enabled:true});
const p2=dyk526Pick(duplicateTitles,"2026-11-10",{enabled:true});
assert.equal(p1?.id,p2?.id,"Daily rotation must remain deterministic");

// Home may import the safe bridge, but never the *research preview* or
// a direct 526 release adapter bypassing the fixed disabled feature gate.
const home=readFileSync("src/home/did-you-know-glossary.js","utf8");
const released=readFileSync("src/home/dyk-published-feed.js","utf8");
const bridge=readFileSync("src/home/dyk-526-home-bridge.js","utf8");
assert.ok(home.includes('from "./dyk-526-home-bridge.js"'));
assert.ok(!home.includes('from "./dyk-526-release-adapter.js"'));
assert.ok(bridge.includes("DYK526_HOME_ENABLED=false"));
assert.ok(bridge.includes("data/did-you-know/dyk-526-approved-release"));
for(const text of [home,released,bridge]){
 assert.ok(!text.includes("ao-dyk-display-preview-526-RESEARCH_ONLY"),
  "Unapproved preview must never become a live Home import");
}
assert.ok(!released.includes("dyk-526-release-adapter.js"),
 "Existing released banks remain independent of the future 526 adapter");
console.log("PASS DYK 526 adapter: staged candidates=526, live=0, bilingual and source guards fail closed; synthetic positive-path contract verified.");
