#!/usr/bin/env node
// Read-only audit. This is an inventory, NEVER a branch deletion mechanism.
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
const repo=process.env.GITHUB_REPOSITORY;
if(!repo||!/^[\w.-]+\/[\w.-]+$/.test(repo))throw new Error("GITHUB_REPOSITORY missing");
const api=path=>JSON.parse(execFileSync("gh",["api","--paginate","--slurp",`repos/${repo}/${path}`],{encoding:"utf8",maxBuffer:35*1024*1024})).flat();
const branches=api("branches?per_page=100");
const prs=api("pulls?state=all&per_page=100");
const byBranch=new Map();
for(const pr of prs){
  if(pr.head?.repo?.full_name!==repo)continue;
  const list=byBranch.get(pr.head.ref)||[];
  list.push(pr);
  byBranch.set(pr.head.ref,list);
}
const rows=[];
for(const b of branches){
  const refs=byBranch.get(b.name)||[];
  const active=refs.some(pr=>pr.state==="open");
  const exact=refs.filter(pr=>pr.head.sha===b.commit.sha);
  let classification;
  if(b.name==="main"||b.protected)classification="PROTECTED";
  else if(/^(archive|release|snapshot|donor|production)\//.test(b.name)||/^baseline/.test(b.name))classification="HISTORICAL_HOLD";
  else if(active)classification="OPEN_PR";
  else if(exact.some(pr=>pr.merged_at))classification="MERGED_PR_HEAD_PENDING_RETIREMENT";
  else if(exact.some(pr=>pr.state==="closed"&&!pr.merged_at))classification="CLOSED_UNMERGED_REVIEW";
  else if(refs.length)classification="PR_HEAD_DIVERGED_REVIEW";
  else classification="NO_ASSOCIATED_PR_REVIEW";
  rows.push({branch:b.name,sha:b.commit.sha,classification,pr_numbers:refs.map(p=>p.number),exact_pr_numbers:exact.map(p=>p.number)});
}
// Read-only second-pass content audit for ambiguous branch heads.
// Unlike the PR-index pass, this tests file deltas against current production.
const reviewClasses=new Set(["CLOSED_UNMERGED_REVIEW","PR_HEAD_DIVERGED_REVIEW","NO_ASSOCIATED_PR_REVIEW"]);
const mainRef="refs/remotes/origin/main";
const git=(...args)=>execFileSync("git",args,{encoding:"utf8",maxBuffer:24*1024*1024}).trim();
const equal=(...args)=>{try{execFileSync("git",["diff","--quiet",...args],{stdio:"ignore"});return true;}
  catch(e){if(e.status===1)return false;throw e;}};
const revTree=sha=>git("rev-parse",sha+"^{tree}");
const mainSha=git("rev-parse",mainRef),mainTree=revTree(mainSha);
const dispositions={};
for(const row of rows){
  if(!reviewClasses.has(row.classification))continue;
  try{
    const branchSha=git("rev-parse","refs/remotes/origin/"+row.branch);
    if(branchSha!==row.sha)throw new Error("Remote head disagrees with GitHub API");
    const shared=git("merge-base",mainSha,branchSha);
    const deltaRaw=execFileSync("git",["diff","--name-only","-z",shared,branchSha],{encoding:"utf8",maxBuffer:24*1024*1024});
    const changedPaths=deltaRaw.split("\0").filter(Boolean);
    const revisionCount=Number(git("rev-list","--count",shared+".."+branchSha));
    const sameWholeTree=revTree(branchSha)===mainTree;
    const touchedMatch=changedPaths.length<=500 ? equal(branchSha,mainSha,"--",...changedPaths) : null;
    let evidenceClass;
    if(sameWholeTree)evidenceClass="EXACT_PRODUCTION_TREE";
    else if(changedPaths.length===0)evidenceClass="NO_BRANCH_DELTA";
    else if(touchedMatch===true)evidenceClass="ALL_TOUCHED_PATHS_ALREADY_MATCH";
    else if(touchedMatch===null)evidenceClass="COMPLEX_DELTA_MANUAL_REVIEW";
    else evidenceClass="UNIQUE_OR_SUPERSEDED_DIFFERENCES_REVIEW";
    row.content_evidence=evidenceClass;
    row.common_ancestor=shared;
    row.commits_ahead=revisionCount;
    row.touched_paths=changedPaths.length;
    row.sample_paths=changedPaths.slice(0,12);
    dispositions[evidenceClass]=(dispositions[evidenceClass]||0)+1;
  }catch(e){
    row.content_evidence="AUDIT_UNAVAILABLE_HOLD";
    row.audit_error=String(e.message||e).slice(0,240);
    dispositions.AUDIT_UNAVAILABLE_HOLD=(dispositions.AUDIT_UNAVAILABLE_HOLD||0)+1;
  }
}
rows.sort((a,b)=>a.classification.localeCompare(b.classification)||a.branch.localeCompare(b.branch));
const tally={};
for(const row of rows)tally[row.classification]=(tally[row.classification]||0)+1;
mkdirSync("artifacts/branch-triage",{recursive:true});
writeFileSync("artifacts/branch-triage/inventory.json",JSON.stringify({generated:new Date().toISOString(),repo,mainSha,branchCount:rows.length,classes:tally,contentEvidenceClasses:dispositions,items:rows},null,2)+"\n");
const tsv=["classification\tbranch\tsha\tassociated_prs\texact_prs\tcontent_evidence\tcommits_ahead\ttouched_paths\tchanged_path_samples",...rows.map(r=>[r.classification,r.branch,r.sha,r.pr_numbers.join(","),r.exact_pr_numbers.join(","),r.content_evidence||"",r.commits_ahead??"",r.touched_paths??"",(r.sample_paths||[]).join(",")].join("\t"))].join("\n")+"\n";
writeFileSync("artifacts/branch-triage/inventory.tsv",tsv);
const counts=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
const md=["## Remaining branch triage","This is a **read-only classification**. Even a content match does not authorize deleting unique source history.","",...counts.map(([k,n])=>"- "+k+": **"+n+"**"),"","### Production-content comparison",...Object.entries(dispositions).sort((a,b)=>b[1]-a[1]).map(([k,n])=>"- "+k+": **"+n+"**"),"","Total heads: **"+rows.length+"**, compared with main **"+mainSha.slice(0,12)+"**. Any differences require owner review.","Uploaded TSV/JSON include exact GitHub branch SHAs, PR associations, changed path samples, and reasons for holds."].join("\n");
if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,md+"\n",{flag:"a"});
console.log(md);
console.log("CONTENT_MATCH_CANDIDATES="+JSON.stringify(rows.filter(r=>["EXACT_PRODUCTION_TREE","NO_BRANCH_DELTA","ALL_TOUCHED_PATHS_ALREADY_MATCH"].includes(r.content_evidence)).map(r=>({branch:r.branch,sha:r.sha,classification:r.classification,content_evidence:r.content_evidence,prs:r.pr_numbers,commits_ahead:r.commits_ahead,touched_paths:r.touched_paths})))));
