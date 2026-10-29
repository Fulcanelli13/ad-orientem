import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {prayEditionWitness} from "../src/pray/prayer-edition-witnesses.v1.js";
import {LITANY_SOURCE_WITNESSES} from "../src/pray/litany-source.js";
import {BATCH03_LITANY_EDITION_POLICY,BATCH03_LITANY_SOURCE_STATUS} from "../src/pray/litany-1962-use-policy.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const inventory=read("../data/pray/prayer-source-certification-inventory.v3.json");
const novenaReview=read("../data/pray/novena-source-review.v3.json");
const acquisition=read("../data/pray/prayer-corpus-current-release-overlay-b31.v1.json");
const ids=rows=>rows.map(x=>x.id).sort();
const sameIds=(actual,expected,label)=>assert.deepEqual([...actual].sort(),[...expected].sort(),label);
const status=row=>row.collation?.status||"NOT_REVIEWED";

assert.equal(inventory.schema,"ao.prayer.source-certification-inventory.v3");
assert.equal(inventory.provenance,"REPOSITORY_RECORD_EXTRACTION_NOT_INDEPENDENT_COLLATION");
assert.equal(inventory.prayers.length,48);
assert.equal(inventory.novenas.length,16);
sameIds(ids(inventory.prayers),Object.keys(PRAY_CANONICAL_DATA_V435930.prayers),"All canonical Prayer IDs must remain represented in the source inventory");
sameIds(ids(inventory.novenas),NOVENA_CORPUS_V4_IDS,"All original 16 novena IDs must remain represented");
sameIds(ids(novenaReview.records),NOVENA_CORPUS_V4_IDS,"Novena print-review coverage must match live corpus");
assert.equal(inventory.counts.prayers,inventory.prayers.length);
assert.equal(inventory.counts.novenas,inventory.novenas.length);
assert.deepEqual(inventory.counts.prayerMissingUrl,inventory.prayers.filter(x=>!x.sourceUrl).map(x=>x.id));
assert.equal(inventory.counts.legacyUnclassified,inventory.prayers.filter(x=>x.sourceQuality==="LEGACY_RECORD_NOT_RECLASSIFIED").length);

const all=[...inventory.prayers,...inventory.novenas];
const anchors=all.filter(x=>status(x)==="ANCHOR_REVIEWED_NOT_FULL_VERBATIM");
const unreviewed=all.filter(x=>status(x)==="NOT_REVIEWED");
const other=all.filter(x=>!["ANCHOR_REVIEWED_NOT_FULL_VERBATIM","NOT_REVIEWED"].includes(status(x)));
assert.equal(inventory.counts.anchorReviewed,anchors.length);
assert.equal(inventory.counts.notReviewed,unreviewed.length);
assert.equal(inventory.counts.fullyCertified,other.filter(x=>/FULL.*CERTIF|CERTIF.*FULL/.test(status(x))).length);
assert.equal(all.length,anchors.length+unreviewed.length+other.length);
assert.equal(inventory.counts.editionDifferent,anchors.filter(x=>x.collation?.classification!=="SAME_FORM_NORM").length);
for(const item of other){
  assert.ok(item.collation?.originalEdition && item.collation?.printFacsimile && item.collation?.pageRange && item.collation?.comparisonNotes,
    item.id+": any newly upgraded certification must carry a named print edition, facsimile, pages and comparison notes");
}
for(const item of all){
  assert.ok(item.id&&item.title&&item.sourceWork&&item.editorial,"Incomplete source-claim inventory row: "+item.id);
  if(item.sourceUrl)assert.match(item.sourceUrl,/^https:\/\//,"Non-HTTPS source witness: "+item.id);
}

assert.equal(acquisition.records.length,97);
assert.equal(new Set(acquisition.records.map(x=>x.id)).size,97);
assert.equal(acquisition.summary.total,97);
assert.equal(acquisition.summary.addressedOrRouted,61);
assert.equal(acquisition.summary.sourceOrVariantHolds,13);
assert.equal(acquisition.summary.distinctPublishedPrayerTextCount,"NOT_ESTABLISHED_FROM_OVERLAPPING_LANES");
assert.equal(acquisition.summary.originalPrintEditionCertifications,"NOT_ESTABLISHED_BY_THIS_RECONCILIATION");
assert.equal(novenaReview.counts.fullOriginalPrintCertificates,0);
assert.equal(novenaReview.counts.fullEnglishDigitalLineByLineCertificates,0);
assert.equal(novenaReview.counts.digitalEnglishDayBodyAnchorReviews,72);

assert.equal(LITANY_SOURCE_WITNESSES.en.status,"HISTORICAL_TRANSCRIPTION_UNCOLLATED");
assert.equal(LITANY_SOURCE_WITNESSES.fr.status,"HISTORICAL_TRANSCRIPTION_UNCOLLATED");
assert.equal(BATCH03_LITANY_EDITION_POLICY.major.reader,"SOURCE_LINK_ONLY_PENDING_COMPLETE_TEXT_COLLATION");
assert.equal(BATCH03_LITANY_EDITION_POLICY.major.liturgical1962Certified,false);
assert.equal(BATCH03_LITANY_SOURCE_STATUS.offlineComplete1962,"BLOCKED_UNTIL_ENTIRE_EDITION_VERIFIED");
assert.match(BATCH03_LITANY_EDITION_POLICY.major.rubricConflict,/not doubled|not doubled|not doubled|not doubled|not doubled/i);
assert.equal(prayEditionWitness("litany_loreto_1962").edition,"LORETO_PRE_1980_FORM");
assert.equal(prayEditionWitness("litany_loreto_current").edition,"LORETO_CURRENT_2020");
assert.notEqual(prayEditionWitness("litany_loreto_1962").url,prayEditionWitness("litany_loreto_current").url,
  "The current Loreto page alone must not be offered as a facsimile of the 1962-era form");

console.log("PASS Prayer source integrity: 48 canonical + 16 novena records reconciled; "+anchors.length+" partial anchors, "+unreviewed.length+" not reviewed, "+inventory.counts.fullyCertified+" full certificates; 97 overlapping acquisition candidates kept distinct; public 1962 Litany and historical witnesses remain explicitly uncertified.");
