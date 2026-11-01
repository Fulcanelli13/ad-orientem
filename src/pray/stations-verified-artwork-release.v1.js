/*
 * San Polo Stations — inert artwork placement seam.
 *
 * Never infer publication rights from an artwork's age, an editorial placement,
 * archive possession, or a source preview. A completed photograph publication
 * record must meet EVERY gate. No published records ship in this module.
 *
 * Reader integration uses this helper for the existing station-card header.
 * Returning an empty string does not change prayer text, paragraph focus,
 * simple/guided mode, Latin/French/English texts, public method or recitation.
 */

export const SAN_POLO_PUBLISHED_STATIONS=Object.freeze({});

const EDITORIAL_APPROVALS=new Set([
 "USER_APPROVED",
 "USER_FINAL_LOCKED",
 "USER_APPROVED_CROSS_PRAYER_REUSE",
 "USER_APPROVED_20261030_NEW_ARTWORK_REUSE",
 "USER_APPROVED_EXISTING_SAINTS_SELECTION",
]);

const TEXT=x=>String(x??"");
const safe=x=>TEXT(x)
 .replaceAll("&","&amp;").replaceAll("<","&lt;")
 .replaceAll(">","&gt;").replaceAll('"',"&quot;")
 .replaceAll("'","&#39;");
const httpsURL=x=>{
 const s=TEXT(x).trim();
 if(!s.startsWith("https://"))return null;
 try{const u=new URL(s);if(u.protocol!=="https:"||!u.hostname)return null;return u.href;}
 catch{return null;}
};
const appAsset=x=>{
 const s=TEXT(x).trim();
 return /^\/assets\/[A-Za-z0-9_./-]+\.(?:webp|jpg|jpeg|png)$/i.test(s)&&!s.includes("/../")?s:null;
};
const rightsOK=record=>{
 if(record?.rightsClass==="PD_CC0" && record?.exactPhotoLicenseVerified===true)return true;
 return record?.rightsClass==="CC_BY_SA_4_0" &&
  record?.exactPhotoLicenseVerified===true &&
  record?.explicitScopedPolicyException===true &&
  record?.shareAlikeNoticeIncluded===true;
};

/**
 * @param {number} zeroBasedIndex — current STATIONS.step 0..13.
 * @param {boolean} french — reader language (French vs English).
 * @param {object} registry — reviewed deployment data; omitted in production,
 *   where the empty immutable registry intentionally renders no images.
 * @returns {string} safe optional HTML, never a substitute for prayer paragraphs.
 */
export function renderVerifiedStationArtwork(zeroBasedIndex,french=false,registry=SAN_POLO_PUBLISHED_STATIONS){
 if(!Number.isInteger(zeroBasedIndex)||zeroBasedIndex<0||zeroBasedIndex>13)return "";
 const r=registry?.[zeroBasedIndex+1];
 if(!r || r.station!==zeroBasedIndex+1 ||
    !EDITORIAL_APPROVALS.has(r.editorialStatus) ||
    r.exactPaintingIdentityVerified!==true ||
    r.artworkUserPlacementVerified!==true ||
    r.nativePhotoVerified!==true ||
    r.photoArchiveHashVerified!==true ||
    r.visualFrameCropColourVerified!==true ||
    r.mobileReaderQACompleted!==true ||
    r.productionReleaseApproved!==true ||
    !rightsOK(r))return "";
 const image=appAsset(r.productionAssetURL);
 const source=httpsURL(r.sourceFilePage);
 const license=httpsURL(r.photoLicenseURL);
 if(!image || !source || !license || !TEXT(r.photographer).trim() ||
    !TEXT(r.workArtist).trim() || !TEXT(r.workTitle).trim() ||
    !TEXT(r.modifications).trim())return "";
 const alt=french
  ? "Chemin de Croix, station "+(zeroBasedIndex+1)+" : "+TEXT(r.workTitle)
  : "Stations of the Cross, Station "+(zeroBasedIndex+1)+": "+TEXT(r.workTitle);
 const credit=french?"Photographie":"Photograph";
 const sourceLabel=french?"Fichier source":"Source file";
 const changed=french?"Adaptation":"Adapted";
 const licenceLabel=french?"Licence":"License";
 return '<figure class="aoP435930StationArtwork" data-ao-station-artwork="'+(zeroBasedIndex+1)+'">'+
  '<img src="'+safe(image)+'" alt="'+safe(alt)+'" loading="lazy" decoding="async">'+
  '<figcaption><span>'+safe(r.workArtist)+' · '+safe(r.workTitle)+'</span> · '+
  safe(credit)+': '+safe(r.photographer)+' · '+
  '<a href="'+safe(source)+'" rel="noopener noreferrer" target="_blank">'+safe(sourceLabel)+'</a> · '+
  '<a href="'+safe(license)+'" rel="noopener noreferrer" target="_blank">'+safe(licenceLabel)+' '+safe(r.photoLicenseLabel||r.rightsClass)+'</a> · '+
  safe(changed)+': '+safe(r.modifications)+
  '</figcaption></figure>';
}
