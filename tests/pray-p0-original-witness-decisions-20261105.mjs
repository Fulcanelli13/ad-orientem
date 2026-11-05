import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";
import {scriptureMeditationPrayers} from "../src/pray/scripture-meditation-prayers.v1.js";
import {historicalChapletCandidate} from "../src/pray/prayer-acquisition-chaplet-structures.v1.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
const read=name=>JSON.parse(readFileSync(new URL(name,import.meta.url),"utf8"));
const decision=read("../data/pray/prayer-p0-source-witness-decisions-20261105.v1.json");
const legacy=read("../data/pray/prayer-corpus-current-release-overlay-b31.v1.json");
const ultra=read("../data/pray/prayer-ultra-master-97-source-owner-reconciliation-20261105.v1.json");
assert.equal(decision.schema,"ao.pray.p0-source-witness-decisions-20261105.v1");
assert.deepEqual(decision.decisions.map(x=>x.acquisitionId),["AO-AQ-047","AO-AQ-078"]);
assert.equal(decision.historicalBaseline.preserveAsHistory,true);
assert.equal(legacy.records.find(x=>x.id==="AO-AQ-047").currentStatus,"HOLD_VARIANT_CONFLICT");
assert.equal(legacy.records.find(x=>x.id==="AO-AQ-078").currentStatus,"HOLD_SOURCE_OR_RIGHTS",
 "29 October historical overlay must remain intact rather than being silently rewritten");
assert.deepEqual(ultra.summary.p0SourceOrVariantHolds,["AO-AQ-047","AO-AQ-078"],
 "Original 97-row October snapshot is historical; current bounded decision is additive");
const [shortDecision,lasanceDecision]=decision.decisions;
const short=historicalChapletCandidate("raccolta_1857_precious_blood_short");
assert.equal(shortDecision.decision,"HOLD_REPETITION_COUNT_CONFLICT_NOT_PUBLIC");
assert.equal(short.userFacing,false);
assert.equal(short.releaseStatus,"HOLD_SOURCE_CONFLICT");
assert.equal(short.originalPrintScanCertified,undefined);
assert.deepEqual(shortDecision.witnessedTranscription.perMysteryOurFathers,short.reproducedMysteryCounts);
assert.equal(shortDecision.witnessedTranscription.introClaimedOurFathers,short.claimedTotalPater);
assert.equal(shortDecision.witnessedTranscription.printedListArithmeticTotal,35);
assert.equal(shortDecision.witnessedTranscription.contradictionOpen,true);
assert.equal(shortDecision.sources[0].visualPageCompared,false);
assert.equal(shortDecision.publicChoiceAllowed,false);
assert.equal(shortDecision.publishedFullFormDoesNotProveShortForm,true);
assert.equal(shortDecision.newIndulgenceClaimAllowed,false);
assert.equal(lasanceDecision.decision,"ADMIT_ENGLISH_ORIGINAL_WITH_EXISTING_SOURCE_DISCLOSURE");
assert.equal(lasanceDecision.source.imageReviewed,true);
assert.equal(lasanceDecision.printedPage,225);
assert.equal(lasanceDecision.source.pageScan,
 "https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/240");
assert.equal(lasanceDecision.editionScope,"1908_ENGLISH_P225_BODY_IMAGE_COLLATED_NOT_FULL_BOOK_OR_FRENCH_LATIN_CERTIFICATION");
assert.equal(lasanceDecision.FrenchTranslationAdmitted,false);
assert.equal(lasanceDecision.LatinTranslationOfThisWorkAdmitted,false);
assert.equal(lasanceDecision.publication.requiresNoNewDoor,true);
assert.equal(lasanceDecision.historicalIndulgenceClaimAllowed,false);
const id=lasanceDecision.witnessId;
const source=prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"en"}).find(x=>x.id===id);
assert.ok(source,"Original English prayer must be admitted via the existing fail-closed witness selector");
assert.equal(source.release.status,"LIVE_CLEARED");
assert.equal(source.release.allowed_in_prayer_hub,true);
assert.equal(source.release.exact_print_verified,true);
assert.equal(source.source.witness_status,"PRINTED_1908_PAGE_225_IMAGE_COLLATED_EN_ONLY");
assert.equal(source.source.scanPageUrl,lasanceDecision.source.pageScan);
assert.equal(source.language,"en");
assert.equal(source.source_page,"225");
const exactPrintedEnglish=
 "My God, I firmly believe that Thou art here present, and I humbly adore Thee in union with the angels and saints. "+
 "I am sorry for having sinned, because Thou art infinitely good and sin displeases Thee. "+
 "I love Thee above all things and with my whole heart. "+
 "I offer Thee all that I am and all that I have,—my soul with all its faculties, my body with all its senses. "+
 "Enlighten my understanding and inflame my will, that I may know and do what is pleasing to Thee.\n\n"+
 "I beseech Thee to direct all the powers of my soul, all my thoughts and affections to Thy service and Thy glory "+
 "as well as to my own sanctification and salvation.";
assert.equal(source.text,exactPrintedEnglish,"English p225 original words changed");
for(const anchor of lasanceDecision.distinctiveAnchors)assert.ok(source.text.includes(anchor),"Missing p225 anchor: "+anchor);
assert.equal(prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"fr"}).length,0,
 "No French translation may be inferred");
assert.equal(prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"la"}).length,1,
 "Printed Aquinas Latin is distinct from an invented Lasance Latin");
assert.deepEqual(scriptureMeditationPrayers("before",{language:"en"}).map(x=>x.id),[
 id,"thomas_aquinas_concede_mihi_lasance_1908_en","thomas_aquinas_concede_mihi_lasance_1908_la"
]);
assert.deepEqual(scriptureMeditationPrayers("before",{language:"fr"}).map(x=>x.id),[
 "thomas_aquinas_concede_mihi_lasance_1908_la"
],"French reader must label and use original Latin Aquinas rather than pretend to translate Lasance");
assert.equal(scriptureMeditationPrayers("after",{language:"en"})[0].id,
 "lasance_prayer_after_meditation_1908_en");
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48);
assert.equal(NOVENA_CORPUS_V4_IDS.length,16);
console.log("Prayer P0 original witnesses PASS: AO-AQ-078 original printed EN p225 visually collated and admitted only in existing Scripture reader, no invented FR/LA; AO-AQ-047 short Raccolta remains held with 33-vs-35 unresolved.");
