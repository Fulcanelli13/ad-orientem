import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {publishedCanonRubricsForParagraph,withPublishedCanonParagraphRubrics} from "../src/mass/reader-canon-published-rubrics.js";
import {normalizeReaderMoment,buildReaderShellMarkup} from "../src/mass/reader-dom.js";
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
// The prepublished R17 registry has exactly 19 qualified priest action/gesture
// items. One composite "REPLACES AND COVERS CHALICE" has unresolved actor
// ownership at Solemn Mass and must not appear as a priest-only action.
const qualified=data.items.filter(x=>x.cueId>="AO.SM.C0150"&&x.cueId<="AO.SM.C0207"&&
 x.actor==="PRIEST"&&x.authorityClass==="1962_NORMATIVE"&&
 x.sources?.includes("MR62_RITUS")&&x.kind!=="STATE");
assert.equal(qualified.length,19,"Frozen source-published registry denominator must be explicit");
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE"]){
 const events=publishedCanonRubricsForParagraph(
  paragraph("chalice",[ "AO.SM.C0181"]),data,{form});
 assert.equal(events.status,"PUBLISHED_SOURCE_MATCH");
 assert.ok(events.rubrics.some(x=>x.id==="AO.RUB.C0181.04"));
 assert.deepEqual(events.withheldMixedRoleEventIds,[]);
}
const solemn=publishedCanonRubricsForParagraph(
 paragraph("chalice",[ "AO.SM.C0181"]),data,{form:"SOLEMN"});
assert.equal(solemn.status,"PUBLISHED_SOURCE_MATCH");
assert.ok(!solemn.rubrics.some(x=>x.id==="AO.RUB.C0181.04"));
assert.deepEqual(solemn.withheldMixedRoleEventIds,["AO.RUB.C0181.04"]);
assert.deepEqual(solemn.rubrics.map(x=>x.id),[
 "AO.RUB.C0181.01","AO.RUB.C0181.02","AO.RUB.C0181.05"
]);
assert.ok(solemn.rubrics.every(x=>x.observedNow===false));
const syntheticNormative=structuredClone(data);
syntheticNormative.items.push({id:"AO.RUB.C0150.99",cueId:"AO.SM.C0150",
 actor:"PRIEST",kind:"ACTION",label:"EDITORIAL DRAFT AS CERTIFIED",
 authorityClass:"1962_NORMATIVE",sources:["MR62_RITUS"],order:1});
assert.equal(publishedCanonRubricsForParagraph(paragraph("synthetic",["AO.SM.C0150"]),
 syntheticNormative).rubrics.length,0,"Normative-looking new events still need explicit approval");
const cannotPublishState=publishedCanonRubricsForParagraph(
 paragraph("fingers",[ "AO.SM.C0174"]),data,{form:"SOLEMN"});
assert.ok(!cannotPublishState.rubrics.some(x=>x.shortAction==="THUMB AND INDEX FINGERS REMAIN JOINED"),
 "Continuous state is not an event to flash on the reader");
const wrongCue=publishedCanonRubricsForParagraph({
 id:"fabricated-owner",sourceAnchorCueId:"AO.SM.C0181",sourceCueIds:[]
},data,{form:"SOLEMN"});
assert.equal(wrongCue.rubrics.length,0);
const rows=[paragraph("te",["AO.SM.C0155"]),paragraph("synthetic-amen",[]),paragraph("gospel",["AO.SM.C0084"])];
const enriched=withPublishedCanonParagraphRubrics(rows,data,{form:"MISSA_CANTATA_SIMPLE"});
assert.equal(enriched.length,rows.length,"inline display must preserve paragraph count");
assert.deepEqual(enriched.map(x=>x.id),rows.map(x=>x.id));
assert.equal(enriched[1],rows[1],"derived Amen must not acquire a priest event");
assert.equal(enriched[2],rows[2],"non-Canon remains unchanged");
assert.equal(enriched[0].publishedCanonRubrics[0].sourceCueId,"AO.SM.C0155");
assert.equal(enriched[0].publishedCanonRubrics[0].sourceUrl,data.sources.find(x=>x.id==="MR62_RITUS").url);
assert.ok(Object.isFrozen(enriched)&&Object.isFrozen(enriched[0].publishedCanonRubrics));
const solemnRows=withPublishedCanonParagraphRubrics(
  [paragraph("chalice",["AO.SM.C0181"])],data,{form:"SOLEMN"});
assert.ok(solemnRows[0].publishedCanonRubrics.every(x=>x.id!=="AO.RUB.C0181.04"),
  "Inline UI may not defeat Solemn deacon/celebrant ownership");
assert.equal(withPublishedCanonParagraphRubrics(rows,data,{form:"REQUIEM"})[0].publishedCanonRubrics,undefined);
const normalized=normalizeReaderMoment({paragraphs:enriched}).paragraphs;
assert.equal(normalized[0].publishedCanonRubrics[0].observedNow,false);
assert.equal(normalized[1].publishedCanonRubrics.length,0);
assert.equal(normalized[2].publishedCanonRubrics.length,0);
const invented=normalizeReaderMoment({paragraphs:[{
  id:"invented",sourceCueIds:["AO.SM.C0155"],
  publishedCanonRubrics:[{review:"UNAPPROVED_FRENCH_DRAFT",actor:"PRIEST",
    sourceId:"MR62_RITUS",shortAction:"INVENTED",sourceCueId:"AO.SM.C0155",observedNow:false}]
}]}).paragraphs[0];
assert.equal(invented.publishedCanonRubrics.length,0);
assert.ok(buildReaderShellMarkup({session:{resolvedMass:{presentationMode:"LIVE"}},readerPreferences:{mode:"LIVE"}}).includes('data-role="canon-source-summary"'));
const domSource=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const runtimeSource=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.ok(domSource.includes('note.dataset.observedNow="false"'));
assert.ok(runtimeSource.includes("withPublishedCanonParagraphRubrics("));
assert.ok(!domSource.includes("mass-canon-french-rubric-62-original-redraft"));
console.log("PASS: 19-ID Canon allowlist and Solemn safeguards govern the visible source-linked rubric rows, without a priest-progress clock.");
