import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve, dirname} from "node:path";
import {fileURLToPath} from "node:url";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const get=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const p0=get("data/explore/historia-salutis-p0-master-crosswalk.v1.json");
const p1=get("data/explore/historia-salutis-p1-person-story-scripture-links.v1.json");
const p2=get("data/explore/historia-salutis-p2-covenant-character-source-queue.v1.json");
assert.equal(p2.schema,"AO_HISTORIA_SALUTIS_P2_COVENANT_CHARACTER_SOURCE_QUEUE_V1");
assert.equal(p2.status,"RESEARCH_ONLY_VERSE_PRESENCE_NOT_TEXT_CERTIFICATION");
assert.equal(p2.policy.noNewCanonicalEvents,true);
assert.equal(p2.policy.storyCandidateNotAcceptedCatholicAuthorNarrative,true);
assert.equal(p2.policy.noAiAuthoredBiblicalProse,true);
assert.equal(p2.policy.deuterocanonicalBooksRetained,true);
assert.equal(p2.policy.matthewAndLukeUnmerged,true);
assert.equal(p2.counts.canonicalEventsStill151,151);
assert.equal(p2.counts.existingDonorStoryGroups,p1.donorStoryResearchCrosswalk.length);
assert.equal(p2.counts.existingDonorStoryGroups,39);
assert.equal(p2.counts.additionalCharacterStoryTopics,44);
assert.equal(p2.proposedCharacterStoryCoverage.length,44);
assert.equal(p2.covenantScripturalCrossReferences.length,12);
const keys=new Set(p0.eventCrosswalk.map(e=>e.eventKey));
const arcs=new Set(p0.narrativeArcs.map(a=>a.id));
const expected=new Map(p0.eventCrosswalk.map(e=>[e.reference,e.eventKey]));
const covenantIds=new Set(p0.covenantPromiseStages.map(c=>c.id));
const sources=new Map();
const allRefs=[];
const verify=r=>{
 assert.match(r.reference,/^[123]?[A-Za-z]+ \d+:\d+–\d+$/);
 assert.equal(r.textAuthorizedForPublication,false);
 assert.equal(r.witnessStatus,"UNCOLLATED_SOURCE_WITNESS");
 assert.equal(r.witnessPath,`data/scripture/witness/crampon-1923/${r.book}.json`);
 assert.equal(r.exactAtlasEventKey,expected.get(r.reference)||null,`Exact Atlas identity for ${r.reference}`);
 if(r.exactAtlasEventKey)assert.ok(keys.has(r.exactAtlasEventKey));
 let witness=sources.get(r.witnessPath);
 if(!witness){
  witness=get(r.witnessPath);
  sources.set(r.witnessPath,witness);
 }
 assert.equal(witness.editionId,"crampon-1923");
 assert.equal(witness.sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
 const available=new Set(witness.verses.filter(v=>v[0]===r.chapter&&v[1]>=r.verseStart&&v[1]<=r.verseEnd).map(v=>v[1]));
 assert.ok(r.verseEnd>=r.verseStart && r.verseEnd-r.verseStart<120,`Invalid verse range ${r.reference}`);
 for(let n=r.verseStart;n<=r.verseEnd;n++)assert.ok(available.has(n),`Missing ${r.book} ${r.chapter}:${n}`);
 allRefs.push(r);
};
for(const [i,s] of p2.proposedCharacterStoryCoverage.entries()){
 assert.equal(s.order,i+1);
 assert.ok(arcs.has(s.primaryArcId));
 assert.ok(s.subjects.length>0 && s.candidateReadingAnchors.length>0);
 assert.equal(s.biblicalNarrativeProse,null);
 assert.equal(s.editorialDisposition,"SOURCE_READING_PROPOSAL_NOT_AUTHORED_STORY");
 s.candidateReadingAnchors.forEach(verify);
 assert.deepEqual(s.exactCanonicalEventKeys,[...new Set(s.candidateReadingAnchors.map(r=>r.exactAtlasEventKey).filter(Boolean))]);
}
for(const row of p2.covenantScripturalCrossReferences) {
 assert.ok(covenantIds.has(row.stageId));
 assert.equal(row.relationshipStatus,"PRIMARY_TEXT_REFERENCED_THEOLOGICAL_LINK_REQUIRES_EDITORIAL_APPROVAL");
 verify(row.reading);
}
const unique=new Set(allRefs.map(r=>r.reference));
assert.equal(sources.size,p2.counts.booksReferenced);
assert.equal(sources.size,26);
assert.equal(unique.size,p2.counts.distinctWitnessedPassageAnchors);
assert.equal(unique.size,73);
assert.equal(p2.counts.storyTopicsWithAtLeastOneExactAtlasKey,p2.proposedCharacterStoryCoverage.filter(c=>c.exactCanonicalEventKeys.length).length);
assert.equal(p2.counts.storyTopicsWithoutExactAtlasKey,p2.proposedCharacterStoryCoverage.filter(c=>!c.exactCanonicalEventKeys.length).length);
assert.deepEqual(p2.sourceBackedRuthToDavid.map(x=>x.relation),["FATHER_OF","MOTHER_OF","FATHER_OF","FATHER_OF"]);
assert.deepEqual(p2.sourceBackedRuthToDavid.map(x=>x.child),["Obed","Obed","Jesse","David"]);
assert.ok(p2.editorialHolds.some(x=>x.id==="psalm-numbers"));
assert.ok(p2.editorialHolds.some(x=>x.id==="luke-genesis-cainan"));
console.log("Historia Salutis P2 PASS: 44 editorial story topics, 73 complete verse ranges in 26 source books, 12 covenant links, 151 canonical Atlas events unchanged.");
