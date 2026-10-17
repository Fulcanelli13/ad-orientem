import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const file=rel=>JSON.parse(fs.readFileSync(path.join(root,rel),'utf8'));
const x=file('previews/visible-mass-3d/LITURGICAL_SOURCE_TO_SUBJECT_CROSSWALK_20261017.v1.json');
const p1=file('previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json');
const checked=file('previews/visible-mass-3d/PRIMARY_1960_RUBRIC_PASSAGE_CHECKS_20261017.v1.json');
assert.equal(checked.passage_checks.length,24);
assert.equal(new Set(checked.passage_checks.map(x=>x.id)).size,24);
for(const r of checked.passage_checks){
 assert.equal(r.source_id,'VM-RG60');
 assert.ok(r.exact_locus.startsWith('RG '));
 assert.equal(r.review_status,'ENGLISH_1960_CODE_PASSAGE_INSPECTED_LATIN_PRINTED_1962_CHECK_PENDING');
 assert.ok(x.topics.some(t=>t.id===r.topic_id));
 assert.ok(r.object_ids.every(id=>x.objects.some(o=>o.object_id===id)));
}
assert.equal(checked.counts.linked_topics,new Set(checked.passage_checks.map(r=>r.topic_id)).size);
assert.ok(checked.passage_checks.some(r=>r.exact_locus.includes('RG 131')));
assert.ok(checked.passage_checks.some(r=>r.exact_locus.includes('RG 126')));

const status='SOURCE_ROUTE_ONLY_NO_ANSWER_CERTIFIED';
assert.equal(x.status,'RESEARCH_CANDIDATE_NO_RUBRIC_OR_CONTENT_CERTIFICATION');
assert.equal(x.topics.length,44);
assert.equal(x.objects.length,170);
assert.equal(x.question_routes.length,134);
assert.equal(x.source_roles.length,9);
const src=new Set(x.source_roles.map(s=>s.id)),ownerSet=new Set(Object.values(x.owners));
assert.equal(src.size,9);
const subjects=new Set(x.objects.map(o=>o.object_id));
assert.equal(subjects.size,170);
const topics=new Set(x.topics.map(t=>t.id));assert.equal(topics.size,44);
assert.deepEqual(new Set(x.question_routes.map(q=>q.question_id)).size,134);
for(const topic of x.topics){
 assert.equal(topic.validation,status);
 assert.ok(topic.object_ids.length>0,topic.id);
 assert.ok(topic.source_ids.includes('VM-RG60') || topic.source_ids.includes('VM-MR62') || topic.source_ids.includes('VM-AO-HW'),topic.id+' lacks normative/source-owned anchor');
 for(const s of topic.source_ids)assert.ok(src.has(s),s);
 for(const o of topic.object_ids)assert.ok(subjects.has(o),o);
 for(const owner of topic.existing_owners)assert.ok(ownerSet.has(owner),owner);
 assert.ok(topic.non_negotiable_gate.length>5);
}
for(const obj of x.objects){
 assert.ok(['D','R','M'].includes(obj.match),obj.object_id);
 assert.equal(obj.status,'SOURCE_ROUTE_NOT_PUBLISHED');
 assert.deepEqual(new Set(obj.topic_ids).size,obj.topic_ids.length);
 for(const id of obj.topic_ids){
   assert.ok(topics.has(id),obj.object_id+' invalid topic '+id);
   assert.ok(x.topics.find(t=>t.id===id).object_ids.includes(obj.object_id));
 }
}
for(const q of x.question_routes){
 const original=p1.questions.find(y=>y.id===q.question_id);
 assert.ok(original && original.primary_object_id===q.object_id,q.question_id);
 assert.ok(q.topic_candidates.every(i=>x.objects.find(x=>x.object_id===q.object_id).topic_ids.includes(i)));
 assert.equal(q.approval,'NOT_ANSWERED_BY_THIS_INDEX');
}
const topic=id=>x.topics.find(t=>t.id==='VM-RB'+id);
const must=(id,expect)=>{const t=topic(id);assert.ok(t);for(const [k,v] of Object.entries(expect))assert.ok(t[k].includes(v),id+' '+k+' missing '+v)};
must('02',{non_negotiable_gate:'DAY_CLASS_NOT_MASS_FORM'});
must('09',{source_locator:'RG 117',non_negotiable_gate:'ACTUAL_MASS_AND_PHASE'});
must('23',{non_negotiable_gate:'1962_NOT_PRE1955'});
must('25',{non_negotiable_gate:'PRINTED_1962_NOT_2008_OR_PRE1955'});
must('28',{non_negotiable_gate:'PRE1955_VIGIL_GUARD'});
must('31',{source_locator:'RG 80',non_negotiable_gate:'LOCAL_ORDINARY_AND_FOLLOWING_ACTION'});
must('32',{non_negotiable_gate:'PROCESSION_ACTION_EXPLICIT'});
must('43',{source_locator:'VII.4',non_negotiable_gate:'LOW_SUNG_SOLEMN_REQUIEM_BRANCH'});
const api=x.source_roles.find(s=>s.id==='VM-SSPXAPI');
assert.match(api.limitation,/source=gallia/);assert.match(api.limitation,/congregation=fsspx/);
assert.ok(x.hard_limits.some(s=>s.includes('pre-1955')));
const calc={references:x.source_roles.length,themes:x.topics.length,objects:x.objects.length,mapped:x.objects.filter(o=>o.topic_ids.length).length,links:x.objects.reduce((n,o)=>n+o.topic_ids.length,0),questions:x.question_routes.length,questionTopics:x.question_routes.filter(q=>q.topic_candidates.length).length};
assert.deepEqual(calc,{references:x.counts.source_references,themes:x.counts.subject_themes,objects:x.counts.physical_objects,mapped:x.counts.objects_with_one_or_more_routes,links:x.counts.topic_object_links,questions:x.counts.sanctuary_questions_indexed,questionTopics:x.counts.questions_with_candidate_topics});
console.log('Visible Mass 1962 source routes PASS',JSON.stringify(calc));
