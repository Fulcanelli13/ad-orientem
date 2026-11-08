/**
 * Filename-only lookup of a pinned Latin Office source directory inventory.
 * The index is a list of GitHub tree entries, not a transcription, a file
 * read, a checked proper, a language witness or a 1960 Office appointment.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
import {planUniversalOfficeKeysForYear} from "./universal-source-descriptors.js";
export const OFFICE_PINNED_FILENAME_SCHEMA="ao.office.pinned-filename-index.v1";
const DIRECTORIES=Object.freeze(["Tempora","Sancti","Commune"]);
export function validateOfficePinnedFilenameIndex(input){
 if(input?.schema!==OFFICE_PINNED_FILENAME_SCHEMA||
  input.upstreamRepository!=="DivinumOfficium/divinum-officium"||
  input.upstreamSourceRoot!=="web/www/horas/Latin"||
  input.sourceRevision!==DIVINUM_OFFICIUM_PIN||
  input.metadataOnly!==true||
  input.sourceTextDownloadedOrBundled!==false||
  input.rubricalVariantSelectionCertified!==false||
  input.languageCompletenessCertified!==false||
  input.sourceTextAndOfficeCompositionCertified!==false||
  input.published!==false||
  input.discoveryMethod!=="PINNED_GITHUB_CONTENTS_DIRECTORY_FILENAMES_ONLY"||
  !input.counts||!input.paths)
  throw Error("OFFICE_PINNED_FILENAME_INDEX_PROVENANCE_INVALID");
 const indexed=new Set();
 for(const dir of DIRECTORIES){
  const paths=input.paths[dir];
  if(!Array.isArray(paths)||input.counts[dir]!==paths.length||
   paths.length<1||paths.length>2000)
    throw Error("OFFICE_PINNED_FILENAME_INDEX_COUNT_INVALID:"+dir);
  for(let i=0;i<paths.length;i++){
   const path=paths[i];
   if(typeof path!=="string"||!path.startsWith(dir+"/")||
      path.includes("..")||path.includes(".txt")||
      !/^[^/]+\/[^/\u0000-\u001f]+$/u.test(path)||
      indexed.has(path)||i>0&&paths[i-1]>=path)
    throw Error("OFFICE_PINNED_FILENAME_INDEX_PATH_INVALID:"+dir);
   indexed.add(path);
  }
 }
 if(indexed.size!==1185||
    input.counts.Tempora!==638||
    input.counts.Sancti!==486||
    input.counts.Commune!==61)
  throw Error("OFFICE_PINNED_FILENAME_INDEX_SNAPSHOT_MISMATCH");
 return Object.freeze({size:indexed.size,sourceRevision:DIVINUM_OFFICIUM_PIN});
}
export function createOfficePinnedFilenameLookup(manifest){
 validateOfficePinnedFilenameIndex(manifest);
 const known=new Set(DIRECTORIES.flatMap(d=>manifest.paths[d]));
 function lookup(path){
  if(typeof path!=="string"||!/^\w+\/[^/]+$/.test(path))
   throw Error("OFFICE_PINNED_FILENAME_LOOKUP_PATH_INVALID");
  return Object.freeze({
   path,sourceRevision:DIVINUM_OFFICIUM_PIN,
   filenameStatus:known.has(path)?
    "PINNED_LATIN_FILENAME_LISTED":"EXACT_LATIN_FILENAME_NOT_LISTED",
   sourceFileTextInspected:false,officeAppointed:false,
   rankVerified:false,translationsVerified:false,publishable:false
  });
 }
 function analyzeYear(year){
  const plan=planUniversalOfficeKeysForYear(year);
  let listed=0,notListed=0;
  const dates=plan.days.map(d=>{
   const keys=d.keys.map(k=>{
    const label=lookup(k.path);
    if(label.filenameStatus==="PINNED_LATIN_FILENAME_LISTED")listed++;
    else notListed++;
    return Object.freeze({...k,filenameStatus:label.filenameStatus});
   });
   return Object.freeze({date:d.date,keys:Object.freeze(keys)});
  });
  if(listed+notListed!==plan.totalProposedSourcePaths)
   throw Error("OFFICE_PINNED_FILENAME_YEAR_COUNT_MISMATCH");
  return Object.freeze({
   year,sourceRevision:DIVINUM_OFFICIUM_PIN,
   totalDirectoryFilenames:known.size,
   candidatePaths:plan.totalProposedSourcePaths,
   exactFilenamesListed:listed,exactFilenamesNotListed:notListed,
   actualOfficeTextsParsed:0,independentlyAppointedOffices:0,
   publishedOffices:0,
   dates:Object.freeze(dates)
  });
 }
 return Object.freeze({lookup,analyzeYear});
}
