import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {dyk520Candidates,dyk520EligibleCandidates,dyk520CalendarCandidates,dyk520Model,loadDyk520Release} from "../src/home/dyk-520-release.js";
import {dykHomeRotationSlot,dykPublishedMarkup} from "../src/home/dyk-published-feed.js";
import {hydrateHomeDidYouKnow,HOME_DYK_GLOSSARY_IDS} from "../src/home/did-you-know-glossary.js";

const bank=JSON.parse(readFileSync("data/did-you-know/dyk-customs-glossary-520.v1.json","utf8"));
const glossary=JSON.parse(readFileSync("data/glossary/concepts-151-300.v1.json","utf8"));
const date="2026-11-11";
assert.ok(bank.count>=653,"The bilingual discovery bank must retain all three glossary discovery waves");
assert.equal(bank.counts.customs,378);
assert.equal(bank.counts.glossary,bank.count-378);
const candidates=dyk520Candidates(bank,date);
assert.equal(candidates.length,bank.count,"The real Home adapter must accept every curated discovery");
assert.equal(new Set(candidates.map(x=>x.id)).size,bank.count);
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
assert.equal(picks.size,bank.count+24,"All curated cards and 24 Glossary fallback facts must rotate");
// The added glossary cards are excerpts of the existing source-backed
// 450-concept registry, not an independent set of invented definitions.
const registry=JSON.parse(readFileSync("data/glossary/source-registry.v1.json","utf8"));
const conceptFiles=[1,2,3].map((part)=>
 JSON.parse(readFileSync("data/glossary/concepts-"+String((part-1)*150+1).padStart(3,"0")+"-"+String(part*150).padStart(3,"0")+".v1.json","utf8")));
const concepts=new Map(conceptFiles.flatMap(x=>x.entries).map(x=>[x.id,x]));
const sources=new Map(registry.sources.map(x=>[x.id,x]));
const added=bank.records.filter(x=>x.origin==="GLOSSARY_EDUCATIONAL_DISCOVERY_20261111");
assert.equal(added.length,17);
for(const r of added){
 const concept=concepts.get(r.glossary_concept_id);
 const source=sources.get(r.source.id);
 assert.ok(concept&&source,r.id+" missing canonical source");
 assert.ok(concept.definition_source_ids.includes(source.id),r.id+" source not on concept");
 assert.equal(r.source.url,source.canonical_url,r.id+" source URL drift");
 assert.equal(r.category,"GLOSSARY");
 assert.ok(["LITURGY","DEVOTION","DOCTRINE","LATIN","ARCHITECTURE","CANON_LAW"].includes(r.discovery_topic));
 for(const lang of ["en","fr"]){
  assert.ok(r.title[lang]&&r.fact[lang].length>50,r.id+" missing "+lang);
  const model=dyk520Model(bank,r.id,date,lang);
  assert.equal(model.glossaryConceptId,r.glossary_concept_id);
  assert.match(dykPublishedMarkup(model),/data-dyk-glossary-entry=/);
 }
}
// Independently chosen new glossary discoveries must retain source ownership,
 // stable concept references and meaningful bilingual copy.
const secondWave=bank.records.filter(x=>x.origin==="GLOSSARY_EDUCATIONAL_DISCOVERY_20261111_B");
assert.equal(secondWave.length,58);
assert.equal(new Set(secondWave.map(x=>x.glossary_concept_id)).size,58);
for(const r of secondWave){
 const concept=concepts.get(r.glossary_concept_id),source=sources.get(r.source.id);
 assert.ok(concept&&source,r.id+" glossary concept/source must exist");
 assert.ok(concept.definition_source_ids.includes(source.id),r.id+" must use the concept's canonical source");
 assert.equal(r.source.url,source.canonical_url,r.id+" source URL must match registry");
 for(const lang of ["en","fr"]){
  assert.ok(r.title[lang].length>12&&r.fact[lang].length>45,r.id+" missing reader copy in "+lang);
  const model=dyk520Model(bank,r.id,date,lang);
  assert.equal(model.glossaryConceptId,r.glossary_concept_id);
  assert.match(dykPublishedMarkup(model),/data-dyk-glossary-entry=/);
 }
}
assert.equal(new Set(bank.records.filter(r=>r.glossary_concept_id).map(r=>r.glossary_concept_id)).size,
 bank.records.filter(r=>r.glossary_concept_id).length,
 "No duplicated direct glossary concept cards");

// Third glossary wave: only canonical concepts with source-backed bilingual
// educational copy may join the published Home rotation.
const thirdWave=bank.records.filter(r=>r.origin==="GLOSSARY_EDUCATIONAL_DISCOVERY_20261111_C");
assert.equal(thirdWave.length,58);
assert.equal(new Set(thirdWave.map(r=>r.glossary_concept_id)).size,58);
for(const row of thirdWave){
 const concept=concepts.get(row.glossary_concept_id),source=sources.get(row.source.id);
 assert.ok(concept&&source,row.id+" requires an existing source-backed glossary entry");
 assert.ok(concept.definition_source_ids.includes(source.id),row.id+" is not sourced to the canonical concept");
 assert.equal(row.source.url,source.canonical_url,row.id+" has a mismatched source URL");
 for(const lang of ["en","fr"]){
  assert.ok(row.title[lang].length>12&&row.fact[lang].length>45,row.id+" requires informative bilingual text");
  const model=dyk520Model(bank,row.id,date,lang);
  assert.equal(model.glossaryConceptId,row.glossary_concept_id);
  assert.match(dykPublishedMarkup(model),/data-dyk-glossary-entry=/);
 }
}
const originalG311=bank.records.find(r=>r.id==="DYK-GL-G311-01");
assert.ok(originalG311.fact.en.includes("final two stanzas"));
assert.ok(!originalG311.fact.en.includes("Panem de caelo"));
const correctedPanem=bank.records.find(r=>r.id==="DYK-GL-G314-01");
assert.ok(correctedPanem.fact.en.includes("praestitisti eis"));
assert.deepEqual(dyk520CalendarCandidates(bank,"2026-12-04").map(r=>r.id),["DYK-GL-G332-01"]);
assert.deepEqual(dyk520CalendarCandidates(bank,"2026-12-05").map(r=>r.id),["DYK-GL-G333-01"]);
assert.ok(dyk520EligibleCandidates(bank,"2026-12-11").some(r=>r.id==="DYK-C400-BK-001"));
// The original 520 entries have topic metadata; date context is attached
// only when the reviewed source copy warrants a specific educational relevance.
const validTopics=new Set(["CUSTOMS","PILGRIMAGE","CHURCH_HISTORY","LITURGY","DEVOTION","DOCTRINE","LATIN","ARCHITECTURE","CANON_LAW"]);
assert.equal(bank.records.filter(r=>validTopics.has(r.discovery_topic)).length,bank.count);
assert.equal(bank.records.filter(r=>r.calendar_context).length,209);
const has=(date,id,fn=dyk520EligibleCandidates)=>fn(bank,date).some(r=>r.id===id);
assert.equal(has("2026-12-04","DYK-C400-BF-006"),true,"St Barbara relevance on 4 December");
assert.equal(has("2026-07-04","DYK-C400-BF-006"),false,"St Barbara must not be randomly shown in July");
assert.equal(has("2026-11-11","DYK-C400-BJ-003"),true,"Martinmas harvest on 11 November");
assert.equal(has("2026-01-06","DYK-C400-BF-008"),true,"Epiphany on January 6");
assert.equal(has("2026-06-04","DYK-CW15-023"),true,"Panama's devils belong near Corpus Christi");
assert.equal(has("2026-09-29","DYK-CW15-023"),false,"Saint Michael imagery does not make the Corpus Christi procession Michaelmas");
assert.equal(has("2026-04-02","DYK-CW16-058"),true,"Pesaha custom on Holy Thursday 2026");
assert.equal(has("2026-11-11","DYK-CW16-058"),false,"Holy Thursday custom should not be a random November fact");
assert.equal(has("2026-02-17","DYK-H04-W-A-094"),true,"Shrove Tuesday is Easter-47");
assert.equal(has("2026-12-11","DYK-C400-BK-001"),true,"Rorate in Advent");
assert.equal(has("2026-07-11","DYK-C400-BK-001"),false,"Rorate should not appear in July");
assert.equal(has("2026-07-11","DYK-GL-G142-01"),true,"Evergreen doctrine must remain accessible");
assert.equal(has("2026-12-04","DYK-GL-G332-01",dyk520CalendarCandidates),true);
assert.equal(has("2026-12-05","DYK-GL-G333-01",dyk520CalendarCandidates),true);
assert.equal(has("2026-12-05","DYK-GL-G332-01"),false,"First-Friday discovery not on Saturday");
const invalidTopic=structuredClone(bank);
invalidTopic.records[0].discovery_topic="APP_INTERNAL";
assert.deepEqual(dyk520Candidates(invalidTopic,date),[],"Topic classification is a strict public contract");
const invalidCalendar=structuredClone(bank);
invalidCalendar.records[0].calendar_context={fixed_dates:["13-41"]};
assert.deepEqual(dyk520Candidates(invalidCalendar,date),[],"Invalid date metadata rejects the whole bank");
// Both contextual and evergreen cards receive real opportunities across
// seasonal transitions without changing the canonical catalog or source URLs.
for(const day of ["2026-02-17","2026-04-02","2026-06-04","2026-11-11","2026-12-04","2026-12-05"]){
 const eligible=dyk520EligibleCandidates(bank,day),contextual=dyk520CalendarCandidates(bank,day);
 assert.ok(eligible.length>250&&eligible.length<=bank.count,day+" must retain an evergreen fallback");
 assert.ok(contextual.every(x=>eligible.some(y=>y.id===x.id)),day+" contextual cards must be eligible");
}
const invalidCue=structuredClone(bank);
invalidCue.records.find(r=>r.id==="DYK-GL-G332-01").calendar_cue="ANY_DAY";
assert.deepEqual(dyk520Candidates(invalidCue,date),[]);

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
const calendarRows=dyk520CalendarCandidates(bank,selectedDay);
const eligibleRows=dyk520EligibleCandidates(bank,selectedDay);
const expectedId=calendarRows.length?
 dykHomeRotationSlot(selectedDay,calendarRows.map(r=>r.id),[]):
 dykHomeRotationSlot(selectedDay,eligibleRows.map(r=>r.id),HOME_DYK_GLOSSARY_IDS);
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
console.log("PASS DYK 653: bilingual source-linked catalog, 653 topical classifications, date/season-aware Home rotation and EN/FR hydration");
