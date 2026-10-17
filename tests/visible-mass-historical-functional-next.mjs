import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const data=p=>JSON.parse(fs.readFileSync(path.join(root,'previews/visible-mass-3d',p),'utf8'));
const master=data('PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json');
const previous=data('HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json');
const next=data('HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json');
const html=fs.readFileSync(path.join(root,'previews/visible-mass-3d/sanctuary-hotspot-pilot.html'),'utf8');
assert.equal(next.status,'SECONDARY_SOURCES_INSPECTED_RESEARCH_DRAFT_NOT_RITE_CERTIFICATION');
assert.equal(master.questions.length,134);
assert.equal(previous.answers.length,28);
assert.equal(next.answers.length,69);
assert.equal(next.counts.total_answered,97);
assert.equal(next.counts.remaining,37);
const original=new Map(master.questions.map(q=>[q.id,q])), previousIds=new Set(previous.answers.map(q=>q.question_id)), allIds=new Set();
for(const answer of [...previous.answers,...next.answers]){
 assert.ok(!allIds.has(answer.question_id),'duplicated original VMQ answer '+answer.question_id);
 allIds.add(answer.question_id);
 const source=original.get(answer.question_id);
 assert.ok(source,'unknown VMQ '+answer.question_id);
 assert.equal(answer.question_en,source.question.en);
 assert.equal(answer.object_id,source.primary_object_id);
 assert.equal(answer.status,'RESEARCH_DRAFT_EXACT_QUESTION_NOT_PUBLICATION_CERTIFIED');
 assert.equal(answer.edition_scope,'HISTORICAL_REFERENCE_NOT_AUTOMATIC_1962_NORM');
 assert.ok(answer.answer_en.length>=55 && answer.explanation_en.length>=65);
 assert.ok(answer.source_evidence.length);
 for(const citation of answer.source_evidence){
  assert.equal(new URL(citation.url).hostname,'www.newadvent.org');
  assert.match(citation.url,/\/cathen\/\d{5}[a-z]\.htm$/);
  assert.equal(citation.role,'HISTORICAL_SECONDARY_NOT_1962_LEGISLATION');
 }
}
assert.equal(allIds.size,97);
for(const a of next.answers)assert.ok(!previousIds.has(a.question_id));
for(const id of ['VMQ-0044','VMQ-0046','VMQ-0048']){
 const answer=next.answers.find(x=>x.question_id===id);
 assert.ok(answer);
 assert.ok(answer.source_evidence.some(x=>x.url.endsWith('01356e.htm')),'actual altar side primary historical locator');
}
assert.match(next.answers.find(x=>x.question_id==='VMQ-0044').answer_en,/RIGHT/);
assert.match(next.answers.find(x=>x.question_id==='VMQ-0048').answer_en,/LEFT/);
assert.ok(!next.answers.find(x=>x.question_id==='VMQ-0044').answer_en.includes('deliberately withheld'));
const bell=previous.answers.find(x=>x.question_id==='VMQ-0134');
assert.ok(bell.source_evidence.some(x=>x.url.endsWith('01349b.htm')));
assert.ok(!bell.source_evidence.some(x=>x.url.endsWith('13432a.htm')));
for(const gated of ['VMQ-0018','VMQ-0022','VMQ-0026','VMQ-0032','VMQ-0069','VMQ-0088','VMQ-0121'])assert.ok(!allIds.has(gated),'Rubrical question should remain open pending 1962 check');
assert.match(html,/HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json/);
assert.match(html,/function findExactAnswer/);
assert.match(html,/functionPack/);
assert.match(html,/historicalAnswerCount:/);
const match=html.match(/<script>([\s\S]*?)<\/script>/);assert.ok(match);new vm.Script(match[1]);
console.log('Visible Mass secondary historical answers PASS:',next.answers.length,'new,',allIds.size,'total,',134-allIds.size,'questions remaining');