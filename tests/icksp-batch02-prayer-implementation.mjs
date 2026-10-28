import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {benedictionAlleluiaStatus,benedictionVersiclesForDate,BENEDICTION_1962_WITNESS} from "../src/pray/benediction-1962.js";
import {CHRIST_KING_OPTION_DEFAULTS,christKingStages,CHRIST_KING_LAUDES_SECTIONS} from "../src/pray/christ-king-benediction.js";
import {MERCY_OPTIONAL_OPENINGS,divineMercySteps,ROSARY_METHODS,rosaryPlan} from "../src/pray/devotional-methods-v1.js";
import {FORTY_HOURS_SOLEMN_STAGES,fortySolemnAt,FORTY_HOURS_SOLEMN_SOURCE} from "../src/pray/forty-hours-solemn.js";
import {EUCHARISTIC_WITNESSES,EUCHARISTIC_WITNESS_IDS,getEucharisticWitness,EUCHARISTIC_SOURCE} from "../src/pray/eucharistic-witnesses.js";
import {BATCH02_INSTITUTE_OPTIONAL,instituteOptionalFor} from "../src/pray/icksp-batch02-optional.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const files=[
 "src/pray/benediction-1962.js",
 "src/pray/canonical-data.js",
 "src/pray/christ-king-benediction.js",
 "src/pray/devotional-methods-v1.js",
 "src/pray/forty-hours-solemn.js",
 "src/pray/eucharistic-witnesses.js",
 "src/pray/icksp-batch02-optional.js",
 "src/pray/presentation-runtime.js"
];
for(const f of files)execFileSync(process.execPath,["--check",new URL("../"+f,import.meta.url).pathname],{stdio:"pipe"});
const verses=PRAY_CANONICAL_DATA_V435930.prayers.benediction_versicles;
assert.ok(verses,"Unique canonical Benediction prayer must remain present");
assert.match(verses.la,/Qui vivis et regnas/);
assert.match(verses.fr,/Vous qui vivez et régnez dans les siècles des siècles/);
assert.doesNotMatch(verses.fr,/Par le Christ notre Seigneur/);
assert.match(BENEDICTION_1962_WITNESS.rubric,/Tempus Paschale/);
const dates=[
 ["2026-02-18",false],["2026-04-04",false],["2026-04-05",true],
 ["2026-05-17",true],["2026-05-24",true],["2026-05-30",true],
 ["2026-05-31",false],["2026-06-04",true],["2026-06-05",false],
 ["2026-10-28",false]
];
for(const [date,alleluia] of dates){
 const st=benedictionAlleluiaStatus(date);
 assert.equal(st.known,true,"Liturgical context for "+date);
 assert.equal(st.alleluia,alleluia,"Alleluia calendar exception "+date);
 const text=benedictionVersiclesForDate(verses,date);
 for(const locale of ["en","fr","la"]){
  assert.equal((text[locale].match(/allel(?:u|ú|élu)ia/gi)||[]).length,alleluia?2:0,locale+" date "+date);
  assert.ok(text[locale].includes(verses[locale].split("\n\n")[1]),"Collect unchanged in "+locale);
 }
}
assert.equal(benedictionAlleluiaStatus("invalid").known,false);
assert.equal(benedictionAlleluiaStatus("2026-02-30").known,false);
assert.ok(!benedictionVersiclesForDate(verses,"invalid").context.alleluia);
for(const value of Object.values(CHRIST_KING_OPTION_DEFAULTS))assert.equal(value,false,"Local ceremonies must be opt-in");
const ordinary=[["exposition"],["adoration"],["hymn"],["prayer"],["blessing"],["praises"],["reposition"]];
assert.equal(christKingStages(ordinary,"christKing").length,7,"No local rites presumed");
assert.equal(christKingStages(ordinary,"christKing",{...CHRIST_KING_OPTION_DEFAULTS,procession:true}).length,8);
assert.equal(CHRIST_KING_LAUDES_SECTIONS.length,4,"Historical Royal Praises preserved");

assert.deepEqual(Object.keys(ROSARY_METHODS).filter(x=>x!=="clausules"),
 ["ordinary","dominican","montfort","montfort_short","scriptural"]);
assert.equal(rosaryPlan({method:"ordinary",decades:15}).readyForLive,true);
assert.equal(rosaryPlan({method:"montfort_short",decades:15}).readyForLive,false);
assert.ok(ROSARY_METHODS.scriptural.source.includes("rosary-guided-bead-evidence"));
assert.ok(ROSARY_METHODS.scriptural.laterCommentarySource.includes("2002"));
assert.equal(divineMercySteps().length,62);
assert.equal(divineMercySteps({includeClosing:true}).length,63);
assert.equal(divineMercySteps().filter(x=>x.key==="invocation").length,50);
assert.equal(divineMercySteps().filter(x=>x.key==="trisagion").length,3);
assert.equal(MERCY_OPTIONAL_OPENINGS.length,2);
assert.deepEqual(MERCY_OPTIONAL_OPENINGS.map(x=>x.diary),["Diary 1319","Diary 84"]);
assert.ok(MERCY_OPTIONAL_OPENINGS.every(x=>x.kind==="optional-before-chaplet"&&x.rights==="MODERN_TRANSLATION_REUSE_PENDING"));

assert.equal(EUCHARISTIC_WITNESS_IDS.length,3);
assert.equal(EUCHARISTIC_WITNESSES.length,3);
const pange=getEucharisticWitness("eucharistic_pange_lingua_full",
 {tantum:PRAY_CANONICAL_DATA_V435930.prayers.benediction_tantum_ergo});
assert.equal(pange.complete,true);
assert.match(pange.la,/Pange, lingua, gloriosi/);
assert.match(pange.la,/Tantum ergo/);
assert.equal(pange.completeStanzas,6);
const lauda=getEucharisticWitness("eucharistic_lauda_sion_full");
assert.equal(lauda.completeStanzas,24);
assert.match(lauda.la,/Bone pastor/);
assert.equal(lauda.category,"corpus-christi-mass-sequence");
assert.equal(getEucharisticWitness("eucharistic_o_sacrum_convivium").category,"corpus-christi-office-antiphon");
assert.equal(EUCHARISTIC_SOURCE.rights.includes("public domain"),true);
assert.ok(EUCHARISTIC_WITNESSES.every(x=>x.languages.en==="NOT_PUBLISHED"&&x.languages.fr==="NOT_PUBLISHED"));
assert.equal(instituteOptionalFor("benediction-optional-local").length,3);
assert.equal(instituteOptionalFor("adoration-optional").length,4);
assert.ok(BATCH02_INSTITUTE_OPTIONAL.every(x=>x.source.startsWith("https://")&&x.rights));

assert.equal(FORTY_HOURS_SOLEMN_STAGES.length,9);
assert.deepEqual([...new Set(FORTY_HOURS_SOLEMN_STAGES.map(x=>x.day))],[1,2,3]);
assert.equal(fortySolemnAt(0).id,"day1-arrival");
assert.equal(fortySolemnAt(100).id,"day3-benediction");
assert.ok(FORTY_HOURS_SOLEMN_STAGES.every(x=>x.source===FORTY_HOURS_SOLEMN_SOURCE.institute));
assert.equal(FORTY_HOURS_SOLEMN_STAGES.some(x=>x.bodyEn.includes("private Litany")) ,true);
const runtime=read("src/pray/presentation-runtime.js");
for(const m of [
 "function renderFortySolemn()","data-ao-forty-mode=\"solemn\"",
 "data-p435930-forty-mode=\"visitor\"","data-p435930-forty-mode=\"solemn\"",
 "data-p435930-forty-solemn-jump","data-p435930-forty-ben",
 "function eucharisticWitnessTreasury()","data-ao-eucharistic-witness=",
 "MERCY_OPTIONAL_OPENINGS.map","data-ao-mercy-opening-options",
 "batch02SourceLinks('benediction-optional-local')",
 "benedictionVersiclesForDate(P('benediction_versicles'),selectedDateKey())",
 "benFeastOptions()","CHRIST_KING_OPTION_DEFAULTS",
 "method==='montfort_short'","method==='scriptural'"
])assert.ok(runtime.includes(m),"Missing existing-reader integration "+m);
assert.ok(!runtime.includes("BENEDICTION_OPTION_DEFAULTS_LEGACY"),"Do not introduce second Benediction owner");
console.log("PASS Batch 2 prayer integrity, seasonal Benediction, local options, 3-day Forty Hours, Mercy counts, Latin Eucharistic editions and runtime syntax");
