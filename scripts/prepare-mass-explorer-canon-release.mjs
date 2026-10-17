#!/usr/bin/env node
/**
 * Import owner review decisions and prepare a NONPUBLIC release proposal.
 * Usage:
 *   node scripts/prepare-mass-explorer-canon-release.mjs
 *   node scripts/prepare-mass-explorer-canon-release.mjs path/to/exported-decisions.json
 *
 * No file in data/learn/ approved publication manifests is ever written.
 */
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,isAbsolute} from "node:path";
import {fileURLToPath} from "node:url";
import {
 canonReviewTemplate,reconcileCanonReviewDecisions
} from "./mass-explorer-canon-decision-core.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const read=async path=>JSON.parse(await readFile(path,"utf8"));
const source=async path=>read(resolve(root,path));
const [first,remaining,formation,manifest]=await Promise.all([
 "data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json",
 "data/learn/research/mass-explorer-remaining-six-release-candidates-20261016.v1.json",
 "data/learn/mass-formation-campion.v1.json",
 "data/learn/mass-explorer-approved-studies.v1.json"
].map(source));
if(first.status!=="EDITORIAL_CANDIDATES_NOT_HUMAN_APPROVED"||
   remaining.status!=="EDITORIAL_CANDIDATES_NOT_HUMAN_APPROVED")
 throw new Error("Only unpublished draft Canon candidates may enter review import");
const candidates=[...first.studies,...remaining.studies].sort((a,b)=>a.id.localeCompare(b.id));
const input=process.argv[2];
if(process.argv.length>3)throw new Error("One optional decision export path only");
const decisions=input?await read(isAbsolute(input)?input:resolve(process.cwd(),input)):
 canonReviewTemplate(candidates);
const proposal=reconcileCanonReviewDecisions({
 decisions,candidates,formation,publicManifest:manifest
});
const dir=resolve(root,"artifacts/p2-canon-decision-import");
await mkdir(dir,{recursive:true});
const formatted=obj=>JSON.stringify(obj,null,2)+"\n";
await writeFile(resolve(dir,"release-proposal-NOT-PUBLISHED.json"),formatted(proposal));
if(!input)await writeFile(resolve(dir,"blank-owner-decisions-template.json"),formatted(decisions));
console.log("PASS Canon wording review reconciliation: "+proposal.totals.approved_wording+
 "/8 owner wording approvals, "+proposal.totals.needs_revision+" revisions, "+
 proposal.totals.unreviewed+" pending; "+proposal.totals.public_studies+
 " public publications. Rights/publication clearance remains a separate gate.");
