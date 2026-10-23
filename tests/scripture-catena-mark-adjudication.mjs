import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCatenaMarkEditorial,validateCatenaMarkAdjudication,findCatenaMarkResearchQuestion}
 from "../src/scripture/catena-mark-editorial.js";
import {indexCatenaMessages,retrieveCatenaQuestionMatches}
 from "../src/scripture/catena-messenger.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const cross=read("data/scripture/catena/editorial-mark-original-work-crosswalk.v1.json");
const dossier=read("data/scripture/catena/editorial-mark-ai-adjudication.v1.json");
const reg=validateCatenaMarkEditorial(cross),ai=validateCatenaMarkAdjudication(dossier,reg);
const pack=read("data/scripture/catena/mark.json");
const pericopes=new Map(pack.pericopes.map(p=>[p.id,p]));
let exactNavigatorHits=0,nativeTopFour=0,nativeFirst=0,negativeExactAbstentions=0,negativeNativeRelated=0,nativeWithoutEvidence=0;
const misses=[];
for(const row of dossier.rows){
 const original=pericopes.get(row.sourcePointer.split(":")[0]);
 assert.ok(original,"missing original pericope");
 const source=original.segments[Number(row.sourcePointer.split(":")[1])];
 assert.equal(source.father,row.inheritedFatherLabel);
 assert.equal(source.text.length,row.sourceCharLength);
 const result=findCatenaMarkResearchQuestion(reg,row.editorialQuestion);
 assert.equal(result?.sourcePointer,row.sourcePointer);
 assert.equal(result.publicationEligibility,"blocked_research_only");
 exactNavigatorHits++;
 const indexed=indexCatenaMessages([{
  id:original.id,citation:original.citation,
  source:{url:original.source_url},segments:original.segments
 }]);
 const n=retrieveCatenaQuestionMatches(indexed,row.editorialQuestion,{limit:4});
 for(const x of n){
  const canonical=indexed.find(y=>y.id===x.id);
  assert.ok(canonical,"No synthetic source can be introduced by lexical retrieval");
  assert.equal(x.text,canonical.text);
  assert.equal(x.father,canonical.father);
  assert.equal(x.sourceUrl,canonical.sourceUrl);
 }
 if(n.some(x=>x.id===row.sourcePointer)){nativeTopFour++;
  if(n[0]?.id===row.sourcePointer)nativeFirst++;
 }else misses.push(row.sourcePointer);
}
for(const n of ai.negatives){
 assert.equal(findCatenaMarkResearchQuestion(reg,n.question),null,
   "Unreviewed adversarial wording must abstain in exact Mark research navigation");
 negativeExactAbstentions++;
 const original=pericopes.get(n.pericopeId);
 assert.ok(original);
 const indexed=indexCatenaMessages([{
  id:original.id,citation:original.citation,source:{url:original.source_url},
  segments:original.segments
 }]);
 const matched=retrieveCatenaQuestionMatches(indexed,n.question,{limit:4});
 if(matched.length)negativeNativeRelated++;
 for(const x of matched){
  const canonical=indexed.find(y=>y.id===x.id);
  assert.ok(canonical,"Lexical native source must remain canonical even for adversarial input");
  assert.equal(x.text,canonical.text);
  assert.equal(x.father,canonical.father);
  if(!x.sourceMatchEvidence&&!x.relatedSourceEvidence)nativeWithoutEvidence++;
  // Unanchored lexical matches are measured for editorial review, not
  // automatically upgraded to direct theological answers or release approval.
 }
}
assert.equal(exactNavigatorHits,10);
assert.equal(negativeExactAbstentions,13);
assert.equal(dossier.counts.publicationApprovals,0);
assert.equal(ai.byPointer.get("catena.mark.16.14:3").contextualGradeAIAssessment,2);
assert.equal(ai.byPointer.get("catena.mark.14.17:2").contextualGradeAIAssessment,2);
const edited={...dossier,counts:{...dossier.counts,publicationApprovals:1}};
assert.throws(()=>validateCatenaMarkAdjudication(edited,reg),/CATENA_MARK_ADJUDICATION_INVALID/);
assert.throws(()=>validateCatenaMarkAdjudication({...dossier,rows:dossier.rows.map((r,i)=>
 i===0?{...r,adjudicatedByHuman:true}:r)},reg),/CATENA_MARK_ADJUDICATION_RECORD_INVALID/);
const reader=readFileSync("src/scripture/catena-reader-questions.js","utf8");
for(const row of dossier.rows)assert.ok(!reader.includes('"sourcePointer": "'+row.sourcePointer+'"'),
 "None of the ten Mark AI-only pilot questions is a public curated route");
console.log("Mark pilot, exact research navigation: "+exactNavigatorHits+"/10 exact canonical pointers.");
console.log("Mark pilot, native lexical search: target in first four "+nativeTopFour+"/10; first "+nativeFirst+"/10. Missing: "+(misses.join(", ")||"none"));
console.log("Mark pilot, adversarial exact navigation abstains: "+negativeExactAbstentions+"/13; native lexical yields at least one canonical snippet for "+negativeNativeRelated+"/13; unanchored snippet count "+nativeWithoutEvidence+" (NOT certified direct answers).");
console.log("PASS Mark adjudication diagnostic: canonical words only, distinct retrieval metrics, all 13 unapproved questions refused by exact pilot, 0 publication approvals");
