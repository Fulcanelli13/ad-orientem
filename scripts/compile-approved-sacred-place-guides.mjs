#!/usr/bin/env node
// Build the existing illustrated-Place-guide schema from explicitly reviewed
// EN/FR Sacred Atlas history drafts. No automatic approval or online publication.
// Default --check is read-only; --write is a deliberate release-file mutation.
import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";
import {buildReviewedSacredGuideCorpus,resolveSacredGuideBatchAuthorization} from "../src/find/sacred-guide-review-release.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const wave2=["57-66","67-76","77-86","87-96","97-106","107-116",
"117-126","127-136","137-146","147-156","157-166","167-176",
"177-188","189-200","201-212","213-224"];
const wave1=["first10-extended-guides","guides11-20","guides21-30","guides31-43","guides44-56"];
const publishedNames=["france","france-r67","global-marian-b2",
"global-saints-r1","ireland","world-marian-r1"];
const reviewFile="data/shrines/research/sacred-atlas-bilingual-guide-editorial-decisions.v1.json";
const destination="data/shrines/illustrated-place-guides-reviewed-bilingual.v1.json";
const reviews=read(reviewFile);
assert.equal(reviews.schema,"AO_SACRED_ATLAS_BILINGUAL_GUIDE_EDITORIAL_DECISIONS_V1");
const seed=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const researchSources=read("data/shrines/research/sacred-atlas-institutional-source-supplement-20261111.v1.json");
assert.equal(researchSources.state,"RESEARCH_ONLY_NOT_RELEASED");
assert.ok(researchSources.sources.every(s=>s.scope==="RESEARCH_ONLY"&&s.place_id&&
  !sources.sources.some(c=>c.id===s.id)),"Research sources must remain outside the public registry");
const drafts=[
  ...wave1.flatMap(n=>read("data/shrines/research/sacred-atlas-wave1-"+n+"-20261105.v1.json").guides),
  ...wave2.flatMap(n=>read("data/shrines/research/sacred-atlas-wave2-guides"+n+"-20261110.v1.json").guides),
];
const published=publishedNames.flatMap(n=>
  read("data/shrines/illustrated-place-guides-"+n+".v1.json").guides)
  .filter(g=>g.publication==="PUBLISHED");
assert.equal(drafts.length,224);
assert.equal(published.length,33);
const effectiveReviews=resolveSacredGuideBatchAuthorization(reviews.reviews,reviews.owner_batch_authorization);
const compiled=buildReviewedSacredGuideCorpus(drafts,seed.shrines,[...sources.sources,...researchSources.sources],effectiveReviews,published);
const base=read(destination);
const output={
  schema:"AO_ILLUSTRATED_PLACE_GUIDES_V1",
  version:"1.0.0",
  reviewed_on:base.reviewed_on,
  scope:base.scope,
  source_policy:base.source_policy,
  media_policy:base.media_policy,
  guides:compiled.guides,
};
const mode=process.argv[2]||"--check";
if(mode==="--check"){
  assert.deepEqual(base,output,
    "Published bank differs from explicitly reviewed decisions. Run --write only after source/editorial/owner approval.");
  console.log("PASS: approved bilingual bank matches decisions; "+output.guides.length+
    " approved guides, "+(drafts.length-output.guides.length)+" draft histories not added by this bank.");
}else if(mode==="--write"){
  writeFileSync(new URL("../"+destination,import.meta.url),JSON.stringify(output,null,2)+"\n");
  console.log("WROTE approved-only bilingual guide bank: "+output.guides.length+" reviewed guides.");
}else{
  throw new Error("Usage: node scripts/compile-approved-sacred-place-guides.mjs [--check|--write]");
}
