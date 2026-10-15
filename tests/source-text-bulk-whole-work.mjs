import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {stageBulkWork,summarizeBulkStages} from "../src/source-text/bulk-import.js";
import {extractBrotherLawrence13871,BROTHER_LAWRENCE_CHAPTERS} from "../src/source-text/gutenberg-13871.js";
const src=readFileSync(new URL("../data/source-text/staging/brother-lawrence-pg13871-full.txt",import.meta.url),"utf8");
const {chapters,edition}=extractBrotherLawrence13871(src);
const work={id:edition.workId,title:"The Practice of the Presence of God: The Best Rule of a Holy Life",
 editionId:edition.editionId,witnessId:edition.witnessId,language:"en",
 rights:{status:"UNREVIEWED",scope:"COMPLETE_WORK",reviewId:null}};
assert.equal(chapters.length,22);
assert.deepEqual(chapters.map(x=>x.id),BROTHER_LAWRENCE_CHAPTERS);
assert.ok(src.length>70000&&src.includes("*** END: FULL LICENSE ***"));
assert.equal(edition.releaseNoticeRetainedInStagedFile,true);
assert.equal(edition.upstreamGitCommit,"a2c7fd571d9abbd9f35fa6e40eef2590630505a0");
const review={expectedChapterIds:BROTHER_LAWRENCE_CHAPTERS};
const staged=stageBulkWork({work,chapters,review});
assert.equal(staged.mode,"INDEX_ONLY");
assert.equal(staged.coverage.completeStructuralCoverage,true);
assert.equal(staged.coverage.observedChapterCount,22);
assert.equal(staged.coverage.missingChapterIds.length,0);
assert.ok(staged.metrics.passages>75);
assert.ok(staged.metrics.words>9000);
assert.equal(staged.metrics.gradeA,0);
assert.equal(staged.metrics.gradeB+staged.metrics.gradeC,staged.metrics.passages);
assert.ok(staged.passages.every(x=>!Object.hasOwn(x,"text")&&x.publicReleaseApproved===false));
assert.ok(staged.passages.some(x=>x.chapterId==="conversation-01"));
assert.ok(staged.passages.some(x=>x.chapterId==="letter-15"));
assert.ok(staged.passages.some(x=>x.chapterId==="notes"));
assert.equal(staged.productionPublished,false);
const summary=summarizeBulkStages([staged]);
assert.equal(summary.workCount,1);
assert.equal(summary.structurallyCompleteWorks,1);
assert.equal(summary.chapters,22);
assert.equal(summary.passages,staged.metrics.passages);
assert.throws(()=>stageBulkWork({work,chapters,review,mode:"LOCAL_REVIEW"}),/REPRODUCTION_NOT_CLEARED/);
assert.throws(()=>stageBulkWork({work,chapters,review:{expectedChapterIds:[]}}),/EXPECTED_CHAPTER_MANIFEST_REQUIRED/);
assert.equal(stageBulkWork({work,chapters:chapters.slice(0,21),review}).coverage.completeStructuralCoverage,false);
const extra=structuredClone(chapters);extra.push({...chapters.at(-1),id:"extra"});
assert.equal(stageBulkWork({work,chapters:extra,review}).coverage.completeStructuralCoverage,false);
const swapped=structuredClone(chapters);[swapped[1],swapped[2]]=[swapped[2],swapped[1]];
assert.equal(stageBulkWork({work,chapters:swapped,review}).coverage.completeStructuralCoverage,false);
const tampered=structuredClone(chapters);tampered[1].text+="\n\nA very broken O\uFFFDCR sentence here.";
const bad=stageBulkWork({work,chapters:tampered,review});
assert.ok(bad.metrics.gradeC>=1);
assert.ok(bad.exceptionQueue.some(x=>x.type==="OCR_REPLACEMENT_CHARACTER"));
const withDup=structuredClone(chapters);withDup[1].id=withDup[0].id;
assert.throws(()=>stageBulkWork({work,chapters:withDup,review}),/CHAPTER_IDENTITY_INVALID/);
const syntheticChapters=Array.from({length:20},(_,i)=>({
 id:"synthetic-"+String(i+1).padStart(2,"0"),title:"Synthetic unit "+(i+1),
 sourceUrl:"https://example.org/project-authored-fixture/"+i,format:"ANCHORED_PARAGRAPHS",
 text:Array.from({length:100},(_,j)=>"["+String(j+1).padStart(4,"0")+"] Synthetic author-authored testing paragraph. No genuine historical source text, unit "+i+" passage "+j+".").join("\n")
}));
const synthetics=stageBulkWork({work:{...work,id:"WORK-BULK-SYNTHETIC"},chapters:syntheticChapters,
 review:{expectedChapterIds:syntheticChapters.map(x=>x.id)}});
assert.equal(synthetics.metrics.passages,2000);
assert.equal(synthetics.metrics.gradeC,0);
assert.equal(synthetics.metrics.gradeB,2000);
assert.equal(synthetics.coverage.completeStructuralCoverage,true);
const totals=summarizeBulkStages([staged,synthetics]);
assert.equal(totals.workCount,2);
assert.equal(totals.chapters,42);
assert.equal(totals.passages,staged.metrics.passages+2000);
console.log("PASS whole-work bulk pilot: real pinned Brother Lawrence text, 22 complete sections parsed, metadata-only stage; 2,000 synthetic paragraphs stress-tested");
console.log(JSON.stringify({realElectronicWorksStaged:1,realChapters:22,
 realParagraphs:staged.metrics.passages,realWords:staged.metrics.words,
 gradeA:staged.metrics.gradeA,gradeB:staged.metrics.gradeB,gradeC:staged.metrics.gradeC,
 exceptions:staged.metrics.exceptions,
 syntheticTestParagraphs:2000,productionPublished:false}));
