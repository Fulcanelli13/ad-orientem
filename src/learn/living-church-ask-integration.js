/**
 * Living Church P2: Ask the Church is the canonical objective router; the
 * original Visible Mass iframe retains the authentic scene and VMQ director.
 *
 * This adapter never publishes draft answers or gives the iframe the parent
 * app shell. Its first verified native round-trip is ONLY Mass Explorer.
 */
import {mountAskChurchGuide} from "./ask-church-guided-preview.js";
import {visibleMassResearchMomentLinks} from "../../previews/visible-mass-3d/photographic-published-explorer-handoff.mjs";

export const LIVING_CHURCH_ASK_P2_VERSION="AO_LIVING_CHURCH_ASK_P2_REVIEW";
const fail=code=>Object.freeze({ok:false,code});
const supported="learn.mass_explorer";
const compact=source=>JSON.stringify({
  scene:source?.scene,objectId:source?.objectId,questionId:source?.questionId,
  trailId:source?.trailId,guide:source?.guide,lang:source?.lang,mode:source?.mode
});
export function livingChurchAskReviewEnabled(win=globalThis){
 const p=new URLSearchParams(win?.location?.search||"");
 return p.get("aoVisibleMassReview")==="1"&&p.get("aoLivingChurchReview")==="1";
}
export function createLivingChurchAskIntegration(win=globalThis,{frame,returnButton,survey}={}){
 if(!frame||!returnButton||survey?.schema!=="AO_ASK_CHURCH_APP_ROUTE_SURVEY_V1")
  throw Error("Original native reviewer and Ask the Church source survey required");
 let guide=null,opening=false,pending=false,suspended=null,disposed=false;
 const enabled=()=>!disposed&&livingChurchAskReviewEnabled(win)&&frame.isConnected===true;
 function child(){
  if(!enabled())return null;
  try{
   const view=frame.contentWindow;
   if(!view||view.location.origin!==win.location.origin)return null;
   return view;
  }catch{return null;}
 }
 function original(){
  const view=child();
  if(!view)return null;
  const data=view.AO_VISIBLE_MASS_LIVING_CHURCH_P1?.status?.();
  if(data?.enabled!==true||data?.sceneSupported!==true||
     data?.publication!=="UNPUBLISHED_REVIEW_ONLY"||
     data?.context?.publication!=="REVIEW_ONLY_NO_ANSWERS"||
     data?.context?.scene?.sceneId!=="BROMPTON_ALTAR_2019_B"||
     data?.context?.scene?.photoId!=="BROMPTON_ALTAR_2019_B"||
     !data?.context?.objectId)return null;
  // Source-owned question and read/skip data are untouched by this controller.
  const vmq=view.AO_VISIBLE_MASS_HOTSPOT_PILOT;
  const vmqStatus=vmq?.status?.();
  if(vmqStatus?.selected!==data.context.objectId||
     vmqStatus?.question!==data.context.questionId)return null;
  return Object.freeze({view,context:data.context,readCount:vmq?.guideStatus?.()?.readCount??null});
 }
 async function nativeOpen(targetId){
  if(!enabled())return fail("REVIEW_GATE_CLOSED");
  if(opening||pending||suspended)return fail("HANDOFF_IN_PROGRESS");
  // The original Ask objective engine owns all seven objectives and 26 paths.
  // Other destinations remain available for study but are intentionally held
  // for native-return verification, not sent to a mock router.
  if(targetId!==supported)return fail("RETURN_CONTRACT_NOT_VERIFIED");
  const selection=original();
  if(!selection)return fail("SOURCE_OBJECT_NOT_VERIFIED");
  const candidates=visibleMassResearchMomentLinks(selection.context.objectId,{reviewMode:true});
  // Only sourced contextual candidate edges, not new rubric claims.
  const link=candidates.find(x=>x.destination===supported&&x.publication==="RESEARCH_CANDIDATE_NOT_RITUAL_INSTRUCTION");
  if(!link)return fail("UNREVIEWED_OBJECT_RELATION");
  const route=survey.routes.find(x=>x.id===targetId);
  if(!route||route.releaseGate==="RESEARCH_ONLY"||/GATED|RETIRED|ALIAS/.test(route.routeStatus||""))
   return fail("DESTINATION_PUBLICATION_HOLD");
  const native=selection.view.AO_MODULES;
  if(typeof native?.open!=="function")return fail("ORIGINAL_MASS_EXPLORER_BRIDGE_UNAVAILABLE");
  opening=true;
  try{
   // Exactly the existing gated bridge in #1309; never give child AO_APP_SHELL.
   let result;
   try{result=await native.open(supported,{momentKey:link.guideId});}
   catch{return fail("NATIVE_OPEN_FAILED");}
   if(result!==true&&result?.ok!==true)return fail("NATIVE_OPEN_FAILED");
   if(!enabled())return fail("REVIEW_GATE_CLOSED");
   const owner=win?.AO_MASS_EXPLORER_V1;
   if(owner?.status?.()?.open===false||typeof owner?.close!=="function")
    return fail("NATIVE_RETURN_NOT_VERIFIED");
   suspended=Object.freeze({
    targetId,momentKey:link.guideId,
    context:selection.context,readCount:selection.readCount
   });
   returnButton.hidden=false;
   return Object.freeze({ok:true,surface:"learn",id:targetId});
  }finally{opening=false;}
 }
 async function returnToSanctuary(){
  if(!enabled())return fail("REVIEW_GATE_CLOSED");
  if(pending||opening||!suspended)return fail("NO_ACTIVE_NATIVE_HANDOFF");
  pending=true;
  try{
   const owner=win?.AO_MASS_EXPLORER_V1;
   if(typeof owner?.close!=="function")return fail("CANONICAL_OWNER_UNAVAILABLE");
   // Do not close the native module if the underlying scene or question has
   // already drifted; retain a meaningful, retryable error instead.
   const before=original();
   if(!before||compact(before.context)!==compact(suspended.context)||
      before.readCount!==suspended.readCount)return fail("EXACT_SANCTUARY_CONTEXT_MISMATCH");
   try{await owner.close();}catch{return fail("CANONICAL_CLOSE_FAILED");}
   if(owner?.status?.()?.open===true)return fail("CANONICAL_CLOSE_FAILED");
   const source=original();
   if(!source||compact(source.context)!==compact(suspended.context)||
      source.readCount!==suspended.readCount)return fail("EXACT_SANCTUARY_CONTEXT_MISMATCH");
   // The same original iframe remains mounted: no camera reset, fabricated
   // route recreation, question replay or read/skip state rewrite.
   guide?.hide?.();
   returnButton.hidden=true;
   source.view.AO_VISIBLE_MASS_HOTSPOT_PILOT?.focusContext?.();
   try{frame.focus?.({preventScroll:true});}catch{}
   suspended=null;
   return Object.freeze({ok:true,scenePreserved:true});
  }finally{pending=false;}
 }
 async function openGuide(){
  if(!enabled())return fail("REVIEW_GATE_CLOSED");
  if(opening||pending||suspended)return fail("HANDOFF_IN_PROGRESS");
  const source=original();
  // Requiring a real source selected object avoids a conversational
  // claim about a photograph the user has not inspected.
  if(!source)return fail("SELECT_ORIGINAL_SANCTUARY_OBJECT_FIRST");
  if(!guide){
   guide=await mountAskChurchGuide(win,{
    survey,lang:source.context.lang,hostManagesReturn:true,
    bridge:Object.freeze({open:nativeOpen})
   });
  }else guide.show();
  return Object.freeze({ok:true,sourceObject:source.context.objectId});
 }
 function close(){
  disposed=true;
  guide?.close?.();
  guide=null;
  returnButton.hidden=true;
  suspended=null;
 }
 return Object.freeze({openGuide,returnToSanctuary,nativeOpen,close,
  sourceContext:()=>{const source=original();return source?Object.freeze({context:source.context,readCount:source.readCount}):null;},
  status:()=>Object.freeze({
  version:LIVING_CHURCH_ASK_P2_VERSION,reviewEnabled:enabled(),
  guideMounted:Boolean(guide),handoffPending:pending||opening,
  suspended:Boolean(suspended),returnMoment:suspended?.momentKey??null,
  ownedObjectives:survey.objectives.length,
  branchCount:survey.objectives.reduce((n,o)=>n+o.paths.length,0),
  nativeReturnSupported:[supported],researchAnswersPublished:false
 })});
}
