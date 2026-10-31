/**
 * Research-only bridge to the canonical Mass host's parsed source interface.
 *
 * This is an adapter, NOT an Office compositor. It reuses
 * hostResolver.resolveSource(path, language, diagnostic) and never downloads
 * files, constructs URLs, invokes CGI or persists source text.
 *
 * The host must explicitly expose its pinned original-source revision.
 * Do not forge provenance merely because an unlabelled Map was returned.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {createOfficeSectionResolver} from "./source-section-resolver.js";
import {createOfficeAtReferenceResolver} from "./at-reference-resolver.js";

/**
 * Canonical pinned source-read adapter, shared by exact-section and
 * source-backed macro parsers. Only the host may supply parsed leaf data.
 */
export function createOfficePinnedHostSourceReader({hostResolver}={}){
  if(!hostResolver||typeof hostResolver.resolveSource!=="function")
    throw Error("OFFICE_MASS_SOURCE_RESOLVER_REQUIRED");
  if(hostResolver.sourceRevision!==DIVINUM_OFFICIUM_PIN)
    throw Error("OFFICE_MASS_SOURCE_PIN_NOT_VERIFIED");
  return async(path,language)=>{
    const parsed=await hostResolver.resolveSource(path,language,"office-source-first");
    if(!parsed || !(parsed.map instanceof Map))
      throw Error("OFFICE_HOST_PARSED_SECTION_MAP_REQUIRED");
    if(parsed.sourceRevision!=null&&parsed.sourceRevision!==DIVINUM_OFFICIUM_PIN)
      throw Error("OFFICE_HOST_SOURCE_REVISION_CHANGED");
    if(parsed.sourcePath!=null&&parsed.sourcePath!==path)
      throw Error("OFFICE_HOST_SOURCE_PATH_CHANGED");
    if(parsed.language!=null&&parsed.language!==language)
      throw Error("OFFICE_HOST_SOURCE_LANGUAGE_CHANGED");
    return Object.freeze({
      sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
      map:parsed.map
    });
  };
}
export function createOfficeMassHostBridge({hostResolver,maxDocuments=96}={}){
  return createOfficeSectionResolver({
    readSource:createOfficePinnedHostSourceReader({hostResolver}),maxDocuments
  });
}
/**
 * Opt-in research extension of that SAME host source transport. Standard
 * prayers are read from the pinned Psalterium/Common/Prayers source, never
 * handwritten. Psalm raw verses require a second explicitly injected raw
 * source read contract and do not establish full antiphon/doxology rubrics.
 */
export function createOfficeAtHostBridge({
 hostResolver,maxDocuments=32,maxDepth=6,maxNodes=48,
 enableStandardPrayers=false,readPsalmSource=null,enablePsalmVerses=false
}={}){
  return createOfficeAtReferenceResolver({
    readSource:createOfficePinnedHostSourceReader({hostResolver}),
    maxDocuments,maxDepth,maxNodes,enableStandardPrayers,
    readPsalmSource,enablePsalmVerses
  });
}
