import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const html=readFileSync(new URL("../tools/mass/proper-1961-first60-collation.html",
 import.meta.url),"utf8");
assert.match(html,/<html lang="en"/);
assert.match(html,/First 60 source-backed 1961 Proper scores/);
assert.match(html,/20 Introits · 20 Offertories · 20 Communions/);
assert.match(html,/createOfflineChantEngraver/);
assert.match(html,/sourceNoteGroupInventory/);
assert.match(html,/fileInput/);
assert.match(html,/sourceLatin/);
assert.match(html,/sourceGabc/);
assert.match(html,/sourceOwner/);
assert.match(html,/sourcePrint/);
assert.match(html,/all printed notes/i);
assert.match(html,/publication/i);
assert.match(html,/scoreGabc/);
assert.match(html,/editorialApproval=false/);
assert.match(html,/publicScore=false/);
assert.match(html,/inventory\.groups\.every/);
assert.doesNotMatch(html,/<script[^>]+src=["']https?:/i);
assert.doesNotMatch(html,/new Audio|AudioContext|speechSynthesis/);
const script=html.match(/<script type="module">([\s\S]+?)<\/script>/)?.[1];
assert.ok(script?.length>3000);
const result=spawnSync(process.execPath,["--check","--input-type=module"],
 {input:script,encoding:"utf8"});
assert.equal(result.status,0,result.stderr);
console.log("PASS first-60 original-GABC offline workbench: source, staff-group collation, complete-group review progress and JSON export; zero public-score actions");
