import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {HOME_DYK_GLOSSARY_IDS,homeDidYouKnowSelect,homeDidYouKnowMarkup} from "../src/home/did-you-know-glossary.js";

const document=JSON.parse(readFileSync(new URL("../data/glossary/concepts-151-300.v1.json",import.meta.url),"utf8"));
assert.equal(document.schema,"GLOSSARY_CONCEPTS_SOT_V1");
assert.equal(HOME_DYK_GLOSSARY_IDS.length,6);
const chosen=new Set();
for(let day=1;day<=31;day++){
  const date="2026-10-"+String(day).padStart(2,"0");
  const entry=homeDidYouKnowSelect(document.entries,date);
  assert.ok(entry, "source-backed Glossary discovery missing "+date);
  assert.equal(entry.definition_status,"SOURCE_BACKED");
  assert.equal(entry.status,"SOURCE_OWNER_LOCKED");
  assert.ok(entry.source_ids.length>0);
  assert.ok(entry.short_definition.en&&entry.short_definition.fr);
  chosen.add(entry.id);
}
assert.equal(chosen.size,6,"Date-based preview should reach all six source-backed Glossary entries");
assert.equal(homeDidYouKnowSelect([], "2026-10-30"),null,"Unknown source must fail closed");
assert.match(homeDidYouKnowMarkup("en"),/DID YOU KNOW\?/);
assert.match(homeDidYouKnowMarkup("fr"),/LE SAVIEZ-VOUS \?/);
assert.doesNotMatch(homeDidYouKnowMarkup("en"),/catechism|catéchisme/i);
const h4=readFileSync(new URL("../src/home/today-h4-view.js",import.meta.url),"utf8");
const h3=readFileSync(new URL("../src/home/today-v2-sections.js",import.meta.url),"utf8");
const owner=readFileSync(new URL("../src/home/browser-entry.js",import.meta.url),"utf8");
assert.ok(h4.includes("homeDidYouKnowMarkup(vm.language)"));
assert.ok(h3.includes("homeDidYouKnowMarkup(language)"));
assert.ok(!h4.includes("data-home-daily-catechism"));
assert.ok(!h3.includes("data-home-daily-catechism"));
assert.ok(owner.includes('ensureLearnModule("learn.glossary",win)'),"Cold Home must lazy-load Glossary");
assert.ok(owner.includes('AO_GLOSSARY_V1?.open?.({entryId,origin:"context",trigger:dyk})'),
  "Did You Know must open the exact concept and restore Home on close");
console.log("PASS Home Did You Know: six source-owned bilingual teasers, no Catechism, exact Glossary route");
