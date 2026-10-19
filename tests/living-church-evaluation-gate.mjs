import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {validateLivingChurchEvaluation,scoreLivingChurchDecisions} from "../src/learn/living-church-evaluation-gate.js";
const catalog=JSON.parse(await readFile(new URL("../data/learn/living-church-shared-question-routing-pilot.v1.json",import.meta.url),"utf8"));
const synthetic={schema:"AO_LC_PRIVATE_VISITOR_EVALUATION_V1",questions:[
 {id:"T-001",language:"en",question:"Why does that incense burner move before the priest arrives?",
  origin:"SYNTHETIC_TEST_ONLY",consentForPrivateResearch:false,dataMinimized:true,
  independentAnnotations:[
   {reviewerId:"A",action:"route",topicIds:["objects.glossary_g194"]},
   {reviewerId:"B",action:"route",topicIds:["objects.glossary_g194"]}],
  adjudicated:{action:"route",topicIds:["objects.glossary_g194"]}},
 {id:"T-002",language:"fr",question:"Je voulais comprendre ce qui se déroule lors du mouvement de l'hostie vers le haut.",
  origin:"SYNTHETIC_TEST_ONLY",consentForPrivateResearch:false,dataMinimized:true,
  independentAnnotations:[
   {reviewerId:"A",action:"clarify",topicIds:["mass.elevation","faith.real_presence"]},
   {reviewerId:"B",action:"clarify",topicIds:["mass.elevation","faith.real_presence"]}],
  adjudicated:{action:"clarify",topicIds:["mass.elevation","faith.real_presence"]}}
]};
const valid=validateLivingChurchEvaluation(synthetic,{catalog,testOnly:true});
assert.deepEqual(valid.issueCodes,[]);
assert.equal(valid.eligibleForIndependentQualityReport,false);
assert.equal(valid.counts.total,2);
assert.equal(valid.counts.en,1);
assert.equal(valid.counts.fr,1);
assert.equal(valid.neverPublishRawVisitorQuestions,true);
const scored=scoreLivingChurchDecisions(synthetic.questions,[
 {kind:"offer_handoff",topicId:"objects.glossary_g194",answerText:null},
 {kind:"clarify",options:[{topicId:"mass.elevation"},{topicId:"faith.real_presence"}],answerText:null}
]);
assert.deepEqual(scored,{total:2,correct:2,wrongSpecific:0,unresolved:0,wrongClarification:0});
const badLeak=structuredClone(synthetic);
badLeak.questions[0].question="what happens to the bread at mass";
assert.ok(validateLivingChurchEvaluation(badLeak,{catalog,testOnly:true}).issueCodes.includes("TRAIN_TEST_LEAK_AT_0"));
const badPrivate=structuredClone(synthetic);
badPrivate.questions[0].question="My email is patron@example.org";
assert.ok(validateLivingChurchEvaluation(badPrivate,{catalog,testOnly:true}).issueCodes.includes("UNREDACTED_PRIVATE_DATA_AT_0"));
const badReview=structuredClone(synthetic);
badReview.questions[0].independentAnnotations[1].reviewerId="A";
assert.ok(validateLivingChurchEvaluation(badReview,{catalog,testOnly:true}).issueCodes.includes("SAME_REVIEWER_AT_0"));
const fakeReal=structuredClone(synthetic);
fakeReal.questions.forEach(x=>x.origin="REAL_VISITOR_OPT_IN");
assert.ok(validateLivingChurchEvaluation(fakeReal,{catalog}).issueCodes.some(x=>x.startsWith("CONSENT")));
assert.throws(()=>scoreLivingChurchDecisions(synthetic.questions,[
 {kind:"source_navigation",topicId:"objects.glossary_g194",answerText:"Invented authorial answer"},
 {kind:"clarify",options:[],answerText:null}
]),/No authorial answers/);
console.log("PASS visitor evaluation gate: no fake independent scores, exact-variant leakage, consent, data-minimization and dual-review controls");
