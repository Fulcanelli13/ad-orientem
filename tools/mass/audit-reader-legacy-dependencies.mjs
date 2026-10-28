import {readFileSync,readdirSync,existsSync} from "node:fs";
import {join,relative,resolve,extname} from "node:path";
import {fileURLToPath} from "node:url";

// Read-only inventory of literal source references. Do not treat a historical
// filename or a test-only importer as a production runtime dependency.
// This tool deliberately never deletes source or rewrites Mass text.
const root=resolve(fileURLToPath(new URL("../..",import.meta.url)));
const candidates=[
 "src/mass/reader-shadow.js",
 "src/mass/reader-preview.js",
 "src/mass/reader-dom-adapter.js",
 "src/mass/reader-live-product48.js",
];
const roots=["src","tests","tools","scripts"];
const extensions=new Set([".js",".mjs",".cjs",".html",".json",".css"]);
function list(dir){
 if(!existsSync(dir))return[];
 return readdirSync(dir,{withFileTypes:true}).flatMap(ent=>{
   if(ent.name==="node_modules"||ent.name.startsWith("."))return[];
   const path=join(dir,ent.name);
   return ent.isDirectory()?list(path):extensions.has(extname(path))?[path]:[];
 });
}
const files=[...roots.flatMap(d=>list(join(root,d))),join(root,"index.html"),join(root,"package.json")].filter(existsSync);
const reverse=new Map(candidates.map(p=>[p,[]]));
for(const filename of files){
 const rel=relative(root,filename).replaceAll("\\","/");
 const body=readFileSync(filename,"utf8");
 for(const target of candidates){
   if(rel===target)continue;
   const base=target.slice(target.lastIndexOf("/")+1);
   if(body.includes(base))reverse.get(target).push(rel);
 }
}
const retired=new Set([
 "src/mass/reader-shadow.js",
 "src/mass/reader-preview.js",
 "src/mass/reader-dom-adapter.js",
]);
for(const [path,referrers] of reverse){
 const runtime=referrers.filter(p=>p.startsWith("src/")||p==="index.html");
 const tests=referrers.filter(p=>p.startsWith("tests/")||p==="package.json");
 const others=referrers.filter(p=>!runtime.includes(p)&&!tests.includes(p));
 const present=existsSync(join(root,path));
 if(retired.has(path) && (present||runtime.length||tests.length)){
   throw new Error("OBSOLETE_READER_REINTRODUCED:"+path+" referenced by "+referrers.join(","));
 }
 // The preserved 48-card projector is historical test evidence only.
 // A runtime import, or even a source reference, would reopen the obsolete
 // user-facing fallback. Never make production depend on this file again.
 if(path==="src/mass/reader-live-product48.js"&&(!present||runtime.length)){
   throw new Error("HISTORICAL_48_REINTRODUCED_TO_RUNTIME: "+runtime.join(","));
 }
 console.log(JSON.stringify({path,present,classification:retired.has(path)?"RETIRED_DELETED":
   runtime.length?"ACTIVE_IMPORTS_OR_REFERENCES":tests.length?"ARCHIVED_TEST_ONLY":"NO_SCANNED_IMPORTERS",
   runtime,tests,others}));
}
