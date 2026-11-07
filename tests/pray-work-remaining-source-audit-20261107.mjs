/**
 * Stage 4: source-owner coverage for the OTHER 48 supplemental catalogue entries.
 * Source fields, hash witnesses, structure and route declaration only.
 * No UI browser proof, no rights/print/translation equivalence claim.
 * node tests/pray-work-remaining-source-audit-20261107.mjs
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dirname,join,resolve} from "node:path";
import {fileURLToPath,pathToFileURL} from "node:url";
import {createHash} from "node:crypto";
import {supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>readFileSync(join(root,p),"utf8");
const registry=JSON.parse(read("data/pray/prayer-work-identity-registry-20261106.v1.json"));
const pending=registry.works.filter(w=>w.availability==="route-unverified"&&!w.sourceBodyEvidence);
const modules=new Map();
const normalizedHash=value=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const traditional=read("src/pray/traditional-pray-runtime.js");
const routes=traditional.slice(traditional.indexOf("const ROUTES=Object.freeze({"),traditional.indexOf("\n});",traditional.indexOf("const ROUTES=Object.freeze({"))+4);
const supportedRoute=id=>supportedDirectPrayerRoute(id)||routes.includes('"'+id+'":Object.freeze(');
const bodyKey=/^(en|fr|la|english|french|latin|textEn|textFr|textLa|sourceTextEn|sourceTextFr|sourceTextLa|prayerEn|prayerFr|prayerLa|meditationEn|meditationFr|meditationLa|closingPrayerEn|closingPrayerFr|closingPrayerLa)$/;
const bodyLanguage=k=>/^(en|english|.*En)$/.test(k)?"en":/^(fr|french|.*Fr)$/.test(k)?"fr":"la";
const hits=(value,path="",data={la:[],en:[],fr:[]},level=0)=>{
 if(level>7)return data;
 if(!value||typeof value!=="object")return data;
 if(Array.isArray(value)){for(let i=0;i<Math.min(value.length,60);i++)hits(value[i],path+"["+i+"]",data,level+1);return data}
 for(const [k,v] of Object.entries(value)){
   const next=path?path+"."+k:k;
   if(bodyKey.test(k)&&typeof v==="string"&&v.trim().length>25 && (level===0 || /(^|[.])(text|prayer|repeatText|opening|closing|collect|meditation|commonPrayers|versicle|response|words|days|aspirations|proper)[.\[]/i.test(path)))data[bodyLanguage(k)].push(next);
   if((k==="text"||k==="prayer"||k==="meditation"||k==="collect"||k==="repeatText")&&typeof v==="object")
     hits(v,next,data,level+1);
   else if(typeof v==="object"&&v!==null)hits(v,next,data,level+1);
 }
 return data;
};
const sourceRootsToSkip=new Set(["src/pray/presentation-runtime.js","src/pray/traditional-pray-runtime.js"]);
async function moduleFor(path){
 if(sourceRootsToSkip.has(path))return null;
 if(modules.has(path))return modules.get(path);
 try{const x=await import(pathToFileURL(join(root,path)).href);modules.set(path,x);return x}
 catch(e){modules.set(path,{error:String(e)});return modules.get(path)}
}
function bucket(n){
 if([51,58,60,61,62,64,65,66,67,68,69,70,71,72,73,74,75,76,77].includes(n))return "individual-source";
 if(n===59)return "litany-reader";
 if([91,96,108].includes(n))return "additional-novena";
 if([111,112,113].includes(n))return "canonical-composite";
 if(n>=114&&n<=123)return "devotion-or-chaplet";
 if(n>=126&&n<=137)return "reader-or-programme";
 throw new Error("Uncategorised remaining source row "+n);
}
function resolveKey(module,key){
 if(!module||!key)return undefined;
 return key.split(".").reduce((v,part)=>v?.[part],module);
}
const results=[],faults=[];
for(const work of pending){
 const n=work.legacyRows[0],className=bucket(n),mod=await moduleFor(work.owner_module);
 const fromRoute=(work.id.startsWith("pray.")||work.id.startsWith("mass.")||work.id.startsWith("programme."));
 let value=mod&&!mod.error?resolveKey(mod,work.source_key):undefined;
 const isArray=Array.isArray(value);
 let itemId=undefined,crosswalkId=null,sourceStatus="unresolved-source-export";
 if(mod?.error)sourceStatus="module-import-error";
 else if(sourceRootsToSkip.has(work.owner_module))sourceStatus="route-runtime-no-export";
 else if(value!==undefined){
    sourceStatus=typeof value==="function"?"exported-controller":isArray?"exported-array":"exported-source";
    if(isArray&&className==="individual-source"){
      if(value.every(v=>typeof v==="string"&&v.trim().length>0)){
        sourceStatus="source-array-of-paragraphs";
      }else{
      const x=value.find(v=>v?.id===work.id);
      if(x){value=x;sourceStatus="array-member-id-exact"}else faults.push({id:work.id,issue:"source array missing exact member"});
      }
    }else if(value&&typeof value==="object"&&value.id){
      crosswalkId=value.id;sourceStatus=value.id===work.id?"object-id-exact":"object-id-is-source-alias";
    }
 }
 const directLang=typeof value==="object"&&value?Object.fromEntries(["la","en","fr"].map(k=>[k,typeof value[k]==="string"&&value[k].trim().length>25?"text-present":"not-present"])):null;
 const literalText=typeof value==="string"?{available:true,language:/_EN$/.test(work.source_key)?"en":/_(?:LA|LATIN)$/.test(work.source_key)?"la":"unscoped"}:null;
 const fields=hits(value);
 const languageCandidates=Object.fromEntries(["la","en","fr"].map(k=>[k,{textFieldPaths:fields[k].slice(0,15),count:fields[k].length}]));
 const routeDeclared=fromRoute?supportedRoute(work.id):null;
 const record={id:work.id,legacyRows:work.legacyRows,kind:work.kind,evidenceClass:className,
   sourceModule:work.owner_module,sourceKey:work.source_key,sourceStatus,
   memberId:crosswalkId||itemId||null,sourceHash:value!==undefined&&typeof value!=="function"?normalizedHash(value):null,
   valueKind:Array.isArray(value)?"array":typeof value,
   arraySize:Array.isArray(value)?value.length:null,
   directLanguageBodies:directLang,structuredLanguageCandidates:languageCandidates,
   literalText,routeDeclared,
   notes:[]};
 if(sourceStatus==="object-id-is-source-alias")record.notes.push("Original source-member ID differs from catalogue identity; do not merge without edition comparison.");
 if(value?.language&&typeof value?.text==="string"&&value.text.trim().length>25){
   record.originalLanguageWitness={language:value.language,body:"text-present",sourceEdition:value.edition||null};
 }
 if(work.id==="montfort_consecration_act_1863"&&Array.isArray(value)&&value.every(x=>typeof x==="string")){
   record.originalLanguageWitness={language:"en",body:"text-present",paragraphs:value.length,sourceExport:work.source_key};
 }
 if(work.id==="stabat_mater"){
   record.stanzaCount=Array.isArray(value)?value.length:null;
   record.bodyWitness="Latin stanzas only; no complete hymn or independent EN/FR body in this source key";
   record.completeness="partial-existing-source-not-certified-complete";
   if(record.stanzaCount!==13)faults.push({id:work.id,issue:"Stabat existing 13-stanza source has changed; manually review completeness"});
 }

 if(className==="additional-novena"){
    record.dayCount=Array.isArray(value?.days)?value.days.length:null;
    record.novenaForm=value?.form||null;
    record.novenaPattern=value?.pattern||null;
    record.frenchSourceStatus=value?.frenchTextStatus||null;
    record.hasRepeatedText=!!(value?.repeatText||value?.prayer);
    const present=x=>typeof x==="string"&&x.trim().length>25;
    record.properPrayerBodies=Object.fromEntries(["la","en","fr"].map(k=>{
      const repeated=present(value?.repeatText?.[k])||present(value?.prayer?.[k]);
      const daily=value?.days?.filter(d=>present(d?.text?.[k]))?.length||0;
      return [k,{repeatedProper:repeated,daySpecificProperCount:daily,properTextPresent:repeated||daily===9}];
    }));
    if(work.id==="holy_face_1887"){
      record.notes.push("French daily guides and titles are not translations of the nine historical English proper prayers.");
      if(record.properPrayerBodies.fr.properTextPresent)faults.push({id:work.id,issue:"Holy Face historical English-only witness unexpectedly has French propers: require source review"});
    }

    if(record.dayCount!==9)faults.push({id:work.id,issue:"Additional novena lacks nine days"});
    if(!value?.form)faults.push({id:work.id,issue:"Additional novena form missing"});
 }
 if(work.id==="pray.five_wounds"){
   record.beadCount=Array.isArray(value)?value.length:null;
   record.prayerReferences=[...new Set((value||[]).map(v=>v.prayerId))];
   if(record.beadCount!==30||record.prayerReferences.join(",")!=="foundations_glory_be,foundations_hail_mary")faults.push({id:work.id,issue:"Five Wounds 30-bead canonical prayer ownership changed"});
 }
 if(work.id==="pray.little_crown"){
   record.beadCount=Array.isArray(value)?value.length:null;
   if(record.beadCount!==15)faults.push({id:work.id,issue:"Infant Jesus Little Crown should be 15 beads"});
 }
 if(work.id==="pray.precious_blood"){
   record.mysteryCount=Array.isArray(value)?value.length:null;
   if(record.mysteryCount!==7)faults.push({id:work.id,issue:"Precious Blood should have seven mysteries"});
 }
 if(work.id==="pray.st_joseph_seven_sorrows"){
   record.prayerCount=Array.isArray(value)?value.length:null;
   if(record.prayerCount!==7)faults.push({id:work.id,issue:"St Joseph must have seven complete prayers"});
 }
 if(work.id==="pray.seven_words"){
   record.wordCount=Array.isArray(value?.words)?value.words.length:null;
   if(record.wordCount!==7)faults.push({id:work.id,issue:"Seven Words local English source should have seven entries"});
 }
 if(work.id==="pray.penitential_psalms"){
   record.psalmReferences=Array.isArray(value)?value.map(v=>v.trad):[];
   if(record.psalmReferences.length!==7)faults.push({id:work.id,issue:"Seven Penitential Psalm references missing"});
   record.notes.push("Scripture service owns text; this module is references only.");
 }
 if(work.id==="pray.dying_companion"){
   record.stages=Array.isArray(value)?value.slice():[];
   record.notes.push("Reader sequence only; source text lives in canonical and good-death owners.");
   if(record.stages.join(",")!=="now,pray,commend")faults.push({id:work.id,issue:"Dying Companion stages changed"});
 }
 if(work.id==="pray.tenebrae")record.notes.push("Tenebrae compiler, not an owned single prayer body; breviary passages are separate local sources.");
 if(["pray.rosary","pray.confession","pray.adoration","pray.benediction","pray.stations"].includes(work.id))record.notes.push("Specialised reader preserved; route contract is not proof of all internal texts or UI languages.");
 if(["programme.first_friday","programme.first_saturday"].includes(work.id))record.notes.push("Monthly observance, not independent prayer text.");
 if(["mass.prepare","mass.thanksgiving"].includes(work.id))record.notes.push("Order of private prayers, not one prayer body.");
 if(work.id==="montfort_consecration_act_1863")record.notes.push("Programme child, not a registered standalone route.");
 if(className==="individual-source"&&value===undefined)faults.push({id:work.id,issue:"No source value resolved for individual prayer"});
 if(className==="canonical-composite"&&value===undefined)faults.push({id:work.id,issue:"No canonical composite source resolved"});
 if(fromRoute&&!routeDeclared)faults.push({id:work.id,issue:"Route not declared by internal/traditional registry"});
 if(value===undefined&&!sourceRootsToSkip.has(work.owner_module)&&className!=="reader-or-programme")
   faults.push({id:work.id,issue:"Source key unresolved in source module"});
 results.push(record);
}
const counts=Object.fromEntries([...new Set(results.map(x=>x.evidenceClass))].map(k=>[k,results.filter(r=>r.evidenceClass===k).length]));
const statusCounts=Object.fromEntries([...new Set(results.map(x=>x.sourceStatus))].map(k=>[k,results.filter(r=>r.sourceStatus===k).length]));
const issues=[...faults];
const report={
 schema:"ao.pray.remaining-source-audit-20261107.v1",
 scope:"48 other source-owner records: text-key presence, structural counts and declared route contracts. NOT browser rendering, full translations, rights or printed-edition certification.",
 checkedBy:"tests/pray-work-remaining-source-audit-20261107.mjs",
 assessedWorks:results.length,classes:counts,sourceStatus:statusCounts,
 declaredRoutes:results.filter(x=>x.routeDeclared===true).length,
 failedDeclaredRoutes:results.filter(x=>x.routeDeclared===false).map(x=>x.id),
 sourceImportFailures:[...modules].filter(([p,m])=>m?.error).map(([path,m])=>({path,error:m.error})),
 hardIssues:issues,rows:results
};
console.log("AO_PRAY_STAGE4_REPORT_BEGIN");
console.log(JSON.stringify(report));
console.log("AO_PRAY_STAGE4_REPORT_END");
const snapshot=JSON.parse(read("data/pray/prayer-work-remaining-source-evidence-20261107.v1.json"));
assert.equal(snapshot.schema,report.schema,"Recorded Stage 4 evidence schema changed");
assert.deepEqual(snapshot.rows,report.rows,"48-work source/owner hashes or statuses drifted; require an explicit new evidence audit");
assert.deepEqual(snapshot.hardIssues,report.hardIssues,"Recorded hard issues diverged from live sources");
for(const row of report.rows){
 const work=registry.works.find(w=>w.id===row.id);
 const link=work?.sourceOwnerEvidence;
 assert.ok(link&&link.auditRef==="data/pray/prayer-work-remaining-source-evidence-20261107.v1.json#"+row.id,"Missing Stage 4 per-work source evidence link: "+row.id);
 assert.equal(link.sourceHash,row.sourceHash,"Registry source digest mismatch for "+row.id);
 assert.equal(link.readerRouteDeclared,row.routeDeclared,"Route declaration evidence drifted for "+row.id);
}

assert.equal(pending.length,48,"Expected 48 unassessed supplementary work identities");
assert.deepEqual(counts,{"individual-source":19,"litany-reader":1,"additional-novena":3,"canonical-composite":3,"devotion-or-chaplet":10,"reader-or-programme":12});
assert.equal(new Set(results.map(x=>x.id)).size,48);
assert.equal(issues.length,0,"Stage 4 source owner/structure mismatch; see hardIssues");
console.log("Stage 4 source-evidence PASS; no public reader or original-edition claims made.");
