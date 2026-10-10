import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/learn/";
const packs=["formation-canonical-sourcefirst-batch5-2026-10-09.v1.json","formation-canonical-synthesis-batch1-2026-10-09.v1.json"].map(x=>read(root+x));
const amended=read(root+"formation-priority-six-20261010-source-role-amendment.v1.json");
const expected=new Map([
["APOL-039","FEENEY-EXT-039"],
["APOL-044","MAIMON-11-4-044"],
["APOL-045","USCCB-2002-045"],
["APOL-047","HICK-2013-047"],
["APOL-054","FULCHER-JER-1099-054"],
["APOL-055","LEA-1906-055"]
]);
const seen=new Set();
for(const pack of packs){
 assert.equal(pack.metrics.source_registry_entries,pack.source_registry.length);
 const sources=new Map(pack.source_registry.map(s=>[s.id,s]));
 for(const d of pack.dossiers){
  if(!expected.has(d.id))continue;
  seen.add(d.id);
  assert.equal(d.sections.length,4);
  assert.deepEqual(d.sections.map(s=>s.role),["answer","documented_position","critical_response","traditional_catholic_argument"]);
  const original=expected.get(d.id);
  assert.ok(d.sections[1].source_ids.includes(original),d.id+" lacks named opposing original");
  assert.ok(d.sections[1].attribution?.length>20,d.id+" lacks original-source attribution");
  assert.match(sources.get(original)?.url||"",/^https:\/\//);
  assert.equal(sources.get(original).original_context_approved,false);
  for(const sec of d.sections){
    assert.ok(sec.text.en.length>160&&sec.text.fr.length>160,d.id+": bilingual argument incomplete");
    assert.ok(sec.source_ids.length,d.id+": empty source links");
    for(const ref of sec.source_ids)assert.ok(/^https:\/\//.test(sources.get(ref)?.url||""),d.id+": source unresolved "+ref);
    for(const ref of Object.keys(sec.source_claim_locators||{}))assert.ok(sec.source_ids.includes(ref),d.id+": orphan claim locator");
    assert.equal(sec.original_context_approved,false);
    assert.equal(sec.french_final_approved,false);
  }
  for(const k of ["independent_theological_canonical_approval","native_french_copyapproval","original_claim_by_claim_source_context_certified","publication_allowed"])assert.equal(d[k],false);
 }
}
assert.deepEqual([...seen].sort(),[...expected.keys()].sort());
assert.equal(amended.modified_roles.length,10);
assert.equal(amended.publication_allowed,false);
assert.equal(amended.original_passage_certified,false);
console.log("PASS: six bilingual original-opponent repairs, live sources and unchanged publication locks");
