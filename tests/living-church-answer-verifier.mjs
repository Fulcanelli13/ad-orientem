import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {loadCanonGroundedAnswers} from "../previews/visible-mass-3d/living-church-grounded-answer.mjs";
import {verifyCanonAnswer} from "../previews/visible-mass-3d/living-church-answer-verifier.mjs";
const fetchImpl=async u=>({ok:true,json:async()=>JSON.parse(await readFile(u,"utf8"))});
const owner=await loadCanonGroundedAnswers({fetchImpl});
const a=await owner.answer("Does the Mass sacrifice Jesus again?");
const f=await owner.answer("Why is the Roman Canon silent?");
for(const actual of [a,f]){
 assert.equal(actual.ok,true);
 const result=verifyCanonAnswer(actual,actual);
 assert.equal(result.ok,true);
 assert.equal(result.inferenceUsed,false);
 assert.equal(result.evidenceOwner,actual.owner);
 const changed={...actual,text:actual.text+" This is another unsupported doctrinal claim."};
 assert.equal(verifyCanonAnswer(changed,actual).ok,false);
 assert.equal(verifyCanonAnswer({...actual,owner:"The Canon"},actual).ok,false);
 assert.equal(verifyCanonAnswer({...actual,id:"MF02-C02"},actual).ok,false);
 assert.equal(verifyCanonAnswer({...actual,citations:[...actual.citations,{label:"Fake",url:"https://example.org"}]},actual).ok,false);
 assert.equal(verifyCanonAnswer({...actual,citations:actual.citations.map((c,i)=>i===0?{...c,url:"https://example.org/invented"}:c)},actual).ok,false);
 assert.equal(verifyCanonAnswer({...actual,citations:actual.citations.map((c,i)=>i===0?{...c,locator:"precise quotation, page 17"}:c)},actual).ok,false);
 assert.equal(verifyCanonAnswer({...actual,mode:"GENERATIVE_SUPPORTED"},actual).ok,false);
}
assert.equal(verifyCanonAnswer({...f,citationPrecision:"PRECISE_PRIMARY_WITNESS"},f).ok,false);
const hallucination={...a,text:"St Pius X personally says that this is certain",mode:"VERBATIM_APPROVED_SOURCE"};
assert.equal(verifyCanonAnswer(hallucination,a).ok,false);
assert.equal(verifyCanonAnswer({ok:false},a).ok,false);
console.log("PASS P8 answer-gate denies new wording, forged citations, false witness precision and impersonation");
