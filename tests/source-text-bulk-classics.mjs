import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {extractHistoricalClassic,expectedClassicIds,CLASSIC_WITNESSES} from "../src/source-text/gutenberg-classics.js";
import {stageBulkWork,summarizeBulkStages} from "../src/source-text/bulk-import.js";
const files={imitation:"data/source-text/staging/imitation-benham-pg1653-full.txt",
 sales:"data/source-text/staging/francis-sales-vie-devote-pg53540-full.txt"};
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const stages=[],counts={};
for(const [kind,path] of Object.entries(files)){
 const original=load(path),{chapters,edition}=extractHistoricalClassic(kind,original);
 const expected=expectedClassicIds(kind);
 assert.deepEqual(chapters.map(x=>x.id),expected);
 assert.equal(chapters.length,kind==="imitation"?119:127);
 assert.equal(edition.sourceNoticeRetainedInStaging,true);
 assert.equal(edition.fullPrintedEditionCertified,false);
 const work={id:edition.workId,title:edition.name,editionId:edition.editionId,witnessId:edition.witnessId,
  language:edition.language,rights:{status:"UNREVIEWED",scope:"COMPLETE_WORK"}};
 const stage=stageBulkWork({work,chapters,review:{expectedChapterIds:expected}});
 assert.equal(stage.coverage.completeStructuralCoverage,true);
 assert.equal(stage.metrics.gradeA,0);
 assert.ok(stage.metrics.gradeB>200);
 assert.equal(stage.metrics.gradeC,0);
 assert.equal(stage.metrics.gradeB,stage.metrics.passages);
 assert.equal(stage.metrics.passages>250,true);
 assert.ok(stage.metrics.words>10000);
 assert.equal(stage.productionPublished,false);
 assert.equal(stage.sourceContentStored,false);
 assert.ok(stage.passages.every(x=>!Object.hasOwn(x,"text")&&!x.quoteEligible&&!x.publicReleaseApproved));
 assert.throws(()=>stageBulkWork({work,chapters,mode:"LOCAL_REVIEW",review:{expectedChapterIds:expected}}),/REPRODUCTION_NOT_CLEARED/);
 stages.push(stage);
 counts[kind]={chapters:chapters.length,paragraphs:stage.metrics.passages,words:stage.metrics.words,
  exceptions:stage.metrics.exceptions,gradeB:stage.metrics.gradeB,gradeC:stage.metrics.gradeC};
}
assert.equal(CLASSIC_WITNESSES.imitation.translator,"Rev. William Benham");
assert.equal(CLASSIC_WITNESSES.sales.language,"fr");
assert.equal(CLASSIC_WITNESSES.sales.workId,"WORK-FRANCIS-SALES-DEVOUT-LIFE");
const rosary=extractHistoricalClassic("sales",load(files.sales)).chapters.find(c=>c.id==="appendix-rosary");
assert.ok(rosary.text.includes("mystères du rosaire"));
assert.ok(rosary.text.includes("chapelet"));
const prayer=extractHistoricalClassic("sales",load(files.sales)).chapters.find(c=>c.id==="appendix-feast-prayer");
assert.ok(prayer.text.includes("saint François"));
assert.ok(!prayer.text.includes("TABLE DES CHAPITRES"));
const tampered=load(files.imitation).replace("THE THIRD BOOK","THE SIXTH BOOK");
assert.throws(()=>extractHistoricalClassic("imitation",tampered),/EXPECTED_CHAPTER_COVERAGE_MISMATCH|FULL_WORK_SEQUENCE_INVALID|NUMERAL_ORDER/);
const tamperedFr=load(files.sales).replace("CHAPITRE PREMIER.","CHAPITRE IX.");
assert.throws(()=>extractHistoricalClassic("sales",tamperedFr),/NUMERAL_ORDER/);
const summary=summarizeBulkStages(stages);
assert.equal(summary.workCount,2);
assert.equal(summary.structurallyCompleteWorks,2);
assert.equal(summary.chapters,246);
console.log("PASS two entire historical Catholic classics ingested from pinned witnesses: 114 Imitation chapters + 119 French Devout Life chapters, rosary appendices kept");
console.log(JSON.stringify({books:counts,totals:summary,exactHistoricalQuotesApproved:0,
 productionPublished:false}));
