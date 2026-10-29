/**
 * Bounded source-first expansion of explicit @path:section and @:section
 * references, using the same injected pinned parsed-source reader as Mass.
 *
 * No $ standard-prayer invention, no &psalm() generator, no conditional
 * Rubrics evaluation, no CGI, archive, extra network client or French fallback.
 * Any unsupported directive is an error, not a partial liturgical Hour.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {OFFICE_PARSED_PARALLEL_SCHEMA} from "./source-section-resolver.js";

export const OFFICE_AT_REFERENCE_SCHEMA="ao.office.at-reference-resolved.v1";
const PATH=/^(?:Tempora|Sancti|Commune|Psalterium|Ordinarium|Special|Martyrologium)\/[A-Za-z0-9][A-Za-z0-9_. \/-]{0,139}$/;
const SECTION=/^[A-Za-z][A-Za-z0-9_. -]{0,100}$/;
const LANGUAGES=["la","en","fr"];
const DIRECTIVE=/^\s*(?:[const DIRECTIVE=/^\s*(?:[$&]|\(sed\s|\{(?:omit|omises)\})/iu;!#%]|\((?:sed|nisi|rubrica|deinde)\b|\{(?:omit|omises|:))/iu;
const REF=/^@(?:(?<path>(?:Tempora|Sancti|Commune|Psalterium|Ordinarium|Special|Martyrologium)\/[A-Za-z0-9][A-Za-z0-9_. \/-]*)?:)(?<section>[A-Za-z][A-Za-z0-9_. -]{0,100})$/u;
const fullKey=(p,s,l)=>p+"#"+s+"|"+l;
function identity(path,section,language){
 if(typeof path!=="string"||!PATH.test(path)||path.includes("..")||path.includes("//")||path.endsWith("/")||
    typeof section!=="string"||!SECTION.test(section)||
    !LANGUAGES.includes(language))
  throw Error("OFFICE_AT_SOURCE_IDENTITY_INVALID");
}
export function createOfficeAtReferenceResolver({readSource,maxDocuments=32,
 maxDepth=6,maxNodes=48}={}){
 if(typeof readSource!=="function"||!Number.isInteger(maxDocuments)||
    maxDocuments<1||maxDocuments>96||!Number.isInteger(maxDepth)||
    maxDepth<1||maxDepth>12||!Number.isInteger(maxNodes)||
    maxNodes<1||maxNodes>128)
  throw Error("OFFICE_AT_RESOLVER_CONFIGURATION_INVALID");
 const cache=new Map();
 async function file(path,language){
  identity(path,"Rank",language);
  const key=path+"|"+language;
  if(!cache.has(key)){
   if(cache.size>=maxDocuments)throw Error("OFFICE_AT_SOURCE_READ_BUDGET");
   const pending=Promise.resolve().then(()=>readSource(path,language)).then(doc=>{
    if(doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
       doc.sourcePath!==path||doc.language!==language||
       !(doc.map instanceof Map))
      throw Error("OFFICE_AT_SOURCE_PROVENANCE_MISMATCH");
    return doc.map;
   });
   cache.set(key,pending);
   // Failed reads still count towards the strict per-instance source budget.
  }
  return cache.get(key);
 }
 async function resolve({path,section,language}={}){
  identity(path,section,language);
  const trace=[],active=new Set();
  async function walk(p,s,depth){
   identity(p,s,language);
   const key=fullKey(p,s,language);
   if(active.has(key))throw Error("OFFICE_AT_REFERENCE_CYCLE:"+key);
   if(depth>maxDepth)throw Error("OFFICE_AT_REFERENCE_DEPTH_LIMIT");
   if(trace.length>=maxNodes)throw Error("OFFICE_AT_REFERENCE_NODE_LIMIT");
   active.add(key);
   trace.push(Object.freeze({sourceId:p+"#"+s,language}));
   try{
    const map=await file(p,language),lines=map.get(s);
    if(!Array.isArray(lines)||!lines.length)
     throw Error("OFFICE_AT_SOURCE_SECTION_MISSING:"+key);
    if(lines.length>2500)throw Error("OFFICE_AT_SOURCE_SECTION_TOO_LARGE");
    const parts=[];
    for(const raw of lines){
     if(typeof raw!=="string")throw Error("OFFICE_AT_SOURCE_LINE_INVALID");
     const line=raw.trim();
     if(!line)continue;
     if(line.length>12000)throw Error("OFFICE_AT_SOURCE_LINE_TOO_LONG");
     if(line.startsWith("@")){
      const m=REF.exec(line);
      if(!m)throw Error("OFFICE_AT_REFERENCE_SYNTAX_UNSUPPORTED:"+key);
      const q=m.groups.path??p,sectionName=m.groups.section;
      parts.push(await walk(q,sectionName,depth+1));
     }else{
      if(DIRECTIVE.test(line)||/\b@(?:Tempora|Sancti|Commune|Psalterium)\//u.test(line))
       throw Error("OFFICE_AT_OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED:"+key);
      parts.push(line);
     }
    }
    const result=parts.filter(Boolean).join("\n").trim();
    if(!result||result.length>180000)throw Error("OFFICE_AT_SOURCE_TEXT_INVALID");
    return result;
   }finally{active.delete(key)}
  }
  const text=await walk(path,section,0);
  return Object.freeze({
   schema:OFFICE_AT_REFERENCE_SCHEMA,sourceId:path+"#"+section,
   language,sourceRevision:DIVINUM_OFFICIUM_PIN,
   text,referenceTrace:Object.freeze(trace),
   status:"EXPLICIT_AT_REFERENCES_EXPANDED_UNVERIFIED",
   conditionalRubricsResolved:false,completeHourVerified:false,
   translationVerified:false,publishable:false
  });
 }
 async function resolveParallel({path,section,role}={}){
  const refs=await Promise.all(LANGUAGES.map(language=>resolve({path,section,language})));
  return Object.freeze({
   schema:OFFICE_PARSED_PARALLEL_SCHEMA,sourceId:path+"#"+section,
   sourceRevision:DIVINUM_OFFICIUM_PIN,
   texts:Object.freeze(Object.fromEntries(refs.map(r=>[r.language,r.text]))),
   referenceTraces:Object.freeze(Object.fromEntries(refs.map(r=>
    [r.language,r.referenceTrace]))),
   alignmentVerified:false,officePrecedenceVerified:false,
   rightsApproved:false,publishable:false,status:"PARSED_UNVERIFIED"
  });
 }
 return Object.freeze({resolve,resolveParallel,cachedSourceCount:()=>cache.size,
  maxDepth,maxNodes,sourceRevision:DIVINUM_OFFICIUM_PIN});
}
