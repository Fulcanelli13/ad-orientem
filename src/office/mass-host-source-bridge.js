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

export function createOfficeMassHostBridge({hostResolver,maxDocuments=96}={}){
  if(!hostResolver||typeof hostResolver.resolveSource!=="function")
    throw Error("OFFICE_MASS_SOURCE_RESOLVER_REQUIRED");
  if(hostResolver.sourceRevision!==DIVINUM_OFFICIUM_PIN)
    throw Error("OFFICE_MASS_SOURCE_PIN_NOT_VERIFIED");
  const readSource=async(path,language)=>{
    // Same exact parsed source contract used in reader-proper-runtime-recovery.
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
  return createOfficeSectionResolver({readSource,maxDocuments});
}
