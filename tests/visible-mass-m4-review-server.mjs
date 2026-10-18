import assert from "node:assert/strict";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const child=spawn(process.execPath,["tools/serve-visible-mass-review.mjs","--port=0"],{cwd:root,stdio:["ignore","pipe","pipe"]});
let output="",stderr="";
child.stdout.on("data",v=>output+=v.toString());
child.stderr.on("data",v=>stderr+=v.toString());
const port=await new Promise((done,fail)=>{
 const interval=setInterval(()=>{
  const match=output.match(/http:\/\/127\.0\.0\.1:(\d+)\/previews\//);
  if(match){clearInterval(interval);clearTimeout(timeout);done(Number(match[1]));}
  else if(child.exitCode!==null){clearInterval(interval);clearTimeout(timeout);fail(Error("Server exited: "+stderr));}
 },40);
 const timeout=setTimeout(()=>{clearInterval(interval);fail(Error("Preview server did not start: "+stderr));},7000);
});
const base="http://127.0.0.1:"+port;
try{
 let result=await fetch(base+"/",{redirect:"manual"});
 assert.equal(result.status,302);
 assert.equal(result.headers.get("location"),"/previews/visible-mass-3d/sanctuary-hotspot-pilot.html");
 result=await fetch(base+"/previews/visible-mass-3d/sanctuary-hotspot-pilot.html");
 assert.equal(result.status,200);
 assert.match(await result.text(),/Explore the sanctuary/);
 result=await fetch(base+"/previews/visible-mass-3d/visible-mass-m4-panorama.mjs");
 assert.equal(result.status,200);
 assert.match(result.headers.get("content-type"),/javascript/);
 result=await fetch(base+"/data/glossary/concepts-001-150.v1.json");
 assert.equal(result.status,200);
 const glossary=await result.json();assert.ok(glossary);
 for(const file of ["/.git/config","/.env","/package.json","/tools/serve-visible-mass-review.mjs","/previews/visible-mass-3d/../index.html"]){
  result=await fetch(base+file);
  assert.equal(result.status,403,"Private/other file must remain blocked: "+file);
 }
 result=await fetch(base+"/previews/visible-mass-3d/sanctuary-hotspot-pilot.html",{method:"POST"});
 assert.equal(result.status,405);
 console.log("PASS M4 reviewer preview: Windows-local HTTP, required resources, no hidden/project-root files, read-only.");
}finally{child.kill("SIGTERM");}
