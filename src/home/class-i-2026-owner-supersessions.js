/**
 * Subsequent owner-curated Class I decisions that supersede the pinned
 * 20 October 2026 archival 365-day selection record.
 *
 * Do not edit the original 2026 prior-date-evidence JSON: it remains an
 * immutable historical snapshot. Physical work selection is independent
 * of photo usage rights, cropping and public release.
 */
const STOM_EMMAUS_2026=Object.freeze({
 date:"2026-04-06",
 principalId:"tempora:Pasc0-1:1:w",
 properPath:"Tempora/Pasc0-1",
 ownerDecisionDate:"2026-10-26",
 supersedes:Object.freeze({
  title:"The Supper at Emmaus",artist:"Caravaggio",
  artworkId:null,editorialBasis:"NEW_DATE_SPECIFIC_APPROVAL"
 }),
 selection:Object.freeze({
  title:"The Supper at Emmaus",
  artist:"Matthias Stom",
  artworkId:"thyssen-375-1976-66",
  editorialBasis:"LATER_EXPLICIT_OWNER_DATE_APPROVAL_20261026"
 }),
 museumObject:"https://www.museothyssen.org/en/collection/artists/stom-matthias/supper-emmaus",
 museumIdentity:"Museo Nacional Thyssen-Bornemisza, inventory 375 (1976.66)",
 candidatePhotoPage:"https://commons.wikimedia.org/wiki/File:Matthias_Stom_-_The_supper_at_Emmaus.jpg",
 photoSourceInstitution:"Museo Nacional Thyssen-Bornemisza",
 sourcePhotographStatus:"HELD_MUSEUM_COMMERCIAL_PHOTO_PERMISSION_NOT_CLEARED",
 image:null,
 sourceRightsNotes:"The official Thyssen photo-library terms restrict commercial usage of its photographs and require written authorization; the Commons copy identifies the same museum as source and its PD-Art statement is not evidence of independently cleared global commercial photographic rights.",
 newPhotoApprovalCreated:false,
 ownerApprovedCrop:false
});
export const CLASS_I_OWNER_SUPERSESSIONS_2026=Object.freeze({
 "2026-04-06":STOM_EMMAUS_2026
});
export function classIOwnerSupersession2026(date,principalId,properPath){
 const row=CLASS_I_OWNER_SUPERSESSIONS_2026[date];
 return row&&row.principalId===principalId&&row.properPath===properPath?row:null;
}
export function effectiveFrozenClassISelection2026(date,rank,principalId,selected){
 const base=selected?Object.freeze({
  title:selected[0],artist:selected[1],artworkId:selected[2],editorialBasis:selected[3]
 }):null;
 const latest=CLASS_I_OWNER_SUPERSESSIONS_2026[date];
 if(!latest)return base;
 if(rank!=="I"||principalId!==latest.principalId||
    !base||base.title!==latest.supersedes.title||
    base.artist!==latest.supersedes.artist||
    base.artworkId!==latest.supersedes.artworkId||
    base.editorialBasis!==latest.supersedes.editorialBasis)return null;
 return latest.selection;
}
