// Test-only static contract: no network, no mock response, no disabled check.
// The live anonymous phone smoke must target the canonical Pages project URL
// and still assert HTTP 200. Prevent accidental return to Vercel hosting.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const read=path=>readFileSync(new URL(path,root),"utf8");
const test=read("tests/mass-reader-production-phone-smoke.mjs");
const workflow=read(".github/workflows/mass-production-phone-smoke.yml");
const emergency=read(".github/workflows/nov1-mass-emergency-acceptance.yml");
assert.match(test,/const PAGES_PUBLIC_URL="https:\/\/fulcanelli13\.github\.io\/ad-orientem\/";/);
assert.match(test,/origin\.href!==PAGES_PUBLIC_URL/,"Require exact host and project path");
assert.match(test,/process\.env\.AO_PAGES_URL/,"Allow Pages job to supply deployed URL");
assert.match(test,/assert\.equal\(response\?\.status\(\),200/,"Do not skip public HTTP-200 check");
assert.match(test,/page\.goto\(origin\.href/,"Smoke must navigate canonical Pages project URL");
assert.doesNotMatch(test,/https:\/\/ad-orientem\.vercel\.app/,"No retired production target");
assert.match(workflow,/AO_PAGES_URL: https:\/\/fulcanelli13\.github\.io\/ad-orientem\//);
assert.match(workflow,/node tests\/mass-reader-production-pages-contract\.mjs/);
assert.match(emergency,/node tests\/mass-reader-production-phone-smoke\.mjs/,
 "Nov 1/Sunday reader gate must continue running real production browser test");
assert.match(test,/"MISSA_CANTATA_INCENSE"/);
assert.match(test,/"SOLEMN"/);
assert.match(test,/"LOW"/);
assert.match(test,/"fr"/);
assert.match(test,/"en"/);
console.log("PASS Mass production phone accepts only GitHub Pages, retains three forms, EN/FR, 320/390px HTTP+browser checks");
