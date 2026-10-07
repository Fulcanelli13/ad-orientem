import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { NOVENA_CORPUS_V3 } from "../src/pray/novena-corpus.js";

const expected=[
  "holy_ghost","christmas","corpus_christi","sacred_heart",
  "immaculate_conception","annunciation","assumption","seven_sorrows",
  "st_joseph","holy_souls","perpetual_help","st_therese"
];
assert.deepEqual(Object.keys(NOVENA_CORPUS_V3),expected,"N3 corpus identity/order changed");
for(const id of expected){
  const n=NOVENA_CORPUS_V3[id];
  assert.equal(n.id,id,id+" identity changed");
  assert.equal(n.days.length,9,id+" no longer has exactly nine days");
  assert.ok(n.title?.en&&n.title?.fr,id+" lost bilingual title");
  assert.ok(n.calendar?.precision,id+" lost calendar authority metadata");
  assert.ok(n.source?.work&&n.source?.url,id+" lost source provenance");
}
const runtime=readFileSync("src/pray/novena-runtime.js","utf8");
const styles=readFileSync("src/pray/novena-styles.js","utf8");
const browser=readFileSync("src/pray/browser-entry.js","utf8");
const assets=readFileSync("src/assets/asset-registry.js","utf8");

assert.match(runtime,/43\.59\.33-guided-novenas-n3/);
assert.match(runtime,/pray\.novenas/,"Novenas route is not registered");
assert.match(runtime,/data-n1-mode/,"Guided\/Simple control disappeared");
assert.match(runtime,/class="aoP435930Back" data-n1-back/,"Novena header lost donor Back control");
assert.match(runtime,/class="aoP435930Close" data-n1-close/,"Novena header lost donor Close control");
assert.match(runtime,/data-ao-inline-asset-id="ao-ui-back"/,"Novena header lost canonical Back utility artwork");
assert.match(runtime,/data-ao-inline-asset-id="ao-ui-close"/,"Novena header lost canonical Close utility artwork");
assert.match(runtime,/noCompletionTracking:true/,"N3 privacy rule for completion tracking changed");
assert.match(runtime,/noIntentStorage:true/,"N3 privacy rule for intentions changed");
assert.match(runtime,/FAIL_CLOSED_EXPLICIT_EN_WITNESS_OPTION/,"historical French witness policy changed");
assert.match(runtime,/calendarStatus/,"calendar-aware Novena status disappeared");
assert.match(runtime,/novenaStatusFor/,"Novenas stopped consuming the shared Calendar intelligence date semantics");
assert.doesNotMatch(runtime,/function easter\(/,"Novenas reintroduced a private Easter calculator");
assert.doesNotMatch(runtime,/function windowFor\(/,"Novenas reintroduced private novena date-window logic");
assert.match(runtime,/canonicalReuse:\{ourFather:true,hailMary:true,gloryBe:true,loreto1962:true\}/,"canonical prayer reuse contract changed");
assert.match(styles,/aoN1Hero/);
assert.match(styles,/aoN1StageRail/);
assert.match(browser,/import "\.\/novena-runtime\.js";/,"PRAY browser owner no longer installs Novenas N3");
assert.match(assets,/"pray\.novenas"\s*:\s*"ao-rich-novenas"/,"Novenas lost canonical V4 asset identity");

console.log("PASS exact Guided Novenas N3 modular extraction");
