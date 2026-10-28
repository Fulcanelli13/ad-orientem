import {spawnSync} from "node:child_process";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";

// Vercel Ignored Build Step: exit 0 = skip, exit 1 = build.
// Fail OPEN: any ambiguity, empty git diff, or missing parent commits BUILDS.
// Do not gate the real app's main source, artwork, prayer, Mass, or Scripture.
const RESEARCH_ONLY_PREFIXES=[
 "assets/staged/",
 "data/geography/research/",
 "data/research/",
 "data/directory/research/",
];
const LIVE_RESEARCH_FILES=new Set([
 "data/research/mass-special-rite-music-events-20261019.v1.json",
 "data/directory/research/canonical-g0-site-admissions-b84-b90-20261026.v1.json",
]);
const NON_RUNTIME_PREFIXES=[
 ".github/","docs/","research/","reviews/","review/","tests/",
 "scripts/","legacy/","labs/","previews/",
];
const BUILD_TOOL_FILES=new Set([
 "tools/build-web-preview.mjs",
 "tools/vercel-build-eligibility.mjs",
]);
export function needsProductionBuild(changedPaths){
 if(!Array.isArray(changedPaths)||!changedPaths.length)return true;
 for(const raw of changedPaths){
  if(typeof raw!=="string"||!raw.trim()||raw.startsWith("/")||raw.includes("\\"))
   return true;
  const path=raw.trim();
  if(LIVE_RESEARCH_FILES.has(path))return true;
  if(RESEARCH_ONLY_PREFIXES.some(prefix=>path.startsWith(prefix)))continue;
  if(NON_RUNTIME_PREFIXES.some(prefix=>path.startsWith(prefix)))continue;
  if(path.startsWith("tools/")){
   if(BUILD_TOOL_FILES.has(path))return true;
   continue;
  }
  // Unknown paths and all source/runtime assets are ALWAYS deployed.
  return true;
 }
 return false;
}
export function changedFilesFromGit(){
 const result=spawnSync("git",["diff","--name-only","HEAD^","HEAD","--"],{
  encoding:"utf8",timeout:15000,maxBuffer:1024*1024,
 });
 if(result.error||result.status!==0)return null;
 return result.stdout.split(/\r?\n/).filter(Boolean);
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const changed=changedFilesFromGit();
 const deploy=needsProductionBuild(changed);
 console.log("Ad Orientem Vercel production build:",deploy?"BUILD":"SKIP",
  "changed="+(changed?.length??"GIT_UNAVAILABLE"));
 process.exit(deploy?1:0);
}
