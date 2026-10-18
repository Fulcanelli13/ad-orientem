import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createAskChurchObjectiveEngine} from "../src/learn/ask-church-objective-engine.js";
import {LIVING_CHURCH_FOLIO_VERSION} from "../src/learn/living-church-character-folio.js";
const manifest=JSON.parse(readFileSync("data/learn/living-church-character-assets.v1.json","utf8"));
const survey=JSON.parse(readFileSync("data/learn/ask-church-app-route-survey.v1.json","utf8"));
const pilot=JSON.parse(readFileSync("previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json","utf8"));
assert.equal(LIVING_CHURCH_FOLIO_VERSION,"AO_LIVING_CHURCH_P3_FOLIO_V1");
assert.equal(manifest.schema,"AO_LIVING_CHURCH_P3_SPRITE_BANK_V1");
assert.equal(manifest.state,"REVIEW_ONLY_APPROVED_CONVERSATION_VISUAL_REFERENCE_NOT_PUBLICATION_CERTIFIED");
assert.equal(manifest.chars.length,3);
assert.deepEqual(manifest.chars.map(x=>x.id),["sacristan","canon","pius-x"]);
assert.deepEqual(manifest.emotions,["neutral","welcoming","explaining","thoughtful","grave"]);
for(const guide of manifest.chars){
 for(const emotion of manifest.emotions){
  const path=manifest.images[guide.id]?.[emotion];
  assert.ok(path?.startsWith("/assets/living-church/sprites/"),guide.id+" "+emotion);
  const bytes=readFileSync("."+path);
  assert.ok(bytes.length>15000,"Missing user-approved sprite "+path);
  assert.equal(bytes.toString("ascii",0,4),"RIFF","Sprite must be genuine WebP, not a dead text asset");
  assert.equal(bytes.toString("ascii",8,12),"WEBP");
 }
}
const study=readFileSync("assets/living-church/backgrounds/pius-x-papal-study.webp");
assert.equal(study.toString("ascii",0,4),"RIFF");
assert.equal(study.toString("ascii",8,12),"WEBP");
assert.equal(pilot.questions.length,134);
assert.equal(pilot.status,"RESEARCH_ONLY_NO_PUBLICATION");
const e=createAskChurchObjectiveEngine(survey);
assert.equal(e.objectives().length,7);
assert.equal(survey.objectives.reduce((n,o)=>n+o.paths.length,0),26);
assert.equal(e.setObjective("understand"),true);
assert.equal(e.setBranch("mass"),true);
assert.ok(e.targets().some(x=>x.id==="learn.mass_explorer"));
const folio=readFileSync("src/learn/living-church-character-folio.js","utf8");
assert.match(folio,/visibleMassResearchMomentLinks/);
assert.match(folio,/AO_VISIBLE_MASS_HOTSPOT_PILOT/);
assert.match(folio,/Historical simulation/);
assert.match(folio,/not his words/i);
assert.doesNotMatch(folio,/createChatCompletion|openai\.chat|generateTheologicalAnswer/);
assert.match(folio,/createAskChurchObjectiveEngine/);
assert.match(folio,/aria-pressed/);
const reviewer=readFileSync("src/learn/visible-mass-review.js","utf8");
assert.match(reviewer,/aoLivingChurchCharacters/);
assert.match(reviewer,/Talk with the three guides/);
assert.match(reviewer,/mountLivingChurchCharacterFolio/);
assert.doesNotMatch(reviewer,/reader-live-/);
console.log("PASS Living Church P3: 15 approved WebP sprites, papal study, three original character roles, canonical Ask 7/26, original VMQ owner and publication locks.");
