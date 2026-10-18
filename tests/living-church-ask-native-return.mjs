import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createLivingChurchAskIntegration,livingChurchAskReviewEnabled} from "../src/learn/living-church-ask-integration.js";
const survey=JSON.parse(readFileSync("data/learn/ask-church-app-route-survey.v1.json","utf8"));
assert.equal(survey.objectives.length,7);
assert.equal(survey.objectives.reduce((n,x)=>n+x.paths.length,0),26);
const clone=x=>JSON.parse(JSON.stringify(x));
function fixture({gate=true,objectId="AL01",questionId="VMQ-0001",scene="BROMPTON_ALTAR_2019_B",opened=true}={}){
 let isOpen=false,focusCalls=0,openCalls=[],closed=0;
 let ctx={schema:"AO_LIVING_CHURCH_CONTEXT_V1",publication:"REVIEW_ONLY_NO_ANSWERS",
  scene:{sceneId:scene,photoId:scene,pose:{x:320,y:120}},
  objectId,questionId,mode:"understand",guide:"sacristan",trailId:"FIRST_VISIT",lang:"en"};
 let readCount=3;
 const child={
  location:{origin:"http://localhost"},
  AO_VISIBLE_MASS_LIVING_CHURCH_P1:{status:()=>({
   enabled:gate,sceneSupported:gate,publication:"UNPUBLISHED_REVIEW_ONLY",context:ctx})},
  AO_VISIBLE_MASS_HOTSPOT_PILOT:{
   status:()=>({selected:ctx.objectId,question:ctx.questionId}),
   guideStatus:()=>({readCount}),
   focusContext:()=>{focusCalls++;return true;}
  },
  AO_MODULES:{open:async(route,options)=>{openCalls.push({route,options});isOpen=opened;return {ok:opened};}}
 };
 const frame={isConnected:true,contentWindow:child,focus:()=>{}};
 const win={
  location:{origin:"http://localhost",search:gate?"?aoVisibleMassReview=1&aoLivingChurchReview=1":"?aoVisibleMassReview=1"},
  AO_MASS_EXPLORER_V1:{status:()=>({open:isOpen}),close:()=>{closed++;isOpen=false;return true;}}
 };
 const returnButton={hidden:true};
 const api=createLivingChurchAskIntegration(win,{survey,frame,returnButton});
 return {api,frame,win,child,returnButton,openCalls,
  changeContext:newCtx=>{ctx={...ctx,...newCtx}},
  changeRead:n=>{readCount=n},
  getFocus:()=>focusCalls,getCloses:()=>closed};
}
assert.equal(livingChurchAskReviewEnabled({location:{search:"?aoLivingChurchReview=1"}}),false);
assert.equal(livingChurchAskReviewEnabled({location:{search:"?aoVisibleMassReview=1&aoLivingChurchReview=0"}}),false);
assert.equal(livingChurchAskReviewEnabled({location:{search:"?aoVisibleMassReview=1&aoLivingChurchReview=1"}}),true);
{
 const f=fixture({gate:false});
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).code,"REVIEW_GATE_CLOSED");
 assert.equal(f.openCalls.length,0);
}
{
 const f=fixture({objectId:null,questionId:null});
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).code,"SOURCE_OBJECT_NOT_VERIFIED");
 assert.equal(f.openCalls.length,0);
}
{
 const f=fixture({scene:"NEWMAN_360"});
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).code,"SOURCE_OBJECT_NOT_VERIFIED");
 assert.equal(f.openCalls.length,0);
}
{
 const f=fixture({objectId:"AL19",questionId:"VMQ-0052"});
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).code,"UNREVIEWED_OBJECT_RELATION");
 assert.equal(f.openCalls.length,0);
}
{
 const f=fixture({objectId:"AL06",questionId:"VMQ-0013"});
 const result=await f.api.nativeOpen("learn.mass_explorer");
 assert.equal(result.ok,true);
 assert.deepEqual(f.openCalls[0],{route:"learn.mass_explorer",options:{momentKey:"AO.CARD.015"}});
}
{
 const f=fixture(),api=f.api;
 for(const id of ["learn.catechism","pray.confession","apostolate:HS02","learn.church_crisis","learn.apologetics","explore.lens.shrines"]){
  assert.equal((await api.nativeOpen(id)).code,"RETURN_CONTRACT_NOT_VERIFIED");
 }
 assert.equal(f.openCalls.length,0,"all other existing Ask targets remain held from this source entry");
 assert.equal(api.status().ownedObjectives,7);
 assert.equal(api.status().branchCount,26);
 const ok=await api.nativeOpen("learn.mass_explorer");
 assert.deepEqual(ok,{ok:true,surface:"learn",id:"learn.mass_explorer"});
 assert.deepEqual(f.openCalls,[{route:"learn.mass_explorer",options:{momentKey:"AO.CARD.010"}}]);
 assert.equal(f.returnButton.hidden,false);
 assert.equal(api.status().suspended,true);
 assert.equal((await api.nativeOpen("learn.mass_explorer")).code,"HANDOFF_IN_PROGRESS");
 const back=await api.returnToSanctuary();
 assert.deepEqual(back,{ok:true,scenePreserved:true});
 assert.equal(f.returnButton.hidden,true);
 assert.equal(f.getCloses(),1);
 assert.equal(f.getFocus(),1);
 assert.equal(api.status().suspended,false);
 assert.equal((await api.returnToSanctuary()).code,"NO_ACTIVE_NATIVE_HANDOFF");
 api.close();
}
{
 const f=fixture();
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).ok,true);
 f.changeContext({questionId:"VMQ-0002"});
 assert.equal((await f.api.returnToSanctuary()).code,"EXACT_SANCTUARY_CONTEXT_MISMATCH");
 assert.equal(f.getCloses(),0,"unsafe scene drift must not close the native owner");
 assert.equal(f.returnButton.hidden,false);
 assert.equal(f.api.status().suspended,true,"no false return acknowledgement");
}
{
 const f=fixture();
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).ok,true);
 f.changeRead(10);
 assert.equal((await f.api.returnToSanctuary()).code,"EXACT_SANCTUARY_CONTEXT_MISMATCH");
 assert.equal(f.getCloses(),0,"read-count drift must not dismiss the native destination");
 assert.equal(f.api.status().suspended,true);
}
{
 const f=fixture({opened:false});
 assert.equal((await f.api.nativeOpen("learn.mass_explorer")).code,"NATIVE_OPEN_FAILED");
 assert.equal(f.returnButton.hidden,true);
 assert.equal(f.api.status().suspended,false);
}
console.log("Living Church P2 PASS: original Ask 7/26 routing owner, reviewed AL01/AL06 Mass context, native return, fail-closed destinations, source continuity");
