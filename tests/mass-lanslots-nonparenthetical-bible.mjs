// Source-critical acceptance for verse identifications outside Lanslots' printed citations.
// Run: node tests/mass-lanslots-nonparenthetical-bible.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
const load=path=>JSON.parse(readFileSync(new URL('../'+path,import.meta.url),'utf8'));
const buf=readFileSync(new URL('../data/research/archive/lanslots-1897-original-ocr.txt',import.meta.url));
const text=buf.toString('utf8');
const lines=text.split('\n');
const digest=createHash('sha256').update(buf).digest('hex');
const items=load('data/research/mass-lanslots-1897-nonparenthetical-bible-connections.v1.json');
const judgments=load('data/research/mass-lanslots-1897-seven-biblical-inference-limits.v1.json');
const map=load('data/research/mass-lanslots-1897-source-first39-map.v1.json');
const owners=new Set(map.rows.map(x=>x.sectionId));
const previous=[
 ...load('data/research/mass-lanslots-1897-ocr-scripture-batch01.v1.json').records,
 ...load('data/research/mass-lanslots-1897-ocr-scripture-batch02.v1.json').records,
 ...load('data/research/mass-lanslots-1897-fulltext-17-new-citations.v1.json').records,
 ...load('data/research/mass-lanslots-1897-fulltext-five-extra-parenthetical.v1.json').records
];
const oldSet=new Set(previous.map(x=>x.chapter+'|'+x.normalizedScriptureRef));
assert.equal(previous.length,91);
assert.equal(items.records.length,16);
assert.equal(items.inputCensus.priorRecordedCitationAndAllusionOccurrences,91);
assert.equal(items.inputCensus.notAddedToCitedReferenceOccurrenceCount,true);
assert.equal(judgments.records.length,7);
assert.equal(items.contextSourceOcrSha256,digest);
assert.equal(judgments.originalOcrSha256,digest);
assert.equal(new Set(items.records.map(x=>x.id)).size,16);
const currentSet=new Set();
for(const row of items.records){
 const from=row.rawOcrSourceWindow.fromLine;
 const to=row.rawOcrSourceWindow.toLine;
 assert(from<=row.rawOcrLineAnchor && row.rawOcrLineAnchor<=to,'bad original line range '+row.id);
 assert(to<=lines.length);
 const content=lines.slice(from-1,to).join(' ').replace(/\s+/g,' ');
 assert(content.includes(row.originalDirectExcerpt),'original source excerpt changed '+row.id);
 assert.equal(row.verseNumberAppearsIn1897Text,false,'do not attribute editorial verse to original author');
 assert.equal(row.inlineGuideCueId,null,'a contextual verse cannot silently receive a live cue');
 assert.equal(row.canPublish,false);
 assert.equal(row.originalScanPageImageVerified,false);
 assert(owners.has(row.sourceFirstResearchTopicOwner),'unknown Mass topical owner '+row.id);
 assert(row.scriptureReferenceUrl.startsWith('https://www.biblegateway.com/passage/'));
 const key=row.chapter+'|'+row.normalizedScriptureRef;
 assert(!oldSet.has(key),'already in original 91-record ledger '+key);
 assert(!currentSet.has(key),'duplicate editorial match '+key);
 currentSet.add(key);
}
const risks=new Set(judgments.records.map(x=>x.issueType));
assert.equal(risks.size,7);
for(const item of judgments.records){
 assert.equal(item.originalPageImageVerified,false);
 assert.equal(item.independentFrenchTheologicalApproval,false);
 assert.equal(item.liturgicalRubricChanged,false);
 assert.equal(item.published,false);
 assert(item.criticalEnglishAssessment.length>100);
 assert(item.substantiveFrenchResearchDraft.length>90);
 assert(owners.has(item.sourceFirstResearchOwner));
 assert(item.biblicalTextWitnesses.length);
 assert(item.biblicalTextWitnesses.every(x=>x.url.startsWith('https://')));
 assert(items.records.some(x=>x.chapter===item.originalChapter && item.biblicalTextWitnesses.some(v=>v.ref===x.normalizedScriptureRef)), 'critical case lacks original narrative mapping '+item.id);
}
const underOne=judgments.records.find(x=>x.issueType==='EMMAUS_SINGLE_SPECIES_INFERENCE');
assert(underOne.independentMagisterialSources.some(u=>u.includes('Session_XXI')));
assert(underOne.criticalEnglishAssessment.includes('does not explicitly determine'));
const michael=judgments.records.find(x=>x.issueType==='UNNAMED_ANGEL_VERSUS_ST_MICHAEL');
assert(michael.criticalEnglishAssessment.includes('names no specific angel'));
const melchi=judgments.records.find(x=>x.issueType==='MELCHISEDECH_MEAL_AND_SACRIFICE');
assert(melchi.independentMagisterialSources.some(u=>u.includes('catholicculture.org')));
const eyes=judgments.records.find(x=>x.issueType==='HISTORICAL_EYES_UPLIFTED_AT_LAST_SUPPER');
assert(eyes.criticalEnglishAssessment.includes('requires the Roman Missal as authority'));
console.log('PASS Lanslots 16 additional, distinct nonparenthetical Bible associations from original OCR; seven source-critical EN/FR cautions; no fabricated verse attributions, liturgical cues or publication.');
