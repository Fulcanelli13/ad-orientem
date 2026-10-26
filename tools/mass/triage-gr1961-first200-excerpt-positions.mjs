#!/usr/bin/env node
// Research-only secondary screen: a clipped excerpt is NOT a resolved 1962 Mass Proper.
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
const normalize=s=>String(s??"").replace(/æ/gi,"ae").replace(/œ/gi,"oe")
  .normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
  .replace(/[^a-z]+/g," ").trim().replace(/\s+/g," ");
export function excerptPosition(x){
 const incipit=normalize(String(x.incipit).replace(/\s*\([^)]*\)\s*$/u,""));
 const text=String(x.latinExcerpt??"").trim();
 const starts=s=>s===incipit||s.startsWith(incipit+" ");
 if(incipit.split(" ").length<2||
    !(" "+normalize(text)+" ").includes(" "+incipit+" "))
  throw Error("No incipit in supplied excerpt: "+x.gregobaseId);
 if(starts(normalize(text)))return "EXCERPT_INITIAL";
 if(/^[Vv]\.\s*/u.test(text)&&starts(normalize(text.replace(/^[Vv]\.\s*/u,""))))
   return "VERSE_MARKED_INITIAL";
 return "EMBEDDED";
}
export function triageExcerptPositions(first,w,{reportBlobSha,witnessBlobSha}={}){
 if(first?.schema!=="ao-gr1961-first200-latin-source-review-v1"||
  first?.summary?.candidateRecords!==46||
  w?.schema!=="ao-gr1961-first200-latin-witness-screen-v1"||
  w?.candidateOccurrences?.length!==61||
  first.latinWitnessCommit!==w.latinWitnessCommit)throw Error("Frozen screen inputs required");
 const hits=w.candidateOccurrences.map(h=>({
  gregobaseId:h.gregobaseId,officePart:h.officePart,incipit:h.incipit,
  properSourcePath:h.properSourcePath,sourceSection:h.sourceSection,
  sourceBlobSha:h.sourceBlobSha,latinExcerpt:h.latinExcerpt,
  excerptPosition:excerptPosition(h),
 }));
 const records=first.records.filter(r=>r.evidenceCount).map(r=>{
  const a=hits.filter(h=>h.gregobaseId===r.gregobaseId);
  if(a.length!==r.evidenceCount||a.some(h=>
   h.officePart!==r.officePart||!r.evidenceFiles.includes(h.properSourcePath)))
    throw Error("Witness count/office/source mismatch for "+r.id);
  const initial=a.filter(h=>h.excerptPosition!=="EMBEDDED").length,embedded=a.length-initial;
  return {id:r.id,officePart:r.officePart,incipit:r.incipit,excerptInitial:initial,embedded,
   disposition:initial&&embedded?"MIXED":initial?"HAS_INITIAL":"EMBEDDED_ONLY",
   canonical1962Proper:"NOT_VERIFIED",
   preGospel:["al","gr","tr"].includes(r.officePart)?"SEGMENT_NOT_VERIFIED":"NOT_APPLICABLE",
   facsimile:"NOT_VERIFIED",release:"NONE"};
 });
 const tally=s=>hits.filter(h=>h.excerptPosition===s).length;
 const summary={records:records.length,occurrences:hits.length,excerptInitial:tally("EXCERPT_INITIAL"),
  verseMarkedInitial:tally("VERSE_MARKED_INITIAL"),embedded:tally("EMBEDDED"),
  anyInitial:records.filter(r=>r.excerptInitial>0).length,
  embeddedOnly:records.filter(r=>r.disposition==="EMBEDDED_ONLY").length,
  mixed:records.filter(r=>r.disposition==="MIXED").length,certifiedProper:0,promoted:0};
 if(JSON.stringify(summary)!==JSON.stringify({records:46,occurrences:61,excerptInitial:37,
   verseMarkedInitial:14,embedded:10,anyInitial:43,embeddedOnly:3,mixed:1,certifiedProper:0,promoted:0}))
  throw Error("Excerpt-position counts differ from reviewed frozen sample");
 return {schema:"ao-gr1961-first200-excerpt-position-v1",researchOnly:true,
  reportBlobSha,witnessBlobSha,witnessPinnedCommit:w.latinWitnessCommit,
  limits:"Excerpt position only, not selected 1962 Proper, full-source chant opening, pre-Gospel segment, musical facsimile or permission to promote.",
  summary,records,hits};
}
function main(){
 if(process.argv[2]!=="--verify")throw Error("Use --verify");
 const read=p=>readFileSync(new URL("../../"+p,import.meta.url),"utf8");
 const file="data/mass/chant-corpus/gr1961-first200-excerpt-position.v1.json";
 const saved=JSON.parse(read(file));
 const computed=triageExcerptPositions(
  JSON.parse(read("data/mass/chant-corpus/gr1961-first200-source-review.v1.json")),
  JSON.parse(read("data/mass/chant-corpus/gr1961-first200-latin-witness-screen.v1.json")),
  {reportBlobSha:saved.reportBlobSha,witnessBlobSha:saved.witnessBlobSha});
 if(read(file)!==JSON.stringify(computed,null,2)+"\n")throw Error("Position report not reproducible");
 console.log(JSON.stringify(computed.summary));
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1]))main();
