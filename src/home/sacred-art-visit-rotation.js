// Source-owned, publication-gated homepage painting rotation.
// The research crosswalk is NOT a release manifest: pass only independently
// certified local artwork placements from the actual app asset owner.
const SHA_256=/^[a-f0-9]{64}$/i;
const LOCAL_ASSET=/^assets\/(?:approved\/)?sacred-art\/(?:published\/)?[a-z0-9/_-]+\.webp$/i;
const ALLOWED_ROLES=new Set(["EXACT_LITURGICAL_SUBJECT","DATE_APPROVED_CONTEXTUAL"]);
const ALLOWED_EDITORIAL=new Set(["USER_APPROVED_FOR_DATE","EDITOR_APPROVED_FOR_DATE"]);
const STORAGE_PREFIX="ao:sacred-art:home:rotation:v1:";

export function certifiedHomeArtworkCandidates({date,observedPrincipalId,placements=[]}={}){
  if(!/^20\d\d-\d\d-\d\d$/.test(String(date||""))||!observedPrincipalId||!Array.isArray(placements))return [];
  const eligible=placements.filter(p=>
    p&&p.date===date&&p.observedPrincipalId===observedPrincipalId
    &&ALLOWED_EDITORIAL.has(p.dateEditorialStatus)
    &&ALLOWED_ROLES.has(p.iconographicRole)
    &&p.exactPaintingIdentityVerified===true
    &&p.reproductionLicenceVerifiedForApp===true
    &&p.photoCompositionQa==="PASS"
    &&p.homePhoneCropQa==="PASS"
    &&p.productionReleaseCertified===true
    &&typeof p.physicalObjectId==="string"&&p.physicalObjectId.trim().length>0
    &&typeof p.title==="string"&&p.title.trim().length>0
    &&typeof p.artist==="string"&&p.artist.trim().length>0
    &&SHA_256.test(String(p.localImageSha256||""))
    &&LOCAL_ASSET.test(String(p.localImagePath||""))
  );
  // Distinct *physical originals*, not file variants or duplicate catalogue IDs.
  eligible.sort((a,b)=>
    Number(Boolean(b.isProtectedDatePrimary))-Number(Boolean(a.isProtectedDatePrimary))
    ||String(a.artist).localeCompare(String(b.artist))
    ||String(a.title).localeCompare(String(b.title))
    ||String(a.physicalObjectId).localeCompare(String(b.physicalObjectId))
  );
  const seen=new Set();
  return eligible.filter(p=>{
    if(seen.has(p.physicalObjectId))return false;
    seen.add(p.physicalObjectId);return true;
  });
}

// Caller passes a new visitKey only for browser refresh or navigation *into*
// Home, not for internal re-renders. A stable key freezes the artwork while read.
export function createHomeArtworkVisitRotator({storage=null}={}){
  const visitCache=new Map();
  function forVisit({date,observedPrincipalId,visitKey,placements=[]}={}){
    if(typeof visitKey!=="string"||!visitKey.trim())throw new TypeError("Home visitKey is required; never rotate during re-render");
    const certified=certifiedHomeArtworkCandidates({date,observedPrincipalId,placements});
    if(!certified.length)return null;
    const cacheKey=JSON.stringify([date,observedPrincipalId,visitKey]);
    if(visitCache.has(cacheKey))return visitCache.get(cacheKey);
    const storageKey=STORAGE_PREFIX+date+":"+encodeURIComponent(observedPrincipalId);
    let previous=null;
    try{previous=storage?.getItem(storageKey)||null}catch{}
    const lastIndex=certified.findIndex(p=>p.physicalObjectId===previous);
    const index=lastIndex>=0?(lastIndex+1)%certified.length:0;
    const choice=Object.freeze({
      ...certified[index],
      rotationIndex:index,
      rotationTotal:certified.length,
      // Preserve distinct observable source attribution for the info icon.
      imageInfo:{title:certified[index].title,artist:certified[index].artist,sourceUrl:certified[index].sourceUrl||null}
    });
    try{storage?.setItem(storageKey,choice.physicalObjectId)}catch{}
    // Limit cache growth over a long-running app session.
    if(visitCache.size>=64)visitCache.delete(visitCache.keys().next().value);
    visitCache.set(cacheKey,choice);
    return choice;
  }
  return Object.freeze({forVisit});
}
