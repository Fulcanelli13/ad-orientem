/**
 * The Living Church P0 — shared visitor-context contract (review only).
 *
 * This is a navigation/session layer, not a catechetical, liturgical, historical,
 * photographic or AI-answer source. Every source ID must be confirmed by its
 * owning module. Do not import research answers into public surfaces here.
 */
export const LIVING_CHURCH_CONTEXT_VERSION="AO_LIVING_CHURCH_CONTEXT_V1";
export const LIVING_CHURCH_GUIDES=Object.freeze(["sacristan","canon","pius-x"]);
export const LIVING_CHURCH_MODES=Object.freeze(["explore","discover","understand"]);
const guides=new Set(LIVING_CHURCH_GUIDES),modes=new Set(LIVING_CHURCH_MODES);
const failure=(code)=>Object.freeze({ok:false,code});
const success=()=>Object.freeze({ok:true});
const validId=x=>typeof x==="string"&&x.length>0&&x.length<=128&&/^[A-Za-z0-9_.:-]+$/.test(x);
const approved=x=>x===true||x?.ok===true;
const copyPose=pose=>{
 if(pose==null)return null;
 if(!pose||typeof pose!=="object"||Array.isArray(pose))return null;
 const allowed=["x","y","yaw","pitch","fov","zoom"],out={};
 const keys=Object.keys(pose);
 if(!keys.length||keys.some(k=>!allowed.includes(k)))return null;
 for(const k of keys){
  if(typeof pose[k]!=="number"||!Number.isFinite(pose[k])||Math.abs(pose[k])>1e6)return null;
  out[k]=pose[k];
 }
 return Object.freeze(out);
};
function immutableContext(s){
 const scene=s.scene?Object.freeze({...s.scene,pose:s.scene.pose&&Object.freeze({...s.scene.pose})}):null;
 return Object.freeze({
  schema:LIVING_CHURCH_CONTEXT_VERSION,
  publication:"REVIEW_ONLY_NO_ANSWERS",
  mode:s.mode,scene,objectId:s.objectId,questionId:s.questionId,
  trailId:s.trailId,guide:s.guide,lang:s.lang,
  // Actual visited/skipped questions remain exclusively with the Visible Mass director.
  visitedOwnedBy:"VISIBLE_MASS_SOURCE_DIRECTOR",
  objectiveOwnedBy:"ASK_CHURCH_OBJECTIVE_ENGINE"
 });
}
/**
 * All trust checks are explicitly injected by SOURCE OWNERS.
 * verifyScene: exact photographic scene/photo and pose identity
 * verifyObject: object belongs to active scene and a real certified hotspot
 * verifyQuestion: actual source question belongs to selected object
 * verifyTrail: existing Visible Mass trail
 * verifyGuideReferral: valid original source link between two domains
 * authorizeDestination: existing published route and source/action permission
 * openDestination: existing native owner; return {ok:true} only after open
 * restoreScene: restore original source photo, camera, object and focus
 */
export function createLivingChurchContext({
 reviewEnabled=()=>false,verifyScene,verifyObject,verifyQuestion,verifyTrail,
 verifyGuideReferral,authorizeDestination,openDestination,restoreScene
}={}){
 for(const [name,fn] of Object.entries({verifyScene,verifyObject,verifyQuestion,verifyTrail,
   verifyGuideReferral,authorizeDestination,openDestination,restoreScene}))
  if(typeof fn!=="function")throw Error("Missing source-owned Living Church adapter: "+name);
 const state={scene:null,objectId:null,questionId:null,trailId:null,guide:null,
   mode:"explore",lang:"en"};
 let pending=false,suspended=null,nextToken=0;
 const enabled=()=>reviewEnabled()===true;
 const snapshot=()=>immutableContext(state);
 function enterScene({sceneId,photoId,pose=null}={}){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(!validId(sceneId)||!validId(photoId)||pose!==null&&!copyPose(pose))
   return failure("INVALID_SCENE");
  const proposed=Object.freeze({sceneId,photoId,pose:copyPose(pose)});
  if(!approved(verifyScene(proposed)))return failure("SCENE_NOT_SOURCE_VERIFIED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  state.scene=proposed;state.objectId=null;state.questionId=null;
  state.trailId=null;state.mode="explore";
  return success();
 }
 function selectObject(objectId){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!state.scene||!validId(objectId)||!approved(verifyObject(state.scene,objectId)))
   return failure("OBJECT_NOT_SOURCE_VERIFIED");
  state.objectId=objectId;state.questionId=null;state.mode="understand";
  return success();
 }
 function selectQuestion(questionId){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!state.objectId||!validId(questionId)||
     !approved(verifyQuestion({scene:state.scene,objectId:state.objectId,questionId})))
    return failure("QUESTION_NOT_SOURCE_VERIFIED");
  // Question identity is not answer approval or a 'read' event.
  state.questionId=questionId;state.mode="understand";
  return success();
 }
 function chooseTrail(trailId){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!state.scene||!validId(trailId)||!approved(verifyTrail(trailId)))
   return failure("TRAIL_NOT_SOURCE_VERIFIED");
  state.trailId=trailId;state.mode="discover";return success();
 }
 function setMode(mode){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!modes.has(mode)||mode==="understand"&&!state.objectId)return failure("INVALID_MODE");
  state.mode=mode;return success();
 }
 function chooseGuide(guide,{sourceRef=null}={}){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!guides.has(guide))return failure("UNKNOWN_GUIDE");
  // A persona choice never implies the existence of an authorised answer.
  if(sourceRef!==null&&(!validId(sourceRef)||
     !approved(verifyGuideReferral({from:state.guide,to:guide,sourceRef,context:snapshot()}))))
    return failure("GUIDE_REFERRAL_UNVERIFIED");
  state.guide=guide;return success();
 }
 function setLanguage(language){
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(language!=="en"&&language!=="fr")return failure("UNSUPPORTED_LANGUAGE");
  state.lang=language;return success();
 }
 function updateScenePose(pose){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!state.scene||!copyPose(pose))return failure("INVALID_SCENE_POSE");
  const proposed=Object.freeze({...state.scene,pose:copyPose(pose)});
  if(!approved(verifyScene(proposed)))return failure("SCENE_NOT_SOURCE_VERIFIED");
  state.scene=proposed;return success();
 }
 async function handoff({routeId,sourceRef=null}={}){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||suspended)return failure("HANDOFF_IN_PROGRESS");
  if(!state.scene||!validId(routeId)||sourceRef!==null&&!validId(sourceRef))
   return failure("INVALID_DESTINATION");
  const origin=snapshot();
  // Lock before async authorization to prevent competing native transitions.
  pending=true;
  try{
   let permission;
   try{permission=await authorizeDestination({routeId,sourceRef,origin});}
   catch{return failure("DESTINATION_AUTHORITY_UNAVAILABLE");}
   if(!approved(permission)||permission?.researchOnly===true)
    return failure("DESTINATION_NOT_APPROVED");
   if(!enabled())return failure("REVIEW_GATE_CLOSED");
   let opened;
   try{opened=await openDestination({routeId,sourceRef,origin});}
   catch{return failure("NATIVE_OWNER_FAILED");}
   if(!approved(opened))return failure("DESTINATION_NOT_OPEN");
   const token="LC-RETURN-"+(++nextToken);
   suspended=Object.freeze({token,routeId,origin});
   return Object.freeze({ok:true,routeId,returnToken:token});
  }finally{pending=false;}
 }
 async function returnFromHandoff(returnToken){
  if(!enabled())return failure("REVIEW_GATE_CLOSED");
  if(pending||!suspended||returnToken!==suspended.token)return failure("INVALID_RETURN_TOKEN");
  pending=true;
  try{
   // The actual scene owner must restore the photo/camera and native focus.
   const restored=await restoreScene(suspended.origin);
   if(!approved(restored))return failure("SCENE_RESTORATION_FAILED");
   // State was not overwritten by the destination; exact origin remains intact.
   suspended=null;return Object.freeze({ok:true,context:snapshot()});
  }catch{return failure("SCENE_RESTORATION_FAILED");}
  finally{pending=false;}
 }
 const status=()=>Object.freeze({enabled:enabled(),pending,suspended:Boolean(suspended),
   returnToken:suspended?.token||null,context:snapshot()});
 return Object.freeze({enterScene,updateScenePose,selectObject,selectQuestion,chooseTrail,setMode,
  chooseGuide,setLanguage,handoff,returnFromHandoff,snapshot,status});
}
