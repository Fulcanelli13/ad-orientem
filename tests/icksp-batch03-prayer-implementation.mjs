import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {BATCH03_LITANY_EDITION_POLICY,BATCH03_ICRSP_MAJOR_PROCESSION_STEPS,BATCH03_LITANY_SOURCE_STATUS,batch03LitanyUse} from "../src/pray/litany-1962-use-policy.js";
import {LITANY_SOURCE_WITNESSES,LITANY_WITNESS_REVIEW_V1} from "../src/pray/litany-source.js";
import {PENITENTIAL_PSALMS_VULGATE,penitentialPsalmReference,auditPenitentialPsalmResponse,PENITENTIAL_PSALMS_TEXT_STATUS} from "../src/pray/penitential-psalms-source.js";
import {CONFESSION_PATHS,CONFESSION_SOURCE_LINKS,CONFESSION_HISTORICAL_SOURCE_POLICY} from "../src/pray/confession-paths.js";
import {COMMUNION_TREASURY_V383} from "../src/pray/traditional-pray-data.js";

const src=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
for(const path of ["src/pray/presentation-runtime.js","src/pray/traditional-pray-runtime.js",
 "src/pray/litany-1962-use-policy.js","src/pray/penitential-psalms-source.js","src/pray/confession-paths.js"]){
 execFileSync(process.execPath,["--check",new URL("../"+path,import.meta.url).pathname],{stdio:"pipe"});
}
assert.deepEqual(Object.keys(BATCH03_LITANY_EDITION_POLICY),["private","major","vigil","forty"]);
assert.equal(batch03LitanyUse("unknown").id,"private");
assert.equal(BATCH03_LITANY_EDITION_POLICY.major.liturgical1962Certified,false);
assert.equal(BATCH03_LITANY_SOURCE_STATUS.offlineComplete1962,"BLOCKED_UNTIL_ENTIRE_EDITION_VERIFIED");
assert.ok(BATCH03_LITANY_EDITION_POLICY.major.sourceUrl.includes("a0087_nouveau"));
assert.equal(BATCH03_ICRSP_MAJOR_PROCESSION_STEPS.length,5);
assert.equal(LITANY_SOURCE_WITNESSES.en.status,"HISTORICAL_TRANSCRIPTION_UNCOLLATED");
assert.equal(LITANY_SOURCE_WITNESSES.fr.status,"HISTORICAL_TRANSCRIPTION_UNCOLLATED");
assert.notEqual(LITANY_SOURCE_WITNESSES.en.url,LITANY_SOURCE_WITNESSES.fr.url);
assert.notEqual(LITANY_WITNESS_REVIEW_V1.en.edition,LITANY_WITNESS_REVIEW_V1.fr.edition);

const sequence=[6,31,37,50,101,129,142],modern=[6,32,38,51,102,130,143];
assert.deepEqual(PENITENTIAL_PSALMS_VULGATE.map(p=>p.trad),sequence);
assert.deepEqual(PENITENTIAL_PSALMS_VULGATE.map(p=>p.modern),modern);
assert.equal(new Set(PENITENTIAL_PSALMS_VULGATE.map(p=>penitentialPsalmReference(p))).size,7);
const rows=[1,2,3,4,5,6].map(x=>({verse:x,text:"Source verse "+x}));
const good=auditPenitentialPsalmResponse({englishChapter:rows,frenchChapter:rows,latinChapter:rows});
assert.ok(["en","fr","la"].every(k=>good[k].uniqueOrdered&&good[k].nonempty&&good[k].contiguous));
const bad=auditPenitentialPsalmResponse({englishChapter:[rows[0],rows[2]],frenchChapter:[],latinChapter:rows});
assert.equal(bad.en.contiguous,false);
assert.deepEqual(bad.en.gaps,[[1,3]]);
assert.equal(bad.fr.verses,0);
assert.equal(PENITENTIAL_PSALMS_TEXT_STATUS.offline.includes("warm-cache"),true);

assert.deepEqual(Object.keys(CONFESSION_PATHS),["regular","returning","general"]);
assert.equal(CONFESSION_HISTORICAL_SOURCE_POLICY.piusX.status,"HISTORICAL_ITALIAN_REFERENCE_ONLY_NO_EN_FR_COLLATION");
assert.ok(CONFESSION_SOURCE_LINKS.some(x=>x.url.includes("wikisource.org")));
assert.ok(CONFESSION_SOURCE_LINKS.some(x=>x.url.includes("Rituale_Romanum_1925")));
assert.ok(Object.values(CONFESSION_PATHS).every(x=>x.id&&x.descriptionEn&&x.descriptionFr));
assert.ok(COMMUNION_TREASURY_V383.beforeThomas.la&&COMMUNION_TREASURY_V383.beforeThomas.en&&COMMUNION_TREASURY_V383.beforeThomas.fr);
assert.ok(COMMUNION_TREASURY_V383.afterBonaventure.la&&COMMUNION_TREASURY_V383.afterBonaventure.en&&COMMUNION_TREASURY_V383.afterBonaventure.fr);

const pres=src("src/pray/presentation-runtime.js");
const traditional=src("src/pray/traditional-pray-runtime.js");
for(const x of ["batch03LitanyUseOptions","renderBatch03PublicLitanyReference","data-p435930-lit-use","data-p435930-lit-forty","BATCH03_LITANY_SOURCE_STATUS",
 "warmPenitentialPsalmCorpus","data-p435930-pen-cache","auditPenitentialPsalmResponse",
 "data-p435930-station-simple-responses","guided||STATIONS.simpleResponses?stationResponse(vr):''",
 "CONFESSION_HISTORICAL_SOURCE_POLICY","data-ao-batch03-conf-contrition","data-ao-batch03-conf-thanks"])
 assert.ok(pres.includes(x),"Missing existing-reader integration: "+x);
assert.ok(pres.includes("STATIONS.publicPosture?'guided':S.stations.mode"),"Public posture must preserve guided recitation");
assert.ok(pres.includes("CONF=freshConfessionState()"),"No stored Confession answers");
assert.ok(!pres.includes("LIT.sections=all1962"),"Never invent harmonized 1962 text");
const litanyStyles=src("src/pray/devotional-card-deck-styles.js");
const litanyFocus=src("src/pray/devotional-sequence-adapter.js");
assert.match(pres,/const edition=L\('English prayer-book witness · 1883 · private','Témoin français de 1862 · privé'\)/,
 "Private Litany must visibly identify the edition, not pretend translated 1962 identity");
assert.match(pres,/\<details class="aoLitanySectionGuide"/,
 "Recitation guidance must remain available but not precede the source prayer");
assert.match(pres,/\<article class="aoP435930Prayer \$\{S\.rosary\.recitation/,
 "Preserve the historical litany text's canonical prayer card");
assert.match(pres,/view==='litany'&&LIT\.use==='private'/,
 "Session English/French switching must not publish public rites");
assert.match(litanyStyles,/data-ao-devotional-owner="litany"\] \.aoDevoCardScroll \.aoP435930LitanyLine\{/,
 "The reader typography must be limited to the historical private Litany");
assert.match(litanyStyles,/clamp\(18px,4\.7vw,22px\)\/1\.66/,
 "Historical litany source text must remain at least 18px");
assert.match(litanyFocus,/litanySourceLine=kind==="litany"&&Boolean\(p\.closest\("\.aoP435930LitanyVerses"\)\)/,
 "Do not mute entire historical litany invocations as focus context");

assert.ok(traditional.includes("data-ao-communion-purpose-picker"),"Historical complete Communion prayers must remain directly selectable without opening a catalogue");
assert.ok(traditional.includes("data-tp381-communion-pick"));
assert.ok(traditional.includes("position>=communionStages().length"));
assert.ok(traditional.includes("COMMUNION_BEFORE=Object.freeze(["));
assert.ok(traditional.includes("COMMUNION_AFTER=Object.freeze(["));
console.log("PASS Batch 3: Litany edition/rite separation, seven Psalms audit, Eleven Communion prayers, Simple Stations, Confession privacy/provenance");
