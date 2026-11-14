// Shared build/postdeploy contract for the GitHub Pages curated release.
// Proves the served critical bytes belong to the exact workflow source SHA.
// This is intentionally not a digest of every byte in the >100-file site.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";

export const RELEASE_PROOF_FILENAME="release-proof.json";
export const RELEASE_PROOF_SCHEMA="ad-orientem/github-pages-proof/v1";
export const RELEASE_PROOF_REPOSITORY="Fulcanelli13/ad-orientem";
// Exact-byte public release witnesses: 65-card source-owned Mass reader,
// bilingual 1962 Proper repairs, and the independent Schola. This asserts
// DEPLOYED CODE PARITY, not original printed notation or score approval.
export const MASS_SCHOLA_CRITICAL_PATHS=Object.freeze([
 "src/mass/reader-native-preview.js",
 "src/mass/reader-cue-focus.js",
 "src/mass/reader-model.js",
 "src/mass/reader-mode-switch.js",
 "src/mass/browser-entry.js",
 "src/mass/reader-proper-runtime-recovery.js",
 "src/mass/proper-reader-slots.js",
 "src/mass/ordo-mass-completeness.js",
 "src/mass/1962-april-paschal-proper-correction.js",
 "src/mass/1962-april-paschal-archival-witnesses.js",
 "src/mass/1962-passion-friday-commemorations.js",
 "src/mass/1962-commemoration-form-source.js",
 "src/mass/reader-schola.js",
 "src/mass/reader-schola-performance-ledger.js",
 "src/mass/reader-proper-gabc-bulk-join.js",
 "src/mass/reader-composed-schola-text.js",
 "src/mass/reader-rite-music-presentation.js",
 "src/mass/reader-inline-chant-selector.js",
]);
// The November 6 ICRSP Sacred Heart Low Mass is a cross-module route:
 // Home notice -> owner-backed exact votive choice -> rubrical Gloria ->
 // 65-card reader -> complete Leonine prayers outside the Mass card count.
 // Hash every participating source, including the canonical bilingual text.
 // Without these witnesses a correct index.html can conceal a broken Mass.
export const NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS=Object.freeze([
 "src/home/browser-entry.js",
 "src/home/today-h4-view.js",
 "src/calendar/icrsp-france-ordo-evidence.js",
 "src/mass/icrsp-first-friday-entry.js",
 "src/mass/icrsp-nov06-pro-papa-orations.js",
 "src/mass/reader-post-low-mass.js",
 "src/mass/reader-dom.js",
 "src/pray/canonical-data.js",
 "src/pray/horarium-leonine-source-blocks.js",
]);
// Fail the Pages release on stale Discovery source data or code, not merely stale HTML.
export const DISCOVERY_CRITICAL_PATHS=Object.freeze([
 "src/home/did-you-know-glossary.js",
 "src/home/dyk-published-feed.js",
 "src/home/dyk-520-release.js",
 "src/home/dyk-h200-release.js",
 "src/home/dyk-h225-release.js",
 "data/did-you-know/weiser-historical-20-publication.v1.json",
 "data/did-you-know/weiser-r50-sixteen-publication.v1.json",
 "data/did-you-know/weiser-r50-second-sixteen-publication.v1.json",
 "data/did-you-know/dyk-h100-pitre-ritus-24-publication.v1.json",
 "data/did-you-know/dyk-h125-multisource-25-publication.v1.json",
 "data/did-you-know/dyk-h150-originals-25-publication.v1.json",
 "data/did-you-know/dyk-h175-multisource-25-publication.v1.json",
 "data/did-you-know/dyk-h200-three-sources-25-publication.v1.json",
 "data/did-you-know/dyk-h225-world-liturgies-25-publication.v1.json",
 "data/did-you-know/dyk-customs-glossary-520.v1.json"
]);

// Source-owned optional fourteen-photo release: all adapted images, attribution
// and reader modules must have matching exact bytes in public GitHub Pages.
export const SAN_POLO_CYCLE_CRITICAL_PATHS=Object.freeze([
 ...Array.from({length:14},(_,i)=>"assets/stations/san-polo/station-"+String(i+1).padStart(2,"0")+".webp"),
 "assets/stations/san-polo/LICENSE-ATTRIBUTION.md",
 "src/pray/stations-san-polo-optional-cycle.v1.js",
 "src/pray/stations-verified-artwork-release.v1.js",
]);
const FIXED_CRITICAL_PATHS=[
 "index.html",
 "sw.js",
 "Ad-Orientem-v43.19.webmanifest",
 "data/geography/seed-registry.v1.json",
 "data/geography/approved-place-media.v1.json",
 // Published, source-owned Prayer modules must match the same release as the shell.
 "src/pray/novena-runtime.js",
 "src/pray/holy-face-janvier-1887-b25.js",
 "src/pray/holy-face-janvier-1895-fr-reader-candidate.v1.js",
 "src/pray/prayer-design-pilot.js",
 "src/pray/presentation-runtime.js",
 // Source-owned Sequentia adapter and All Souls editorial-line exclusion must
 // match the same exact SHA as the live Prayer reader; no silent stale module.
 "src/pray/mass-sequences-from-proper.v1.js",
 "src/mass/1962-all-souls-sequence-english.js",
 ...SAN_POLO_CYCLE_CRITICAL_PATHS,
 ...MASS_SCHOLA_CRITICAL_PATHS,
 ...NOV6_FIRST_FRIDAY_LEONINE_CRITICAL_PATHS,
 ...DISCOVERY_CRITICAL_PATHS,
];

export function releaseCommitSha(value){
 assert.match(String(value??""),/^[0-9a-f]{40}$/,"Release commit SHA must be exactly 40 lowercase hex digits");
 return value;
}
export function releaseRunId(value){
 if(value===null||value===undefined||value==="")return null;
 assert.match(String(value),/^[1-9][0-9]{0,19}$/,"GitHub workflow run ID must be a positive decimal string");
 return String(value);
}
export function releaseSha256(bytes){
 return createHash("sha256").update(bytes).digest("hex");
}
export function criticalReleasePaths(indexHtml){
 assert.equal(typeof indexHtml,"string","Release entrypoint HTML is required");
 const css=[...indexHtml.matchAll(/(?:href|src)=["']\.\/(ao-(?:inline|boot|packed)-[a-zA-Z0-9_.-]+\.css)["']/g)][0]?.[1];
 const js=[...indexHtml.matchAll(/(?:href|src)=["']\.\/(ao-(?:inline|boot|packed)-[a-zA-Z0-9_.-]+\.js)["']/g)][0]?.[1];
 assert.ok(css&&js,"Release entrypoint must name an approved CSS and JavaScript bundle");
 return [...FIXED_CRITICAL_PATHS,css,js].sort();
}
function validateHashes(hashes,indexHtml){
 assert.ok(hashes&&typeof hashes==="object"&&!Array.isArray(hashes),"Release proof needs an asset digest map");
 const paths=Object.keys(hashes).sort();
 const required=indexHtml===undefined?FIXED_CRITICAL_PATHS:criticalReleasePaths(indexHtml);
 for(const path of required)assert.ok(Object.hasOwn(hashes,path),"Missing critical release digest: "+path);
 if(indexHtml!==undefined)assert.deepEqual(paths,required,"Release proof must hash precisely the entrypoint's critical published assets");
 for(const [path,digest] of Object.entries(hashes)){
  assert.ok(path===RELEASE_PROOF_FILENAME?false:!path.includes("..")&&!path.startsWith("/"),"Invalid published proof asset path: "+path);
  assert.match(String(digest),/^[0-9a-f]{64}$/,"Invalid SHA-256 digest for "+path);
 }
}
export function createReleaseProof({sha,runId,indexHtml,assetSha256}){
 releaseCommitSha(sha);
 const workflowRunId=releaseRunId(runId);
 validateHashes(assetSha256,indexHtml);
 return {
  schema:RELEASE_PROOF_SCHEMA,
  repository:RELEASE_PROOF_REPOSITORY,
  source_sha:sha,
  workflow_run_id:workflowRunId,
  critical_sha256:assetSha256,
 };
}
export function verifyReleaseProof(proof,{expectedSha,expectedRunId,indexHtml}){
 assert.ok(proof&&typeof proof==="object"&&!Array.isArray(proof),"Missing release proof document");
 assert.equal(proof.schema,RELEASE_PROOF_SCHEMA,"Invalid GitHub Pages provenance schema");
 assert.equal(proof.repository,RELEASE_PROOF_REPOSITORY,"Wrong GitHub Pages release repository");
 assert.equal(proof.source_sha,releaseCommitSha(expectedSha),"Live Pages source SHA differs from this workflow's checked-out commit");
 const runId=releaseRunId(expectedRunId);
 if(runId!==null)assert.equal(proof.workflow_run_id,runId,"Live Pages artifact came from a different workflow run");
 validateHashes(proof.critical_sha256,indexHtml);
 return proof;
}
