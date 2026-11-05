// Shared build/postdeploy contract for the GitHub Pages curated release.
// Proves the served critical bytes belong to the exact workflow source SHA.
// This is intentionally not a digest of every byte in the >100-file site.
import assert from "node:assert/strict";
import {createHash} from "node:crypto";

export const RELEASE_PROOF_FILENAME="release-proof.json";
export const RELEASE_PROOF_SCHEMA="ad-orientem/github-pages-proof/v1";
export const RELEASE_PROOF_REPOSITORY="Fulcanelli13/ad-orientem";
const FIXED_CRITICAL_PATHS=[
 "index.html",
 "sw.js",
 "Ad-Orientem-v43.19.webmanifest",
 "data/geography/seed-registry.v1.json",
 "data/geography/approved-place-media.v1.json",
 // Published, source-owned Prayer modules must match the same release as the shell.
 "src/pray/novena-runtime.js",
 "src/pray/prayer-design-pilot.js",
 "src/pray/presentation-runtime.js",
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
