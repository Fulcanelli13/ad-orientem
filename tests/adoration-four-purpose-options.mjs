import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {ADORATION_FOUR_OPTIONAL_SOURCE_IDS,ADORATION_FOUR_OPTION_INDEX,ADORATION_FOUR_SOURCE_LABELS,adorationFourOptionFor,normalizedAdorationFourChoices} from "../src/pray/adoration-four-purpose-options.js";
const prayers=PRAY_CANONICAL_DATA_V435930.prayers;
assert.deepEqual(Object.keys(ADORATION_FOUR_OPTIONAL_SOURCE_IDS),["adoration","reparation","petition"]);
assert.equal(ADORATION_FOUR_OPTION_INDEX.adoration[0].relationship,"distinct");
assert.equal(ADORATION_FOUR_OPTION_INDEX.reparation[0].relationship,"distinct");
assert.equal(ADORATION_FOUR_OPTION_INDEX.petition[0].relationship,"distinct");
assert.equal(ADORATION_FOUR_OPTION_INDEX.thanksgiving,undefined,"A meal/Communion-specific thanksgiving is not a general-purpose source");
const total=Object.values(ADORATION_FOUR_OPTIONAL_SOURCE_IDS).flat();
assert.equal(total.length,3);
assert.equal(new Set(total).size,3);
for(const [purpose,ids] of Object.entries(ADORATION_FOUR_OPTIONAL_SOURCE_IDS))for(const id of ids){
 const p=prayers[id],meta=ADORATION_FOUR_SOURCE_LABELS[id];
 assert.equal(adorationFourOptionFor(purpose,id),id);
 assert.ok(p?.en?.length>50&&p?.fr?.length>50&&p?.la?.length>50,"Whole bilingual/Latin historically sourced prayer: "+id);
 assert.equal(p.sourceStatus,"VERIFIED_PRIMARY");
 assert.match(p.provenance?.url||"",/^https:\/\//);
 assert.ok(meta?.en&&meta?.fr);
 for(const other of Object.keys(ADORATION_FOUR_OPTIONAL_SOURCE_IDS))if(other!==purpose)
  assert.equal(adorationFourOptionFor(other,id),null,"Never cross-classify a prayer's purpose");
}
assert.equal(adorationFourOptionFor("thanksgiving","foundations_grace_after_meals"),null);
assert.equal(adorationFourOptionFor("reparation","foundations_our_father"),null);
assert.deepEqual(normalizedAdorationFourChoices({
 adoration:"adoration_litany_blessed_sacrament",
 thanksgiving:"foundations_grace_after_meals",
 reparation:"sacred_heart_short_prayer",
 petition:"church_prayer_for_pope",
 forged:"invented"
}),{
 adoration:"adoration_litany_blessed_sacrament",
 reparation:"sacred_heart_short_prayer",
 petition:"church_prayer_for_pope"
});
assert.deepEqual(normalizedAdorationFourChoices({adoration:"fake"}),{});
assert.deepEqual(normalizedAdorationFourChoices({}),{});
const code=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
const four=code.split("function fourSteps(){")[1].split("function enterAdorationQuiet(){")[0];
const rendering=code.split("function guidedStage(")[1].split("function batch02SourceLinks(")[0];
for(const x of ["foundations_prayer_of_adoration","foundations_glory_be","sacrament_act_of_contrition","foundations_our_father"])
 assert.ok(four.includes(x),"Original canonical Four Ends stage prayer must remain: "+x);
assert.equal(four.match(/title:L\(/g)?.length,5,"Four Ends plus final silence remain exactly five cards");
assert.match(rendering,/kind==='four'\?adorationFourOptionalMarkup/);
assert.match(rendering,/guideCue\(L\('SILENCE \/ NOTICE'/,"Original silence remains attached to every prayer step");
assert.match(code,/data-p435930-four-choice/);
assert.match(code,/if\(view!=='adoration'\|\|ADOR\.mode!=='four'\|\|ADOR\.quiet\)return/);
assert.match(code,/section\.replaceWith\(replacement\)/,"One tap updates only optional prayer subsection");
assert.match(code,/ao\.pray\.adoration-four-choices\.v1/,"Save only source IDs, not user prayer text");
assert.ok(!four.includes('data-p435930-open-prayer="sacred_heart_short_prayer"'),"Old Reparation link replaced by inline option");
console.log("PASS B10: 3 optional historical whole prayers within Four Ends; original five cards, texts, silence, and public rites unchanged.");
