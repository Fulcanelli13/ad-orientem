/**
 * Opt-in typeface A/B study. No default-route changes and no persisted setting.
 * Explicit URL query only: ?aoTypographyTrial=inter or source-sans-3.
 * Preserve source texts, cue ownership, layout rules and typography weights.
 */
export const TYPOGRAPHY_TRIAL_VERSION="sans-serif-typography-trial-v1";
export const TYPOGRAPHY_TRIAL_MODES=Object.freeze({
  inter:Object.freeze({name:"Inter",font:"'Inter',system-ui,sans-serif"}),
  "source-sans-3":Object.freeze({name:"Source Sans 3",font:"'Source Sans 3',system-ui,sans-serif"}),
});
const FONT_URL="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap";
const STYLE_ID="ao-typography-trial-style";
const DOCK_ID="ao-typography-trial-dock";
const LINK_ID="ao-typography-trial-fonts";

/** Return null for unsupported modes: a URL must never select a random font. */
export function normalizeTypographyTrial(value){
  return Object.hasOwn(TYPOGRAPHY_TRIAL_MODES,String(value||"").toLowerCase())
    ? String(value).toLowerCase() : null;
}

export function typographyTrialCss(){
  return `
:root[data-ao-typography-trial="inter"]{--ao-trial-family:'Inter',system-ui,sans-serif}
:root[data-ao-typography-trial="source-sans-3"]{--ao-trial-family:'Source Sans 3',system-ui,sans-serif}
/* This preview only overrides typeFACE. Keep the existing font sizes, weights,
   paragraph focus, colours, icons, gesture rails and liturgical emphasis. */
:root[data-ao-typography-trial]{
  --font-display:var(--ao-trial-family);
  --font-liturgical:var(--ao-trial-family);
  --font-body:var(--ao-trial-family);
  --ao-font-display:var(--ao-trial-family);
  --ao-font-liturgical:var(--ao-trial-family);
  --ao-font-body:var(--ao-trial-family);
  --ao-font-ui:var(--ao-trial-family);
}
:root[data-ao-typography-trial] :is(body,#ao-global-ribbon,.homeScreen,#aoPray435930,#ao-scripture-overlay,#ao-r17-native-reader-preview,#ao-mass-flow-v1),
:root[data-ao-typography-trial] :is(#ao-global-ribbon,.homeScreen,#aoPray435930,#ao-scripture-overlay,#ao-r17-native-reader-preview,#ao-mass-flow-v1)
  *:not(svg):not(svg *):not([data-ao-asset-id]):not(.material-icons):not([class*="icon-font"]){
  font-family:var(--ao-trial-family)!important;
}
#${DOCK_ID}{
 position:fixed;right:12px;bottom:calc(var(--ao-global-ribbon-h,68px) + 12px);
 z-index:2147483647;display:flex;gap:3px;align-items:center;flex-wrap:wrap;
 padding:6px;border:1px solid rgba(201,173,120,.42);border-radius:12px;
 background:rgba(8,12,18,.98);box-shadow:0 8px 28px #0009;
 font:500 12px/1.2 system-ui,sans-serif;color:#eae3d6;
}
#${DOCK_ID} button{
 appearance:none;min-height:40px;padding:6px 9px;border:1px solid transparent;
 border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer;
}
#${DOCK_ID} button[aria-pressed="true"]{
 color:#f1e4c8;border-color:rgba(201,173,120,.48);background:rgba(201,173,120,.12);
}
#${DOCK_ID} button:focus-visible{outline:2px solid #c9ad78;outline-offset:1px}
:root[data-ao-typography-trial-hide-dock="true"] #${DOCK_ID}{display:none!important}
@media(max-width:390px){#${DOCK_ID}{left:8px;right:8px;justify-content:center}}
`;
}

export function installTypographyTrial(win=globalThis){
  const doc=win?.document,location=win?.location;
  if(!doc?.createElement||!location?.search)return null;
  let mode=null;
  try{mode=normalizeTypographyTrial(new URLSearchParams(location.search).get("aoTypographyTrial"))}catch{}
  if(!mode)return null;
  const root=doc.documentElement;
  const host=doc.head??root;
  if(!doc.getElementById(LINK_ID)){
    const link=doc.createElement("link");
    link.rel="stylesheet";link.href=FONT_URL;link.id=LINK_ID;
    host.append(link);
  }
  if(!doc.getElementById(STYLE_ID)){
    const style=doc.createElement("style");style.id=STYLE_ID;
    style.textContent=typographyTrialCss();host.append(style);
  }
  function set(next){
    const key=normalizeTypographyTrial(next);
    if(key)root.dataset.aoTypographyTrial=key;
    else delete root.dataset.aoTypographyTrial;
    doc.querySelectorAll?.("#"+DOCK_ID+" [data-ao-trial-mode]")?.forEach?.(button=>
      button.setAttribute("aria-pressed",String(button.dataset.aoTrialMode===(key||"baseline")))
    );
    return key;
  }
  function status(){
    const key=root.dataset.aoTypographyTrial||null;
    const name=TYPOGRAPHY_TRIAL_MODES[key]?.name||null;
    const matches=[...(doc.fonts??[])].filter?.(f=>f.family?.replace(/['"]/g,"")===name)??[];
    return Object.freeze({version:TYPOGRAPHY_TRIAL_VERSION,selected:key,
      font:name,fontFaces:matches.length,loadedFaces:matches.filter(f=>f.status==="loaded").length});
  }
  function attachDock(){
    if(doc.getElementById(DOCK_ID)||!doc.body)return;
    const dock=doc.createElement("div");dock.id=DOCK_ID;
    dock.setAttribute("role","group");dock.setAttribute("aria-label","Typeface comparison only");
    for(const [key,label] of [["baseline","Original"],["inter","Inter"],["source-sans-3","Source Sans 3"]]){
      const button=doc.createElement("button");button.type="button";
      button.dataset.aoTrialMode=key;button.textContent=label;
      button.setAttribute("aria-pressed",String(mode===key));
      button.addEventListener("click",()=>set(key==="baseline"?null:key));
      dock.append(button);
    }
    const hide=doc.createElement("button");hide.type="button";
    hide.setAttribute("aria-label","Hide typography comparison controls");
    hide.textContent="×";
    hide.addEventListener("click",()=>{root.dataset.aoTypographyTrialHideDock="true"});
    dock.append(hide);doc.body.append(dock);
  }
  set(mode);
  if(doc.body)attachDock();
  else doc.addEventListener?.("DOMContentLoaded",attachDock,{once:true});
  const api=Object.freeze({
    version:TYPOGRAPHY_TRIAL_VERSION,set,status,
    hideDock(){root.dataset.aoTypographyTrialHideDock="true"},
    showDock(){delete root.dataset.aoTypographyTrialHideDock},
  });
  win.AO_TYPOGRAPHY_TRIAL_V1=api;
  return api;
}
