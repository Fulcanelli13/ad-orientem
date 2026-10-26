import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
import {createOfflineChantEngraver,engraverWidth,loadOfflineExsurge}
  from "../src/mass/reader-chant-engraver.js";
import {SCHOLA_SCORE_CATALOGUE} from "../src/mass/reader-chant-score-pilot.js";

const vendor=readFileSync(new URL("../assets/vendor/exsurge/exsurge.min.js",import.meta.url),"utf8");
const license=readFileSync(new URL("../assets/vendor/exsurge/LICENSE",import.meta.url),"utf8");
assert.match(license,/The MIT License/);
assert.ok(vendor.length>200000,"Actual pinned Exsurge bundle must be local");
assert.doesNotMatch(vendor,/(?:https?:)?\/\/(?:unpkg|cdn\.jsdelivr)\./i);
const sandbox={};
sandbox.globalThis=sandbox;
vm.runInNewContext(vendor,sandbox,{timeout:6000,filename:"exsurge.min.js"});
for(const key of ["ChantScore","ChantContext","Gabc"])assert.ok(sandbox.exsurge?.[key],key);
assert.equal(typeof sandbox.exsurge.Gabc.createMappingsFromSource,"function");
assert.equal(typeof sandbox.exsurge.ChantScore.prototype.createSvgNode,"function");
assert.equal(typeof sandbox.exsurge.ChantScore.prototype.layoutChantLines,"function");
assert.equal(typeof sandbox.exsurge.ChantScore.prototype.performLayoutAsync,"function");
for(const item of SCHOLA_SCORE_CATALOGUE){
  const api=sandbox.exsurge;
  const context=new api.ChantContext();
  const mappings=api.Gabc.createMappingsFromSource(context,item.gabc);
  assert.ok(mappings.length>4,"GABC must parse actual notes: "+item.id);
  const score=new api.ChantScore(context,mappings,true);
  score.performLayout(context);
  const lineCounts=[];
  for(const width of [260,420,800]){
    await new Promise((resolve,reject)=>{
      try{score.layoutChantLines(context,width,resolve)}catch(error){reject(error)}
    });
    const tree=score.createSvgTree(context);
    assert.equal(tree.name,"svg",item.id+" needs a genuine SVG");
    assert.ok(tree.children.length,item.id+" notation SVG must not be empty");
    lineCounts.push(score.chantLines.length);
  }
  assert.ok(lineCounts[0]>=lineCounts[2],
    item.id+" must reflow and fit fewer chant lines on a wide screen");
}


const widths=[];
let sourceUsed=null,nodes=0,svgCreated=0;
class FakeScore{
  constructor(ctx,mappings){sourceUsed=mappings;}
  performLayoutAsync(ctx,complete){queueMicrotask(complete)}
  layoutChantLines(ctx,width,complete){widths.push(width);queueMicrotask(complete)}
  createSvgNode(){
    svgCreated++;return {style:{},setAttribute(){}};
  }
}
const exsurge={
  Gabc:{createMappingsFromSource:(ctx,gabc)=>gabc},
  ChantContext:class{},
  ChantScore:FakeScore,
};
const document={defaultView:{exsurge,ResizeObserver:class{
  observe(){} disconnect(){}
}},createElement(){return {}}};
const viewport={ownerDocument:document,clientWidth:420,
  replaceChildren(){nodes++}};
const renderer=createOfflineChantEngraver({viewport});
assert.equal(await loadOfflineExsurge(document),exsurge);
assert.equal(engraverWidth({clientWidth:420}),404);
assert.equal(engraverWidth({clientWidth:0}),324);
assert.equal(renderer.getState().rendered,false);
assert.equal(await renderer.engrave(SCHOLA_SCORE_CATALOGUE[0].gabc),true);
assert.equal(sourceUsed,SCHOLA_SCORE_CATALOGUE[0].gabc);
assert.equal(renderer.getState().lastWidth,404);
assert.equal(svgCreated,1);assert.equal(nodes,1);
viewport.clientWidth=320;
assert.equal(await renderer.reflow(),true);
assert.equal(widths.at(-1),304);
assert.equal(svgCreated,2);
assert.equal(await renderer.reflow(),false,"Unchanged width must not reflow");
assert.equal(await renderer.engrave("GABC with no actual separator").then(()=>false,e=>e instanceof TypeError),true);
const first=renderer.engrave(SCHOLA_SCORE_CATALOGUE[1].gabc);
const second=renderer.engrave(SCHOLA_SCORE_CATALOGUE[2].gabc);
assert.equal(await first,false,"Earlier asynchronous score must be discarded");
assert.equal(await second,true);
assert.equal(sourceUsed,SCHOLA_SCORE_CATALOGUE[2].gabc);
renderer.observe();
renderer.destroy();
assert.equal(renderer.getState().destroyed,true);
assert.equal(await renderer.engrave(SCHOLA_SCORE_CATALOGUE[0].gabc).then(()=>false,()=>true),true);

const owner=readFileSync(new URL("../src/mass/reader-chant-score-pilot.js",import.meta.url),"utf8");
assert.match(owner,/createOfflineChantEngraver/);
assert.doesNotMatch(owner,/(?:picture|fullPicture)\.setAttribute\("src"/,
  "Mass viewer must not request remote score images");
assert.doesNotMatch(owner,/(?:new Audio|SpeechRecognition|getUserMedia|releaseBenedictus)\s*\(/);
const worker=readFileSync(new URL("../sw.js",import.meta.url),"utf8");
assert.match(worker,/const OFFLINE_CRITICAL_CHANT_ENGRAVER=new URL\("assets\/vendor\/exsurge\/exsurge\.min\.js",BASE\)\.href;/);
assert.match(worker,/const queue=\[ROOT,\.\.\.urlsInHtml\(html\),OFFLINE_CRITICAL_ANGELUS_ART,OFFLINE_CRITICAL_CHANT_ENGRAVER\]/);
console.log("PASS local GABC renderer: pinned MIT bundle, adaptive layout, stale guard, and no audio");
