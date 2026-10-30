import test from "node:test";
import assert from "node:assert/strict";
import {compareFrenchSundayVersicleResponse} from "../scripts/office/audit-restored-french-vespers-candidate.mjs";
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


test("Sunday French verse/response variants collate only in the printed order",()=>{
  const a=compareFrenchSundayVersicleResponse(
    "℣. Que ma prière monte tout droit, Seigneur.\n"+
    "℟. Comme l'encens devant votre face.");
  assert.deepEqual(a.verseWitnesses,["GRENOBLE_1960_BOOKLET_2023"]);
  assert.deepEqual(a.responseWitnesses,["GRENOBLE_1960_BOOKLET_2023"]);
  assert.equal(a.exactSameWitnessPair,true);
  assert.equal(a.printed1961EditionCertified,false);
  const b=compareFrenchSundayVersicleResponse(
    "V/. Seigneur, que ma prière soit dirigée.\n"+
    "R/. Comme un encens en votre présence.");
  assert.deepEqual(b.verseWitnesses,["ICKSP_TRADITIONAL"]);
  assert.deepEqual(b.responseWitnesses,["ICKSP_TRADITIONAL"]);
  assert.equal(b.exactSameWitnessPair,true);
  assert.equal(b.published,0);
  const reversed=compareFrenchSundayVersicleResponse(
    "Comme l'encens devant votre face. Que ma prière monte tout droit, Seigneur.");
  assert.equal(reversed.verseAndResponseInCorrectOrder,false);
  assert.equal(reversed.exactSameWitnessPair,false);
  const absent=compareFrenchSundayVersicleResponse("Oremus. Prions.");
  assert.deepEqual(absent.verseWitnesses,[]);
  assert.deepEqual(absent.responseWitnesses,[]);
});
