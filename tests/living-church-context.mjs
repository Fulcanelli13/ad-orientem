import assert from "node:assert/strict";
import {createLivingChurchContext,LIVING_CHURCH_CONTEXT_VERSION} from "../src/learn/living-church-context.js";
// Structural test: IDs below are the real cross-pipeline identities, but this
// fake owner is NOT a claim of doctrinal or photographic source certification.
const SOURCE={sceneId:"BROMPTON_ALTAR_2019_B",photoId:"BROMPTON_ALTAR_2019_B"};
function deferred(){let resolve;const promise=new Promise(r=>resolve=r);return {resolve,promise};}
function fixture({review=true,canOpen=true}={}){
 let enabled=review,openCalls=[],restored=[],approvals=[];
 const checked={
  verifyScene:s=>s.sceneId===SOURCE.sceneId&&s.photoId===SOURCE.photoId,
  verifyObject:(s,id)=>s.sceneId===SOURCE.sceneId&&["AL01","AL06","SN02"].includes(id),
  verifyQuestion:({objectId,questionId})=>(
   objectId==="AL01"&&questionId==="VMQ-0001"||
   objectId==="AL06"&&questionId==="VMQ-0013"),
  verifyTrail:id=>["FIRST_VISIT","ALTAR_MYSTERY"].includes(id),
  verifyGuideReferral:({to,sourceRef})=>
   to==="canon"&&sourceRef==="AO.CARD.010"||
   to==="pius-x"&&sourceRef==="CATECHISM:Q001",
  authorizeDestination:async req=>{approvals.push(req);
   return req.routeId==="learn.mass_explorer"&&req.sourceRef==="AO.CARD.010"||
     req.routeId==="learn.catechism"&&req.sourceRef==="CATECHISM:Q001";},
  openDestination:async req=>{openCalls.push(req);return {ok:canOpen};},
  restoreScene:async origin=>{restored.push(origin);return {ok:true};}
 };
 const api=createLivingChurchContext({reviewEnabled:()=>enabled,...checked});
 return {api,openCalls,restored,approvals,changeEnabled:v=>{enabled=v},checked};
}
{
 const f=fixture({review:false}),a=f.api;
 assert.equal(a.status().enabled,false);
 assert.equal(a.enterScene(SOURCE).code,"REVIEW_GATE_CLOSED");
 assert.equal(a.chooseGuide("sacristan").code,"REVIEW_GATE_CLOSED");
 assert.equal((await a.handoff({routeId:"learn.mass_explorer"})).code,"REVIEW_GATE_CLOSED");
}
{
 const f=fixture(),a=f.api;
 assert.equal(a.enterScene({sceneId:"MADE_UP_CHURCH",photoId:SOURCE.photoId}).code,"SCENE_NOT_SOURCE_VERIFIED");
 assert.equal(a.enterScene({...SOURCE,pose:{x:Infinity}}).code,"INVALID_SCENE");
 assert.equal(a.selectObject("AL01").code,"OBJECT_NOT_SOURCE_VERIFIED");
 assert.equal(a.setMode("understand").code,"INVALID_MODE");
 assert.equal(a.enterScene({...SOURCE,pose:{x:43,y:50}}).ok,true);
 assert.equal(a.selectObject("AL19").code,"OBJECT_NOT_SOURCE_VERIFIED");
 assert.equal(a.chooseTrail("UNKNOWN").code,"TRAIL_NOT_SOURCE_VERIFIED");
 assert.equal(a.chooseTrail("FIRST_VISIT").ok,true);
 assert.equal(a.selectObject("AL01").ok,true);
 assert.equal(a.selectQuestion("VMQ-0001").ok,true);
 assert.equal(a.selectQuestion("VMQ-9999").code,"QUESTION_NOT_SOURCE_VERIFIED");
 assert.equal(a.chooseGuide("sacristan").ok,true);
 assert.equal(a.chooseGuide("abbot").code,"UNKNOWN_GUIDE");
 assert.equal(a.chooseGuide("canon",{sourceRef:"UNVERIFIED"}).code,"GUIDE_REFERRAL_UNVERIFIED");
 assert.equal(a.chooseGuide("canon",{sourceRef:"AO.CARD.010"}).ok,true);
 assert.equal(a.setLanguage("fr").ok,true);
 assert.equal(a.setLanguage("it").code,"UNSUPPORTED_LANGUAGE");
 assert.equal(a.updateScenePose({yaw:1.8,pitch:0.2,zoom:1.5}).ok,true);
 const original=a.snapshot();
 assert.equal(original.schema,LIVING_CHURCH_CONTEXT_VERSION);
 assert.deepEqual(Object.keys(original).sort(),[
  "guide","lang","mode","objectId","objectiveOwnedBy","publication","questionId",
  "scene","schema","trailId","visitedOwnedBy"].sort());
 assert.equal(original.questionId,"VMQ-0001");
 assert.equal(original.mode,"understand");
 assert.equal(original.guide,"canon");
 assert.equal(original.scene.pose.yaw,1.8);
 assert.equal(Object.isFrozen(original.scene.pose),true);
 assert.equal(Object.isFrozen(original),true);
 assert.equal("freeMessage" in original,false);
 assert.equal("questionAnswers" in original,false);
 const failed=await a.handoff({routeId:"learn.mass_explorer",sourceRef:"AO.CARD.999"});
 assert.equal(failed.code,"DESTINATION_NOT_APPROVED");
 assert.equal(f.openCalls.length,0);
 const result=await a.handoff({routeId:"learn.mass_explorer",sourceRef:"AO.CARD.010"});
 assert.equal(result.ok,true);
 assert.equal(f.openCalls.length,1);
 assert.deepEqual(f.openCalls[0].origin,original);
 assert.equal(a.chooseGuide("pius-x").code,"HANDOFF_IN_PROGRESS");
 assert.equal(a.updateScenePose({zoom:2}).code,"HANDOFF_IN_PROGRESS");
 assert.equal((await a.returnFromHandoff("FAKE-TOKEN")).code,"INVALID_RETURN_TOKEN");
 const returned=await a.returnFromHandoff(result.returnToken);
 assert.equal(returned.ok,true);
 assert.deepEqual(returned.context,original);
 assert.deepEqual(f.restored[0],original);
 assert.equal(a.status().suspended,false);
 assert.equal((await a.returnFromHandoff(result.returnToken)).code,"INVALID_RETURN_TOKEN");
}
{
 const f=fixture({canOpen:false}),a=f.api;
 a.enterScene(SOURCE);
 assert.equal((await a.handoff({routeId:"learn.mass_explorer",sourceRef:"AO.CARD.010"})).code,"DESTINATION_NOT_OPEN");
 assert.equal(a.status().suspended,false);
}
{
 const f=fixture(),gate=deferred(),a=createLivingChurchContext({
  reviewEnabled:()=>true,
  ...f.checked,
  authorizeDestination:async req=>{await gate.promise;return true;}
 });
 assert.equal(a.enterScene(SOURCE).ok,true);
 const first=a.handoff({routeId:"learn.mass_explorer"});
 assert.equal((await a.handoff({routeId:"learn.catechism"})).code,"HANDOFF_IN_PROGRESS");
 gate.resolve();
 const firstResult=await first;
 assert.equal(firstResult.ok,true);
 assert.equal(f.openCalls.length,1);
 await a.returnFromHandoff(firstResult.returnToken);
}
{
 const f=fixture(),a=f.api;
 a.enterScene(SOURCE);a.selectObject("AL06");a.selectQuestion("VMQ-0013");
 a.chooseGuide("pius-x",{sourceRef:"CATECHISM:Q001"});
 assert.equal(a.snapshot().guide,"pius-x");
 const ok=await a.handoff({routeId:"learn.catechism",sourceRef:"CATECHISM:Q001"});
 assert.equal(ok.ok,true);
 f.changeEnabled(false);
 assert.equal((await a.returnFromHandoff(ok.returnToken)).code,"REVIEW_GATE_CLOSED");
 f.changeEnabled(true);
 assert.equal((await a.returnFromHandoff(ok.returnToken)).ok,true);
}
{
 const bad=["verifyScene","verifyObject","verifyQuestion","verifyTrail","verifyGuideReferral",
  "authorizeDestination","openDestination","restoreScene"];
 for(const missing of bad){
  const all=fixture().checked;
  delete all[missing];
  assert.throws(()=>createLivingChurchContext({...all}),/Missing source-owned/);
 }
}
console.log("Living Church shared context PASS: research gate, exact scene, source authority, referrals, native handoff, concurrency, camera pose, return, privacy");
