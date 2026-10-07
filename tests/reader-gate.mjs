import assert from "node:assert/strict";
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

assert.equal(resolveReaderUiMode({}), "NATIVE");
assert.equal(resolveReaderUiMode({stored:"legacy"}), "NATIVE");
assert.equal(resolveReaderUiMode({stored:"shadow"}), "NATIVE");
assert.equal(resolveReaderUiMode({stored:"preview"}), "NATIVE");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=shadow",stored:"legacy"}), "NATIVE");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=legacy"}), "NATIVE");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=r17"}), "NATIVE");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=unknown",stored:"legacy"}), "NATIVE");

for(const historical of ["NATIVE","LEGACY","SHADOW","rollback","legacy","shadow"]){
  assert.equal(readerModeAllowsLegacyDom(historical), false);
  assert.equal(readerModeRunsShadowAudit(historical), false);
  assert.equal(readerModeMountsPreview(historical), true);
}

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

console.log("reader gate/parity contract: PASS — native is the only executable Mass renderer.");
