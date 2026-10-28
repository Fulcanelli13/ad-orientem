import {cp, readdir, rm, mkdir, writeFile, stat, access} from "node:fs/promises";
import {resolve, dirname, join, basename} from "node:path";
import {fileURLToPath} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const output=resolve(root,"dist/web-preview");
const folders=["assets","data","src"];
const rootFiles=["index.html","sw.js","mass-bg.png","Ad-Orientem-v43.19.webmanifest"];
const generated=/^ao-(?:boot|inline|packed)-[\w.-]+\.(?:css|js)$/;
const disallowed=/^(?:\.|docs|tests|tools|research|legacy|review|reviews|node_modules)(?:\/|$)/;
// Deploy only release assets. These source-owned review/audit records stay in GitHub.
// No source files are deleted; only copies inside dist/web-preview are omitted.
const excludedResearchPaths=[
 "assets/staged",
 "data/research",
 "data/geography/research",
];

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
for(const relativePath of excludedResearchPaths){
 await rm(join(output,relativePath),{recursive:true,force:true});
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
const count=await (async function sizeOf(path){
 const nodes=await readdir(path,{withFileTypes:true});let size=0,count=0;
 for(const n of nodes){const p=join(path,n.name);if(n.isDirectory()){const item=await sizeOf(p);size+=item.size;count+=item.count;}
 else if(n.isFile()){size+=(await stat(p)).size;count++}}
 return {size,count};
})(output);
console.log(JSON.stringify({previewRoot:"dist/web-preview",files:count.count,megabytes:Math.round(count.size/1e6*10)/10,checkedEntrypointAssets:new Set(links).size,excludedDevelopmentFiles:true,excludedResearchPaths}));
