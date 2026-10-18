import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createOriginalCatechismReferralIndex} from "../src/learn/living-church-catechism-source.js";
import {resolvePiusXReviewTopics,PIUS_X_REVIEW_TOPICS,PIUS_X_STUDY_TOPIC_REFERRALS_VERSION}
 from "../src/learn/living-church-pius-study-topics.js";
const witness=JSON.parse(readFileSync("data/learn/ltfaith-pius-x-en-witness-index.v1.json","utf8"));
const original=createOriginalCatechismReferralIndex(witness);
assert.equal(PIUS_X_STUDY_TOPIC_REFERRALS_VERSION,"AO_PX_REVIEW_TOPICS_V1");
const ids=[
 ["PX-STYL-OUR-LADY-01",[433,430,431,432],"explore","ideas"],
 ["PX-STYL-CHILD-CATECHISM-02",[342,338,335],"prepare","first_communion"],
 ["PX-STYL-TEACHING-OBJECTION-03",[114,115,236],"defend","critic"]
];
assert.equal(PIUS_X_REVIEW_TOPICS.length,3);
let allRefs=[];
for(const lang of ["en","fr"]){
 const topics=resolvePiusXReviewTopics(original,{language:lang,firstCommunionContext:true});
 assert.equal(topics.length,3);
 topics.forEach((topic,i)=>{
  const [id,expected,objective,branch]=ids[i];
  assert.equal(topic.id,id);
  assert.deepEqual(topic.questions.map(x=>x.number),expected);
  assert.equal(topic.objective,objective);assert.equal(topic.branch,branch);
  assert.equal(topic.language,lang);
  assert.equal(topic.enabled,true);
  assert.equal(topic.publication,"REVIEW_ONLY_ORIGINAL_INDEX_REFERENCES");
  assert.equal(topic.historicalSpeech,false);
  assert.equal(topic.originalAnswersCopied,false);
  assert.ok(topic.title.length>=15);
  topic.questions.forEach(q=>{
   assert.equal(q.ref,"PX1912-Q"+String(q.number).padStart(3,"0"));
   assert.equal(q.stem,original.get(q.number).stem);
   assert.equal("answer" in q,false);
   assert.equal("translation" in q,false);
   allRefs.push(q.ref);
  });
 });
 const noContext=resolvePiusXReviewTopics(original,{language:lang});
 assert.equal(noContext[1].enabled,false,"First Communion must be explicitly contextualized");
 assert.equal(noContext[0].enabled,true);
 assert.equal(noContext[2].enabled,true);
 const historical=topics[1].questions.find(q=>q.ref==="PX1912-Q335");
 assert.equal(historical.historicalDiscipline,true);
 assert.match(historical.warning,lang==="fr"?/non la règle catholique actuelle/:/not today's Catholic fasting rule/);
 assert.equal(topics.flatMap(t=>t.questions).filter(x=>x.historicalDiscipline).length,1);
}
assert.deepEqual([...new Set(allRefs)].sort(),["PX1912-Q114","PX1912-Q115","PX1912-Q236","PX1912-Q335","PX1912-Q338","PX1912-Q342","PX1912-Q430","PX1912-Q431","PX1912-Q432","PX1912-Q433"].sort());
assert.throws(()=>resolvePiusXReviewTopics(null),/original witness index/);
assert.throws(()=>resolvePiusXReviewTopics({...original,get:n=>n===433?null:original.get(n)}),/Original source index missing/);
const fs=readFileSync("src/learn/living-church-character-folio.js","utf8");
assert.match(fs,/resolvePiusXReviewTopics/);
assert.match(fs,/dataset\.piusTopic/);
assert.match(fs,/dataset\.piusContextConfirm/);
assert.match(fs,/dataset\.piusRef/);
assert.match(fs,/integration\.nativeOpen\("learn\.catechism",\{sourceRef:question\.ref\}\)/);
assert.ok(!fs.includes("PX1912-Q433"),"No duplicate source IDs embedded in the UI runtime");
console.log("PASS 3 bilingual St Pius X original-source topic menus, 10 unique indexed questions, First Communion context and historical discipline safeguards; zero copied Catechism answers.");
