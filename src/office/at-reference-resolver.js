/**
 * Bounded source-first expansion of explicit @path:section and @:section
 * references, using the same injected pinned parsed-source reader as Mass.
 *
 * Optional exact per-language pinned standard-prayer section resolution;
 * no invented prayer conclusions; optional plain psalm-verse research only.
 * Rubrics evaluation, no CGI, archive, extra network client or French fallback.
 * Any unsupported directive is an error, not a partial liturgical Hour.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {OFFICE_PARSED_PARALLEL_SCHEMA} from "./source-section-resolver.js";

export const OFFICE_AT_REFERENCE_SCHEMA="ao.office.at-reference-resolved.v1";
const PATH=/^(?:Tempora|Sancti|Commune|Psalterium|Ordinarium|Special|Martyrologium)\/[A-Za-z0-9][A-Za-z0-9_. \/-]{0,139}$/;
const SECTION=/^[A-Za-z][A-Za-z0-9_. -]{0,100}$/;
const LANGUAGES=["la","en","fr"];
// Source witness: pinned LanguageTextTools::prayer reads the names from
// Psalterium/Common/Prayers.txt. Never substitute a Latin fallback.
const STANDARD_PRAYER_OWNER="Psalterium/Common/Prayers";
const STANDARD_PRAYERS=new Set([
 "Qui vivis","Qui tecum","Qui tecum eiusdem",
 "Per Dominum","Per Dominum eiusdem","Per eumdem"
]);
const PRAYER_DIRECTIVE=/^\$([A-Za-z][A-Za-z ]{0,70})$/u;
const PLAIN_PSALM=/^&psalm\(([1-9][0-9]{0,2})\)$/u;
const PSALM_VERSE=/^([1-9][0-9]{0,2}):([1-9][0-9]{0,2})([a-z]?)\s+(.+)$/u;

const DIRECTIVE=/^\s*(?:[$&!#%]|\((?:sed|nisi|rubrica|deinde)\b|\{(?:omit|omises|:))/iu;
const REF=/^@(?:(?<path>(?:Tempora|Sancti|Commune|Psalterium|Ordinarium|Special|Martyrologium)\/[A-Za-z0-9][A-Za-z0-9_. \/-]*)?:)(?<section>[A-Za-z][A-Za-z0-9_. -]{0,100})$/u;
const fullKey=(p,s,l)=>p+"#"+s+"|"+l;
function identity(path,section,language){
 if(typeof path!=="string"||!PATH.test(path)||path.includes("..")||path.includes("//")||path.endsWith("/")||
    typeof section!=="string"||!SECTION.test(section)||
    !LANGUAGES.includes(language))
  throw Error("OFFICE_AT_SOURCE_IDENTITY_INVALID");
}
export function createOfficeAtReferenceResolver({readSource,maxDocuments=32,
 maxDepth=6,maxNodes=48,enableStandardPrayers=false,
 readPsalmSource=null,enablePsalmVerses=false}={}){
 if(typeof readSource!=="function"||!Number.isInteger(maxDocuments)||
    maxDocuments<1||maxDocuments>96||!Number.isInteger(maxDepth)||
    maxDepth<1||maxDepth>12||!Number.isInteger(maxNodes)||
    maxNodes<1||maxNodes>128||typeof enableStandardPrayers!=="boolean"||
    typeof enablePsalmVerses!=="boolean"||
    (enablePsalmVerses&&typeof readPsalmSource!=="function"))
  throw Error("OFFICE_AT_RESOLVER_CONFIGURATION_INVALID");
 const cache=new Map(),psalmCache=new Map();
 async function file(path,language){
  identity(path,"Rank",language);
  const key=path+"|"+language;
  if(!cache.has(key)){
   if(cache.size+psalmCache.size>=maxDocuments)throw Error("OFFICE_AT_SOURCE_READ_BUDGET");
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
 async function psalmVerses(number,language){
  if(!enablePsalmVerses||!Number.isInteger(number)||number<1||number>150)
   throw Error("OFFICE_AT_PSALM_FORM_NOT_SUPPORTED");
  const path="Psalterium/Psalmorum/Psalm"+number;
  const key=path+"|"+language;
  if(!psalmCache.has(key)){
   if(cache.size+psalmCache.size>=maxDocuments)
    throw Error("OFFICE_AT_SOURCE_READ_BUDGET");
   const pending=Promise.resolve().then(()=>
    readPsalmSource(path,language)).then(doc=>{
    if(doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
       doc.sourcePath!==path||doc.language!==language||
       typeof doc.text!=="string"||doc.text.length>180000)
     throw Error("OFFICE_AT_PSALM_SOURCE_PROVENANCE_OR_SIZE_INVALID");
    const lines=doc.text.replace(/\r\n?/g,"\n").split("\n").map(x=>x.trim()).filter(Boolean);
    if(!lines.length||lines.length>500)throw Error("OFFICE_AT_PSALM_VERSES_INVALID");
    let previous=0,seen=new Set();
    for(const line of lines){
     const m=PSALM_VERSE.exec(line);
     if(!m||Number(m[1])!==number||line.length>1600||
        /(?:^|\s)[$@&]|<[^>]*>|\{:/u.test(line))
      throw Error("OFFICE_AT_PSALM_VERSES_INVALID");
     const n=Number(m[2]),suffix=m[3],ordinal=n*27+(suffix? suffix.charCodeAt(0)-96:0);
     if(ordinal<=previous||seen.has(n+suffix))
      throw Error("OFFICE_AT_PSALM_VERSE_ORDER_INVALID");
     previous=ordinal;seen.add(n+suffix);
    }
    return lines.join("\n");
   });
   psalmCache.set(key,pending);
  }
  return {text:await psalmCache.get(key),sourceId:path+"#VERSES"};
 }
 async function resolve({path,section,language}={}){
  identity(path,section,language);
  const trace=[],active=new Set();
  let psalmVerseOnly=false;
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
     }else if(line.startsWith("&")){
      const match=PLAIN_PSALM.exec(line);
      if(!match)throw Error("OFFICE_AT_PSALM_FORM_NOT_SUPPORTED");
      const part=await psalmVerses(Number(match[1]),language);
      trace.push(Object.freeze({sourceId:part.sourceId,language}));
      psalmVerseOnly=true;
      parts.push(part.text);
     }else if(line.startsWith("$")){
      const match=PRAYER_DIRECTIVE.exec(line);
      if(!enableStandardPrayers||!match||!STANDARD_PRAYERS.has(match[1]))
       throw Error("OFFICE_AT_OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED:"+key);
      parts.push(await walk(STANDARD_PRAYER_OWNER,match[1],depth+1));
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
   psalmVersesExpandedWithoutDoxology:psalmVerseOnly,
   psalmDoxologyAndAntiphonVerified:false,
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
   psalmVersesExpandedWithoutDoxology:refs.some(x=>x.psalmVersesExpandedWithoutDoxology),
   psalmDoxologyAndAntiphonVerified:false,
   alignmentVerified:false,officePrecedenceVerified:false,
   rightsApproved:false,publishable:false,status:"PARSED_UNVERIFIED"
  });
 }
 async function resolvePlainPsalmParallel({number}={}){
  if(!Number.isInteger(number)||number<1||number>150||!enablePsalmVerses)
   throw Error("OFFICE_AT_PSALM_FORM_NOT_SUPPORTED");
  const verses=await Promise.all(LANGUAGES.map(language=>
   psalmVerses(number,language)));
  return Object.freeze({
   schema:"ao.office.plain-psalm-source-verses.v1",
   status:"THREE_LANGUAGE_SOURCE_VERSES_UNVERIFIED",
   sourceRevision:DIVINUM_OFFICIUM_PIN,
   sourcePath:"Psalterium/Psalmorum/Psalm"+number,
   psalmNumber:number,
   texts:Object.freeze(Object.fromEntries(LANGUAGES.map((language,i)=>[
    language,verses[i].text
   ]))),
   referenceTraces:Object.freeze(Object.fromEntries(LANGUAGES.map((language,i)=>[
    language,Object.freeze([Object.freeze({
     sourceId:verses[i].sourceId,language
    })])
   ]))),
   rawVersesLocated:true,psalmDoxologyVerified:false,
   antiphonApplicationVerified:false,paragraphAlignmentVerified:false,
   officeCompletenessVerified:false,rightsApproved:false,
   publishable:false,published:false
  });
 }
 /**
  * Segmented Sunday I Vespers Psalm source research. The *Saturday* Psalter
  * has five ordered portions of only two source psalms (143 and 144).
  * Some original Psalm143 verse labels are intentionally repeated; Psalm144
  * has a 13a/13b division. Preserve the author's exact source segmentation.
  * No Gloria Patri, antiphon or liturgical rubric is inserted.
  */
 const SATURDAY_RANGES=Object.freeze({
  "143:1-8":[100,800],
  "143:9-15":[900,1500],
  "144:1-7":[100,700],
  "144:8-13a":[800,1301],
  "144:13b-21":[1302,2100]
 });
 const saturdayCache=new Map();
 async function saturdayPsalmRows(number,language){
  if(!enablePsalmVerses||!readPsalmSource||
     ![143,144].includes(number)||!LANGUAGES.includes(language))
   throw Error("OFFICE_AT_PSALM_SEGMENT_NOT_SUPPORTED");
  const path="Psalterium/Psalmorum/Psalm"+number;
  const key=path+"|"+language;
  if(!saturdayCache.has(key)){
   if(cache.size+psalmCache.size+saturdayCache.size>=maxDocuments)
    throw Error("OFFICE_AT_SOURCE_READ_BUDGET");
   const pending=Promise.resolve().then(()=>
    readPsalmSource(path,language)).then(doc=>{
    if(doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
       doc.sourcePath!==path||doc.language!==language||
       typeof doc.text!=="string"||doc.text.length>180000)
     throw Error("OFFICE_AT_PSALM_SOURCE_PROVENANCE_OR_SIZE_INVALID");
    const rows=doc.text.replace(/\r\n?/g,"\n").trim().split("\n");
    if(rows.length!==(number===143?18:22))
     throw Error("OFFICE_AT_PSALM_SEGMENT_ROW_COUNT_CHANGED");
    let prior=0;
    const counts=new Map(),records=[];
    for(const line of rows){
     const m=/^(143|144):([1-9][0-9]?)([ab]?) (.{3,1600})$/u.exec(line);
     if(!m||Number(m[1])!==number||/[$@&]|<[^>]*>|\{:/u.test(line))
      throw Error("OFFICE_AT_PSALM_SEGMENT_SOURCE_INVALID");
     const n=Number(m[2]),suffix=m[3];
     const ordinal=n*100+(suffix==="a"?1:suffix==="b"?2:0);
     if(ordinal<prior)throw Error("OFFICE_AT_PSALM_SEGMENT_OUT_OF_ORDER");
     if(ordinal===prior){
      if(number!==143||![2,12,13].includes(n)||suffix||
         (counts.get(n)??0)>=2)
       throw Error("OFFICE_AT_PSALM_SEGMENT_DUPLICATE_UNEXPECTED");
     }
     prior=ordinal;
     counts.set(n,(counts.get(n)??0)+1);
     records.push(Object.freeze({ordinal,line}));
    }
    if(number===143&&![2,12,13].every(n=>counts.get(n)===2))
     throw Error("OFFICE_AT_PSALM_SEGMENT_SPLIT_CHANGED");
    if(number===144&&(counts.get(13)!==2||
        !rows.some(x=>x.startsWith("144:13a "))||
        !rows.some(x=>x.startsWith("144:13b "))))
     throw Error("OFFICE_AT_PSALM_SEGMENT_SPLIT_CHANGED");
    return Object.freeze(records);
   });
   saturdayCache.set(key,pending);
  }
  return saturdayCache.get(key);
 }
 async function resolvePsalmSegmentParallel({number,range}={}){
  if(!Number.isInteger(number)||typeof range!=="string"||
     !enablePsalmVerses)
   throw Error("OFFICE_AT_PSALM_SEGMENT_NOT_SUPPORTED");
  const normalize=x=>x.replace(/[‘’]/gu,"'").replace(/'/gu,"");
  const canonical=normalize(range);
  const limits=SATURDAY_RANGES[number+":"+canonical];
  if(!limits)throw Error("OFFICE_AT_PSALM_SEGMENT_NOT_SUPPORTED");
  const refs=await Promise.all(LANGUAGES.map(async language=>{
   const rows=await saturdayPsalmRows(number,language);
   const selected=rows.filter(row=>row.ordinal>=limits[0]&&row.ordinal<=limits[1]);
   const expected={
    "143:1-8":9,"143:9-15":9,"144:1-7":7,
    "144:8-13a":6,"144:13b-21":9
   }[number+":"+canonical];
   if(selected.length!==expected)throw Error("OFFICE_AT_PSALM_SEGMENT_INCOMPLETE");
   return Object.freeze({
    language,text:selected.map(x=>x.line).join("\n"),
    trace:Object.freeze([Object.freeze({
     sourceId:"Psalterium/Psalmorum/Psalm"+number+"#"+canonical,
     language
    })])
   });
  }));
  return Object.freeze({
   schema:"ao.office.psalm-source-segment.v1",
   status:"THREE_LANGUAGE_SATURDAY_PSALTER_SEGMENT_UNVERIFIED",
   sourceRevision:DIVINUM_OFFICIUM_PIN,
   psalmNumber:number,range:canonical,
   sourcePath:"Psalterium/Psalmorum/Psalm"+number,
   texts:Object.freeze(Object.fromEntries(refs.map(x=>[x.language,x.text]))),
   referenceTraces:Object.freeze(Object.fromEntries(refs.map(x=>[x.language,x.trace]))),
   sourceVerseSegmentLocated:true,gloriaPatriVerified:false,
   antiphonPlacementVerified:false,liturgicalRubricsVerified:false,
   published:false,publishable:false
  });
 }
 return Object.freeze({resolve,resolveParallel,resolvePlainPsalmParallel,resolvePsalmSegmentParallel,
  cachedSourceCount:()=>cache.size+psalmCache.size+saturdayCache.size,
  maxDepth,maxNodes,standardPrayersSourceEnabled:enableStandardPrayers,
  psalmVerseSourceEnabled:enablePsalmVerses,
  sourceRevision:DIVINUM_OFFICIUM_PIN});
}
