/*
 * Approval is an exact enum, NEVER a substring:
 * NEW_CANDIDATE_NOT_USER_APPROVED includes the bytes USER_APPROVED.
 * Its presence must never silently grant approval or publication.
 */
export const PRAYER_ART_APPROVAL_POLICY_VERSION="2026-10-30-v1";
const POSITIVE=new Set([
 "USER_APPROVED","USER_APPROVED_EXISTING_SAINTS_SELECTION",
 "USER_APPROVED_20261030_NEW_ARTWORK_REUSE","USER_FINAL_LOCKED"
]);
const REUSED="USER_APPROVED_CROSS_PRAYER_REUSE";

export function isEditorialArtworkPlacementApproved(work,{sourceArtIdApproved=false}={}){
 if(!work||work.eligible===false)return false;
 // A user-locked cover can be an approved painting before its canonical asset
 // ID is resolved; that is editorial approval, never photo clearance.
 if(work.editorial==="USER_FINAL_LOCKED")return true;
 if(work.id===null||work.id===undefined)return false;
 if(POSITIVE.has(work.editorial))return true;
 return work.editorial===REUSED&&sourceArtIdApproved===true;
}

export function isUserApprovedPhotographPublishable(work,photo={}){
 if(!isEditorialArtworkPlacementApproved(work,{sourceArtIdApproved:photo.sourceArtIdApproved===true}))return false;
 if(work.id===null||work.id===undefined)return false;
 // Every gate below must have its own positive verified evidence. Missing
 // metadata is a FAIL, never a permission to show the image.
 return photo.exactWorkIdentityVerified===true
  &&photo.nativeSourcePhotoVerified===true
  &&photo.licensePermissionVerified===true
  &&photo.frameFreeCompositionVerified===true
  &&photo.visualQualityVerified===true
  &&photo.widthHeightSuitable===true
  &&photo.sourceArchived===true;
}
