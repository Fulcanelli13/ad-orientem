import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(path);
const json=path=>JSON.parse(read(path).toString("utf8"));
const pinned=json("data/learn/living-church-p5-convergence-lock.v1.json");
assert.equal(pinned.schema,"AO_LIVING_CHURCH_P5_SOURCE_CONVERGENCE_V1");
assert.equal(pinned.state,"REVIEW_INTEGRATION_RELEASE_BLOCKED");
assert.equal(pinned.releaseAuthorized,false);
assert.equal(pinned.verifiedOwnerBlobs.length,24);
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
assert.match(ask,/engine\|\|createAskChurchObjectiveEngine/);
const owner=read("src/learn/living-church-ask-integration.js").toString();
const folio=read("src/learn/living-church-character-folio.js").toString();
assert.match(owner,/canonicalObjectiveSession=createAskChurchObjectiveEngine/);
assert.match(owner,/engine:objectiveEngine\(\)/);
assert.match(owner,/objectiveSessionCount:canonicalObjectiveSession\?1:0/);
assert.match(folio,/const engine=integration\.objectiveEngine\?\.\(\)/);
assert.doesNotMatch(folio,/createAskChurchObjectiveEngine\(/,
 "The visual-novel folio must not own a second conversation state");
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
assert.equal(m6.images.length,56);
assert.equal(m6.statistics.post_fifth_batch_needs_photo,125);
assert.equal(m6.statistics.post_fifth_batch_photo_candidate_or_hotspot,45);
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
const canonContract=json("data/learn/living-church-canon-formation-referral-contract.v1.json");
assert.equal(canonContract.guardedRoute.publicAnswerRoute,null);
assert.equal(canonContract.originalResearchOwner.repo,"Fulcanelli13/folio-core");
assert.equal(canonContract.originalResearchOwner.sourceFirstReadback.historicalCandidateIds,534);
assert.equal(canonContract.originalResearchOwner.sourceFirstReadback.publicCanonAnswerApprovals,0);
assert.equal(canonContract.existingAppState.apologeticsQuestionAnswersAvailableInP3,false);
assert.equal(pinned.sourceHeads.formationResearch.state,"DRAFT_UNMERGED_SOURCE_CI_FAILED_ZERO_PUBLIC_APPROVALS");
assert.equal(pinned.sourceHeads.characterStage.sha,"7603c175164f918884f749d76654c214f14aa969");
assert.equal(pinned.sourceHeads.livingChurchP4.sha,"b2a83094ebe62be42e40ef1e288c8434fc91f982");
assert.equal(pinned.publicationGates.canonFolioFormationAnswersImportedAndReviewed,false);
const mirror=json("data/learn/formation-canon-migration-provenance-20261018.v1.json");
assert.equal(mirror.schema,"AO_CANON_SOURCE_MIGRATION_SHA_P3_V1");
assert.equal(mirror.sourceFileCount,27);
assert.equal(mirror.files.length,27);
assert.equal(mirror.source.repository,"Fulcanelli13/folio-core");
assert.equal(mirror.source.pinnedAtReadHead,pinned.sourceHeads.formationResearch.p3MirrorOwnerSnapshot);
assert.equal(pinned.sourceMirror.publicStaticAccessVerifiedBlocked,false,
 "Review URL flags are not authorization for public static JSON paths");
const mirrors=new Set();
for(const source of mirror.files){
 assert.match(source.path,/^data\/learn\/(?:research\/)?[a-z0-9./_-]+\.json$/);
 assert.ok(!source.path.includes("..")&&!mirrors.has(source.path),"Unsafe or duplicate research source path");
 mirrors.add(source.path);
 const data=read(source.path);
 const sha=createHash("sha1").update("blob "+data.length+"\0").update(data).digest("hex");
 assert.equal(sha,source.gitBlobSha,"Folio original draft mirror has diverged: "+source.path);
}
const canonReader=read("src/learn/living-church-canon-research-reader.mjs").toString();
const canonUI=read("src/learn/living-church-canon-dialogue-ui.mjs").toString();
assert.match(canonReader,/aoCanonResearchReview/);
assert.match(canonReader,/publicHandoff:.*ORIGINAL_EDITORIAL_PUBLICATION_HOLD/);
assert.match(canonUI,/publicAnswerAuthorized:false/);
assert.match(folio,/canonOverlay/);
assert.match(folio,/openCatechismQuestion/);
assert.equal(pinned.publicationGates.canonUnpublishedJsonAssetsExcludedFromPublicStaticDeploy,false);
assert.equal(pinned.publicationGates.originalFolioSourceEditorialSignoff,false);
assert.equal(characters.chars.length,3);
assert.equal(characters.emotions.length,5);
const review=read("src/learn/visible-mass-review.js").toString();
assert.match(review,/aoLivingChurchCharacters/);
assert.match(review,/visibleMassReviewEnabled/);
assert.match(review,/onNativeOpen/);
assert.match(review,/onNativeReturn/);
assert.match(review,/singleConversationSurface/);
assert.match(review,/sourceSurveyPromise/);
const cate=read("src/learn/living-church-ask-integration.js").toString();
assert.match(cate,/catechismNumber\(sourceRef\)/);
assert.match(cate,/EXACT_SANCTUARY_CONTEXT_MISMATCH/);
assert.match(cate,/learn\.catechism/);
const paths=Object.keys(pinned.publicationGates);
assert.ok(paths.length>=13);
for(const name of paths)assert.equal(pinned.publicationGates[name],false,
 "Unreviewed publication gate unexpectedly marked approved: "+name);
assert.equal(pinned.scopedReadiness.productionReady,false);
console.log("Living Church P5 source convergence PASS: 24 exact source blob pins and 27 separate draft Folio source hashes, all 10 M5 handoff edits, original M6 atlas 170/13/56 and 125 qualifying photo gaps, VMQ 134/4, Ask 7/26 with one shared objective session, PX 433, 15 sprites and 13 locked human release gates.");
