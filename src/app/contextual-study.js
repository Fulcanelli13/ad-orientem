/*
 * Contextual study handoff: one small, static vocabulary of verified Glossary
 * entry identities. The Glossary itself remains the unique text/source owner.
 * Nothing in this module imports the 450-concept corpus on the Home path.
 */
export const CONTEXTUAL_GLOSSARY_TERMS=Object.freeze({
 G001:Object.freeze({en:"Grace",fr:"Grâce"}),
 G034:Object.freeze({en:"Sacrament of Penance",fr:"Sacrement de Pénitence"}),
 G036:Object.freeze({en:"Confession",fr:"Confession"}),
 G044:Object.freeze({en:"Indulgence",fr:"Indulgence"}),
 G046:Object.freeze({en:"Mass",fr:"Messe"}),
 G067:Object.freeze({en:"Rubric",fr:"Rubrique"}),
 G097:Object.freeze({en:"Rosary",fr:"Rosaire"}),
 G155:Object.freeze({en:"Adoration",fr:"Adoration"}),
 G301:Object.freeze({en:"Eucharistic Adoration",fr:"Adoration eucharistique"}),
 G324:Object.freeze({en:"Mental prayer",fr:"Oraison mentale"}),
 G328:Object.freeze({en:"Examination of conscience",fr:"Examen de conscience"}),
 G419:Object.freeze({en:"Stations of the Cross",fr:"Chemin de Croix"})
});
const esc=text=>String(text??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
export function glossaryContextCapsule(id,{french=false}={}){
 const term=CONTEXTUAL_GLOSSARY_TERMS[String(id??"")];
 if(!term)return "";
 const label=french?"Comprendre":"Understand";
 return `<button type="button" class="aoContextualGlossaryCapsule" data-ao-glossary-context="${esc(id)}" aria-label="${esc(label+" : "+(french?term.fr:term.en))}">${esc(french?term.fr:term.en)} <span aria-hidden="true">· ?</span></button>`;
}
export function installContextualStudyBridge(win=globalThis){
 const doc=win?.document;
 if(!doc?.addEventListener)return null;
 if(win.AO_CONTEXTUAL_STUDY_V1)return win.AO_CONTEXTUAL_STUDY_V1;
 if(doc?.createElement&&!doc?.getElementById?.("ao-contextual-study-style")){
  const style=doc.createElement("style");
  style.id="ao-contextual-study-style";
  style.textContent=`
    .aoContextualGlossaryCapsule{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:44px;padding:7px 13px;border:1px solid var(--ao-rule,rgba(201,173,120,.35));border-radius:var(--ao-control-radius,11px);background:var(--ao-surface-1,rgba(16,24,33,.94));color:var(--ao-text-primary,#e9e4d9);font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
    .aoContextualGlossaryCapsule span{color:var(--liturgical,#c9ad78)}
    .aoContextualGlossaryCapsule:focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}
    .aoContextualGlossaryCapsule:disabled{opacity:.6}
    .aoContextualStudyError{display:block;margin-top:5px;color:var(--ao-text-muted,#a9a5a0);font:500 12px/1.45 var(--ao-font-ui,system-ui,sans-serif)}
    .ao-guide-contextual-term,.aoSLContextTerm,.aoP435930ContextRow{margin-top:12px}
    @media(prefers-reduced-motion:reduce){.aoContextualGlossaryCapsule{transition:none!important}}
  `;
  (doc.head||doc.documentElement)?.append?.(style);
 }
 let inFlight=false;
 const error=(target,message)=>{
  const parent=target?.parentElement;
  if(!parent?.insertBefore||!doc?.createElement)return;
  parent.querySelector?.("[data-ao-context-error]")?.remove?.();
  const note=doc.createElement("span");
  note.dataset.aoContextError="true";note.setAttribute("role","alert");
  note.className="aoContextualStudyError";
  note.textContent=message;
  target.insertAdjacentElement?.("afterend",note);
 };
 async function openTerm(id,{trigger=null}={}){
  if(!CONTEXTUAL_GLOSSARY_TERMS[id]||inFlight)return false;
  const fr=win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr";
  inFlight=true;
  if(trigger)trigger.disabled=true;
  try{
   const mod=await import("../glossary/browser-entry.js");
   const owner=mod.installGlossaryModule(win);
   if(typeof owner?.open!=="function")throw Error("Glossary owner unavailable");
   const opened=await owner.open({entryId:id,origin:"context",trigger});
   if(opened===false||owner.status?.()?.detailId!==id){
    owner.close?.(false);
    throw Error("Exact Glossary entry unavailable");
   }
   trigger?.parentElement?.querySelector?.("[data-ao-context-error]")?.remove?.();
   return true;
  }catch(e){
   try{win?.console?.error?.("Contextual Glossary handoff failed",id,e)}catch{}
   error(trigger,fr?"Impossible d’ouvrir cette définition. Réessayez.":"Definition unavailable. Please retry.");
   return false;
  }finally{inFlight=false;if(trigger?.isConnected)trigger.disabled=false;}
 }
 const click=e=>{
  const button=e?.target?.closest?.("[data-ao-glossary-context]");
  if(!button)return;
  e.preventDefault?.();
  e.stopImmediatePropagation?.();
  const id=button.getAttribute?.("data-ao-glossary-context");
  void openTerm(id,{trigger:button});
 };
 doc.addEventListener("click",click,true);
 const api=Object.freeze({
  version:"contextual-study-v1",openTerm,
  status:()=>Object.freeze({installed:true,busy:inFlight,termCount:Object.keys(CONTEXTUAL_GLOSSARY_TERMS).length}),
  dispose(){doc.removeEventListener?.("click",click,true);if(win.AO_CONTEXTUAL_STUDY_V1===api)delete win.AO_CONTEXTUAL_STUDY_V1;}
 });
 win.AO_CONTEXTUAL_STUDY_V1=api;
 return api;
}
