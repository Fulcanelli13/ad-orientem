/*
 * Prayer artwork display evidence, not a publishing mechanism.
 *
 * An editorial slot, a URL present in markup, or a loaded legacy image
 * MUST NOT be reported as a rights/quality-cleared artwork.
 * The DOM check is deliberately visual-neutral and never changes the prayer UI.
 */
export const PRAYER_ART_DOM_EVIDENCE_VERSION="2026-10-31-v1";

const liveRoots=new WeakSet();

const ART_SELECTORS=[
  "img[data-ao-prayer-art]",
  ".aoV401RosaryHero img",
  ".lab-contemplation img",
  "[data-ao-rosary-art] img",
  ".r23-mystery-art",
  "img[data-mystery-art]"
].join(",");

function shown(node,root){
  if(!node)return false;
  for(let p=node;p&&p!==root.parentElement;p=p.parentElement){
    if(p.hidden||p.getAttribute?.("aria-hidden")==="true")return false;
    if(p===root)break;
  }
  // A zero-geometry image may be preloaded but is not displayed.
  if(typeof node.getClientRects==="function"&&node.getClientRects().length===0)return false;
  if(typeof getComputedStyle==="function"){
    const css=getComputedStyle(node);
    if(css.display==="none"||css.visibility==="hidden"||Number(css.opacity)===0)return false;
  }
  return true;
}

export function inspectPrayerArtworkDom(root){
  const slot=String(root?.dataset?.aoArtworkEditorialSlot||"");
  if(!root||!slot)return Object.freeze({status:"NO_EDITORIAL_ARTWORK_SLOT",slot:slot||null,imageNodes:0,loadedVisibleImages:0,publicationVerified:false});
  const images=Array.from(root.querySelectorAll?.(ART_SELECTORS)||[]);
  const visible=images.filter(img=>shown(img,root));
  const loaded=visible.filter(img=>img.complete===true&&Number(img.naturalWidth)>0&&Number(img.naturalHeight)>0);
  const cssLegacy=Boolean(root.style?.getPropertyValue?.("--r24-mystery-art"));
  const status=loaded.length?"VISIBLE_LEGACY_ART_UNCERTIFIED":
    visible.some(img=>img.complete!==true)?"ARTWORK_LOADING_UNVERIFIED":
    visible.length?"ARTWORK_BROKEN_UNVERIFIED":
    cssLegacy?"CSS_ART_UNVERIFIED":
    images.length?"ARTWORK_NODE_HIDDEN":"NO_ARTWORK_NODE";
  return Object.freeze({
    status,slot,imageNodes:images.length,visibleImageNodes:visible.length,
    loadedVisibleImages:loaded.length,cssLegacy,publicationVerified:false
  });
}

export function stampPrayerArtworkDomEvidence(root){
  // Catch asynchronous native image loads without altering any element or UI.
  // Capturing load/error on the stable reader root survives stage rerenders.
  if(root?.addEventListener&&!liveRoots.has(root)){
    const resample=event=>{
      if(event.target?.matches?.(ART_SELECTORS))stampPrayerArtworkDomEvidence(root);
    };
    root.addEventListener("load",resample,true);
    root.addEventListener("error",resample,true);
    liveRoots.add(root);
  }
  const evidence=inspectPrayerArtworkDom(root);
  if(root?.dataset){
    root.dataset.aoArtworkDomStatus=evidence.status;
    root.dataset.aoArtworkDomImages=String(evidence.loadedVisibleImages);
    // Loading an image alone NEVER constitutes production signoff.
    root.dataset.aoArtworkPublished="false";
  }
  return evidence;
}
