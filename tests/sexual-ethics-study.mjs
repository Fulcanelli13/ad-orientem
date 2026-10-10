import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CSE_CANONICAL_FAMILIES,CSE_CANONICAL_DOSSIERS} from "../src/learn/sexual-ethics-data/canonical.js";
import {CSE_PUBLIC_QUESTIONS,CSE_PUBLIC_QUESTION_MAP} from "../src/learn/sexual-ethics-data/index.js";
import {sexualEthicsStudyIds,sexualEthicsStudyStep} from "../src/learn/sexual-ethics-study.js";
import {createSexualEthicsRuntime,SEXUAL_ETHICS_ROOT_ID} from "../src/learn/sexual-ethics.js";

assert.equal(CSE_CANONICAL_FAMILIES.length,7);
assert.equal(CSE_CANONICAL_DOSSIERS.length,50);
assert.equal(CSE_PUBLIC_QUESTIONS.length,147);
const familyIds=CSE_CANONICAL_FAMILIES.flatMap(f=>{
 const ids=sexualEthicsStudyIds("family",f.id);
 assert.ok(ids.length>0,f.id+" missing study questions");
 assert.deepEqual(ids,CSE_CANONICAL_DOSSIERS.filter(d=>d.family===f.id).flatMap(d=>d.questionIds).filter(id=>Boolean(CSE_PUBLIC_QUESTION_MAP[id])),f.id+" changed canonical ordering");
 return ids;
});
assert.equal(familyIds.length,147);
assert.equal(new Set(familyIds).size,147,"Study duplicates a canonical question");
assert.deepEqual(new Set(familyIds),new Set(CSE_PUBLIC_QUESTIONS.map(x=>x.id)));
for(const d of CSE_CANONICAL_DOSSIERS){
 const ids=sexualEthicsStudyIds("dossier",d.id);
 assert.ok(ids.length>0,d.id+" empty public study dossier");
 assert.deepEqual(ids,d.questionIds.filter(id=>Boolean(CSE_PUBLIC_QUESTION_MAP[id])));
}
for(const id of ["CSE055","CSE056","CSE058"])assert.ok(!familyIds.includes(id),"Archived question entered public study: "+id);
assert.deepEqual(sexualEthicsStudyIds("family","nonexistent"),[]);
assert.deepEqual(sexualEthicsStudyIds("dossier","nonexistent"),[]);
assert.deepEqual(sexualEthicsStudyIds("all","foundations"),[]);
assert.equal(sexualEthicsStudyStep("family","foundations","CSE149"),null);
const first=sexualEthicsStudyStep("family","foundations","CSE001");
assert.equal(first.index,0);assert.equal(first.previousId,null);
assert.equal(first.nextId,"CSE002");
const lastIds=sexualEthicsStudyIds("family","foundations");
const last=sexualEthicsStudyStep("family","foundations",lastIds.at(-1));
assert.equal(last.nextId,null);

function fakeWindow(lang="en"){
 const nodes=new Map();
 const doc={
  documentElement:{lang},
  body:{classList:{add(){},remove(){}},appendChild(node){nodes.set(node.id,node)},append(node){nodes.set(node.id,node)}},
  getElementById(id){return nodes.get(id)||null},
  createElement(){return {
   id:"",innerHTML:"",hidden:false,dataset:{},
   setAttribute(){},removeAttribute(){},addEventListener(){},
   querySelector(){return null},scrollTo(){},remove(){nodes.delete(this.id)}
  }}
 };
 return {document:doc,console:{error(){throw Error("Unexpected CSE error")}},nodes};
}
const win=fakeWindow(),reader=createSexualEthicsRuntime(win);
assert.equal(reader.open(),true);
const html=()=>win.nodes.get(SEXUAL_ETHICS_ROOT_ID)?.innerHTML||"";
assert.match(html(),/data-ao-cse-guide="study"/);
assert.equal(reader.openFamily("foundations"),true);
assert.match(html(),/data-ao-cse-study="family:foundations"/);
assert.equal(reader.startStudy("family","foundations"),true);
assert.equal(reader.status().questionId,"CSE001");
assert.equal(reader.status().study.total,lastIds.length);
assert.match(html(),/Question 1 of/);
assert.match(html(),/data-ao-cse-study-next/);
assert.match(html(),/data-ao-cse-study-prev/);
assert.equal(reader.advanceStudy(1),true);
assert.equal(reader.status().questionId,"CSE002");
assert.equal(reader.advanceStudy(-1),true);
assert.equal(reader.status().questionId,"CSE001");
assert.equal(reader.advanceStudy(-1),false);
assert.equal(reader.back(),true);
assert.equal(reader.status().view,"family");
assert.equal(reader.status().study,null);
assert.equal(reader.openDossier("SEX-CORE-16"),true);
assert.match(html(),/data-ao-cse-study="dossier:SEX-CORE-16"/);
assert.equal(reader.startStudy("dossier","SEX-CORE-16"),true);
assert.equal(reader.status().questionId,"CSE057");
assert.equal(reader.status().study.total,1);
assert.match(html(),/data-ao-cse-study-finish/);
assert.equal(reader.finishStudy(),true);
assert.equal(reader.status().view,"dossier");
assert.equal(reader.status().study,null);
assert.equal(reader.close(),true);
const fr=fakeWindow("fr"),readerFr=createSexualEthicsRuntime(fr);
assert.equal(readerFr.open(),true);
assert.equal(readerFr.startStudy("family","foundations"),true);
assert.match(fr.nodes.get(SEXUAL_ETHICS_ROOT_ID).innerHTML,/Question 1 sur/);
assert.match(fr.nodes.get(SEXUAL_ETHICS_ROOT_ID).innerHTML,/Étude guidée/);
const source=readFileSync("src/learn/sexual-ethics.js","utf8");
assert.match(source,/paragraphSourceLinks\(win,item,"answer"\)/,"Guided study lost paragraph sources");
assert.match(source,/sourceDetails\(win,item\)/,"Guided study lost original source access");
assert.doesNotMatch(source,/guidedStudyQuestions\s*=\s*\[/,"Study must reuse existing published Q&A, not define its own corpus");
console.log("PASS Sexual Ethics optional study: all 147 public questions in 7 canonical themes/50 dossiers; no archived Q&A; EN/FR and source preservation.");
