// Global shell focus/visibility guard.
//
// The historical monolith still contains surfaces that toggle aria-hidden directly.
// Chromium warns (and assistive-technology state becomes invalid) when a hidden
// ancestor still contains document.activeElement. Release focus before those
// surfaces hide, especially the Prayer Book .lab-back path observed in production.

const INSTALLED=new WeakMap();

export const SHELL_HIDE_TRIGGER_SELECTOR=[
  ".lab-back",
  "[data-ao-close]",
  "[data-ao-back]",
  "[data-prayer-book-close]",
].join(",");

function closestHideSurface(node){
  return node?.closest?.(
    "[aria-modal='true'],[role='dialog'],#aoPrayerBookRoot,.aoPrayerBookRoot,.lab-modal,.lab-sheet"
  ) ?? null;
}

function bodyFallbackFocus(doc){
  const body=doc?.body;
  if(!body?.focus)return false;
  const had=body.hasAttribute?.("tabindex")??false;
  const previous=had?body.getAttribute("tabindex"):null;
  if(!had)body.setAttribute?.("tabindex","-1");
  try{body.focus({preventScroll:true});}catch{try{body.focus();}catch{}}
  if(!had)body.removeAttribute?.("tabindex");
  else if(previous!=null)body.setAttribute?.("tabindex",previous);
  return doc.activeElement===body;
}

export function releaseFocusFromSubtree(root,{doc=globalThis.document}={}){
  const active=doc?.activeElement??null;
  if(!root || !active || active===doc.body || !root.contains?.(active)){
    return Object.freeze({released:false,reason:"NO_FOCUSED_DESCENDANT"});
  }

  try{active.blur?.();}catch{}
  if(!root.contains?.(doc.activeElement)){
    return Object.freeze({released:true,reason:"BLUR"});
  }

  bodyFallbackFocus(doc);
  return Object.freeze({
    released:!root.contains?.(doc.activeElement),
    reason:root.contains?.(doc.activeElement)?"FOCUS_RELEASE_FAILED":"BODY_FALLBACK",
  });
}

function releaseForTrigger(target,doc){
  const trigger=target?.closest?.(SHELL_HIDE_TRIGGER_SELECTOR)??null;
  if(!trigger)return null;
  const surface=closestHideSurface(trigger);
  if(!surface)return null;
  return releaseFocusFromSubtree(surface,{doc});
}

export function installShellFocusVisibilityGuard({
  doc=globalThis.document,
  win=doc?.defaultView??globalThis,
}={}){
  if(!doc?.addEventListener)return Object.freeze({installed:false,reason:"DOCUMENT_UNAVAILABLE"});
  const existing=INSTALLED.get(doc);
  if(existing)return existing;

  const onPointer=(event)=>{releaseForTrigger(event.target,doc);};
  const onClick=(event)=>{releaseForTrigger(event.target,doc);};

  doc.addEventListener("pointerdown",onPointer,true);
  doc.addEventListener("click",onClick,true);

  let observer=null;
  const MutationObserverImpl=win?.MutationObserver;
  if(typeof MutationObserverImpl==="function"){
    observer=new MutationObserverImpl((records)=>{
      for(const record of records){
        if(record.type!=="attributes" || record.attributeName!=="aria-hidden")continue;
        const target=record.target;
        if(target?.getAttribute?.("aria-hidden")==="true"){
          releaseFocusFromSubtree(target,{doc});
        }
      }
    });
    observer.observe(doc.documentElement??doc,{subtree:true,attributes:true,attributeFilter:["aria-hidden"]});
  }

  const api=Object.freeze({
    installed:true,
    releaseFocusFromSubtree:(root)=>releaseFocusFromSubtree(root,{doc}),
    uninstall(){
      doc.removeEventListener?.("pointerdown",onPointer,true);
      doc.removeEventListener?.("click",onClick,true);
      observer?.disconnect?.();
      INSTALLED.delete(doc);
    },
  });
  INSTALLED.set(doc,api);
  return api;
}
