import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {NOVENA_CORPUS_V4} from '../src/pray/novena-corpus-v4.js';
const register=JSON.parse(readFileSync(new URL('../data/pray/original-print-witness-locators-20261029.v1.json',import.meta.url)));
const result=JSON.parse(readFileSync(new URL('../data/pray/original-pdf-72-day-text-layer-screen-20261029.v1.json',import.meta.url)));
assert.equal(result.schema,'ao.pray.original-pdf-72-text-layer-scan.v1');
assert.equal(result.records.length,72);
assert.equal(result.books.length,4);
assert.equal(new Set(result.books.map(x=>x.id)).size,4);
assert.equal(result.totals.dayBodies,72);
assert.equal(result.totals.highTextLayerOverlap,62);
assert.equal(result.totals.partialTextLayerOverlap,10);
assert.equal(result.totals.unmatched,0);
assert.equal(result.totals.completePrintedFacsimileCertificates,0);
assert.equal(result.partialExceptionDays.length,10);
const prior=new Map(register.days.map(x=>[x.id+':'+x.day,x]));
const seen=new Set();
const tally={};
for(const b of result.books){
 assert.ok(/^https:\/\//.test(b.url));
 assert.match(b.sha256,/^[a-f0-9]{64}$/);
 assert.ok(b.bytes>100000);
 assert.ok(b.nonemptyTextPages<=b.pageCount);
 assert.ok(b.caveat.length>20);
}
for(const r of result.records){
 const key=r.id+':'+r.day;
 assert.ok(!seen.has(key),'duplicate scanned prayer '+key);
 seen.add(key);
 assert.ok(prior.has(key),'not a registered historical novena day: '+key);
 assert.equal(r.cohort,prior.get(key).sourceCohort);
 assert.ok(NOVENA_CORPUS_V4[r.id].days[r.day-1].text,'live novena target missing '+key);
 assert.ok(Number.isInteger(r.pdfPageStart)&&Number.isInteger(r.pdfPageEnd));
 assert.ok(r.pdfPageEnd>=r.pdfPageStart);
 const book=result.books.find(b=>b.id===r.cohort);
 assert.ok(book);
 assert.ok(r.pdfPageEnd<book.pageCount);
 assert.ok(Number.isInteger(r.overlapBasisPoints)&&r.overlapBasisPoints>=5000&&r.overlapBasisPoints<=10000);
 assert.equal(r.match,r.overlapBasisPoints>=8000?'HIGH_TEXT_LAYER_OVERLAP':'PARTIAL_TEXT_LAYER_OVERLAP');
 assert.equal(r.scanPageImageFullyCollated,false);
 assert.equal(r.printEditionCertified,false);
 tally[r.id]=(tally[r.id]||0)+1;
}
assert.equal(seen.size,72);
assert.ok(Object.keys(tally).length===8&&Object.values(tally).every(x=>x===9));
assert.deepEqual(result.partialExceptionDays.map(x=>x.id+':'+x.day).sort(),
 ['annunciation:1','annunciation:3','annunciation:4','annunciation:6',
 'seven_sorrows:3','holy_souls:1','holy_souls:2','holy_souls:4','holy_souls:6','holy_souls:9'].sort());
assert.ok(result.visuallyInspectedSamplePages.some(x=>x.cohort==='moran_1883'&&x.printedPage===566));
assert.ok(result.exceptions.some(x=>/post-1933/i.test(x)));
console.log('PASS original print scan: 4 acquired PDF SHA-256 sources; 72/72 page window candidates; 62 high + 10 partial text-layer matches; 0 facsimile certifications.');
