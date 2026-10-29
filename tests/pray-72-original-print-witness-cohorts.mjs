import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_CORPUS_V4} from "../src/pray/novena-corpus-v4.js";
import {NOVENA_CORPUS_V3} from "../src/pray/novena-corpus.js";
const json=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const register=json("../data/pray/original-print-witness-locators-20261029.v1.json");
const old=json("../data/pray/novena-source-review.v3.json");
assert.equal(register.schema,"ao.pray.original-print-witness-locators.v1");
assert.equal(register.population.programmes,8);
assert.equal(register.population.dayBodies,72);
assert.equal(register.population.scanCohorts,4);
assert.equal(register.population.bookLocationIdentified,72);
assert.equal(register.population.daySpecificOriginalScanPageAnchors,9);
assert.equal(register.population.fullPrintCollationCertificates,0);
assert.equal(Object.keys(register.cohorts).length,4);
assert.equal(register.days.length,72);
assert.equal(new Set(register.days.map(r=>r.id+":"+r.day)).size,72);
const scanned=register.days.filter(x=>x.scanPdfPageIndexStart!==null);
assert.equal(scanned.length,9);
assert.ok(scanned.every(x=>x.id==="holy_souls"));
const expectedHolies=[[199,200,198,199],[202,203,201,202],[203,204,202,203],[204,205,203,204],[205,206,204,205],[206,207,205,206],[207,207,206,206],[208,209,207,208],[209,210,208,209]];
assert.deepEqual(scanned.map(x=>[x.printedDayPageStart,x.printedDayPageEnd,x.scanPdfPageIndexStart,x.scanPdfPageIndexEnd]),expectedHolies);
assert.match(register.cohorts.purgatorian_manual_1894_1907.boundaries,/199.*210/);
assert.match(register.cohorts.purgatorian_manual_1894_1907.scanEdition,/1907_IMPRIMATUR/);
assert.match(register.cohorts.callan_1925_copyright_later_scan.scanEdition,/POST_1933_MATERIAL/);
assert.match(register.cohorts.callan_1925_copyright_later_scan.boundaries,/April 22, 1933/);
assert.deepEqual(register.days.filter(x=>x.id==="christmas").map(x=>x.sectionStartPrintedPage),Array(9).fill(268));
assert.deepEqual(register.days.filter(x=>x.id==="holy_ghost").map(x=>x.sectionStartPrintedPage),Array(9).fill(296));
assert.ok(register.days.every(x=>x.fullyPrintCollated===false&&x.facsimileImageCompared===false&&x.frenchOriginalEditionCertified===false));
const counts={};for(const x of register.days){
 counts[x.sourceCohort]=(counts[x.sourceCohort]||0)+1;
 const parent=NOVENA_CORPUS_V3[x.id];
 const prior=old.records.find(v=>v.id===x.id);
 assert.ok(parent&&prior&&parent.form==="DAY_SPECIFIC");
 const source=prior.dayBodySourceReview[x.day-1];
 assert.equal(source.day,x.day);
 assert.equal(x.publishedEnglishIncipit,source.sourceIncipit);
 assert.equal(x.publishedEnglishExplicit,source.sourceExplicit);
 assert.equal(x.sourceDigitalUrl,source.url||source.sourceUrl||prior.url);
 const en=parent.days[x.day-1].text;
 assert.ok(en.startsWith(x.publishedEnglishIncipit));
 assert.ok(en.endsWith(x.publishedEnglishExplicit));
 assert.ok(register.cohorts[x.sourceCohort].scan.startsWith("https://"));
}
assert.deepEqual(counts,{
callan_1925_copyright_later_scan:18,
moran_1883:18,
hammer_1909:27,
purgatorian_manual_1894_1907:9});
const soul=NOVENA_CORPUS_V4.holy_souls;
assert.match(soul.source.status,/MODERN_DIGITAL_TRANSCRIPTION.*PRINT_EDITION_NOT_COLLATED/);
assert.match(soul.source.edition,/1894.*1907.*199.*210/);
assert.match(soul.source.url,/Manual_of_the_Purgatorian_Society_OCR_CK.pdf/);
assert.ok(soul.historySources.some(x=>x.url===soul.source.url));
for(const id of ["christmas","holy_ghost"]){
 const p=NOVENA_CORPUS_V4[id];
 assert.match(p.source.status,/1925_ORIGINAL_COPYRIGHT.*SCAN_POST_1933_CONTENT/);
 assert.match(p.source.adaptation,/not certified as a 1925 first impression/);
}
assert.equal(old.counts.fullOriginalPrintCertificates,0);
console.log("PASS Novena original-print cohort gate: 4 located books, all 72 day texts assigned, 9 Holy Souls day page anchors, 1894/1907 source and post-1933 Callan caveat; zero image-collation certificates.");
