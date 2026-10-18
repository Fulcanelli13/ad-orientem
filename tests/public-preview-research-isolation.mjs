import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {mkdtemp,mkdir,writeFile,rm,readFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";
import http from "node:http";
import {once} from "node:events";
import {
 PUBLIC_PREVIEW_RESEARCH_ISOLATION_V1,
 heldFromPublicPreview,canCopyIntoPublicPreview,
 verifyEditorialSourceManifest,assertPublicPreviewHasNoDrafts
} from "../tools/public-preview-research-boundary.mjs";

const root=resolve(new URL("..",import.meta.url).pathname);
const output=join(root,"dist/web-preview");
const migration=JSON.parse(readFileSync(join(root,"data/learn/formation-canon-migration-provenance-20261018.v1.json"),"utf8"));
const status=await verifyEditorialSourceManifest(root);
assert.equal(status.exists,true);
assert.equal(status.files,27);
assert.equal(migration.files.length,27);
for(const entry of migration.files){
 assert.equal(heldFromPublicPreview(entry.path),true,"Undisclosed research path: "+entry.path);
 assert.equal(existsSync(join(output,entry.path)),false,"Unpublished source leaked: "+entry.path);
}
for(const name of [
 "data/learn/research/formation-future-question.v1.json",
 "data/learn/research/future-unlisted-source.json",
 "data/learn/formation-historical-answer-crosswalk-20261013.v1.json",
 "data/learn/formation-canon-migration-provenance-20261018.v1.json",
 "data/learn/living-church-canon-formation-referral-contract.v1.json",
 "data/learn/living-church-p5-convergence-lock.v1.json",
 "assets/living-church/sprites/canon-neutral.webp",
 "assets/living-church/backgrounds/pius-x-papal-study.webp"
]){
 assert.equal(heldFromPublicPreview(name),true,"Unrecognized held output path: "+name);
 assert.equal(existsSync(join(output,name)),false,"Public preview includes draft material: "+name);
}
for(const name of [
 "index.html",
 "src/learn/ask-church-objective-engine.js",
 "data/learn/ltfaith-pius-x-en-witness-index.v1.json"
]){
 assert.equal(canCopyIntoPublicPreview(name),true,"Original public source accidentally denied: "+name);
 assert.equal(existsSync(join(output,name)),true,"Required app source missing: "+name);
}
assert.equal(canCopyIntoPublicPreview("../../data/learn/research/secret.json"),false);
assert.equal(canCopyIntoPublicPreview("/data/learn/research/secret.json"),false);
const verified=await assertPublicPreviewHasNoDrafts(output);
assert.equal(verified.policy,PUBLIC_PREVIEW_RESEARCH_ISOLATION_V1);
assert.equal(verified.draftPathsFound,0);

// Simulate the actual static deployment with the compiled output, not the
// source-tree review server. 404 for draft assets, 200 for legitimate app data.
const server=http.createServer(async(req,res)=>{
 const name=new URL(req.url,"http://localhost").pathname;
 try{
  const path=resolve(output,"."+decodeURIComponent(name));
  if(!path.startsWith(output+"/"))throw Error("Invalid request");
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":name.endsWith(".json")?"application/json":"application/octet-stream"});
  res.end(bytes);
 }catch{res.writeHead(404);res.end("not found");}
});
server.listen(0,"127.0.0.1");
await once(server,"listening");
try{
 const origin="http://127.0.0.1:"+server.address().port;
 for(const path of [
  "data/learn/research/formation-ai-6-partials-20261013.v1.json",
  "data/learn/research/future-unlisted-source.json",
  "data/learn/formation-historical-answer-crosswalk-20261013.v1.json",
  "data/learn/formation-canon-migration-provenance-20261018.v1.json",
  "assets/living-church/sprites/sacristan-neutral.webp"
 ]){
  const r=await fetch(origin+"/"+path);
  assert.equal(r.status,404,"Source accessible over public static HTTP: "+path);
 }
 for(const path of ["index.html","data/learn/ltfaith-pius-x-en-witness-index.v1.json"]){
  const r=await fetch(origin+"/"+path);
  assert.equal(r.status,200,"Original public route missing: "+path);
 }
}finally{await new Promise(resolve=>server.close(resolve));}

// Negative regression: a later build copy mistakenly reintroduces a draft
// path. The auditor must reject it, even though the build initially filtered.
const scratch=await mkdtemp(join(tmpdir(),"ao-preview-isolation-"));
try{
 await mkdir(join(scratch,"data/learn/research"),{recursive:true});
 await writeFile(join(scratch,"index.html"),"safe");
 await assert.rejects(
  async()=>{
   await writeFile(join(scratch,"data/learn/research/formation-leak.json"),'{"draft":true}');
   await assertPublicPreviewHasNoDrafts(scratch);
  },/UNPUBLISHED_RESEARCH_EXPOSED_IN_PUBLIC_WEB_OUTPUT/
 );
}finally{await rm(scratch,{recursive:true,force:true});}
const builder=readFileSync(join(root,"tools/build-web-preview.mjs"),"utf8");
assert.match(builder,/filter:copyFilter/);
assert.match(builder,/await assertPublicPreviewHasNoDrafts\(output\)/);
const vercel=JSON.parse(readFileSync(join(root,"vercel.json"),"utf8"));
assert.equal(vercel.buildCommand,"node tools/build-web-preview.mjs");
assert.equal(vercel.outputDirectory,"dist/web-preview");
assert.equal(vercel.git.deploymentEnabled["*"],false,
 "Branch previews must not make the source tree available through public URLs");
console.log("PASS public web preview: 27 original Folio draft source blobs held, entire future research tree blocked, source indices and unapproved character art absent, public app/Catechism intact, HTTP 404/200 verified, negative leak rejected.");
