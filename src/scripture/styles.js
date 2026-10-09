export const SCRIPTURE_STYLE_ID="ao-scripture-library-style";
export function installScriptureStyles(doc=globalThis.document){
 if(!doc?.createElement)return false;
 if(doc.getElementById(SCRIPTURE_STYLE_ID))return true;
 const style=doc.createElement("style");style.id=SCRIPTURE_STYLE_ID;
 style.textContent=`
 #ao-scripture-overlay{position:fixed;inset:0;z-index:2147483647!important;background:#080c12ee;overflow:auto;padding:max(12px,env(safe-area-inset-top)) 12px max(24px,env(safe-area-inset-bottom));color:#ece6d6}
 #ao-scripture-overlay[hidden]{display:none!important}
 .aoScriptureLibrary{max-width:820px;margin:0 auto;padding:clamp(14px,4vw,34px);border:1px solid #655d4d;background:#111720;border-radius:14px;font-family:Georgia,"Garamond",serif;line-height:1.6}
 .aoScriptureHeader{display:flex;align-items:center;justify-content:space-between;gap:12px}
 .aoScriptureHeader h2{font-size:clamp(24px,4vw,36px);font-weight:400;margin:0;color:#e9dfc4}
 .aoScriptureLibrary button,.aoScriptureLibrary select,.aoScriptureLibrary input{font:inherit;color:#efe8d9;background:#1a2330;border:1px solid #786b56;border-radius:8px;padding:8px 12px;max-width:100%}
 .aoScriptureLibrary button{cursor:pointer}
 .aoScriptureLibrary button:disabled{opacity:.45;cursor:not-allowed}
 .aoScriptureLibrary button:focus-visible,.aoScriptureLibrary input:focus-visible,.aoScriptureLibrary select:focus-visible{outline:2px solid #e1cc99;outline-offset:2px}
 .aoScriptureLibrary label{display:flex;flex-direction:column;gap:5px;color:#d9d0bb;font-size:13px}
 .aoScriptureNav{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:12px;align-items:end}
 .aoScriptureNotice{color:#b4ac9c;font-family:system-ui,sans-serif;font-size:13px}
 .aoScriptureReading{margin:20px 0;border-top:1px solid #524b3e;border-bottom:1px solid #524b3e;padding:12px 0}
 .aoScriptureReading h3{font-size:20px;font-weight:400}
 .aoScriptureText{font-size:19px;line-height:1.9;min-height:75px}
 .aoScriptureVerseNumber{font:12px system-ui,sans-serif;color:#c3ae83}
 .aoScriptureActions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
 .aoScriptureSearch{margin:20px 0}
 .aoScriptureSearch input{width:100%}
 .aoScriptureResults,.aoScriptureBookmarks,.aoScriptureRosary{margin-top:12px}
 .aoScriptureResults button,.aoScriptureBookmarks button,.aoScriptureMystery button{display:block;text-align:left;width:100%;margin:5px 0}
 .aoScriptureMystery{padding:12px 0;border-bottom:1px solid #474337}
 .aoScriptureMystery p{font-size:15px;color:#c6bdac;margin:4px 0}
 .aoScriptureLibrary summary{cursor:pointer;font-size:18px;padding:8px 0}
 .aoScriptureContextBar{margin:12px 0;padding:10px 0;border-block:1px solid #524b3e}
 .aoScriptureContextTitle{margin:0 0 7px;color:#d4c7af;font:500 13px/1.4 system-ui,sans-serif}
 .aoScriptureContextControls{display:flex;gap:6px;flex-wrap:wrap}
 .aoScriptureLibrary .aoScriptureContextControls button{border-radius:999px;padding:6px 12px;font:500 13px/1.3 system-ui,sans-serif;background:transparent;border:1px solid #73644f}
 .aoScriptureLibrary .aoScriptureContextControls button[aria-pressed="true"]{background:#594935;color:#fff0cf}
 .aoScriptureContextCommentary{padding:12px 2px 6px;font:14px/1.55 Georgia,serif;color:#dfd6c8}
 .aoScriptureContextCommentary p{margin:6px 0}
 .aoScriptureContextCommentary a,#ao-scripture-overlay [data-scripture-whole-chapter]{color:#e3cb9b;text-underline-offset:3px}
 .aoHomeScriptureLink{margin:12px 0}
 @media(max-width:700px){.aoScriptureNav{grid-template-columns:repeat(2,minmax(0,1fr))}.aoScriptureLibrary{padding:16px}.aoScriptureText{font-size:18px}}
 @media(prefers-reduced-motion:reduce){#ao-scripture-overlay *{scroll-behavior:auto!important;transition:none!important}}
 `;
 (doc.head||doc.documentElement).append(style);
 return true;
}

/* Installed on cold boot: context capsules are usable before opening Bible. */
export function installScriptureContextStyles(doc=globalThis.document){
 if(!doc?.createElement)return false;
 if(doc.getElementById("ao-scripture-context-style"))return true;
 const css=doc.createElement("style");css.id="ao-scripture-context-style";
 css.textContent=`
 .aoScriptureContextCapsule{display:inline-flex;vertical-align:middle;align-items:center;justify-content:center;min-height:30px;margin:4px 3px;padding:5px 11px;border-radius:999px;border:1px solid var(--liturgical-border,rgba(201,172,111,.48));background:var(--liturgical-soft,rgba(201,172,111,.055));color:var(--liturgical,#ceb680);font:600 max(12px,.75rem)/1.35 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.005em;cursor:pointer}
 .aoScriptureContextCapsule:focus-visible{outline:2px solid var(--liturgical,#ceb680);outline-offset:3px}
 .aoScriptureContextError{display:inline-block;margin:6px;color:var(--ao-text-primary,#ece6d6);font:13px/1.45 var(--ao-font-ui,system-ui,sans-serif)}
 @media(prefers-reduced-motion:reduce){.aoScriptureContextCapsule{transition:none!important}}
 `;
 (doc.head||doc.documentElement).append(css);return true;
}
