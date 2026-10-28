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
const historicalSpritePath="assets/generated-sprites";
const offlineOnlyCatenaPaths=["matthew","mark","luke","john"].map(name=>"data/scripture/catena/"+name+".json");
const historicalSpriteNames=readdirSync(join(process.cwd(),historicalSpritePath)).filter(name=>name.endsWith(".svg"));
assert.ok(historicalSpriteNames.length>=3,"Historical sprite bank unexpectedly empty");
const retainedRuntimeResearch={
 "data/research":["mass-special-rite-music-events-20261019.v1.json"],
 "data/directory/research":["canonical-g0-site-admissions-b84-b90-20261026.v1.json"],
};
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
 "data/scripture/catena/chunks/manifest.v1.json",
 "data/scripture/catena/chunks/matthew-01-04.json",
 "data/scripture/catena/chunks/luke-01-04.json",
 "data/scripture/catena/chunks/mark-01-04.json",
 "data/scripture/catena/chunks/john-01-04.json",
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
const slimmedBytes=Object.entries(retainedRuntimeResearch).reduce((sum,[path,files])=>{
 const retained=files.reduce((total,name)=>total+sizeOf(join(root,path,name)),0);
 return sum+sizeOf(join(root,path))-retained;
},0);
assert.ok(slimmedBytes>8000000,"Research output pruning lost expected savings");

const run=spawnSync(process.execPath,["tools/build-web-preview.mjs"],{
 cwd:root,encoding:"utf8",maxBuffer:1024*1024
});
assert.equal(run.status,0,run.stderr+"\n"+run.stdout);
const report=JSON.parse(run.stdout.trim().split("\n").at(-1));
assert.deepEqual(report.excludedResearchPaths,excluded);
assert.deepEqual(report.retainedRuntimeResearch,retainedRuntimeResearch);
assert.equal(report.excludedHistoricalSpritePath,historicalSpritePath);
assert.deepEqual(report.excludedOfflineOnlyCatenaPaths,offlineOnlyCatenaPaths);

for(const path of excluded){
 assert.equal(existsSync(join(output,path)),false,"Non-runtime research unexpectedly published: "+path);
 assert.ok(existsSync(join(root,path)),"Build modified GitHub-owned research: "+path);
}
for(const [path,kept] of Object.entries(retainedRuntimeResearch)){
 const out=join(output,path);
 assert.deepEqual(readdirSync(out).sort(),[...kept].sort(),
  "Research output includes unapproved audit files or is missing a required fixture: "+path);
 for(const name of kept){
  assert.deepEqual(readFileSync(join(out,name)),readFileSync(join(root,path,name)),
   "Runtime research fixture has changed: "+path+"/"+name);
 }
}
for(const path of offlineOnlyCatenaPaths){
 assert.equal(existsSync(join(output,path)),false,"Old full-Gospel Catena archive copied into production: "+path);
 assert.ok(existsSync(join(root,path)),"Original Catena source was lost: "+path);
}
const chunkFiles=readdirSync(join(output,"data/scripture/catena/chunks")).filter(f=>/^(?:matthew|mark|luke|john)-\\d{2}-\\d{2}\\.json$/.test(f));
assert.equal(chunkFiles.length,23,"Live Catena chapter-pack census changed");
assert.equal(existsSync(join(output,historicalSpritePath)),false,"Historical sprites were copied into production");
assert.equal(existsSync(join(root,historicalSpritePath)),true,"Historical SVG sprite source bank was deleted");
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
for(const name of readdirSync(root)){
 if(/^ao-(?:boot|inline|packed)-[\\w.-]+\\.js$/.test(name))runtimeSourceFiles.push(join(root,name));
}
const runtimeReferences=[];
for(const file of runtimeSourceFiles){
 const source=readFileSync(file,"utf8");
 for(const path of excluded){
  if(source.includes(path+"/"))runtimeReferences.push(relative(root,file)+": "+path);
 }
}
assert.deepEqual(runtimeReferences,[],"Runtime files reference excluded deployment paths");
const historicalSpriteReferences=[];
for(const file of runtimeSourceFiles){
 const source=readFileSync(file,"utf8");
 if(source.includes(historicalSpritePath+"/"))
  historicalSpriteReferences.push(relative(root,file)+": historical sprite directory");
 for(const name of historicalSpriteNames){
  if(source.includes(name))
   historicalSpriteReferences.push(relative(root,file)+": "+name);
 }
}
assert.deepEqual(historicalSpriteReferences,[],
 "First-party runtime still references a historical sprite: preserve source and block deploy");
const directCatenaFetchReferences=[];
for(const file of runtimeSourceFiles){
 const source=readFileSync(file,"utf8");
 for(const path of offlineOnlyCatenaPaths){
  if(source.includes(path))directCatenaFetchReferences.push(relative(root,file)+": "+path);
 }
}
assert.deepEqual(directCatenaFetchReferences,[],
 "A deployed script directly references an archival full-Gospel Catena URL");
const unresolvedResearchRefs=[];
for(const file of runtimeSourceFiles){
 const source=readFileSync(file,"utf8");
 for(const [path,kept] of Object.entries(retainedRuntimeResearch)){
  const marker=path+"/";
  let i=0;
  while((i=source.indexOf(marker,i))!==-1){
   const suffix=source.slice(i+marker.length,i+marker.length+150);
   if(!kept.some(name=>suffix.startsWith(name)))
    unresolvedResearchRefs.push(relative(root,file)+": "+marker+suffix.slice(0,90));
   i+=marker.length;
  }
 }
}
assert.deepEqual(unresolvedResearchRefs,[],
 "Runtime refers to a research file that would be missing from deployment");
console.log("PASS — "+Math.round(sourcePrunedBytes/1e5)/10+
 " MB excluded by original rules; "+Math.round(slimmedBytes/1e5)/10+
 " MB of additional research audit data omitted; historical sprites and archival Catena duplicates omitted; runtime fixtures intact");
