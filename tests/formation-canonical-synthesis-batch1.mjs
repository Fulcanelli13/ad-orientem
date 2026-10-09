import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const j=p=>JSON.parse(readFileSync(p,"utf8"));
const d=j("data/learn/formation-canonical-synthesis-batch1-2026-10-09.v1.json");
const a=j("data/learn/apologetics-canonical.v1.json");
const c=j("data/learn/church-crisis-canonical.v1.json");
const e=j("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const original=j("data/learn/formation-123-source-claim-gates-2026-10-09.v1.json");
const canonical=new Map([...a.dossiers,...c.dossiers].map(x=>[x.id,x]));
const expected=["APOL-012","APOL-013","APOL-044","APOL-046","CR-ECC-04","CR-ECC-08","CR-LIT-04","CR-LIT-05","CR-DOC-04","CR-DOC-09"];
assert.deepEqual(d.dossiers.map(x=>x.id),expected);
assert.equal(d.status,"NEW_EDITORIAL_DRAFT_UNPUBLISHED_NOT_INDEPENDENTLY_SOURCE_CERTIFIED");
assert.equal(d.publication_allowed,false);
assert.equal(d.source_registry.length,30);
assert.equal(new Set(d.source_registry.map(x=>x.id)).size,30);
const sources=new Map(d.source_registry.map(x=>[x.id,x]));
for(const source of sources.values()){
 assert.match(source.url,/^https:\/\/[^/\s]+\/\S+/);
 assert.ok(source.locator?.length>5,source.id+" missing original-text scope");
 assert.equal(source.original_context_approved,false,"source was silently certified");
}
let en=0,fr=0,links=0;
for(const row of d.dossiers){
 assert.ok(canonical.has(row.id),row.id+" silently created a new owner");
 const owner=e.dossiers.find(x=>x.id===row.id);
 assert.ok(owner?.direct_source_bearing_research_ids.length,row.id+" is not in the existing researched dossier group");
 assert.equal(row.publication_allowed,false);
 assert.equal(row.original_claim_by_claim_source_context_certified,false);
 assert.equal(row.independent_theological_canonical_approval,false);
 assert.equal(row.native_french_copyapproval,false);
 assert.deepEqual(row.research_anchor,owner.direct_source_bearing_research_ids,row.id+" loses or falsely adds original cases");
 assert.equal(row.sections.length,4);
 assert.deepEqual(row.sections.map(s=>s.role).slice(-2),["critical_response","traditional_catholic_argument"]);
 assert.equal(new Set(row.sections.map(s=>s.role)).size,4);
 assert.equal(row.question_provenance,"CANONICAL_EDITORIAL_TITLE_NOT_LEGACY_VERBATIM");
 for(const x of row.sections){
   assert.ok(x.text.en.length>=210,row.id+" superficial English argument");
   assert.ok(x.text.fr.length>=210,row.id+" superficial French argument");
   assert.ok(x.source_ids.length>=1,row.id+" unsourced original claim");
   assert.equal(new Set(x.source_ids).size,x.source_ids.length,"duplicate source ID on paragraph");
   for(const sid of x.source_ids)assert.ok(sources.has(sid),row.id+" missing source "+sid);
   assert.equal(x.original_context_approved,false);
   assert.equal(x.french_final_approved,false);
   links+=x.source_ids.length;en++;fr++;
 }
}
assert.equal(en,40);
assert.equal(fr,40);
assert.equal(d.metrics.canonical_dossiers,10);
assert.equal(d.metrics.english_substantive_paragraphs,40);
assert.equal(d.metrics.french_substantive_paragraphs,40);
assert.equal(d.metrics.public_routes_added,0);
assert.equal(d.metrics.independent_approvals,0);
assert.equal(original.metrics.fully_independently_certified_records,0);
console.log(JSON.stringify({status:"PASS",dossiers:d.dossiers.length,englishParagraphs:en,frenchParagraphs:fr,sourceURLs:sources.size,sourceLinkOccurrences:links,publication:false}));
