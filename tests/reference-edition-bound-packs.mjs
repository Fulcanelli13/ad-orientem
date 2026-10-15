import assert from "node:assert/strict";
import {webcrypto} from "node:crypto";
import {readFileSync} from "node:fs";
import {parsePinnedSourceHtml} from "../src/reference/html-parser.js";
import {compileSourcePassagePacks,createSourcePackReader}
 from "../src/reference/passage-packs.js";

const sourceHtml="<article><h2 id='chapter'>Unit test</h2>"+
 "<p id='p1'>First approved exercise passage.</p>"+
 "<p id='p2'>Second approved exercise passage.</p></article>";
const work={id:"WORK-AO-PACK-TEST",title:"Project authored test material",
 editionId:"ED-AO-PACK-TEST-1",witnessId:"WIT-AO-PACK-TEST",
 language:"en",demoOnly:true,
 rights:{status:"PROJECT_AUTHORED_DEMO",reviewId:"AO-TEST-ONLY-NOT-PUBLIC"}};
const input={text:sourceHtml,workId:work.id,witnessId:work.witnessId,
 revision:"r1",language:work.language,rights:"CLEARED"};
const doc=parsePinnedSourceHtml(input);
const id1=doc.sections[0].paragraphs[0].id,id2=doc.sections[0].paragraphs[1].id;
const scan="https://example.invalid/scan/303";
const locators={
 [id1]:{sourceLocator:"p255:s001",sourcePage:scan,
  sourcePages:[{printedPage:255,scanPage:303,url:scan},
   {printedPage:256,scanPage:304,url:"https://example.invalid/scan/304"}]},
 [id2]:{sourceLocator:"p256:s002",sourcePage:"https://example.invalid/scan/304"}
};
const pack=await compileSourcePassagePacks(doc,{
 sourceWork:work,passageLocators:locators,cryptoProvider:webcrypto
});
assert.equal(pack.manifest.editionIdentity.workId,work.id);
assert.equal(pack.manifest.editionIdentity.editionId,work.editionId);
assert.equal(pack.manifest.editionIdentity.witnessId,work.witnessId);
assert.equal(pack.manifest.editionIdentity.demoOnly,true);
assert.equal(pack.manifest.editionIdentity.publicationApproval,"NOT_FOR_PUBLICATION");
const passageMeta=pack.manifest.sections[0].passageMeta;
assert.equal(passageMeta.length,2);
assert.ok(passageMeta[0].citationId.includes(encodeURIComponent(work.editionId)));
assert.equal(passageMeta[0].sourcePage,scan);
assert.equal(passageMeta[0].sourcePages.length,2);
assert.ok(/^[a-f0-9]{64}$/.test(passageMeta[0].textSha256));
assert.ok(!JSON.stringify(pack.manifest).includes("First approved exercise passage."),
 "Manifest must not preload full passage text");
let loads=0;
const reader=createSourcePackReader(pack.manifest,{
 cryptoProvider:webcrypto,loadChunk:async path=>{loads++;return pack.chunks.find(c=>c.file===path).raw}
});
assert.equal(loads,0);
assert.equal(reader.searchMetadata("p255:s001").length,1);
assert.equal(reader.searchMetadata("Unit test").length,2);
assert.equal(reader.searchMetadata("ED-AO-PACK-TEST").length,2);
assert.equal(reader.searchMetadata("approved exercise passage").length,0,
 "Metadata search must not search the full text");
assert.equal(loads,0);
const p1=await reader.open(id1);
assert.equal(p1.text,"First approved exercise passage.");
assert.equal(p1.editionId,work.editionId);
assert.equal(p1.sourceLocator,"p255:s001");
assert.equal(p1.citationId,passageMeta[0].citationId);
assert.equal(p1.sourcePages[1].printedPage,256);
assert.equal(p1.demoOnly,true);
assert.equal(loads,1);
const p2=await reader.open(id2);
assert.equal(p2.sourceLocator,"p256:s002");
assert.equal(loads,1);
assert.equal(reader.cachedSections(),1);

// Same witness text gets a different citation for an explicitly different edition.
const nextWork={...work,editionId:"ED-AO-PACK-TEST-2"};
const alternate=await compileSourcePassagePacks(doc,{
 sourceWork:nextWork,passageLocators:locators,cryptoProvider:webcrypto
});
assert.notEqual(alternate.manifest.sections[0].passageMeta[0].citationId,
 pack.manifest.sections[0].passageMeta[0].citationId);
assert.notEqual(alternate.manifest.sections[0].sha256,
 pack.manifest.sections[0].sha256);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:{...work,witnessId:"WIT-FORGED"},passageLocators:locators,
 cryptoProvider:webcrypto}),/WORK_EDITION_WITNESS_MISMATCH/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:work,passageLocators:{[id1]:locators[id1]},
 cryptoProvider:webcrypto}),/LOCATOR_REQUIRED_OR_DUPLICATE/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:work,passageLocators:{...locators,["unknown"]:locators[id1]},
 cryptoProvider:webcrypto}),/LOCATOR_COVERAGE_INVALID/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:work,passageLocators:{...locators,
  [id1]:{sourceLocator:"p255:s001",sourcePage:"http://not-allowed"}},
 cryptoProvider:webcrypto}),/LOCATOR_REQUIRED_OR_DUPLICATE/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:work,passageLocators:{...locators,
  [id1]:{...locators[id1],sourcePages:[
   locators[id1].sourcePages[0],
   {...locators[id1].sourcePages[1],printedPage:257}]}},
 cryptoProvider:webcrypto}),/PAGE_SPAN_NONCONTIGUOUS/);
const noAnchor=parsePinnedSourceHtml({...input,
 text:"<article><h2>Test</h2><p>Unanchored text.</p></article>"});
await assert.rejects(compileSourcePassagePacks(noAnchor,{
 sourceWork:work,passageLocators:{[noAnchor.sections[0].paragraphs[0].id]:{
 sourceLocator:"test"}},cryptoProvider:webcrypto}),/LOCATOR_REQUIRED_OR_DUPLICATE/);
assert.throws(()=>parsePinnedSourceHtml({...input,
 text:"<article><h2>Test</h2><p id='p1'>Repeated 1.</p>"+
 "<h2>Next</h2><p id='p1'>Repeated 2.</p></article>"}),
 /PINNED_HTML_|DUPLICATE/);

// Non-demo text cannot be silently published by setting legacy rights=CLEARED.
const cleared={...work,demoOnly:false,rights:{
 status:"REPRODUCTION_CLEARED",reviewId:"REVIEW-SYNTHETIC",
 scope:"REVIEWED_EXCERPTS_ONLY",publicationApproval:"APPROVED_FOR_READING",
 approvedExcerpts:[{anchor:"p1",text:"First approved exercise passage."},
 {anchor:"p2",text:"Second approved exercise passage."}]
}};
const reviewed=await compileSourcePassagePacks(doc,{
 sourceWork:cleared,passageLocators:locators,cryptoProvider:webcrypto
});
assert.equal(reviewed.manifest.editionIdentity.demoOnly,false);
assert.equal(reviewed.manifest.editionIdentity.scope,"REVIEWED_EXCERPTS_ONLY");
assert.equal(reviewed.manifest.editionIdentity.publicationApproval,"APPROVED_FOR_READING");
const reviewedReader=createSourcePackReader(reviewed.manifest,{
 cryptoProvider:webcrypto,loadChunk:async()=>reviewed.chunks[0].raw
});
assert.equal((await reviewedReader.open(id1)).citationId,
 reviewed.manifest.sections[0].passageMeta[0].citationId);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:{...cleared,rights:{...cleared.rights,publicationApproval:"NOT_GRANTED"}},
 passageLocators:locators,cryptoProvider:webcrypto
}),/PUBLICATION_APPROVAL_REQUIRED/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:{...cleared,demoOnly:true},
 passageLocators:locators,cryptoProvider:webcrypto
}),/PUBLICATION_APPROVAL_REQUIRED/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:{...cleared,rights:{...cleared.rights,
 approvedExcerpts:[{anchor:"p1",text:"Changed excerpt."},
 {anchor:"p2",text:"Second approved exercise passage."}]}},
 passageLocators:locators,cryptoProvider:webcrypto
}),/OUTSIDE_APPROVED_EXCERPTS/);
await assert.rejects(compileSourcePassagePacks(doc,{
 sourceWork:{...cleared,rights:{...cleared.rights,
 approvedExcerpts:[{anchor:"p1",text:"First approved exercise passage."}]}},
 passageLocators:locators,cryptoProvider:webcrypto
}),/OUTSIDE_APPROVED_EXCERPTS/);

// Even with a recomputed section SHA, altered body text cannot disagree with
// the separately approved text digest and provenance in the trusted manifest.
const forged=JSON.parse(reviewed.chunks[0].raw);
forged.paragraphs[0].text="Forged text.";
const forgedRaw=JSON.stringify(forged);
const digest=await webcrypto.subtle.digest("SHA-256",new TextEncoder().encode(forgedRaw));
const forgedHash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,"0")).join("");
const rehashed={...reviewed.manifest,
 sections:[{...reviewed.manifest.sections[0],sha256:forgedHash,
 byteSize:new TextEncoder().encode(forgedRaw).length}]};
const fraudulentReader=createSourcePackReader(rehashed,{
 cryptoProvider:webcrypto,loadChunk:async()=>forgedRaw
});
await assert.rejects(fraudulentReader.open(id1),/APPROVED_EXCERPT_IDENTITY_MISMATCH/);
const metadataForged={...reviewed.manifest,sections:[{
 ...reviewed.manifest.sections[0],
 passageMeta:[{...reviewed.manifest.sections[0].passageMeta[0],
 citationId:"FORGED"},...reviewed.manifest.sections[0].passageMeta.slice(1)]
}]};
assert.throws(()=>createSourcePackReader(metadataForged,{
 cryptoProvider:webcrypto,loadChunk:async()=>reviewed.chunks[0].raw
}),/CITATION_IDENTITY_INVALID/);
const identityForged={...reviewed.manifest,editionIdentity:{
 ...reviewed.manifest.editionIdentity,editionId:"ED-OTHER"
}};
const wrongReader=createSourcePackReader(identityForged,{
 cryptoProvider:webcrypto,loadChunk:async()=>reviewed.chunks[0].raw
});
await assert.rejects(wrongReader.open(id1),/CHUNK_EDITION_MISMATCH/);

// Legacy project-authored demo manifest and chunk bytes remain unchanged.
const legacyManifest=JSON.parse(readFileSync(new URL("../data/reference/source-demo/manifest.v1.json",import.meta.url),"utf8"));
const legacyReader=createSourcePackReader(legacyManifest,{
 cryptoProvider:webcrypto,loadChunk:async p=>readFileSync(new URL("../data/reference/source-demo/"+p,import.meta.url),"utf8")
});
assert.equal(legacyReader.searchMetadata("Reading with Context").length,2);
assert.equal((await legacyReader.open(legacyManifest.sections[0].passageIds[0])).editionId,undefined);
console.log("PASS exact edition/witness/source scope bound to SHA-256 chunks with metadata-only search and legacy baseline");
console.log(JSON.stringify({qualifiedPassages:2,chunkFetchesBeforeSearch:0,
 externalTextImported:0,legacyManifestUnchanged:true,publicReleaseRequiresExplicitApproval:true}));
