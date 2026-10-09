import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const audit=read("data/learn/formation-141-absorption-evidence-2026-10-09.v1.json");
const a=read("data/learn/apologetics-canonical.v1.json");
const c=read("data/learn/church-crisis-canonical.v1.json");
const ar=read("data/learn/apologetics-reconciliation.v1.json");
const cr=read("data/learn/church-crisis-reconciliation.v1.json");
const gate=read("data/learn/formation-123-source-claim-gates-2026-10-09.v1.json");
const definitions=[...a.dossiers.map(x=>({...x,module:"APOLOGETICS"})),...c.dossiers.map(x=>({...x,module:"CHURCH_CRISIS"}))];
assert.equal(definitions.length,141);
assert.equal(a.dossiers.length,60);
assert.equal(c.dossiers.length,81);
assert.equal(audit.dossiers.length,141);
assert.deepEqual(audit.dossiers.map(x=>x.id),definitions.map(x=>x.id));
assert.equal(new Set(audit.dossiers.map(x=>x.id)).size,141);
assert.equal(audit.counts.with_direct_indexed_research,53);
assert.equal(audit.counts.without_direct_but_with_thematic_leads,57);
assert.equal(audit.counts.without_direct_or_legacy_bank_link,31);
assert.equal(audit.counts.source_bearing_blocks,gate.metrics.paragraphs);
assert.equal(audit.counts.source_pointer_occurrences,gate.metrics.source_link_occurrences);
assert.equal(gate.metrics.fully_independently_certified_records,0);
let direct=0,band=0,unlinked=0,known=0;
for(let i=0;i<definitions.length;i++){
 const row=audit.dossiers[i],d=definitions[i];
 assert.equal(row.title,d.title);
 assert.equal(row.family,d.family);
 assert.equal(row.canonical_owner,d.module);
 const matching=gate.entries.filter(x=>x.canonical_owner===d.id);
 assert.deepEqual(row.direct_source_bearing_research_ids,matching.map(x=>x.id));
 assert.equal(row.direct_research_blocks,matching.reduce((n,x)=>n+x.source_bearing_blocks,0));
 assert.equal(row.source_pointer_occurrences,matching.reduce((n,x)=>n+x.source_link_occurrences,0));
 assert.equal(row.partial_original_passage_spot_checks,matching.reduce((n,x)=>n+(x.original_text_spot_checks||[]).length,0));
 const aBands=ar.recoverable_research_batches.filter(x=>(x.canonical_targets||[]).includes(d.id)).map(x=>x.range);
 const cBands=cr.legacy_corpus_C001_C233.filter(x=>(x.targets||[]).includes(d.id)).map(x=>x.range);
 const banks=cr.research_banks.filter(x=>[...(x.targets||[]),...(x.primary_targets||[]),...(x.secondary_targets||[])].includes(d.id)).map(x=>x.id);
 assert.deepEqual(row.legacy_thematic_and_research_bank_leads.map(x=>x.key),[...aBands,...cBands,...banks]);
 assert.deepEqual(row.apostolate_reference_only,a.live_apostolate_mapping.filter(x=>(x.canonical||[]).includes(d.id)).map(x=>x.scenario));
 const pending=(ar.prior_nonproduction_candidates||[]).flatMap(x=>x.titles||[]).filter(x=>x[2]===d.id).map(x=>x[0]);
 assert.deepEqual(row.proposed_not_live_AQ_leads,pending);
 assert.equal(row.dossier_content_fully_certified,false);
 assert.equal(row.native_french_editorial_approved,false);
 assert.equal(row.released_as_public_apologetics_or_crisis_module,false);
 if(matching.length){direct++;known+=matching.length;assert.equal(row.evidence_tier,"INDIVIDUALLY_INDEXED_UNPUBLISHED_DRAFTS");}
 else if(row.legacy_thematic_and_research_bank_leads.length){band++;assert.equal(row.evidence_tier,"LEGACY_THEMATIC_OR_BANK_LEADS_NO_DIRECT_REVIEW_RECORD");}
 else {unlinked++;assert.equal(row.evidence_tier,"NO_DIRECT_OR_LEGACY_BANK_LINK_IN_THIS_REGISTER");}
}
const canonicalIDs=new Set(definitions.map(x=>x.id));
const external=gate.entries.filter(x=>!canonicalIDs.has(x.canonical_owner));
assert.equal(known,118);
assert.equal(external.length,5);
assert.deepEqual(audit.outside_owner_research_entries.map(x=>x.id),external.map(x=>x.id));
assert.equal(direct,53);
assert.equal(band,57);
assert.equal(unlinked,31);
assert.equal(audit.counts.fully_certified,0);
assert.equal(audit.counts.published_apologetics_or_crisis,0);
console.log(JSON.stringify({status:"PASS",dossiers:141,direct:53,legacyThematic:57,noDirectOrBankLink:31,reviewEntries:123,externalOwners:5,publication:false}));
