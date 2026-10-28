import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_HOLY_FACE_1887_B25 as n,HOLY_FACE_SOURCE_GATES_B25 as gate} from "../src/pray/holy-face-janvier-1887-b25.js";
import {NOVENA_CORPUS_V4,NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {novenaStatusFor,novenaWindowFor} from "../src/calendar/intelligence.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const original=read("../data/pray/research/pray-b25-holy-face-janvier-1887-nine-full-english-days.v1.json");
const admission=read("../data/pray/pray-b25-holy-face-1887-admission.v1.json");
const variants=read("../data/pray/research/pray-b25-holy-face-1887-variant-review.v1.json");
const approvedDisplayEmendationIds=new Set(["B25-V01","B25-V03","B25-V04","B25-V05"]);
assert.equal(variants.photographed1887ManualCompared,false,"Do not imply 1887 photograph collation");
assert.equal(variants.sourceGates.publicNovenaApproved,false,"Variant audit is not print-edition certification");
assert.equal(variants.rawDigitalWitness.htmlSha256,original.sourceWitness.contentSha256,"Original raw acquisition witness stays frozen");
assert.equal(variants.variants.length,6,"All six reviewed variants remain accounted for");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Original bilingual novena baseline unchanged");
assert.equal(Object.keys(NOVENA_CORPUS_V4).length,16);
assert.equal(n.id,"holy_face_1887");
assert.equal(n.days.length,9);
assert.equal(n.form,"DAY_SPECIFIC");
assert.equal(n.pattern,"SOURCE_REPEAT_ONLY");
assert.equal(gate.fullDigitalEnglishDays,9);
assert.equal(gate.originalPrintPhotoCollated,false);
assert.equal(gate.verifiedFrenchPrayerBody,false);
assert.equal(gate.verifiedLatinPrayerBody,false);
assert.equal(gate.modernAppendixIncluded,false);
assert.equal(original.sourceWitness.contentSha256,gate.sourceHtmlSha256);
assert.equal(original.days.length,9);
assert.equal(admission.sourceHTMLSha256,gate.sourceHtmlSha256);
assert.equal(admission.completeness.concludingCollectsIncludedEachDay,9);
assert.equal(admission.protection.modern2022AppendicesImported,false);
assert.equal(admission.protection.externalRuntimeFetch,false);
for(let i=0;i<9;i++){
 const d=n.days[i],source=original.days[i],text=d.text;
 assert.equal(d.originalSourceDay,i+1);
 assert.equal(source.day,i+1);
 assert.equal(text.fr,"","Do not fabricate French translated prayer body");
 let expectedSourceText=original.sharedOpeningEnglish+"\n\n"+source.historicalMeditationEnglish;
 const edits=variants.variants.filter(v=>v.day===i+1&&approvedDisplayEmendationIds.has(v.id));
 for(const variant of edits){
  assert.equal(expectedSourceText.split(variant.staged).length-1,1,"Each approved display emendation must match exactly once: "+variant.id);
  expectedSourceText=expectedSourceText.replace(variant.staged,variant.editorialReading);
 }
 assert.equal(text.en,expectedSourceText,"Only four source-collated display corrections are permitted; all other original text must match exactly");
 assert.ok(text.en.length>3200,"Historical day's text must be complete");
 for(const roman of ["I.","II.","III."])assert.ok(text.en.includes(roman),"Three numbered reflections missing from "+(i+1));
 assert.match(text.en,/Spiritual Bouquet/i);
 assert.match(text.en,/Virtue/i);
 assert.match(text.en,/Act of /i);
 assert.match(text.en,/Almighty and merciful God|God all-powerful/i);
 assert.match(text.en,/Amen\.$/);
 assert.doesNotMatch(text.en,/2022|League of St Martin|Canada54|St\. Martin's League/i);
}
assert.deepEqual(n.days.map(d=>d.originalSourceDay),[1,2,3,4,5,6,7,8,9]);
assert.equal(n.calendar.type,"EASTER_OFFSET");
assert.equal(n.calendar.startOffset,-56);
assert.equal(n.calendar.endOffset,-48);
assert.equal(n.calendar.feastOffset,-47);
const year2027=novenaWindowFor(n,2027);
assert.equal(year2027.feast,"2027-02-09","Shrove Tuesday 2027");
assert.equal(year2027.start,"2027-01-31");
assert.equal(year2027.end,"2027-02-08");
assert.equal(novenaStatusFor(n,"2027-01-31").day,1);
assert.equal(novenaStatusFor(n,"2027-02-08").day,9);
assert.equal(novenaStatusFor(n,"2027-02-03").kind,"active");
assert.equal(n.source.status,"HISTORICAL_EN_DIGITAL_TRANSCRIPTION_PRINT_IMAGE_UNCOLLATED");
assert.match(n.source.adaptation,/not independently collated/i);
assert.equal(n.frenchTextStatus,"HISTORICAL_ENGLISH_ONLY_NO_FRENCH_WITNESS");
const runtime=readFileSync(new URL("../src/pray/novena-runtime.js",import.meta.url),"utf8");
for(const token of [
 'import { NOVENA_HOLY_FACE_1887_B25 }',
 '[NOVENA_HOLY_FACE_1887_B25.id]:NOVENA_HOLY_FACE_1887_B25',
 'data-n1-holy-face-1887-supplement',
 'data-n1-supplement="holy_face_1887"',
 "function sourceWitness(text,label)",
 "if(isFr()&&!N.showEnglish&&!fr)",
 "data-n1-show-en",
 "p==='SOURCE_REPEAT_ONLY'",
 "novenaStatusFor(n,key,{fr:isFr()})"
])assert.ok(runtime.includes(token),"Missing existing Novena integration: "+token);
assert.ok(!runtime.includes("fullDailyReadingEnglish"),"Do not fetch or assemble external source at runtime");
console.log("PASS B25 Holy Face: nine complete Janvier digital English days, originals exact, no appended modern texts, Shrove-Tuesday movable dates, French fail-closed, original 16 preserved");
