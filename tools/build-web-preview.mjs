import {cp, readdir, rm, mkdir, writeFile, stat, access, readFile} from "node:fs/promises";
import {resolve, dirname, join, basename} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const output=resolve(root,"dist/web-preview");
const folders=["assets","data","src"];
const rootFiles=["index.html","sw.js","mass-bg.png","Ad-Orientem-v43.19.webmanifest"];
const generated=/^ao-(?:boot|inline|packed)-[\w.-]+\.(?:css|js)$/;
const disallowed=/^(?:\.|docs|tests|tools|research|legacy|review|reviews|node_modules)(?:\/|$)/;

await rm(output,{recursive:true,force:true});
await mkdir(output,{recursive:true});
const entries=await readdir(root,{withFileTypes:true});
let files=[...rootFiles];
for(const entry of entries){
 if(entry.isFile()&&generated.test(entry.name))files.push(entry.name);
}
files=[...new Set(files)];
for(const name of files){
 await access(join(root,name));
 await cp(join(root,name),join(output,name));
}
for(const folder of folders){
 await access(join(root,folder));
 await cp(join(root,folder),join(output,folder),{recursive:true});
}

/**
 * Canon/Formation unpublished research sources must NEVER be present in static
 * production output. Query-string review flags are not access controls.
 *
 * Public app bundles may retain importable source-reader JS (for stable module
 * graphs), but requests to its original research JSON must return 404.
 * Do not substitute robots.txt, noindex, or obscure URLs for this exclusion.
 */
const privateManifestPath=join(root,"data/learn/formation-canon-migration-provenance-20261018.v1.json");
let privateResearchPaths=[];
try{
 const manifest=JSON.parse(await readFile(privateManifestPath,"utf8"));
 if(manifest.schema!=="AO_CANON_SOURCE_MIGRATION_SHA_P3_V1"||
    manifest.sourceFileCount!==27||manifest.files?.length!==27)
   throw new Error("Canon original-source private manifest changed unexpectedly");
 privateResearchPaths=manifest.files.map(f=>f.path);
}catch(error){
 if(error.code!=="ENOENT")throw error;
 // Branches without a Canon research mirror have no private manifest yet.
}
// Cover later editorial updates as well as all 27 original source files.
privateResearchPaths.push(
 "data/learn/formation-canon-migration-provenance-20261018.v1.json",
 "data/learn/research/formation-canon-primary-source-pinpoint-review-20261018.v1.json",
 "data/learn/research/formation-canon-older-28-archive-reference-holds-20261018.v1.json"
);
const protectedPaths=new Set(privateResearchPaths);
for(const relative of protectedPaths){
 if(!/^data\/learn\/[A-Za-z0-9._/-]+\.json$/.test(relative)||
    relative.includes("..")||relative.includes("//"))
   throw new Error("Invalid Canon private deployment path: "+relative);
 await rm(resolve(output,relative),{force:true});
}
// Every original research supplement from this historical 2026-10-13 batch
// is private by default, even if someone adds one without updating the manifest.
const originalResearchOutput=join(output,"data/learn/research");
for(const file of await readdir(originalResearchOutput)){
 if(/^formation-.*-20261013\.v1\.json$/.test(file)||
    /^formation-canon-.*\.json$/.test(file))
   await rm(join(originalResearchOutput,file),{force:true});
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
const count=await (async function sizeOf(path){
 const nodes=await readdir(path,{withFileTypes:true});let size=0,count=0;
 for(const n of nodes){const p=join(path,n.name);if(n.isDirectory()){const item=await sizeOf(p);size+=item.size;count+=item.count;}
 else if(n.isFile()){size+=(await stat(p)).size;count++}}
 return {size,count};
})(output);
console.log(JSON.stringify({previewRoot:"dist/web-preview",files:count.count,megabytes:Math.round(count.size/1e6*10)/10,checkedEntrypointAssets:new Set(links).size,excludedDevelopmentFiles:true}));
