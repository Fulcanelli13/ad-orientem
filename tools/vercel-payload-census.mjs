import {readdirSync,readFileSync,statSync,existsSync} from "node:fs";
import {join,relative,extname} from "node:path";
import {execFileSync} from "node:child_process";
const root=process.cwd();
const groups=[
 "data/scripture/witness/",
 "data/scripture/catena/",
 "data/learn/",
 "data/presentation/",
 "data/directory/generated/",
 "assets/generated-inline/",
 "assets/generated-sprites/",
 "assets/generated-symbols/",
 "assets/active/mass-v46/",
 "assets/active/mass-final/",
 "assets/approved/",
];
const walk=(base,out=[])=>{
 if(!existsSync(base))return out;
 for(const it of readdirSync(base,{withFileTypes:true})){
  const p=join(base,it.name);
  if(it.isDirectory())walk(p,out);else if(it.isFile())out.push(p);
 }
 return out;
};
const all=walk(join(root,"assets")).concat(walk(join(root,"data"))).concat(walk(join(root,"src")));
const rootFiles=readdirSync(root).filter(n=>n==="index.html"||n==="sw.js"||/^ao-.*\.(?:js|css)$/.test(n)).map(n=>join(root,n));
const runtimeSource=walk(join(root,"src")).filter(f=>/\.(?:js|mjs|json|css)$/.test(f)).concat(rootFiles);
const texts=runtimeSource.map(file=>({path:relative(root,file).replaceAll("\\","/"),source:readFileSync(file,"utf8")}));
const report=[];
for(const group of groups){
 const groupFiles=all.filter(f=>relative(root,f).replaceAll("\\","/").startsWith(group));
 const bytes=groupFiles.reduce((s,f)=>s+statSync(f).size,0);
 const hits=[];
 for(const {path,source} of texts){
  let index=source.indexOf(group),k=0;
  while(index>=0&&k<4){
   hits.push({path,example:source.slice(Math.max(0,index-48),Math.min(source.length,index+group.length+110)).replace(/\s+/g," ").slice(0,205)});
   index=source.indexOf(group,index+group.length);k++;
  }
 }
 report.push({group,files:groupFiles.length,MB:Math.round(bytes/1e5)/10,refs:hits.length,examples:hits.slice(0,8)});
}
const largest=all.filter(x=>groups.some(g=>relative(root,x).replaceAll("\\","/").startsWith(g))).sort((a,b)=>statSync(b).size-statSync(a).size).slice(0,30);
const largestRefs=largest.map(f=>{
 const path=relative(root,f).replaceAll("\\","/"),basename=path.split("/").at(-1);
 const exact=texts.filter(x=>x.source.includes(path)).map(x=>x.path).slice(0,6);
 const byName=texts.filter(x=>x.source.includes(basename)).map(x=>x.path).slice(0,6);
 return {path,MB:Math.round(statSync(f).size/1e5)/10,exact,byName};
});
console.log("PAYLOAD_REFERENCE_CENSUS_BEGIN");
console.log(JSON.stringify({groupReport:report,largestRefs,runtimeSourceFiles:texts.length},null,2));
console.log("PAYLOAD_REFERENCE_CENSUS_END");
