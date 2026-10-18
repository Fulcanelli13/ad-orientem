/**
 * The Living Church P1 adapter in the ORIGINAL Visible Mass research viewer.
 * This is NOT a second VMQ registry, chatbot, guide director or Mass reader.
 */
import {createLivingChurchContext} from "../../src/learn/living-church-context.js";
export const VISIBLE_MASS_LC_ADAPTER_VERSION="AO_VISIBLE_MASS_LC_P1";
export const VISIBLE_MASS_LC_SCENES=Object.freeze({
 still:"BROMPTON_ALTAR_2019_B",brompton:"BROMPTON_PANO",newman:"NEWMAN_360"
});
export const VISIBLE_MASS_LC_SIX_OBJECTS=Object.freeze([
 "AL01","AL06","AL07","AL19","SN02","SN04"
]);
const allowedObjects=new Set(VISIBLE_MASS_LC_SIX_OBJECTS);
function sceneFromOwner(status){
 if(status?.view==="church"&&status.photoMode==="still")return VISIBLE_MASS_LC_SCENES.still;
 if(status?.view==="panorama"&&["brompton","newman"].includes(status.photoMode))
  return VISIBLE_MASS_LC_SCENES[status.photoMode];
 return null; // inspection / closer photo is NOT one of our exact P1 scene bindings
}
function asPose(input,sceneId){
 const p=input&&typeof input==="object"?input:null;
 if(!p)return null;
 if(sceneId===VISIBLE_MASS_LC_SCENES.still){
  const x=p.x,y=p.y;
  return Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&y>=0?{x,y}:null;
 }
 return [p.yaw,p.pitch,p.fov].every(Number.isFinite)?
   {yaw:p.yaw,pitch:p.pitch,fov:p.fov}:null;
}
function same(a,b){return JSON.stringify(a)===JSON.stringify(b);}
export function createVisibleMassLivingChurchAdapter({
 pilot,graph,sourceStatus,sourcePose,reviewEnabled,nativeCatechism=null
}={}){
 if(pilot?.schema!=="AO_VISIBLE_MASS_P1_SANCTUARY_QUESTION_RECONCILIATION_V1"||
   !Array.isArray(pilot?.objects)||!Array.isArray(pilot?.questions)||
   !Array.isArray(graph?.trails)||graph.trails.length!==4||
   graph.exactPhotoBinding!==VISIBLE_MASS_LC_SCENES.still||
   !Array.isArray(graph.visibleHotspotIds)||graph.visibleHotspotIds.length!==6||
   graph.visibleHotspotIds.some(x=>!allowedObjects.has(x)))
  throw Error("Original Visible Mass owner manifests required");
 if(typeof sourceStatus!=="function"||typeof sourcePose!=="function"||
   typeof reviewEnabled!=="function")throw Error("Missing exact scene owner hooks");
 const objects=new Map(pilot.objects.map(o=>[o.object_id,o]));
 const questions=new Map(pilot.questions.map(q=>[q.id,q]));
 const trails=new Set(graph.trails.map(t=>t.id));
 const sceneAllowed=s=>Object.values(VISIBLE_MASS_LC_SCENES).includes(s.sceneId)&&
   s.photoId===s.sceneId&&asPose(s.pose,s.sceneId)!==null;
 const bridge=createLivingChurchContext({
  reviewEnabled,
  verifyScene:sceneAllowed,
  verifyObject:(scene,id)=>scene.sceneId===VISIBLE_MASS_LC_SCENES.still&&
    allowedObjects.has(id)&&objects.has(id),
  verifyQuestion:({scene,objectId,questionId})=>
    scene?.sceneId===VISIBLE_MASS_LC_SCENES.still&&
    questions.get(questionId)?.primary_object_id===objectId&&
    objects.get(objectId)?.question_ids?.includes(questionId)===true,
  verifyTrail:id=>trails.has(id),
  // An avatar or object is not evidence of a Catechism or rubric relationship.
  verifyGuideReferral:()=>false,
  // P1 is contextual state only. The existing P5->Mass Explorer native route
  // remains owned by the original viewer; P2 must explicitly integrate it.
  authorizeDestination:async request=>nativeCatechism?.authorize?.(request)??false,
  openDestination:async request=>nativeCatechism?.open?.(request)??({ok:false}),
  restoreScene:async origin=>nativeCatechism?.restore?.(origin)??({ok:false})
 });
 let supported=false;
 function sync(){
  // An active native Catechism handoff owns the transition until explicit return.
  // Do not replace the origin scene while its source-owned child is open.
  if(bridge.status().suspended)return Object.freeze({ok:true,suspended:true,context:bridge.snapshot()});
  if(!reviewEnabled()){supported=false;return Object.freeze({ok:false,code:"REVIEW_GATE_CLOSED"});}
  const source=sourceStatus(),sceneId=sceneFromOwner(source);
  if(!sceneId){supported=false;return Object.freeze({ok:false,code:"SCENE_NOT_IN_P1_SLICE"});}
  const pose=asPose(sourcePose(source),sceneId);
  if(!pose){supported=false;return Object.freeze({ok:false,code:"SCENE_POSE_UNAVAILABLE"});}
  const current=bridge.snapshot();
  const proposed={sceneId,photoId:sceneId,pose};
  // Exact owner state is authoritative: reset derived context if a source
  // object/question/trail disappeared or the original venue changed.
  const reset=!same({sceneId:current.scene?.sceneId,photoId:current.scene?.photoId},
                    {sceneId,photoId:sceneId})||
    Boolean(current.objectId)&&current.objectId!==source.selected||
    Boolean(current.questionId)&&current.questionId!==source.question||
    Boolean(current.trailId)&&current.trailId!==(source.trailId||null);
  let verdict;
  if(reset||!current.scene){verdict=bridge.enterScene(proposed);}
  else if(!same(current.scene.pose,pose)){verdict=bridge.updateScenePose(pose);}
  else verdict={ok:true};
  if(!verdict.ok){supported=false;return verdict;}
  if(source.trailId&&bridge.snapshot().trailId!==source.trailId){
   verdict=bridge.chooseTrail(source.trailId);if(!verdict.ok)return verdict;
  }
  if(source.selected&&bridge.snapshot().objectId!==source.selected){
   verdict=bridge.selectObject(source.selected);if(!verdict.ok)return verdict;
  }
  if(source.question&&bridge.snapshot().questionId!==source.question){
   verdict=bridge.selectQuestion(source.question);if(!verdict.ok)return verdict;
  }
  if(["explore","discover","understand"].includes(source.mode)&&
     bridge.snapshot().mode!==source.mode){
   verdict=bridge.setMode(source.mode);if(!verdict.ok)return verdict;
  }
  if(["en","fr"].includes(source.lang)&&bridge.snapshot().lang!==source.lang)
   bridge.setLanguage(source.lang);
  supported=true;return Object.freeze({ok:true,context:bridge.snapshot()});
 }
 return Object.freeze({
  sync,
  chooseGuide:(id)=>supported?bridge.chooseGuide(id):Object.freeze({ok:false,code:"SCENE_NOT_IN_P1_SLICE"}),
  handoff:(request)=>supported?bridge.handoff(request):Promise.resolve(Object.freeze({ok:false,code:"SCENE_NOT_IN_P1_SLICE"})),
  returnFromHandoff:(token)=>bridge.returnFromHandoff(token),
  status:()=>{
   const owner=bridge.status();
   return Object.freeze({version:VISIBLE_MASS_LC_ADAPTER_VERSION,
    publication:"UNPUBLISHED_REVIEW_ONLY",sceneSupported:supported,
    ...owner,context:supported&&owner.enabled?owner.context:null,
    massHandoffIntegrated:false,
    catechismHandoffReady:typeof nativeCatechism?.authorize==="function"&&nativeCatechism.status?.().nativeAvailable===true,
   answersOwnedBy:"ORIGINAL_VISIBLE_MASS_AND_CATECHISM",
    trailsOwnedBy:"ORIGINAL_VISIBLE_MASS_DIALOGUE_DIRECTOR"});
  },
  // No public answer, speaker impersonation, or native navigation exposed.
 });
}
