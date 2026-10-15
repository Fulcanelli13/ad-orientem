import assert from "node:assert/strict";
import {Buffer} from "node:buffer";
import {readFileSync} from "node:fs";
import {extractReviewedEdition} from "../src/source-text/edition-adapters.js";
import {packageSourceDocument} from "../src/source-text/package.js";
import {createSourceTextReader} from "../src/source-text/reader.js";

const readJSON=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const inventory=readJSON("data/source-text/acquisition-expansion.v1.json");
const original=readJSON("data/source-text/work-candidates.v1.json");
assert.equal(original.works.length,13);
assert.equal(inventory.inheritedWorkCount,original.works.length);
assert.equal(inventory.proposedWorks.length,10);
assert.equal(inventory.reuseWithoutReimport.length,4);
assert.equal(inventory.publishedFullTextAdded,0);
const ids=new Set(original.works.map(w=>w.sourceWorkId));
for(const w of inventory.proposedWorks){
 assert.ok(!ids.has(w.workIdProposal),"New acquisition must not duplicate one of 13 canonical entries");
 ids.add(w.workIdProposal);
 assert.equal(w.identityStatus,"PROPOSED_NOT_CANONICAL");
 assert.equal(w.importPermission,"NOT_GRANTED");
 assert.equal(w.extraction,"METADATA_ONLY__NOT_PARSED");
 assert.ok(w.evidencePath.startsWith("data/"));
}
assert.equal(ids.size,23);
const demo=readJSON("data/source-text/pilot/manifest.json").work;
const review={adapter:"numbered-paragraphs-v1",workId:demo.id,editionId:demo.editionId,
 witnessId:demo.witnessId,reproductionReviewId:demo.rights.reviewId,
 sourceDocumentId:"AO-SYNTHETIC-NUMBERED-FIXTURE",collationReviewId:"AO-SYNTHETIC-COLLATION"};
let input="# Synthetic test edition\n\n";
for(let section=1;section<=24;section++){
 input+="## Unit "+String(section).padStart(2,"0")+"\n";
 for(let para=1;para<=50;para++){
  input+="["+String(para).padStart(3,"0")+"] "+
   "Synthetic control text for parser behaviour, not a real source. "+
   "Witness boundaries and headings must remain stable. "+section+"."+para+"\n";
 }
}
const doc=extractReviewedEdition({work:demo,review,sourceText:input});
assert.equal(doc.passages.length,1200);
assert.equal(new Set(doc.passages.map(x=>x.id)).size,1200);
assert.ok(doc.passages[0].id.includes("/001"));
const bundle=packageSourceDocument(doc,{chunkSize:50});
assert.equal(bundle.manifest.chunks.length,24);
const manifestBytes=Buffer.byteLength(JSON.stringify(bundle.manifest),"utf8");
const textBytes=Object.values(bundle.chunks).reduce((sum,s)=>sum+Buffer.byteLength(s,"utf8"),0);
let requests=0;
const reader=createSourceTextReader({manifest:bundle.manifest,loadChunk:async path=>{
 requests++;return bundle.chunks[path];
}});
assert.equal(reader.searchMetadata("Unit 12").length,30);
assert.equal(requests,0);
await reader.open(reader.firstId);
assert.equal(requests,1);
await reader.open(bundle.manifest.passages[49].id);
assert.equal(requests,1);
await reader.open(bundle.manifest.passages[50].id);
assert.equal(requests,2);
const search=await reader.searchFullText("not a real source",{limit:1200});
assert.equal(search.length,1200);
assert.equal(requests,24);
assert.equal(reader.loadedChunks(),24);
const inserted=extractReviewedEdition({work:demo,review,
 sourceText:input.replace("[001] Synthetic control text","[000] Inserted synthetic line\n[001] Synthetic control text")});
assert.equal(inserted.passages[1].id,doc.passages[0].id,"Explicit source anchors survive inserted paragraph");
const wrongEdition={...review,editionId:"DIFFERENT_EDITION"};
assert.throws(()=>extractReviewedEdition({work:demo,review:wrongEdition,sourceText:input}),/REVIEW_IDENTITY_REQUIRED/);
assert.throws(()=>extractReviewedEdition({work:{...demo,rights:{status:"UNREVIEWED"}},review,sourceText:input}),/REPRODUCTION_NOT_CLEARED/);
assert.throws(()=>extractReviewedEdition({work:demo,review,sourceText:"# Title\n\nUnnumbered."}),/NUMBERED_LINE_INVALID/);
const anchored={...review,adapter:"anchored-clean-html-v1"};
const clean=extractReviewedEdition({work:demo,review:anchored,sourceText:
 '<article><h1>Test</h1><p data-source-anchor="p-1">One &amp; two.</p></article>'});
assert.equal(clean.passages[0].locator,"test#p-1");
assert.throws(()=>extractReviewedEdition({work:demo,review:anchored,
 sourceText:"<article><h1>Test</h1><p>Unanchored.</p></article>"}),/ANCHOR_REQUIRED/);
assert.throws(()=>extractReviewedEdition({work:demo,review:anchored,
 sourceText:'<article><p data-source-anchor="p-1" onclick="evil()">Unsafe.</p></article>'}),/UNSAFE_OR_UNSUPPORTED/);
const ordinal={...review,adapter:"reviewed-plain-sections-v1"};
assert.throws(()=>extractReviewedEdition({work:demo,review:ordinal,
 sourceText:"# Title\n\nOne."}),/ORDINAL_LOCATOR_REVIEW_REQUIRED/);
assert.equal(extractReviewedEdition({work:demo,review:{...ordinal,locatorStability:"ORDINAL_REVIEWED"},
 sourceText:"# Title\n\nOne."}).passages.length,1);
console.log("PASS source-text edition adapter and large synthetic corpus: 23 total metadata work IDs (13 inherited + 10 candidates); 1,200 passages; 24 chunks");
console.log(JSON.stringify({syntheticPassages:1200,syntheticChunks:24,metadataBytes:manifestBytes,
 syntheticBodyBytes:textBytes,metadataOnlyChunkRequests:0,firstOpenChunkRequests:1,
 fullTextChunkRequests:24,thirdPartyTextImported:0,productionSavings:"NOT_MEASURED"}));
