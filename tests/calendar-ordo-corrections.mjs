import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../",import.meta.url);
const registry=JSON.parse(readFileSync(new URL("../data/calendar/1962-ordo-corrections.v1.json",import.meta.url),"utf8"));
const boot=readFileSync(new URL("../ao-boot-4ef16d2b0e26d68c.js",import.meta.url),"utf8");
assert.equal(registry.schema,"AO_1962_CALENDAR_CORRECTIONS_V1");
assert.equal(registry.corrections.length,15);
const match=boot.match(/Object\.assign\(constants, (\{[^\n]+\})\);/);
assert.ok(match,"Pin-native calendar source literal overrides have disappeared");
const actual=JSON.parse(match[1]);
const expected=Object.fromEntries(registry.corrections.map(x=>[x.key,x.value]));
assert.deepEqual(actual,expected,"Production bundle correction records diverge from audited registry");
for(const row of registry.corrections){
 assert.match(row.key,/^SANCTI_\d{2}_\d{2}$/);
 assert.match(row.value,/^sancti:\d{2}-\d{2}[a-z]*:[1-4]:[vwrgbp]+$/);
 assert.ok(row.source?.startsWith("https://"),"Each correction must have original-source context");
}
assert.equal(registry.disputes.length,2,"Both Epiphany octave disputes need independent evidence");
assert.ok(registry.disputes.every(x=>x.status==="ADJUDICATED_FROM_1960_RUBRICS"&&x.authority?.locator.includes("119(a)")&&x.sources?.length>=2));
assert.doesNotMatch(boot,/generic source fallback can inherit a stale white tempora/,"Unverified blanket Epiphany colour override must not return");
assert.match(boot,/C\.TEMPORA_QUAD5_5C\)\) && !matchFirst\(obs, PAT\.PATTERN_SANCTI_CLASS_1_OR_2\)/,
 "St Joseph Passion-Friday I-class precedence regression");
console.log("PASS pinned 1962 calendar correction registry, 15 recurring feasts, 2 transparently unresolved source disagreements, St Joseph precedence");
