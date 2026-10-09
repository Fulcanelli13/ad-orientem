import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/sources.js";
import {CSE_DEBATE_MAP,CSE_DEBATE_FIELDS} from "../src/learn/sexual-ethics-data/debates.js";
import {CSE_DEBATE_POSITION_REFS} from "../src/learn/sexual-ethics-data/provenance.js";
import {CSE_REMAINING_STAGE_SOURCE_IDS} from "../src/learn/sexual-ethics-data/stage-evidence-remaining31.js";
import {cseSourceTargets} from "../src/learn/sexual-ethics-data/source-targets.js";
const doc=JSON.parse(readFileSync("data/learn/sexual-ethics-fletcher-original-book-20261009.v1.json","utf8"));
const source=CSE_SOURCE_MAP.FLETCHER1966;
assert.equal(source.original_digitized_text_url,doc.bibliography.digitized_original);
assert.equal(source.canonical_url,"https://books.google.com/books/about/Situation_Ethics.html?id=E2JqAAAAMAAJ");
assert.equal(doc.summary.debates_touched,3);
assert.equal(doc.summary.stage_scope_checks,8);
assert.equal(doc.records.length,8);
assert.equal(doc.summary.fully_certified_debates,0);
assert.equal(doc.summary.french_approvals,0);
assert.equal(doc.summary.theological_approvals,0);
const cases=["CSE008","CSE010","CSE145"];
assert.deepEqual(doc.summary.resolved_with_author_primary_text,cases);
assert.deepEqual(doc.summary.still_without_original_proponent_text,["CSE038"]);
assert.equal(new Set(doc.records.map(x=>x.id+"."+x.stage)).size,8);
const originals=doc.records.filter(x=>["ORIGINAL_AUTHOR_THESIS_BOUNDED","ORIGINAL_AUTHOR_CONTEXT_BOUNDED"].includes(x.classification));
assert.equal(originals.length,4);
assert.equal(doc.records.length-originals.length,4);
for(const x of doc.records){
 assert.ok(cases.includes(x.id));
 assert.ok(CSE_DEBATE_MAP[x.id]);
 assert.ok(CSE_DEBATE_FIELDS.includes(x.stage));
 assert.ok(CSE_DEBATE_MAP[x.id][x.stage][0].length>35);
 assert.ok(CSE_DEBATE_MAP[x.id][x.stage][1].length>35);
 assert.ok(CSE_DEBATE_POSITION_REFS[x.id].some(([id])=>id==="FLETCHER1966"));
 assert.equal(x.original_book_url,source.original_digitized_text_url);
 assert.ok(x.locator.length>12);
 assert.ok(x.verified_bounded_claim_en.length>70);
 assert.ok(x.not_proven_by_original_en.length>80);
 assert.equal(x.original_book_section_checked,true);
 for(const key of ["complete_original_book_text_collated","full_stage_en_fr_verified","french_original_independently_verified","independent_theology_approved","debate_certified"])assert.equal(x[key],false);
}
// Source-first routing: two specified Fletcher dossiers have bounded
// original text for the thesis, context and reconstructed counterargument.
// Do not substitute a critic's excerpts for the available 1966 chapters.
const stages=JSON.parse(readFileSync("data/learn/sexual-ethics-stage-evidence-remaining31.v1.json","utf8"));
for(const id of ["CSE008","CSE010"]){
  const claim=stages.cases[id];
  for(const stage of ["opposition","appeal","counter"]){
    assert.deepEqual(CSE_REMAINING_STAGE_SOURCE_IDS[id][stage],["FLETCHER1966"],id+"."+stage);
    assert.deepEqual(claim.stage_source_ids[stage],["FLETCHER1966"],"JS/frozen SOT divergence: "+id+"."+stage);
    assert.match(claim.source_scope_caveat,/third-party host/);
    const ref=CSE_DEBATE_POSITION_REFS[id].find(([key])=>key==="FLETCHER1966");
    assert.ok(ref,"No primary Fletcher locator: "+id);
    const target=cseSourceTargets("FLETCHER1966",ref[1],source)[0];
    assert.equal(target.scope,"digitized-original",id+"."+stage+" opened a book catalogue rather than the examined original");
    assert.equal(target.url,source.original_digitized_text_url);
  }
}
assert.notEqual(source.canonical_url,source.original_digitized_text_url);
assert.match(source.title,/Westminster Press, 1966/);
assert.doesNotMatch(source.canonical_url,/Y4759nkMFq0C/,"1997 reprint must not stand as 1966 edition");

const slogan=doc.records.find(x=>x.id==="CSE145"&&x.stage==="opposition");
assert.equal(slogan.classification,"ANALOGY_ONLY_NOT_OPPONENT_ATTRIBUTION");
assert.ok(slogan.not_proven_by_original_en.includes("not attributed to Fletcher"));
console.log("PASS Fletcher original 1966 scope: 8 stages, 3 previously secondary-only cases now have firsthand book passages, one unresolved proponent, zero full certifications.");
