import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const debates = JSON.parse(readFileSync("data/learn/traditionis-custodes-debates.v1.json", "utf8"));
const crisis = JSON.parse(readFileSync("data/learn/church-crisis-canonical.v1.json", "utf8"));
const apol = JSON.parse(readFileSync("data/learn/apologetics-canonical.v1.json", "utf8"));
const ids = new Set([...crisis.dossiers, ...apol.dossiers].map(x => x.id));
const sources = new Map(debates.source_registry.map(s => [s.id, s]));
const expected = Array.from({length:10},(_,i)=>"TLM"+String(66+i).padStart(3,"0"));

assert.equal(debates.status, "BILINGUAL_10_CASES_SOURCE_SCOPED_EXPANDED_EDITORIAL_DRAFT_UNPUBLISHED");
assert.equal(debates.audit_batch_20261008.question_count,10);
assert.equal(debates.audit_batch_20261008.paragraphs_checked,30);
assert.equal(debates.audit_batch_20261008.synthetic_objection_roles_corrected,5);
assert.equal(debates.audit_batch_20261008.public_release_allowed,false);
assert.deepEqual(debates.debates.map(d => d.id), expected);
assert.equal(debates.ownership_summary.new_canonical_dossiers, 0);
assert.equal(debates.source_registry.length, sources.size, "duplicate source identifier");
assert.equal(crisis.dossiers.length, 81, "navigation expansion is prohibited");
assert.equal(apol.dossiers.length, 60, "apologetics navigation expansion is prohibited");
for (const s of debates.source_registry) {
  assert.match(s.url, /^https:\/\//, "non-hyperlinked source: "+s.id);
  assert.ok(s.title && s.type);
}
let paragraphs=0, namedProponentArguments=0, syntheticArguments=0;
for(const d of debates.debates){
  assert.ok(ids.has(d.canonical_owner),"unknown owner "+d.id);
  assert.ok(d.crossLinks.every(x=>ids.has(x)),"unknown cross-link "+d.id);
  assert.ok(d.title.en && d.title.fr,"untranslated title "+d.id);
  assert.equal(d.paragraphs.length,5);
  assert.deepEqual(d.paragraphs.slice(3).map(x=>x.role),["traditional_argument","reply_to_objection"]);
  assert.ok(d.evidence_review.five_paragraph_bilingual_expansion===2);
  assert.equal(d.paragraphs[0].role,"answer");
  assert.ok(["identified_objection","source_based_critical_argument"].includes(d.paragraphs[1].role));
  assert.equal(d.paragraphs[2].role,"assessment");
  if(d.paragraphs[1].role==="identified_objection")namedProponentArguments++;
  else {syntheticArguments++; assert.match(d.paragraphs[1].provenance,/EDITORIAL_SYNTHESIS/);}
  assert.equal(d.evidence_review.public_release_allowed,false);
  for(const p of d.paragraphs){
    assert.ok(p.text.en && p.text.fr,"missing bilingual paragraph "+d.id);
    assert.ok(p.source_locator && p.source_review, "missing source locator "+d.id);
    assert.ok(Array.isArray(p.source_ids) && p.source_ids.length,"unsourced paragraph "+d.id);
    for(const sid of p.source_ids)assert.ok(sources.has(sid),"broken source reference "+sid);
    paragraphs++;
  }
}
assert.equal(paragraphs,50);
assert.equal(namedProponentArguments,5);
assert.equal(syntheticArguments,5);
assert.equal(sources.size,20);
assert.equal(sources.get('CIC4').url,'https://www.vatican.va/archive/cod-iuris-canonici/eng/documents/cic_lib4-cann834-878_en.html');
assert.ok(sources.get('OBED08').url.includes('autorita-obbedienza'));
assert.ok(debates.debates.find(x=>x.id==='TLM075').paragraphs[3].source_ids.includes('OBED08'));
assert.match(debates.debates.find(x=>x.id==='TLM075').paragraphs[2].text.en,/singular administrative decrees/);
assert.match(debates.debates.find(x=>x.id==='TLM067').paragraphs[2].text.en,/statement did not authenticate/);
assert.ok(sources.get("AQU104").url.includes("/summa/3104.htm"));
assert.equal(sources.get("RES23").url,"https://www.vatican.va/content/dam/wss/roman_curia/congregations/ccdds/documents/rc_con_ccdds_doc_20230220_rescriptum-traditioniscustodes_en.html");
assert.ok(sources.get("FSSP22FR").url.includes("/fr/"));
assert.ok(debates.debates.find(x=>x.id==="TLM073").paragraphs[2].source_ids.includes("FSSP22FR"));
assert.ok(debates.debates.find(x=>x.id==="TLM075").paragraphs[1].source_ids.includes("CIC1752"));
console.log("Traditionis custodes dossier: PASS — 10 questions, 50 sourced bilingual paragraphs, 20 hyperlinked sources, 5 attributed objections, 5 editorial arguments, 0 new navigation dossiers.");
