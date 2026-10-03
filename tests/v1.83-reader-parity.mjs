import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createReaderSectionResolver } from "../src/mass/reader-sections.js";

const gate=JSON.parse(readFileSync(new URL("../data/presentation/v1.83-reader-parity-gate.v1.json",import.meta.url),"utf8"));
const map=JSON.parse(readFileSync(new URL("../data/presentation/reader-section-map.v0.13.1.json",import.meta.url),"utf8"));
const resolver=createReaderSectionResolver(map);

assert.equal(gate.reference.expectedLiveCards,48);
assert.equal(gate.reference.expectedCanonicalMacros,30);
assert.equal(resolver.totalCards,30);
assert.equal(gate.currentR17.nativeReaderCards,30);
assert.equal(gate.currentR17.status,"NOT_PARITY_COMPLETE");
assert.notEqual(resolver.totalCards,gate.reference.expectedLiveCards,
  "Reader parity gate should not silently pass until authoritative 48-card map is recovered");
assert.ok(gate.acceptance.some(x=>/48-card map/.test(x)));

console.log("v1.83 reader parity gate: PASS — 30-card R17 surface remains blocked from replacement until 48-card map recovery.");
