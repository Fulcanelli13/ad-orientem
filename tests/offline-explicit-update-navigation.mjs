// P0 regression: an explicitly activated snapshot must be served on
// navigation even when the old tab remains pinned to an older release.
// Exercise the actual service-worker pinnedVersion function in isolation.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
const body=sw.match(/async function pinnedVersion\(event\)\{[\s\S]*?\n\}/)?.[0];
assert.ok(body,"Actual worker navigation selection must be independently testable");
const clients=new Map([["old-document","old-v1"]]);
let active="new-v2";
const candidate=new Function("liveClients","readState","validVersion",
 body+";return pinnedVersion;");
const choose=candidate(clients,async()=>({active}),async version=>
 ["old-v1","new-v2"].includes(version));
assert.equal(await choose({request:{mode:"same-origin"},clientId:"old-document"}),"old-v1",
 "Old in-progress document must retain its earlier snapshot");
assert.equal(await choose({request:{mode:"navigate"},clientId:"old-document",
 resultingClientId:"new-document"}),"new-v2",
 "The Update button's navigation must not reuse the old client's pinned HTML");
assert.equal(clients.get("new-document"),"new-v2",
 "New assets must remain bound to the newly activated release");
assert.equal(await choose({request:{mode:"same-origin"},clientId:"new-document"}),"new-v2");
assert.equal(await choose({request:{mode:"navigate"},clientId:"old-document"}),
 "new-v2","Navigation without resultingClientId must still use active release");
assert.equal(await choose({request:{mode:"same-origin"},clientId:"old-document"}),"old-v1");
active="old-v1";
assert.equal(await choose({request:{mode:"navigate"},clientId:"new-document",
 resultingClientId:"third-document"}),"old-v1",
 "Navigation always follows the explicit active snapshot rather than stale pins");
assert.match(sw,/m\.type==="USE_SNAPSHOT"/);
assert.match(sw,/saveState\(\{\.\.\.state,active:version\}\)/);
assert.match(sw,/if\(navigation&&id\)liveClients\.set\(id,version\)/);
console.log("P0_EXPLICIT_UPDATE_NAVIGATION_PASS old-document preserved; new navigation uses activated snapshot; missing resulting client falls back safely");
