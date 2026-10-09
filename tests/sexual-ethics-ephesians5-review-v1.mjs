import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_MARRIAGE_AUTHORITY_DEBATES as cases,CSE_MARRIAGE_AUTHORITY_SOURCES as sources} from "../src/learn/sexual-ethics-data/marriage-authority-debates.js";
import {CSE_QUESTIONS,CSE_QUESTION_MAP,CSE_PUBLIC_QUESTIONS,CSE_SOURCE_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {CSE_DEBATE_FIELDS,CSE_DEBATE_MAP} from "../src/learn/sexual-ethics-data/debates.js";

const runtime=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.equal(CSE_QUESTIONS.length,150,"No new or missing canonical questions");
assert.equal(CSE_PUBLIC_QUESTIONS.length,147,"Three archived questions remain out of public navigation");
assert.deepEqual(cases.map(d=>d.id),["MAR-01","MAR-02","MAR-03","MAR-04","MAR-05","MAR-08"],"Marriage headship keeps only independently owned issues");
assert.equal(CSE_DEBATE_FIELDS.length,8,"Reuse the shared eight-stage debate model");
const owner=CSE_QUESTION_MAP.CSE045;
assert.match(owner.q[0],/headship and submission/);
assert.match(owner.q[1],/soumission/);
for(const id of ["MULIERIS","CASTI","SCRIPT_EPH5"])assert.ok(owner.refs.some(r=>r[0]===id));
assert.match(CSE_SOURCE_MAP.MULIERIS.canonical_url,/vatican.va.+mulieris-dignitatem.html$/);
assert.match(CSE_SOURCE_MAP.MULIERIS.canonical_url_fr,/\/fr\/apost_letters/);

const render=runtime.slice(runtime.indexOf("function marriageDisputationsHtml"),runtime.indexOf("function relatedMarriageQuestionsHtml"));
assert.match(render,/Object\.entries\(DEBATE_LABELS\)/,"Same headings and stages as every other debate");
assert.match(render,/aoCSEInlineRef/,"Same source-chip visual surface");
assert.match(render,/isFr\(win\)&&source\[2\]\?source\[2\]:source\[1\]/,"Official source links should follow selected language");
assert.doesNotMatch(render,/traditionalAssessment|rejoinder|finding|research-stage|methodological/);
assert.match(runtime,/function relatedMarriageQuestionsHtml/);
assert.match(runtime,/\["CSE032"/);
assert.match(runtime,/\["CSE054"/);
assert.match(runtime,/Object\.keys\(DEBATE_LABELS\)\.flatMap\(field=>d\[field\]\|\|\[\]\)/,"Full eight-stage search coverage");
assert.ok(CSE_QUESTION_MAP.CSE032&&CSE_QUESTION_MAP.CSE054);
assert.ok(CSE_DEBATE_MAP.CSE054,"Marital coercion keeps the existing standard debate owner");

for(const id of ["CASTI","ARCANUM","MULIERIS","HV","LIBERTAS","AL"]){
 assert.equal(sources[id].length,3,id+" must include EN and FR official original");
 assert.match(sources[id][1],/^https:\/\/www\.vatican\.va\//);
 assert.match(sources[id][2],/^https:\/\/www\.vatican\.va\//);
 assert.notEqual(sources[id][1],sources[id][2]);
}
assert.match(sources.AL[1],/_en\.pdf$/);
assert.match(sources.AL[2],/\/fr\/apost_exhortations/);
let stageCount=0;
for(const d of cases){
 assert.equal(d.question.length,2,d.id+" bilingual question");
 let wordsTotal=0;
 for(const field of CSE_DEBATE_FIELDS){
  assert.equal(d[field].length,2,d.id+" "+field+" bilingual");
  for(const [lang,passage] of d[field].entries()){
   const words=passage.trim().split(/\s+/).length;
   assert.ok(words>=7&&words<=70,d.id+" "+field+" "+lang+" lacks standard compactness");
   assert.doesNotMatch(passage,/this module|a specialist must|the answer must|méthodologiquement faible/i);
   if(!lang)wordsTotal+=words;
  }
  const refs=d.sources[field]||[];
  assert.ok(refs.length,d.id+" "+field+" has no documented source");
  for(const ref of refs)assert.ok(sources[ref]?.[1]?.startsWith("https://"),d.id+" "+field+" missing "+ref);
  stageCount++;
 }
 assert.ok(wordsTotal>=110&&wordsTotal<=240,d.id+" has an abnormal combined length");
 assert.equal(d.traditionalAssessment,undefined,"No ninth/special traditional-only stage");
 assert.ok(d.oppositionKind);
}
assert.equal(stageCount,48);
assert.ok(cases.find(d=>d.id==="MAR-01").bottom[0].includes("headship"));
assert.ok(cases.find(d=>d.id==="MAR-05").bottom[0].includes("divine law"));
assert.ok(cases.find(d=>d.id==="MAR-08").bottom[0].includes("freedom"));
assert.ok(!/approved by theologian|imprimatur granted/i.test(runtime));
console.log("PASS 150 questions, 55 principal debates, six canonical Ephesians headship subdebates/48 linked stages, two owner links, EN/FR and unified reader format.");
