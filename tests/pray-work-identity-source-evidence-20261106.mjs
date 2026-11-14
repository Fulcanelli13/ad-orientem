/**
 * Stage 2 — source-owner and route-token evidence only.
 * Distinguishes a source object from a public reader route. Does not mutate
 * prayer bodies, change availability, or claim historical-edition certification.
 * node tests/pray-work-identity-source-evidence-20261106.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve,dirname,join} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const reg=JSON.parse(read("data/pray/prayer-work-identity-registry-20261106.v1.json"));
const ext=reg.works.filter(x=>x.availability!=="published");
const texts=new Map;
const pure=new Set([
 "src/pray/canonical-data.js",
 "src/pray/novena-corpus-v4.js",
 "src/pray/traditional-pray-data.js",
 "src/pray/icrsp-seasonal-hymns.v1.js",
 "src/pray/prayer-acquisition-historical-witnesses.v1.js",
 "src/pray/priestly-intercessions-b19.js",
 "src/pray/occasional-intercessions-b20.js",
 "src/pray/occasional-intercessions-b21.js",
 "src/pray/montfort-original-prayers-b27.js",
 "src/pray/montfort-consecration-b26.js",
 "src/pray/icksp-therese-devotions.v1.js",
 "src/pray/icksp-divine-infant-king-novena.v1.js",
 "src/pray/icksp-immaculate-conception-novena.v1.js",
 "src/pray/holy-face-janvier-1887-b25.js",
 "src/pray/icksp-golden-arrow-reparation.v1.js",
 "src/pray/good-death-data.js",
 "src/pray/little-crown-b30.js",
 "src/pray/office-dead-vespers-1960.js",
 "src/pray/penitential-psalms-source.js",
 "src/pray/st-joseph-seven-sorrows-joys-b24.js"
]);
const modules=new Map;
for(const p of pure){
 try{modules.set(p,await import(pathToFileURL(join(root,p)).href))}
 catch(e){modules.set(p,{__importFailure:String(e)})}
}
const runtimePaths=["src/pray/presentation-runtime.js","src/pray/traditional-pray-runtime.js","src/pray/internal-route-owner.js","src/pray/browser-entry.js"];
const routes=runtimePaths.map(p=>({p,s:read(p)}));
const evidence=[];
const parsePointer=s=>{
 const parts=String(s).split(".");
 return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(parts[0])?parts:null;
};
const getValue=(obj,parts)=>parts.reduce((v,k)=>v!=null?v[k]:undefined,obj);
for(const w of ext){
 const src= w.owner_module;
 if(!texts.has(src))texts.set(src,read(src));
 const file=texts.get(src), mod=modules.get(src);
 const parts=parsePointer(w.source_key);
 const sourceRoot=parts?.[0]||"";
 const sourceLiteral=file.includes(sourceRoot);
 const moduleAvailable=!!mod&&!mod.__importFailure;
 let sourceResult="source-file-only",sourceId=null,kind=null;
 if(moduleAvailable&&parts){
  const value=getValue(mod,parts);
  if(value!==undefined&&value!==null){
   sourceResult="export-resolved";
   kind=Array.isArray(value)?"array":typeof value;
   if(Array.isArray(value)){
    const entry=value.find(x=>x?.id===w.id);
    if(entry){sourceResult="exact-id-in-array";sourceId=entry.id}
    else sourceResult="exported-array-needs-id-crosswalk";
   }else if(typeof value==="object"&&value.id){
    sourceId=value.id;
    sourceResult=value.id===w.id?"exact-id-object":"exported-object-with-different-id";
   }
  }else{
   sourceResult="source-key-unresolved";
  }
 }else if(parts&&sourceLiteral)sourceResult="source-symbol-in-file";
 else if((file.includes('"'+w.id+'"')||file.includes("'"+w.id+"'")))sourceResult="id-token-in-source";
 else if(!parts){
   sourceResult="non-export-route-alias";
 }else{
   sourceResult="source-key-unresolved";
 }
 const runtimeHits=routes.filter(({s})=>s.includes('"'+w.id+'"')||s.includes("'"+w.id+"'")).map(({p})=>p);
 evidence.push({id:w.id,legacyRows:w.legacyRows,availability:w.availability,owner:src,key:w.source_key,
  sourceResult,sourceId,kind,sourceRoot,importError:mod?.__importFailure||null,
  runtimeTokenFiles:runtimeHits,routeEvidence:runtimeHits.length?"literal-token-only":"none",
  publicReaderVerified:false});
}
const counts=evidence.reduce((a,x)=>(a[x.sourceResult]=(a[x.sourceResult]||0)+1,a),{});
const checkable=evidence.filter(x=>pure.has(x.owner));
const strictIssues=checkable.filter(x=>x.sourceResult==="source-key-unresolved");
const {supportedDirectPrayerRoute}=await import(pathToFileURL(join(root,"src/pray/internal-route-owner.js")).href);
const traditionalSource=read("src/pray/traditional-pray-runtime.js");
const traditionalSection=traditionalSource.slice(traditionalSource.indexOf("const ROUTES=Object.freeze({"),traditionalSource.indexOf("\n});",traditionalSource.indexOf("const ROUTES=Object.freeze({"))+4);
const canonicalRoutes=reg.works.filter(w=>/^(pray\.|mass\.|programme\.)/.test(w.id));
const routeContracts=canonicalRoutes.map(w=>{
 const internal=supportedDirectPrayerRoute(w.id);
 const traditional=traditionalSection.includes('"'+w.id+'":Object.freeze(');
 return {id:w.id,legacyRows:w.legacyRows,internal,traditional,declared:internal||traditional};
});
const missingRouteContracts=routeContracts.filter(x=>!x.declared);
const summaries={
 schema:"ao.pray.identity-source-route-audit.v1",
 rule:"A source export or route token proves owner evidence, not live public reader availability or exact printed edition.",
 registryWorks:reg.works.length,notCanonicallyPublished:ext.length,
 pureSourceChecked:checkable.length,sourceResults:counts,
 runtimeTokenFound:evidence.filter(x=>x.runtimeTokenFiles.length).length,
 noRuntimeToken:evidence.filter(x=>!x.runtimeTokenFiles.length).length,
 importFailures:[...modules].filter(([p,m])=>m.__importFailure).map(([p,m])=>({path:p,error:m.__importFailure})),
 strictIssues:strictIssues.map(x=>({id:x.id,path:x.owner,key:x.key})),
 runtimeRouteDeclarations:routeContracts.length,
 routeDeclarationProblems:missingRouteContracts,
 routeDeclarations:routeContracts,
 unverifiedRoutes:evidence.filter(x=>x.availability==="route-unverified").length,
 externalLinks:evidence.filter(x=>x.availability==="external-link").length,
 sourceOnly:evidence.filter(x=>x.availability==="source-only").length,
 details:evidence
};
console.log(JSON.stringify(summaries,null,2));
assert.equal(reg.works.length,133,"Unexpected registry size");
assert.equal(evidence.length,87,"Stage 2 must cover exactly 84 route-unverified, 2 external links, 1 source-only");
assert.equal(strictIssues.length,0,"Registry has broken source-key pointers in importable, source-owned modules");
assert.equal(routeContracts.length,24,"Expected 24 existing public route identities; Montfort Act has no separate route");
assert.equal(missingRouteContracts.length,0,"Registry contains non-existent public route IDs");
console.log("Stage 2 source evidence audit PASS. Runtime token detection is NOT public availability certification.");
