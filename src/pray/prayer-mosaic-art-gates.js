/**
 * Nine-door Prayer mosaic photograph release gate.
 * Source checkpoint: data/pray/prayer-discovery-release-gates-20261030.v1.json.
 * Original artwork approval is NOT permission to publish a photo or reassign it.
 * Until a particular door is signed off with exact native file and crop,
 * keep the existing embedded semantic icon. No network or inferred URLs.
 */
export const PRAYER_MOSAIC_DOORS=Object.freeze(["chaplets","marian","daily","library","novenas","eucharistic","ourlord","saints","intentions"]);
const HOLD=Object.freeze({
  status:"PHOTO_HOLD",
  artworkId:null,assetPath:null,sha256:null,photoRights:null,
  objectIdentityApproved:false,editorialDoorApproved:false,
  originalBytesVerified:false,framelessQualityApproved:false,
  cropApproved:false,alt:null
});
export const PRAYER_MOSAIC_ART_MANIFEST=Object.freeze(
 Object.fromEntries(PRAYER_MOSAIC_DOORS.map(id=>[id,HOLD]))
);
export function certifiedPrayerMosaicPhoto(id,manifest=PRAYER_MOSAIC_ART_MANIFEST){
 if(!PRAYER_MOSAIC_DOORS.includes(id))return null;
 const record=manifest[id];
 if(!record||record.status!=="READY_FOR_PUBLICATION"
   ||!record.artworkId||!record.editorialDoorApproved||!record.objectIdentityApproved
   ||!record.originalBytesVerified||!record.framelessQualityApproved||!record.cropApproved
   ||record.photoRights!=="REUSE_CLEARED"||!record.alt
   ||!/^([a-f0-9]{64})$/.test(record.sha256||"")
   ||!/^\/assets\/active\/prayer-mosaic\/[a-z0-9_-]+\.(?:webp|jpg|jpeg|png)$/.test(record.assetPath||""))return null;
 return Object.freeze({src:record.assetPath,alt:record.alt,sha256:record.sha256});
}
