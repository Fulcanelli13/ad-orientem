import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const sources=get("data/research/sacred-art-29-institution-crosscheck-20261020.v1.json");
const frozen=get("data/research/sacred-art-user-frozen-decisions-20261017.v1.json");
assert.equal(sources.schema,"AO_SACRED_ART_29_BATCH_INSTITUTION_CROSSCHECK_V1");
assert.equal(sources.records.length,27);
const ids=sources.records.map(x=>x.artworkId);
assert.equal(new Set(ids).size,27);
const allowed=new Set([...frozen.approved.map(x=>x.artworkId),...frozen.historicallyFiveIDsPreservedSeparately]);
const rejects=new Set(frozen.rejected.map(x=>x.artworkId));
assert(sources.records.every(x=>allowed.has(x.artworkId)&&!rejects.has(x.artworkId)));
assert(sources.records.every(x=>!x.independentPhotoRightsVerified&&!x.productionPhotoCleared&&
 !x.commonsCandidatePixelsComparedAgainstOfficialPainting));
const types=sources.records.reduce((a,x)=>(a[x.evidenceClass]=(a[x.evidenceClass]||0)+1,a),{});
assert.equal(types.OFFICIAL_INSTITUTION_OBJECT_RECORD,20);
assert.equal(types.OFFICIAL_INSTITUTION_MULTIPLE_OBJECT_VERSIONS_IDENTITY_HOLD,3);
const lan=sources.records.find(x=>x.approvedTitle==="Miracle of Loaves and Fishes");
const zur=sources.records.find(x=>x.approvedTitle==="Saint Francis in Meditation (1639)");
assert.equal(lan.inventoryNumber,"NGI.72");
assert.equal(zur.inventoryNumber,"NG5655");
assert.equal(sources.criticalIdentityConflicts[lan.artworkId].incorrectMetAccession,"13.75");
assert.equal(sources.criticalIdentityConflicts[zur.artworkId].suspectNGAccession,"NG230");
assert.equal(sources.researchScope.stillWithoutPrimaryInstitutionLink,2);
const script=readFileSync(new URL("../tools/calendar/reconcile-sacred-art-29-institution-checks.mjs",import.meta.url),"utf8");
for(const lock of ["baselineInstitutionReferences:27",
 "knownWrongPhotoHold:knownWrongPhoto",
 "CURRENT_COMMONS_DISCOVERY_TEMPORARILY_UNAVAILABLE_NOT_APPROVAL_LOSS",
 "wikidataNeverOverrulesMuseum:false",
 "candidatePhotographComparedToKnownPhysicalOriginal:false",
 "rightsIndependentEvidenceCertified:false","productionEligible:false"]){
 assert(script.includes(lock),"Missing source identity gate "+lock);
}
console.log("PASS: 27 institution/source records across 29 approved works; two wrong artwork IDs blocked; no photos licensed or published");
