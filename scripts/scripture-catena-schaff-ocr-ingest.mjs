#!/usr/bin/env node
/*
 * Original-print Schaff OCR acquisition + whole-volume question candidates.
 *
 * IMPORTANT: OCR is an unverified scan transcription, NOT publishable Father
 * speech. Section ownership, author, biblical quotations, editorial notes and
 * questions still need source-level segmentation. Every "overlap" result is a
 * heuristic pointer, never an assertion of identity or novelty.
 *
 * Run: node scripts/scripture-catena-schaff-ocr-ingest.mjs --volume all
 * Test/offline: --volume NPNF1-06 --input path/to/historical-volume-ocr.txt
 *
 * Acquires independent 1888 print scans from Internet Archive (not CCEL).
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolve,join} from "node:path";

const root="data/scripture/catena/";
const manifest=JSON.parse(readFileSync(root+
 "research/full-corpus-pass-20261021/schaff-ocr-source-manifest.v1.json","utf8"));
if(manifest?.schema!=="ao.catena.schaff-ocr-source-manifest.v1"||
 manifest.editions?.length!==2)throw Error("UNPINNED_SCHAFF_SOURCE_MANIFEST");
const scopes=JSON.parse(readFileSync(root+
 "research/full-corpus-pass-20261021/schaff-ocr-work-scope.v1.json","utf8"));
if(scopes.schema!=="ao.catena.schaff-historical-scan-work-scope.v1"||
 scopes.volumes?.length!==2)throw Error("SCHAFF_OCR_SCOPE_MANIFEST_INVALID");
for(const volume of scopes.volumes){
 if(!/^[a-f0-9]{64}$/.test(volume.ocrSHA256)||
    volume.scopes[0]?.start!==1||
    volume.scopes.at(-1)?.end!==volume.maxLines)
  throw Error("INVALID_SCHAFF_OCR_BOUNDARIES");
 for(let i=1;i<volume.scopes.length;i++)
  if(volume.scopes[i].start!==volume.scopes[i-1].end+1)
   throw Error("SCHAFF_OCR_WORK_SCOPES_NOT_CONTIGUOUS");
}
const argv=process.argv.slice(2);
const arg=(name,fallback)=>{const i=argv.indexOf(name);return i<0?fallback:argv[i+1]};
const chosen=arg("--volume","all"),output=resolve(arg("--output-dir","dist/schaff-original-ocr"));
const input=arg("--input",null);
const sources=chosen==="all"?manifest.editions:manifest.editions.filter(x=>x.editionId===chosen);
if(sources.length!==(chosen==="all"?2:1)||input&&sources.length!==1)
 throw Error("USE_ONE_VALID_VOLUME_WITH_LOCAL_INPUT");
const sha=value=>createHash("sha256").update(value).digest("hex");
function decodeEntities(s){
 const m={"amp":"&","lt":"<","gt":">","quot":'"',"apos":"'","nbsp":" "};
 return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(all,name)=>{
  const n=name.toLowerCase();if(m[n])return m[n];
  if(n.startsWith("#")){const v=n[1]==="x"?parseInt(n.slice(2),16):Number(n.slice(1));
   if(v>0&&v<=0x10ffff)return String.fromCodePoint(v)}
  return all;
 });
}
export function extractPlainOCR(httpBody){
 if(!/^\s*<(?:!doctype|html|head|body)\b/i.test(httpBody.slice(0,200)) &&
    !/<html[\s>]/i.test(httpBody.slice(0,2000)))return httpBody;
 const pre=/<pre\b[^>]*>([\s\S]*?)<\/pre>/i.exec(httpBody);
 if(!pre)throw Error("ARCHIVE_HTML_HAS_NO_PLAIN_TEXT_PRE");
 return decodeEntities(pre[1].replace(/<[^>]*>/g,""));
}
async function acquire(source){
 const urls=[source.downloadUrl,source.streamUrl];
 let lastError;
 for(const url of urls){
  for(let attempt=0;attempt<2;attempt++){
   try{
    const response=await fetch(url,{signal:AbortSignal.timeout(110000),
     headers:{"user-agent":"AdOrientem-Research/1.0 (public-domain scholarly text indexing)",
      "accept":"text/plain,text/html;q=0.7,*/*;q=0.1"}});
    if(!response.ok)throw Error("HTTP_"+response.status);
    const length=Number(response.headers.get("content-length")||0);
    if(length>30_000_000)throw Error("SOURCE_TOO_LARGE");
    const body=Buffer.from(await response.arrayBuffer());
    if(body.length>30_000_000)throw Error("SOURCE_TOO_LARGE");
    const text=extractPlainOCR(body.toString("utf8"));
    if(text.length<200_000)throw Error("SOURCE_UNEXPECTEDLY_SHORT:"+text.length);
    const marker=source.expectedTextMarker.replace(/\s+/g,"");
    if(!text.toUpperCase().replace(/\s+/g,"").includes(marker))
     throw Error("EXPECTED_PRINTED_VOLUME_MARKER_NOT_FOUND");
    return {text,acquiredFrom:url,bytes:body.length};
   }catch(error){lastError=error;process.stderr.write(
    "OCR source attempt "+source.editionId+" "+attempt+" "+url+" "+String(error.message)+"\n");}
  }
 }
 throw Error("UNABLE_TO_ACQUIRE_"+source.editionId+": "+String(lastError?.message));
}
function words(s){
 return s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(Boolean);
}
function fingerprints(s,max=64){
 const t=words(s),width=5;
 if(t.length<width)return [];
 const count=t.length-width+1,step=Math.max(1,Math.ceil(count/max));
 const out=new Set();
 for(let i=0;i<count;i+=step)out.add(t.slice(i,i+width).join(" "));
 if(count>1)out.add(t.slice(-width).join(" "));
 return [...out];
}
export function buildCanonicalFingerprintIndex(corpora){
 const postings=new Map(),pointers=new Set();
 for(const [gospel,source] of Object.entries(corpora)){
  for(const p of source.pericopes||[]){
   for(let i=0;i<(p.segments||[]).length;i++){
    const segment=p.segments[i],ptr=p.id+":"+i;
    if(!segment?.text||!segment.father)throw Error("INVALID_CANONICAL_CATENA_SEGMENT");
    if(pointers.has(ptr))throw Error("DUPLICATE_CATENA_POINTER");
    pointers.add(ptr);
    for(const fp of fingerprints(segment.text,72)){
     if(!postings.has(fp))postings.set(fp,[]);
     const list=postings.get(fp);
     if(list.length<=100)list.push(ptr);
    }
   }
  }
 }
 return {postings,sourcePointers:pointers.size};
}
export function findLexicalOverlapHints(content,index){
 const fp=fingerprints(content,72),votes=new Map();
 for(const term of fp){
  const hits=index.postings.get(term)||[];
  if(hits.length>100)continue;
  for(const ptr of hits)votes.set(ptr,(votes.get(ptr)||0)+1);
 }
 return [...votes].filter(([,hits])=>hits>=2).map(([pointer,hits])=>({
   pointer,sharedFiveWordShingles:hits,
   fractionOfCandidateShingles:Number((hits/fp.length).toFixed(4)),
   relation:"unconfirmed_lexical_overlap_only"
  }))
  .sort((a,b)=>b.sharedFiveWordShingles-a.sharedFiveWordShingles||
    a.pointer.localeCompare(b.pointer)).slice(0,3);
}
const BAD=/^\s*(?:copyright|table of contents|index of|publisher|contents|page\s+\d+)\b/i;
export function resolvePrintedWorkScope(sourceId,digest,lineNumber){
 const pinned=scopes.volumes.find(x=>x.editionId===sourceId&&x.ocrSHA256===digest);
 if(!pinned)return "unclassified_source_digest_changed_or_local_test";
 const match=pinned.scopes.find(x=>x.start<=lineNumber&&x.end>=lineNumber);
 return match?.unit||"unclassified_outside_printed_work_boundaries";
}
export function extractOCRQuestionWindows(text,index,source,digest){
 const lines=text.replace(/\r/g,"").split("\n");
 const found=[],seen=new Set();
 for(let i=0;i<lines.length;i++){
  if(!lines[i].includes("?"))continue;
  if(BAD.test(lines[i]))continue;
  const a=Math.max(0,i-5),b=Math.min(lines.length,i+7);
  const context=lines.slice(a,b).join("\n");
  // An OCR question mark may simply be a biblical quotation, a footnote,
  // a publisher's heading, or a scan error. We do NOT assert its author.
  const key=sha(source.editionId+"|"+lines[i]+"|"+lines.slice(Math.max(0,i-2),i+2).join("|"));
  if(seen.has(key))continue;
  seen.add(key);
  const hints=findLexicalOverlapHints(context,index);
  found.push({
   id:"schaff-ocr-"+source.editionId.toLowerCase()+"-"+sha(key).slice(0,16),
   editionId:source.editionId,
   sourceVolumeUrl:source.archiveDetailUrl,
   printedWorkScope:resolvePrintedWorkScope(source.editionId,digest,i+1),
   printedWorkScopeStatus:"sha_pinned_ocr_range_heuristic_not_authorship",
   ocrLineStart:a+1,ocrLineQuestion:i+1,ocrLineEnd:b,
   originalOCRWindow:context,
   originalOCRWindowSHA256:sha(context),
   ownership:"unresolved_OCR_volume_includes_author_text_bible_quotes_and_editorial_notes",
   questionType:"question_mark_candidate_unverified",
   catenaOverlapHints:hints,
   novelContentConfirmed:false,publicationEligible:false
  });
 }
 return {lineCount:lines.length,totalQuestionWindows:found.length,windows:found};
}
mkdirSync(output,{recursive:true});
const corpora=Object.fromEntries(["matthew","mark","luke","john"].map(gospel=>
 [gospel,JSON.parse(readFileSync(root+gospel+".json","utf8"))]));
const index=buildCanonicalFingerprintIndex(corpora);
if(index.sourcePointers!==12692)throw Error("CANONICAL_CATENA_COUNT_CHANGED:"+index.sourcePointers);
const summaries=[];
for(const source of sources){
 const item=input?{
  text:readFileSync(input,"utf8"),
  acquiredFrom:"local_fixture:"+input,bytes:readFileSync(input).length
 }:await acquire(source);
 if(item.text.length<100&&input)throw Error("LOCAL_OCR_EMPTY");
 const digest=sha(item.text);
 const base=join(output,source.editionId);
 const rawPath=base+".raw-ocr.txt",candidatePath=base+".question-candidates.json";
 writeFileSync(rawPath,item.text,"utf8");
 const result=extractOCRQuestionWindows(item.text,index,source,digest);
 const workScopeCounts=Object.fromEntries(
  [...new Set(result.windows.map(w=>w.printedWorkScope))].sort()
   .map(scope=>[scope,result.windows.filter(w=>w.printedWorkScope===scope).length])
 );
 const research={
  schema:"ao.catena.schaff-whole-volume-ocr-question-candidates.v1",
  editionId:source.editionId,sourceScan:source.archiveDetailUrl,
  acquiredFrom:item.acquiredFrom,sourceSHA256:digest,originalOCRCharacters:item.text.length,
  canonicalCorpusSourcePointers:index.sourcePointers,
  unsegmentedOCR:true,authorshipNotValidated:true,
  originalLanguageCollation:false,publicationEligible:false,
  sourceLineCount:result.lineCount,
  questionMarkCandidates:result.totalQuestionWindows,
  overlapCandidateCount:result.windows.filter(r=>r.catenaOverlapHints.length>0).length,
  novelQuestionRecordsConfirmed:0,
  printedWorkBoundariesMatchedVerifiedScanDigest:
   scopes.volumes.some(x=>x.editionId===source.editionId&&x.ocrSHA256===digest),
  printedWorkScopeCounts:workScopeCounts,
  windows:result.windows
 };
 writeFileSync(candidatePath,JSON.stringify(research,null,2)+"\n","utf8");
 summaries.push({
  editionId:source.editionId,
  acquiredFrom:item.acquiredFrom,
  rawOCR:rawPath,rawTextSHA256:digest,
  candidateFile:candidatePath,
  characters:item.text.length,lines:result.lineCount,
  questionMarkCandidates:result.totalQuestionWindows,
  possibleLexicalCatenaOverlap:research.overlapCandidateCount,
  confirmedNovelQuestions:0,publicationApprovals:0,
  printedWorkScopeCounts:workScopeCounts
 });
 process.stdout.write(JSON.stringify(summaries[summaries.length-1])+"\n");
}
writeFileSync(join(output,"summary.v1.json"),JSON.stringify({
 schema:"ao.catena.schaff-ocr-ingestion-summary.v1",
 historicalScanVolumes:summaries.length,
 totalQuestionMarkCandidates:summaries.reduce((s,x)=>s+x.questionMarkCandidates,0),
 researchNotForReader:true,
 authorshipResolved:false,segmentationComplete:false,publicationApprovals:0,
 items:summaries
},null,2)+"\n");
