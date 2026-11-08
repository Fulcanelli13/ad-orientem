/**
 * Pure, source-format-preserving parser for bounded Roman Office metadata.
 * Input is an already supplied exact-revision source leaf in memory; no
 * downloading, source archive, CGI, browser, HTML or Office text output.
 *
 * Important: the original leaf may repeat [Rank], [Officium], [Rule]
 * with historical rubrical qualifiers. The Mass host's flattened map
 * is NOT a safe substitute for this conditional metadata analysis.
 */
import {DIVINUM_OFFICIUM_PIN} from "../app/source-transport-compat.js";
export const OFFICE_CONDITIONAL_META_SCHEMA="ao.office.conditional-metadata.v1";
const PATH=/^(?:Sancti|Tempora|Commune)\/[a-zA-Z0-9._-]+$/;
const HEADER=/^\[([^\]\r\n]{1,80})\](?:\s*\(([^\r\n]{1,160})\))?\s*$/;
const CAPTURE=new Set(["Officium","Rank","Rule","Name"]);
const CONTROL=/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/u;
function safe(s,max){
 if(typeof s!=="string"||s.length>max||CONTROL.test(s))throw Error("OFFICE_META_UNSAFE_SOURCE_VALUE");
 return s.trim();
}
function rankEntry(line){
 const columns=line.split(";;").map(s=>safe(s,160));
 if(columns.length<3)return null;
 // Retain source rank label and historical numeric code only as literal
 // WITNESSES. Neither number nor label determines RG91 precedence.
 return Object.freeze({
  printedLabel:columns[1]||columns[0]||null,
  sourceRankCode:columns[2]||null,
  commonReference:columns.slice(3).join(";;")||null,
  table91Position:null,roman1960Class:null
 });
}
export function parseConditionalOfficeMetadata({
 sourcePath,sourceRevision,language="la",sourceText
}={}){
 if(typeof sourcePath!=="string"||!PATH.test(sourcePath)||
    sourceRevision!==DIVINUM_OFFICIUM_PIN||language!=="la"||
    typeof sourceText!=="string"||sourceText.length>600000||
    !sourceText.trim())
  throw Error("OFFICE_META_SOURCE_CONTRACT_INVALID");
 const lines=sourceText.replace(/\r\n?/g,"\n").split("\n");
 if(lines.length>15000)throw Error("OFFICE_META_SOURCE_TOO_MANY_LINES");
 const variants=[],sourceSectionHeaders=[];let current=null;
 function finish(){
  if(!current)return;
  const metadata={kind:current.kind,
   headerQualifier:current.qualifier,
   sourceLine:current.sourceLine,
   lineQualifiers:Object.freeze(current.conditions),
   rankEntries:Object.freeze(current.ranks),
   // Rule text may be structural, but it is not sufficient to compute
   // appointed Office or change historical rubrical conditions.
   ruleTokens:Object.freeze(current.rules),
   titleHints:Object.freeze(current.titles)
  };
  variants.push(Object.freeze(metadata));current=null;
 }
 for(let i=0;i<lines.length;i++){
  const raw=safe(lines[i],20000),h=HEADER.exec(raw);
  if(h){
   finish();
   const kind=h[1],qualifier=h[2]??null;
   // Record source-owned section names and qualifier locations only.
   // This is not a representation of prayers, psalms, lessons or rubrics.
   if(sourceSectionHeaders.length>=500)throw Error("OFFICE_META_TOO_MANY_SOURCE_HEADERS");
   sourceSectionHeaders.push(Object.freeze({
    name:kind,qualifier:qualifier?safe(qualifier,160):null,
    line:i+1
   }));
   if(CAPTURE.has(kind)){
    current={kind,qualifier:qualifier?safe(qualifier,160):null,
      sourceLine:i+1,ranks:[],rules:[],titles:[],conditions:[]};
   }
   continue;
  }
  if(!current||!raw)continue;
  // Nested non-heading content only. A line-level (sed/nisi/rubrica...)
  // directive may govern adjacent lines: preserve ordinal and location.
  if(/^\(.*\)$/u.test(raw)){
   current.conditions.push(Object.freeze({line:i+1,literal:safe(raw,160)}));
  }else if(current.kind==="Rank"){
   const rank=rankEntry(raw);
   if(rank)current.ranks.push(Object.freeze({...rank,line:i+1}));
   else current.conditions.push(Object.freeze({line:i+1,literal:safe(raw,160)}));
  }else if(current.kind==="Rule"){
   current.rules.push(Object.freeze({line:i+1,literal:safe(raw,160)}));
  }else if(current.kind==="Officium"||current.kind==="Name"){
   if(current.titles.length<6)current.titles.push(Object.freeze({
    line:i+1,literal:safe(raw,160)}));
  }
  if(variants.length>96)throw Error("OFFICE_META_TOO_MANY_VARIANTS");
 }
 finish();
 if(!variants.length||variants.length>96)throw Error("OFFICE_META_MISSING_OR_EXCESSIVE");
 const byKind=Object.fromEntries([...CAPTURE].map(kind=>[
  kind,Object.freeze(variants.filter(v=>v.kind===kind))
 ]));
 const ranks=byKind.Rank.flatMap(v=>v.rankEntries);
 return Object.freeze({
  schema:OFFICE_CONDITIONAL_META_SCHEMA,
  sourceRevision,sourcePath,language,
  status:"CONDITIONAL_SOURCE_METADATA_UNADJUDICATED",
  metadataVariants:Object.freeze(variants),
  sourceSectionHeaders:Object.freeze(sourceSectionHeaders),
  byKind:Object.freeze(byKind),
  rankWitnessCount:ranks.length,
  rankVariantBlockCount:byKind.Rank.length,
  rankQualifiersRetained:byKind.Rank.some(v=>v.headerQualifier||v.lineQualifiers.length),
  // Original source has possible alternate historical rubrics. Preserve
  // all witnesses; never select a rule just because it contains "1960".
  class:null,rg91TablePosition:null,appointedOffice:null,
  conditionalRulesResolved:false,firstVespersVerified:false,
  textOutputIncluded:false,translationsVerified:false,
  rightsReviewed:false,publishable:false
 });
}
