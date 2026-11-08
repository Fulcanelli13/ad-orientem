// Publication gate: allow one fresh-profile retry only for initial public
// app-shell boot. Never loosen source-fingerprint, offline reload or Settings
// assertions; this is a runtime resilience check, not an app approval bypass.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const source=readFileSync(new URL("./installed-pages-live-phone.mjs",import.meta.url),"utf8");
assert.match(source,/const MAX_FRESH_BOOT_ATTEMPTS=2;/);
assert.match(source,/for\(let attempt=1;attempt<=MAX_FRESH_BOOT_ATTEMPTS;attempt\+\+\)/);
assert.match(source,/if\(context\)await context\.close\(\)/);
assert.match(source,/context=await browser\.newContext\(freshProfile\)/);
assert.match(source,/report\.firstBootAttempts\.push\(failureEvidence\)/);
assert.match(source,/P0_PUBLIC_FIRST_BOOT_ATTEMPT_FAILED/);
assert.match(source,/if\(attempt===MAX_FRESH_BOOT_ATTEMPTS\)throw error;/);
assert.match(source,/await page\.waitForFunction\(\(\)=>[\s\S]*?visibleOwner===true,[\s\S]*?timeout:60000/);
for(const invariant of [
 "assert.equal(online.offline.ready,true)",
 "assert.equal(online.offline.pendingVersion,null",
 "assert.equal(settingsOnline.settings.actualSite,\"github_pages\")",
 "assert.equal(cached.offline.version,online.offline.version",
 "assert.equal(cached.swControlled,true",
 "assert.equal(settingsOffline.settings.snapshotFingerprint,online.offline.version.slice(0,12)",
 "report.pass=true"
])assert.ok(source.includes(invariant),"Required release invariant missing: "+invariant);
assert.doesNotMatch(source,/setOffline\(false\)/);
assert.doesNotMatch(source,/skipWaiting\(/);
console.log("P0_PUBLIC_FIRST_BOOT_RETRY_CONTRACT_PASS=2 independent profiles, bounded failure, mandatory snapshot/offline checks");
