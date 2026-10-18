import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path);
const json=path=>JSON.parse(read(path).toString("utf8"));
const pinned=json("data/learn/living-church-p5-convergence-lock.v1.json");
assert.equal(pinned.schema,"AO_LIVING_CHURCH_P5_SOURCE_CONVERGENCE_V1");
assert.equal(pinned.state,"REVIEW_INTEGRATION_RELEASE_BLOCKED");
assert.equal(pinned.releaseAuthorized,false);
assert.equal(pinned.verifiedOwnerBlobs.length,16);
for(const entry of pinned.verifiedOwnerBlobs){
 const data=read(entry.path);
 const gitSha=createHash("sha1").update("blob "+data.length+"\0").update(data).digest("hex");
 assert.equal(gitSha,entry.gitBlobSha,
   "Source owner drift: "+entry.path+" ("+entry.owner+") must be explicitly reconciled");
}
assert.equal(pinned.layeredAdaptations.length,3);
const ask=read("src/learn/ask-church-guided-preview.js").toString();
assert.match(ask,/hostManagesReturn=false/);
assert.match(ask,/hide\(\)\{root\.hidden=true;returnBtn\.hidden=true/);
assert.match(ask,/createAskChurchObjectiveEngine/);
const photo=read("previews/visible-mass-3d/sanctuary-hotspot-pilot.html").toString();
for(const proof of [
 'm5ModulePromise=import("./visible-mass-m5-photographs.mjs")',
 'm5Ready=true;',
 'if(typeof shown.decode==="function")await shown.decode()',
 'requestAnimationFrame(()=>requestAnimationFrame(ok))',
 'm5Viewpoint:m5Photo,m5Ready,m5Available:',
 'const syncLivingChurchP1=',
 'visible-mass-living-church-adapter.mjs',
 'window.AO_VISIBLE_MASS_LIVING_CHURCH_P1'
])assert.ok(photo.includes(proof),"P5 lost owner change or P1 bridge: "+proof);
assert.equal((photo.match(/let panoramaController=null,m5PhotoModule=null,m5ModulePromise=null/g)||[]).length,1,
 "Only one original photographic runtime may own source M5 loading");
const m6=json("previews/visible-mass-3d/M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json");
assert.equal(m6.schema,"AO_VISIBLE_MASS_M6_PHOTOGRAPHIC_ATLAS_COVERAGE_V1");
assert.equal(m6.status,"RESEARCH_ONLY_NOT_PUBLICATION_APPROVED");
assert.equal(m6.objects.length,170);
assert.equal(m6.zones.length,13);
assert.equal(m6.images.length,52);
assert.equal(m6.statistics.post_fourth_batch_needs_photo,129);
const pilot=json("previews/visible-mass-3d/PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json");
const trails=json("previews/visible-mass-3d/GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json");
const objectives=json("data/learn/ask-church-app-route-survey.v1.json");
assert.equal(pilot.questions.length,134);
assert.equal(pilot.objects.length,30);
assert.equal(trails.visibleHotspotIds.length,6);
assert.equal(trails.trails.length,4);
assert.equal(objectives.objectives.length,7);
assert.equal(objectives.objectives.reduce((n,x)=>n+x.paths.length,0),26);
const witness=json("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
assert.equal(witness.entries.length,433);
const characters=json("data/learn/living-church-character-assets.v1.json");
assert.equal(characters.chars.length,3);
assert.equal(characters.emotions.length,5);
const review=read("src/learn/visible-mass-review.js").toString();
assert.match(review,/aoLivingChurchCharacters/);
assert.match(review,/visibleMassReviewEnabled/);
assert.match(review,/onNativeOpen/);
assert.match(review,/onNativeReturn/);
const cate=read("src/learn/living-church-ask-integration.js").toString();
assert.match(cate,/catechismNumber\(sourceRef\)/);
assert.match(cate,/EXACT_SANCTUARY_CONTEXT_MISMATCH/);
assert.match(cate,/learn\.catechism/);
const paths=Object.keys(pinned.publicationGates);
assert.ok(paths.length>=9);
for(const name of paths)assert.equal(pinned.publicationGates[name],false,
 "Unreviewed publication gate unexpectedly marked approved: "+name);
assert.equal(pinned.scopedReadiness.productionReady,false);
console.log("Living Church P5 source convergence PASS: 16 exact source blob pins, all 10 M5 handoff edits, original M6 atlas 170/13/52, VMQ 134/4, Ask 7/26, PX 433, 15 sprites and 9 locked human release gates.");
