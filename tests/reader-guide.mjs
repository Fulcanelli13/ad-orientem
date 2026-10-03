import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateGuideRegistry, guideForSequence, guideForKey } from "../src/mass/reader-guide.js";

const registry=JSON.parse(readFileSync(new URL("../data/presentation/guide-registry.v1.json",import.meta.url),"utf8"));
validateGuideRegistry(registry);

assert.equal(registry.entryCount,32);
assert.equal(Object.keys(registry.entries).length,32);
assert.equal(registry.status,"RECOVERED_CONTINUITY_CERTIFIED");

for(let i=1;i<=30;i++){
  const key="AO.CARD."+String(i).padStart(3,"0");
  const g=guideForSequence(registry,i);
  assert.equal(g.key,key);
  assert.ok(g.text.length>0);
  assert.ok(g.detail.length>g.text.length);
  assert.ok(g.sourceLine.length>0);
  assert.ok(g.sourceLinks.length>0);
}

assert.equal(guideForSequence(registry,0),null);
assert.equal(guideForSequence(registry,31),null);
assert.equal(guideForKey(registry,"AO.OVERLAY.ASP.001").key,"PRE.ASPERGES");
assert.equal(guideForKey(registry,"POST.MASS").key,"POST.MASS");
assert.equal(registry.entries["PRE.ASPERGES"].profile,"PRE_MASS");
assert.equal(registry.entries["POST.MASS"].profile,"POST_MASS");

console.log("Guide registry: PASS — 32 recovered entries, 30 Ordinary sequence bindings, Asperges alias and post-Mass lifecycle.");
