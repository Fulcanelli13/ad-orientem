import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {HOME_DYK_GLOSSARY_IDS,homeDidYouKnowSelect,homeDidYouKnowMarkup,hydrateHomeDidYouKnow,HOME_DYK_GLOSSARY_FACTS} from "../src/home/did-you-know-glossary.js";

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
  assert.ok(entry.explanation.en&&entry.explanation.fr,"Bilingual observation must exist");
  chosen.add(entry.id);
}
assert.equal(chosen.size,6,"Date-based preview should reach all six source-backed Glossary entries");
assert.deepEqual(Object.keys(HOME_DYK_GLOSSARY_FACTS).sort(),[...HOME_DYK_GLOSSARY_IDS].sort(),
  "Every released Home preview needs explicit edited fact copy");
for(const id of HOME_DYK_GLOSSARY_IDS){
  const entry=document.entries.find(x=>x.id===id);
  for(const language of ["en","fr"]){
    const fact=HOME_DYK_GLOSSARY_FACTS[id][language];
    assert.ok(fact?.length>=60&&fact.length<=190, id+" "+language+" needs a readable substantial fact");
    assert.notEqual(fact,entry.short_definition[language],"Never display the glossary definition");
    assert.notEqual(fact,entry.explanation[language],"Editorial copy should be a digest, not a pasted glossary paragraph");
  }
}
assert.equal(homeDidYouKnowSelect([], "2026-10-30"),null,"Unknown source must fail closed");
const selected=homeDidYouKnowSelect(document.entries,"2026-10-31");
assert.equal(homeDidYouKnowSelect(document.entries.map(e=>e.id!==selected.id?e:{...e,explanation:{en:"",fr:""}}),"2026-10-31"),null,
  "Missing factual observation cannot fall back to the definition");
const homeNode={dataset:{homeLanguage:"en"}};
const elements=Object.fromEntries(["[data-home-dyk-title]","[data-home-dyk-fact]","[data-home-dyk-source]"].map(k=>[k,{textContent:""}]));
const button={isConnected:true,disabled:true,dataset:{},closest:()=>homeNode,querySelector:k=>elements[k],removeAttribute(){}};
const root={querySelector:k=>k===".homeScreen [data-home-dyk-open]"?button:null};
const win={AO_RUNTIME_V8:{store:{getState:()=>({selectedDate:"2026-10-31"})}},fetch:async()=>({ok:true,json:async()=>document})};
assert.equal(hydrateHomeDidYouKnow(root,win),true);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(elements["[data-home-dyk-fact]"].textContent,HOME_DYK_GLOSSARY_FACTS[selected.id].en,"Show the edited bilingual discovery, not a definition");
assert.notEqual(elements["[data-home-dyk-fact]"].textContent,selected.short_definition.en);
assert.equal(elements["[data-home-dyk-title]"].textContent,selected.labels.en);
assert.equal(button.disabled,false);
homeNode.dataset.homeLanguage="fr";
assert.equal(hydrateHomeDidYouKnow(root,win),true);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(elements["[data-home-dyk-fact]"].textContent,HOME_DYK_GLOSSARY_FACTS[selected.id].fr,"Use the edited French discovery");
assert.notEqual(elements["[data-home-dyk-fact]"].textContent,selected.short_definition.fr);
assert.match(homeDidYouKnowMarkup("en"),/DID YOU KNOW\?/);
assert.match(homeDidYouKnowMarkup("fr"),/LE SAVIEZ-VOUS \?/);
assert.doesNotMatch(homeDidYouKnowMarkup("en"),/catechism|catéchisme/i);
assert.match(homeDidYouKnowMarkup("en"),/<strong data-home-dyk-fact role="status">/);
assert.match(homeDidYouKnowMarkup("en"),/<span class="aoHomeDYKSubject" data-home-dyk-title>/);
const h4=readFileSync(new URL("../src/home/today-h4-view.js",import.meta.url),"utf8");
const h3=readFileSync(new URL("../src/home/today-v2-sections.js",import.meta.url),"utf8");
const owner=readFileSync(new URL("../src/home/browser-entry.js",import.meta.url),"utf8");
assert.ok(h4.includes("homeDidYouKnowMarkup(vm.language)"));
assert.ok(h3.includes("homeDidYouKnowMarkup(language)"));
assert.match(h4,/aoTodayV2CalendarGlance[\s\S]*aoH4DiscoveryStandalone[\s\S]*aoTodayV2Below/,
  "H4 card must live after This week and before Read");
assert.match(h3,/aoTodayV2CalendarGlance[\s\S]*aoTodayV2DiscoveryStandalone[\s\S]*aoTodayV2Below/,
  "Today fallback must place a standalone card after Calendar glance");
assert.ok(h4.indexOf("homeDidYouKnowMarkup(vm.language)") <
  h4.lastIndexOf('class="aoTodayV2Below"'),
  "Discovery must not render inside Read");
assert.ok(h3.indexOf("homeDidYouKnowMarkup(language)") <
  h3.lastIndexOf('class="aoTodayV2Below"'),
  "Fallback Discovery must not render inside Read");
assert.ok(!h4.includes("data-home-daily-catechism"));
assert.ok(!h3.includes("data-home-daily-catechism"));
assert.ok(owner.includes('ensureLearnModule("learn.glossary",win)'),"Cold Home must lazy-load Glossary");
assert.ok(owner.includes('AO_GLOSSARY_V1?.open?.({entryId,origin:"context",trigger:dyk})'),
  "Did You Know must open the exact concept and restore Home on close");
for(const file of ["today-h4-styles.js","today-v2-styles.js"]){
  const css=readFileSync(new URL("../src/home/"+file,import.meta.url),"utf8");
  assert.ok(css.includes("aoHomeDYK [data-home-dyk-fact]{display:block;font:500 17px"),"Readable fact hierarchy missing in "+file);
  assert.ok(css.includes("color:var(--ao-text-primary"),"Fact must use foreground contrast in "+file);
}
console.log("PASS Home Did You Know: six bilingual observations, not definitions, prominent fact, exact Glossary route");
