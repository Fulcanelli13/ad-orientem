/**
 * PUBLIC VERCEL OUTPUT boundary. Draft editorial material belongs only in
 * source/review branches; query flags are NOT access controls.
 *
 * Keep all exclusions at the recursive copy boundary. Audit the assembled
 * directory as well, so a future extra copy step cannot reintroduce drafts.
 */
import {readFile,readdir,access} from "node:fs/promises";
import {relative,resolve,sep} from "node:path";

export const PUBLIC_PREVIEW_RESEARCH_ISOLATION_V1="AO_PUBLIC_PREVIEW_RESEARCH_ISOLATION_V1";
export const FOLIO_MIGRATION_PATH="data/learn/formation-canon-migration-provenance-20261018.v1.json";
export const HELD_OUTPUT_PATHS=Object.freeze([
 // Excludes every present and future editorial source pack, not just 27 names.
 /^data\/learn\/research(?:\/|$)/,
 // Two owner indexes including the main historical-question crosswalk.
 /^data\/learn\/formation-historical-answer-crosswalk(?:[.-]|$)/,
 /^data\/learn\/formation-canon-migration-provenance(?:[.-]|$)/,
 // Editorial lock/notes cannot confer an answer publication approval.
 /^data\/learn\/living-church-canon-formation-referral-contract(?:[.-]|$)/,
 /^data\/learn\/living-church-p5-convergence-lock(?:[.-]|$)/,
 // Approved for local prototypes, not yet approved for public distribution.
 /^assets\/living-church(?:\/|$)/
]);
const isSafeRelative=p=>typeof p==="string"&&p&&!p.startsWith("/")&&
 !p.includes("\\")&&!p.split("/").some(t=>t==="."||t===".."||t==="")&&
 !p.includes("\0")&&!/^[a-z]+:/i.test(p);
export function heldFromPublicPreview(path){
 if(!isSafeRelative(path))return true;
 return HELD_OUTPUT_PATHS.some(pattern=>pattern.test(path));
}
export function canCopyIntoPublicPreview(path){
 return path===""||(!path.startsWith(".")&&!heldFromPublicPreview(path));
}
function relativePosix(root,absolute){
 const p=relative(root,absolute);
 if(p==="")return "";
 if(p.startsWith(".."+sep)||p===".."||p.startsWith(sep))throw Error("Public output copy escaped source root");
 return p.split(sep).join("/");
}
export function publicCopyFilter(root){
 const rootPath=resolve(root);
 return async source=>canCopyIntoPublicPreview(relativePosix(rootPath,resolve(source)));
}
export async function verifyEditorialSourceManifest(root){
 let manifest;
 try{manifest=JSON.parse(await readFile(resolve(root,FOLIO_MIGRATION_PATH),"utf8"));}
 catch(error){if(error?.code==="ENOENT")return Object.freeze({exists:false,files:0});throw error;}
 if(manifest.schema!=="AO_CANON_SOURCE_MIGRATION_SHA_P3_V1"||
    manifest.source?.repository!=="Fulcanelli13/folio-core"||
    !Array.isArray(manifest.files)||manifest.files.length!==manifest.sourceFileCount)
  throw Error("Unverified original Folio draft source inventory; refuse public preview build");
 const seen=new Set();
 for(const row of manifest.files){
  if(!isSafeRelative(row?.path)||seen.has(row.path)||!heldFromPublicPreview(row.path)||
     !/^[a-f0-9]{40}$/.test(row.gitBlobSha||""))
   throw Error("Folio draft path not covered by public output exclusion: "+String(row?.path));
  seen.add(row.path);
  // Source reference must still exist; do not silently reinterpret or move it.
  await access(resolve(root,row.path));
 }
 return Object.freeze({exists:true,files:seen.size});
}
export async function assertPublicPreviewHasNoDrafts(output){
 const outputRoot=resolve(output),leaks=[];
 async function visit(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
   const p=resolve(dir,entry.name),r=relativePosix(outputRoot,p);
   if(heldFromPublicPreview(r)){leaks.push(r);continue;}
   if(entry.isSymbolicLink()){leaks.push(r+" (symlink)");continue;}
   if(entry.isDirectory())await visit(p);
  }
 }
 await visit(outputRoot);
 if(leaks.length)throw Error("UNPUBLISHED_RESEARCH_EXPOSED_IN_PUBLIC_WEB_OUTPUT: "+leaks.slice(0,12).join(", "));
 return Object.freeze({ok:true,policy:PUBLIC_PREVIEW_RESEARCH_ISOLATION_V1,draftPathsFound:0});
}
