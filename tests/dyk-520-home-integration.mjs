import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dyk520Candidates,dyk520Model,loadDyk520Release} from "../src/home/dyk-520-release.js";
import {dykHomeRotationSlot,dykPublishedMarkup} from "../src/home/dyk-published-feed.js";
import {hydrateHomeDidYouKnow,HOME_DYK_GLOSSARY_IDS} from "../src/home/did-you-know-glossary.js";

const bank=JSON.parse(readFileSync("data/did-you-know/dyk-customs-glossary-520.v1.json","utf8"));
const glossary=JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8"));
const date="2026-11-11";
assert.equal(bank.count,520);
assert.equal(bank.counts.customs,378);
assert.equal(bank.counts.glossary,142);
const candidates=dyk520Candidates(bank,date);
assert.equal(candidates.length,520,"The real Home adapter must accept all 520 records");
assert.equal(new Set(candidates.map(x=>x.id)).size,520);
assert.ok(candidates.every(r=>r.source_family==="CURATED_CUSTOMS_GLOSSARY_2026"));
const excluded=new Set(["DYK-CW15-035","DYK-CW15-038","DYK-G600-P-029","DYK-GL-G255-01","DYK-GL-G429-01","DYK-GX18-006"]);
assert.deepEqual(new Set(bank.excluded_ids),excluded);
for(const r of candidates){
 for(const lang of ["en","fr"]){
  const m=dyk520Model(bank,r.id,date,lang);
  assert.ok(m,r.id+" "+lang+" model");
  assert.equal(m.title,r.title[lang]);
  assert.equal(m.fact,r.pilot_home_copy[lang]);
  assert.ok(m.fact.length>25);
  assert.equal(m.sourceUrl,r.source.url);
  const markup=dykPublishedMarkup(m);
  assert.ok(markup.includes("data-dyk-published"),r.id+" missing source sheet");
  assert.ok(markup.includes("noopener noreferrer"),r.id+" unsafe source link");
 }
}
const sassari=dyk520Model(bank,"DYK-C400-BG-014",date);
assert.equal(sassari.title,"Sassari's towering wooden candles");
const sicily=dyk520Model(bank,"DYK-G600-P-028",date);
assert.ok(sicily.fact.includes("live snakes"));
assert.ok(!sicily.fact.includes("replacing"));
const ids=candidates.map(r=>r.id),picks=new Set();
for(let offset=0;offset<1500;offset++){
 const day=new Date(Date.UTC(2026,0,1+offset)).toISOString().slice(0,10);
 const pick=dykHomeRotationSlot(day,ids,HOME_DYK_GLOSSARY_IDS);
 assert.ok(pick);
 picks.add(pick);
}
assert.equal(picks.size,544,"All new cards and 24 Glossary fallback facts must rotate");
const clone=structuredClone(bank);
clone.records[0].fact.fr="";
assert.deepEqual(dyk520Candidates(clone,date),[],"One invalid record fails the full bank");
assert.deepEqual(dyk520Candidates(bank,"2026-02-30"),[]);
assert.deepEqual(dyk520Candidates({...bank,release_stage:"RESEARCH_ONLY"},date),[]);

// Real Home hydration mock: the new JSON joins the existing Home pipeline,
// while the already-published historic banks may be unavailable.
const selectedDay=Array.from({length:25},(_,i)=>
 new Date(Date.UTC(2026,10,11+i)).toISOString().slice(0,10))
 .find(day=>dykHomeRotationSlot(day,ids,HOME_DYK_GLOSSARY_IDS).startsWith("DYK-"));
assert.ok(selectedDay);
const expectedId=dykHomeRotationSlot(selectedDay,ids,HOME_DYK_GLOSSARY_IDS);
const screen={dataset:{homeLanguage:"en"}};
const nodes=Object.fromEntries(["[data-home-dyk-title]","[data-home-dyk-fact]","[data-home-dyk-source]"]
 .map(key=>[key,{textContent:""}]));
const button={isConnected:true,disabled:true,dataset:{},closest:()=>screen,
 querySelector:key=>nodes[key],removeAttribute(){}};
const root={querySelector:key=>key===".homeScreen [data-home-dyk-open]"?button:null};
const win={AO_RUNTIME_V8:{store:{getState:()=>({selectedDate:selectedDay})}},
 fetch:async u=>{
  const url=String(u);
  if(url.includes("dyk-customs-glossary-520.v1.json"))return {ok:true,json:async()=>bank};
  if(url.includes("concepts-151-300.v1.json"))return {ok:true,json:async()=>glossary};
  return {ok:false};
 }};
assert.equal(hydrateHomeDidYouKnow(root,win),true);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(button.dataset.homeDykFactId,expectedId);
assert.equal(nodes["[data-home-dyk-title]"].textContent,
 bank.records.find(r=>r.id===expectedId).title.en);
assert.equal(button.disabled,false);
screen.dataset.homeLanguage="fr";
assert.equal(hydrateHomeDidYouKnow(root,win),true);
await new Promise(resolve=>setImmediate(resolve));
assert.equal(button.dataset.homeDykFactId,expectedId);
assert.equal(nodes["[data-home-dyk-fact]"].textContent,
 bank.records.find(r=>r.id===expectedId).fact.fr);
console.log("PASS DYK 520: 378 Customs + 142 Glossary, 520 bilingual models, sources, full no-repeat rotation and real Home hydration");
