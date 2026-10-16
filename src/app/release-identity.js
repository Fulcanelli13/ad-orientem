/* Product title is independent of historical audit/build metadata. */
export const AD_ORIENTEM_PUBLIC_TITLE="Ad Orientem";
export function installCanonicalReleaseIdentity(win=globalThis){
 const doc=win?.document;
 if(!doc?.head||!doc?.documentElement)return false;
 if(doc.documentElement.dataset.aoCanonicalTitleOwner==="true")return true;
 const sync=()=>{if(doc.title!==AD_ORIENTEM_PUBLIC_TITLE)doc.title=AD_ORIENTEM_PUBLIC_TITLE};
 doc.documentElement.dataset.aoCanonicalTitleOwner="true";
 sync();
 // Historical inline scripts may restore obsolete 2.0/versioned tab titles
 // during later boot; preserve their research metadata but not their UI claim.
 if(typeof win.MutationObserver==="function"){
  const observer=new win.MutationObserver(sync);
  observer.observe(doc.head,{subtree:true,childList:true,characterData:true});
 }
 doc.addEventListener?.("DOMContentLoaded",sync,{once:true});
 win.addEventListener?.("load",sync,{once:true});
 win.addEventListener?.("pageshow",sync);
 return true;
}
if(typeof document!=="undefined")installCanonicalReleaseIdentity(globalThis);
