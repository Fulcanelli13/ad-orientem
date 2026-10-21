/*
 * Check sequential research-only Augustine Quaestiones index.
 * Preserves source text and historical attributions; does not certify a
 * critical edition or create Father-authored responses.
 *
 * Run: node tests/scripture-catena-augustine-sequential.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const index=read("data/scripture/catena/research/augustine-quaestiones-sequential-index.v1.json");
const manifest=read("data/scripture/catena/manifest.v1.json");
assert.equal(manifest.totalFragments,12692);
assert.equal(index.schema,"ao.catena.augustine-quaestiones-sequential-index.v1");
assert.equal(index.status,"research_only_never_render_as_published_dialogue");
assert.equal(index.entries.length,30);
const corpus=new Map(),verseKeys=new Set();
for(const gospel of ["matthew","mark","luke","john"]){
  const pack=read("data/scripture/catena/"+gospel+".json");
  for(const p of pack.pericopes){
    assert.ok(!corpus.has(p.id),"duplicate canonical pericope");
    corpus.set(p.id,p);
    for(const verse of p.verse_keys)verseKeys.add(verse);
  }
}
assert.equal(corpus.size,814);
const ids=new Set();
const coverage={I:new Set(),II:new Set()};
let links=0,conflicts=0;
for(const row of index.entries){
  assert.ok(!ids.has(row.id),"duplicated research ID");
  ids.add(row.id);
  assert.equal(row.author,"Augustine of Hippo");
  assert.equal(row.work,"Quaestiones Evangeliorum");
  assert.ok(coverage[row.book],"invalid book");
  coverage[row.book].add(row.section);
  assert.equal(row.sectionLocator,row.book+"."+row.section);
  assert.ok(row.primaryLatinSectionAnchor.length>=20,"missing Latin source-language locator");
  assert.equal(row.primaryLanguage,"Latin");
  assert.ok(row.latinWitnessUrl.startsWith("https://"));
  assert.equal(row.editorialQuestionAuthorship,"modern_navigational_wording_not_augustine_quotation");
  assert.ok(row.editorialReaderQuestion.endsWith("?"));
  assert.equal(row.releaseStatus,"research_only_pending_independent_editional_and_theological_review");
  assert.ok(row.scriptureKeys.length>0);
  for(const v of row.scriptureKeys)assert.ok(verseKeys.has(v),"verse not canonical: "+v);
  assert.ok(!("fatherReply" in row));
  assert.ok(!("originalQuestionExact" in row),"not all numbered sections ask an explicit question");
  if(row.book==="II"&&row.section===7){
    assert.equal(row.historicalProblemClassification,"author_explicitly_raises_exegetical_problem");
  }else assert.equal(row.historicalProblemClassification,"author_discusses_problem_not_a_verbatim_interrogative");
  if(row.book==="I"&&row.section===7)assert.equal(row.existingPrimaryCrosswalkId,"aqe-1-07");
  for(const link of row.catenaLinks){
    const p=corpus.get(link.pericopeId);
    assert.ok(p,"missing canonical source: "+link.pericopeId);
    assert.ok(Number.isInteger(link.sourceOrdinal)&&link.sourceOrdinal>0);
    assert.equal(link.sourceFragmentId,link.pericopeId+":"+(link.sourceOrdinal-1));
    const s=p.segments[link.sourceOrdinal-1];
    assert.ok(s,"missing source ordinal "+link.sourceFragmentId);
    assert.equal(s.father,link.attributionAsInCompilation);
    assert.equal(s.father,"Augustine");
    assert.equal(p.citation,link.originalCatenaCitation);
    assert.ok(s.text.startsWith(link.sourceTextEvidenceAnchor),"source excerpt changed");
    assert.equal((s.text.match(/^\(([^)]{1,100})\)/)||[])[1],link.sourceCitationAsInCatena);
    assert.match(link.sourceCitationAsInCatena,/Quæst|Qu\. Ev|Qu\. Evan|Qu\. in Ev/i);
    assert.ok(p.verse_keys.some(v=>row.scriptureKeys.includes(v)),"verse and link not aligned");
    if(link.relation==="same_work_probable_with_numbered_section_conflict"){
      conflicts++;
      assert.equal(row.sectionLocator,"II.20","only verified section-number conflict");
      assert.equal(link.pericopeId,"catena.luke.10.38");
      assert.match(link.sourceCitationAsInCatena,/q\. 30/i);
      assert.equal(link.sourceMatchStatus,"section_number_disagreement_do_not_certify");
    }else{
      assert.equal(link.relation,"same_work_explicitly_cited_in_catena");
      assert.equal(link.sourceMatchStatus,"canonical_text_checked__independent_edition_unreviewed");
    }
    links++;
  }
}
for(let i=1;i<=13;i++)assert.ok(coverage.I.has(i),"missing Matthew section I."+i);
for(let i=7;i<=23;i++)assert.ok(coverage.II.has(i),"missing Luke section II."+i);
assert.equal(coverage.I.size,13);
assert.equal(coverage.II.size,17);
assert.equal(links,30);
assert.equal(conflicts,1);
assert.deepEqual(index.metrics,{sections:30,catenaMatchedLinks:30,numberedCitationConflicts:1});
console.log("PASS: 30 consecutive Augustine sections / 30 canonical Catena links / 1 quarantined citation-number mismatch");
