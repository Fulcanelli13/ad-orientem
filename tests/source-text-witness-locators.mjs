import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {normalizeWitnessLocator,validateExternalLocatorBinding,
 editionQualifiedCitation,createAnchoredWitnessFixture,extractReviewedWitnessDocument}
 from "../src/source-text/witness-locators.js";
import {packageSourceDocument} from "../src/source-text/package.js";
import {createSourceTextReader} from "../src/source-text/reader.js";

const readJSON=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const data=readJSON("data/source-text/witness-profiles.v1.json");
assert.equal(data.profiles.length,8);
assert.equal(data.metrics.reproductionCleared,0);
assert.equal(data.metrics.thirdPartyTextImported,0);
const by=id=>{const p=data.profiles.find(p=>p.id===id);assert.ok(p);return p;};
const md=by("WIT-MEDIATOR-DEI-EN-VATICAN");
const tan=by("WIT-TANQUEREY-EN-EWTN");
const hume=by("WIT-HUME-E10-ONLINE");
const sales=by("WIT-DESA-EN-CCEL");
const den31=by("WIT-DENZINGER-31-1960-CATALOGUE");
const den32=by("WIT-DENZINGER-32-1963-CATALOGUE");
assert.equal(normalizeWitnessLocator(md,"§23").sourceAnchor,"md-en-p023");
assert.equal(normalizeWitnessLocator(md,"210").sourceLocator,"§210");
assert.throws(()=>normalizeWitnessLocator(md,"211"),/PARAGRAPH_INVALID/);
assert.throws(()=>normalizeWitnessLocator(md,"footnote 23"),/PARAGRAPH_INVALID/);
assert.equal(normalizeWitnessLocator(tan,"#407").sourceAnchor,"tanquerey-s0407");
assert.equal(normalizeWitnessLocator(tan,"§643").sourceLocator,"§643");
assert.equal(normalizeWitnessLocator(hume,"E 10.12").sourceAnchor,"hume-e10-p012");
assert.throws(()=>normalizeWitnessLocator(hume,"SBN 114-5"),/HUME_LOCATOR_INVALID/);
assert.throws(()=>normalizeWitnessLocator(hume,"E 99.1"),/HUME_LOCATOR_INVALID/);
assert.equal(normalizeWitnessLocator(sales,"II.17").sourceAnchor,"sales-part-ii-ch17");
assert.notEqual(normalizeWitnessLocator(sales,"I.17").sourceAnchor,
 normalizeWitnessLocator(sales,"II.17").sourceAnchor);
for(const prof of [den31,den32]){
 assert.equal(prof.handling,"CATALOGUE_ONLY_NO_TEXT");
 assert.throws(()=>normalizeWitnessLocator(prof,"DS 1234"),/CONTENT_NOT_INSPECTED/);
}
assert.notEqual(den31.referencePrefix,den32.referencePrefix,"Do not automatically convert D to DS");
assert.throws(()=>normalizeWitnessLocator(by("WIT-MEDIATOR-DEI-LA-VATICAN"),"23"),
 /LOCATOR_UNREVIEWED/);
const tBound=validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://www.ewtn.com/catholicism/library/spiritual-life-12636"});
assert.equal(tBound.externalPage,"https://www.ewtn.com/catholicism/library/spiritual-life-12636");
assert.throws(()=>validateExternalLocatorBinding({profile:tan,locator:"#643",
 hostUrl:"https://other.invalid/"}),/URL_NOT_REGISTERED/);
assert.throws(()=>validateExternalLocatorBinding({profile:md,locator:"23",
 hostUrl:md.witnessUrl,nodeKind:"footnote"}),/NONBODY_LOCATOR_REFUSED/);

const demo=readJSON("data/source-text/pilot/manifest.json").work;
// Synthetic fixture: exact witness-style grammar, NEVER papal or historical prose.
const p={...md,id:"WIT-AO-TEST-EXTRACT",sourceWorkId:demo.id,
 witnessUrl:"https://example.invalid/ao-synthetic-test"};
const work={...demo,witnessId:p.id};
const review={workId:work.id,editionId:work.editionId,witnessId:work.witnessId,
 reproductionReviewId:work.rights.reviewId,
 sourceDocumentId:"PROJECT-AUTHORED-SYNTHETIC",
 collationReviewId:"TEST-STRUCTURE-NOT_HISTORICAL_WITNESS"};
const rows=[{locator:"23",text:"Project-authored exercise passage alpha."},
 {locator:"24",text:"Project-authored exercise passage beta."}];
const shaped=createAnchoredWitnessFixture({profile:p,hostUrl:p.witnessUrl,
 heading:"Synthetic papal-style numbering",records:rows});
assert.equal(shaped.locators.length,2);
assert.ok(shaped.headedText.includes("[md-en-p023]"));
const parsed=extractReviewedWitnessDocument({profile:p,work,review,
 hostUrl:p.witnessUrl,heading:"Synthetic papal-style numbering",records:rows});
assert.equal(parsed.passages.length,2);
assert.equal(parsed.passages[0].sourceLocator,"§23");
assert.equal(parsed.passages[0].sourcePage,p.witnessUrl);
assert.equal(parsed.passages[0].editionQualifiedCitation,
 editionQualifiedCitation({work,passageId:parsed.passages[0].id,sourceAnchor:"md-en-p023"}));
const variant={...work,editionId:"ED-ANOTHER-2026"};
assert.notEqual(editionQualifiedCitation({work:variant,passageId:parsed.passages[0].id,
 sourceAnchor:"md-en-p023"}),parsed.passages[0].editionQualifiedCitation);
const pack=packageSourceDocument(parsed,{chunkSize:1});
let loads=0;
const reader=createSourceTextReader({manifest:pack.manifest,loadChunk:async path=>{
 loads++;return pack.chunks[path];
}});
assert.equal(loads,0);
assert.equal((await reader.open(reader.firstId)).passage.sourceLocator,"§23");
assert.equal(loads,1);
assert.throws(()=>extractReviewedWitnessDocument({profile:md,work,review,
 hostUrl:md.witnessUrl,heading:"Wrong",records:rows}),/WORK_IDENTITY_MISMATCH/);
assert.throws(()=>extractReviewedWitnessDocument({profile:p,work,review,
 hostUrl:p.witnessUrl,heading:"Synthetic",records:[...rows,rows[0]]}),/LOCATOR_DUPLICATE/);
assert.throws(()=>extractReviewedWitnessDocument({profile:p,work:{...work,rights:{status:"UNREVIEWED"}},review,
 hostUrl:p.witnessUrl,heading:"Synthetic",records:rows}),/REPRODUCTION_NOT_CLEARED/);
console.log("PASS inspected witness locator grammar: 8 profiles, 4 inspected HTML families, 3 catalogue/held profiles; no external text imported");
console.log(JSON.stringify({witnessProfiles:data.profiles.length,approvedReproductions:0,
 sourceBodiesImported:0,syntheticReviewedAdapterPassages:parsed.passages.length,
 firstOpenChunkRequests:1,editionScopedCitationsDistinct:true}));
