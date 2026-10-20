/** Review-only source-scoped Mass Explorer delegation. No ritual text or guide copy. */
export const LIVING_CHURCH_MASS_NATIVE_V1="AO_LC_MASS_NATIVE_V1";
const fail=reason=>Object.freeze({ok:false,reason});
const ok=x=>x===true||x?.ok===true;
export function createLivingChurchMassNativeOwner(win,{sourceStatus,sourcePose,restorePose}={}){
 if(!sourceStatus||!sourcePose||!restorePose)throw Error("Original source scene hooks required");
 let owned=false;
 function validate({routeId,sourceRef,origin}={}){
  if(routeId!=="learn.mass_explorer"||sourceRef!=="AO.CARD.015"||
     origin?.schema!=="AO_LIVING_CHURCH_CONTEXT_V1"||
     origin?.guide!=="canon"||origin?.scene?.sceneId!=="BROMPTON_ALTAR_2019_B"||
     origin?.scene?.photoId!=="BROMPTON_ALTAR_2019_B"||
     !Number.isFinite(origin.scene.pose?.x)||!Number.isFinite(origin.scene.pose?.y))
   return fail("SOURCE_ORIGIN_NOT_VERIFIED");
  const source=sourceStatus();
  if(source?.view!=="church"||source?.photoMode!=="still")
   return fail("ORIGINAL_PHOTOGRAPH_NOT_ACTIVE");
  const delegate=win?.AO_LIVING_CHURCH_MASS_NATIVE_V1;
  if(!delegate?.open||!delegate?.restore||!delegate?.status)
   return fail("MASS_OWNER_NOT_IN_STANDALONE_PREVIEW");
  if(owned||delegate.status()?.owned)return fail("NATIVE_OWNER_BUSY");
  return Object.freeze({ok:true});
 }
 return Object.freeze({
  authorize:async request=>validate(request),
  async open(request){
   const allowed=validate(request);if(!allowed.ok)return allowed;
   try{
    const result=await win.AO_LIVING_CHURCH_MASS_NATIVE_V1.open({
     routeId:request.routeId,sourceRef:request.sourceRef,
     sceneId:request.origin.scene.sceneId,photoId:request.origin.scene.photoId
    });
    if(!ok(result))return fail(result?.reason||"NATIVE_MASS_EXPLORER_REJECTED");
    owned=true;
    return Object.freeze({ok:true,routeId:request.routeId,momentKey:"AO.CARD.015"});
   }catch{return fail("NATIVE_MASS_OWNER_FAILED");}
  },
  async restore(origin){
   if(!owned)return fail("NO_OWNED_MASS_SESSION");
   try{
    const result=await win.AO_LIVING_CHURCH_MASS_NATIVE_V1?.restore?.({
     routeId:"learn.mass_explorer",sourceRef:"AO.CARD.015"
    });
    if(!ok(result))return fail(result?.reason||"MASS_RETURN_FAILED");
    owned=false;
    const restored=await restorePose(origin.scene.pose);
    if(!ok(restored))return fail("SCENE_RESTORATION_FAILED");
    const current=sourceStatus(),pose=sourcePose();
    if(current?.view!=="church"||current?.photoMode!=="still"||
       Math.abs(pose?.x-origin.scene.pose.x)>2||Math.abs(pose?.y-origin.scene.pose.y)>2)
     return fail("SCENE_RESTORATION_FAILED");
    return Object.freeze({ok:true});
   }catch{return fail("MASS_RETURN_FAILED");}
  },
  status:()=>Object.freeze({owned,available:!!win?.AO_LIVING_CHURCH_MASS_NATIVE_V1?.open})
 });
}
