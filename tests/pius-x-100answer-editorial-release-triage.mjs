import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rel='data/learn/research/';
const read=path=>JSON.parse(readFileSync(path,'utf8'));
const wave=read(rel+'pius-x-100answer-editorial-release-triage-20261020.v1.json');
const cross=read(rel+'pius-x-200answer-spx-chanoine-denzinger-crosswalk-20261020.v1.json');
const corrections=read(rel+'pius-x-source-bounded-bilingual-corrections-20261020.v1.json');
const voices=read(rel+'pius-x-six-period-voice-candidates-20261020.v1.json');
assert.equal(wave.schema,'AO_SPX_100ANSWER_EDITORIAL_RELEASE_TRIAGE_V1');
assert.equal(wave.records.length,100);assert.equal(wave.counts.firstWave,40);
assert.equal(wave.counts.remaining,60);assert.equal(wave.waves.length,4);
assert.equal(wave.counts.published,0);
assert.equal(wave.policy.denzingerMandatory,false);
const expectedQids=new Set(Array.from({length:100},(_,i)=>'PX1905-Q'+(i+567)));
const all=new Set(wave.records.map(x=>x.id));
assert.equal(all.size,100);assert.deepEqual([...all].sort(),[...expectedQids].sort());
const first=new Set(wave.waves.flatMap(x=>x.questionIds));
assert.equal(first.size,40);
for(const w of wave.waves)assert.equal(w.questionIds.length,10);
const crossByTurn=new Map(cross.answerEvidence.map(x=>[x.answerTurnId,x]));
const patch=new Map(corrections.records.map(x=>[x.turnId,x]));
const voice=new Map(voices.records.map(x=>[x.turnId,x]));
const original=new Map();
for(const kind of ['9-sacraments','10-eucharist'])for(const c of ['a','b','c','d','e']){
 const filename=rel+'pius-x-batch'+kind+'-'+c+'-20261020.v1.json';
 const x=read(filename);
 assert.equal(x.records.length,10);
 for(const family of x.records){
  assert.ok(!original.has(family.source.questionId));
  original.set(family.source.questionId,{family,filename});
 }
}
let revisions=0,periods=0,held=0,firstWave=0;
for(const item of wave.records){
 const orig=original.get(item.id),e=crossByTurn.get(item.turnId);
 assert.ok(orig&&e);
 assert.equal(orig.filename,item.sourceOwnerPath);
 assert.equal(item.turnId,orig.family.id+'-T1');
 assert.deepEqual([item.questionEN,item.questionFR,item.originalDraftEN,item.originalDraftFR],
  [orig.family.turns[0].question.en,orig.family.turns[0].question.fr,
   orig.family.turns[0].response.en,orig.family.turns[0].response.fr]);
 assert.deepEqual(item.supportedSourceQuestionIds,e.originalSource.originalQuestionIds);
 assert.equal(item.originalDigitalWitness,orig.family.source.url);
 assert.equal(item.originalPrintQuestionsNumbered,false);
 assert.equal(item.published,false);assert.equal(item.denzingerRequired,false);
 assert.ok(Object.values(item.approval).every(v=>v==='NOT_SIGNED_OFF'));
 assert.ok(item.questionEN&&item.questionFR&&item.originalDraftEN&&item.originalDraftFR);
 assert.ok(item.reviewReasons.length);
 if(item.priority==='WAVE_1_FIRST_40'){firstWave++;assert.ok(first.has(item.id));}
 else assert.ok(!first.has(item.id));
 if(item.lane==='HISTORICAL_PASTORAL_HOLD')held++;
 const v=voice.get(item.turnId),p=patch.get(item.turnId);
 if(p){
  revisions++;assert.deepEqual([item.correctionEN,item.correctionFR],
   [p.revisionCandidate.en,p.revisionCandidate.fr]);
 }else assert.deepEqual([item.correctionEN,item.correctionFR],[null,null]);
 if(v?.channel==='PIUS_X_EDUCATIONAL_RECONSTRUCTION_UNAPPROVED'){
  periods++;assert.deepEqual([item.periodEN,item.periodFR],[v.candidate.en,v.candidate.fr]);
 }else assert.deepEqual([item.periodEN,item.periodFR],[null,null]);
 if(v?.channel==='OUT_OF_CHARACTER_EDITORIAL_HISTORICAL_NOTE'){
  assert.deepEqual(item.outOfCharacterNote,v.candidate);
  assert.equal(item.periodEN,null);
 }else assert.equal(item.outOfCharacterNote,null);
}
assert.equal(firstWave,40);assert.equal(held,30);
assert.equal(revisions,6);assert.equal(periods,5);
assert.equal(wave.records.find(x=>x.id==='PX1905-Q650').lane,'HISTORICAL_PASTORAL_HOLD');
assert.equal(wave.records.find(x=>x.id==='PX1905-Q652').lane,'PRECISION_REWRITE_REVIEW');
const historical=wave.records.find(x=>x.id==='PX1905-Q633');
assert.equal(historical.lane,'HISTORICAL_PASTORAL_HOLD');
assert.deepEqual(historical.outOfCharacterNote,voice.get(historical.turnId).candidate);
console.log('PASS SPX editorial release workbench: 100 source-owner openings, 40 in four review batches, 30 historical/pastoral holds, 6 source corrections, 5 period alternatives, 0 publication approvals');
