import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { READER_UI_MODES, resolveReaderUiMode } from "../src/mass/reader-gate.js";

const ledger=JSON.parse(readFileSync("data/presentation/mass-definitive-presentation.v1.json","utf8"));
const dom=readFileSync("src/mass/reader-dom.js","utf8");
const entry=readFileSync("src/mass/browser-entry.js","utf8");

assert.equal(ledger.schema,"ao-mass-definitive-presentation-v1");
assert.equal(ledger.production.presentationOwner,"src/mass/reader-dom.js");
assert.equal(ledger.production.mountOwner,"src/mass/reader-native-preview.js");
assert.deepEqual([...READER_UI_MODES],["NATIVE"]);
for(const input of [{},{stored:"legacy"},{stored:"shadow"},{search:"?aoR17Reader=legacy"},{search:"?aoR17Reader=shadow"}]){
  assert.equal(resolveReaderUiMode(input),"NATIVE");
}
assert.equal(existsSync("src/mass/reader-preview.js"),false,"obsolete mirror reader returned");
assert.equal(existsSync("src/mass/reader-shadow.js"),false,"obsolete shadow reader returned");
assert.doesNotMatch(entry,/\.startLive\s*\(/,"browser entry can still start a second Mass renderer");
assert.doesNotMatch(entry,/runReaderShadowAudit/,"browser entry can still start a shadow layer");

for(const [fragment,label] of [
  ["width:min(100%,820px)","donor app-width lock"],
  ["max-width:150px","donor mode-width lock"],
  ["width:min(100%,690px)","donor reading-column lock"],
  ["border:0;border-radius:0","borderless donor reader field"],
  ["width:min(calc(100% - 28px),700px)","donor Schola width"],
  ["opacity:.34","focus future opacity"],
  ["opacity:.43","focus forward-2 opacity"],
  ["opacity:.62","focus forward-1 opacity"],
  ["opacity:.47","focus back-1 opacity"],
  ["opacity:.36","focus back-2 opacity"],
]){
  assert.ok(dom.includes(fragment),label+" is no longer represented in the canonical Mass stylesheet");
}
assert.match(dom,/\.ao-reader-paragraph\[data-active="true"\][\s\S]*?opacity:1/,"current focus lost full salience");

console.log("Mass definitive presentation contract PASS: one native owner and donor geometry/focus locks are encoded in the canonical stylesheet.");
