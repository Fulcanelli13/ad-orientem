#!/usr/bin/env node
// Read-only audit. This is an inventory, NEVER a branch deletion mechanism.
import {execFileSync} from "node:child_process";
import {mkdirSync,writeFileSync} from "node:fs";
const repo=process.env.GITHUB_REPOSITORY;
if(!repo||!/^[\w.-]+\/[\w.-]+$/.test(repo))throw new Error("GITHUB_REPOSITORY missing");
const api=path=>JSON.parse(execFileSync("gh",["api","--paginate",`repos/${repo}/${path}`],{encoding:"utf8",maxBuffer:35*1024*1024}));
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
rows.sort((a,b)=>a.classification.localeCompare(b.classification)||a.branch.localeCompare(b.branch));
const tally={};
for(const row of rows)tally[row.classification]=(tally[row.classification]||0)+1;
mkdirSync("artifacts/branch-triage",{recursive:true});
writeFileSync("artifacts/branch-triage/inventory.json",JSON.stringify({generated:new Date().toISOString(),repo,branchCount:rows.length,classes:tally,items:rows},null,2)+"\n");
const tsv=["classification\tbranch\tsha\tassociated_prs\texact_prs",...rows.map(r=>[r.classification,r.branch,r.sha,r.pr_numbers.join(","),r.exact_pr_numbers.join(",")].join("\t"))].join("\n")+"\n";
writeFileSync("artifacts/branch-triage/inventory.tsv",tsv);
const counts=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
const md=["## Remaining branch triage","This is a **read-only classification**, not clearance to delete unmerged research.","",...counts.map(([k,n])=>`- \`${k}\`: **${n}**`),"",`Total heads: **${rows.length}**. Review \`CLOSED_UNMERGED_REVIEW\`, \`PR_HEAD_DIVERGED_REVIEW\` and \`NO_ASSOCIATED_PR_REVIEW\` individually before any deletion.\n`,"Merged PR heads are handled by the separate conservative hygiene workflow. Both files are uploaded as artifacts."].join("\n");
if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,md+"\n",{flag:"a"});
console.log(md);
