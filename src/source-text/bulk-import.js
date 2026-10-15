// Work-scale ingestion into a staged library, not a critical-edition publisher.
// One call handles all chapters. Copyright/edition ownership is separate from
// structural parsing and OCR confidence. No source text is released by default.
const ID=/^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/;
const WORD=/\S+/g;
const nonblank=x=>typeof x==="string"&&x.trim().length>0;
const clean=s=>s.normalize("NFC").replace(/\r\n?/g,"\n");
function fingerprint(input){
 let v=2166136261;for(const ch of input){v^=ch.codePointAt(0);v=Math.imul(v,16777619);}
 return (v>>>0).toString(16).padStart(8,"0");
}
function parseChapter(chapter){
 const raw=clean(chapter.text);
 const hasAnchors=chapter.format==="ANCHORED_PARAGRAPHS";
 if(!hasAnchors&&chapter.format!=="PLAIN_PARAGRAPHS")throw new Error("BULK_FORMAT_UNSUPPORTED");
 const segments=hasAnchors?raw.split("\n").map(s=>s.trim()).filter(Boolean):
   raw.split(/\n\s*\n/g).map(s=>s.replace(/\n/g," ").trim()).filter(Boolean);
 const blocks=[],bad=[];
 const anchors=new Set();
 for(let i=0;i<segments.length;i++){
  const line=segments[i];
  let anchor,body;
  if(hasAnchors){
   const m=line.match(/^\[([A-Za-z0-9][A-Za-z0-9._-]{0,79})\]\s+([\s\S]+)$/);
   if(!m){bad.push({type:"UNPARSEABLE_ANCHORED_LINE",ordinal:i+1});continue;}
   anchor=m[1];body=m[2];
  }else{anchor="p"+String(i+1).padStart(5,"0");body=line;}
  if(anchors.has(anchor)){bad.push({type:"DUPLICATE_ANCHOR",anchor});continue;}
  anchors.add(anchor);
  const warnings=[];
  if(body.includes("\uFFFD"))warnings.push("OCR_REPLACEMENT_CHARACTER");
  if(body.includes("\u00AD"))warnings.push("OCR_SOFT_HYPHEN");
  if(/\b[A-Za-z]{2,}-\s+[a-z]{2,}\b/.test(body))warnings.push("OCR_BROKEN_LINE_HYPHEN");
  if(/(?:\[\?\]|\(\?\)|<script\b)/i.test(body))warnings.push("SUSPICIOUS_TRANSCRIPTION_MARKER");
  if(!hasAnchors)warnings.push("ORDINAL_ANCHOR_UNSTABLE_IF_SOURCE_CHANGES");
  if(body.trim().split(/\s+/).length<3)warnings.push("VERY_SHORT_PARAGRAPH_REVIEW");
  blocks.push({anchor,ordinal:i+1,text:body.replace(/\s+/g," ").trim(),warnings});
 }
 return {blocks,exceptions:bad};
}
export function stageBulkWork({work,chapters,mode="INDEX_ONLY",review}={}){
 if(!/^WORK-[A-Z0-9]+(?:-[A-Z0-9]+)*$/.test(work?.id??"")||
    !nonblank(work.title)||!nonblank(work.editionId)||!nonblank(work.witnessId)||
    !nonblank(work.language)||!Array.isArray(chapters)||!chapters.length)
   throw new Error("BULK_WORK_IDENTITY_OR_CHAPTERS_INVALID");
 if(!["INDEX_ONLY","LOCAL_REVIEW"].includes(mode))throw new Error("BULK_MODE_INVALID");
 // LOCAL_REVIEW may return transient source text for an authorized human editor,
 // never a runtime bundle. It is forbidden for unreviewed reproduction rights.
 if(mode==="LOCAL_REVIEW" &&
    !(work.rights?.scope==="COMPLETE_WORK"&&
      work.rights.status==="REPRODUCTION_CLEARED"&&
      nonblank(work.rights.reviewId)&&review?.rightsReviewId===work.rights.reviewId))
   throw new Error("BULK_REPRODUCTION_NOT_CLEARED");
 const expected=review?.expectedChapterIds;
 if(!Array.isArray(expected)||!expected.length||new Set(expected).size!==expected.length||
    expected.some(id=>!ID.test(id)))
  throw new Error("BULK_EXPECTED_CHAPTER_MANIFEST_REQUIRED");
 const chapterIds=new Set(),rows=[],exceptions=[];
 let totalWords=0,qualityA=0,qualityB=0,qualityC=0;
 const observed=[];
 for(const ch of chapters){
  if(!ID.test(ch?.id??"")||chapterIds.has(ch.id)||
     typeof ch.text!=="string"||!ch.text.trim()||
     !nonblank(ch.title)||!nonblank(ch.sourceUrl)||!ch.sourceUrl.startsWith("https://"))
   throw new Error("BULK_CHAPTER_IDENTITY_INVALID");
  chapterIds.add(ch.id);observed.push(ch.id);
  const parsed=parseChapter(ch);
  exceptions.push(...parsed.exceptions.map(e=>({chapterId:ch.id,...e})));
  for(const b of parsed.blocks){
   const alreadyReviewed=review?.verifiedPassages?.includes(ch.id+":"+b.anchor)===true;
   let grade=b.warnings.some(w=>w.startsWith("OCR_")||w==="SUSPICIOUS_TRANSCRIPTION_MARKER")?"C":
     alreadyReviewed?"A":"B";
   // A can never be awarded without an edition-specific human review record.
   if(grade==="A"&&!(nonblank(review?.collationReviewId)&&
       review?.editionId===work.editionId&&review?.witnessId===work.witnessId))
    grade="B";
   if(grade==="A")qualityA++;else if(grade==="B")qualityB++;else qualityC++;
   const textWords=(b.text.match(WORD)||[]).length;
   totalWords+=textWords;
   const id=work.id+"@"+work.editionId+"/"+ch.id+"/"+b.anchor;
   const row={id,workId:work.id,editionId:work.editionId,witnessId:work.witnessId,
    chapterId:ch.id,chapterTitle:ch.title,sourceUrl:ch.sourceUrl,
    locator:ch.id+":"+b.anchor,grade,wordCount:textWords,
    checksum:fingerprint(b.text),warnings:b.warnings,
    quoteEligible:grade==="A"&&mode==="LOCAL_REVIEW",
    publicReleaseApproved:false,
    ...(mode==="LOCAL_REVIEW"?{text:b.text}:{})};
   rows.push(row);
   for(const warning of b.warnings)
    exceptions.push({chapterId:ch.id,anchor:b.anchor,type:warning});
  }
 }
 const missing=expected.filter(id=>!chapterIds.has(id));
 const extra=observed.filter(id=>!expected.includes(id));
 for(const id of missing)exceptions.push({chapterId:id,type:"MISSING_EXPECTED_CHAPTER"});
 for(const id of extra)exceptions.push({chapterId:id,type:"UNEXPECTED_CHAPTER"});
 const exactCoverage=missing.length===0&&extra.length===0&&
  expected.length===observed.length&&expected.every((x,i)=>observed[i]===x);
 if(!exactCoverage)exceptions.push({type:"CHAPTER_SEQUENCE_OR_COMPLETENESS_NOT_CONFIRMED"});
 // Metadata never provides excerpts; navigational grades are not quotation licences.
 return {schema:"AO_BULK_SOURCE_STAGE_V1",
  work:{id:work.id,title:work.title,editionId:work.editionId,witnessId:work.witnessId,language:work.language},
  mode,coverage:{expectedChapterCount:expected.length,observedChapterCount:chapters.length,
   completeStructuralCoverage:exactCoverage,missingChapterIds:missing,unexpectedChapterIds:extra},
  metrics:{passages:rows.length,words:totalWords,gradeA:qualityA,gradeB:qualityB,gradeC:qualityC,
   exceptions:exceptions.length},
  passages:rows,exceptionQueue:exceptions,
  productionPublished:false,humanReviewRequired:qualityB+qualityC>0||
   !exactCoverage,
  sourceContentStored:mode==="LOCAL_REVIEW",
  corpusProvenance:"EDITION_SPECIFIC_STAGED_INPUT_NOT_INDEPENDENTLY_PROOFREAD_BY_PARSER"};
}
export function summarizeBulkStages(stages){
 if(!Array.isArray(stages)||!stages.length)throw new Error("BULK_STAGES_REQUIRED");
 const ids=new Set(),out={workCount:0,structurallyCompleteWorks:0,chapters:0,
  passages:0,words:0,gradeA:0,gradeB:0,gradeC:0,exceptionCount:0,productionPublished:0};
 for(const s of stages){
  const key=s.work?.id+"@"+s.work?.editionId+"/"+s.work?.witnessId;
  if(ids.has(key))throw new Error("BULK_DUPLICATE_EDITION_WITNESS");
  ids.add(key);out.workCount++;
  if(s.coverage.completeStructuralCoverage)out.structurallyCompleteWorks++;
  out.chapters+=s.coverage.observedChapterCount;
  out.passages+=s.metrics.passages;out.words+=s.metrics.words;
  for(const k of ["gradeA","gradeB","gradeC"])out[k]+=s.metrics[k];
  out.exceptionCount+=s.metrics.exceptions;
  if(s.productionPublished)throw new Error("BULK_UNEXPECTED_PRODUCTION_PUBLICATION");
 }
 return out;
}
