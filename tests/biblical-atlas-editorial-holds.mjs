import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildBibleAtlas} from "../src/find/bible-atlas.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const registry=read("../data/explore/biblical-atlas-editorial-holds.v1.json");
const study=read("../data/explore/biblical-cinematic-studies-review.v1.json");
const atlas=buildBibleAtlas(read("../data/explore/bible-places-compact.v1.json").entries);
assert.equal(registry.schema,"AO_BIBLICAL_ATLAS_EDITORIAL_HOLDS_V1");
assert.equal(registry.status,"REVIEW_NOT_PUBLISHED");
assert.equal(registry.policy?.releaseRequiresHumanSourceReview,true);
assert.equal(atlas.length,151);
assert.equal(study.scenes.length,183);
assert.equal(study.extension.baselineSceneCount,181,
 "all original 181 source identities remain preserved");
assert.deepEqual(study.extension.additionalSceneIndices,[181,182],
 "source-exact Holy Innocents and Pentecost are the only two appended episodes");
assert.equal(study.scenes[181].reference,atlas[73].reference);
assert.equal(study.scenes[182].reference,atlas[126].reference);
assert.equal(registry.holds.length,5,"all five source-critical blockers must remain tracked until reviewed");
assert.equal(new Set(registry.holds.map(x=>x.id)).size,5);

for(const issue of registry.holds){
 assert.match(issue.id,/^[A-Z][A-Z0-9_]+$/);
 assert.ok(["P0","P1"].includes(issue.priority));
 assert.equal(issue.resolution,"HOLD","no silent editorial approval in the research branch");
 assert.match(issue.source,/^https:\/\//);
 assert.ok(issue.issue.length>30&&issue.requiredAction.length>30);
 assert.equal(issue.presentationDecision?.status,"DOCUMENTED_RESEARCH_VIEW_ONLY",
  "bounded display decisions must never be misreported as historical approval");
 assert.ok(issue.presentationDecision.displayRule.length>70);
 assert.ok(issue.presentationDecision.withheldClaim.length>30);
 assert.ok(issue.presentationDecision.sources.length>=2&&issue.presentationDecision.sources.every(url=>/^https:\/\//.test(url)));
 assert.equal(issue.resolution,"HOLD","documenting a display decision cannot waive its historical/rights hold");
 assert.ok(study.scenes[issue.sceneIndex]?.reference);
 assert.ok(issue.atlasIndices.length>0&&issue.atlasIndices.every(i=>atlas[i]?.reference));
 assert.ok(issue.passages.every(p=>typeof p==="string"&&p.length>5));
}
const by=id=>registry.holds.find(x=>x.id===id);
assert.equal(atlas[82].reference,"John 2:13–22");
assert.equal(atlas[82].era,"PUBLIC","Johannine source order is placed after Cana, not asserted Passion chronology");
assert.equal(atlas[81].reference,"John 2:1–11","Cana comes before John's Temple account");
assert.equal(atlas[93].reference,"John 4:46–54","the royal official follows the Samaritan per John 4");
assert.equal(atlas[110].era,"PASSION","the source move must not create an extra Passion episode");
assert.equal(study.scenes[74].reference,atlas[82].reference);
assert.equal(study.scenes[74].candidates[0].atlasIndex,82);
assert.deepEqual(by("JOHN2_PASSION_PLACEMENT").atlasIndices,[82]);
assert.equal(by("JOHN2_PASSION_PLACEMENT").sourceOrderCorrection,"IMPLEMENTED_2026_10_12");
assert.equal(by("JOHN2_PASSION_PLACEMENT").resolution,"HOLD","historical equivalence remains unresolved");
assert.match(study.scenes[63].sourceNote_en,/not determine a precise sequence/);
assert.match(study.scenes[63].sourceNote_fr,/date commune/);
assert.match(study.scenes[64].sourceNote_en,/not a proved dated Gospel harmony/);
assert.match(study.scenes[64].sourceNote_fr,/chronologie évangélique datée/);
assert.doesNotMatch(study.scenes[64].evidence_en,/line on the map/);
assert.match(study.scenes[68].sourceNote_en,/return to Nazareth/);
assert.match(study.scenes[74].sourceNote_en,/one or two historical cleansings/);
assert.match(study.scenes[131].sourceNote_en,/not an eyewitness description/);
assert.equal(atlas[120].reference,"John 20:1–18");
assert.match(study.scenes[131].title_en,/empty tomb/i);
assert.doesNotMatch(study.scenes[131].title_en,/^The Resurrection$/);
assert.equal(by("JOHN20_RESURRECTION_VS_EMPTY_TOMB").textCorrection,"IMPLEMENTED_2026_10_12");
assert.match(atlas[120].title_en,/empty tomb/);
assert.deepEqual(study.scenes[68].candidates.map(x=>x.atlasIndex),[76,77]);
assert.deepEqual(by("LUKE2_TEMPLE_EXACT_AND_OVERLAP").atlasIndices,[76,77]);
assert.equal(study.scenes[63].candidates[0].atlasIndex,72);
assert.equal(study.scenes[64].candidates[0].atlasIndex,71);
assert.deepEqual(by("MAGI_PRESENTATION_GOSPEL_HARMONY").atlasIndices,[72,71]);
for(const issue of registry.holds){
 assert.equal(issue.passages.length,issue.atlasIndices.length,"every held canonical passage has an indexed citation");
 for(let i=0;i<issue.passages.length;i++)
  assert.equal(atlas[issue.atlasIndices[i]].reference,issue.passages[i],"held source must follow index migration: "+issue.id);
 for(let i=0;i<issue.atlasIndices.length;i++)
  assert.equal(atlas[issue.atlasIndices[i]].eventKey,issue.atlasEventKeys[i],
   "stable event identity must survive chronology migration: "+issue.id);
}
console.log("PASS Atlas editorial hold registry: 5 source-bound release blockers; no false release sign-off");
