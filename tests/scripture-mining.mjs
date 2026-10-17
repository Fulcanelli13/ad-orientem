import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {SCRIPTURE_EDITIONS,DEFAULT_SCRIPTURE_EDITION} from "../src/scripture/catalogue.js";
import {createScripturePreferences} from "../src/scripture/preferences.js";
import {sourceMiningTargets,loadSourceMiningTargets,miningWorkbenchUrl} from "../src/scripture/mining-targets.js";
import {SCRIPTURE_LINK_COUNTS} from "../src/scripture/related-objects.js";
import {mineScriptureReference,validateScriptureMiningDecision,
  countIndependentSelections,MINING_ENGLISH_EDITIONS} from "../src/scripture/mining-service.js";

assert.equal(DEFAULT_SCRIPTURE_EDITION.en,"cpdv-2009");
assert.equal(SCRIPTURE_EDITIONS["cpdv-2009"].role,"default");
assert.equal(SCRIPTURE_EDITIONS["dr-challoner"].role,"traditional-comparison");
assert.deepEqual(MINING_ENGLISH_EDITIONS,["cpdv-2009","dr-challoner"]);
assert.ok(Object.values(SCRIPTURE_EDITIONS).every(edition=>edition.enabled===false));
const storage={read:null,getItem(){return this.read},setItem(_key,v){this.read=v}};
const pref=createScripturePreferences(storage);
assert.equal(pref.englishEdition(),"cpdv-2009","Old implicit default must not persist");
assert.equal(pref.setEnglishEdition("dr-challoner"),true);
assert.equal(pref.englishEdition(),"dr-challoner","Explicit historic choice preserved");
const events=[];
const witnessLoader=async(editionId,book)=>{
 events.push("witness:"+editionId+":"+book);
 return [{editionId,book,chapter:1,verseStart:28,verseEnd:28,
   text:editionId==="cpdv-2009"?"Clear CPDV source witness":"Historic Douay source witness",
   sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false},
  {editionId,book,chapter:1,verseStart:29,verseEnd:29,
   text:"Contextual witness only",sourceStatus:"UNCOLLATED_SOURCE_WITNESS",reviewed:false}];
};
const commentaryLoader=async()=>[{citation:"Catena Aurea, Luke 1:28",
 source:{url:"https://www.ecatholic2000.com/catena/untitled-62.shtml"},
 segments:[{father:"St Ambrose",text:"Original attributed historical commentary."}]}];
const mined=await mineScriptureReference("Luke 1:28",{
 origin:{moduleId:"rosary",objectId:"joy1",bead:2},witnessLoader,commentaryLoader,
 fetcher:async()=>{throw Error("Unexpected network")}
});
assert.equal(mined.primaryEdition,"cpdv-2009");
assert.equal(mined.comparisonEdition,"dr-challoner");
assert.equal(mined.readings["cpdv-2009"].verses.length,1,"Only requested verse, not all book text");
assert.equal(mined.readings["dr-challoner"].verses.length,1);
assert.match(mined.readings["cpdv-2009"].verses[0].text,/Clear CPDV/);
assert.deepEqual(events,["witness:cpdv-2009:Luke","witness:dr-challoner:Luke"]);
assert.equal(mined.commentary.sections[0].segments[0].father,"St Ambrose");
assert.equal(mined.origin.bead,2);
assert.equal(mined.editorialStatus,"RESEARCH_NOT_APPROVED_FOR_VERBATIM_ROSARY_CUES");
// A single-verse extraction is not automatic approval to quote on a Rosary bead.
assert.equal(mined.readings["cpdv-2009"].sourceStatus,"UNCOLLATED_SOURCE_WITNESS");
assert.equal(mined.exactEditionParallelVerified,false);
assert.ok(mined.readings["cpdv-2009"].sourceUrl.startsWith("https://sacredbible.org/"));
assert.ok(mined.readings["dr-challoner"].sourceUrl.includes("biblegateway.com"));
await assert.rejects(()=>mineScriptureReference("UnknownBook 1:1",{witnessLoader}),/INVALID_CATHOLIC/);
const split=await mineScriptureReference("Esther 14:1-2",{witnessLoader,commentaryLoader});
assert.equal(split.readings["dr-challoner"].available,false,"Never align Greek additions by assumed verse coordinates");
assert.equal(split.readings["dr-challoner"].sourceStatus,"CROSS_EDITION_REFERENCE_UNVERIFIED");
assert.equal(split.readings["dr-challoner"].sourceUrl,null);
const selected=validateScriptureMiningDecision({reference:"Luke 1:28",rating:5,
 disposition:"SUITABLE_ELSEWHERE",originModule:"rosary",originId:"joy1",
 destinationId:"joy2",destinationBead:8,duplicate:true});
assert.equal(selected.schema,"ao.scripture.mining-decision.v1");
assert.equal(selected.duplicate,true);
assert.equal(selected.editorialStatus,"RESEARCH_SELECTION_UNAPPROVED");
assert.ok(!("text" in selected),"Do not duplicate Bible translations in reviewer exports");
assert.throws(()=>validateScriptureMiningDecision({...selected,rating:6}),/INVALID_SCRIPTURE/);
assert.equal(countIndependentSelections([
 {editorialFamilyId:"Catholic Lectionary",qualified:true},
 {editorialFamilyId:"Catholic Lectionary",qualified:true},
 {editorialFamilyId:"Missal 1962",qualified:false},
 {editorialFamilyId:"Other publisher",qualified:true}
]),2);
const html=readFileSync(new URL("../previews/scripture-mining-workbench-20261017.html",import.meta.url),"utf8");
assert.match(html,/mineScriptureReference/);
assert.match(html,/ROSARY_GUIDED_BEAD_EVIDENCE_V1/);
assert.match(html,/Export JSON/);
assert.match(html,/CPDV first/);
assert.ok(!/https:\/\/raw\.githubusercontent\.com/.test(html),"No live third-party corpus fetch");
assert.equal(sourceMiningTargets("mass").length,SCRIPTURE_LINK_COUNTS.massFormation);
assert.equal(sourceMiningTargets("formation").length,SCRIPTURE_LINK_COUNTS.massFormation,
 "Formation reuses the Mass study source owner rather than creating duplicate citations");
assert.equal(sourceMiningTargets("novena").length,16);
assert.equal(sourceMiningTargets("prayer").length,8);
assert.equal(sourceMiningTargets("stations").length,9);
assert.equal(sourceMiningTargets("historia").length,0,"Never invent Atlas data without its owner");
assert.equal(sourceMiningTargets("rosary").length,0,"Rosary already owns its per-bead controls");
assert.equal(sourceMiningTargets("novena").find(x=>x.objectId==="annunciation")?.reference,"Luke 1:26–38");
assert.equal(sourceMiningTargets("mass").find(x=>x.objectId==="MFS01")?.relation,"ADAPTED_WORDS");
const atlasFixture=Object.freeze([{
 source:"atlas",objectId:"biblical:event:fixture",id:"atlas:biblical:event:fixture",
 reference:"Luke 1:28",title:{en:"Atlas source fixture",fr:"Fixture Atlas"},
 relation:"BIBLICAL_NARRATIVE_OR_VISION_EVENT"
}]);
const atlasTargets=await loadSourceMiningTargets("historia",{atlasLoader:async()=>atlasFixture});
assert.equal(atlasTargets.length,1);
assert.equal(atlasTargets[0].objectId,"biblical:event:fixture");
assert.equal(sourceMiningTargets("historia",{atlasEvents:atlasFixture}).length,1);
assert.match(miningWorkbenchUrl({module:"novena",objectId:"annunciation",reference:"Luke 1:26–38"}),
 /scripture-mining-workbench-20261017\.html\?module=novena/);
assert.throws(()=>miningWorkbenchUrl({module:"rosary",mystery:"joy9",bead:2}),/INVALID_MINING_MYSTERY/);
const beadReview=validateScriptureMiningDecision({reference:"Luke 1:28",
 rating:5,disposition:"KEEP_HERE",originModule:"rosary",originId:"joy1",
 originBead:2,destinationId:"joy1",destinationBead:2,duplicate:false});
assert.equal(beadReview.originBead,2,"Distinct Guided beads must retain editorial identity");
const legacyReview=validateScriptureMiningDecision({...beadReview,originBead:undefined});
assert.equal(legacyReview.originBead,null,"Older exported ratings remain readable");
const inlineScript=html.match(/<script type="module">([\\s\\S]*?)<\\/script>/)?.[1];
assert.ok(inlineScript,"Workbench must retain a single module entry point");
const syntax=spawnSync(process.execPath,["--check","--input-type=module"],
 {input:inlineScript,encoding:"utf8"});
assert.equal(syntax.status,0,syntax.stderr||"Workbench script failed syntax validation");
assert.match(html,/loadSourceMiningTargets/);
assert.match(html,/linkedObject/);
assert.match(readFileSync(new URL("../src/scripture/library.js",import.meta.url),"utf8"),/ao_scripture_research/,
 "The canonical reader can open editorial mining on explicit opt-in only");
console.log("Shared source mining, source-owned module selectors and editorial review contracts passed");
