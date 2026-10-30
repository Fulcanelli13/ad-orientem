// M1 is the standard Mass root presentation. The original host owns its
// Proper/preflight/Start action. R17 alone owns the saved reader checkpoint.
import {m1AccessPreviewRequested} from "./m1-access-overview.js";
const records=new WeakMap();
export function m1RootPreviewRequested(win=globalThis){
 try{
  const p=new URLSearchParams(win?.location?.search||"");
  return m1AccessPreviewRequested(win)&&p.get("aoMassRootM1")!=="0";
 }catch{return m1AccessPreviewRequested(win)}
}
function ensureStyle(doc){
 if(doc.getElementById("ao-m1-root-surface-css"))return;
 const style=doc.createElement("style");style.id="ao-m1-root-surface-css";
 style.textContent="\nhtml[data-ao-m1-mass-root=\"true\"] .homeScreen{display:none!important}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoMassFlowBackdrop{\n position:fixed!important;inset:0 0 var(--ao-global-ribbon-h,72px) 0!important;\n width:100%!important;height:auto!important;max-height:none!important;\n overflow-x:hidden!important;overflow-y:auto!important;overscroll-behavior:contain;\n display:block!important;background:var(--bg,#0b1018)!important;\n border:0!important;border-radius:0!important;box-shadow:none!important;\n backdrop-filter:none!important;-webkit-backdrop-filter:none!important;\n transform:none!important;padding:0!important;z-index:15000!important\n}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoMassFlow{\n position:relative!important;inset:auto!important;display:block!important;\n margin:0 auto!important;padding:12px 0 38px!important;\n width:min(860px,100%)!important;max-width:100%!important;\n min-height:100%!important;max-height:none!important;overflow:visible!important;\n border:0!important;border-radius:0!important;box-shadow:none!important;\n transform:none!important;background:var(--bg,#0b1018)!important;\n color:var(--text,#ede6dc)!important\n}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 [data-ao-m1-host-header]{display:none!important}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoMassFlowBody{\n width:min(860px,100%)!important;max-width:100%!important;min-width:0!important;\n margin:0 auto!important;padding:0!important;overflow:visible!important;\n border:0!important;background:transparent!important\n}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoFullMassPreflight{\n margin:0!important;padding:0!important;border:0!important;border-radius:0!important;\n background:transparent!important;box-shadow:none!important;min-width:0!important\n}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoGuidedMassFolio{\n border:0!important;border-radius:0!important;box-shadow:none!important\n}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoMassFolioIdentity{border-radius:0!important}\nhtml[data-ao-m1-mass-root=\"true\"] #ao-global-ribbon{\n z-index:15680!important;display:block!important;visibility:visible!important\n}\n@media(min-width:850px){\n html[data-ao-m1-mass-root=\"true\"] #ao-mass-flow-v1 .aoMassFlow{padding:22px 18px 52px!important}\n}\n";
 // Theme-owned contrast; the option is visible only for a genuine R17 checkpoint.
 style.textContent+="\nhtml[data-ao-m1-mass-root='true'] .aoM1ResumeAction{width:100%;min-height:48px;border:1px solid var(--liturgical,var(--border));border-radius:9px;background:var(--surface-1,#111924);color:var(--text,#eee);font:600 16px/1.3 var(--ao-font-ui,system-ui,sans-serif)}html[data-ao-m1-mass-root='true'] [data-ao-m1-resume-error]{margin:8px 0;color:var(--text,#eee);font-size:13px;line-height:1.4}html[data-ao-m1-mass-root='true'] .aoM1ResumeAction[hidden]{display:none!important}\n";
 (doc.head??doc.documentElement).append(style);
}
// Only an explicit click may resume a saved Mass. Mass-tab entry always
// stays in the canonical preflight, regardless of checkpoint existence.
function attachResumeAction(win,flow){
 const mass=win?.AO_R17_BROWSER_ENTRY;
 const hostActions=flow?.querySelector?.("[data-folio-host-actions] .aoFlowActions");
 if(!hostActions||typeof mass?.hasResumable!=="function"||!mass.hasResumable())return null;
 const doc=hostActions.ownerDocument;
 const button=doc.createElement("button");
 button.type="button";
 button.dataset.aoM1ResumeMass="";
 button.className="aoM1ResumeAction";
 const fr=win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
 button.textContent=fr?"Reprendre la messe en cours":"Resume previous Mass";
 button.setAttribute("aria-label",fr?"Reprendre la messe à la dernière position enregistrée":"Resume Mass at the saved position");
 // Do not replace the single original Start action or its event handler.
 hostActions.append(button);
 const message=doc.createElement("p");message.dataset.aoM1ResumeError="";
 message.hidden=true;message.setAttribute("role","status");button.after(message);
 const onResume=async event=>{
   event.preventDefault();
   if(button.disabled)return;
   const shell=win?.AO_APP_SHELL_V1;
   button.disabled=true;
   message.hidden=true;message.textContent="";
   try{
     const result=await shell?.navigate?.("mass",{resume:true});
     if(result?.ok!==true){
       if(!mass.hasResumable())button.hidden=true;
       message.textContent=fr
         ?"La messe enregistrée ne peut pas être reprise. Vérifiez votre choix de messe."
         :"The saved Mass cannot be resumed. You can start from the Mass choices.";
       message.hidden=false;
     }
   }catch(error){
     message.textContent=fr?"La reprise de la messe a échoué.":"Could not resume the saved Mass.";
     message.hidden=false;
     try{win?.console?.error?.("M1 resume failed",error)}catch{}
   }finally{if(button.isConnected)button.disabled=false}
 };
 button.addEventListener("click",onResume);
 return ()=>{button.removeEventListener("click",onResume);button.remove();message.remove()};
}
const original=(node,attr)=>node?.hasAttribute(attr)?node.getAttribute(attr):null;
function restore(node,attr,old){if(!node)return;if(old==null)node.removeAttribute(attr);else node.setAttribute(attr,old)}
export function deactivateM1MassRoot(win=globalThis){
 const doc=win?.document,entry=doc&&records.get(doc);
 if(!entry)return false;
 const {backdrop,flow,header,attrs,block,observer,releaseResume}=entry;
 releaseResume?.();
 doc.documentElement.removeAttribute("data-ao-m1-mass-root");
 backdrop?.removeAttribute("data-ao-m1-root");
 flow?.removeAttribute("data-ao-m1-root");
 header?.removeAttribute("data-ao-m1-host-header");
 restore(backdrop,"role",attrs.backdropRole);
 restore(backdrop,"aria-modal",attrs.backdropModal);
 restore(flow,"role",attrs.flowRole);
 restore(flow,"aria-label",attrs.flowLabel);
 restore(flow,"tabindex",attrs.tabindex);
 backdrop?.removeEventListener("click",block,true);
 observer?.disconnect();
 records.delete(doc);
 return true;
}
export function activateM1MassRoot(win=globalThis){
 if(!m1RootPreviewRequested(win))return false;
 const doc=win?.document;
 const backdrop=doc?.querySelector?.("#ao-mass-flow-v1 .aoMassFlowBackdrop");
 const flow=backdrop?.querySelector?.(".aoMassFlow");
 if(!backdrop?.isConnected||!flow?.isConnected||backdrop.hidden)return false;
 if(records.has(doc))deactivateM1MassRoot(win);
 ensureStyle(doc);
 const header=[...flow.children].find(node=>node.matches?.("header,.aoMassFlowHead,.aoMassFlowHeader")||node.querySelector?.("[data-ao-close]"))??null;
 const attrs={
  backdropRole:original(backdrop,"role"),backdropModal:original(backdrop,"aria-modal"),
  flowRole:original(flow,"role"),flowLabel:original(flow,"aria-label"),tabindex:original(flow,"tabindex")
 };
 const block=e=>{if(e.target===backdrop){e.preventDefault();e.stopImmediatePropagation()}};
 backdrop.addEventListener("click",block,true);
 backdrop.setAttribute("role","presentation");backdrop.removeAttribute("aria-modal");
 flow.setAttribute("role","main");
 flow.setAttribute("aria-label",win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"Messe":"Mass");
 flow.setAttribute("tabindex","-1");
 backdrop.dataset.aoM1Root="true";flow.dataset.aoM1Root="true";
 if(header)header.dataset.aoM1HostHeader="";
 doc.documentElement.dataset.aoM1MassRoot="true";
 const observer=typeof win.MutationObserver==="function"?new win.MutationObserver(()=>{
  const style=win.getComputedStyle?.(backdrop);
  if(!backdrop.isConnected||backdrop.hidden||backdrop.getAttribute("aria-hidden")==="true"||
     style?.display==="none"||win?.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)
   deactivateM1MassRoot(win);
 }):null;
 observer?.observe(backdrop,{attributes:true,attributeFilter:["class","style","hidden","aria-hidden"]});
 const releaseResume=attachResumeAction(win,flow);
 records.set(doc,{backdrop,flow,header,attrs,block,observer,releaseResume});
 try{flow.focus({preventScroll:true})}catch{}
 return true;
}
