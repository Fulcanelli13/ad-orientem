import test from "node:test";
import assert from "node:assert/strict";
import {candidateSafetyRecord,CANDIDATE_COHORT}
 from "../scripts/office/generate-french-vespers-recovery-candidate.mjs";

test("recovered French Vespers uses a distinct explicitly unpublished scratch cohort",()=>{
  const r=candidateSafetyRecord({
    original:"/scratch/upstream/orationes.pl",
    candidate:"/scratch/research-french-restored",
    root:"/scratch/upstream"
  });
  assert.equal(r.schema,CANDIDATE_COHORT);
  assert.equal(r.canonicalBaselineUnmodified,true);
  assert.equal(r.sourceFixAppliedOnlyInScratch,true);
  assert.equal(r.independentlyPrintedFrenchProperCertified,false);
  assert.equal(r.frenchTranslationEditoriallyApproved,false);
  assert.equal(r.productionRouteRegistered,false);
  assert.equal(r.canPublish,false);
  assert.equal(r.published,0);
});
test("candidate cannot overwrite pinned source or re-use baseline path",()=>{
  assert.throws(()=>candidateSafetyRecord({
    original:"/scratch/orationes.pl",candidate:"/scratch/orationes.pl",
    root:"/scratch/upstream"
  }),/PATHS_UNSAFE/);
  assert.throws(()=>candidateSafetyRecord({
    original:"/scratch/orationes.pl",candidate:"",
    root:"/scratch/upstream"
  }),/PATHS_UNSAFE/);
});
