import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PRAY_CANONICAL_DATA_V435930 } from "../src/pray/canonical-data.js";
import { directChildAnchor } from "../src/pray/dom-anchor.js";

const prayers=PRAY_CANONICAL_DATA_V435930?.prayers??{};
assert.equal(Object.keys(prayers).length,48,"locked v43.59.30 corpus must contain exactly 48 prayer records");
assert.ok(prayers.sacrament_act_of_contrition,"Act of Contrition missing from canonical PRAY corpus");
assert.ok(prayers.litany_loreto_1962,"1962 Litany of Loreto missing from canonical PRAY corpus");

const runtime=readFileSync("src/pray/presentation-runtime.js","utf8");
const coherence=readFileSync("src/pray/presentation-coherence.js","utf8");
const styles=readFileSync("src/pray/presentation-styles.js","utf8");
assert.match(runtime,/43\.59\.30-pray-acceptance/);
assert.match(runtime,/AO_PRAY_V435930/);
assert.match(coherence,/aoPrayerBookRoot/);
assert.match(coherence,/aoPray435930/);
assert.match(styles,/ao-v435930-pray-audit-style/);
assert.match(styles,/ao-v435930-pray-coherence-style/);
for(const id of ["ao-ui-back","ao-ui-close","ao-ui-next","ao-ui-search"]){
  assert.match(runtime,new RegExp(id),"PRAY lost canonical V4 control: "+id);
}
assert.doesNotMatch(runtime,/>←<|>← |>×<|>→<|>⌕</,"PRAY regressed to raw Unicode navigation/search controls");
assert.match(styles,/aoP435930ModuleCard i \.aoP435930UiIcon/,"PRAY module-card canonical chevrons lost explicit touch-visible geometry");

const body={parentNode:null};
const direct={parentNode:body};
const nested={parentNode:direct};
assert.equal(directChildAnchor(body,direct),direct,"direct PRAY card insertion anchor changed");
assert.equal(directChildAnchor(body,nested),direct,"nested PRAY card did not resolve to a direct body child");
assert.equal(directChildAnchor(body,{parentNode:null}),null,"foreign PRAY node incorrectly became an insertion anchor");

console.log("PASS locked v43.59.30 PRAY presentation extraction");
