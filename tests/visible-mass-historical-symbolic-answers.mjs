import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const source=rel=>JSON.parse(fs.readFileSync(path.join(root,'previews/visible-mass-3d',rel),'utf8'));
const pack=source('HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json');
const master=source('PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json');
const objects=new Set(master.objects.map(x=>x.object_id));
const page=fs.readFileSync(path.join(root,'previews/visible-mass-3d/sanctuary-hotspot-pilot.html'),'utf8');
assert.equal(pack.status,'HISTORICAL_SOURCES_CHECKED_RESEARCH_DRAFT_NOT_LITURGICAL_APPROVAL');
assert.equal(master.questions.length,134);
assert.equal(pack.answers.length,28);
assert.equal(pack.occasion_notes.length,5);
assert.equal(pack.counts.remaining_existing_questions_unanswered,106);
assert.equal(new Set(pack.answers.map(x=>x.question_id)).size,28);
const interpretation=new Set(['HISTORICAL_ACCOUNT','HISTORICAL_AND_TRADITIONAL_SYMBOLISM','HISTORY_AND_TRADITIONAL_SYMBOLISM','THEOLOGICAL_INTERPRETATION','HISTORICAL_AND_FUNCTIONAL','HISTORICAL_AND_SYMBOLIC','HISTORICAL_AND_THEOLOGICAL','HISTORICAL_AND_CEREMONIAL_CONTEXT','TRADITIONAL_SYMBOLISM']);
for(const answer of pack.answers) {
 const original=master.questions.find(q=>q.id===answer.question_id);
 assert.ok(original,answer.question_id+' must use existing canonical VMQ identity');
 assert.equal(answer.question_en,original.question.en);
 assert.equal(answer.object_id,original.primary_object_id);
 assert.ok(interpretation.has(answer.interpretation_type),answer.question_id+' missing history/symbolism classification');
 assert.ok(answer.answer_en.length>=60,answer.question_id+' short answer');
 assert.ok(answer.explanation_en.length>=70,answer.question_id+' evidence context');
 assert.equal(answer.status,'RESEARCH_DRAFT_EXACT_QUESTION_NOT_PUBLICATION_CERTIFIED');
 assert.equal(answer.edition_scope,'HISTORICAL_REFERENCE_NOT_AUTOMATIC_1962_NORM');
 assert.match(answer.editorial_guard,/^[A-Z0-9_]{8,}$/);
 assert.ok(answer.source_evidence.length>=1,answer.question_id+' lacks sources');
 for(const source of answer.source_evidence){
  assert.equal(new URL(source.url).hostname,'www.newadvent.org');
  assert.match(source.url,/\/cathen\/[0-9a-z]+\.htm$/);
  assert.ok(source.section.length>15);
  assert.equal(source.role,'HISTORICAL_SECONDARY_NOT_1962_LEGISLATION');
 }
}
assert.deepEqual(pack.occasion_notes.map(x=>x.id),['VMSYM-PASSION','VMSYM-THURSDAY','VMSYM-GOODFRIDAY','VMSYM-VIGIL','VMSYM-TENEBRAE']);
for(const note of pack.occasion_notes) {
 assert.ok(note.object_ids.every(id=>/^[A-Z]{2}\d{2}$/.test(id)));
 assert.ok(note.object_ids.some(id=>objects.has(id)));
 assert.ok(note.illustration_edition_warning.length>=20);
 assert.ok(note.source_evidence.every(x=>new URL(x.url).hostname==='www.newadvent.org'));
 assert.equal(note.status,'RESEARCH_DRAFT_NOT_1962_CEREMONY_CERTIFICATION');
}
for(const id of ['VMQ-0003','VMQ-0005','VMQ-0017','VMQ-0024','VMQ-0036','VMQ-0041','VMQ-0059','VMQ-0105','VMQ-0129','VMQ-0133'])assert.ok(pack.answers.some(x=>x.question_id===id));
assert.ok(pack.excluded_claims.some(x=>x.includes('pre-1955')));
assert.match(page,/HISTORICAL_SYMBOLIC_ANSWERS_20261017\.v1\.json/);
assert.match(page,/renderExactHistoricalAnswer/);
assert.match(page,/renderOccasionNote/);
assert.match(page,/No independent object photograph/);
assert.match(page,/original Brompton photograph has not been altered/);
assert.match(page,/Historical and functional research · not a 1962 rubrical instruction/);
assert.match(page,/id="answer-pending"/);
assert.match(page,/id="historical-answer"/);
assert.match(page,/id="occasion-select"/);
const code=page.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(code);new vm.Script(code[1]);
console.log('Visible Mass historical source Q&A PASS:',pack.answers.length,'unchanged VMQ answers;',pack.occasion_notes.length,'occasion history notes');