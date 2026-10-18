import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createVisibleMassLivingChurchAdapter,VISIBLE_MASS_LC_SCENES} from
 "../previews/visible-mass-3d/visible-mass-living-church-adapter.mjs";
const root="previews/visible-mass-3d/";
const load=f=>JSON.parse(readFileSync(root+f,"utf8"));
const pilot=load("PHASE1_SANCTUARY_PILOT_QUESTIONS_20261017.v1.json");
const graph=load("GUIDED_TRAIL_GRAPH_RESEARCH_20261018.v1.json");
let review=true;
let original={view:"church",photoMode:"still",selected:null,question:null,
 mode:"explore",lang:"en",trailId:null};
let pose={x:150,y:45};
const adapter=createVisibleMassLivingChurchAdapter({
 pilot,graph,reviewEnabled:()=>review,sourceStatus:()=>original,sourcePose:()=>pose
});
assert.equal(adapter.sync().ok,true);
let s=adapter.status();
assert.equal(s.context.scene.sceneId,VISIBLE_MASS_LC_SCENES.still);
assert.deepEqual(s.context.scene.pose,{x:150,y:45});
assert.equal(s.context.mode,"explore");
assert.equal(s.context.objectId,null);
assert.equal(s.massHandoffIntegrated,false);
assert.equal(s.answersOwnedBy,"ORIGINAL_VISIBLE_MASS_AND_CATECHISM");
assert.equal(s.context.publication,"REVIEW_ONLY_NO_ANSWERS");
assert.equal((await adapter.status()).enabled,true);
assert.equal(adapter.chooseGuide("sacristan").ok,true);
original={...original,trailId:"FIRST_VISIT",mode:"discover"};
assert.equal(adapter.sync().ok,true);
assert.equal(adapter.status().context.trailId,"FIRST_VISIT");
original={...original,selected:"AL01",question:"VMQ-0001",mode:"understand"};
assert.equal(adapter.sync().ok,true);
s=adapter.status().context;
assert.equal(s.objectId,"AL01");assert.equal(s.questionId,"VMQ-0001");
assert.equal(s.guide,"sacristan");
assert.equal(s.trailId,"FIRST_VISIT");
assert.equal(s.mode,"understand");
assert.equal("readCount" in s,false);
assert.equal("answer" in s,false);
pose={x:168,y:90};
adapter.sync();assert.equal(adapter.status().context.scene.pose.x,168);
original={...original,question:null,mode:"understand"};
adapter.sync();assert.equal(adapter.status().context.questionId,null,"back to object clears source question");
assert.equal(adapter.status().context.objectId,"AL01");
original={...original,selected:"AL06",question:"VMQ-0013"};
adapter.sync();assert.equal(adapter.status().context.objectId,"AL06");
assert.equal(adapter.status().context.questionId,"VMQ-0013");
original={...original,selected:null,question:null,mode:"discover"};
adapter.sync();assert.equal(adapter.status().context.objectId,null);
assert.equal(adapter.status().context.trailId,"FIRST_VISIT",
 "close card retains original trail reference");
original={...original,view:"panorama",photoMode:"brompton",mode:"explore"};
pose={yaw:.37,pitch:.17,fov:68};
assert.equal(adapter.sync().ok,true);
assert.equal(adapter.status().context.scene.sceneId,"BROMPTON_PANO");
assert.equal(adapter.status().context.objectId,null);
assert.equal(adapter.status().context.scene.pose.pitch,.17);
original={...original,photoMode:"newman"};pose={yaw:1,pitch:0,fov:60};
assert.equal(adapter.sync().ok,true);
assert.equal(adapter.status().context.scene.sceneId,"NEWMAN_360",
 "no Brompton hotspot coordinate transfer to Newman");
original={...original,view:"m5-close"};assert.equal(adapter.sync().code,"SCENE_NOT_IN_P1_SLICE");
assert.equal(adapter.status().sceneSupported,false);
assert.equal(adapter.chooseGuide("canon").code,"SCENE_NOT_IN_P1_SLICE");
original={...original,view:"church",photoMode:"still",selected:null,question:null};
pose={x:180,y:0};
assert.equal(adapter.sync().ok,true);
assert.equal(adapter.chooseGuide("canon").ok,true);
assert.equal(adapter.chooseGuide("pius-x").ok,true);
assert.equal(adapter.status().context.guide,"pius-x");
assert.equal((await adapter.status()).massHandoffIntegrated,false);
review=false;assert.equal(adapter.sync().code,"REVIEW_GATE_CLOSED");
assert.equal(adapter.chooseGuide("canon").code,"SCENE_NOT_IN_P1_SLICE");
assert.throws(()=>createVisibleMassLivingChurchAdapter({
 pilot:{...pilot,schema:"FABRICATED"},graph,
 sourceStatus:()=>original,sourcePose:()=>pose,reviewEnabled:()=>true
}),/Original Visible Mass owner manifests required/);
assert.throws(()=>createVisibleMassLivingChurchAdapter({
 pilot,graph:{...graph,visibleHotspotIds:["AL03",...graph.visibleHotspotIds.slice(1)]},
 sourceStatus:()=>original,sourcePose:()=>pose,reviewEnabled:()=>true
}),/Original Visible Mass owner manifests required/);
console.log("Living Church Visible Mass P1 PASS: exact original 134 VMQ source owner, four trails, true scene poses, photo isolation, guide switches and publication gates.");
