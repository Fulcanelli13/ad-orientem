/**
 * Source-first Roman Office section projection. Research-only and pure except
 * for the caller-injected source reader. No CGI composer, archive, HTTP client,
 * annual XHTML generation, Mass-calendar precedence, or presentation HTML.
 *
 * readSource(path, language) MUST use the existing pinned, same-language source
 * resolver and return {sourceRevision, sourcePath, language, map: Map}.
 * An unresolved source directive is a hard failure, never a translated fallback.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";

export const OFFICE_PARSED_SECTION_SCHEMA="ao.office.pinned-section.v1";
export const OFFICE_PARSED_PARALLEL_SCHEMA="ao.office.parallel-section.v1";
export const OFFICE_SECTION_ROLES=Object.freeze([
  "OPENING","INVITATORY","HYMN","ANTIPHON","PSALM","CANTICLE",
  "LESSON","CHAPTER","RESPONSORY","VERSICLE","PRECES","COLLECT",
  "COMMEMORATION","CONCLUSION","RUBRIC","OTHER"
]);
const LANGUAGES=Object.freeze(["la","en","fr"]);
// Source paths and section names belong to the Office source, never the Mass
// Calendar. Slash and case are significant; no generic Common substitution.
const PATH=/^(?:Tempora|Sancti|Commune|Psalterium|Ordinarium|Special|Martyrologium)\/[a-zA-Z0-9_.\/-]+$/;
const SECTION=/^[a-zA-Z][a-zA-Z0-9_. -]{0,100}$/;
const UNRESOLVED=/(?:^|\n)\s*(?:[@$&][A-Za-z]|\(sed\s|\{(?:omit|omises)\})/iu;

function selection({path,section,language,role}={}){
  if(typeof path!=="string"||!PATH.test(path)||path.includes("..")||
     path.length>180)throw Error("OFFICE_SOURCE_PATH_INVALID");
  if(typeof section!=="string"||!SECTION.test(section))
    throw Error("OFFICE_SOURCE_SECTION_INVALID");
  if(!LANGUAGES.includes(language))throw Error("OFFICE_SOURCE_LANGUAGE_INVALID");
  if(!OFFICE_SECTION_ROLES.includes(role))throw Error("OFFICE_SECTION_ROLE_INVALID");
  return {path,section,language,role};
}
function cleanLines(value){
  if(!Array.isArray(value)||!value.length)
    throw Error("OFFICE_SOURCE_SECTION_EMPTY");
  if(value.length>2500)throw Error("OFFICE_SOURCE_SECTION_EXCESSIVE");
  const text=value.map(line=>{
    if(typeof line!=="string")throw Error("OFFICE_SOURCE_LINE_INVALID");
    return line.replace(/\r\n?/g,"\n").replace(/\u0000/g,"").trim();
  }).filter(Boolean).join("\n");
  if(!text||text.length>180000)throw Error("OFFICE_SOURCE_TEXT_INVALID");
  if(UNRESOLVED.test(text))throw Error("OFFICE_SOURCE_DIRECTIVE_UNRESOLVED");
  return text;
}
export function createOfficeSectionResolver({readSource,maxDocuments=96}={}){
  if(typeof readSource!=="function"||
     !Number.isInteger(maxDocuments)||maxDocuments<1||maxDocuments>512)
    throw Error("OFFICE_READER_CONFIGURATION_INVALID");
  const cache=new Map();
  async function documentFor(path,language){
    const key=path+"|"+language;
    if(!cache.has(key)){
      // Deduplicate in-flight requests as well as successful source parses.
      const promise=Promise.resolve().then(()=>readSource(path,language)).then(doc=>{
        if(doc?.sourceRevision!==DIVINUM_OFFICIUM_PIN||
           doc?.sourcePath!==path||doc?.language!==language||
           !(doc.map instanceof Map))
          throw Error("OFFICE_PINNED_SOURCE_PROVENANCE_MISMATCH");
        return doc.map;
      });
      cache.set(key,promise);
      // Eviction prevents growth proportional to an annual calendar sweep.
      if(cache.size>maxDocuments)cache.delete(cache.keys().next().value);
      promise.catch(()=>{if(cache.get(key)===promise)cache.delete(key)});
    }
    return cache.get(key);
  }
  async function resolveSection(raw){
    const {path,section,language,role}=selection(raw);
    const map=await documentFor(path,language);
    const lines=map.get(section);
    const text=cleanLines(lines);
    const source=Object.freeze({
      revision:DIVINUM_OFFICIUM_PIN,path,section,language
    });
    return Object.freeze({
      schema:OFFICE_PARSED_SECTION_SCHEMA,
      sourceId:path+"#"+section,source,role,text,
      // A source section is NOT an appointed 1960 Office, a translation
      // collation, a printed Breviary certification, or a licence.
      status:"PARSED_UNVERIFIED",officePrecedenceVerified:false,
      translationVerified:false,printedEditionCertified:false,
      rightsApproved:false,publishable:false
    });
  }
  async function resolveParallel({path,section,role}={}){
    const parts=await Promise.all(LANGUAGES.map(language=>
      resolveSection({path,section,role,language})));
    return Object.freeze({
      schema:OFFICE_PARSED_PARALLEL_SCHEMA,
      sourceId:path+"#"+section,
      sourceRevision:DIVINUM_OFFICIUM_PIN,
      // Equal source identifiers do not prove paragraph-level alignment.
      alignmentVerified:false,officePrecedenceVerified:false,
      rightsApproved:false,publishable:false,status:"PARSED_UNVERIFIED",
      texts:Object.freeze(Object.fromEntries(parts.map(p=>[p.source.language,p.text]))),
      sections:Object.freeze(Object.fromEntries(parts.map(p=>[p.source.language,p])))
    });
  }
  return Object.freeze({
    resolveSection,resolveParallel,
    cachedSourceCount:()=>cache.size,
    clearCache:()=>cache.clear()
  });
}
