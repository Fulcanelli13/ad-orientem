import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {KYRIALE_RESEARCH_NOTATION_EXAMPLES} from "../src/mass/reader-kyriale-catalogue.js";
import {offlineKyrialeResearchScore} from "../src/mass/reader-kyriale-research-gabc.js";
import {createOfflineChantEngraver} from "../src/mass/reader-chant-engraver.js";

const vendor=readFileSync(new URL("../assets/vendor/exsurge/exsurge.min.js",import.meta.url),"utf8");
const license=readFileSync(new URL("../assets/vendor/exsurge/LICENSE",import.meta.url),"utf8");
assert.match(license,/The MIT License/);
assert.ok(vendor.length>200000,"Use the original pinned Exsurge bundle, not a remote CDN");
assert.doesNotMatch(vendor,/(?:https?:)?\/\/(?:unpkg|cdn\.jsdelivr)\./i);
const sandbox={};sandbox.globalThis=sandbox;
vm.runInNewContext(vendor,sandbox,{timeout:6000,filename:"exsurge.min.js"});
const api=sandbox.exsurge;
assert.equal(typeof api?.Gabc?.createMappingsFromSource,"function");
assert.equal(typeof api?.ChantScore?.prototype?.createSvgNode,"function");

for(const lead of KYRIALE_RESEARCH_NOTATION_EXAMPLES){
 const score=offlineKyrialeResearchScore(lead.movement,lead.catalogueId);
 assert.ok(score,"Missing exact offline score "+lead.scoreId);
 const ctx=new api.ChantContext();
 const mappings=api.Gabc.createMappingsFromSource(ctx,score.gabc);
 assert.ok(mappings.length>4,"GABC must contain musical notation "+lead.scoreId);
 const chant=new api.ChantScore(ctx,mappings,true);
 chant.performLayout(ctx);
 for(const width of [300,370]){
  await new Promise((resolve,reject)=>{
   try{chant.layoutChantLines(ctx,width,resolve)}catch(error){reject(error)}
  });
  const tree=chant.createSvgTree(ctx);
  assert.equal(tree.name,"svg",lead.scoreId+" must engrave genuine SVG");
  assert.ok(tree.children.length,lead.scoreId+" notation must not be empty");
 }
}
let lastSource=null,draws=0;
class FakeScore{
 constructor(_ctx,mappings){lastSource=mappings}
 performLayoutAsync(_ctx,ok){queueMicrotask(ok)}
 layoutChantLines(_ctx,_width,ok){queueMicrotask(ok)}
 createSvgNode(){draws++;return {style:{},setAttribute(){}}}
}
const mockApi={Gabc:{createMappingsFromSource:(_ctx,source)=>source},
 ChantContext:class{},ChantScore:FakeScore};
const doc={defaultView:{exsurge:mockApi,ResizeObserver:class{
 observe(){}disconnect(){}
 }},createElement(){return {}}};
const viewport={ownerDocument:doc,clientWidth:320,replaceChildren(){}};
const renderer=createOfflineChantEngraver({viewport});
const chosen=offlineKyrialeResearchScore("KYRIE","MASS_08");
assert.equal(await renderer.engrave(chosen.gabc),true);
assert.equal(lastSource,chosen.gabc);
assert.equal(draws,1);
renderer.destroy();
assert.equal(renderer.getState().destroyed,true);


// M17 facsimile location and fail-closed nonpublication review.
const ledger=JSON.parse(readFileSync(
 new URL("../data/research/mass-music-m17-seven-facsimile-identity.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.policy.status,"NONPUBLIC_RESEARCH_REVIEW");
assert.equal(ledger.policy.publicScoresApproved,0);
assert.equal(ledger.policy.printedNoteByNoteValidated,0);
assert.equal(ledger.policy.publicReaderCodeChanged,false);
assert.equal(ledger.policy.offlineServiceWorkerChanged,false);
assert.equal(ledger.policy.automaticMassAssignment,false);
assert.equal(ledger.policy.audioOrPlayback,false);
assert.equal(ledger.scores.length,7);
assert.equal(ledger.originalEdition.printedFacsimileUrl,
 "https://media.churchmusicassociation.org/pdf/kyriale-solesmes.pdf");
const sourceIds=new Set();
for(const row of ledger.scores){
 assert.equal(row.printedPageConfirmed,true);
 assert.equal(row.chantIdentityAndIncipitVisible,true);
 assert.equal(row.entireNotationPageScrutinizedNoteForNote,false);
 assert.equal(row.syllablePitchParity,"NOT_VERIFIED");
 assert.equal(row.rhythmicMarkParity,"NOT_VERIFIED");
 assert.equal(row.editorialScoreApproved,false);
 assert.equal(row.publicReader,false);
 assert.equal(row.publicationHold,"REQUIRES_NOTE_BY_NOTE_FACSIMILE_AND_EDITORIAL_REVIEW");
 assert.match(row.printedPage,/^\d+\*$/);
 assert.equal(row.printedPdfPageIndex,parseInt(row.printedPage,10)+1);
 const matching=KYRIALE_RESEARCH_NOTATION_EXAMPLES.find(x=>
  x.movement===row.movement&&x.catalogueId===row.selection);
 assert.ok(matching,"Missing catalogue selection "+row.sourceId);
 assert.equal(matching.scoreId,"GREGOBASE-"+row.sourceId);
 assert.equal(matching.sourceUrl,row.sourceUrl);
 assert.ok(matching.printedWitness.endsWith(row.printedPage));
 assert.equal(matching.scoreApproved,false);
 const score=offlineKyrialeResearchScore(row.movement,row.selection);
 assert.ok(score?.gabc?.includes("%%"));
 assert.equal(score.scoreId,"GREGOBASE-"+row.sourceId);
 sourceIds.add(row.sourceId);
}
assert.equal(sourceIds.size,7);
assert.equal(offlineKyrialeResearchScore("KYRIE","MASS_03"),null);
assert.equal(offlineKyrialeResearchScore("KYRIE","Mass VIII"),null);
assert.equal(offlineKyrialeResearchScore("CREDO","MASS_08"),null);
const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.doesNotMatch(dom,/data-schola-score-open|offlineKyrialeResearchScore\(/);
assert.doesNotMatch(sw,/OFFLINE_CRITICAL_CHANT_ENGRAVER|exsurge\.min/);
console.log("PASS seven original Solesmes 1961 printed score locations; offline Exsurge SVG render at phone widths; publication and Mass UI gates closed");
