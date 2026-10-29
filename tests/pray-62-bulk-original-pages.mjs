import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NOVENA_CORPUS_V3} from '../src/pray/novena-corpus.js';
import {NOVENA_CORPUS_V4} from '../src/pray/novena-corpus-v4.js';
import {HOLY_SOULS_PRINT_ALIGNED_V1,HOLY_SOULS_PRINT_ALIGNED_DAY_IDS} from '../src/pray/novena-holy-souls-print-corrections.v1.js';

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),'utf8'));
const scan=load('../data/pray/original-print-62-bulk-review-20261029.v1.json');
const old=load('../data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json');
const locators=load('../data/pray/original-print-witness-locators-20261029.v1.json');
assert.equal(scan.schema,'ao.pray.original-print-62-bulk-review.v1');
assert.equal(scan.records.length,62);
assert.equal(scan.counts.books,4);
assert.equal(scan.counts.dayPrayers,62);
assert.equal(scan.counts.uniqueOriginalPageImages,69);
assert.equal(scan.counts.veryHighPreCorrection,39);
assert.equal(scan.counts.highPreCorrection,23);
assert.equal(scan.counts.veryHighPostCorrection,40);
assert.equal(scan.counts.highPostCorrection,22);
assert.match(scan.postCorrectionRun,/40881455788/);
assert.match(scan.postCorrectionReviewArtifact,/12900457415/);
assert.equal(scan.counts.completeHistoricalPrintEditionCertificates,0);
assert.equal(scan.counts.fullyVisualLineCollatedProperPrayersCertified,0);
assert.equal(scan.counts.newHistoricallyVerifiedBodyCorrections,2);
assert.equal(scan.counts.contemporaryIndulgenceCertificates,0);
assert.equal(scan.verifiedFindings.length,3);
const expected=old.records.filter(r=>r.match==='HIGH_TEXT_LAYER_OVERLAP');
assert.equal(expected.length,62);
const byID=new Map(expected.map(x=>[x.id+':'+x.day,x]));
const seen=new Set(),pageImages=new Set();
let veryHigh=0;
for(const r of scan.records){
 const key=r.id+':'+r.day;
 assert.ok(!seen.has(key),'Duplicate historical original day '+key);
 seen.add(key);
 const earlier=byID.get(key);
 assert.ok(earlier,'Source missing from prior 72-target cohort '+key);
 assert.equal(r.sourceCohort,earlier.cohort);
 assert.equal(r.pdfPageStart,earlier.pdfPageStart);
 assert.equal(r.pdfPageEnd,earlier.pdfPageEnd);
 assert.ok(r.preCorrectionOverlapBasisPoints>=8000&&r.preCorrectionOverlapBasisPoints<=10000);
 assert.ok(r.preCorrectionUnmatchedAppWords>=0);
 assert.equal(r.pageImagesRendered,true);
 assert.equal(r.fullVisualLineCollationCompleted,false);
 assert.equal(r.completePrintEditionCertified,false);
 const body=NOVENA_CORPUS_V4[r.id].days[r.day-1].text.en;
 assert.ok(body.length>30);
 if(r.preCorrectionOverlapBasisPoints>=9500)veryHigh++;
 for(let p=r.pdfPageStart;p<=r.pdfPageEnd;p++)pageImages.add(r.sourceCohort+':'+p);
}
assert.equal(veryHigh,39);
assert.equal(pageImages.size,69);
assert.equal(seen.size,62);
let changedScores=0;
for(const row of scan.records){
 const key=row.id+':'+row.day;
 if(row.postCorrectionOverlapBasisPoints!==row.preCorrectionOverlapBasisPoints){
  changedScores++;
  assert.ok(key==='holy_souls:5'||key==='holy_souls:8');
 }else assert.equal(row.postCorrectionUnmatchedAppWords,row.preCorrectionUnmatchedAppWords);
}
assert.equal(changedScores,2);
const d5=scan.records.find(x=>x.id==='holy_souls'&&x.day===5);
const d8=scan.records.find(x=>x.id==='holy_souls'&&x.day===8);
assert.equal(d5.postCorrectionOverlapBasisPoints,9535);
assert.equal(d8.postCorrectionOverlapBasisPoints,9184);
assert.equal(d5.postCorrectionUnmatchedAppWords,7);
assert.equal(d8.postCorrectionUnmatchedAppWords,14);

for(const row of locators.days.filter(r=>r.id==='christmas'))assert.equal(row.sectionStartPrintedPage,292);
assert.match(locators.cohorts.callan_1925_copyright_later_scan.boundaries,/Christmas p292/);
assert.deepEqual([...HOLY_SOULS_PRINT_ALIGNED_DAY_IDS].sort((a,b)=>a-b),[1,2,4,5,6,8,9]);
assert.match(HOLY_SOULS_PRINT_ALIGNED_V1[5].en,/O infinite Good.*I wish rather to die than ever offend Thee again/);
assert.doesNotMatch(HOLY_SOULS_PRINT_ALIGNED_V1[5].en,/having ever offended Thee again/);
assert.match(HOLY_SOULS_PRINT_ALIGNED_V1[8].en,/I wish rather to die than ever again offend Thee/);
assert.match(HOLY_SOULS_PRINT_ALIGNED_V1[5].fr,/Je désire mourir/);
assert.match(HOLY_SOULS_PRINT_ALIGNED_V1[8].fr,/Je désire mourir/);
let changed=0;
for(const [id,n] of Object.entries(NOVENA_CORPUS_V3)){
 for(let i=0;i<n.days.length;i++){
  const current=NOVENA_CORPUS_V4[id].days[i].text?.en||'';
  const was=n.days[i].text||'';
  if(current!==was){
   assert.equal(id,'holy_souls','Unapproved mutation to a historical English prayer');
   assert.equal(current,HOLY_SOULS_PRINT_ALIGNED_V1[i+1].en);
   changed++;
  }
 }
}
assert.equal(changed,7,'Five earlier and two new print-only corrections');
console.log('PASS 62 historical novena visual-source page windows, 69 unique source images, Christmas p292 and seven solely authorized Holy Souls English corrections. NO unverified full-page certification.');
