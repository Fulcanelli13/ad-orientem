import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolveFormationReference,resolveCanonicalWork,inspectReferenceInventory} from "../src/source-text/reference-crosswalk.js";
import {normalizeWitnessLocator,validateExternalLocatorBinding,
 editionQualifiedCitation,extractReviewedWitnessDocument} from "../src/source-text/witness-locators.js";
const json=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const canonical=json("data/reference/canonical-works-pilot.v1.json");
const formation=json("data/reference/formation-canonical-source-crosswalk.v1.json");
const profiles=json("data/source-text/witness-profiles.v1.json");
const audit=inspectReferenceInventory({canonical,formation,profiles});
assert.equal(audit.canonicalWorks,13);
assert.equal(audit.formationScopedBindings,408);
assert.equal(audit.formationUrlWitnesses,304);
assert.equal(audit.formationContextApproved,0);
assert.equal(audit.witnessProfiles,9);
assert.equal(audit.importedBookTexts,0);
assert.equal(audit.newClaimLinksApproved,0);
const example=resolveFormationReference({formation,key:"FORM-SYN-01::AQUINAS"});
assert.equal(example.title,"St Thomas Aquinas, Summa Theologiae II–II q33 a4");
assert.ok(example.url.startsWith("https://"));
assert.equal(example.contextApproved,false);
assert.equal(example.claimCitationApproved,false);
assert.equal(example.quotationApproved,false);
assert.equal(example.presentation,"READ_FURTHER_EXTERNAL_LINK");
assert.throws(()=>resolveFormationReference({formation,key:"UNKNOWN::MISSING"}),/NOT_FOUND/);
const missal=resolveCanonicalWork({canonical,workId:"WORK-MISSALE-ROMANUM-1962"});
assert.equal(missal.textImported,false);
assert.equal(missal.productionCitationApproved,false);
assert.equal(missal.canonicalOwner,"data/reference/canonical-works-pilot.v1.json");
const vatican=profiles.profiles.find(x=>x.id==="WIT-MEDIATOR-DEI-EN-VATICAN");
assert.equal(normalizeWitnessLocator(vatican,"§23").sourceAnchor,"md-en-p023");
assert.throws(()=>normalizeWitnessLocator(vatican,"footnote 23"),/PARAGRAPH_INVALID/);
const tan=profiles.profiles.find(x=>x.id==="WIT-TANQUEREY-EN-EWTN");
assert.equal(validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://www.ewtn.com/catholicism/library/spiritual-life-12636"}).sourceLocator,"§643");
assert.throws(()=>validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://wrong.invalid"}),/URL_NOT_REGISTERED/);
const den31=profiles.profiles.find(x=>x.id==="WIT-DENZINGER-31-1960-CATALOGUE");
const den32=profiles.profiles.find(x=>x.id==="WIT-DENZINGER-32-1963-CATALOGUE");
assert.notEqual(den31.referencePrefix,den32.referencePrefix);
assert.throws(()=>normalizeWitnessLocator(den31,"DS 1234"),/CONTENT_NOT_INSPECTED/);
// Project-authored synthetic excerpt only, not a historical passage or app text.
const p={...vatican,id:"WIT-AO-SYNTHETIC",sourceWorkId:"WORK-AO-SYNTHETIC",
 witnessUrl:"https://example.invalid/review"};
const work={id:p.sourceWorkId,title:"Synthetic source",editionId:"ED-AO-TEST",
 witnessId:p.id,language:"en",demoOnly:true,
 rights:{status:"PROJECT_AUTHORED_DEMO",reviewId:"TEST-ONLY"}};
const review={workId:work.id,editionId:work.editionId,witnessId:work.witnessId,
 sourceDocumentId:"SYNTHETIC",collationReviewId:"SYNTHETIC",
 reproductionReviewId:work.rights.reviewId};
const passage=extractReviewedWitnessDocument({profile:p,work,review,
 heading:"Synthetic section",hostUrl:p.witnessUrl,
 records:[{locator:"23",text:"This is a project-authored test sentence."}]});
assert.equal(passage.passages.length,1);
assert.equal(passage.passages[0].sourceAnchor,undefined);
assert.equal(passage.passages[0].editionQualifiedCitation,
 editionQualifiedCitation({work,passageId:passage.passages[0].id,
 sourceAnchor:"md-en-p023"}));
assert.throws(()=>extractReviewedWitnessDocument({profile:p,work:{...work,rights:{status:"UNREVIEWED"}},review,
 heading:"Synthetic",hostUrl:p.witnessUrl,records:[{locator:"23",text:"Synthetic sentence."}]}),
 /REPRODUCTION_NOT_CLEARED/);
console.log("PASS reference-only scope: 13 canonical works, 408 existing Formation links, 304 URLs, 9 profiles; no books imported or fabricated citations");
