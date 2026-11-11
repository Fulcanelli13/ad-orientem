import assert from "node:assert/strict";
import {existsSync,readFileSync} from "node:fs";
import {dyk526ApprovedCandidates} from "../src/home/dyk-526-release-adapter.js";

// This is an owner-review *proof*, never a live dataset. Validation must not
// change any publication gate or claim that source URLs passed browser QA.
const base="data/research/did-you-know/release-candidates/";
const read=name=>JSON.parse(readFileSync(base+name,"utf8"));
const proof=read("ao-dyk-batch-A-62-corrected-bilingual-owner-proof-RESEARCH_ONLY-20261111.v1.json");
const original=read("ao-dyk-display-preview-526-RESEARCH_ONLY.v1.json");
const preflight=read("ao-dyk-batch-A-63-proposed-release-cut-PREFLIGHT-20261110.v1.json");
const links=read("ao-dyk-batch-A-62-source-link-accessibility-screen-20261111.v1.json");
const gateNames=[
 "owner_approved","editorial_final_en_signoff","editorial_final_fr_signoff",
 "semantic_novelty_approved","source_reference_checked",
 "release_authorized","published"
];
const normalize=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/\s+/g," ").trim();
assert.equal(proof.release_stage,"RESEARCH_ONLY");
assert.equal(proof.published,false);
assert.equal(proof.global_release_authorized,false);
assert.equal(proof.owner_release_decision,"UNAPPROVED");
assert.equal(proof.records.length,62);
assert.equal(proof.inventory.customs,53);
assert.equal(proof.inventory.glossary,9);
assert.equal(proof.inventory.owner_approved,0);
assert.equal(proof.inventory.release_eligible,0);
assert.equal(preflight.selected_ids.length,63);
assert.equal(original.records.length,526);
const idSet=new Set(proof.records.map(r=>r.id));
assert.equal(idSet.size,62);
assert.ok(!idSet.has("DYK-CW15-038"),"Zapopan stays on copy hold");
assert.ok(!idSet.has("DYK-G600-P-029"),"Sicilian same-event repeat excluded");
assert.ok(idSet.has("DYK-G600-P-028"),"Single merged historical identity retained");
assert.ok(preflight.selected_ids.every(id=>id==="DYK-G600-P-029"||idSet.has(id)));
const urls=new Set(),sourceIds=new Set(),titles={en:new Set(),fr:new Set()},facts={en:new Set(),fr:new Set()};
for(const row of proof.records){
 assert.ok(row.proposed_title.en&&row.proposed_title.fr,row.id+" missing title");
 assert.ok(row.proposed_copy.en&&row.proposed_copy.fr,row.id+" missing text");
 assert.equal(row.editorial.owner_decision,null,row.id+" prematurely approved");
 assert.equal(row.eligibility,"RESEARCH_ONLY",row.id+" not research only");
 assert.deepEqual(Object.keys(row.release_gate).sort(),[...gateNames].sort());
 for(const key of gateNames)assert.equal(row.release_gate[key],false,row.id+" gate "+key);
 assert.equal(row.published_source,undefined,row.id+" already has production source");
 assert.equal(row.research_provenance.master_fact_id,row.id);
 const sourceList=String(row.research_provenance.source_ids_raw||"").split(/\s*\|\s*/).filter(Boolean);
 assert.ok(sourceList.length,row.id+" lacks a provenance source ID");
 for(const source of sourceList)sourceIds.add(source);
 const linkList=String(row.research_provenance.source_urls_raw||"").split(/\s*\|\s*/).filter(Boolean);
 assert.ok(linkList.length,row.id+" lacks an origin URL");
 for(const link of linkList){assert.match(link,/^https:\/\/[^\s<>"']+$/);urls.add(link);}
 for(const lang of ["en","fr"]){
  const title=normalize(row.proposed_title[lang]),fact=normalize(row.proposed_copy[lang]);
  assert.ok(!titles[lang].has(title),row.id+" repeated "+lang+" title");
  assert.ok(!facts[lang].has(fact),row.id+" repeated "+lang+" copy");
  titles[lang].add(title);facts[lang].add(fact);
 }
}
assert.equal(proof.records.filter(r=>r.category==="CUSTOMS").length,53);
assert.equal(proof.records.filter(r=>r.category==="GLOSSARY").length,9);
assert.equal(urls.size,49);
assert.equal(links.source_links.length,49);
assert.deepEqual(new Set(links.source_links.map(r=>r.url)),urls);
assert.ok(links.source_links.every(x=>x.release_link_verified===false),"Accessibility is not release link certification");
const sassari=proof.records.find(r=>r.id==="DYK-C400-BG-014");
assert.equal(sassari.proposed_title.en,"Sassari's towering wooden candles");
assert.equal(sassari.proposed_title.fr,"Les grands cierges de bois de Sassari");
const sicily=proof.records.find(r=>r.id==="DYK-G600-P-028");
assert.match(sicily.proposed_copy.en,/serpent-shaped ring loaves/);
assert.match(sicily.proposed_copy.fr,/pains votifs/);
for(const row of [sassari,sicily])assert.equal(row.editorial.copy_adjustment_pending,true);
assert.deepEqual(dyk526ApprovedCandidates(proof,{enabled:true}),[],
 "Research-only owner proof must never become a public release");
assert.equal(existsSync("data/did-you-know/dyk-526-approved-release.v1.json"),false,
 "A real owner-approved release must be in a separately reviewed PR");
const h225=readFileSync("data/research/did-you-know/registry/ao-dyk-published-reference-h225-20261110.csv","utf8")
 .replace(/^\uFEFF/,"").split(/\r?\n/).slice(1).filter(Boolean).map(x=>x.split(",")[0]);
assert.equal(h225.length,225);
assert.ok(!h225.some(id=>idSet.has(id)),"Batch must not repeat published IDs");
const home=readFileSync("src/home/dyk-526-home-bridge.js","utf8");
assert.match(home,/DYK526_HOME_ENABLED=false/);
console.log("PASS Batch A 62: 53 Customs + 9 Glossary, 49 source URLs, exact source-lineage cut, EN/FR unique, 0 owner approvals, release fail-closed.");
