import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {openNativeCatechismQuestion} from "../src/learn/catechism-guided-reader.js";
// The packed legacy Catechism is now loaded via AO_INLINE_PACK_V1[2],
// not verbatim inline in index.html. Its live contract is covered by
// tests/catechism-guided-mode-e2e.mjs.
const html=readFileSync("index.html","utf8");
assert.match(html,/ao-traditional-catechism-v6-js/);
assert.match(html,/AO_INLINE_PACK_V1\[2\]/);
assert.match(html,/ao-cate-root/);
const bridge=readFileSync("src/learn/catechism-guided-preview-bridge.js","utf8");
assert.ok(bridge.includes("openNativeCatechismQuestion(win, number, lang)"));
assert.ok(!bridge.includes("link.click()"));
const calls=[];
const api={openQuestion:n=>(calls.push(n),n===213)};
assert.equal(await openNativeCatechismQuestion({AO_TRADITIONAL_CATECHISM:api},213),true);
assert.deepEqual(calls,[213]);
assert.equal(await openNativeCatechismQuestion({AO_TRADITIONAL_CATECHISM:api},434),false);
console.log(JSON.stringify({status:"PASS",source:"packed legacy Catechism",nativeQuestion:213,publicationGate:"unchanged"}));
