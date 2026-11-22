import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {createSharedQuestionRouter} from "../src/learn/living-church-shared-question-router.js";

const read=async(path)=>JSON.parse(await readFile(new URL("../"+path,import.meta.url),"utf8"));
const fixture=await read("data/learn/living-church-fresh-question-probes.v1.json");
const catalog=await read("data/learn/living-church-shared-question-routing-pilot.v1.json");
assert.equal(fixture.status,"READ_ONLY_PRECHANGE_OBSERVATION_DO_NOT_TUNE_AGAINST");
assert.equal(fixture.cases.length,52);
const api=createSharedQuestionRouter(catalog);
const stats={total:0,correctTopic:0,safeUnresolved:0,wrongSpecific:0,other:0};
for(const c of fixture.cases){
 const r=api.match(c.question,{language:c.language,currentCharacter:c.character});
 assert.equal(r.answerText,null);
 assert.notEqual(r.kind,"handoff_context");
 stats.total++;
 const chosen=r.topicId||null, offered=(r.options||[]).map(o=>o.topicId);
 const explicit=chosen===c.intendedTopic&&c.intendedTopic!==null;
 const clarifyMatch=r.kind==="clarify"&&(c.intendedTopic===null||offered.includes(c.intendedTopic));
 const safeAbstain=r.kind==="no_coverage"&&c.intendedTopic!==null&&!r.sourceRefs?.length;
 const correctUnknown=c.intendedTopic===null&&["no_coverage","clarify"].includes(r.kind);
 if(explicit||clarifyMatch||correctUnknown)stats.correctTopic++;
 else if(safeAbstain)stats.safeUnresolved++;
 else if(["offer_handoff","source_navigation"].includes(r.kind)&&chosen!==c.intendedTopic)stats.wrongSpecific++;
 else stats.other++;
 if(!explicit&&!clarifyMatch&&!correctUnknown)console.log("FRESH_PROBE_CASE "+JSON.stringify({question:c.question,expected:c.intendedTopic,actual:chosen,kind:r.kind,confirmed:r.requiresQuestionConfirmation??null,choices:offered}));
}
console.log("FRESH_PROBE_RESULT "+JSON.stringify({...stats,percentage:Number(stats.correctTopic/stats.total*100).toFixed(1),claim:"NONINDEPENDENT_HANDCRAFTED_UNTOUCHED_DIAGNOSTIC_NOT_REAL_WORLD_ACCURACY"}));
// Observational test, no numerical threshold. Do not tune against this named set.
