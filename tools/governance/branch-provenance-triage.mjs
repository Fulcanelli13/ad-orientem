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
// Route unresolved histories by real changed paths, not branch-name folklore.
// Cross-domain and source-only work require an explicit shared-owner review.
const owners=[
  ["Mass",/^(src\/mass\/|data\/mass\/|data\/presentation\/reader-|tests\/reader-|tests\/mass-|docs\/R17-)/],
  ["Formation-Apostolate",/^(src\/(learn|apostolate)\/|data\/(learn|apostolate|formation)\/|docs\/(FORMATION|SEXUAL-ETHICS|formation\/)|tests\/(formation|sexual-ethics|apostolate|catechism|learn)-)/],
  ["Prayer",/^(src\/pray\/|data\/(pray|prayer|novena)\/|docs\/(PRAYER|NOVENA|SPIRITUAL-LIFE|pray\/)|tests\/(pray|novena|rosary)-)/],
  ["Calendar",/^(src\/calendar\/|data\/calendar\/|docs\/CALENDAR|tests\/calendar-)/],
  ["Explore-Directory",/^(src\/find\/|data\/(customs|directory|explore|geography|shrines)\/|docs\/(EXPLORE|DIRECTORY|CUSTOMS|SHRINES|research\/sacred-atlas)|tests\/(explore|directory|relic|shrines|pilgrimage|customs)-)/],
  ["Scripture",/^(src\/scripture\/|data\/scripture\/|docs\/scripture\/|tests\/scripture-)/],
  ["Glossary",/^(src\/glossary\/|data\/glossary\/|data\/reference\/catholic-glossary|tests\/glossary-)/],
  ["App-Platform",/^(src\/(app|home|settings)\/|data\/presentation\/|index\.html$|ao-(boot|packed|inline)-|\.github\/|tests\/(app|home|settings|thin-html|startup|offline)-)/]
];
const ownerOf=(paths)=>{
  const score=new Map();
  for(const p of paths)for(const [owner,re] of owners)if(re.test(p))score.set(owner,(score.get(owner)||0)+1);
  const ranked=[...score].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  if(!ranked.length)return {owner:"Cross-cutting-Unassigned",score:{}};
  const total=ranked.reduce((n,[,v])=>n+v,0);
  const winner=ranked[0][0];
  return {owner:ranked.length>1&&ranked[0][1]<total*0.55?"Cross-cutting-Multiowner":winner,
    score:Object.fromEntries(ranked)};
};
const dispositions={};
for(const row of rows){
  if(!reviewClasses.has(row.classification))continue;
  try{
    const branchSha=git("rev-parse","refs/remotes/origin/"+row.branch);
    if(branchSha!==row.sha)throw new Error("Remote head disagrees with GitHub API");
    const shared=git("merge-base",mainSha,branchSha);
    const deltaRaw=execFileSync("git",["diff","--name-only","-z",shared,branchSha],{encoding:"utf8",maxBuffer:24*1024*1024});
    const changedPaths=deltaRaw.split("\0").filter(Boolean);
    const ownership=ownerOf(changedPaths);
    row.owner=ownership.owner;
    row.owner_scores=ownership.score;
    row.changed_paths=changedPaths;
    row.source_sensitive=changedPaths.some(p=>/^(data\/(mass|learn|pray|prayer|novena|calendar|customs|directory|explore|shrines|geography|scripture|glossary)\/|docs\/research\/)/.test(p));
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
    row.owner="Cross-cutting-Unassigned";
    row.content_evidence="AUDIT_UNAVAILABLE_HOLD";
    row.audit_error=String(e.message||e).slice(0,240);
    dispositions.AUDIT_UNAVAILABLE_HOLD=(dispositions.AUDIT_UNAVAILABLE_HOLD||0)+1;
  }
}
// One reviewable domain batch per canonical owner, including full-path evidence.
// Never equate a code difference with a missing implementation.
const reviewRows=rows.filter(r=>reviewClasses.has(r.classification));
const byOwner=new Map();
for(const row of reviewRows){
  const owner=row.owner||"Cross-cutting-Unassigned";
  if(!byOwner.has(owner))byOwner.set(owner,[]);
  byOwner.get(owner).push(row);
}
const ownerSummary=Object.fromEntries([...byOwner].map(([owner,rs])=>[owner,{
  total:rs.length,
  differences:rs.filter(r=>r.content_evidence==="UNIQUE_OR_SUPERSEDED_DIFFERENCES_REVIEW").length,
  source_sensitive:rs.filter(r=>r.source_sensitive).length,
  exact_content_match:rs.filter(r=>r.content_evidence==="EXACT_PRODUCTION_TREE"||r.content_evidence==="ALL_TOUCHED_PATHS_ALREADY_MATCH"||r.content_evidence==="NO_BRANCH_DELTA").length
}]));
mkdirSync("artifacts/branch-triage/owners",{recursive:true});
const summaryRows=["# Branch reconciliation by canonical production owner","","**Read-only evidence** based on main \`"+mainSha+"\`. A branch is not declared redundant just because its current files differ from production. No branch removal or source promotion is authorized here.","","| Owner | Unresolved | Changed content | Source-sensitive | Exact-match/no-delta |","| --- | ---: | ---: | ---: | ---: |"];
for(const [owner,v] of Object.entries(ownerSummary).sort((a,b)=>b[1].total-a[1].total)){
  const slug=owner.toLowerCase();
  summaryRows.push("| ["+owner+"](owners/"+slug+".md) | "+v.total+" | "+v.differences+" | "+v.source_sensitive+" | "+v.exact_content_match+" |");
  const list=["# "+owner+" — branch history adjudication","",
    "Production baseline: \`"+mainSha+"\`. Each branch retains its original SHA; no automatic cherry-pick, merge or deletion.",
    "", "| Branch | PRs | Commits | Paths | Content comparison |","| --- | --- | ---: | ---: | --- |"];
  for(const r of byOwner.get(owner).sort((a,b)=>a.branch.localeCompare(b.branch))){
    const link="[\`"+r.branch+"\`](https://github.com/"+repo+"/tree/"+encodeURIComponent(r.branch)+")";
    list.push("| "+link+" | "+r.pr_numbers.map(n=>"[#"+n+"](https://github.com/"+repo+"/pull/"+n+")").join(", ")+" | "+(r.commits_ahead??"?")+" | "+(r.touched_paths??"?")+" | "+(r.content_evidence||"hold")+" |");
    list.push("");
    list.push("  - SHA \`"+r.sha+"\`; changed-path sample: "+(r.sample_paths||[]).map(p=>"\`"+p+"\`").join(", "));
  }
  list.push("","**Disposition:** All unverified differences remain on hold. Review original PR rationale, original source/edition and canonical production data before selectively recovering or explicitly superseding. Cross-owner cases require both owners.");
  writeFileSync("artifacts/branch-triage/owners/"+slug+".md",list.join("\n")+"\n");
}
writeFileSync("artifacts/branch-triage/OWNER-INDEX.md",summaryRows.join("\n")+"\n");
rows.sort((a,b)=>a.classification.localeCompare(b.classification)||a.branch.localeCompare(b.branch));
const tally={};
for(const row of rows)tally[row.classification]=(tally[row.classification]||0)+1;
mkdirSync("artifacts/branch-triage",{recursive:true});
writeFileSync("artifacts/branch-triage/inventory.json",JSON.stringify({generated:new Date().toISOString(),repo,mainSha,branchCount:rows.length,classes:tally,contentEvidenceClasses:dispositions,ownerSummary,items:rows},null,2)+"\n");
const tsv=["classification\tbranch\tsha\tassociated_prs\texact_prs\tcontent_evidence\tcommits_ahead\ttouched_paths\tchanged_path_samples",...rows.map(r=>[r.classification,r.branch,r.sha,r.pr_numbers.join(","),r.exact_pr_numbers.join(","),r.content_evidence||"",r.commits_ahead??"",r.touched_paths??"",(r.sample_paths||[]).join(",")].join("\t"))].join("\n")+"\n";
writeFileSync("artifacts/branch-triage/inventory.tsv",tsv);
const counts=Object.entries(tally).sort((a,b)=>b[1]-a[1]);
const md=["## Remaining branch triage","This is a **read-only classification**. Even a content match does not authorize deleting unique source history.","",...counts.map(([k,n])=>"- "+k+": **"+n+"**"),"","### Production-content comparison",...Object.entries(dispositions).sort((a,b)=>b[1]-a[1]).map(([k,n])=>"- "+k+": **"+n+"**"),"","Total heads: **"+rows.length+"**, compared with main **"+mainSha.slice(0,12)+"**. Any differences require owner review.","Uploaded TSV/JSON include exact GitHub branch SHAs, PR associations, changed path samples, and reasons for holds."].join("\n");
if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,md+"\n",{flag:"a"});
console.log(md);
const candidates=rows.filter(r=>["EXACT_PRODUCTION_TREE","NO_BRANCH_DELTA","ALL_TOUCHED_PATHS_ALREADY_MATCH"].includes(r.content_evidence));
const visibleCandidates=candidates.map(r=>({branch:r.branch,sha:r.sha,classification:r.classification,content_evidence:r.content_evidence,prs:r.pr_numbers,commits_ahead:r.commits_ahead,touched_paths:r.touched_paths}));
console.log("CONTENT_MATCH_CANDIDATES="+JSON.stringify(visibleCandidates));
console.log("OWNER_RECONCILIATION_SUMMARY="+JSON.stringify(ownerSummary));
