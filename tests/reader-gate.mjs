import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  READER_UI_MODES,
  resolveReaderUiMode,
  readerModeAllowsLegacyDom,
  readerModeRunsShadowAudit,
  readerModeMountsPreview,
} from "../src/mass/reader-gate.js";
import {
  READER_PARITY_REQUIREMENTS,
  auditSelectorPresence,
} from "../src/mass/reader-parity.js";

assert.deepEqual([...READER_UI_MODES],["NATIVE"]);
for(const input of [
  {},
  {stored:"legacy"},
  {stored:"shadow"},
  {stored:"preview"},
  {search:"?aoR17Reader=shadow",stored:"legacy"},
  {search:"?aoR17Reader=legacy"},
  {search:"?aoR17Reader=r17"},
  {search:"?aoR17Reader=unknown",stored:"legacy"},
]){
  assert.equal(resolveReaderUiMode(input),"NATIVE","historical reader selector regained production authority");
}
for(const mode of ["NATIVE","LEGACY","SHADOW","rollback","preview",null]){
  assert.equal(readerModeAllowsLegacyDom(mode),false,"legacy DOM became selectable");
  assert.equal(readerModeRunsShadowAudit(mode),false,"shadow renderer became selectable");
  assert.equal(readerModeMountsPreview(mode),true,"native renderer stopped being the sole production mount");
}
const browserEntrySource=readFileSync(new URL("../src/mass/browser-entry.js",import.meta.url),"utf8");
assert.doesNotMatch(browserEntrySource,/\.startLive\s*\(/,
  "production Mass entry can still start a historical renderer");
assert.doesNotMatch(browserEntrySource,/runReaderShadowAudit/,
  "production Mass entry still imports or runs the historical shadow renderer");

const requiredSelectors=READER_PARITY_REQUIREMENTS.filter(x=>x.required).map(x=>x.selector);
const allPresent=new Set(requiredSelectors);
const pass=auditSelectorPresence(sel=>allPresent.has(sel));
assert.equal(pass.complete,true);
assert.equal(pass.passed,pass.required);
assert.deepEqual([...pass.missing],[]);

const oneMissing=new Set(requiredSelectors.filter(sel=>sel!=="#scholaDock"));
const fail=auditSelectorPresence(sel=>oneMissing.has(sel));
assert.equal(fail.complete,false);
assert.deepEqual([...fail.missing],["schola-dock"]);

console.log("reader gate/parity contract: PASS — one definitive native production owner.");
