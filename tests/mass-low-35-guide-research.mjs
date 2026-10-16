import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {validateGuideRegistry} from "../src/mass/reader-guide.js";
import {
  LOW_GUIDE_MASS_FORM,
  validateLowGuideResearch,
  lowGuideResearchCandidate,
  loadLowGuideResearch,
} from "../src/mass/reader-low-guide.js";

const source=JSON.parse(readFileSync(new URL("../data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json",import.meta.url),"utf8"));
const current=JSON.parse(readFileSync(new URL("../data/presentation/guide-registry.v1.json",import.meta.url),"utf8"));
assert.equal(validateGuideRegistry(current),current,"existing 32 Guide release contract must survive");
assert.equal(validateLowGuideResearch(source),source);
assert.equal(source.entryCount,35);
assert.equal(source.massForm,"LOW_1962");
const entries=Array.from({length:35},(_,i)=>source.entries["LOW."+String(i+1).padStart(3,"0")]);
assert.equal(new Set(entries.map(e=>e.key)).size,35);
assert(entries.every((e,i)=>e.originalWorkbookRow===34+i));
const fixture=entries.map(e=>[e.key,e.moment,e.short].join("\t")).join("\n")+"\n";
const sha=createHash("sha256").update(fixture).digest("hex");
assert.equal(sha,source.fixtureSha256,
  "Original workbook short-guide source text drifted; compare exact wording, accents and punctuation");
for(const e of entries){
  assert.equal(e.releaseApproved,false);
  assert.equal(e.longSourceOnly,true);
  assert.equal(lowGuideResearchCandidate(source,{massForm:"MISSA_CANTATA_INCENSE",guideId:e.key,allowResearchPreview:true}),null);
  assert.equal(lowGuideResearchCandidate(source,{massForm:"LOW_1962",guideId:e.key}),null);
  const x=lowGuideResearchCandidate(source,{massForm:LOW_GUIDE_MASS_FORM,guideId:e.key,allowResearchPreview:true});
  assert.equal(x.key,e.key);
  assert.equal(x.text,e.short);
  assert.equal(x.detail,null);
  assert.equal(x.releaseApproved,false);
  assert.equal(x.actorClock,"PRIEST+SERVER");
  assert.equal(x.scholaClock,null);
}
for(const id of ["AO.CARD.001","LOW.000","LOW.036","LOW.1","LOW.999",null]){
 assert.equal(lowGuideResearchCandidate(source,{massForm:"LOW_1962",guideId:id,allowResearchPreview:true}),null);
}
const mockFetch=async(url)=>({ok:true,json:async()=>source});
const loaded=await loadLowGuideResearch({fetchImpl:mockFetch});
assert.equal(loaded.index,source);
assert(loaded.url.endsWith("/data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json"));
const negative={...source,entries:{...source.entries,"LOW.001":{...source.entries["LOW.001"],releaseApproved:true}}};
assert.throws(()=>validateLowGuideResearch(negative),/not cleared/);
assert.equal(Object.keys(current.entries).length,32);
console.log("PASS: 35 exact historical Low Mass short texts, rows 34–68, stable checksum, 32 current Guides untouched, Low-only preview fail-closed.");
