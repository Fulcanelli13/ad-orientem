/** Visible Mass P6 photographic continuity: navigation metadata, not liturgical source ownership. */
export const PHOTO_CONTINUITY_VERSION="visible-mass-p6-v1";
export const PHOTO_VIEWPOINTS=Object.freeze([
 ["BROMPTON_PANO","BROMPTON_ORATORY","360"],
 ["BROMPTON_ALTAR_2019_A","BROMPTON_ORATORY","STILL"],
 ["BROMPTON_LADY_ALTAR","BROMPTON_ORATORY","STILL"],
 ["BROMPTON_SACRED_HEART_CHAPEL","BROMPTON_ORATORY","STILL"],
 ["NEWMAN_360","NEWMAN_DUBLIN","360"],
 ["NEWMAN_HISTORIC_ALTAR","NEWMAN_DUBLIN","STILL"],
 ["NEWMAN_PULPIT","NEWMAN_DUBLIN","STILL"],
 ["NEWMAN_APSE","NEWMAN_DUBLIN","STILL"],
 ["BROMPTON_ALTAR_2019_B","BROMPTON_ORATORY","STILL"]
].map(([id,venue,type])=>Object.freeze({id,venue,type})));
const byId=new Map(PHOTO_VIEWPOINTS.map(x=>[x.id,x]));
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
export function visibleMassTransition(fromId,toId,evidence){
 const from=byId.get(fromId),to=byId.get(toId);
 if(!from||!to)throw new Error("Unknown photographic viewpoint");
 if(evidence?.sceneId!==toId||!/^https:\/\//.test(String(evidence.sourceUrl||""))||
    !String(evidence.creator||"").trim()||!String(evidence.licence||"").trim())
   throw new Error("Original image attribution and exact photo ID required");
 return Object.freeze({fromId,toId,
  kind:from.venue===to.venue?"SEPARATE_VIEW_SAME_VENUE":"SEPARATE_VENUE",
  medium:to.type==="360"?"FIXED_360_PHOTOGRAPH":"SEPARATE_STILL_PHOTOGRAPH",
  sourceUrl:evidence.sourceUrl,creator:evidence.creator,licence:evidence.licence,
  simulatedWalking:false,transferredObjectCoordinates:false,
  proves1962RitualAction:false});
}
export function visibleMassPose(sceneId,pose){
 const scene=byId.get(sceneId);
 if(!scene||!pose)throw new Error("Photo viewpoint and camera position required");
 if(scene.type==="360"){
  if(![pose.yaw,pose.pitch,pose.fov].every(Number.isFinite))throw new Error("Invalid panorama pose");
  return Object.freeze({sceneId,medium:"360",yaw:pose.yaw,
   pitch:clamp(pose.pitch,-1.25,1.25),fov:clamp(pose.fov,36,92)});
 }
 if(![pose.zoom,pose.offsetX,pose.offsetY].every(Number.isFinite))throw new Error("Invalid still pose");
 return Object.freeze({sceneId,medium:"STILL",zoom:clamp(pose.zoom,1,2.25),
  offsetX:pose.offsetX,offsetY:pose.offsetY});
}
export function restoreVisibleMassPose(sceneId,saved){
 const scene=byId.get(sceneId);
 if(!scene)throw new Error("Unknown photographic viewpoint");
 return saved?.sceneId===sceneId&&saved.medium===scene.type?visibleMassPose(sceneId,saved):null;
}
