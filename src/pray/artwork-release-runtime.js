/**
 * Ad Orientem Prayer sacred-art release boundary.
 *
 * This is a presentation adapter, NOT editorial or photographer approval.
 * Current release manifest intentionally contains no certified painting files.
 * Adding a museum URL, historical user keep, research match, or accepted
 * alternative does not release a photograph. Only a verified local image
 * with the complete release proof below may render in the public Prayer UI.
 */
import {PRAYER_ARTWORK_SLOT_AUTHORITY} from "./artwork-slot-authority.v1.js";

export const PRAYER_ARTWORK_RELEASE_SCHEMA_V1="ao-prayer-artwork-release-gate-v1";
export const PRAYER_RELEASED_IMAGE_ASSETS_V1=Object.freeze({});

const sha256=value=>typeof value==="string" && /^[a-f0-9]{64}$/i.test(value);
const localImage=value=>typeof value==="string"
  && /^assets\/pray\/released\/[a-z0-9][a-z0-9/_-]*\.(?:webp|avif|png|jpe?g)$/i.test(value)
  && !value.includes("..");
const htmlEsc=value=>String(value??"").replace(/[&<>"']/g,x=>({
  "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
}[x]));
export function releaseClearedPrayerArtwork(slotId,{
  manifest=PRAYER_RELEASED_IMAGE_ASSETS_V1,
  authority=PRAYER_ARTWORK_SLOT_AUTHORITY
}={}){
  if(typeof slotId!=="string" || !Object.hasOwn(authority,slotId))return null;
  const selection=authority[slotId];
  if(!selection || selection.held || selection.door ||
    !selection.title || !selection.artist)return null;
  const asset=Object.hasOwn(manifest,slotId)?manifest[slotId]:null;
  if(!asset || typeof asset!=="object")return null;
  const proof=asset.releaseEvidence;
  if(asset.slotId!==slotId || asset.title!==selection.title ||
    asset.artist!==selection.artist || asset.editorialApproved!==true ||
    asset.publicationState!=="READY_FOR_PUBLICATION" ||
    asset.productionEnabled!==true || !localImage(asset.path) ||
    !proof || proof.exactOriginalObjectVerified!==true ||
    proof.approvedForThisExactPrayerSlot!==true ||
    proof.actualFileReuseRightsCleared!==true ||
    proof.originalSourceFileArchived!==true ||
    !sha256(proof.sourceOriginalSha256) || !sha256(proof.releaseImageSha256) ||
    proof.nativeResolutionVerified!==true ||
    proof.visualQualityHumanPassed!==true ||
    proof.physicalFrameAbsent!==true ||
    proof.gallerySurroundAbsent!==true ||
    proof.noSyntheticFill!==true ||
    proof.mobileCropApproved!==true ||
    proof.desktopCropApproved!==true ||
    proof.appRenderVerified!==true ||
    !Number.isFinite(proof.nativeWidth) ||
    !Number.isFinite(proof.nativeHeight) ||
    proof.nativeWidth<800 || proof.nativeHeight<800 ||
    !Array.isArray(selection.ids) || !selection.ids.length ||
    !selection.ids.includes(proof.selectedOriginalArtworkId) ||
    !asset.sourceCredit || !asset.sourceCollectionUrl ||
    !/^https:\/\//i.test(asset.sourceCollectionUrl))return null;
  return Object.freeze({slotId,path:asset.path,title:asset.title,
    artist:asset.artist,sourceCredit:asset.sourceCredit,
    sourceCollectionUrl:asset.sourceCollectionUrl});
}
export function prayerArtworkSlotForView({
  view,prayerId=null,libraryId=null,angelusForm="angelus",
  stationIndex=null,penitentialIndex=null,sevenWordsIndex=null
}={}){
  const index=(n,max)=>{
    if(!Number.isInteger(n)||n<0||n>=max)return null;
    return String(n+1).padStart(2,"0");
  };
  if(view==="angelus")return angelusForm==="regina"?
    "COV-pray.angelus_regina":"COV-pray.angelus";
  if(view==="stations"){
    const i=index(stationIndex,14);return i?"STG-pray.stations-"+i:null;
  }
  if(view==="penitential"){
    const i=index(penitentialIndex,7);return i?"STG-pray.penitential_psalms-"+i:null;
  }
  if(view==="sevenWords"){
    const i=index(sevenWordsIndex,8);return i?"STG-pray.seven_words-"+i:null;
  }
  if(view==="benediction")return "COV-pray.benediction";
  if(view==="adoration")return "COV-pray.adoration";
  if(view==="prayerOnly"&&/^[a-z0-9_.-]+$/.test(prayerId||""))
    return "COV-"+prayerId;
  if(view==="library"&&/^[a-z0-9_.-]+$/.test(libraryId||""))
    return "COV-"+libraryId;
  // The Rosary itself is a dedicated chapter/bead player. No page-level
  // figure is inserted: the Lotto cover and 15 mysteries belong to that
  // player, never to a generic Prayer header or random rotation.
  return null;
}
export function renderReleasedPrayerArtwork(slotId,{
  manifest=PRAYER_RELEASED_IMAGE_ASSETS_V1,
  authority=PRAYER_ARTWORK_SLOT_AUTHORITY,
  language="en"
}={}){
  const art=releaseClearedPrayerArtwork(slotId,{manifest,authority});
  if(!art)return "";
  const fr=language==="fr";
  const credit=htmlEsc(art.artist+" · "+art.title);
  const image=htmlEsc(art.path);
  const source=htmlEsc(art.sourceCollectionUrl);
  const creditText=htmlEsc(art.sourceCredit);
  const info=htmlEsc(fr?"Informations sur l’œuvre":"Painting information");
  return '<figure class="aoPrayReleasedArt" data-ao-pray-art-slot="'+htmlEsc(slotId)+
    '" data-ao-pray-art-release="certified">'+
    '<div class="aoPrayReleasedArtFrame"><img class="aoPrayReleasedArtImage" src="'+image+
    '" alt="" aria-hidden="true" loading="eager" decoding="async">'+
    '<details class="aoPrayReleasedArtDetails"><summary aria-label="'+info+
    '" title="'+info+'">ⓘ</summary><figcaption><strong>'+credit+
    '</strong><span>'+creditText+'</span><a href="'+source+
    '" target="_blank" rel="noopener noreferrer">'+
    htmlEsc(fr?"Fiche de l’œuvre":"Artwork record")+'</a></figcaption></details></div></figure>';
}
