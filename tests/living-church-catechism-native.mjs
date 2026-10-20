import assert from "node:assert/strict";
import {createLivingChurchCatechismNativeOwner,REAL_PRESENCE_QUESTION} from "../previews/visible-mass-3d/living-church-catechism-native.mjs";
assert.equal(REAL_PRESENCE_QUESTION.sourceRef,"PX1912-Q322");
assert.equal(REAL_PRESENCE_QUESTION.number,322);
const witness=JSON.parse(await (await import("node:fs/promises")).readFile(new URL("../data/learn/ltfaith-pius-x-en-witness-index.v1.json",import.meta.url),"utf8"));
const q=witness.entries.find(x=>x.q===322);
assert.ok(q?.q_stem?.startsWith("Is the same Jesus Christ in"),"Do not guess a canonical Catechism question ID");
const source={view:"church",photoMode:"still"};
let pose={x:123,y:15},returned=false,openCalls=[],learn={open:false,child:null,installed:true};
const windowStub={AO_MODULES:{open:async()=>({ok:true})},AO_LEARN_APP_V1:{
 status:()=>({...learn}),
 open:()=>{learn.open=true;return true;},
 openModule:async(id,options)=>{openCalls.push({id,options});learn.child=id;return true;},
 close:()=>{learn.open=false;learn.child=null;return true;}
}};
const owner=createLivingChurchCatechismNativeOwner(windowStub,{
 sourceStatus:()=>({...source}),sourcePose:()=>({...pose}),
 restorePose:async value=>{pose={...value};returned=true;return {ok:true};}
});
const origin={schema:"AO_LIVING_CHURCH_CONTEXT_V1",guide:"pius-x",
 scene:{sceneId:"BROMPTON_ALTAR_2019_B",photoId:"BROMPTON_ALTAR_2019_B",pose:{x:123,y:15}},
 objectId:null,questionId:null,trailId:null,mode:"explore",lang:"en"};
const valid={routeId:"learn.catechism",sourceRef:"PX1912-Q322",origin};
assert.equal((await owner.authorize({...valid,sourceRef:"PX1912-Q315"})).ok,false);
assert.equal((await owner.authorize({...valid,origin:{...origin,guide:"canon"}})).ok,false);
assert.equal((await owner.authorize({...valid,origin:{...origin,scene:{...origin.scene,sceneId:"NEWMAN_360"}}})).ok,false);
assert.equal((await owner.authorize(valid)).ok,true);
assert.equal((await owner.open(valid)).ok,true);
assert.equal(openCalls.length,1);
assert.equal(openCalls[0].id,"learn.catechism");
assert.equal(openCalls[0].options.catechismQuestion,322);
assert.equal(openCalls[0].options.returnContext.sourceRef,"PX1912-Q322");
assert.equal((await owner.open(valid)).ok,false,"prevent concurrent native launches");
pose={x:15,y:99};
assert.equal((await owner.restore(origin)).ok,true);
assert.equal(returned,true);
assert.deepEqual(pose,origin.scene.pose);
assert.equal(learn.open,false);
assert.equal((await owner.restore(origin)).ok,false,"cannot reuse return without a pending owned session");
const foreign={AO_MODULES:windowStub.AO_MODULES};
const isolated=createLivingChurchCatechismNativeOwner(foreign,{
 sourceStatus:()=>source,sourcePose:()=>pose,restorePose:async()=>({ok:true})
});
assert.equal((await isolated.authorize(valid)).ok,false);
assert.equal((await isolated.open(valid)).ok,false);
assert.equal(isolated.status().ownsNativeSession,false);
console.log("PASS source-owned St Pius X Q322 native bridge / return / denial / no duplicate answers");
