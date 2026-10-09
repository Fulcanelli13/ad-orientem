import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const b1=read("data/learn/formation-canonical-synthesis-batch1-2026-10-09.v1.json");
const b2=read("data/learn/formation-canonical-synthesis-batch2-2026-10-09.v1.json");
const b3=read("data/learn/formation-canonical-synthesis-batch3-2026-10-09.v1.json");
const e=read("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const a=read("data/learn/apologetics-canonical.v1.json");
const c=read("data/learn/church-crisis-canonical.v1.json");
const owners=new Set([...a.dossiers,...c.dossiers].map(x=>x.id));
assert.equal(owners.size,141);
assert.equal(b3.version,"FORMATION_CANONICAL_SUBSTANTIVE_SYNTHESIS_20261009_BATCH3_V1");
assert.equal(b3.status,"NEW_EDITORIAL_DRAFT_UNPUBLISHED_NOT_INDEPENDENTLY_SOURCE_CERTIFIED");
assert.equal(b3.publication_allowed,false);
const ids=["CR-ORG-05","CR-DOC-01","CR-DOC-02","CR-DOC-10","CR-ECC-03","CR-ECC-05","CR-ECC-09","CR-ECC-12",
"CR-AUT-01","CR-AUT-02","CR-AUT-03","CR-AUT-06","CR-AUT-07","CR-AUT-08","CR-AUT-09",
"CR-MOR-08","CR-IDM-01","CR-IDM-05","CR-IDM-07","CR-IDM-08","CR-GOV-01","CR-GOV-06","CR-GOV-07"];
assert.deepEqual(b3.dossiers.map(x=>x.id),ids);
const all=[...b1.dossiers,...b2.dossiers,...b3.dossiers];
const directly=e.dossiers.filter(x=>x.direct_source_bearing_research_ids.length);
assert.equal(all.length,53);
assert.equal(new Set(all.map(x=>x.id)).size,53,"duplicate canonical owners");
assert.equal(directly.length,53);
assert.deepEqual(all.map(x=>x.id).sort(),directly.map(x=>x.id).sort(),"research-linked owners still missing a direct answer");
const sources=new Map(b3.source_registry.map(s=>[s.id,s]));
assert.equal(sources.size,b3.source_registry.length);
let paragraphs=0,linked=0;
for(const s of sources.values()){
 assert.match(s.url,/^https:\/\/[^/\s]+\/\S+/,"source hyperlink missing");
 assert.ok(s.locator?.length>=6,s.id+" no source scope");
 assert.equal(s.original_context_approved,false,"source approved without signoff");
}
for(const x of b3.dossiers){
 assert.ok(owners.has(x.id),x.id+" unknown owner");
 assert.equal(x.canonical_owner,"CHURCH_CRISIS");
 assert.equal(x.question_provenance,"CANONICAL_EDITORIAL_TITLE_NOT_LEGACY_VERBATIM");
 assert.deepEqual(x.research_anchor,e.dossiers.find(y=>y.id===x.id).direct_source_bearing_research_ids);
 for(const k of ["publication_allowed","original_claim_by_claim_source_context_certified","independent_theological_canonical_approval","native_french_copyapproval"])
   assert.equal(x[k],false,x.id+" approval must not be fabricated");
 assert.deepEqual(x.sections.map(p=>p.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
 for(const p of x.sections){
   assert.ok(p.text.en.length>=230,x.id+" English text too thin");
   assert.ok(p.text.fr.length>=230,x.id+" French text too thin");
   assert.ok(p.source_ids.length>0,x.id+" claim lacks citation");
   assert.equal(new Set(p.source_ids).size,p.source_ids.length);
   for(const id of p.source_ids)assert.ok(sources.has(id),x.id+" source unresolved "+id);
   if(p.role==="documented_position")assert.ok(p.attribution?.length>=18,x.id+" opposing camp not identified");
   assert.equal(p.original_context_approved,false);
   assert.equal(p.french_final_approved,false);
   paragraphs++;linked+=p.source_ids.length;
 }
}
assert.equal(paragraphs,92);
assert.equal(b3.metrics.canonical_dossiers,23);
assert.equal(b3.metrics.english_substantive_paragraphs,92);
assert.equal(b3.metrics.french_substantive_paragraphs,92);
assert.equal(b3.metrics.source_registry_entries,sources.size);
assert.equal(b3.metrics.public_routes_added,0);
assert.equal(b3.metrics.independent_approvals,0);
const sspx=b3.dossiers.find(x=>x.id==="CR-ECC-05");
for(const key of ["DDFDEC26","DDFNOTE26","SSPXREC26"])
 assert.ok(sspx.sections.some(p=>p.source_ids.includes(key)),"SSPX status lacks essential 2026 source "+key);
assert.ok(sspx.sections[0].text.en.includes("2026"));
console.log(JSON.stringify({status:"PASS",canonicalDossiers:141,directlyIndexedDossiers:53,cumulativeAuthoredDossiers:all.length,newDossiers:23,newEnglishParagraphs:paragraphs,newFrenchParagraphs:paragraphs,sourceWorks:sources.size,sourcePointers:linked,approved:0,published:0}));
