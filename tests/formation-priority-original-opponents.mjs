import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/learn/";
const amendment=load(root+"formation-priority-original-opponents-source-amendment-2026-10-10.v1.json");
const a1=load(root+"formation-a1-20261010-source-role-amendment.v1.json");
const a2=load(root+"formation-a2-20261010-source-role-amendment.v1.json");
const packs=["formation-canonical-sourcefirst-batch4-2026-10-09.v1.json",
 "formation-canonical-sourcefirst-batch5-2026-10-09.v1.json",
 "formation-canonical-synthesis-batch2-2026-10-09.v1.json"].map(x=>load(root+x));
const records=new Map();
for(const p of packs){
 const registry=new Map(p.source_registry.map(x=>[x.id,x]));
 assert.equal(registry.size,p.source_registry.length);
 assert.equal(p.metrics.source_registry_entries,registry.size);
 for(const d of p.dossiers)records.set(d.id,{d,registry});
}
const newSources={
 "APOL-006":"VIVEK-1893-OPP",
 "APOL-011":"HICK-INT-OPP",
 "APOL-015":"WCF-SCRIPT-OPP",
 "APOL-052":"MILL-UTIL-OPP",
 "APOL-056":"GAL-1633-SENT-OPP",
 "APOL-057":"MURPHY-2009-OPP",
 "APOL-058":"TRC-2015-OPP"
};
const archived={
 "APOL-006":"DOMJES","APOL-011":"DOMJES","APOL-015":"IR3",
 "APOL-052":"CDFVAC","APOL-056":"GAL1992","APOL-057":"VELM2023","APOL-058":"VATS2023"
};
assert.deepEqual(Object.keys(newSources),["APOL-006","APOL-011","APOL-015","APOL-052","APOL-056","APOL-057","APOL-058"]);
assert.equal(amendment.original_findings_superseded.length,8);
assert.equal(amendment.modified_roles.length,11);
for(const [id,primary] of Object.entries(newSources)){
 const {d,registry}=records.get(id);
 assert.equal(d.sections.length,4,id+" no canonical four-role answer");
 const opponent=d.sections[1];
 assert.equal(opponent.role,"documented_position");
 assert.ok(opponent.source_ids.includes(primary),id+": no genuine original opposing position");
 assert.ok(!opponent.source_ids.includes(archived[id]),id+": Catholic-as-opponent role not actually corrected");
 assert.ok(opponent.attribution?.length>25,id+": original opponent unidentified");
 assert.match(registry.get(primary)?.url||"",/^https:\/\/[^ ]+\//,id+": missing source URL");
 assert.equal(registry.get(primary).original_context_approved,false);
 assert.ok(registry.has(archived[id]),id+": older source deleted from research source registry");
 assert.ok(opponent.text.en.length>210 && opponent.text.fr.length>210,id+": thin bilingual opponent");
 for(const section of d.sections){
  assert.equal(section.original_context_approved,false,id+": fake original-source certification");
  assert.equal(section.french_final_approved,false,id+": French editorial approval fabricated");
  assert.ok(section.text.en.length>180&&section.text.fr.length>180);
  assert.ok(section.source_ids.length>0,id+": unsourced claim section");
  for(const source of section.source_ids)assert.match(registry.get(source)?.url||"",/^https:\/\/[^ ]+\//,
   id+": unresolved link "+source);
  for(const source of Object.keys(section.source_claim_locators||{}))
   assert.ok(section.source_ids.includes(source),id+": unattached claim locator "+source);
  if(section.role==="traditional_catholic_argument")
   assert.doesNotMatch(section.text.en,/this dossier|this question|our module|this app/i,id+": editorial meta leakage");
 }
 for(const flag of ["original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval","publication_allowed"])
  assert.equal(d[flag],false,id+": changed release approval");
}
const current=records.get("APOL-052").d;
assert.match(current.sections[1].text.en,/John Stuart Mill/);
assert.match(current.sections[2].text.en,/Veritatis splendor/);
assert.ok(current.research_anchor.includes("VACCINES")&&current.research_anchor.includes("euthanasia"),
 "off-topic earlier vaccine/end-of-life research was lost");
assert.ok(records.get("APOL-058").registry.get("TRC-2015-OPP").url.startsWith("https://nctr.ca/"));
for(const [id,source] of Object.entries(newSources)){
 const finding=amendment.original_findings_superseded.find(x=>x.owner===id&&x.role==="documented_position");
 assert.ok(finding,id+": historical source evidence overwritten rather than amended");
 assert.equal(finding.historical_finding_retained,true);
 assert.equal(finding.new_citation_claims_independently_certified,false);
 assert.ok(finding.replacement_source_ids.includes(source));
}
const oldIds=new Set([...a1.original_findings_superseded,...a2.original_findings_superseded].map(x=>x.finding_id));
assert.equal(amendment.original_findings_superseded.every(x=>!oldIds.has(x.finding_id)),true);
assert.equal(amendment.independent_original_passage_certification,false);
assert.equal(amendment.independent_theological_approval,false);
assert.equal(amendment.native_french_approval,false);
assert.equal(amendment.publication_allowed,false);
console.log("PASS: seven original-opponent repairs, all four bilingual sections source-linked, eight old findings preserved, zero new approvals");
