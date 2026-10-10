#!/usr/bin/env node
// Conservative, reversible PR head retirement. Apply only from governance CI.
// A verified archive tag retains all commits before an obsolete branch is deleted.
import {execFileSync} from "node:child_process";
import {readFileSync,mkdirSync,writeFileSync} from "node:fs";
const repo=process.env.GITHUB_REPOSITORY;
if(!repo||!/^[\w.-]+\/[\w.-]+$/.test(repo))throw Error("GITHUB_REPOSITORY required");
const apply=process.argv.includes("--apply");
const path="data/governance/closed-pr-archive-pilot-2026-10-10.json";
const ledger=JSON.parse(readFileSync(path,"utf8"));
if(ledger.schema!=="ao.github.closed-pr-archival-pilot.v1")throw Error("Wrong ledger schema");
const gh=url=>JSON.parse(execFileSync("gh",["api",url],{encoding:"utf8",maxBuffer:8*1024*1024}));
const ghMut=(method,url,fields)=>JSON.parse(execFileSync("gh",["api","-X",method,url,...fields.flatMap(([k,v])=>["-f",k+"="+v])],{encoding:"utf8",maxBuffer:8*1024*1024}));
const git=(...args)=>execFileSync("git",args,{encoding:"utf8",maxBuffer:8*1024*1024}).trim();
const cutoff=Date.now()-72*60*60*1000;
const open=JSON.parse(execFileSync("gh",["api","--paginate","--slurp","repos/"+repo+"/pulls?state=open&per_page=100"],{encoding:"utf8",maxBuffer:16*1024*1024})).flat();
const openHeads=new Set(open.filter(p=>p.head?.repo?.full_name===repo).map(p=>p.head.ref));
const out=[];
for(const record of ledger.records){
  const {pr,branch,sha,archive_tag}=record;
  const item={pr,branch,sha,archive_tag,status:"HOLD"};
  out.push(item);
  try{
    if(!Number.isInteger(pr)||!/^[0-9a-f]{40}$/.test(sha)||!branch||
       /^(main|archive\/|release\/|snapshot\/|baseline|donor\/|production\/)/.test(branch)||
       !/^[A-Za-z0-9_.\/-]+$/.test(branch)||branch.includes("..")||
       !/^archive\/closed-pr\/pr\d+$/.test(archive_tag)||
       archive_tag!=="archive/closed-pr/pr"+pr)throw Error("Unsafe ledger row");
    if(openHeads.has(branch))throw Error("Still used by open PR");
    const source=gh("repos/"+repo+"/pulls/"+pr);
    if(source.state!=="closed"||source.merged_at||
       source.head?.ref!==branch||source.head?.sha!==sha||
       source.head?.repo?.full_name!==repo)throw Error("Closed-unmerged PR/head/sha mismatch");
    if(!source.closed_at||Date.parse(source.closed_at)>cutoff)throw Error("Closed less than 72 hours ago");
    const live=gh("repos/"+repo+"/branches/"+branch);
    if(live.protected||live.commit?.sha!==sha)throw Error("Live ref changed or protected");
    if(git("rev-parse","refs/remotes/origin/"+branch)!==sha)throw Error("Git fetched branch SHA changed");
    // Do not retire named branches referenced by workflows/package execution.
    let operationalRef=false;
    try{const grep=git("grep","-F","-n","-e",branch,"--",".github/workflows","package.json");
      if(grep)operationalRef=true;
    }catch(e){if(e.status!==1)throw e;}
    if(operationalRef)throw Error("Referenced by production workflow/package scripts");
    let archived=null;
    try{archived=gh("repos/"+repo+"/git/ref/tags/"+archive_tag);}
    catch(e){if(!String(e).includes("404"))throw e;}
    if(archived&&archived.object?.sha!==sha)throw Error("Existing archive tag points elsewhere");
    item.status=apply?"TAGGING":"ELIGIBLE";
    if(apply){
      if(!archived)ghMut("POST","repos/"+repo+"/git/refs",[["ref","refs/tags/"+archive_tag],["sha",sha]]);
      const verified=gh("repos/"+repo+"/git/ref/tags/"+archive_tag);
      if(verified.object?.sha!==sha)throw Error("Archive tag verification failed; branch retained");
      item.status="TAG_VERIFIED";
      // Atomic lease: a concurrent push prevents removal of a new commit.
      git("push","--porcelain","--force-with-lease=refs/heads/"+branch+":"+sha,
          "origin",":refs/heads/"+branch);
      item.status="ARCHIVED_BRANCH_RETIRED";
    }
  }catch(e){
    item.status=item.status==="TAG_VERIFIED"?"TAGGED_BRANCH_RETAINED":"HOLD";
    item.reason=String(e.message||e).slice(0,350);
  }
}
mkdirSync("artifacts/closed-pr-archive",{recursive:true});
writeFileSync("artifacts/closed-pr-archive/report.json",JSON.stringify({repo,apply,generated_at:new Date().toISOString(),items:out},null,2)+"\n");
writeFileSync("artifacts/closed-pr-archive/report.tsv",
 ["pr\tbranch\tsha\tarchive_tag\tstatus\treason",
 ...out.map(r=>[r.pr,r.branch,r.sha,r.archive_tag,r.status,r.reason||""].join("\t"))].join("\n")+"\n");
const count=s=>out.filter(x=>x.status===s).length;
const summary=["## Reversible historical PR archive","",
 "Mode: **"+(apply?"APPLY":"AUDIT")+"**.",
 "Tagged and retired: **"+count("ARCHIVED_BRANCH_RETIRED")+"**; eligible in audit: **"+count("ELIGIBLE")+"**; held: **"+count("HOLD")+"**; tag retained but branch deletion failed: **"+count("TAGGED_BRANCH_RETAINED")+"**.",
 "","Every deletion requires closed-unmerged PR evidence, immutable SHA, no open PR, no operational reference, older than 72h, no protection, a verified archive tag and atomic Git lease.",
 "","All archived commits remain recoverable via the Git tag (see TSV artifact)."
].join("\n");
if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,summary+"\n",{flag:"a"});
console.log(summary);
for(const item of out)console.log(JSON.stringify(item));
