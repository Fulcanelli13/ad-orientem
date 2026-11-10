import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {hydrateHomeDidYouKnow} from "../src/home/did-you-know-glossary.js";
import {
 DYK526_HOME_ENABLED,loadDyk526HomeRelease,dyk526HomeCandidates,
 applyDyk526HomeCard,openDyk526HomeSource
} from "../src/home/dyk-526-home-bridge.js";

const json=path=>JSON.parse(readFileSync(path,"utf8"));
const preview=json("data/research/did-you-know/release-candidates/ao-dyk-display-preview-526-RESEARCH_ONLY.v1.json");
const glossary=json("data/glossary/concepts-151-300.v1.json");
const clone=x=>JSON.parse(JSON.stringify(x));
const date="2026-11-10";
assert.equal(DYK526_HOME_ENABLED,false);
assert.equal(preview.records.length,526);

let calls=0,requests=[];
const forbiddenFetch={fetch:async input=>{calls++;requests.push(String(input));throw Error("fetch should not be called")}};
assert.equal(await loadDyk526HomeRelease(forbiddenFetch),null);
assert.equal(calls,0,"No network request while the gate is off");
assert.deepEqual(dyk526HomeCandidates(preview),[]);
assert.deepEqual(dyk526HomeCandidates(preview,{enabled:true}),[]);
assert.equal(await openDyk526HomeSource(forbiddenFetch,{id:preview.records[0].id,date}),false);
assert.equal(calls,0);

const researchResponse={fetch:async input=>{
 calls++;requests.push(String(input));
 return {ok:true,json:async()=>preview};
}};
assert.equal(await loadDyk526HomeRelease(researchResponse,{enabled:true}),null,
 "No research preview can be treated as an approved release");
assert.equal(calls,1);
assert.ok(requests[0].includes("/data/did-you-know/dyk-526-approved-release.v1.json"));
assert.ok(!requests[0].includes("/data/research/"));

const first=clone(preview.records[0]);
first.editorial.owner_decision="APPROVED";
first.editorial.copy_adjustment_pending=false;
first.eligibility="APPROVED_FOR_LIVE";
for(const k of Object.keys(first.release_gate))first.release_gate[k]=true;
const url=first.research_provenance.source_urls_raw.split(/[;\n]/)[0].trim();
first.published_source={url,source_id:"SYNTHETIC-526-SOURCE",
 source_record_id:"SYNTHETIC-526-SOURCE",deep_link_verified:true};
const fixture={schema:"AO_DYK_526_APPROVED_RELEASE_V1",
 release_stage:"APPROVED_PARTIAL_LIVE",published:true,
 global_release_authorized:true,owner_release_decision:"APPROVED",
 records:[first]};
// Pure synthetic positive-path test only. No approval or new release file committed.
const win={fetch:async input=>{
 requests.push(String(input));
 return {ok:true,json:async()=>fixture};
}};
assert.equal(await loadDyk526HomeRelease(win),null);
assert.equal((await loadDyk526HomeRelease(win,{enabled:true}))?.records?.length,1);
assert.equal(dyk526HomeCandidates(fixture).length,0);
assert.equal(dyk526HomeCandidates(fixture,{enabled:true}).length,1);
const elements=Object.fromEntries([
 "[data-home-dyk-title]","[data-home-dyk-fact]","[data-home-dyk-source]"
].map(key=>[key,{textContent:"untouched"}]));
const button={dataset:{homeDykEntry:"G195"},querySelector:k=>elements[k]};
const before=JSON.stringify(button.dataset);
assert.equal(applyDyk526HomeCard(button,fixture,first.id,date,"en"),false);
assert.equal(JSON.stringify(button.dataset),before,"Disabled render cannot mutate Home");
assert.equal(applyDyk526HomeCard(button,fixture,first.id,date,"en",{enabled:true}),true);
assert.equal(elements["[data-home-dyk-title]"].textContent,first.proposed_title.en);
assert.equal(elements["[data-home-dyk-fact]"].textContent,first.proposed_copy.en);
assert.equal(button.dataset.homeDykBank,"526");
assert.equal(button.dataset.homeDykFactId,first.id);
assert.equal(button.dataset.homeDykEntry,undefined);
assert.equal(applyDyk526HomeCard(button,fixture,first.id,date,"fr",{enabled:true}),true);
assert.equal(elements["[data-home-dyk-title]"].textContent,first.proposed_title.fr);
assert.equal(elements["[data-home-dyk-fact]"].textContent,first.proposed_copy.fr);
assert.match(elements["[data-home-dyk-source]"].textContent,/source/);
assert.equal(applyDyk526HomeCard(button,fixture,first.id,"2026-11-31","en",{enabled:true}),false);
assert.equal(applyDyk526HomeCard(button,preview,first.id,date,"en",{enabled:true}),false);

// In the real Home hydrate call, the hard-disabled load never requests the
// future manifest, but an existing source-backed Glossary fact still renders.
const hdate="2026-10-31";
const node={dataset:{homeLanguage:"en"}};
const homeCells=Object.fromEntries([
 "[data-home-dyk-title]","[data-home-dyk-fact]","[data-home-dyk-source]"
].map(k=>[k,{textContent:""}]));
const homeButton={
 isConnected:true,disabled:true,dataset:{},closest:()=>node,
 querySelector:k=>homeCells[k],removeAttribute(){}
};
const homeRoot={querySelector:k=>k===".homeScreen [data-home-dyk-open]"?homeButton:null};
const requestLog=[];
const homeWin={
 AO_RUNTIME_V8:{store:{getState:()=>({selectedDate:hdate})}},
 fetch:async input=>{
  requestLog.push(String(input));
  if(String(input).includes("concepts-151-300.v1.json"))
   return {ok:true,json:async()=>glossary};
  return {ok:false,json:async()=>({})};
 }
};
assert.equal(hydrateHomeDidYouKnow(homeRoot,homeWin),true);
await new Promise(ok=>setImmediate(ok));
assert.equal(homeButton.disabled,false);
assert.ok(homeButton.dataset.homeDykEntry||homeButton.dataset.homeDykFactId);
assert.equal(homeButton.dataset.homeDykBank,undefined);
assert.equal(requestLog.some(x=>x.includes("dyk-526-approved-release.v1.json")),false);
assert.equal(requestLog.some(x=>x.includes("ao-dyk-display-preview-526")),false);
console.log("PASS DYK 526 Home bridge: feature disabled, no private network load, EN/FR synthetic render, old Home source rotation intact");
