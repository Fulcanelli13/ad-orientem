/**
 * Angelus v2: sparse devotional choreography, not the Mass's many cue clocks.
 * These are presentation cues for a selected private customary, never a claim
 * that a person has actually bowed/genuflected or that the custom is universal.
 * The ordinary prayer's stand/kneel resolver remains separately authoritative.
 */
export const ANGELUS_CINEMATIC_VERSION="angelus-devotional-cinematics-v2";

// Curatorial identities come exclusively from the user's completed 13 Oct 2026
// Sacred Art rating export: rating >= 3, perfect theme, retained. These are
// ANNUNCIATION paintings (the Angelus' central subject), not falsely labelled
// as Visitation. The one rated Visitation candidate scored 2 and is not in
// this higher-confidence opening shortlist. Artwork identities do not certify
// any remote image reproduction as an approved local derivative.
export const ANGELUS_REVIEWED_OPENING_ART=Object.freeze([
 Object.freeze({id:"nga-46",title:"The Annunciation",artist:"Jan van Eyck",
  rating:4,subject:"ANNUNCIATION",sourceUrl:"https://www.nga.gov/artworks/46-annunciation",
  imageUrl:"https://api.nga.gov/iiif/46633bd6-4834-40fb-8ce0-fb975c731dc1/full/!1200,1200/0/default.jpg",
  rights:"NGA public-domain open-access image",provider:"nga"}),
 Object.freeze({id:"met-437250",title:"The Annunciation",artist:"Girolamo Mazzola Bedoli",
  rating:4,subject:"ANNUNCIATION",sourceUrl:"https://www.metmuseum.org/art/collection/search/437250",
  objectId:437250,provider:"met"}),
 Object.freeze({id:"met-436791",title:"The Annunciation",artist:"Joos van Cleve",
  rating:4,subject:"ANNUNCIATION",sourceUrl:"https://www.metmuseum.org/art/collection/search/436791",
  objectId:436791,provider:"met"}),
 Object.freeze({id:"met-436502",title:"The Annunciation",artist:"Luca Giordano",
  rating:4,subject:"ANNUNCIATION",sourceUrl:"https://www.metmuseum.org/art/collection/search/436502",
  objectId:436502,provider:"met"}),
 Object.freeze({id:"cma-127572",title:"The Annunciation",artist:"Paolo Veronese and Workshop",
  rating:4,subject:"ANNUNCIATION",sourceUrl:"https://www.clevelandart.org/art/1950.251",
  objectId:127572,accession:"1950.251",provider:"cma"}),
]);

export function selectAngelusOpeningArtwork({
  pool=ANGELUS_REVIEWED_OPENING_ART,lastId=null,random=Math.random,
}={}){
  const eligible=(Array.isArray(pool)?pool:[]).filter(a=>
    a?.rating>=3 && a.subject==="ANNUNCIATION" && a.sourceUrl &&
    (a.imageUrl||Number.isInteger(a.objectId))
  );
  if(!eligible.length)return null;
  const nonRepeated=eligible.filter(a=>a.id!==lastId);
  const choices=nonRepeated.length?nonRepeated:eligible;
  const fraction=Number(random());
  const position=Math.min(choices.length-1,Math.max(0,
    Math.floor((Number.isFinite(fraction)?fraction:0)*choices.length)));
  return choices[position]??null;
}

export async function resolveAngelusArtworkImage(artwork,{fetchImpl=globalThis.fetch}={}){
  if(!artwork)return null;
  if(artwork.imageUrl)return artwork.imageUrl;
  if(!Number.isInteger(artwork.objectId) ||
     !["met","cma"].includes(artwork.provider) ||
     typeof fetchImpl!=="function")return null;
  try{
    if(artwork.provider==="cma"){
      const response=await fetchImpl(
        "https://openaccess-api.clevelandart.org/api/artworks/"+artwork.objectId,
        {mode:"cors",cache:"force-cache"});
      if(!response?.ok)return null;
      const obj=(await response.json())?.data;
      if(obj?.id!==artwork.objectId ||
         String(obj?.share_license_status??"").toUpperCase()!=="CC0")return null;
      const url=String(obj.images?.web?.url??"");
      return /^https:\/\//.test(url)?url:null;
    }
    const response=await fetchImpl(
      "https://collectionapi.metmuseum.org/public/collection/v1/objects/"+artwork.objectId,
      {mode:"cors",cache:"force-cache"});
    if(!response?.ok)return null;
    const obj=await response.json();
    if(obj.objectID!==artwork.objectId || obj.isPublicDomain!==true)return null;
    const url=String(obj.primaryImageSmall??obj.primaryImage??"");
    return /^https:\/\//.test(url)?url:null;
  }catch{return null}
}

/** Explicit devotional custom requested for the Incarnation cue, not a universal rubric.
 * A Saturday before Vespers remains a weekday in the traditional Angelus
 * stand/kneel baseline; Saturday after Vespers and Sunday count as Sunday
 * custom. To use a different local custom pass an explicit override.
 */
export function resolveAngelusIncarnationCinematic({
  form="angelus",weekday=1,saturdayAfterVespers=false,
  gestureOverride=null,language="en",
}={}){
  if(form!=="angelus")return null;
  const day=Number(weekday);
  if(!Number.isInteger(day)||day<0||day>6)return null;
  const sundayCustom=day===0||(day===6&&saturdayAfterVespers===true);
  const action=gestureOverride??
    (sundayCustom?"GENUFLECT":"HEAD_BOW");
  const assets={
    HEAD_BOW:"ao-live-head-bow",
    PROFOUND_BOW:"ao-live-profound-bow",
    GENUFLECT:"ao-live-genuflect",
    KNEEL:"ao-live-kneel",
    STAND:"ao-live-stand",
    NONE:null,
  };
  if(!Object.hasOwn(assets,action))return null;
  if(action==="NONE")return null;
  const fr=language==="fr";
  const labels={
    HEAD_BOW:fr?"Inclinez la tête":"Bow your head",
    PROFOUND_BOW:fr?"Inclinez-vous profondément":"Bow profoundly",
    GENUFLECT:fr?"Faites la génuflexion":"Genuflect",
    KNEEL:fr?"Mettez-vous à genoux":"Kneel",
    STAND:fr?"Levez-vous":"Stand",
  };
  return Object.freeze({
    id:"ANGELUS.INCARNATION",sourceCue:"Et Verbum caro factum est",
    action,iconAssetId:assets[action],label:labels[action],
    weekday:day,form,customaryOnly:true,automaticObservation:false,
    sourceRole:"ANGELUS_EXACT_VERSICLE",
    returnToPrayerOnDismiss:true,
  });
}
