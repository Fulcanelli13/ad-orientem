import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";

// Product-wide navigation semantics. Module routing remains with its source owner:
// these roles govern icon identity, accessible labels and appearance only.
export const INTERFACE_NAVIGATION_VERSION="interface-grammar-v1";
export const INTERFACE_NAVIGATION_ACTIONS=Object.freeze({
 back:Object.freeze({asset:"ao-ui-back",en:"Back",fr:"Retour",meaning:"Return through the actual navigation hierarchy"}),
 close:Object.freeze({asset:"ao-ui-close",en:"Close",fr:"Fermer",meaning:"Dismiss a sheet without changing its underlying screen"}),
 home:Object.freeze({asset:"ao-nav-home",en:"Today",fr:"Aujourd’hui",meaning:"Go explicitly to the Today destination"}),
 previous:Object.freeze({asset:"ao-ui-previous",en:"Previous",fr:"Précédent",meaning:"Move backward within the same sequence"}),
 next:Object.freeze({asset:"ao-ui-next",en:"Next",fr:"Suivant",meaning:"Move forward within the same sequence"}),
 settings:Object.freeze({asset:"ao-ui-settings",en:"Settings",fr:"Réglages",meaning:"Open settings as a utility overlay"}),
});
const escapeHtml=value=>String(value??"").replace(/[&<>"']/g,c=>({
 "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;",
})[c]);
export function navigationAction(role){
 const row=INTERFACE_NAVIGATION_ACTIONS[String(role||"").trim()];
 if(!row)throw new RangeError("Unknown navigation role: "+role);
 return row;
}
export function navigationActionAttrs(role,lang="en",label=null){
 const row=navigationAction(role);
 const text=label??row[lang==="fr"?"fr":"en"];
 return `data-ao-nav-action="${role}" aria-label="${escapeHtml(text)}"`;
}
export function navigationActionIcon(role){
 const row=navigationAction(role);
 const url=resolveCanonicalAssetUrl(row.asset);
 if(!url)return "";
 return `<span class="aoNavGlyph" data-ao-asset-id="${row.asset}" aria-hidden="true" style="background:currentColor;-webkit-mask:url('${escapeHtml(url)}') center/contain no-repeat;mask:url('${escapeHtml(url)}') center/contain no-repeat"></span>`;
}
