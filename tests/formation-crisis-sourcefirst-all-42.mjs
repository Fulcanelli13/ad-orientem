import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const ev=read("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const ap=read("data/learn/apologetics-canonical.v1.json");
const cr=read("data/learn/church-crisis-canonical.v1.json");
const prior=[1,2,3].map(n=>read("data/learn/formation-canonical-synthesis-batch"+n+"-2026-10-09.v1.json"));
const newAp=[4,5].map(n=>read("data/learn/formation-canonical-sourcefirst-batch"+n+"-2026-10-09.v1.json"));
const newCr=[6,7,8].map(n=>read("data/learn/formation-crisis-sourcefirst-batch"+n+"-2026-10-09.v1.json"));
const versions=["FORMATION_CRISIS_SOURCEFIRST_BATCH6_20261009_V1","FORMATION_CRISIS_SOURCEFIRST_BATCH7_20261009_V1","FORMATION_CRISIS_SOURCEFIRST_BATCH8_20261009_V1"];
const counts=[22,10,10],expected=[
"CR-ORG-01","CR-ORG-02","CR-ORG-03","CR-ORG-04","CR-ORG-06","CR-ORG-07","CR-ORG-08","CR-LIT-01",
"CR-DOC-03","CR-DOC-05","CR-DOC-06","CR-DOC-07","CR-DOC-08","CR-ECC-01","CR-ECC-02","CR-ECC-06","CR-ECC-07","CR-ECC-10","CR-ECC-11",
"CR-AUT-04","CR-AUT-05","CR-AUT-10","CR-MOR-01","CR-MOR-02","CR-MOR-03","CR-MOR-04","CR-MOR-05","CR-MOR-06","CR-MOR-07",
"CR-IDM-02","CR-IDM-03","CR-IDM-04","CR-IDM-06","CR-IDM-09","CR-IDM-10","CR-GOV-02","CR-GOV-03","CR-GOV-04","CR-GOV-05","CR-GOV-08","CR-GOV-09","CR-GOV-10"];
const all=[...prior,...newAp,...newCr].flatMap(x=>x.dossiers);
assert.equal(all.length,141);
const ids=all.map(x=>x.id);
assert.equal(new Set(ids).size,141,"duplicate cross-module canonical ownership");
assert.deepEqual(ids.filter(x=>x.startsWith("APOL-")).sort(),ap.dossiers.map(x=>x.id).sort());
assert.deepEqual(ids.filter(x=>x.startsWith("CR-")).sort(),cr.dossiers.map(x=>x.id).sort());
assert.equal(ev.dossiers.length,141);
assert.deepEqual(newCr.flatMap(x=>x.dossiers.map(y=>y.id)),expected);
let n=0,cited=0;
for(let i=0;i<3;i++){
 const pack=newCr[i];
 assert.equal(pack.version,versions[i]);
 assert.equal(pack.status,"UNPUBLISHED_ORIGINAL_EDITORIAL_DRAFT_NO_PRIOR_DIRECT_RESEARCH");
 assert.equal(pack.publication_allowed,false);
 assert.equal(pack.dossiers.length,counts[i]);
 const reg=new Map(pack.source_registry.map(s=>[s.id,s]));
 assert.equal(reg.size,pack.source_registry.length,"ambiguous original-document identifier");
 for(const s of reg.values()){
   assert.match(s.url,/^https:\/\/[^/\s]+\/\S+/,s.id+" has no direct HTTPS document");
   assert.ok(s.locator?.length>=6,s.id+" original passage not scoped");
   assert.equal(s.original_context_approved,false,"unverified source was silently marked approved");
 }
 for(const x of pack.dossiers){
   assert.equal(x.canonical_owner,"CHURCH_CRISIS");
   assert.equal(x.question_provenance,"CANONICAL_TITLE_ONLY_LEGACY_ORIGINAL_NOT_RECOVERED");
   assert.deepEqual(x.research_anchor,[]);
   assert.equal(ev.dossiers.find(y=>y.id===x.id).direct_source_bearing_research_ids.length,0);
   for(const flag of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
     assert.equal(x[flag],false,x.id+" improperly approved");
   assert.deepEqual(x.sections.map(p=>p.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
   for(const p of x.sections){
     assert.ok(p.text.en.length>=200,x.id+" shallow English "+p.role);
     assert.ok(p.text.fr.length>=180,x.id+" shallow French "+p.role);
     assert.ok(p.source_ids.length>0,x.id+" paragraph lacks source");
     if(p.role==="documented_position")assert.ok(p.attribution?.length>=18,x.id+" position is unattributed");
     for(const id of p.source_ids)assert.ok(reg.has(id),x.id+" unresolved paragraph hyperlink "+id);
     assert.equal(p.original_context_approved,false);
     assert.equal(p.french_final_approved,false);
     cited+=p.source_ids.length;
     n++;
   }
 }
 assert.equal(pack.metrics.canonical_dossiers,counts[i]);
 assert.equal(pack.metrics.english_substantive_paragraphs,counts[i]*4);
 assert.equal(pack.metrics.french_substantive_paragraphs,counts[i]*4);
 assert.equal(pack.metrics.source_registry_entries,pack.source_registry.length);
 assert.equal(pack.metrics.public_routes_added,0);
 assert.equal(pack.metrics.independent_approvals,0);
}
assert.equal(n,168);
assert.equal(expected.length,42);
assert.equal(all.filter(x=>x.research_anchor?.length).length,53);
assert.equal(all.filter(x=>x.research_anchor?.length===0).length,88);
for(const id of ["CR-ECC-06","CR-ECC-07"]){
 const x=newCr.flatMap(y=>y.dossiers).find(y=>y.id===id);
 assert.ok(x.sections.some(p=>p.source_ids.some(s=>["DDFNOTE26","DDFDEC26","ECAD88","SSPXREC26"].includes(s))));
}
console.log(JSON.stringify({qa:"PASS",canonicalOwnerDossiers:all.length,apologetics:60,churchCrisis:81,newChurchCrisisDossiers:42,newEnglishParagraphs:n,newFrenchParagraphs:n,originalSourcePointers:cited,originalResearchLinked:53,newEditorialSourceFirst:88,independentlyCertified:0,publicRoutes:0}));
