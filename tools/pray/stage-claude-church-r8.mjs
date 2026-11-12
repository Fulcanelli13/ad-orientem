/**
 * Stage the owner's ORIGINAL Claude/R8 church files for same-origin review.
 * This is deliberately a local import from the user-provided R8 source,
 * not a network download or an alternative church renderer.
 *
 * node tools/pray/stage-claude-church-r8.mjs \
 *   --source /path/to/Ad_Orientem \
 *   --dest assets/pray-church
 *
 * The GitHub repository must not publish this until original art provenance,
 * phone acceptance and route return are reviewed. Fonts are not copied.
 */
import {cp,mkdir,readFile,readdir,rm,stat,writeFile} from "node:fs/promises";
import {createHash} from "node:crypto";
import {resolve,join,dirname,relative,sep} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"../..");
const sha256=s=>createHash("sha256").update(s).digest("hex");
const marker="AO_CHURCH_HOST_R10_PAUSE_BRIDGE";
const bridge=
// This listener is inserted into the original Church's existing JS scope,
// where churchHide/churchShow/S are already defined. It does not replace
// renderer geometry, camera rules, paintings, or door-to-gallery navigation.
`
/* ${marker} */
window.addEventListener("message",function(event){
 if(event.source!==window.parent||event.origin!==window.location.origin)return;
 var message=event.data;
 if(!message||message.aoChurchHost!==1)return;
 if(message.type==="suspend")churchHide();
 else if(message.type==="resume"&&S.view==="church")churchShow();
});
`;

export async function stageClaudeChurchR8(source,dest,{overwrite=false}={}){
 const src=resolve(source),target=resolve(dest);
 if(src===target||target.startsWith(src+sep))throw Error("Destination must not overwrite the source");
 const original=await readFile(join(src,"prayers.html"),"utf8");
 for(const term of ["function churchShow","function churchHide","function openLectern",
  "function aoRestoreNovenaOrigin","AO_PRAY_APP_V1","function walkable"]){
  if(!original.includes(term))throw Error("Unsupported Church source: missing "+term);
 }
 if(original.includes(marker))throw Error("Source was already staged; use the original R8");
 // The owner's R8 uses a final boot() call. Allow harmless indentation in
 // synthetic fixtures while still inserting immediately before that call.
 const anchor="boot();";
 const pos=original.lastIndexOf(anchor);
 if(pos<0)throw Error("Original Church boot() anchor not found");
 const modified=original.slice(0,pos)+bridge+original.slice(pos);
 const images=[...new Set([...original.matchAll(/assets\/img\/[a-z0-9_.-]+/g)].map(x=>x[0]))];
 const missing=[];
 for(const asset of images){
  try{const info=await stat(join(src,asset));if(!info.isFile())missing.push(asset)}
  catch{missing.push(asset)}
 }
 if(missing.length)throw Error("Missing referenced Church art: "+missing.join(", "));
 if(!overwrite){
  try{await stat(target);throw Error("Destination exists: pass --force to overwrite")}
  catch(e){if(e.code!=="ENOENT")throw e}
 }else await rm(target,{recursive:true,force:true});
 await mkdir(join(target,"assets"),{recursive:true});
 await writeFile(join(target,"prayers.html"),modified,"utf8");
 await cp(join(src,"assets/ao-embed.js"),join(target,"assets/ao-embed.js"));
 let css=await readFile(join(src,"assets/ao.css"),"utf8");
 // Do not copy/distribute the R8 font bundles. The installed production
 // typography and system serif faces are acceptable for this review pilot.
 css=css.replace(/@font-face\s*\{[^}]*\}/g,"");
 await writeFile(join(target,"assets/ao.css"),css,"utf8");
 for(const dir of ["img","icons"]){
  const sourceDir=join(src,"assets",dir);
  try{await stat(sourceDir)}catch{if(dir==="icons")continue;throw Error("Missing required "+dir)}
  await cp(sourceDir,join(target,"assets",dir),{recursive:true});
 }
 try{await cp(join(src,"assets/ao-brand-emblem.png"),join(target,"assets/ao-brand-emblem.png"))}
 catch{} // optional identity asset; the Church may use the app shell's emblem.
 const manifest={
  version:"AO_CLAUDE_CHURCH_R10_REVIEW",
  origin:"Owner-supplied Ad Orientem R8 Prayer Church review package",
  originalSha256:sha256(original),
  stagedSha256:sha256(modified),
  sourceArtworkCount:images.length,
  published:false,fontsCopied:false,
  changedCode:"One pause/resume message listener inserted before boot()",
  authority:"Original Claude Church retains all geometry, painting choices, galleries and cinematics",
  validation:"Staging only; browser, rights and production route gates still required"
 };
 await writeFile(join(target,"church-review-manifest.json"),JSON.stringify(manifest,null,2)+"\n");
 return {target,manifest};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const get=key=>{const i=process.argv.indexOf(key);return i>=0?process.argv[i+1]:null};
 const source=get("--source"),dest=get("--dest")||join(root,"artifacts/pray-church-stage");
 if(!source){
  console.error("Usage: node tools/pray/stage-claude-church-r8.mjs --source /path/to/Ad_Orientem [--dest assets/pray-church] [--force]");
  process.exitCode=2;
 }else{
  stageClaudeChurchR8(source,dest,{overwrite:process.argv.includes("--force")})
   .then(r=>console.log("Staged untouched renderer with host pause bridge: "+JSON.stringify(r.manifest)))
   .catch(e=>{console.error(e);process.exitCode=1});
 }
}
