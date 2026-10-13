import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {publishedCanonRubricsForParagraph} from "../src/mass/reader-canon-published-rubrics.js";
const data=JSON.parse(readFileSync(new URL("../data/presentation/reader-rubric-events.v1.json",import.meta.url),"utf8"));
const research=JSON.parse(readFileSync(new URL("../data/research/mass-canon-french-rubric-62-original-redraft-20261013.json",import.meta.url),"utf8"));
const paragraph=(id,cues)=>({id,sourceCueIds:cues});
const source=publishedCanonRubricsForParagraph(paragraph("te",["AO.SM.C0155","AO.SM.C0158"]),data);
assert.equal(source.status,"PUBLISHED_SOURCE_MATCH");
assert.deepEqual(source.rubrics.map(x=>x.sourceCueId),["AO.SM.C0155","AO.SM.C0158"]);
assert.ok(source.rubrics.every(x=>x.actor==="PRIEST"&&x.sourceId==="MR62_RITUS"&&x.observedNow===false));
assert.ok(source.rubrics.every(x=>x.review==="EXISTING_PUBLISHED_R17_1962_RUBRIC"));
assert.ok(source.rubrics.every(x=>!research.rows.some(d=>d.revisedFrenchRubric===x.shortAction)),
  "Unapproved French rubric research must never appear in the published bridge");
const artificial=publishedCanonRubricsForParagraph(paragraph("derived-amen",[]),data);
assert.equal(artificial.rubrics.length,0,"Derived prayer response must not borrow Canon action");
const sourceAnchorOnly=publishedCanonRubricsForParagraph({
  id:"derived-oremus",sourceAnchorCueId:"AO.SM.C0155",sourceCueIds:[],
},data);
assert.equal(sourceAnchorOnly.rubrics.length,0);
const nonCanon=publishedCanonRubricsForParagraph(paragraph("gospel",["AO.SM.C0084"]),data);
assert.equal(nonCanon.rubrics.length,0);
const unknown=publishedCanonRubricsForParagraph(paragraph("canon",["AO.SM.C0155"]),null);
assert.equal(unknown.status,"UNVERIFIED_REGISTRY");
assert.equal(unknown.rubrics.length,0);
assert.equal(publishedCanonRubricsForParagraph(paragraph("canon",["AO.SM.C0155"]),data,{form:"REQUIEM"}).status,
  "FORM_NOT_APPROVED");
const composite=publishedCanonRubricsForParagraph(paragraph("combo",["AO.SM.C0155","AO.SM.C0155","AO.SM.C0158"]),data);
assert.deepEqual(composite.rubrics.map(x=>x.id),source.rubrics.map(x=>x.id),"Composite must not duplicate exact cue action");
const tampered=structuredClone(data);
tampered.items.push({id:"MADE_UP",cueId:"AO.SM.C0150",actor:"PRIEST",kind:"GESTURE",
  label:"DRAFT RUBRIC",authorityClass:"UNVERIFIED",sources:["MR62_RITUS"],order:1});
assert.equal(publishedCanonRubricsForParagraph(paragraph("canon",["AO.SM.C0150"]),tampered).rubrics.length,0);
console.log("PASS: approved Canon source-rubric bridge excludes all 62 unapproved French drafts, artificial cues, unsupported forms and fabricated clock state.");
