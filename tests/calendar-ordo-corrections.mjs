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
assert.ok(registry.disputes.every(x=>x.status==="REQUIRES_RUBRIC_REVIEW"&&x.sources?.length>=2));
assert.doesNotMatch(boot,/generic source fallback can inherit a stale white tempora/,"Unverified blanket Epiphany colour override must not return");
assert.match(boot,/C\.TEMPORA_QUAD5_5C\)\) && !matchFirst\(obs, PAT\.PATTERN_SANCTI_CLASS_1_OR_2\)/,
 "St Joseph Passion-Friday I-class precedence regression");
// A plain [Secreta] or [Postcommunio] heading is normative source text,
// not an optional numbered-only appendix. Protect both the base Mass and
// source-backed privileged commemorations from silently losing these prayers.
for(const p of [
  'secrets: numbered(sources, "Secreta", true)',
  'postcommunions: numbered(sources, "Postcommunio", true)',
  "(0, proper_resolver_1.numbered)(sources, 'Secreta', true)[0]",
  "(0, proper_resolver_1.numbered)(sources, 'Postcommunio', true)[0]",
]){
  assert.ok(boot.includes(p),"Canonical Proper parser dropped unnumbered section: "+p);
}
assert.match(boot,/1960 General Rubrics nn\. 25, 108, 111/,"III-class Advent feria commemoration rule missing");
assert.match(boot,/const sunday = isSun && x\.flexibility === 'sancti'/,"displaced II-class Sunday commemoration rule missing");
assert.match(boot,/observance\.path === 'Tempora\/Pasc6-6'/,"canonical Pentecost Vigil title resolver missing");

console.log("PASS pinned 1962 calendar correction registry, 15 recurring feasts, 2 transparently unresolved source disagreements, St Joseph precedence");
