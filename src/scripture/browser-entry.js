import { mountScriptureLibrary } from "./library.js";
import { installScriptureStyles, installScriptureContextStyles } from "./styles.js";
import { loadScriptureBook } from "./pack-loader.js";
import { parseScriptureContext } from "./context.js";
export const SCRIPTURE_BROWSER_VERSION="ao-scripture-library-v1";
export function installScriptureBrowserOwner(win=globalThis){
 if(win.AO_SCRIPTURE_APP_V1)return win.AO_SCRIPTURE_APP_V1;
 const doc=win.document;
 installScriptureContextStyles(doc);
 let reader=null,previousFocus=null,previousOverflow=null;
 const loaded=new Map();
 const inflight=new Set();
 function overlay(){
   if(!doc?.createElement)return null;
   let root=doc.getElementById("ao-scripture-overlay");
   if(!root){
     root=doc.createElement("div");
     root.id="ao-scripture-overlay";root.hidden=true;
     root.setAttribute("role","dialog");root.setAttribute("aria-modal","true");
     root.setAttribute("aria-label","Sacred Scripture");
     doc.body?.append(root);
   }
   return root;
 }
 function close(){
   if(!reader)return false;
   reader.destroy();reader=null;
   const node=overlay();if(node)node.hidden=true;
   if(doc.body && previousOverflow!==null)doc.body.style.overflow=previousOverflow;
   previousOverflow=null;
   previousFocus?.focus?.();previousFocus=null;
   return true;
 }
 function open({passage=null,language=null,context=null}={}){
   const node=overlay();if(!node)return false;
   installScriptureStyles(doc);
   if(!reader){previousFocus=doc.activeElement;previousOverflow=doc.body?.style?.overflow??"";}
   reader?.destroy?.();
   const current=language||win.AO_RUNTIME_V8?.store?.getState?.()?.language||"en";
   reader=mountScriptureLibrary(node,{
     passage,context,language:current==="fr"?"fr":"en",storage:win.localStorage,
     onClose:close,
     onNeedBook:async({book,editionId})=>{
       const key=editionId+":"+book;
       if(inflight.has(key))return;
       if(loaded.has(key)){return;}
       inflight.add(key);
       try{
         const records=await loadScriptureBook(editionId,book,{
           fetcher:win.fetch?.bind(win),cacheStorage:win.caches,cryptoProvider:win.crypto
         });
         loaded.set(key,records);
         if(reader)reader.setRecords([...loaded.values()].flat());
       }catch(error){
         // Unavailable or unapproved translations remain external-link-only.
         if(win?.console?.debug)win.console.debug("Scripture edition is not locally available",error);
       }finally{inflight.delete(key);}
     },
     openExternal:(url)=>win.open?.(url,"_blank","noopener,noreferrer")
   });
   node.hidden=false;
   if(doc.body)doc.body.style.overflow="hidden";
   node.querySelector?.("[data-scripture-close]")?.focus?.();
   return true;
 }
 function openContext(reference,{language=null}={}){
   const parsed=parseScriptureContext(reference);
   if(!parsed)return false;
   return open({passage:parsed.passage,context:parsed,language});
 }
 const click=e=>{
   const capsule=e.target?.closest?.("[data-ao-scripture-context]");
   if(capsule){
     e.preventDefault?.();e.stopImmediatePropagation?.();
     const accepted=openContext(capsule.getAttribute("data-ao-scripture-context"));
     if(!accepted){
       const error=doc.createElement("span");
       error.setAttribute("role","alert");error.className="aoScriptureContextError";
       error.textContent=win.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"
         ?"Référence biblique non reconnue. Utilisez le lien de la source."
         :"Unrecognised Bible reference. Use the original source link.";
       capsule.parentElement?.querySelector?.(".aoScriptureContextError")?.remove();
       capsule.insertAdjacentElement("afterend",error);
     }
     return;
   }
   const button=e.target?.closest?.("[data-home-scripture]");
   if(!button)return;
   e.preventDefault?.();e.stopPropagation?.();open();
 };
 const key=e=>{
   if(!reader)return;
   if(e.key==="Escape"){e.preventDefault?.();e.stopPropagation?.();close();return;}
   if(e.key!=="Tab")return;
   const node=overlay();
   const focusables=[...(node?.querySelectorAll?.("button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href]")||[])]
     .filter(el=>!el.closest?.("details:not([open])") && el.getClientRects?.().length);
   if(!focusables.length)return;
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey && (doc.activeElement===first||!node.contains(doc.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey && (doc.activeElement===last||!node.contains(doc.activeElement))){e.preventDefault();first.focus();}
 };
 doc?.addEventListener?.("click",click,true);
 doc?.addEventListener?.("keydown",key);
 const api=Object.freeze({version:SCRIPTURE_BROWSER_VERSION,open,openContext,close,
   status:()=>Object.freeze({installed:true,open:Boolean(reader),reader:reader?.status?.()??null})});
 win.AO_SCRIPTURE_APP_V1=api;
 win.AO_SCRIPTURE_CONTEXT_V1=Object.freeze({version:"scripture-context-v1",open:openContext,parse:parseScriptureContext});
 return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installScriptureBrowserOwner(window);
