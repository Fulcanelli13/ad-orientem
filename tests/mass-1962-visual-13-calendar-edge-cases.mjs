import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/geography/research/",import.meta.url);
const read=n=>JSON.parse(readFileSync(new URL(n+".v1.json",root),"utf8"));
const d=read("mass-1962-visual-13-calendar-edge-case-adjudications-20261012");
const c=read("mass-1962-44-cluster-calendar-heading-reconciliation-20261012");
const q=new Set(c.rows.map(x=>x.sourcePath));
assert.equal(d.schema,"MASS_1962_VISUAL_ADJUDICATION_CALENDAR_EDGE_CASES_V1");
assert.equal(d.decisions.length,13);
assert.equal(new Set(d.decisions.map(x=>x.sourcePath)).size,13);
assert.equal(d.stats.reviewedSourcePaths,13);
assert.equal(d.stats.reviewedPdfPageCount,14);
assert.equal(d.visuallyReviewedPdfPages.length,14);
assert.equal(new Set(d.visuallyReviewedPdfPages).size,14);
assert.ok(d.visuallyReviewedPdfPages.every(x=>Number.isInteger(x)&&x>0&&x<=1088));
assert.equal(d.sourcePdfSHA256,"648fdb8fe830ed65a08aa4a95de6f94424c533ddf2398c8fc26b18735fd3518a");
assert.ok(d.decisions.every(x=>q.has(x.sourcePath)));
assert.ok(d.decisions.every(x=>x.renderedPageVisuallyRead));
assert.ok(d.decisions.every(x=>!x.bibleLatinTextEditionCollated&&!x.full1962CalendarUseCertified&&!x.approvedForApp));
assert.equal(d.stats.universal1962CelebrationCertifications,0);
assert.equal(d.stats.verseEditionCertifications,0);
assert.equal(d.stats.appApprovals,0);
assert.equal(d.releaseGate,"CLOSED");
for(const path of ["Sancti/01-20","Sancti/01-25","Sancti/01-31","Sancti/02-27","Sancti/03-24","Sancti/06-02","Sancti/08-16"]){
 assert.ok(d.decisions.some(x=>x.sourcePath===path),"Missing month-discordance resolution "+path);
}
assert.equal(d.decisions.find(x=>x.sourcePath==="Sancti/01-25").disposition,"EXPLICIT_SOURCE_PARENT_REUSE");
assert.equal(d.decisions.find(x=>x.sourcePath==="Sancti/01-31").disposition,"PAGE_BREAK_CARRYOVER_EXPLAINS_MONTH_HEADER");
assert.equal(d.decisions.find(x=>x.sourcePath==="Sancti/09-09n").disposition,"LOCAL_SUPPLEMENT_CALENDAR_GATE");
assert.equal(d.decisions.find(x=>x.sourcePath==="Sancti/10-DU").disposition,"RULE_BASED_LAST_SUNDAY_OCTOBER_CONTEXT");
assert.equal(d.decisions.find(x=>x.sourcePath==="Tempora/Pasc7-6t").disposition,"EXTENDED_EMBER_SOURCE_CROSS_SEASON_HOLD");
for(const row of d.decisions){
 assert.ok(row.printedPageEvidence.length>0);
 assert.ok(row.printedPageEvidence.every(p=>p.printedPage===p.pdfPage-81));
 assert.ok(row.printedPageEvidence.every(p=>d.visuallyReviewedPdfPages.includes(p.pdfPage)));
 assert.ok(row.printedPageEvidence.every(p=>p.scanUrl.endsWith("#page="+p.pdfPage)));
 assert.ok(row.observedEvidence&&row.remainingReview);
}
console.log("PASS: 13 source-critical visual adjudications, all 7 cross-month holds explained, local/supplement/Ember gates closed.");
