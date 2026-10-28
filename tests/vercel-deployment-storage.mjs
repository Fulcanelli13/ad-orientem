import assert from "node:assert/strict";
import {existsSync, readFileSync, readdirSync, statSync} from "node:fs";
import {join, relative} from "node:path";
import {spawnSync} from "node:child_process";

const root=process.cwd();
const output=join(root,"dist","web-preview");
const excluded=[
 "assets/staged",
 "data/geography/research",
];
// Boot files not referenced by current index are historical Git-only witnesses,
// never production payload. The build copies only active content-addressed boot.
const indexSource=readFileSync(join(root,"index.html"),"utf8");
const activeBoot=[...indexSource.matchAll(/src=["']\.\/(ao-boot-[a-f0-9]{16}\.js)["']/g)].map(m=>m[1]);
assert.ok(activeBoot.length>=1,"No active content-addressed boot");
assert.equal(new Set(activeBoot).size,activeBoot.length,"Duplicate content-addressed boot links");
assert.ok(activeBoot.includes("ao-boot-74ea99bfe3a49436.js"),"Advent-patched boot not active");
const oldBoot="ao-boot-4ef16d2b0e26d68c.js";
assert.ok(existsSync(join(root,oldBoot)),"Historical source-contract boot witness lost");
const required=[
 "index.html",
 "sw.js",
 "src/mass/browser-entry.js",
 "src/pray/browser-entry.js",
 "data/scripture/catena/matthew.json",
 "data/explore/atlas-physical-land-50m.geojson",
 "assets/active/mass-v46",
];
const sizeOf=path=>{
 const info=statSync(path);
 return info.isDirectory()
  ?readdirSync(path).reduce((sum,name)=>sum+sizeOf(join(path,name)),0)
  :info.size;
};
const sourcePrunedBytes=excluded.reduce((total,path)=>{
 const absolute=join(root,path);
 assert.ok(existsSync(absolute),"Research source unexpectedly absent: "+path);
 return total+sizeOf(absolute);
},0);
assert.ok(sourcePrunedBytes>0,"No source-owned records were excluded");

const run=spawnSync(process.execPath,["tools/build-web-preview.mjs"],{
 cwd:root,encoding:"utf8",maxBuffer:1024*1024
});
assert.equal(run.status,0,run.stderr+"\n"+run.stdout);
const report=JSON.parse(run.stdout.trim().split("\n").at(-1));
assert.deepEqual(report.excludedResearchPaths,excluded);

for(const path of excluded){
 assert.equal(existsSync(join(output,path)),false,"Non-runtime research unexpectedly published: "+path);
 assert.ok(existsSync(join(root,path)),"Build modified GitHub-owned research: "+path);
}
assert.equal(existsSync(join(output,oldBoot)),false,"Historical boot was deployed alongside active boot");
for(const boot of activeBoot)assert.ok(existsSync(join(output,boot)),"Active boot missing from release: "+boot);
for(const path of required){
 assert.ok(existsSync(join(output,path)),"Critical runtime file missing: "+path);
}

// Fail closed if a first-party runtime module directly references an excluded URL.
// Paths remain under GitHub source control, but publishing such a URL would break.
const runtimeSourceFiles=[join(root,"index.html"),join(root,"sw.js")];
const scan=dir=>{
 for(const item of readdirSync(dir,{withFileTypes:true})){
  const path=join(dir,item.name);
  if(item.isDirectory())scan(path);
  else if(item.isFile()&&/\.(?:js|mjs|html)$/.test(item.name))runtimeSourceFiles.push(path);
 }
};
scan(join(root,"src"));
const runtimeReferences=[];
for(const file of runtimeSourceFiles){
 const source=readFileSync(file,"utf8");
 for(const path of excluded){
  if(source.includes(path+"/"))runtimeReferences.push(relative(root,file)+": "+path);
 }
}
assert.deepEqual(runtimeReferences,[],"Runtime files reference excluded deployment paths");
console.log("PASS — "+Math.round(sourcePrunedBytes/1e5)/10+
 " MB of research/staging source preserved but omitted from deployment; key runtime assets intact");
