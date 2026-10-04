// Emergency shell recovery for the 4 Oct 2026 field build.
// This module repairs browser-level regressions in the old host while the
// locked non-Mass head is being promoted. It does not alter liturgical data.

const KEY="ao-field-shell-recovery-v1";
const DO_PIN="126a07f91ede04664108abb6fb20ace3f4de14b9";
const BROKEN_FR_LOCAL=/^https:\/\/raw\.githubusercontent\.com\/mmolenda\/missalemeum\/[^/]+\/backend\/resources\/divinum-officium-local\/web\/www\/missa\/Francais\/(.+)$/i;

export function rewriteBrokenFrenchSourceUrl(input){
  const raw=String(input??"");
  const match=raw.match(BROKEN_FR_LOCAL);
  if(!match)return raw;
  return "https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
    DO_PIN+"/web/www/missa/Francais/"+match[1];
}

function installFrenchSourceRedirect(win=globalThis){
  if(!win?.fetch || win.__aoFrenchSourceRedirectInstalled)return false;
  const nativeFetch=win.fetch.bind(win);
  const wrapped=(input,init)=>{
    const raw=typeof input==="string" ? input : input instanceof URL ? input.href : input?.url ?? "";
    const rewritten=rewriteBrokenFrenchSourceUrl(raw);
    if(!rewritten || rewritten===raw)return nativeFetch(input,init);
    try{
      if(typeof Request!=="undefined" && input instanceof Request){
        return nativeFetch(new Request(rewritten,input),init);
      }
    }catch{}
    return nativeFetch(rewritten,init);
  };
  try{
    Object.defineProperty(win,"fetch",{value:wrapped,configurable:true,writable:true});
    Object.defineProperty(win,"__aoFrenchSourceRedirectInstalled",{value:true});
    return true;
  }catch{
    try{win.fetch=wrapped;win.__aoFrenchSourceRedirectInstalled=true;return true}catch{return false}
  }
}

export function fieldDate(win=globalThis){
  return win?.AO_RUNTIME_V8?.store?.getState?.()?.selectedDate ??
    win?.AO_CELEBRATION_ARCH_V1?.date ??
    win?.AO_CELEBRATION_ARCH_V1?.liturgicalDay?.date ?? null;
}

export async function openOct4FieldStep(step,win=globalThis){
  const key=String(step??"").toLowerCase();
  if(key==="adoration"){
    const result=await win?.AO_MODULES?.open?.("pray.adoration");
    return Boolean(result?.ok ?? result);
  }
  if(key==="benediction"){
    const result=await win?.AO_MODULES?.open?.("pray.benediction");
    return Boolean(result?.ok ?? result);
  }
  if(key==="mass")return Boolean(win?.AO_CELEBRATION_API?.openPreflight?.());
  return false;
}

function moduleSurfaceOpen(doc){
  const selectors=[
    "#aoPrayerBookRoot:not([aria-hidden='true'])",
    "#ao-v354-root:not([aria-hidden='true'])",
    "#ao-r17-native-reader-preview",
    "#ao-r17-reader-preview"
  ];
  return selectors.some(sel=>{
    const el=doc?.querySelector?.(sel);
    if(!el)return false;
    const style=doc?.defaultView?.getComputedStyle?.(el);
    return !style || (style.display!=="none" && style.visibility!=="hidden");
  });
}

function installOct4PremassLauncher(win=globalThis,doc=globalThis.document){
  if(!doc || doc.getElementById("ao-oct4-field-sequence"))return false;
  const style=doc.createElement("style");
  style.id="ao-oct4-field-sequence-style";
  style.textContent=`
    #ao-oct4-field-sequence{position:fixed;z-index:2147482500;left:50%;bottom:14px;transform:translateX(-50%);width:min(720px,calc(100vw - 24px));display:none;grid-template-columns:auto 1fr;gap:10px 14px;align-items:center;padding:11px 13px;border:1px solid rgba(112,177,137,.42);border-radius:14px;background:rgba(6,13,18,.96);box-shadow:0 14px 48px rgba(0,0,0,.45);backdrop-filter:blur(12px);font-family:Georgia,"Times New Roman",serif;color:#eee7d7}
    #ao-oct4-field-sequence[data-show="1"]{display:grid}
    #ao-oct4-field-sequence .aoFieldTitle{font:600 11px/1.2 system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#6fb18a}
    #ao-oct4-field-sequence .aoFieldSteps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
    #ao-oct4-field-sequence button{min-height:46px;border:1px solid rgba(255,255,255,.12);border-radius:10px;background:#0d151d;color:#efe7d8;padding:8px 10px;font:600 13px/1.15 system-ui,sans-serif}
    #ao-oct4-field-sequence button:last-child{border-color:rgba(112,177,137,.55);background:#10231a;color:#bde1c9}
    @media(max-width:560px){#ao-oct4-field-sequence{grid-template-columns:1fr}#ao-oct4-field-sequence .aoFieldSteps{grid-template-columns:1fr 1fr}#ao-oct4-field-sequence button:last-child{grid-column:1/-1}}
  `;
  doc.head?.appendChild(style);
  const root=doc.createElement("div");
  root.id="ao-oct4-field-sequence";
  root.setAttribute("role","region");
  root.setAttribute("aria-label","Before Mass today");
  root.innerHTML=`<div class="aoFieldTitle">Before Mass today</div><div class="aoFieldSteps"><button type="button" data-ao-field-step="adoration">1 · Adoration</button><button type="button" data-ao-field-step="benediction">2 · Benediction</button><button type="button" data-ao-field-step="mass">3 · Holy Rosary Mass</button></div>`;
  doc.body?.appendChild(root);
  root.addEventListener("click",event=>{
    const button=event.target?.closest?.("[data-ao-field-step]");
    if(button)void openOct4FieldStep(button.dataset.aoFieldStep,win);
  });
  const refresh=()=>{
    const today=fieldDate(win)==="2026-10-04";
    root.dataset.show=today && !moduleSurfaceOpen(doc) ? "1" : "0";
  };
  refresh();
  if(typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(refresh);
    observer.observe(doc.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["aria-hidden","class","style"]});
    win.AO_OCT4_FIELD_SEQUENCE_OBSERVER=observer;
  }
  win.setInterval?.(refresh,1200);
  return true;
}


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
    frenchSourceRedirect:installFrenchSourceRedirect(win),
    oct4PremassLauncher:installOct4PremassLauncher(win,doc),
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
