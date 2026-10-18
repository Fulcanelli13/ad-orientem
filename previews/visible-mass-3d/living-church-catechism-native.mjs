/**
 * Living Church -> native St Pius X Catechism (review-only).
 * Uses the ORIGINAL Formation owner, including its native question-focus logic.
 * This is a same-document bridge: never reaches into parent frames or guesses routes.
 */
export const LIVING_CHURCH_CATECHISM_HANDOFF_VERSION="AO_LC_CATECHISM_HANDOFF_V1";
export const REAL_PRESENCE_QUESTION=Object.freeze({routeId:"learn.catechism",sourceRef:"PX1912-Q322",number:322});
const ok=x=>x===true||x?.ok===true;
const fail=reason=>Object.freeze({ok:false,reason});
export function createLivingChurchCatechismNativeOwner(win,{sourceStatus,sourcePose,restorePose}={}){
 if(typeof sourceStatus!=="function"||typeof sourcePose!=="function"||
    typeof restorePose!=="function")throw Error("Original Visible Mass scene hooks required");
 let ownOpened=false;
 function validate({routeId,sourceRef,origin}={}){
  if(routeId!==REAL_PRESENCE_QUESTION.routeId||sourceRef!==REAL_PRESENCE_QUESTION.sourceRef)
   return fail("UNVERIFIED_SOURCE_REF");
  if(origin?.schema!=="AO_LIVING_CHURCH_CONTEXT_V1"||origin?.guide!=="pius-x"||
     origin?.scene?.sceneId!=="BROMPTON_ALTAR_2019_B"||
     origin?.scene?.photoId!=="BROMPTON_ALTAR_2019_B")
   return fail("UNVERIFIED_ORIGIN");
  if(!Number.isFinite(origin.scene.pose?.x)||!Number.isFinite(origin.scene.pose?.y))
   return fail("UNVERIFIED_POSE");
  const owner=sourceStatus();
  if(owner?.view!=="church"||owner?.photoMode!=="still")
   return fail("ORIGINAL_PHOTOGRAPH_NOT_ACTIVE");
  const learn=win?.AO_LEARN_APP_V1;
  if(!learn||typeof learn.status!=="function"||typeof learn.open!=="function"||
     typeof learn.openModule!=="function"||typeof learn.close!=="function"||
     typeof win?.AO_MODULES?.open!=="function")
   return fail("NATIVE_CATECHISM_NOT_IN_THIS_DOCUMENT");
  const state=learn.status();
  if(!state?.installed||state?.open||state?.child||ownOpened)
   return fail("FORMATION_OWNER_BUSY");
  return Object.freeze({ok:true});
 }
 return Object.freeze({
  authorize:async request=>validate(request),
  async open(request){
   const verdict=validate(request);if(!verdict.ok)return verdict;
   const learn=win.AO_LEARN_APP_V1;
   let started=false;
   try{
    started=ok(await learn.open());
    if(!started)return fail("FORMATION_OPEN_FAILED");
    const opened=await learn.openModule("learn.catechism",{
      catechismQuestion:REAL_PRESENCE_QUESTION.number,
      returnContext:{surface:"visible-mass",origin:"living-church",
        sourceRef:REAL_PRESENCE_QUESTION.sourceRef}
    });
    const current=learn.status();
    if(!ok(opened)||!current?.open||current.child!=="learn.catechism"){
      learn.close();
      return fail("ORIGINAL_CATECHISM_QUESTION_NOT_OPEN");
    }
    ownOpened=true;
    return Object.freeze({ok:true,owner:"AO_LEARN_APP_V1",question:REAL_PRESENCE_QUESTION.number});
   }catch(error){
    if(started)try{learn.close()}catch{}
    return fail("NATIVE_CATECHISM_OPEN_FAILED");
   }
  },
  async restore(origin){
   if(!ownOpened)return fail("NO_OWNED_CATECHISM_HANDOFF");
   const learn=win?.AO_LEARN_APP_V1;
   if(typeof learn?.close!=="function")return fail("NATIVE_FORMATION_UNAVAILABLE");
   try{
    if(!ok(await learn.close())||learn.status?.()?.open)return fail("FORMATION_CLOSE_FAILED");
    ownOpened=false;
    if(origin?.scene?.sceneId!=="BROMPTON_ALTAR_2019_B"||
       origin?.scene?.photoId!=="BROMPTON_ALTAR_2019_B")return fail("SCENE_NOT_RESTORABLE");
    const result=await restorePose(origin.scene.pose);
    if(!ok(result))return fail("SCENE_RESTORATION_FAILED");
    const current=sourceStatus(),pose=sourcePose();
    if(current?.view!=="church"||current?.photoMode!=="still"||
       Math.abs(pose?.x-origin.scene.pose.x)>2||
       Math.abs(pose?.y-origin.scene.pose.y)>2)
       return fail("SCENE_RESTORATION_FAILED");
    return Object.freeze({ok:true});
   }catch{return fail("SCENE_RESTORATION_FAILED");}
  },
  status:()=>Object.freeze({version:LIVING_CHURCH_CATECHISM_HANDOFF_VERSION,
   nativeAvailable:typeof win?.AO_LEARN_APP_V1?.openModule==="function",
   ownsNativeSession:ownOpened})
 });
}
