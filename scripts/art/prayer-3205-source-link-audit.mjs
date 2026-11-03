/**
 * Read-only second-pass source presence scan.
 * Works inside the GitHub checkout where >1 MB frozen gallery files are readable;
 * it intentionally does NOT release images, infer approval, or assert rights.
 * Usage: node scripts/art/prayer-3205-source-link-audit.mjs [output.json]
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {dirname,resolve} from "node:path";

const read=p=>JSON.parse(readFileSync(new URL("../../"+p,import.meta.url),"utf8"));
const root="data/prayer/artwork-editorial-20261101/";
const master=read(root+"curatorial-master-267-20261101.v1.json");
const gallery3205=read("data/artwork/research-source-records-3205.v1.json");
const operational989=read("data/artwork/research-operational-989.v1.json");
const crosswalk=read(root+"gallery-archive-crosswalk-267-20261103.v1.json");
function collectStrings(value,result=new Set(),seen=new WeakSet()){
 if(typeof value==="string"){result.add(value);return result}
 if(value===null||typeof value!=="object"||seen.has(value))return result;
 seen.add(value);
 if(Array.isArray(value)){for(const v of value)collectStrings(v,result,seen)}
 else for(const v of Object.values(value))collectStrings(v,result,seen);
 return result;
}
const urls3205=collectStrings(gallery3205);
const urls989=collectStrings(operational989);
const byId=new Map(crosswalk.assignments.map(a=>[a.slot,a]));
const rows=[];
for(const a of master.assignments){
 const sourcePage=a.currentAssignment?.painting?.sourcePage||null;
 const audit=byId.get(a.slot);
 if(!audit)throw Error("Crosswalk missing "+a.slot);
 rows.push({
  slot:a.slot,sourcePage,
  sourceCrosswalkMethod:a.sourceCrosswalk?.method||null,
  existingEditorialIdentityVerified:a.sourceCrosswalk?.sourceIdentityVerified===true,
  exactSourceUrlStringIn3205:!!sourcePage&&urls3205.has(sourcePage),
  exactSourceUrlStringInOperational989:!!sourcePage&&urls989.has(sourcePage),
  researchGallery989TitleAndArtistGroups:audit.gallery989.groupIDs,
  publicationRightFromCatalogueMatch:false
 });
}
const result={
 schema:"AO_PRAYER_267_SOURCE3205_TEXTUAL_PRESENCE_AUDIT_V1",
 asOf:"2026-11-03",
 scope:"READ_ONLY_RESEARCH_LINK_PRESENCE_NOT_OBJECT_OR_PHOTO_CERTIFICATION",
 sourcePaths:[
  "data/artwork/research-source-records-3205.v1.json",
  "data/artwork/research-operational-989.v1.json",
  root+"curatorial-master-267-20261101.v1.json"
 ],
 knownLimitations:[
  "An exact URL stored anywhere in the frozen research JSON is not proof of original photographic bytes or rights",
  "An absent URL may be present under another permitted source alias; no fuzzy auto-join",
  "A gallery work group does not imply a currently released photograph",
  "Approved editorial decisions, stage scopes, existing cover protections and rights gates remain unchanged"
 ],
 sourceShapes:{
  source3205TopLevelKeys:Object.keys(gallery3205).slice(0,25),
  operational989TopLevelKeys:Object.keys(operational989).slice(0,25)
 },
 counts:{
  positions:rows.length,
  selectedSourceURLPositions:rows.filter(r=>r.sourcePage).length,
  distinctSelectedSourceURLs:new Set(rows.map(r=>r.sourcePage).filter(Boolean)).size,
  positionsWithExactURLStringIn3205:rows.filter(r=>r.exactSourceUrlStringIn3205).length,
  positionsWithExactURLStringInOperational989:rows.filter(r=>r.exactSourceUrlStringInOperational989).length,
  positionsWithEitherExactURLString:rows.filter(r=>r.exactSourceUrlStringIn3205||r.exactSourceUrlStringInOperational989).length
 },
 rows
};
if(rows.length!==267)throw Error("Expected 267 slot entries");
const output=process.argv[2]||"artifacts/prayer-gallery/prayer-3205-source-presence-20261103.v1.json";
mkdirSync(dirname(resolve(output)),{recursive:true});
writeFileSync(output,JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify({output,counts:result.counts,sourceShapes:result.sourceShapes},null,2));
