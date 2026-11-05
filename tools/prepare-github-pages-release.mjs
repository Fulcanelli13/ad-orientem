// Finalize the existing static Ad Orientem release for GitHub Pages.
// This only edits build output; canonical source and approved media remain unchanged.
import {readFile,writeFile,readdir,stat,lstat} from "node:fs/promises";
import {resolve,join,dirname} from "node:path";
import {fileURLToPath} from "node:url";
import {execFileSync} from "node:child_process";
import {createReleaseProof,criticalReleasePaths,releaseCommitSha,releaseSha256,RELEASE_PROOF_FILENAME} from "./github-pages-release-proof.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const output=resolve(root,"dist/web-preview");
const entry=join(output,"index.html");
const manifest=join(output,"Ad-Orientem-v43.19.webmanifest");
const serviceWorker=join(output,"sw.js");
const forbiddenTop=new Set([".github","docs","tests","tools","research","review","reviews","legacy","node_modules","package.json","vercel.json",".git"]);
const fail=message=>{throw Error("GITHUB_PAGES_RELEASE: "+message);};

const index=await readFile(entry,"utf8");
const pwa=JSON.parse(await readFile(manifest,"utf8"));
const sw=await readFile(serviceWorker,"utf8");
if(!index.startsWith("<!doctype html>")||!/<html\b/i.test(index))fail("missing HTML entrypoint");
if(/<base\s+[^>]*href=["']\//i.test(index))fail("root-absolute base breaks GitHub project URL");
if(/(?:src|href)=["']\/(?!\/)/i.test(index))fail("root-absolute entrypoint asset path breaks project URL");
if(pwa.start_url!=="./"||pwa.scope!=="./"||pwa.id!=="./")fail("PWA manifest is not Pages subpath-relative");
if(!sw.includes('new URL(self.registration.scope)'))fail("service worker lost containing-scope routing");
const all=await readdir(output);
for(const name of all)if(forbiddenTop.has(name))fail("source/internal asset accidentally published: "+name);

// Vercel provided X-Robots-Tag; GitHub Pages has no equivalent configurable
// HTTP headers. Preserve the explicit non-indexing intent in the built HTML.
const robots='<meta name="robots" content="noindex,nofollow,noarchive">';
const html=/<meta\s+name=["']robots["']/i.test(index)?index:index.replace(/<head>/i,"<head>"+robots);
if(!html.includes(robots))fail("unable to install robots directive");
await writeFile(entry,html);
await writeFile(join(output,"404.html"),html);
await writeFile(join(output,".nojekyll"),"");
const robotsTxt=await readFile(join(output,"robots.txt"),"utf8");
if(!/Disallow:\s*\//.test(robotsTxt))fail("robots.txt lost crawler exclusion");

// Bind the *curated* upload to the exact checkout and workflow run.
// A later smoke test reads this file from public Pages (not GitHub source)
// and verifies hashes of the critical published bytes.
const checkoutSha=releaseCommitSha(execFileSync("git",["rev-parse","HEAD"],{cwd:root,encoding:"utf8"}).trim());
if(process.env.GITHUB_SHA&&releaseCommitSha(process.env.GITHUB_SHA)!==checkoutSha){
 fail("GitHub Actions SHA differs from the checked-out source commit");
}
const paths=criticalReleasePaths(html);
const criticalSha256={};
for(const path of paths){
 criticalSha256[path]=releaseSha256(await readFile(join(output,path)));
}
const proof=createReleaseProof({
 sha:checkoutSha,
 runId:process.env.GITHUB_RUN_ID||null,
 indexHtml:html,
 assetSha256:criticalSha256,
});
await writeFile(join(output,RELEASE_PROOF_FILENAME),JSON.stringify(proof,null,2)+"\n");

// GitHub Pages has a 1GB published-site ceiling. Abort before uploading an
// oversized artifact rather than silently stripping required application data.
let bytes=0,files=0;
async function inspect(dir){
 for(const entry of await readdir(dir,{withFileTypes:true})){
  const filepath=join(dir,entry.name);
  const fs=lstat(filepath);
  const item=await fs;
  if(item.isSymbolicLink())fail("symbolic link in release: "+filepath);
  if(item.isDirectory())await inspect(filepath);
  else if(item.isFile()){bytes+=item.size;files++;}
  else fail("non-file/non-directory release entry: "+filepath);
 }
}
await inspect(output);
if(bytes>1_000_000_000)fail("site exceeds GitHub Pages 1GB limit: "+bytes+" bytes");
if(files<100)fail("unexpectedly small site output, refusing partial release: "+files+" files");
console.log(JSON.stringify({
 host:"GitHub Pages",root:"dist/web-preview",files,bytes,
 releaseSha:checkoutSha,workflowRunId:proof.workflow_run_id,verifiedCriticalAssets:paths.length,
 pagesMaxBytes:1_000_000_000,
 safeForProjectSubpath:true,
 noindexPreserved:true,
 approvedMediaUnchanged:true,
 canonicalResearchExcluded:true
}));
