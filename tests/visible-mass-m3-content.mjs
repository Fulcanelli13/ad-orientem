import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {buildVisibleMassM3Index,VMQ_M3_VIEWER_GATE} from "../previews/visible-mass-3d/visible-mass-m3-localization.mjs";
const root="previews/visible-mass-3d/";
const read=name=>JSON.parse(fs.readFileSync(root+name,"utf8"));
const pilot=read("PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json");
const historical=read("HISTORICAL_SYMBOLIC_ANSWERS_20261017.v1.json");
const functional=read("HISTORICAL_FUNCTIONAL_ANSWERS_NEXT_20261017.v1.json");
const overlay=read("VMQ_FRENCH_EDITORIAL_OVERLAY_20261018.v1.json");
const index=buildVisibleMassM3Index(pilot,historical,functional,overlay);
assert.equal(index.gate,VMQ_M3_VIEWER_GATE);
assert.equal(index.count,20);
assert.equal(overlay.translations.length,20);
assert.equal(new Set(overlay.translations.map(x=>x.question_id)).size,20);
assert.deepEqual(overlay.counts.triage,{
 SOURCE_CORROBORATED_CANDIDATE:14,1962_RITUAL_CROSSCHECK_REQUIRED:3,HISTORICAL_REVIEW_REQUIRED:3
});
const ids=["VMQ-0062","VMQ-0056","VMQ-0001","VMQ-0013","VMQ-0005","VMQ-0057",
"VMQ-0052","VMQ-0053","VMQ-0017","VMQ-0019","VMQ-0021","VMQ-0016",
"VMQ-0006","VMQ-0014","VMQ-0002","VMQ-0003","VMQ-0058","VMQ-0065",
"VMQ-0063","VMQ-0059"];
for(const id of ids){
 assert.ok(index.hasFrench(id));
 const fr=index.languageRecord(id,"fr"),en=index.languageRecord(id,"en");
 assert.equal(fr.language,"fr");assert.equal(fr.researchOnly,true);
 assert.equal(en.language,"en");assert.equal(en.researchOnly,true);
 assert.ok(fr.question.length>=25&&fr.answer.length>=25&&fr.context.length>=25);
 assert.notEqual(fr.answer,en.answer,"translation must not simply copy English source");
 assert.equal(fr.originalAnswerStatus,en.originalAnswerStatus);
 const source=[...historical.answers,...functional.answers].find(x=>x.question_id===id);
 assert.equal(en.answer,source.answer_en);
 assert.equal(en.context,source.explanation_en);
 assert.equal(en.question,pilot.questions.find(x=>x.id===id).question.en);
 assert.equal(fr.translationStatus,"EDITORIAL_FRENCH_DRAFT_NOT_APPROVED");
}
for(const id of ["VMQ-0004","VMQ-0018","VMQ-0061","VMQ-0064"]){
 assert.equal(index.hasFrench(id),false);
 const fr=index.languageRecord(id,"fr");
 assert.equal(fr.fallback,true);
 assert.equal(fr.answer,null);
 assert.equal(fr.context,null);
}
const clobbered=structuredClone(overlay);
clobbered.translations[0].question_id="VMQ-0018";
assert.throws(()=>buildVisibleMassM3Index(pilot,historical,functional,clobbered),/authority/);
const bogus=structuredClone(overlay);
bogus.translations[0].primary_source_uris=["https://made-up-source.invalid/"];
assert.throws(()=>buildVisibleMassM3Index(pilot,historical,functional,bogus),/authority/);
const published=structuredClone(overlay);published.status="APPROVED_FOR_PUBLICATION";
assert.throws(()=>buildVisibleMassM3Index(pilot,historical,functional,published),/gate/);
const source=fs.readFileSync(root+"sanctuary-hotspot-pilot.html","utf8");
assert.match(source,/VMQ_FRENCH_EDITORIAL_OVERLAY_20261018\.v1\.json/);
assert.match(source,/visible-mass-m3-localization\.mjs/);
assert.match(source,/id="study-language"/);
assert.match(source,/id="m3-language-notice"/);
assert.match(source,/translationStatus|localized\.triage/);
assert.match(source,/renderExactHistoricalAnswer\(state\.question\)/);
assert.doesNotMatch(source,/<canvas\b/);
const inline=source.match(/<script>([\s\S]*?)<\/script>/)?.[1];
assert.ok(inline);new vm.Script(inline);
console.log("PASS Visible Mass M3: 20 owner-locked French research records, English unchanged, source links exact, held questions unanswered, no publication auto-promotion.");
