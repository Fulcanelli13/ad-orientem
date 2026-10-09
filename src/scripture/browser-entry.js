import { mountScriptureLibrary } from "./library.js";
import { installScriptureStyles } from "./styles.js";
export const SCRIPTURE_BROWSER_VERSION="ao-scripture-library-v1";
export function installScriptureBrowserOwner(win=globalThis){
 if(win.AO_SCRIPTURE_APP_V1)return win.AO_SCRIPTURE_APP_V1;
 const doc=win.document;
 let reader=null,previousFocus=null;
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
   previousFocus?.focus?.();previousFocus=null;
   return true;
 }
 function open({passage=null,language=null}={}){
   const node=overlay();if(!node)return false;
   installScriptureStyles(doc);
   previousFocus=doc.activeElement;
   reader?.destroy?.();
   const current=language||win.AO_RUNTIME_V8?.store?.getState?.()?.language||"en";
   reader=mountScriptureLibrary(node,{
     passage,language:current==="fr"?"fr":"en",storage:win.localStorage,
     onClose:close,
     openExternal(url)=>win.open?.(url,"_blank","noopener,noreferrer")
   });
   node.hidden=false;
   node.querySelector?.("[data-scripture-close]")?.focus?.();
   return true;
 }
 const click=e=>{
   const button=e.target?.closest?.("[data-home-scripture]");
   if(!button)return;
   e.preventDefault?.();e.stopPropagation?.();open();
 };
 const key=e=>{if(e.key==="Escape"&&reader){e.preventDefault?.();close();}};
 doc?.addEventListener?.("click",click,true);
 doc?.addEventListener?.("keydown",key);
 const api=Object.freeze({version:SCRIPTURE_BROWSER_VERSION,open,close,
   status:()=>Object.freeze({installed:true,open:Boolean(reader),reader:reader?.status?.()??null})});
 win.AO_SCRIPTURE_APP_V1=api;
 return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installScriptureBrowserOwner(window);
