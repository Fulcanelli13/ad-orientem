import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const get=name=>JSON.parse(fs.readFileSync(path.join(root,'previews/visible-mass-3d',name),'utf8'));
const pack=get('LITURGICAL_EXPLANATIONS_P1_5_FIRST20_20261017.v1.json');
const source=get('LITURGICAL_SOURCE_TO_SUBJECT_CROSSWALK_20261017.v1.json');
const existing=get('PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json');
const page=fs.readFileSync(path.join(root,'previews/visible-mass-3d/sanctuary-hotspot-pilot.html'),'utf8');
const script=page.match(/<script>([\s\S]*?)<\/script>/)?.[1];assert.ok(script);new vm.Script(script);
assert.equal(pack.status,'SOURCE_CHECKED_RESEARCH_PREVIEW_EDITORIAL_APPROVAL_PENDING');
assert.equal(pack.answers.length,20);assert.equal(pack.counts.answers,20);
assert.equal(new Set(pack.answers.map(x=>x.id)).size,20);
const ids=new Set(source.objects.map(x=>x.object_id)),topics=new Set(source.topics.map(x=>x.id));
const vqs=new Set(existing.questions.map(x=>x.id));
const acceptableSources=new Set(['isidore.co','1962ordo.today','www.newadvent.org','wdtprs.com','github.com']);
for(const answer of pack.answers){
 assert.match(answer.id,/^VMLQ-\d{3}$/);
 assert.ok(!vqs.has(answer.id),'research explanation cannot appropriate an existing VMQ identity');
 assert.equal(answer.status,'SOURCE_CHECKED_RESEARCH_PREVIEW_EDITORIAL_APPROVAL_PENDING');
 assert.ok(answer.question.en.length>12 && answer.answer.en.length>50 && answer.detail.en.length>50);
 assert.ok(answer.sources.some(x=>x.type==='PRIMARY_1960_RUBRICAL_CODE'),'must include a direct numbered 1960/1962 rubrical source');
 assert.ok(answer.sources.every(x=>acceptableSources.has(new URL(x.url).hostname)));
 assert.ok(answer.sources.every(x=>x.locator.length>=5 && x.type));
 assert.ok(answer.object_ids.length>0 && answer.object_ids.every(x=>ids.has(x)));
 assert.ok(answer.topic_ids.length>0 && answer.topic_ids.every(x=>topics.has(x)));
 assert.ok(typeof answer.gate==='string'&&answer.gate.length>7);
 assert.ok(!/APPROVED|CERTIFIED/.test(answer.status));
}
const expected=new Map([
 ['VMLQ-001','RG 117–132'],['VMLQ-003','RG 131'],['VMLQ-004','RG 6–12'],
 ['VMLQ-008','RGMR 271'],['VMLQ-009','RG 126'],['VMLQ-010','RG 130(c)'],
 ['VMLQ-013','RG 63–70'],['VMLQ-014','RG 106–114'],['VMLQ-016','RGMR 356–361'],
 ['VMLQ-017','RG 80–90'],['VMLQ-018','RG 122']
]);
for(const [id,locator] of expected){
 const item=pack.answers.find(x=>x.id===id);assert.ok(item&&item.sources.some(s=>s.locator.includes(locator)),id+' missing primary locator');
}
assert.match(page,/renderLiturgicalExplanations/);
assert.match(page,/LITURGICAL_EXPLANATIONS_P1_5_FIRST20_20261017\.v1\.json/);
assert.match(page,/liturgical-answer-items/);
assert.match(page,/For study only/);
assert.doesNotMatch(page,/sourceOfTruth *= *"LITURGICAL_EXPLANATIONS/);
console.log('Visible Mass liturgical explanation PASS:',pack.answers.length,'draft answers with source/owner gates');
