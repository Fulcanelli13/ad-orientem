import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The native 433-question controller was extracted from index.html into an
// immutable classic-script asset by the thin-shell refactor. The test must
// follow the current parser-order manifest, not require an obsolete inline copy.
const read = path => readFileSync(path, "utf8");
const html = read("index.html");
const manifest = JSON.parse(read("data/presentation/startup-thin-shell.v1.json"));
const nativeControllers = manifest.entries
  .filter(entry => entry.tag === "script")
  .filter(entry => /\b(?:window|globalThis)\.AO_TRADITIONAL_CATECHISM\s*=\s*\{/.test(read(entry.path)));
assert.equal(nativeControllers.length, 1, "Exactly one native Catechism controller must own question navigation");
const controller = nativeControllers[0];
const source = read(controller.path);
assert.match(source, /window\.AO_TRADITIONAL_CATECHISM\s*=\s*\{open:openCate/);
assert.match(source, /openQuestion\s*:\s*\(n\)\s*=>\s*\{const x=getQ\(n\);if\(!x\)return false;state\.detail=Number\(n\)/);
assert.match(source, /render\(\);return true\}/, "Native question handoff must render the opened Q&A");
assert.match(html, /['"]ao-cate-root['"]/);

const packed = manifest.pack?.entries?.find(entry => entry.source === controller.path);
if (packed) {
  const packFile = manifest.pack.file;
  assert.ok(packFile && manifest.pack.unpacked?.every(path => path !== controller.path));
  assert.ok(html.includes('src="./' + packFile + '"'), "The classic-script pack must load in the shell");
  assert.ok(html.includes('AO_INLINE_PACK_V1[' + packed.position + '].call(globalThis)'), "The native controller must be invoked at its original parser position");
} else {
  assert.ok(html.includes('src="./' + controller.path + '"'), "The native controller must be linked from the shell");
}

const bridge = read("src/learn/catechism-guided-preview-bridge.js");
assert.ok(bridge.includes("openNativeCatechismQuestion(win, number, lang)"));
assert.ok(!bridge.includes("link.click()"), "No simulated navigation or automatic external redirects");
console.log(JSON.stringify({ status: "PASS", legacyQuestionNavigator: "AO_TRADITIONAL_CATECHISM.openQuestion", asset: controller.path, packed: Boolean(packed), route: "learn.catechism", publicPublicationGate: "fail-closed" }));
