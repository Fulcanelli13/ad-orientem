import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const master=JSON.parse(readFileSync(new URL("../data/geography/research/sacred-atlas-source-first-objects-b01-20261031.v1.json",import.meta.url),"utf8"));
const geography=JSON.parse(readFileSync(new URL("../data/geography/seed-registry.v1.json",import.meta.url),"utf8"));
const known=new Set(geography.places.map(x=>x.place_id));
assert.equal(master.schema,"AO_SACRED_ATLAS_SOURCE_FIRST_PRECISE_SUBJECT_BATCH_V1");
assert.equal(master.scope,"RESEARCH_ONLY_SOURCE_FIRST_ORIGINAL_OBJECT_MATCHING");
assert.equal(master.items.length,14);
assert.equal(new Set(master.items.map(x=>x.subject_id)).size,14);
assert(master.items.every(x=>known.has(x.canonical_place_id)),"All sacred subjects have a canonical existing Place");
assert(master.items.every(x=>x.status==="RESEARCH_ONLY_NOT_PUBLICATION_AUTHORIZED"&&x.user_prior_votes==="UNCHANGED"));
assert(master.items.every(x=>x.custodian_or_primary_reference?.length&&x.commons_candidates?.length),"Every entry needs reference and exact media source");
assert(master.items.every(x=>x.commons_candidates.every(y=>
 y.commons_file_page.startsWith("https://commons.wikimedia.org/wiki/File:")&&
 y.visual_quality_review.startsWith("NOT_APPROVED")&&y.width>=900&&y.height>=1000)));
assert.equal(master.summary.production_assets_modified,0);
assert.equal(master.summary.photos_downloaded_in_this_batch,0);
assert.equal(master.summary.publication_approvals,0);
assert(master.items.find(x=>x.subject_id==="subject:focus:guadalupe-tilma").blocking_gates.some(x=>x.includes("PD_ART")));
assert(master.items.find(x=>x.subject_id==="subject:relic:FR:chartres-voile-vierge").blocking_gates.some(x=>x.includes("CURRENT_LOCATION")));
assert(master.items.find(x=>x.subject_id==="subject:relic:IT:nicholas-bari").commons_candidates[0].image_role.includes("CONTEXT_ONLY"));
assert(master.items.find(x=>x.subject_id==="subject:focus:fatima-apparition-statue-plinth").blocking_gates.some(x=>x.includes("FREEDOM_OF_PANORAMA")));
assert(master.items.find(x=>x.subject_id==="subject:round1-review:DE:altoetting-gnadenkapelle:9").commons_candidates[0].notes.includes("23 Feb 2011"));
assert(master.items.find(x=>x.subject_id==="subject:relic:IT:anthony-padua-tongue").editorial_action.includes("RETAIN"));
console.log("Sacred Atlas source-first B01: 14 exact canonical subjects; custodian/file references and publication holds PASS.");
