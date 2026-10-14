import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const parse = path => JSON.parse(readFileSync(new URL(path, import.meta.url), "utf8"));
const a = parse("../data/presentation/mass-icon-harmonization-source-resolutions-20261014.v1.json");
const rubrics = parse("../data/presentation/reader-rubric-events.v1.json");
const stations = parse("../data/presentation/reader-priest-positions.v1.json");
const gestures = parse("../data/mass/gesture-matrix.v1.json");
const current = readFileSync(new URL("../src/mass/reader-icons.js", import.meta.url),"utf8");
assert.equal(a.status,"DRAFT_SOURCE_CHECKED_MINIMAL_FAMILY_POLICY_ATTACHED_NO_RUNTIME_CHANGES");
assert.equal(a.review.hardDiscardRatingLessThan,3);
assert.deepEqual(Object.values(a.counts),[90,71,12,59,19,24]);
assert.deepEqual(Object.values(a.groups).map(x=>x.length),[8,13,2,1]);
assert.equal(new Set(Object.values(a.groups).flat()).size,24);
assert.equal(new Set(a.discardIds).size,12);
assert.equal(new Set(a.unratedIds).size,19);
assert.ok(a.discardIds.every(x=>!a.unratedIds.includes(x)));
assert.equal(a.semantics.length,8);
assert.deepEqual(a.semantics.map(x=>x.id),a.groups.semantic);
const cues = new Set([...rubrics.items,...gestures.items,...stations.items].map(x=>x.cueId));
for(const item of a.semantics){
 assert.equal(item.runtimeChange,false);
 assert.equal(item.visualApproval,"PENDING");
 assert.ok(item.repair.length>=38);
 assert.ok(item.defect.length>=28);
 for(const id of item.cueIds) assert.ok(cues.has(id),item.id+" cue missing: "+id);
}
assert.match(a.semantics.find(x=>x.id==="A04").meaning,/holds the Host/);
assert.match(a.semantics.find(x=>x.id==="B05").repair,/C0247–C0248/);
assert.match(a.semantics.find(x=>x.id==="B09").repair,/C0174.04/);
assert.match(a.semantics.find(x=>x.id==="S_priest_epistle").repair,/priest_gospel_rich/);
assert.match(a.semantics.find(x=>x.id==="S_priest_gospel").repair,/priest_epistle_rich/);
assert.ok(current.includes('"RAISES EYES":"priest_centre_arms_rich"'));
assert.ok(current.includes('"WASHES / PURIFIES":"lavabo"'));
assert.ok(current.includes('ALTAR_EPISTLE_MISSAL:"priest_epistle_rich"'));
assert.ok(current.includes('ALTAR_GOSPEL_MISSAL:"priest_gospel_rich"'));

const work=parse("../data/presentation/mass-icon-harmonization-16-workorders-20261014.v1.json");
assert.equal(work.phase,"PHASE_B_MINIMAL_REPAIR_SPECIFIED_NO_ARTWORK_GENERATED");
assert.equal(work.policy.noLiveChanges,true);
assert.equal(work.policy.noImageGenerationBeforeReuse,true);
assert.deepEqual(Object.values(work.counts),[16,13,2,1]);
assert.equal(work.workorders.length,16);
assert.deepEqual(new Set(work.workorders.map(x=>x.id)).size,16);
assert.deepEqual([...new Set(work.workorders.filter(x=>x.track==="FAMILY").map(x=>x.id))].sort(),a.groups.family.slice().sort());
assert.deepEqual(work.workorders.filter(x=>x.track==="DIAGNOSE").map(x=>x.id).sort(),a.groups.diagnostic.slice().sort());
assert.deepEqual(work.workorders.filter(x=>x.track==="CROP").map(x=>x.id).sort(),a.groups.crop.slice().sort());
assert.ok(work.workorders.every(x=>x.rating>=3 && !x.autoApproval && x.anchors.length));
assert.ok(work.workorders.every(x=>!a.discardIds.includes(x.id)));
assert.deepEqual(new Set([...work.workorders.map(x=>x.id),...a.groups.semantic]).size,24);


const standard=parse("../data/presentation/mass-icon-minimal-family-standard-20261014.v1.json");
const production=parse("../data/presentation/mass-icon-three-by-three-production-backlog-20261014.v1.json");
const stage=parse("../data/presentation/mass-icon-family-harmonization-stage1-20261014.v1.json");
assert.equal(standard.status,"DESIGN_LOCK_FOR_REVIEW_NOT_RUNTIME_APPROVAL");
assert.equal(standard.ratings.score0to2,"PERMANENTLY_REJECT_ORIGINAL_NO_REUSE_NO_HARMONIZE");
assert.equal(standard.ratings.score3,"RESEARCH_REQUIRED_NOT_APPROVED");
assert.equal(standard.ratings.score4,"USER_REVIEW_REQUIRED_NOT_AUTO_APPROVED");
assert.equal(standard.ratings.score5,"AUTOMATICALLY_CONFIRMED_AND_SELECTED");
assert.equal(standard.ratings.unrated,"PENDING_NEVER_ASSUMED_ACCEPTED");
assert.equal(standard.referenceOrder[0].id,"S_priest_sedilia");
assert.equal(standard.referenceOrder[0].rating,5);
assert.ok(standard.prohibitions.some(x=>x.includes("portrait faces")));
assert.ok(standard.prohibitions.some(x=>x.includes("lace")));
assert.ok(standard.prohibitions.some(x=>x.includes("engraving")));
assert.equal(standard.design.color.includes("currentColor"),true);
assert.equal(standard.hierarchy.smallRail.includes("48/64"),true);
assert.equal(a.semantics.length,8);
assert.ok(a.semantics.every(x=>x.minimalFamily?.standard==="data/presentation/mass-icon-minimal-family-standard-20261014.v1.json"));
assert.ok(a.semantics.every(x=>x.minimalFamily?.artworkApproval===false));
assert.ok(work.workorders.every(x=>x.minimalFamily?.standard===a.semantics[0].minimalFamily.standard));
assert.ok(work.workorders.every(x=>x.minimalFamily?.productionIconStatus==="NOT_APPROVED"));
assert.equal(work.workorders.find(x=>x.id==="B16").minimalFamily.ratingDisposition,"AWAIT_USER_REVIEW");
assert.equal(work.workorders.find(x=>x.id==="A03").minimalFamily.ratingDisposition,"RESEARCH_REQUIRED");
assert.equal(work.policy.generatedDetailedDraftPolicy,"POSE_REFERENCE_ONLY_NOT_FAMILY_STANDARD");
assert.equal(work.workorders.find(x=>x.id==="B02").minimalFamily.repairMode,"REUSE_PLUS_TEXT");
assert.equal(work.workorders.find(x=>x.id==="S_priest_incense_altar").minimalFamily.repairMode,"REDRAW_MINIMAL_ALTAR_OVERLAY");
assert.equal(work.workorders.find(x=>x.id==="B13").minimalFamily.repairMode,"TECHNICAL_ONLY_THEN_REVIEW");
assert.equal(production.records.length,36);
assert.ok(production.records.every(x=>x.productionGate==="NO_GENERATION_UNTIL_REUSE_RECONCILED_AND_CUE_MISSING"));
assert.equal(production.nextGenerationBatch,"PAUSED_PENDING_APPROVED_MINIMAL_FAMILY_AND_POST_REPAIR_GAP_AUDIT");
assert.equal(stage.status,"PALETTE_MASK_EXPERIMENT_ONLY_NOT_VISUAL_STYLE");
assert.equal(stage.visualReassessment.newIllustrationArtApproved,undefined);
assert.equal(stage.remaining.newIllustrationArtApproved,0);
assert.ok(stage.visualReassessment.caveat.includes("Do not promote"));
assert.equal(standard.design.assets.includes("Never mutate"),true);


const studies=parse("../data/presentation/mass-icon-minimal-native-svg-staging-20261014.v1.json");
assert.equal(studies.status,"RESEARCH_PROTOTYPES_ONLY_NOT_APPROVED_NOT_RUNTIME_BOUND");
assert.equal(studies.referenceRating,5);
assert.equal(studies.items.length,3);
assert.ok(studies.items.every(x=>x.geometryStatus==="GEOMETRY_PROTOTYPE"));
assert.ok(studies.items.every(x=>x.needs.some(y=>y.includes("user artwork rating"))));
assert.equal(studies.items.find(x=>x.id==="B13").railAcceptance,"FAIL_AT_64PX");
assert.ok(Object.values(studies.productionChanges).every(x=>x===false));
for(const x of studies.items){
  const raw=readFileSync(new URL("../"+studies.assetRoot+x.file,import.meta.url),"utf8");
  assert.ok(raw.includes('viewBox="0 0 128 128"'));
  assert.ok(raw.includes("currentColor"));
  assert.ok(raw.includes("<mask "));
  assert.ok(!/<image\\b|data:image|base64/i.test(raw),"embedded raster not permitted: "+x.file);
  assert.ok(!/<filter|gradient|pattern|feGaussian/i.test(raw),"decorative rendering: "+x.file);
  assert.ok(/aria-label=/.test(raw));
}

console.log("PASS: 24 minimal-family repair workorders; 0–2 rejects / 3 research / 4 review / 5 confirmed; 36 subjects generation-gated, no runtime changes.");
