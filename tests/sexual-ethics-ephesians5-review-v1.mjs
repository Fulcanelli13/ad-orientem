import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_MARRIAGE_AUTHORITY_DEBATES as cases,CSE_MARRIAGE_AUTHORITY_SOURCES as sources} from "../src/learn/sexual-ethics-data/marriage-authority-debates.js";
import {CSE_QUESTIONS,CSE_QUESTION_MAP,CSE_PUBLIC_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
const runtime=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.equal(CSE_QUESTIONS.length,150,"No extra duplicate public question");
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
assert.equal(cases.length,8);
assert.deepEqual(cases.map(d=>d.id),Array.from({length:8},(_,i)=>"MAR-0"+(i+1)));
const owner=CSE_QUESTION_MAP.CSE045;
assert.match(owner.q[0],/headship and submission/);
assert.match(owner.q[1],/soumission/);
assert.match(owner.a[0],/primacy/);
assert.match(owner.a[1],/primauté/);
assert.ok(owner.refs.some(([id,loc])=>id==="MULIERIS"&&loc==="§24"));
assert.ok(owner.refs.some(([id])=>id==="CASTI"));
assert.ok(owner.refs.some(([id])=>id==="SCRIPT_EPH5"));
assert.ok(owner.refs.some(([id,loc])=>id==="CIC"&&loc.includes("1135")));
assert.match(CSE_SOURCE_MAP.MULIERIS.canonical_url,/vatican.va.+mulieris-dignitatem.html$/);
assert.match(CSE_SOURCE_MAP.MULIERIS.canonical_url_fr,/\/fr\/apost_letters/);
assert.match(runtime,/function marriageDisputationsHtml/);
assert.match(runtime,/\.\.\.d\.traditionalAssessment/,"Traditional Catholic responses must be searchable");
assert.match(runtime,/isFr\(win\)&&source\[2\]\?source\[2\]:source\[1\]/,"Sources must honor selected language");
for(const id of ["CASTI","ARCANUM","MULIERIS","HV","LIBERTAS","AL"]){
 assert.equal(sources[id].length,3,id+" missing language-selectable official originals");
 assert.match(sources[id][1],/^https:\/\/www\.vatican\.va\//);
 assert.match(sources[id][2],/^https:\/\/www\.vatican\.va\//);
 assert.notEqual(sources[id][1],sources[id][2]);
}
assert.match(sources.AL[1],/_en\.pdf$/);
assert.match(sources.AL[2],/\/fr\/apost_exhortations/);
let citationFields=0;
for(const d of cases){
 for(const field of ["question","opposition","reply","rejoinder","finding","traditionalAssessment"]){
  assert.equal(d[field].length,2,d.id+" "+field+" not bilingual");
  assert.ok(d[field].every(x=>x.length>(field==="question"?18:75)),d.id+" "+field+" unusually short");
 }
 for(const field of ["opposition","reply","rejoinder","finding","traditionalAssessment"]){
  const refs=d.sources[field];
  assert.ok(refs.length>0,d.id+" "+field+" missing citations");
  for(const id of refs)assert.ok(sources[id]&&/^https:\/\//.test(sources[id][1]),d.id+" "+field+" broken ref "+id);
  citationFields++;
 }
 assert.ok(d.oppositionKind);
}
assert.equal(citationFields,40);
assert.equal(cases[6].oppositionKind,"REASONED_APPLICATION_NOT_NAMED_OPPONENT");
assert.ok(!cases[6].sources.opposition.includes("GROOTHUIS"));
assert.ok(cases[3].opposition[0].includes("Groothuis"));
assert.match(cases[3].traditionalAssessment[0],/not equivalent to an automatic deciding vote/);
assert.match(cases[4].traditionalAssessment[0],/cannot require sin/);
assert.match(cases[5].traditionalAssessment[0],/not a legitimate way of obtaining a marital act/);
assert.match(cases[7].traditionalAssessment[0],/conscience/);
assert.ok(!/approved by theologian|imprimatur granted/i.test(runtime));
console.log("PASS CSE045 eight original-linked bilingual submission debates and 40 paragraph citation fields, searchable assessments, EN/FR primary links, and source-limited theological boundaries");
