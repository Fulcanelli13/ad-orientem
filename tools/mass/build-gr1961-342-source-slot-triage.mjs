#!/usr/bin/env node
// Deterministic research-only triage; never imported into reader.
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
const paths={
  "a": "data/mass/chant-corpus/gr1961-first200-source-review.v1.json",
  "b": "data/mass/chant-corpus/gr1961-second200-source-review.v1.json",
  "c": "data/mass/chant-corpus/gr1961-remaining795-source-review.v1.json",
  "d": "data/mass/chant-corpus/gr1961-first400-other-proper-text-review.v1.json",
  "e": "data/mass/chant-corpus/gr1961-first400-pre-gospel-text-discrimination.v1.json",
  "f": "data/mass/chant-corpus/gr1961-remaining795-text-discrimination.v1.json",
  "g": "data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json",
  "h": "data/mass/chant-corpus/gr1961-second200-latin-witness-screen.v1.json",
  "j": "data/mass/chant-corpus/gr1961-remaining795-latin-evidence.v1.json"
};
const gitBlobSha=s=>createHash("sha1").update("blob "+Buffer.byteLength(s)+"\0"+s).digest("hex");
const build342=function build342(i,blobs,paths){
 const assert=(c,m)=>{if(!c)throw Error("GR1961_342_"+m)};
 const reviews=[...i.a.records,...i.b.records,...i.c.records];
 const details=[...i.d.records,...i.e.records,...i.f.records];
 assert(reviews.length===1195&&new Set(reviews.map(r=>r.id)).size===1195,"archive");
 assert(details.length===342&&new Set(details.map(r=>r.id)).size===342,"candidates");
 const byId=new Map(reviews.map(r=>[r.id,r]));
 const hash=new Map(i.g.sourceFiles.map(r=>[r.path,r.blobSha]));
 assert(hash.size===106&&i.h.latinWitnessCommit===i.g.latinWitnessCommit&&i.j.sourceCommit===i.g.latinWitnessCommit,"manifest");
 for(const block of [i.h,i.j])for(const src of block.sourceFiles)assert(hash.get(src.path)===src.blobSha,"source_sha");
 const tiers={AT_LEAST_EIGHT_WORD_PREFIX:"STRONG_INITIAL_TEXT",AT_LEAST_EIGHT_INITIAL_WORDS_AGREE:"STRONG_INITIAL_TEXT",
  PARTIAL_PREFIX:"PARTIAL_TEXT",PARTIAL_TEXT_COMPARISON:"PARTIAL_TEXT",
  PRIORITY_EARLY_DIVERGENCE:"DIVERGENT_EARLY_TEXT",PRIORITY_EARLY_TEXT_DIVERGENCE:"DIVERGENT_EARLY_TEXT"};
 const roles={in:"INTROIT",of:"OFFERTORY",co:"COMMUNION",gr:"GRADUAL",al:"ALLELUIA_TRACT_SEQUENCE",tr:"ALLELUIA_TRACT_SEQUENCE"};
 const assigned={in:"Introitus",of:"Offertorium",co:"Communio"};
 const records=details.map(d=>{
   const base=byId.get(d.id);
   assert(base?.gregobaseId===d.gregobaseId&&base.officePart===d.officePart&&
     base.status===(assigned[d.officePart]?"LATIN_SOURCE_SECTION_CANDIDATE":"PRE_GOSPEL_SEGMENT_UNRESOLVED"),"base_"+d.id);
   assert(!d.gabcSha256||d.gabcSha256===base.gabcSha256,"gabc_"+d.id);
   const tier=tiers[d.status??d.limitedTextDisposition];assert(tier,"tier_"+d.id);
   const sourceRows=d.sources??d.matches;
   assert(Array.isArray(sourceRows)&&sourceRows.length>=base.evidenceCount,"occurrences_"+d.id);
   const evidence=sourceRows.map(s=>{
     const sourcePath=s.path??s.sourcePath,sourceBlobSha=hash.get(sourcePath+".txt");
     const prefix=s.commonPrefixWords??s.sharedInitialWords;
     assert(sourceBlobSha&&(!s.sourceBlobSha||s.sourceBlobSha===sourceBlobSha),"source_"+d.id);
     assert(Number.isInteger(prefix)&&prefix>=0&&prefix<=12&&typeof s.sourceText==="string","text_"+d.id);
     const sectionRoleMismatch=assigned[d.officePart]?
       s.section!==assigned[d.officePart]:
       !["Graduale","Alleluia","Tractus"].includes(s.section);
     const position=s.sourcePosition??s.position??"POSITION_NOT_VERIFIED";
     return {path:sourcePath,sourceBlobSha,section:s.section,line:s.sourceLine??s.lineNumber??null,
       text:s.sourceText,initialWords:prefix,position,
       risk:sectionRoleMismatch?"CROSS_ROLE_OR_SECTION_MISMATCH":
         /^\\s*(?:[vV]\\.\\s|℣\\.\\s)/.test(s.sourceText)?"VERSE_PREFIX_NEEDS_SEGMENT_REVIEW":
         position==="EMBEDDED"?"EMBEDDED_TEXT_NOT_OPENING":"UNADJUDICATED"};
   }).sort((a,b)=>a.path.localeCompare(b.path)||a.section.localeCompare(b.section)||(a.line??0)-(b.line??0));
   const got=[...new Set(evidence.map(x=>x.path))].sort(),expected=[...new Set(base.evidenceFiles)].sort();
   assert(JSON.stringify(got)===JSON.stringify(expected),"pathset_"+d.id);
   return {id:d.id,gregobaseId:d.gregobaseId,officePart:d.officePart,trackId:roles[d.officePart],
     incipit:d.incipit,gabcSha256:base.gabcSha256,tier,evidence,
     sourcePaths:got,selected1962:"NOT_VERIFIED",threeLanguageBoundary:assigned[d.officePart]?"NOT_APPLICABLE":"UNVERIFIED",
     musicalFacsimile:"NOT_REVIEWED",editorialApproval:"NOT_GRANTED",promoted:false};
 }).sort((a,b)=>a.gregobaseId-b.gregobaseId);
 const count=t=>records.filter(r=>r.tier===t).length;
 const simple=records.filter(r=>["in","of","co"].includes(r.officePart));
 const pre=records.filter(r=>!["in","of","co"].includes(r.officePart));
 const group=new Map();
 for(const r of records)for(const e of r.evidence.filter(x=>x.initialWords>=8)){
   const key=e.path+"|"+r.trackId;
   if(!group.has(key))group.set(key,new Set());
   group.get(key).add(r.id);
 }
 const contested=[...group].filter(([,ids])=>ids.size>1)
   .map(([sourceAndTrack,ids])=>({sourceAndTrack,candidates:[...ids].sort()}))
   .sort((a,b)=>a.sourceAndTrack.localeCompare(b.sourceAndTrack));
 const summary={archiveRecords:reviews.length,candidates:records.length,
   strong:count("STRONG_INITIAL_TEXT"),partial:count("PARTIAL_TEXT"),divergent:count("DIVERGENT_EARLY_TEXT"),
   simple:simple.length,preGospel:pre.length,sourceOccurrences:records.reduce((n,r)=>n+r.evidence.length,0),
   sourcePaths:new Set(records.flatMap(r=>r.sourcePaths)).size,
   multiSourceRecords:records.filter(r=>r.sourcePaths.length>1).length,
   strongSimple:simple.filter(r=>r.tier==="STRONG_INITIAL_TEXT").length,
   strongPreGospel:pre.filter(r=>r.tier==="STRONG_INITIAL_TEXT").length,
   crossRoleOccurrences:records.reduce((n,r)=>n+r.evidence.filter(x=>x.risk==="CROSS_ROLE_OR_SECTION_MISMATCH").length,0),
   contestedSourceSections:contested.length,selected1962:0,facsimileApproved:0,promoted:0};
 assert(summary.strong===275&&summary.partial===39&&summary.divergent===28,"tiers");
 assert(summary.simple===157&&summary.preGospel===185&&summary.sourceOccurrences===506,"structure");
 return {schema:"ao-gr1961-342-source-slot-triage-v1",researchOnly:true,latinWitnessCommit:i.g.latinWitnessCommit,
   manifestFiles:106,inputs:Object.fromEntries(Object.keys(paths).sort().map(k=>[k,{path:paths[k],blobSha:blobs[k]}])),
   warning:"Sampled text occurrences only. A strong prefix is not proof of the selected 1962 Proper, chant-section boundary, musical identity, facsimile accuracy or actual local Schola performance.",
   summary,contestedSourceSections:contested,records};
};
export function generate342(read){
 const raw=Object.fromEntries(Object.entries(paths).map(([k,p])=>[k,read(p)]));
 return build342(Object.fromEntries(Object.entries(raw).map(([k,s])=>[k,JSON.parse(s)])),
 Object.fromEntries(Object.entries(raw).map(([k,s])=>[k,gitBlobSha(s)])),paths);
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const expected=JSON.stringify(generate342(read),null,2)+"\n";
 if(read("data/mass/chant-corpus/gr1961-342-source-slot-triage.v1.json")!==expected)throw Error("342 triage report drift or unsupported source change");
 console.log("AO_GR1961_342="+JSON.stringify(JSON.parse(expected).summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
