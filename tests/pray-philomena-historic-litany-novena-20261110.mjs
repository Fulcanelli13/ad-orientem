import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PHILOMENA_HISTORICAL_TWO_WORKS_V1 as works,philomenaHistoricalWork,philomenaHistoricalMatches} from "../src/pray/philomena-historic-litany-novena.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as data} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

assert.equal(Object.keys(data.prayers).length,48,"Canonical prayers must remain unchanged");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Existing 16 novenas must not change");
assert.equal(works.length,2);
assert.deepEqual(works.map(w=>w.acquisitionId),["AO-AQ-032","AO-AQ-033"]);
assert.deepEqual(works.map(w=>w.subject),["VI","VI"]);
assert.equal(new Set(works.map(w=>w.id)).size,2);
for(const w of works){
 assert.equal(w.englishSourceTextCertifiedToOriginalScan,false,"No facsimile collation claim");
 assert.equal(w.frenchTextStatus,"MODERN_EDITORIAL_TRANSLATION_FROM_HISTORIC_EN");
 assert.equal(w.ickspDistinctRecension,true,"New Brighton is a different textual witness");
 assert.match(w.ickspComparison,/^https:\/\/icksp\.org\.uk\/newbrighton\//);
 assert.ok(w.sourceUrl.startsWith("https://"),"External exact source link required");
 assert.equal(w.historicalLiturgicalAuthorizationClaimed,false);
 assert.equal(philomenaHistoricalWork(w.id),w);
 assert.equal(philomenaHistoricalMatches({subject:"VI",search:w.titleEn}).length,1);
 assert.equal(philomenaHistoricalMatches({subject:"II",search:w.titleEn}).length,0);
 assert.equal(philomenaHistoricalMatches({category:"foundations",search:w.titleEn}).length,0);
}
const [litany,novena]=works;
assert.equal(litany.sourceYear,1848);
assert.match(litany.sourceBook,/St. Vincent's Manual/);
assert.equal(litany.invocationGroups.opening.length,5);
assert.equal(litany.invocationGroups.trinity.length,4);
assert.equal(litany.invocationGroups.philomena.length,17);
assert.equal(litany.invocationGroups.agnus.length,3);
assert.equal(litany.originalPrintShorthand,"Lamb of God, &c.");
assert.match(litany.agnusExpansionStatus,/EDITORIAL/);
assert.equal(litany.attribution,"NO_SPECIFIC_AUTHOR_IN_1848_SOURCE");
for(const item of [...litany.invocationGroups.opening,...litany.invocationGroups.trinity,
 litany.invocationGroups.holyMary,...litany.invocationGroups.philomena,...litany.invocationGroups.agnus]){
 assert.ok(item.en&&item.fr,"Complete invocation line in both language faces");
 assert.equal(Boolean(item.responseEn),Boolean(item.responseFr),"No unpaired response");
}
assert.match(litany.collectEn,/O GLORIOUS virgin and martyr/);
assert.match(litany.collectFr,/Ô glorieuse vierge et martyre/);
assert.match(litany.sourceVerseEn,/^℣\. Pray for us/);
assert.match(litany.sourceResponseEn,/^℟\. That we may/);

assert.equal(novena.sourceYear,1863);
assert.equal(novena.days,9);
assert.equal(novena.distinctDailyPrayerBodies,1,"Same full daily prayer, nine repetitions, not invented separate prayers");
assert.equal(novena.originalNovenaCorpusChanged,false);
assert.equal(novena.dailyPrayerEn.length,5);
assert.equal(novena.dailyPrayerFr.length,5);
assert.equal(novena.dailyPrayerEn.length,novena.dailyPrayerFr.length);
assert.ok(novena.dailyPrayerEn.join("\n").length>1500);
assert.ok(novena.dailyPrayerFr.join("\n").length>1500);
assert.match(novena.dailyPrayerEn[0],/^Glorious Virgin and Martyr/);
assert.match(novena.dailyPrayerEn[2],/Here declare those graces/);
assert.match(novena.dailyPrayerFr[2],/Présentez ici ces grâces/);
assert.ok(novena.optionalClosingCollectEn.length>200&&novena.optionalClosingCollectFr.length>200);
assert.match(novena.optionalClosingStatus,/NOT_PROVEN_REQUIRED_DAILY/);
assert.match(novena.optionalInvocationEn,/St\. Philomena/);

const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const keyword of [
 "import {PHILOMENA_HISTORICAL_TWO_WORKS_V1",
 "function renderPhilomenaHistorical(){",
 "if(LIB.open&&philomenaHistoricalWork(LIB.open))return renderPhilomenaHistorical();",
 "data-ao-philomena-reader",
 "data-ao-philomena-library",
 "data-ao-philomena-open",
 "data-ao-philomena-seventeen",
 "data-ao-philomena-source-abbreviation",
 "data-ao-philomena-novena-full",
 "data-ao-philomena-novena-optional",
 "data-ao-philomena-editorial",
 "data-p435930-philomena-prev",
 "data-p435930-philomena-next",
 "data-p435930-philomena-finish",
 "PHILOMENA_HISTORICAL_TWO_WORKS_V1.filter(w=>w.subject===subject.id).length",
 "philomenaSection}"
])assert.ok(ui.includes(keyword),"Missing source-owned reader: "+keyword);
console.log("St Philomena: complete 1848 litany 17 invocations, 1863 novena single original prayer × 9 days, editorial FR, explicit Lamb of God shorthand, ICKSP variant separated, 48/16 protected PASS");
