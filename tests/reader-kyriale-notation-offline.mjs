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

const dom=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/mass/reader-kyriale-notation-viewer.js",import.meta.url),"utf8");
const sw=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.match(dom,/data-schola-score-open="KYRIE"/);
assert.match(dom,/offlineKyrialeResearchScore\(movement,plan\?\.ordinarySelections/);
assert.match(dom,/kyrialeNotationViewer\?\.destroy\(\)/);
assert.match(ui,/createOfflineChantEngraver/);
assert.match(ui,/aria-modal/);
assert.doesNotMatch(ui,/(?:new Audio|SpeechRecognition|getUserMedia|releaseBenedictus)\s*\(/);
assert.match(sw,/OFFLINE_CRITICAL_CHANT_ENGRAVER/);
assert.match(sw,/new Set\(\[ROOT,\.\.\.urlsInHtml\(html\),OFFLINE_CRITICAL_ANGELUS_ART,OFFLINE_CRITICAL_CHANT_ENGRAVER\]\)/);
console.log("PASS seven source-indexed Kyriale research GABCs, local responsive SVG, lifecycle and offline snapshot");
