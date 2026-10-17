import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Stage A reconciliation gate: source identity and publication status only.
 * No re-authored answer text, rubric, ritual sequence or photo geometry.
 */
const root="previews/visible-mass-3d/";
const read=file=>JSON.parse(fs.readFileSync(file,"utf8"));
const pilot=read(root+"PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json");
const historical=read(root+"HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json");
const functional=read(root+"HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json");
const liturgy=read(root+"LITURGICAL_EXPLANATIONS_P1_5_FIRST20_20261017.v1.json");
const routes=read(root+"LITURGICAL_SOURCE_TO_SUBJECT_CROSSWALK_20261017.v1.json");

assert.equal(pilot.status,"RESEARCH_ONLY_NO_PUBLICATION");
assert.equal(pilot.objects.length,30);
assert.equal(pilot.questions.length,134);
assert.equal(new Set(pilot.questions.map(x=>x.id)).size,134);
assert.equal(routes.objects.length,170);
assert.equal(routes.topics.length,44);
assert.equal(routes.counts.objects_with_one_or_more_routes,109);
assert.equal(routes.status,"RESEARCH_CANDIDATE_NO_RUBRIC_OR_CONTENT_CERTIFICATION");

assert.equal(historical.answers.length,28);
assert.equal(functional.answers.length,69);
const answerRecords=[...historical.answers,...functional.answers];
const answerIds=answerRecords.map(a=>a.question_id);
const questionsById=new Map(pilot.questions.map(q=>[q.id,q]));
assert.equal(answerRecords.length,97);
assert.equal(new Set(answerIds).size,97,"historical+functional research answers must not collide");
assert.ok(answerIds.every(id=>questionsById.has(id)),"all researched answers must resolve to original VMQ IDs");
assert.ok(answerRecords.every(a=>a.status==="RESEARCH_DRAFT_EXACT_QUESTION_NOT_PUBLICATION_CERTIFIED"));
assert.equal(historical.status,"HISTORICAL_SOURCES_CHECKED_RESEARCH_DRAFT_NOT_LITURGICAL_APPROVAL");
assert.equal(functional.status,"SECONDARY_SOURCES_INSPECTED_RESEARCH_DRAFT_NOT_RITE_CERTIFICATION");

const expected={
 AL01:{glossary:"G404",match:"D",answers:5,total:6},
 AL06:{glossary:"G079",match:"R",answers:3,total:4},
 AL07:{glossary:"G079",match:"R",answers:4,total:6},
 AL19:{glossary:"G418",match:"D",answers:2,total:4},
 SN02:{glossary:"G186",match:"D",answers:4,total:6},
 SN04:{glossary:"G181",match:"R",answers:3,total:4}
};
const objectMap=new Map(pilot.objects.map(o=>[o.object_id,o]));
const answered=new Set(answerIds);
let total=0,researched=0;
for(const [id,e] of Object.entries(expected)){
 const o=objectMap.get(id);
 assert.ok(o,"pilot hotspot object vanished: "+id);
 assert.equal(o.glossary_id,e.glossary);
 assert.equal(o.glossary_match,e.match);
 assert.equal(o.question_ids.length,e.total);
 assert.ok(o.question_ids.every(q=>questionsById.get(q)?.primary_object_id===id),
   "question owner changed for "+id);
 const yes=o.question_ids.filter(q=>answered.has(q)).length;
 assert.equal(yes,e.answers,"draft answer census changed for "+id);
 total+=e.total;researched+=yes;
}
assert.equal(total,30);
assert.equal(researched,21);
assert.equal(Object.values(expected).filter(x=>x.match==="D").length,3);
assert.equal(Object.values(expected).filter(x=>x.match==="R").length,3);

assert.equal(liturgy.answers.length,20);
assert.equal(liturgy.status,"SOURCE_CHECKED_RESEARCH_PREVIEW_EDITORIAL_APPROVAL_PENDING");
assert.ok(liturgy.answers.every(a=>a.status==="SOURCE_CHECKED_RESEARCH_PREVIEW_EDITORIAL_APPROVAL_PENDING"));
assert.ok(liturgy.answers.every(a=>!answered.has(a.id)&&!questionsById.has(a.id)),
  "separately indexed VMLQ topic explanations cannot be added to VMQ answer total");
console.log("PASS Stage A: 170 subjects / 134 source questions / 97 unique draft answers; six exact hotspots 21 of 30 draft answers; 20 separate held liturgical topics; no publication or source replacement.");
