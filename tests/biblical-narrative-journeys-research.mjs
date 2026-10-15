import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const taxonomy=read("data/explore/biblical-narrative-journeys-review.v1.json");
const scenes=read("data/explore/biblical-cinematic-studies-review.v1.json");
assert.equal(taxonomy.schema,"AO_BIBLICAL_NARRATIVE_JOURNEYS_REVIEW_V1");
assert.equal(taxonomy.status,"RESEARCH_NOT_PRODUCTION_CERTIFIED");
// Product-owner editorial rule: do not reintroduce AI-written Bible narration.
assert.equal(taxonomy.policy.noAiAuthoredNarrative,true);
assert.equal(taxonomy.policy.aiFaithfulTranslationOfVerifiedExistingAuthorAllowed,true);
assert.equal(taxonomy.policy.aiOriginalNarrativeProhibited,true);
assert.equal(taxonomy.policy.translationRequiresEditorialReviewBeforePublication,true);
assert.equal(taxonomy.policy.existingAuthorProseOnly,true);
assert.equal(taxonomy.policy.historicalSourceWitnessRequired,true);
assert.equal(taxonomy.policy.noPermissionRequests,true);
assert.ok(!existsSync(new URL("../data/explore/biblical-original-narrative-pilot.v1.json",import.meta.url)),"Rejected AI narrative must not return to this branch");

assert.equal(scenes.scenes.length,183);
assert.equal(taxonomy.eraKeys.length,11);
assert.equal(taxonomy.arcs.length,10);
assert.equal(taxonomy.stories.length,39);
assert.equal(taxonomy.themes.length,9);
assert.equal(taxonomy.coverageSnapshot.canonicalEvents,151);
const ids=new Set(scenes.scenes.map(s=>s.sceneKey));
const seen=new Set();
for(const story of taxonomy.stories){
  assert.equal(story.kind,"STORY");
  assert.ok(story.sceneKeys.length);
  for(const key of story.sceneKeys){
    assert.ok(ids.has(key),"Unknown canonical study scene "+key);
    assert.ok(!seen.has(key),"Duplicate primary story ownership "+key);
    seen.add(key);
  }
}
assert.equal(seen.size,183,"All research scenes must be classified once");
const storyIds=new Set(taxonomy.stories.map(s=>s.id));
const eras=new Set(taxonomy.eraKeys);
for(const arc of taxonomy.arcs){
  for(const era of arc.eraKeys)assert.ok(eras.has(era));
  for(const id of arc.storyIds)assert.ok(storyIds.has(id));
}
for(const theme of taxonomy.themes){
  assert.equal(theme.editorialStatus,"CURATED_CANDIDATES_REQUIRING_SOURCE_REVIEW");
  for(const key of theme.sceneKeys)assert.ok(ids.has(key));
}
assert.equal(taxonomy.policy.noNewCanonicalEvents,true);
assert.equal(taxonomy.policy.noPublicPromotionWithoutSourceReview,true);
assert.equal(taxonomy.readingStateContract.scope,"PER_JOURNEY_AND_READER");
console.log("Biblical narrative taxonomy review: 183 / 183 scene keys classified; 11 eras, 10 arcs, 39 stories, 9 themes. Research only.");
