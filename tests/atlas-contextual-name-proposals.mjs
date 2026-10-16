import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ATLAS_GEO,ATLAS_SETTLEMENT_LABELS,buildBibleAtlas} from "../src/find/bible-atlas.js";
const load=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
const decisions=JSON.parse(load("data/explore/biblical-atlas-contextual-name-proposals.research.v1.json"));
const crosswalk=JSON.parse(load("data/explore/biblical-atlas-pleiades-crosswalk.research.v1.json"));
const audit=JSON.parse(load("data/explore/biblical-atlas-toponym-audit.research.v1.json"));
const collation=JSON.parse(load("data/explore/biblical-atlas-source-collation.research.v1.json"));
const corpus=JSON.parse(load("data/explore/bible-places-compact.v1.json"));
assert.equal(buildBibleAtlas(corpus.entries).length,151);
assert.equal(decisions.status,"RESEARCH_AND_BILINGUAL_EDITORIAL_PREVIEW_ONLY");
for(const [flag,v] of Object.entries(decisions.policy))assert.equal(v,true,"Unexpected weakened hold "+flag);
assert.equal(decisions.counts.existingLabelKeys,22);
assert.equal(decisions.counts.distinctContextNoteProposals,11);
assert.equal(decisions.counts.suppressedAsNoValue,11);
assert.equal(decisions.counts.publishedRuntimeAnnotations,0);
assert.equal(decisions.counts.changedPins,0);
const aliasKeys=Object.keys(ATLAS_SETTLEMENT_LABELS);
assert.equal(aliasKeys.length,22);
assert.deepEqual(new Set(decisions.records.map(x=>x.anchorKey)),new Set(aliasKeys));
assert.deepEqual(new Set(audit.aliasReview.map(x=>x.anchorKey)),new Set(aliasKeys));
assert.deepEqual(new Set(collation.records.map(x=>x.anchorKey)).size,28);
const oldByKey=new Map(crosswalk.records.map(x=>[x.anchorKey,x]));
const colByKey=new Map(collation.records.map(x=>[x.anchorKey,x]));
const validEras=new Set(["ORIGINS","PATRIARCHS","EXODUS","ISRAEL","EXILE","INFANCY","PUBLIC","PASSION","RESURRECTION","APOSTLES","REVELATION"]);
let proposed=0,suppressed=0;
for(const rec of decisions.records){
 assert.ok(validEras.has(rec.narrativeEra));
 assert.match(rec.representativeScripture,/^(Genesis|Exodus|1 Kings|2 Kings|Jonah|Luke|Matthew|Mark|John|Acts) \d+:\d+/);
 assert.ok(ATLAS_GEO&&oldByKey.has(rec.anchorKey));
 assert.equal(rec.editorialState,"HOLD_REVIEW_ONLY");
 assert.equal(rec.pinChange,false);
 assert.equal(rec.mapLabelChange,false);
 assert.equal(rec.periodIsNotExactYear,true);
 assert.ok(colByKey.has(rec.anchorKey),"Annotation must refer to existing collated place");
 if(rec.decision==="SUPPRESS_REDUNDANT_NOTE"){
  suppressed++;
  assert.ok(rec.reason.length>45);
  assert.equal(rec.secondaryName,undefined);
  assert.equal(rec.contextNote,undefined);
 }else if(rec.decision==="PROPOSE_CONTEXT_NOTE_NOT_MAP_RELABEL"){
  proposed++;
  assert.ok(rec.secondaryName.length>3);
  const source=colByKey.get(rec.anchorKey).pleiades.matchedNames.find(x=>x.uri===rec.secondaryNameSourceURI);
  assert.ok(source&&source.name===rec.secondaryName,"Only original pinned source name allowed: "+rec.anchorKey);
  assert.ok(["LATER_NAME_ANACHRONISTIC","FORMER_NAME","CONTEMPORARY_LANGUAGE_FORM","OLDER_LANGUAGE_FORM","EARLIER_ALTERNATE_NAME","ROMAN_REFOUNDATION"].includes(rec.relationToNarrativeEra));
  assert.ok(rec.contextNote.en.length>55&&rec.contextNote.fr.length>55);
  assert.ok(rec.independentEvidenceURLs.length>=1&&rec.independentEvidenceURLs.every(url=>url.startsWith("https://")));
  assert.ok(rec.sourceCaveat.length>30);
 }else throw Error("Unexpected decision "+rec.anchorKey);
}
assert.equal(proposed,11);assert.equal(suppressed,11);
for(const file of ["src/find/bible-atlas.js","src/find/browser-entry.js","src/find/map-runtime.js"]){
 assert.ok(!load(file).includes("biblical-atlas-contextual-name-proposals.research.v1.json"),"Cannot load held research into runtime: "+file);
}
for(const anchor of ["jerusalem","samaria","antioch-syria"]){
 const note=decisions.records.find(x=>x.anchorKey===anchor);
 assert.equal(note.decision,"PROPOSE_CONTEXT_NOTE_NOT_MAP_RELABEL");
 assert.equal(note.relationToNarrativeEra,"LATER_NAME_ANACHRONISTIC");
}
console.log("PASS 22 original aliases, 11 contextual note proposals, 11 suppressed extras; zero published names/pins; all 151 events preserved");
