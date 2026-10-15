// Offline, whole-work batch ingestion. Run:
// node scripts/source-text-bulk-ingest.mjs data/source-text/bulk-jobs.v1.json
// Add --out path/to/staged-report.json to write a metadata-only report.
// Never fetch or silently publish third-party text.
import {readFileSync,writeFileSync} from "node:fs";
import {resolve,relative,dirname} from "node:path";
import {stageBulkWork,summarizeBulkStages} from "../src/source-text/bulk-import.js";
import {extractBrotherLawrence13871} from "../src/source-text/gutenberg-13871.js";
import {extractHistoricalClassic} from "../src/source-text/gutenberg-classics.js";
const root=resolve(import.meta.dirname,"..");
const safePath=path=>{
 if(typeof path!=="string"||!path||path.startsWith("/")||path.includes("\\"))
  throw new Error("BULK_LOCAL_PATH_REQUIRED");
 const file=resolve(root,path),rel=relative(root,file);
 if(rel.startsWith("..")||rel.startsWith("/")||rel==="")
  throw new Error("BULK_PATH_OUTSIDE_REPOSITORY");
 return file;
};
export function executeBulkJobs(jobManifest){
 if(jobManifest?.schema!=="AO_SOURCE_TEXT_BULK_JOB_MANIFEST_V1"||
   !Array.isArray(jobManifest.jobs)||!jobManifest.jobs.length)
  throw new Error("BULK_JOB_MANIFEST_INVALID");
 const stages=[],ids=new Set();
 for(const job of jobManifest.jobs){
  if(typeof job.jobId!=="string"||ids.has(job.jobId)||job.mode!=="INDEX_ONLY")
   throw new Error("BULK_JOB_ID_OR_MODE_INVALID");
  ids.add(job.jobId);
  let chapters;
  if(job.sourceKind==="GUTENBERG_13871"){
   const source=readFileSync(safePath(job.sourceFile),"utf8");
   const book=extractBrotherLawrence13871(source);
   if(book.edition.workId!==job.work?.id||
      book.edition.editionId!==job.work.editionId||
      book.edition.witnessId!==job.work.witnessId||
      book.edition.upstreamGitCommit!==job.upstreamGitCommit)
    throw new Error("BULK_JOB_ELECTRONIC_EDITION_MISMATCH");
   chapters=book.chapters;
  }else if(job.sourceKind==="GUTENBERG_CLASSIC"){
   const source=readFileSync(safePath(job.sourceFile),"utf8");
   const book=extractHistoricalClassic(job.classicKind,source);
   if(book.edition.workId!==job.work?.id||
      book.edition.editionId!==job.work.editionId||
      book.edition.witnessId!==job.work.witnessId||
      book.edition.upstreamCommit!==job.upstreamGitCommit)
    throw new Error("BULK_JOB_CLASSIC_EDITION_MISMATCH");
   chapters=book.chapters;
  }else if(job.sourceKind==="LOCAL_CHAPTER_FILES"){
   if(!Array.isArray(job.documents)||!job.documents.length)
    throw new Error("BULK_JOB_CHAPTER_FILES_MISSING");
   chapters=job.documents.map(d=>({
     id:d.id,title:d.title,format:d.format,sourceUrl:d.sourceUrl,
     text:readFileSync(safePath(d.path),"utf8")
   }));
  }else throw new Error("BULK_JOB_SOURCE_FORMAT_UNSUPPORTED");
  const stage=stageBulkWork({work:job.work,chapters,mode:"INDEX_ONLY",
   review:{expectedChapterIds:job.expectedChapterIds}});
  if(job.expectedParagraphs!==undefined&&stage.metrics.passages!==job.expectedParagraphs)
   throw new Error("BULK_JOB_PARAGRAPH_COUNT_CHANGED");
  stages.push(stage);
 }
 const totals=summarizeBulkStages(stages);
 return {schema:"AO_SOURCE_TEXT_BULK_JOB_REPORT_V1",
  jobs:stages.map((s,i)=>({
   jobId:jobManifest.jobs[i].jobId,
   work:s.work,coverage:s.coverage,metrics:s.metrics,
   exceptionQueue:s.exceptionQueue,
   citationPolicy:s.locatorPolicy,publicationApproved:false
  })),totals,productionPublished:false,rawUnreviewedSourceTextExported:false};
}
const running=process.argv[1]&&resolve(process.argv[1])===resolve(import.meta.filename);
if(running){
 const args=process.argv.slice(2);
 if(args.length!==1&&args.length!==3)throw Error("Usage: node scripts/source-text-bulk-ingest.mjs manifest.json [--out stagedReport.json]");
 if(args.length===3&&args[1]!=="--out")throw Error("BULK_CLI_ARGS_INVALID");
 const report=executeBulkJobs(JSON.parse(readFileSync(safePath(args[0]),"utf8")));
 if(args.length===3){
  const output=safePath(args[2]);
  if(!relative(resolve(root,"data/source-text/staging"),output).startsWith(".."))
   writeFileSync(output,JSON.stringify(report,null,2)+"\n","utf8");
  else throw Error("BULK_OUTPUT_MUST_BE_UNDER_STAGING");
 }
 process.stdout.write(JSON.stringify({schema:report.schema,totals:report.totals,
  jobs:report.jobs.map(x=>({jobId:x.jobId,chapters:x.coverage.observedChapterCount,
   paragraphs:x.metrics.passages,exceptions:x.metrics.exceptions})),
  rawUnreviewedSourceTextExported:false,productionPublished:false})+"\n");
}
