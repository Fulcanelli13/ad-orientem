import assert from "node:assert/strict";
import {buildSecondaryReconciliation} from "../tools/mass/reconcile-annexed-secondary-owners.mjs";
const report=buildSecondaryReconciliation();
const {summary:s}=report;
assert.equal(report.schema,"ao-annexed-second-pass-existing-owner-v1");
assert.equal(report.status,"READ_ONLY_CANDIDATE_INDEX_NO_TEXT_COPY_NO_TRANSLATION");
assert.equal(s.firstPassScanned,319,
  "First-pass scope changed; recollate the reconciliation counts");
assert.equal(s.firstPassOrdinaryMatches,60);
assert.equal(s.firstPassWithoutOrdinaryMatch,259);
assert.ok(report.prayerCorpus.prayers>=48);
assert.equal(report.existingInventoryCounts.fullyCertified,0,
  "Do not promote historic prayer witness claims to fully approved without collation");
assert.ok(s.exactPrayerLineMatches>0,
  "Cannot be right that the already-existing Latin litany prayer shares no source lines");
assert.equal(s.afterOrdinaryAndPrayerUnmatched+s.exactPrayerLineMatches,
  s.firstPassWithoutOrdinaryMatch);
assert.equal(s.confirmedMissingTranslations,null,
  "Not matching two owners is NOT evidence of a missing translation");
assert.equal(s.missingTranslationStatus,"NOT_YET_ASSESSED");
const litanyMatch=report.prayerLineMatches.find(row=>
  row.rite==="ROGATIONS_PROCESSION"&&row.path==="processionLitany.0");
assert.ok(litanyMatch,
  "Existing PRAY Litany of Loreto's Sancta Maria invocation must be discovered");
assert.ok(litanyMatch.sources.some(row=>row.prayerId==="litany_loreto_1962"),
  "Line should link to a real existing trilingual prayer owner");
assert.ok(litanyMatch.sources.every(row=>
  row.decision==="EXACT_LATIN_PRAY_CANDIDATE_REQUIRES_EDITION_AND_SCOPE_REVIEW"));
assert.ok(report.scriptureCandidates.some(x=>
  x.rite==="HOLY_THURSDAY_POST"&&x.path==="stripping.psalm21Pian.0"&&
  x.issue==="NON_VULGATE_PSALTER"),
  "Pian Psalter must be specifically flagged as non-interchangeable with Vulgate");
assert.ok(report.scriptureCandidates.some(x=>
  x.rite==="ROGATIONS_PROCESSION"&&x.path==="postLitany.psalm69.0"),
  "Rogations post-Litany Psalm 69 edition/verse candidates missing");
assert.ok(report.scriptureCandidates.every(x=>
  x.decision==="SCRIPTURE_REFERENCE_CANDIDATE_NO_VERSE_ALIGNMENT_OR_APPROVAL"));
assert.ok(report.stillNoExactOwnerMatch.every(x=>
  x.decision==="NO_EXACT_ORDINARY_OR_PRAY_MATCH_NOT_GENUINE_TRANSLATION_GAP"));
assert.ok(report.sourceLimitations.litany.includes("1883 English"));
assert.ok(report.sourceLimitations.scripture.includes("UNCOLLATED_SOURCE_WITNESS"));
assert.ok(!Object.hasOwn(report,"english")&&!Object.hasOwn(report,"french"),
  "Do not create another liturgical text corpus");
console.log("PASS secondary Mass-annex source-owner reconciliation: PRAY litany candidates, Psalm recension holds, zero fabricated missing-translation claims.");
console.log(JSON.stringify({summary:report.summary,prayerCorpus:report.prayerCorpus}));
