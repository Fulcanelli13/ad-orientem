import assert from "node:assert/strict";
import {
  resolveReaderUiMode,
  readerModeAllowsLegacyDom,
  readerModeRunsShadowAudit,
  readerModeMountsPreview,
} from "../src/mass/reader-gate.js";
import {
  READER_PARITY_REQUIREMENTS,
  auditSelectorPresence,
} from "../src/mass/reader-parity.js";

assert.equal(resolveReaderUiMode({}), "PREVIEW");
assert.equal(resolveReaderUiMode({stored:"shadow"}), "SHADOW");
assert.equal(resolveReaderUiMode({stored:"preview"}), "PREVIEW");
assert.equal(resolveReaderUiMode({stored:"legacy"}), "LEGACY");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=shadow",stored:"preview"}), "SHADOW");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=r17"}), "PREVIEW");
assert.equal(resolveReaderUiMode({search:"?aoR17Reader=unknown",stored:"preview"}), "PREVIEW");

for (const mode of ["LEGACY","SHADOW","PREVIEW"]) assert.equal(readerModeAllowsLegacyDom(mode), true);
assert.equal(readerModeRunsShadowAudit("LEGACY"), false);
assert.equal(readerModeRunsShadowAudit("SHADOW"), true);
assert.equal(readerModeRunsShadowAudit("PREVIEW"), true);
assert.equal(readerModeMountsPreview("PREVIEW"), true);
assert.equal(readerModeMountsPreview("SHADOW"), false);

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

console.log("reader gate/parity contract: PASS");
