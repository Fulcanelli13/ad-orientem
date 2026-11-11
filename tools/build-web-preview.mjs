import {cp, readdir, rm, mkdir, writeFile, stat, access, readFile} from "node:fs/promises";
import {resolve, dirname, join, basename} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const output=resolve(root,"dist/web-preview");
const folders=["assets","data","src"];
const rootFiles=["index.html","sacred-music.html","sw.js","mass-bg.png","Ad-Orientem-v43.19.webmanifest"];
const generated=/^ao-(?:boot|inline|packed)-[\w.-]+\.(?:css|js)$/;
const disallowed=/^(?:\.|docs|tests|tools|research|legacy|review|reviews|node_modules)(?:\/|$)/;
// An older boot may remain under version control as a pinned source-contract witness.
// Only root boot scripts actually linked by the active HTML belong in the release.
const entryHtml=await readFile(join(root,"index.html"),"utf8");
const activeEntrypointAssets=new Set([...entryHtml.matchAll(/(?:src|href)=["']\.\/([^"'?#]+)["']/g)].map(x=>x[1]));
// Deploy only cleared release assets; the fourteen separately approved San Polo
// WebPs now ship through the *optional* reader, while their research archive
// remains excluded. These source-owned review/audit records
// remain intact in GitHub; only their copies in dist/web-preview are omitted.
// The fourteen San Polo photographs are intentionally present in the repository
// for QA, but are NOT published: reader bindings remain empty and exact-photo
// native pixel + 320/390 EN/FR acceptance are still outstanding (issue #2121).
// A future approval needs a separate PR that explicitly changes these holds.
const excludedResearchPaths=[
 "assets/staged",
 "data/artwork/sacred-art-category-match-989-267.v1.json",
 "data/artwork/research-priority-16-source-audit-20261109.v1.json",
 // Keep the 26 MB exact museum-source photograph in Git research only.
 // Public Pages serves the licensed 470 KB full-frame WebP derivative.
 "data/artwork/releases/source-masters",
 "data/artwork/releases/2026-03-15-07-01-two-frozen-class-i-source-manifest.v1.json",
 "data/artwork/releases/2026-03-15-07-01-two-class-i-photo-byte-proof.v1.json",
 "data/artwork/releases/2026-11-01-saraceni-met-cc0-byte-proof.v1.json",
 "data/artwork/releases/2026-04-07-rubens-rockox-kmska307-source.v1.json",
 "data/geography/research",
 "data/office/research",
 "data/prayer/stations/san-polo-tiepolo-oils-1747",
];
// Historical sprite bundles are retained in GitHub only. The active HTML
// uses standalone assets/generated-symbols/* per-icon geometry instead.
const historicalSpritePath="assets/generated-sprites";
// Four original full-Gospel Catena corpus files remain in GitHub for editorial
// provenance and regression tests. The live reader fetches only 23 chapter
// packs; its old full-Gospel cache fallback reads browser CacheStorage, not HTTP.
const offlineOnlyCatenaGospels=["matthew","mark","luke","john"];
const offlineOnlyCatenaPaths=offlineOnlyCatenaGospels.map(name=>"data/scripture/catena/"+name+".json");
// These two research directories have one explicitly referenced runtime fixture
// apiece. Preserve the exact fixture; omit other review records only from
// deployment output. Git source and evidence are untouched.
const retainedRuntimeResearch=Object.freeze({
 "data/research":["mass-special-rite-music-events-20261019.v1.json"],
 "data/directory/research":["canonical-g0-site-admissions-b84-b90-20261026.v1.json"],
});

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const entries=await readdir(root,{withFileTypes:true});
let files=[...rootFiles];
for(const entry of entries){
 if(entry.isFile()&&generated.test(entry.name)){
  if(/^ao-boot-[a-f0-9]{16}\.js$/.test(entry.name)&&!activeEntrypointAssets.has(entry.name))continue;
  files.push(entry.name);
 }
}
files=[...new Set(files)];
// Only the active content-addressed parser-order pack is shipped. Keep
// superseded bundles in Git history, never duplicate their runtime bytes.
files=files.filter(name=>!/^ao-packed-[a-f0-9]{20}\.js$/.test(name)||activeEntrypointAssets.has(name));
for(const name of files){
 await access(join(root,name));
 await cp(join(root,name),join(output,name));
}
for(const folder of folders){
 await access(join(root,folder));
 await cp(join(root,folder),join(output,folder),{recursive:true});
}
for(const relativePath of excludedResearchPaths){
 await rm(join(output,relativePath),{recursive:true,force:true});
}
await rm(join(output,historicalSpritePath),{recursive:true,force:true});
for(const path of offlineOnlyCatenaPaths){
 await rm(join(output,path),{force:true});
}
for(const [relativePath,keepFiles] of Object.entries(retainedRuntimeResearch)){
 const dest=join(output,relativePath);
 await rm(dest,{recursive:true,force:true});
 await mkdir(dest,{recursive:true});
 for(const filename of keepFiles){
  await cp(join(root,relativePath,filename),join(dest,filename));
 }
}
await writeFile(join(output,"robots.txt"),"User-agent: *\nDisallow: /\n");
const html=await import("node:fs/promises").then(fs=>fs.readFile(join(output,"index.html"),"utf8"));
const links=[...html.matchAll(/(?:src|href)=["'](\.\/[^"'?#]+)["']/g)].map(x=>x[1].slice(2));
let missing=[];
for(const href of new Set(links)){
 if(href.startsWith("#")||href.includes("://"))continue;
 try{await access(resolve(output,href));}
 catch{missing.push(href);}
}
if(missing.length)throw new Error("Missing entrypoint assets: "+missing.slice(0,12).join(", "));
for(const name of ["README.md","package.json","vercel.json",".gitignore","docs","tests","tools","research","legacy",".github"]){
 try{await access(join(output,name));throw new Error("Disallowed deployment path exposed: "+name);}
 catch(e){if(e?.code!=="ENOENT")throw e;}
}
for(const relativePath of excludedResearchPaths){
 try{await access(join(output,relativePath));throw new Error("Research path leaked into deployment: "+relativePath);}
 catch(e){if(e?.code!=="ENOENT")throw e;}
}
try{await access(join(output,historicalSpritePath));throw new Error("Historical icon sprite bundles leaked into deployed output");}
catch(e){if(e?.code!=="ENOENT")throw e;}
for(const path of offlineOnlyCatenaPaths){
 try{await access(join(output,path));throw new Error("Legacy Catena full-Gospel file leaked into deployment: "+path);}
 catch(e){if(e?.code!=="ENOENT")throw e;}
}
const count=await (async function sizeOf(path){
 const nodes=await readdir(path,{withFileTypes:true});let size=0,count=0;
 for(const n of nodes){const p=join(path,n.name);if(n.isDirectory()){const item=await sizeOf(p);size+=item.size;count+=item.count;}
 else if(n.isFile()){size+=(await stat(p)).size;count++}}
 return {size,count};
})(output);
console.log(JSON.stringify({previewRoot:"dist/web-preview",files:count.count,megabytes:Math.round(count.size/1e6*10)/10,checkedEntrypointAssets:new Set(links).size,excludedDevelopmentFiles:true,excludedResearchPaths,retainedRuntimeResearch,excludedHistoricalSpritePath:historicalSpritePath,excludedOfflineOnlyCatenaPaths:offlineOnlyCatenaPaths}));
