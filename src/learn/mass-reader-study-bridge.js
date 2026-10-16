/*
 * Native Mass → published Guide study, without navigating away from the Mass.
 * Canonical ritual and Proper selection stay exclusively with R17. This
 * adapter is presentation-only and never consumes P0 research/draft IDs.
 */
const SECTION=/^AO\.CARD\.0(?:0[1-9]|[12][0-9]|30)$/;
const BLOCK=/^AO\.SM\.B\d{3}$/;
const CUE=/^AO\.SM\.C\d{4}$/;
const guideKey=n=>Number.isInteger(n)&&n>=1&&n<=30?
  "AO.CARD."+String(n).padStart(3,"0"):null;

export function currentMassExplorerStudyTarget(preview,prepared){
  const form=String(prepared?.session?.resolvedMass?.form||"").toUpperCase();
  // The current published text projection covers the original Sung Guide,
  // not Low Mass, a synthetic proper, or a separate pre/post Mass ceremony.
  if(!/^MISSA_CANTATA(?:_|$)/.test(form))return null;
  if(!preview?.root?.isConnected)return null;
  const card=preview.getCurrentCard?.();
  if(!card)return null;
  const activeSection=String(card.sourceSectionId??card.sectionId??"");
  const guideNumber=Number(card.guideSequence??card.sourceSequence);
  const key=SECTION.test(activeSection)?activeSection:guideKey(guideNumber);
  if(!key || (Number.isInteger(guideNumber)&&guideKey(guideNumber)!==key))return null;
  // Source ownership is not interchangeable with 65/67 or rollback 48 cards.
  const activeCue=String(preview.getActiveCue?.()??"");
  const ownedBlocks=(card.blocks??[]).map(row=>String(row.blockId??"")).filter(x=>BLOCK.test(x));
  const blockId=ownedBlocks.length===1?ownedBlocks[0]:null;
  return Object.freeze({momentKey:key,blockId,cueId:CUE.test(activeCue)?activeCue:null,
    sourceSectionId:activeSection,readerCardId:String(card.sectionId??""),
    presentationMode:String(preview.getPresentationMode?.()??prepared?.readerPreferences?.mode??""),
    form,provenance:"R17_CURRENT_CANONICAL_SUNG_CONTEXT"});
}

/** Stable UI entry in the native reader's existing preferences, not ribbon. */
export function installReaderMassExplorerStudy(preview,prepared,{
  win=globalThis,
  loader=()=>import("./mass-explorer.js"),
}={}){
  const root=preview?.root,panel=root?.querySelector?.('[data-role="mass-preferences"]');
  if(!panel?.ownerDocument)return null;
  const doc=panel.ownerDocument;
  const french=String(prepared?.readerPreferences?.language||"").startsWith("fr");
  const container=doc.createElement("section");
  container.className="aoMassExplorerReaderStudy";
  container.dataset.readerMassExplorerStudy="";
  const button=doc.createElement("button");
  button.type="button";
  button.className="ao-mass-prefs-more";
  button.dataset.readerMassExplorer="";
  button.textContent=french?"Comprendre ce moment de la Messe":"Understand this Mass moment";
  const note=doc.createElement("small");
  note.setAttribute("role","status");
  note.style.cssText="display:block;margin-top:7px;font:400 11px/1.4 var(--ao-font-ui,system-ui);color:var(--ao-muted,#a9afa7)";
  container.append(button,note);panel.append(container);
  let opening=false,disposed=false;
  function refresh(){
    const context=currentMassExplorerStudyTarget(preview,prepared);
    container.hidden=!context;
    button.hidden=!context;button.disabled=!context||opening;
    if(!context)note.textContent="";
    else note.textContent=french?
      "Étude facultative du Guide ; la Messe reste à sa place.":
      "Optional Guide study; your Mass position is retained.";
    return context;
  }
  const click=event=>{
    if(!event.target?.closest?.("[data-reader-mass-explorer]"))return;
    event.preventDefault?.();event.stopImmediatePropagation?.();
    if(disposed||opening)return;
    const context=refresh();if(!context)return;
    opening=true;button.disabled=true;button.setAttribute("aria-busy","true");
    void Promise.resolve().then(async()=>{
      const module=await loader();
      if(disposed||!root.isConnected)return false;
      let explorer=win?.AO_MASS_EXPLORER_V1;
      if(typeof explorer?.open!=="function"){
        explorer=module.createMassExplorerRuntime(win);
        win.AO_MASS_EXPLORER_V1=explorer;
      }
      const opened=await explorer.open({...context,origin:"mass",
        language:String(prepared?.readerPreferences?.language||""),
        trigger:button});
      if(opened!==true)throw new Error("MASS_EXPLORER_NOT_AVAILABLE");
      return true;
    }).catch(error=>{
      if(disposed)return;
      win?.console?.error?.("Mass Explorer context failed",error);
      note.textContent=french?
        "Étude indisponible. La Messe reste à sa place.":
        "Study unavailable. Your Mass position is retained.";
      note.setAttribute("role","alert");
    }).finally(()=>{
      opening=false;
      if(!disposed){
        button.removeAttribute("aria-busy");
        refresh();
      }
    });
  };
  root.addEventListener("click",click,true);
  const Observer=doc.defaultView?.MutationObserver??globalThis.MutationObserver;
  const observer=typeof Observer==="function"?new Observer(refresh):null;
  observer?.observe?.(root,{attributes:true,attributeFilter:[
    "data-r17-native-event","data-r17-native-cue","data-r17-presentation-mode","data-r17-native-rite-record"
  ]});
  refresh();
  return Object.freeze({refresh,dispose(){
    disposed=true;observer?.disconnect?.();root.removeEventListener?.("click",click,true);
    container.remove();
  }});
}
