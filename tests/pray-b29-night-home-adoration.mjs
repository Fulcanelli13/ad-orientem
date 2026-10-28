import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NIGHT_HOME_B29_SOURCE,NIGHT_HOME_B29_STAGES,nightHomeStage,nightHomeAsGuided} from "../src/pray/night-home-adoration-b29.js";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {internalPrayerView} from "../src/pray/internal-route-owner.js";
const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
const ui=read("../src/pray/presentation-runtime.js");
const css=read("../src/pray/night-home-adoration-styles-b29.js");
const ledger=JSON.parse(read("../data/pray/pray-b29-night-home-adoration-admission.v1.json"));
assert.equal(NIGHT_HOME_B29_SOURCE.candidateId,"AO-AQ-066");
assert.equal(NIGHT_HOME_B29_SOURCE.programmeId,"adoration.night_home");
assert.equal(NIGHT_HOME_B29_SOURCE.historicalCorrespondence.length,2);
assert.equal(NIGHT_HOME_B29_SOURCE.historicPattern.historicDurationMinutes,60);
assert.equal(NIGHT_HOME_B29_SOURCE.historicPattern.customaryNightStart,"21:00");
assert.equal(NIGHT_HOME_B29_SOURCE.historicPattern.customaryNightEnd,"06:00");
assert.equal(NIGHT_HOME_B29_SOURCE.historicPattern.bindingOnPainOfSin,false);
assert.equal(NIGHT_HOME_B29_SOURCE.historicPattern.requiresEnrollmentToUseReader,false);
assert.equal(NIGHT_HOME_B29_SOURCE.originalPrintedPagePhotographicallyCollated,false);
assert.equal(NIGHT_HOME_B29_SOURCE.longHistoricalBookletTextReproduced,false);
assert.equal(NIGHT_HOME_B29_SOURCE.currentIndulgenceStatus,"NOT_VERIFIED_OR_CLAIMED");
assert.match(NIGHT_HOME_B29_SOURCE.context,/not Eucharistic exposition/i);
assert.equal(NIGHT_HOME_B29_STAGES.length,6);
assert.deepEqual(NIGHT_HOME_B29_STAGES.map(x=>x.id),["prepare","union","reparation","family","communion","close"]);
assert.deepEqual(NIGHT_HOME_B29_STAGES.map((x,i)=>nightHomeStage(i)?.id),NIGHT_HOME_B29_STAGES.map(x=>x.id));
assert.equal(nightHomeStage(-1),null);
assert.equal(nightHomeStage(6),null);
const en=nightHomeAsGuided("en"),fr=nightHomeAsGuided("fr");
assert.equal(en.length,6);assert.equal(fr.length,6);
assert.equal(fr[1].title,"S’unir au Christ");
for(let i=0;i<6;i++){
 assert.equal(en[i].id,fr[i].id);
 assert.equal(en[i].title,NIGHT_HOME_B29_STAGES[i].title.en);
 assert.equal(fr[i].title,NIGHT_HOME_B29_STAGES[i].title.fr);
 assert.ok(en[i].now.length>80&&fr[i].now.length>80,"Bilingual stage guidance substantive");
 assert.ok(en[i].silence&&fr[i].silence);
 assert.ok(en[i].prayers.length>0);
 assert.ok(en[i].prayers.length===fr[i].prayers.length);
 for(const prayer of en[i].prayers){
  const p=PRAY_CANONICAL_DATA_V435930.prayers[prayer.id];
  assert.ok(p&&p.en&&p.fr,"Reuse existing bilingual canonical source "+prayer.id);
 }
}
assert.equal(en[2].prayers.find(x=>x.id==="sacred_heart_short_prayer")?.id,"sacred_heart_short_prayer");
assert.equal(en[4].prayers[0].id,"adoration_spiritual_communion");
assert.deepEqual(en[3].prayers.map(x=>x.id),["foundations_our_father","foundations_hail_mary","foundations_glory_be"]);
assert.match(NIGHT_HOME_B29_STAGES[3].now.en,/five Our Fathers, five Hail Marys and five Glory Bes/);
assert.match(NIGHT_HOME_B29_STAGES[1].now.en,/not recitation of the priest/);
assert.match(NIGHT_HOME_B29_STAGES[0].silence.en,/not sacramentally present in the picture/);
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48);
assert.equal(NOVENA_CORPUS_V4_IDS.length,16);
assert.equal(internalPrayerView("pray.adoration"),"adoration");
assert.equal(internalPrayerView("adoration.night_home"),null,"Do not introduce new top-level programme routing");
assert.equal(ledger.existingParentRoute,"pray.adoration");
assert.equal(ledger.historicalOriginalTextReproduced,false);
assert.equal(ledger.canonicalPrayersChanged,0);
for(const token of [
 'data-p435930-ador-mode="night"','if(ADOR.mode===\'night\')',
 'data-ao-home-night="fr-mateo"',"guidedStage('night',steps,ADOR.nightStep",
 "adorationTimerDisclosure()","data-ao-night-home-source",
 "if(view==='adoration'&&['visit','holy','four','night'].includes(ADOR.mode))",
 "else if(mode==='night')ADOR.nightStep=i",
 "data-p435930-night-finish",
 "NIGHT_HOME_B29_SOURCE.onlineWitness",
 "No membership","not the reserved sacrament",
 "nightHomeAsGuided(lang())"
])assert.ok(ui.toLowerCase().includes(token.toLowerCase()),"B29 reader integration missing: "+token);
assert.match(ui,/No monthly hour is compulsory/);
assert.match(ui,/an image of the Sacred Heart/i);
assert.match(ui,/no membership/i);
assert.match(css,/max-width:350px/);
assert.match(css,/prefers-reduced-motion/);
assert.match(css,/min-height:48px/);
assert.equal(ledger.historicalIndulgencesClaimedAsCurrent,false);
assert.equal(ledger.historicalNightPatternEnforcedByTimer,false);
console.log("PASS B29: six source-directed private-home stages, 48/16 unchanged, no Eucharistic presence simulation, no indulgence or membership claim, real bilingual canonical reuse");
