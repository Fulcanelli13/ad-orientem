/**
 * Source-of-truth production artwork release gate.
 * Research acquisition candidates and thematic ledgers NEVER enter here.
 * Populate APPROVED_SACRED_ARTWORKS only after human, legal and mobile QA.
 * Must ship actual assets/sacred-art/*.webp alongside any approved entry.
 */
export const APPROVED_SACRED_ARTWORKS=Object.freeze([]);
const SHA=/^[a-f0-9]{64}$/i;
const ASSET=/^assets\/sacred-art\/[a-z0-9/_-]+\.webp$/;
const OBSERVED=/^(?:sancti|tempora|commune):[A-Za-z0-9:._-]+$/;
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const validCoordinate=n=>Number.isFinite(n)&&n>=0&&n<=100;
export function isApprovedSacredArt(entry){
 return !!entry && entry.approvedForProduction===true
  && entry.curatorApproved===true && entry.mobileCropApproved===true
  && entry.rightsCleared===true && entry.sourceRights==="CC0"
  && SHA.test(entry.originalSha256||"") && SHA.test(entry.publishedSha256||"")
  && ASSET.test(entry.assetPath||"") && typeof entry.title==="string" && !!entry.title.trim()
  && Array.isArray(entry.observedPrincipalIds) && entry.observedPrincipalIds.length>0
  && entry.observedPrincipalIds.every(id=>OBSERVED.test(id))
  && validCoordinate(entry.focalX) && validCoordinate(entry.focalY)
  && (entry.association==="EXACT_SUBJECT"||entry.association==="CONTEXTUAL");
}
export function selectApprovedSacredArt(observedId,works=APPROVED_SACRED_ARTWORKS){
 if(!OBSERVED.test(observedId||"")||!Array.isArray(works))return null;
 return works.find(work=>isApprovedSacredArt(work)&&work.observedPrincipalIds.includes(observedId))||null;
}
export function renderApprovedSacredArt({observedId,language="en",works=APPROVED_SACRED_ARTWORKS}={}){
 const work=selectApprovedSacredArt(observedId,works);
 if(!work)return "";
 const title=escape(work.title),artist=escape(work.artist||"");
 const context=work.association==="CONTEXTUAL"
  ?(language==="fr"?"Illustration de contexte":"Contextual illustration"):"";
 return '<style>.aoApprovedSacredArt{max-width:540px;margin:18px auto 13px;text-align:center}.aoApprovedSacredArt img{display:block;max-width:100%;width:100%;height:clamp(220px,42vh,390px);object-fit:cover;border-radius:4px;box-shadow:0 14px 35px rgba(0,0,0,.25)}.aoApprovedSacredArt figcaption{margin:7px 0;color:#b4aba0;font-size:12px;line-height:1.45}.aoApprovedSacredArt small{font-size:11px;letter-spacing:.03em;color:#cdbb92}</style>'
  +'<figure class="aoApprovedSacredArt" data-ao-approved-art="'+escape(work.id)+'" data-ao-approval="curated">'
  +'<img src="./'+escape(work.assetPath)+'" alt="'+title+'" decoding="async" loading="eager"'
  +' style="object-position:'+work.focalX+'% '+work.focalY+'%"'
  +' width="'+Number(work.width||720)+'" height="'+Number(work.height||960)+'">'
  +'<figcaption>'+title+(artist?" · "+artist:"")+(context?" <small>· "+context+"</small>":"")+'</figcaption></figure>';
}
