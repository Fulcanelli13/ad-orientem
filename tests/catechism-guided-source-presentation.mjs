import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildCatechismGuidedStudy,guidedStudyReleaseApproved} from "../src/learn/catechism-guided-study.js";
import {renderCatechismGuidedStudy} from "../src/learn/catechism-guided-reader.js";
import {sourceReferenceSafeUrl} from "../src/learn/source-reference-panel.js";

const read=filename=>JSON.parse(readFileSync("data/learn/"+filename,"utf8"));
const inputs={
 crosswalk:read("learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json"),
 first:read("learn-the-faith-certification-001-018.v1.json"),
 second:read("learn-the-faith-certification-019-054.v1.json"),
 witnessIndex:read("ltfaith-pius-x-en-witness-index.v1.json"),
 frenchIndex:read("ltfaith-pius-x-fr-1913-scan-page-candidates.v1.json")
};
assert.equal(inputs.frenchIndex.entries.length,433);
const counts={};
for(const row of inputs.frenchIndex.entries)counts[row.status]=(counts[row.status]||0)+1;
assert.equal(counts.VISUALLY_CONFIRMED_ORIGINAL_FRENCH_1913_PRINT_QA,70);
assert.equal(counts.OCR_NUMBER_HEADING_CANDIDATE_NOT_VISUALLY_VERIFIED,363);
assert.equal(inputs.frenchIndex.publicationApproved,false);
assert.equal(guidedStudyReleaseApproved(inputs.crosswalk),false,
 "Source presentation must not lift the guided-study publication gate");

const study=buildCatechismGuidedStudy(inputs.crosswalk,inputs.first,inputs.second,inputs.witnessIndex,{preview:true});
assert.equal(study.lessons.length,55);
const fakeRoot=()=>({
 innerHTML:"",
 ownerDocument:{},
 parentElement:{scrollTop:70},
 replaceChildren(){this.innerHTML="";},
 querySelector(){return null;},
 querySelectorAll(){return [];}
});
const output=[];
for(const language of ["en","fr"]){
 const root=fakeRoot();
 const app=renderCatechismGuidedStudy(root,inputs,{preview:true,language,questionNumber:1});
 assert.equal(app.rendered,true);
 assert.equal(app.previewOnly,true);
 assert.equal(root.parentElement.scrollTop,0);
 assert.match(root.innerHTML,/aoCatechismGuidedDraft/,
  "Unreleased guided study lost its editorial preview indicator");
 assert.match(root.innerHTML,/class="aoCatechismGuidedEvidence"/);
 assert.doesNotMatch(root.innerHTML,/class="aoCatechismGuidedEvidence" open/,
  "Source disclosures must start folded");
 const pending=language==="fr"?"FR 1913 · repère provisoire":"FR 1913 · locator provisional";
 assert.ok(root.innerHTML.includes(pending),
  language+" did not visibly distinguish original 1913 provisional page locator");
 assert.ok(root.innerHTML.includes('data-ao-cate-source-review="provisional"'));
 assert.ok(root.innerHTML.includes(language==="fr"?
  "page provisoire non collationnée":"provisional page locator"));
 assert.ok(root.innerHTML.includes("IT 1912")||root.innerHTML.includes("PX1912-Q"),
  language+" lost original 1912 edition or question witness");
 const verified=inputs.frenchIndex.entries.find(row=>
   row.status==="VISUALLY_CONFIRMED_ORIGINAL_FRENCH_1913_PRINT_QA"
   && Boolean(study.questionToLesson["PX1912-Q"+String(row.q).padStart(3,"0")]));
 assert.ok(verified,"A previously confirmed 1913 page must remain addressable by a guided lesson");
 assert.equal(app.openQuestion(verified.q),true);
 const checked=language==="fr"?"FR 1913 · réponse vérifiée":"FR 1913 · answer checked";
 assert.ok(root.innerHTML.includes(checked),
  language+" obscured existing visually confirmed original French answer");
 assert.ok(root.innerHTML.includes('data-ao-cate-source-review="visually-checked"'));
 assert.ok(root.innerHTML.includes(language==="fr"?
  "réponse contrôlée visuellement":"answer visually checked"));
 assert.ok(root.innerHTML.includes('target="_blank" rel="noopener noreferrer"'),
  "Safe new-tab citation controls lost");
 assert.doesNotMatch(root.innerHTML,/\bhref="(?:http:|javascript:|data:)/i);
 app.destroy();
 assert.equal(root.innerHTML,"","Guided reader teardown must clear the DOM");
 output.push({language,provisionalLocator:"VISIBLE_AND_LABELED",
  confirmedAnswer:"VISIBLE_AND_LABELED",pageReviewGate:"UNCHANGED"});
}
for(const uri of ["javascript:alert(1)","http://example.org","https://name:password@example.org"]){
 assert.equal(sourceReferenceSafeUrl(uri),"");
}
console.log(JSON.stringify({status:"PASS_CATECHISM_SOURCE_PRESENTATION",
   historicalFrench1913:{confirmed:70,provisional:363},languages:output,
   claimVerificationsPerformed:0,publicationApproved:false},null,2));
