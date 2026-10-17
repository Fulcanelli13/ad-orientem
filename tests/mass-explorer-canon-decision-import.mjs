import assert from "node:assert/strict";
import {readFileSync,writeFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
import {
 canonReviewTemplate,canonStudyDigest,reconcileCanonReviewDecisions
} from "../scripts/mass-explorer-canon-decision-core.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const data=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const one=data("data/learn/research/mass-explorer-first-two-release-candidates-20261016.v1.json");
const six=data("data/learn/research/mass-explorer-remaining-six-release-candidates-20261016.v1.json");
const formation=data("data/learn/mass-formation-campion.v1.json");
const publicManifest=data("data/learn/mass-explorer-approved-studies.v1.json");
const studies=[...one.studies,...six.studies].sort((a,b)=>a.id.localeCompare(b.id));
const sourceDigest=Object.fromEntries(studies.map(x=>[x.id,canonStudyDigest(x)]));
const template=canonReviewTemplate(studies);
assert.equal(template.decisions.length,8);
assert.equal(template.reviewer,null);
assert.equal(template.scope,"EDITORIAL_WORDING_ONLY_NOT_PUBLICATION");
assert.equal(new Set(template.decisions.map(x=>x.content_sha256)).size,8);
for(const entry of template.decisions)assert.match(entry.content_sha256,/^[0-9a-f]{64}$/);
const reconcile=(decisions,candidates=studies,publicFile=publicManifest)=>
 reconcileCanonReviewDecisions({decisions,candidates,formation,publicManifest:publicFile});
const pending=reconcile(template);
assert.equal(pending.totals.public_studies,0);
assert.equal(pending.totals.unreviewed,8);
assert.equal(pending.proposed_wording_only.length,0);
assert.equal(pending.public_release_permitted,false);
const deep=JSON.parse(JSON.stringify(template));
deep.reviewer="Human wording reviewer — example only";
deep.decisions.find(x=>x.study_id.endsWith(".02")).decision="approve";
deep.decisions.find(x=>x.study_id.endsWith(".05")).decision="approve";
deep.decisions.find(x=>x.study_id.endsWith(".07")).decision="revise";
deep.decisions.find(x=>x.study_id.endsWith(".07")).note="Clarify the relationship to the Memento";
const partial=reconcile(deep);
assert.equal(partial.totals.approved_wording,2);
assert.equal(partial.totals.needs_revision,1);
assert.equal(partial.totals.unreviewed,5);
assert.equal(partial.totals.potentially_eligible_after_rights,2);
assert.equal(partial.totals.public_studies,0);
assert.deepEqual(partial.proposed_wording_only.map(x=>x.id),
 ["AO.FORM.CANON.DEEP.02","AO.FORM.CANON.DEEP.05"]);
assert.ok(partial.proposed_wording_only.every(x=>
 x.release_status==="NOT_AUTHORIZED_FOR_PUBLICATION"&&
 x.formal_rights_review==="OUTSTANDING"&&
 x.editor_decision==="WORDING_APPROVED_ONLY"));
assert.ok(partial.proposed_wording_only.every(x=>!x.review_status&&!x.rights_reviewed_on));
const noName=JSON.parse(JSON.stringify(deep));
noName.reviewer=null;
const unnamed=reconcile(noName);
assert.equal(unnamed.totals.blocked_missing_reviewer,2);
assert.equal(unnamed.proposed_wording_only.length,0);
function refuses(mutator,reason){
 const value=JSON.parse(JSON.stringify(deep));mutator(value);
 assert.throws(()=>reconcile(value),/import refused/,reason);
}
refuses(x=>x.decisions[0].content_sha256="0".repeat(64),"altered digest");
refuses(x=>delete x.decisions[0].content_sha256,"missing digest");
refuses(x=>x.decisions[0].block_ids=["AO.SM.B047"],"block mismatch");
refuses(x=>x.decisions[0].decision="published","unknown state");
refuses(x=>x.decisions[0].note="x".repeat(4001),"too-long reviewer notes");
refuses(x=>x.decisions.push({...x.decisions[0]}),"duplicate decision count");
refuses(x=>x.decisions[0]={...x.decisions[1]},"duplicate owner");
refuses(x=>x.scope="RELEASED_FOR_MASS_EXPLORER","wrong scope");
refuses(x=>x.human_review_required=false,"missing human check");
refuses(x=>x.formal_rights_check_outstanding=false,"false rights approval");
refuses(x=>x.reviewer="x","invalid reviewer");
const changed=JSON.parse(JSON.stringify(studies));
changed[0].sections[0].body.en+=" Edited after approval.";
assert.notEqual(canonStudyDigest(changed[0]),sourceDigest[changed[0].id]);
assert.throws(()=>reconcile(deep,changed),/stale or missing exact-content fingerprint/);
const alteredManifest={...publicManifest,status:"RELEASED_FOR_MASS_EXPLORER",entries:[]};
assert.throws(()=>reconcile(deep,studies,alteredManifest),/original zero-release manifest/);
const tmp=mkdtempSync(join(tmpdir(),"ao-canon-decisions-"));
try{
 const input=join(tmp,"decisions.json");
 writeFileSync(input,JSON.stringify(deep,null,2));
 execFileSync(process.execPath,["scripts/prepare-mass-explorer-canon-release.mjs",input],{cwd:root,encoding:"utf8"});
 const actual=data("artifacts/p2-canon-decision-import/release-proposal-NOT-PUBLISHED.json");
 assert.deepEqual(actual.totals,partial.totals);
 assert.equal(actual.schema,"ao-mass-explorer-canon-release-proposal-v1");
 assert.equal(actual.public_release_permitted,false);
}finally{rmSync(tmp,{recursive:true,force:true})}
const after=data("data/learn/mass-explorer-approved-studies.v1.json");
assert.deepEqual(after,publicManifest,"Decision import must not alter the actual public release manifest");
console.log("PASS eight signed-content review IDs, partial approvals 2/8, five pending, one revision, strict rejection of stale/tampered review, no public release or rights fiction.");
