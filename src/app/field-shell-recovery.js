// Emergency shell recovery for the 4 Oct 2026 field build.
// This module repairs browser-level regressions in the old host while the
// locked non-Mass head is being promoted. It does not alter liturgical data.

const KEY="ao-field-shell-recovery-v1";

function installHapticGate(win=globalThis){
  const nav=win?.navigator;
  if(!nav || typeof nav.vibrate!=="function" || nav.__aoHapticGateInstalled) return false;
  const native=nav.vibrate.bind(nav);
  try{
    const gated=(pattern)=>{
      // Chrome logs an Intervention every time vibrate() is called before a
      // user gesture. Suppress those invalid calls rather than spamming the
      // console and relying on the browser to reject them.
      const ua=nav.userActivation;
      if(ua && !ua.hasBeenActive) return false;
      try{return native(pattern)}catch{return false}
    };
    Object.defineProperty(nav,"vibrate",{value:gated,configurable:true,writable:true});
    Object.defineProperty(nav,"__aoHapticGateInstalled",{value:true});
    return true;
  }catch{
    return false;
  }
}

function syncPrayerBookInert(doc=globalThis.document){
  const root=doc?.getElementById?.("aoPrayerBookRoot");
  if(!root)return false;
  const hidden=root.getAttribute("aria-hidden")==="true";
  try{root.inert=hidden}catch{}
  return true;
}

function installPrayerBookFocusGuard(doc=globalThis.document){
  if(!doc || doc.documentElement?.dataset?.aoPrayerBookFocusGuard==="1")return false;
  if(doc.documentElement)doc.documentElement.dataset.aoPrayerBookFocusGuard="1";

  const isClosingControl=(target)=>Boolean(target?.closest?.(
    "#aoPrayerBookRoot .lab-back,"+
    "#aoPrayerBookRoot [data-close],"+
    "#aoPrayerBookRoot [data-dismiss],"+
    "#aoPrayerBookRoot [aria-label*='Close' i],"+
    "#aoPrayerBookRoot [aria-label*='Back' i]"
  ));

  const releaseFocus=(event)=>{
    if(!isClosingControl(event.target))return;
    const active=doc.activeElement;
    if(active && active!==doc.body && typeof active.blur==="function"){
      try{active.blur()}catch{}
    }
  };
  doc.addEventListener("pointerdown",releaseFocus,true);
  doc.addEventListener("keydown",(event)=>{
    if((event.key==="Enter"||event.key===" ")&&isClosingControl(event.target))releaseFocus(event);
  },true);

  const root=doc.getElementById("aoPrayerBookRoot");
  if(root && typeof MutationObserver!=="undefined"){
    syncPrayerBookInert(doc);
    const observer=new MutationObserver(()=>syncPrayerBookInert(doc));
    observer.observe(root,{attributes:true,attributeFilter:["aria-hidden"]});
    globalThis.AO_PRAYERBOOK_INERT_OBSERVER=observer;
  }
  return true;
}

function markHostGeneration(doc=globalThis.document){
  if(!doc?.documentElement)return;
  doc.documentElement.dataset.aoFieldShellRecovery=KEY;
  // Expose the mismatch explicitly for QA. This is removed once the locked
  // non-Mass donor becomes index.html.
  const release=doc.documentElement.dataset.aoRelease||"";
  if(!release || /^43\.(1[89]|2\d|3[0-3])$/.test(release)){
    doc.documentElement.dataset.aoHostGeneration="legacy-pre-nonmass-freeze";
  }
}

export function installFieldShellRecovery({win=globalThis,doc=globalThis.document}={}){
  if(win?.AO_FIELD_SHELL_RECOVERY?.installed)return win.AO_FIELD_SHELL_RECOVERY;
  const state=Object.freeze({
    installed:true,
    hapticGate:installHapticGate(win),
    prayerBookFocusGuard:installPrayerBookFocusGuard(doc),
  });
  markHostGeneration(doc);
  win.AO_FIELD_SHELL_RECOVERY=state;
  return state;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  if(document.readyState==="loading"){
    document.addEventListener("DOMContentLoaded",()=>installFieldShellRecovery(),{once:true});
  }else installFieldShellRecovery();
}
