import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prayerScriptureStageFacesV1 as resolve} from "../src/pray/scripture-stage-faces.v1.js";
import {PENITENTIAL_PSALMS_VULGATE,penitentialPsalmReference,auditPenitentialPsalmResponse,PENITENTIAL_PSALMS_TEXT_STATUS} from "../src/pray/penitential-psalms-source.js";
import {LITANY_SOURCE_WITNESSES,LITANY_WITNESS_REVIEW_V1,reviewLitanyTranscription,extractLitanyProper,paginateLitanyProper} from "../src/pray/litany-source.js";
import {BATCH03_LITANY_EDITION_POLICY,BATCH03_LITANY_SOURCE_STATUS} from "../src/pray/litany-1962-use-policy.js";
import {TENEBRAE_EXPECTED_PSALMS} from "../src/pray/tenebrae-1960.js";
import {TENEBRAE_DAY_NAMES} from "../src/pray/tenebrae-1960.js";
const runtime=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const src=code=>[{verse:1,text:code+" 1"},{verse:2,text:code+" 2"},{verse:3,text:code+" 3"}];
const EN=src("English"),FR=src("Français"),LA=src("Latine");
const data={englishChapter:EN,frenchChapter:FR,latinChapter:LA,reference:{start:1,end:2}};

assert.deepEqual(PENITENTIAL_PSALMS_VULGATE.map(x=>x.trad),[6,31,37,50,101,129,142]);
assert.deepEqual(PENITENTIAL_PSALMS_VULGATE.map(x=>x.modern),[6,32,38,51,102,130,143]);
for(const psalm of PENITENTIAL_PSALMS_VULGATE)assert.equal(penitentialPsalmReference(psalm),"Psalms "+psalm.trad+":1");
assert.ok(PENITENTIAL_PSALMS_TEXT_STATUS.verification.includes("independently certified"));
let cases=0;
for(const requested of ["en","fr"]){
 for(const full of [false,true]){
  const state=resolve(data,requested,full);
  assert.equal(state.primaryLanguage,requested);
  assert.equal(state.vernacularLanguage,requested);
  assert.equal(state.canFlip,true);
  assert.equal(state.fallback,false);
  assert.equal(state.primaryRows.length,full?3:2);
  assert.equal(state.latinRows.length,full?3:2);
  cases++;
 }
}
// A missing FR chapter may never produce an empty FR flip, even if EN+LA survive.
let r=resolve({englishChapter:EN,latinChapter:LA},"fr",true);
assert.equal(r.primaryLanguage,"en");
assert.equal(r.vernacularLanguage,"en");
assert.equal(r.canFlip,true);
assert.equal(r.fallback,true);
assert.deepEqual(r.primaryRows,EN);
cases++;
// Latin-only: render a single genuine Latin source, NO empty-language switch.
r=resolve({latinChapter:LA},"fr",true);
assert.equal(r.primaryLanguage,"la");
assert.equal(r.canFlip,false);
assert.equal(r.fallback,true);
assert.deepEqual(r.primaryRows,LA);
cases++;
// A single English original in FR UI must remain available without a false switch.
r=resolve({englishChapter:EN},"fr",true);
assert.equal(r.primaryLanguage,"en");
assert.equal(r.canFlip,false);
assert.equal(r.fallback,true);
assert.deepEqual(r.primaryRows,EN);
cases++;
r=resolve({frenchChapter:FR},"en",true);
assert.equal(r.primaryLanguage,"fr");
assert.equal(r.canFlip,false);
assert.equal(r.fallback,true);
cases++;
// Only unverified source faces must fail closed; empty rows cannot masquerade
// as a full chapter, and a partial source must not be marked complete.
assert.equal(resolve({englishChapter:[],frenchChapter:[],latinChapter:[]},"en",true).unavailable,true);
assert.equal(resolve({englishChapter:[{verse:1,text:""}]},"en",true).unavailable,true);
r=resolve({frenchChapter:FR,latinChapter:LA,reference:{start:2,end:2}},"fr",false);
assert.deepEqual(r.primaryRows,[FR[1]]);
assert.equal(r.canFlip,true);
assert.equal(resolve({englishChapter:EN,reference:{start:20,end:40}},"en",false).unavailable,true);
assert.equal(resolve({englishChapter:EN,reference:{start:20,end:40}},"en",true).primaryRows.length,3);
assert.equal(resolve({englishChapter:EN},"en",false).primaryRows.length,3);
cases+=5;
const audit=auditPenitentialPsalmResponse({englishChapter:EN,frenchChapter:FR,latinChapter:LA});
for(const language of ["en","fr","la"])assert.ok(audit[language].uniqueOrdered&&audit[language].nonempty&&audit[language].contiguous);
const pen=runtime.slice(runtime.indexOf("function scriptureFlip("),runtime.indexOf("async function guidedWsText(",runtime.indexOf("function scriptureFlip(")));
assert.ok(pen.includes("prayerScriptureStageFacesV1(d,lang(),full)"));
assert.ok(pen.includes("if(!witness.canFlip)return"),"Never render a false 2-language toggle");
assert.ok(pen.includes("data-ao-scripture-single-face"),"Actual single source must stay readable");
assert.ok(pen.includes("data-ao-scripture-witness-fallback"),"Fallback language must be disclosed");
assert.ok(pen.includes('data-face-v lang='));
assert.ok(pen.includes('data-face-la lang="la"'));
assert.ok(pen.includes("if(prayerScriptureStageFacesV1(d,lang(),full).unavailable)"),"Empty genuine source must fail closed");
assert.ok(runtime.includes("data-p435930-pen-litany"),"Seven Psalms must still hand off to the proper private Litany");

// Historical Litanies: two separate witnesses, not a fabricated identical EN/FR
// 1962 liturgical edition. Preserve original source scopes and proper boundaries.
assert.notEqual(LITANY_SOURCE_WITNESSES.en.title,LITANY_SOURCE_WITNESSES.fr.title);
assert.notEqual(LITANY_WITNESS_REVIEW_V1.en.edition,LITANY_WITNESS_REVIEW_V1.fr.edition);
for(const language of ["en","fr"]){
 assert.ok(LITANY_SOURCE_WITNESSES[language].url.startsWith("https://"));
 assert.equal(reviewLitanyTranscription("Litany",language).canCertify1962,false);
}
const historicalEnglish="Lord, have mercy on us.\nHoly Mary, pray for us.\nSt. Peter, pray for us.\nLamb of God, have mercy on us.\n";
const fixture="The Litany of the Saints\n"+historicalEnglish.repeat(8)+"Our Father, in secret\nPsalm 69 and concluding collect";
const proper=extractLitanyProper(fixture,"en");
assert.ok(proper.includes("Holy Mary"));
assert.ok(!proper.includes("Psalm 69"));
assert.ok(paginateLitanyProper(proper,"en").length>=1);
assert.equal(BATCH03_LITANY_EDITION_POLICY.private.liturgical1962Certified,false);
assert.equal(BATCH03_LITANY_EDITION_POLICY.major.reader,"SOURCE_LINK_ONLY_PENDING_COMPLETE_TEXT_COLLATION");
assert.equal(BATCH03_LITANY_EDITION_POLICY.vigil.reader,"EXISTING_SPECIAL_MASS_OWNER");
assert.equal(BATCH03_LITANY_EDITION_POLICY.forty.reader,"EXISTING_FORTY_HOURS_OWNER");
const lit=runtime.slice(runtime.indexOf("function renderBatch03PublicLitanyReference(){"),runtime.indexOf("async function ensureSevenWords(){"));
assert.ok(lit.includes("renderBatch03PublicLitanyReference()"));
assert.ok(lit.includes("if(LIT.language!==lang())"),"Changing language must invalidate the other witness");
assert.ok(lit.includes("LIT.error")&&lit.includes("data-p435930-lit-retry"),"Invalid historical transcript must fail visibly");

// Tenebrae remains source-owned, local, and fully aligned across all three
// days and both Hours. The core corpus test checks 126 source steps × 3 language faces
// (3 days × [32 Matins + 10 Lauds]) in all three languages.
assert.equal(TENEBRAE_DAY_NAMES.en.length,3);
assert.equal(TENEBRAE_DAY_NAMES.fr.length,3);
assert.equal(TENEBRAE_DAY_NAMES.la.length,3);
for(const mode of ["matins","lauds"]){
 assert.equal(TENEBRAE_EXPECTED_PSALMS[mode].length,3);
}
const ten=runtime.slice(runtime.indexOf("async function ensureTenebrae(){"),runtime.indexOf("function renderPreciousBlood(){"));
assert.ok(ten.includes("loadTenebraeHour({dayIndex:TEN.day,hour:TEN.hour})"),"Tenebrae must use local source compiler");
assert.ok(ten.includes("renderTenebraeBody({day:TEN.day,hour:TEN.hour"),"Canonical source must feed existing Office reader");
const tenPresentation=readFileSync(new URL("../src/pray/tenebrae-presentation.js",import.meta.url),"utf8");
assert.ok(tenPresentation.includes('face==="latin"?current.latin:current[loc]'),"Switch must preserve original sourced Office faces");
assert.ok(tenPresentation.includes('lang="'),"Tenebrae text must label its language");
console.log("PASS · "+cases+" real Scripture face cases and 7 Penitential Psalm references; 1883 EN/1862 FR private Litany source separation; 3-day Tenebrae with six local Office hour models");
