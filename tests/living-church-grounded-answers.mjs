import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {loadCanonGroundedAnswers} from "../previews/visible-mass-3d/living-church-grounded-answer.mjs";
// Load current source-owned manifest bytes, not a duplicated answer fixture.
const fetchImpl=async url=>({
 ok:true,json:async()=>JSON.parse(await readFile(url,"utf8"))
});
const pilot=await loadCanonGroundedAnswers({fetchImpl,lang:"en"});
assert.deepEqual(pilot.status().eligibleIds,["apostolate:AQ05","apostolate:AQ04"]);
assert.equal(pilot.status().hasLLM,false);
assert.equal(pilot.status().massExplorerStudiesPublished,false);
assert.equal(pilot.status().massFormationPassagesPublished,false);
assert.equal(pilot.status().formationP1.claimCount,24);
assert.equal(pilot.status().formationP1.stageCount,8);
let a=await pilot.answer("Does the Mass sacrifice Jesus again?");
assert.equal(a.ok,true);
assert.equal(a.mode,"VERBATIM_APPROVED_SOURCE");
assert.equal(a.id,"apostolate:AQ04");
assert.equal(a.owner,"Apostolate");
assert.match(a.text,/Calvary.*one sacrifice/i);
assert.ok(a.citations.some(x=>/Trent/.test(x.label)));
assert.ok(a.citations.every(x=>new URL(x.url).protocol==="https:"));
let follow=await pilot.answer("Why?");
assert.equal(follow.ok,true);
assert.equal(follow.id,"apostolate:AQ04");
assert.match(follow.text,/Trent|Calvary/i);
assert.notEqual(follow.text,a.text);
a=await pilot.answer("How can bread really become Jesus?");
assert.equal(a.ok,true);
assert.equal(a.id,"apostolate:AQ05");
assert.match(a.text,/transubstantiation/);
follow=await pilot.answer("Why?");
assert.equal(follow.ok,true);
assert.equal(follow.id,"apostolate:AQ05");
assert.match(follow.text,/Trent/);
const formation=await pilot.answer("Why is the Roman Canon silent?");
assert.equal(formation.ok,true);
assert.equal(formation.id,"MF04-C01");
assert.equal(formation.mode,"EXACT_PUBLISHED_FORMATION_P1_CLAIM");
assert.equal(formation.owner,"Formation");
assert.ok(formation.citations.every(c=>c.locator.includes("Document-level reference")));
for(const question of [
 "Why is the Mass called a sacrifice?",
 "What is the secret prayer after the Offertory?",
 "Does the Mass repeat Calvary and how does bread become Christ?",
 "I confess a very private personal sin",
 "Tell me how many acolytes are needed for a solemn Mass",
 "a"
]){
 const out=await pilot.answer(question);
 assert.equal(out.ok,false,"unsupported/compound question must fail closed: "+question);
 assert.equal(out.citations.length,0);
}
assert.equal((await pilot.answer("Why?")).ok,false,"unsupported question must reset old grounded follow-up");
assert.equal((await pilot.answer("How can bread become Jesus?",{guide:"pius-x"})).ok,false);
pilot.clear();assert.equal((await pilot.answer("Why?")).ok,false);
// Tampered or newly released editorial study manifests are NOT accepted by this pilot.
const badFetch=async url=>({ok:true,json:async()=>{
 const obj=JSON.parse(await readFile(url,"utf8"));
 if(obj.schema==="ao-mass-explorer-study-publication-v1")obj.status="RELEASED_FOR_MASS_EXPLORER";
 return obj;
}});
await assert.rejects(loadCanonGroundedAnswers({fetchImpl:badFetch}),/review required/);
const fr=await loadCanonGroundedAnswers({fetchImpl,lang:"fr"});
const f=await fr.answer("La Messe sacrifie-t-elle Jésus une nouvelle fois ?");
assert.equal(f.ok,true);
assert.equal(f.id,"apostolate:AQ04");
assert.match(f.text,/Calvaire/);
const f2=await fr.answer("Pourquoi?");
assert.equal(f2.ok,true);
assert.match(f2.text,/Trente/);
console.log("PASS canonical P7 question retrieval, bilingual source excerpts, citations, insufficiency, tampered-release refusal");
