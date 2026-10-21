/*
 * Research-only continuation: Augustine Quaestiones Evangeliorum
 * I.14–47, II.24–51. Check Catena parity, verse alignment, conflict quarantine,
 * and no publication-ready attributed dialogue. Does NOT certify Latin edition.
 * Run: node tests/scripture-catena-augustine-continuation.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const doc=load("data/scripture/catena/research/augustine-quaestiones-continuation.v1.json");
assert.equal(doc.schema,"ao.catena.augustine-quaestiones-continuation.v1");
assert.equal(doc.records.length,62);
assert.deepEqual(doc.coverage,[{book:"I",from:14,to:47,count:34},{book:"II",from:24,to:51,count:28}]);
const source=new Map(),allVerses=new Set();
for(const gospel of ["matthew","mark","luke","john"]){
  const p=load("data/scripture/catena/"+gospel+".json");
  for(const per of p.pericopes){
    assert.ok(!source.has(per.id),"duplicate canonical pericope");
    source.set(per.id,per);
    for(const v of per.verse_keys)allVerses.add(v);
  }
}
assert.equal(source.size,814);
const seen=new Set(),count={qualifiedSameWork:0,quarantinedCitationConflicts:0,total:0,sectionRecords:62};
for(const r of doc.records){
  assert.equal(r.work,"Augustine, Quaestiones Evangeliorum");
  assert.ok(!seen.has(r.id),"duplicate section "+r.id);seen.add(r.id);
  assert.equal(r.id,`aug-qev-${r.book.toLowerCase()}-${String(r.section).padStart(2,"0")}`);
  assert.equal(r.sourceLocator,r.book+"."+r.section);
  assert.ok(r.latinAnchor.length>=15,"source anchor missing");
  assert.ok(r.latinWitnessUrl.startsWith("https://la.wikisource.org/wiki/Quaestionum_Evangeliorum"));
  assert.equal(r.readerQuestionOrigin,"modern_editorial_rephrasing_not_father_quote");
  assert.equal(r.publicationState,"research_only_context_edition_translation_review_pending");
  assert.ok(r.readerQuestion.endsWith("?"));
  assert.ok(!Object.prototype.hasOwnProperty.call(r,"answer"),"No new Father words allowed");
  assert.ok(r.scriptureKeys.length);
  for(const k of r.scriptureKeys)assert.ok(allVerses.has(k),"noncanonical Scripture locator: "+k);
  if(r.originalQuestionKind==="original_authorial_question_within_section")assert.ok(r.originalQuestionAnchor);
  else assert.equal(r.originalQuestionKind,"numbered_exegetical_treatment_not_verbatim_question");
  for(const link of r.catenaLinks){
    const p=source.get(link.pericopeId),s=p?.segments?.[link.sourceOrdinal-1];
    assert.ok(p&&s,"broken source ordinal "+link.sourceFragmentId);
    assert.equal(link.sourceFragmentId,link.pericopeId+":"+(link.sourceOrdinal-1));
    assert.equal(s.father,"Augustine");
    assert.equal(link.attributionAsInCatena,"Augustine");
    assert.equal(link.catenaCitation,p.citation);
    assert.ok(s.text.startsWith(link.sourceTextAnchor),"canonical text altered");
    const note=(s.text.match(/^\\(([^)]{1,100})\\)/)||[])[1];
    assert.equal(note,link.sourceLabelAsPrinted);
    assert.match(note,/Quæst|Qu\\. Ev|Qu\\. in Ev/i,"non-Quaestiones source label");
    assert.ok(!/Quæst\\. in Matt\\./i.test(note),"Do not merge different Augustine work");
    assert.ok(p.verse_keys.some(v=>r.scriptureKeys.includes(v)),"linked unrelated Scripture");
    assert.equal(link.sourceVerseOverlap,true);
    if(link.linkClass==="related_topic_source_number_conflict__review_required")count.quarantinedCitationConflicts++;
    else{
      assert.equal(link.linkClass,"cited_ancient_work_and_topic_checked__critical_source_unverified");
      count.qualifiedSameWork++;
    }
    count.total++;
  }
}
for(let n=14;n<=47;n++)assert.ok(seen.has(`aug-qev-i-${String(n).padStart(2,"0")}`));
for(let n=24;n<=51;n++)assert.ok(seen.has(`aug-qev-ii-${String(n).padStart(2,"0")}`));
assert.deepEqual(count,{qualifiedSameWork:55,quarantinedCitationConflicts:7,total:62,sectionRecords:62});
assert.deepEqual(doc.catenaLinkCounts,count);
assert.equal(doc.records.filter(r=>r.originalQuestionKind.startsWith("original_authorial")).length,10);
console.log("PASS: 62 numbered Augustinian sections, 55 Catena topic/label links, 7 citation-number conflicts quarantined");
