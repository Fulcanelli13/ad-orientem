import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
// The historical Catechism controller is embedded in the monolithic HTML.
// Assert the native API exists, rather than maintain a second question navigator.
const html=readFileSync("index.html","utf8");
assert.match(html,/window\.AO_TRADITIONAL_CATECHISM\s*=\s*\{open:openCate/);
assert.match(html,/openQuestion\s*:\s*\(n\)\s*=>/);
assert.match(html,/openQuestion\s*:\s*\(n\)\s*=>\s*\{const x=getQ\(n\);if\(!x\)return false;state\.detail=Number\(n\)/);
assert.match(html,/['"]ao-cate-root['"]/);
const bridge=readFileSync("src/learn/catechism-guided-preview-bridge.js","utf8");
assert.ok(bridge.includes("openNativeCatechismQuestion(win, number, lang)"));
assert.ok(!bridge.includes("link.click()"),"No fake native navigation or automatic external source redirects");
console.log(JSON.stringify({status:"PASS",legacyQuestionNavigator:"AO_TRADITIONAL_CATECHISM.openQuestion",route:"learn.catechism",publicPublicationGate:"fail-closed"}));
