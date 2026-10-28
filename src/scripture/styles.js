export const SCRIPTURE_STYLE_ID="ao-scripture-library-style";
export function installScriptureStyles(doc=globalThis.document){
 if(!doc?.createElement)return false;
 if(doc.getElementById(SCRIPTURE_STYLE_ID))return true;
 const style=doc.createElement("style");style.id=SCRIPTURE_STYLE_ID;
 style.textContent=`
 #ao-scripture-overlay{position:fixed;inset:0;z-index:2147483647!important;background:#080c12;overflow:auto;padding:max(12px,env(safe-area-inset-top)) 12px max(24px,env(safe-area-inset-bottom));color:#ece6d6}
 #ao-scripture-overlay[hidden]{display:none!important}
 .aoScriptureLibrary{max-width:820px;margin:0 auto;padding:clamp(14px,4vw,34px);border:1px solid #655d4d;background:#111720;border-radius:14px;font-family:var(--ao-font-liturgical,"EB Garamond",Georgia,serif);line-height:1.6}
 .aoScriptureHeader{display:flex;align-items:center;justify-content:space-between;gap:12px}
 .aoScriptureHeader h2{font-size:clamp(24px,4vw,36px);font-weight:400;margin:0;color:#e9dfc4}
 .aoScriptureEnglishSwitch{display:flex;align-items:center;gap:6px;margin:10px 0 13px}
 .aoScriptureLibrary .aoScriptureEnglishSwitch button{flex:1;min-height:44px;padding:9px 12px;border:1px solid #665b48;border-radius:8px;background:transparent;color:#cfc3ac;font:600 13px/1.25 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureLibrary .aoScriptureEnglishSwitch button[aria-pressed="true"]{border-color:#b79c6a;background:rgba(175,142,89,.16);color:#f5e7c4}
 .aoScriptureEditorialMine{display:inline-block;color:#c5b48f;font:13px/1.6 var(--ao-font-ui,"EB Garamond",Georgia,serif);margin:8px 0 15px;text-decoration:underline;text-underline-offset:3px}
 .aoScriptureEditorialMine:focus-visible{outline:2px solid #e1cc99;outline-offset:2px}
 .aoScriptureLibrary button,.aoScriptureLibrary select,.aoScriptureLibrary input{font:inherit;color:#efe8d9;background:#1a2330;border:1px solid #786b56;border-radius:8px;padding:8px 12px;max-width:100%}
 .aoScriptureLibrary button{cursor:pointer}
 .aoScriptureLibrary button:disabled{opacity:.45;cursor:not-allowed}
 
 /* Optional, source-owned preparation and thanksgiving: secondary to Scripture. */
 .aoScriptureOptionalPrayer{margin:10px 0 12px;border-top:1px solid rgba(205,182,135,.16);border-bottom:1px solid rgba(205,182,135,.16);color:#d9caaa}
 .aoScriptureOptionalPrayer>summary{min-height:42px;display:flex;align-items:center;cursor:pointer;padding:9px 3px;font:500 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureOptionalPrayer>summary:focus-visible{outline:2px solid #e1cc99;outline-offset:2px}
 .aoScriptureOptionalPrayerBody{padding:4px clamp(4px,2vw,16px) 16px}
 .aoScriptureOptionalPrayerTitle{font:400 18px/1.45 var(--ao-font-liturgical,Georgia,serif);color:#efe1c4;margin:12px 0 8px}
 .aoScriptureOptionalPrayerText{font:400 clamp(17px,2.6vw,19px)/1.75 var(--ao-font-liturgical,Georgia,serif);color:#ede6d9;margin:0 0 12px;white-space:pre-line}
 .aoScriptureOptionalPrayerChoices{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
 .aoScriptureLibrary .aoScriptureOptionalPrayerChoices button{min-height:40px;font:500 13px/1.3 var(--ao-font-ui,Georgia,serif);background:transparent}
 .aoScriptureLibrary .aoScriptureOptionalPrayerChoices button[aria-pressed="true"]{background:rgba(174,142,89,.18);border-color:#d4bb83;color:#f7edcd}
 .aoScriptureOptionalPrayerBody>a{font:12px/1.5 var(--ao-font-ui,Georgia,serif);color:#ceb88d;text-decoration:underline;text-underline-offset:3px}

 .aoScriptureLibrary button:focus-visible,.aoScriptureLibrary input:focus-visible,.aoScriptureLibrary select:focus-visible{outline:2px solid #e1cc99;outline-offset:2px}
 .aoScriptureRelated{margin:16px 0;border-top:1px solid #625744;border-bottom:1px solid #625744;padding:8px 0}
 .aoScriptureRelated>summary{min-height:48px;box-sizing:border-box;padding:14px 0;cursor:pointer;color:#e9dfc4;font:500 16px var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
 .aoScriptureRelatedList{display:grid;gap:9px;padding:6px 0 12px}
 .aoScriptureRelatedIntro{font:13px/1.5 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#bdb4a1;margin:0 0 5px}
 .aoScriptureRelatedObject{display:grid;gap:3px;padding:11px 13px;background:#16202b;border-left:2px solid #a28b5e;border-radius:2px 7px 7px 2px}
 .aoScriptureRelatedObject strong{font:500 15px/1.4 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:#f1e5c7}
 .aoScriptureRelatedReference{font:13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#c3b79b}
 .aoScriptureRelatedExplanation{font:13px/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#e0d9ca;margin:0}
 .aoScriptureRelatedObject button,.aoScriptureLibrary [data-scripture-related-back]{min-height:48px;box-sizing:border-box}
 .aoScriptureRelatedObject button{justify-self:start;font:13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);margin-top:4px}
 .aoScriptureLibrary [data-scripture-related-back]{margin:9px 0}
 .aoScriptureLibrary label{display:flex;flex-direction:column;gap:5px;color:#d9d0bb;font-size:13px}
 .aoScriptureNav{display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;gap:12px;align-items:end}
 .aoScriptureNotice{color:#b4ac9c;font-family:var(--ao-font-ui,"EB Garamond",Georgia,serif);font-size:13px}
 .aoScriptureReading{margin:20px 0;border-top:1px solid #524b3e;border-bottom:1px solid #524b3e;padding:12px 0}
 .aoScriptureReading h3{font-size:20px;font-weight:400}
 .aoScriptureText{font-size:19px;line-height:1.9;min-height:75px}
 .aoScriptureVerseNumber{font:13px var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#c3ae83}
 .aoScriptureActions{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}
 .aoScriptureSearch{margin:20px 0}
 .aoScriptureSearch input{width:100%}
 .aoScriptureResults,.aoScriptureBookmarks,.aoScriptureRosary{margin-top:12px}
 .aoScriptureResults button,.aoScriptureBookmarks button,.aoScriptureMystery button{display:block;text-align:left;width:100%;margin:5px 0}
 .aoScriptureMystery{padding:12px 0;border-bottom:1px solid #474337}
 .aoScriptureMystery p{font-size:15px;color:#c6bdac;margin:4px 0}
 .aoScriptureLibrary summary{cursor:pointer;font-size:18px;padding:8px 0}
 .aoScriptureContextBar{margin:12px 0;padding:10px 0;border-block:1px solid #524b3e}
 .aoScriptureContextTitle{margin:0 0 7px;color:#d4c7af;font:500 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureSegments{display:flex;flex-wrap:wrap;gap:6px;margin:9px 0 3px}
 .aoScriptureLibrary .aoScriptureSegments button{border-radius:999px;padding:6px 11px;font:500 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);background:transparent;border:1px solid #73644f}
 .aoScriptureLibrary .aoScriptureSegments button[aria-pressed="true"]{background:#594935;color:#fff0cf}
 .aoScriptureContextControls{display:flex;gap:6px;flex-wrap:wrap}
 .aoScriptureLibrary .aoScriptureContextControls button{border-radius:999px;padding:6px 12px;font:500 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);background:transparent;border:1px solid #73644f}
 .aoScriptureLibrary .aoScriptureContextControls button[aria-pressed="true"]{background:#594935;color:#fff0cf}
 .aoScriptureContextCommentary{padding:12px 2px 6px;font:14px/1.55 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:#dfd6c8}
 .aoScriptureContextCommentary p{margin:6px 0}
 .aoScriptureContextCommentary a,#ao-scripture-overlay [data-scripture-whole-chapter]{color:#e3cb9b;text-underline-offset:3px}
 .aoScriptureLibrary{max-width:780px;border-color:rgba(182,155,110,.28);background:#0e151d}
 .aoScriptureHeader{padding:0 0 12px;border-bottom:1px solid rgba(205,182,135,.22)}
 .aoScriptureHeader h2{font-size:clamp(21px,3vw,29px)}
 .aoScriptureContextBar{margin:0;padding:17px 0 10px;border:0}
 .aoScriptureContextTitle{margin:0 0 12px;color:#d9c9aa;letter-spacing:.025em}
 .aoScriptureContextControls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px}
 .aoScriptureLibrary .aoScriptureContextControls button{border:1px solid transparent;border-bottom:1px solid #74664f;border-radius:4px;padding:12px 5px;color:#c9bcaa;min-height:46px;background:transparent;font-size:clamp(12px,2.8vw,14px)}
 .aoScriptureLibrary .aoScriptureContextControls button[aria-pressed="true"]{background:rgba(174,142,89,.13);border-color:#a48b62;color:#f0dfbc}
 .aoScriptureReading{margin:8px 0 14px;padding:8px 0 16px;border-top:0;border-bottom:1px solid rgba(205,182,135,.22)}
 .aoScriptureReading h3{font-size:clamp(21px,3.4vw,26px);color:#eee1c5;font-weight:400;margin:10px 0}
 .aoScriptureText{font-size:clamp(19px,2.5vw,21px);line-height:1.8;min-height:0}
 .aoScriptureText .aoScriptureVerse{margin:0 0 .7em}
 .aoScriptureVerseNumber{display:inline-block;min-width:2em;vertical-align:baseline;opacity:.82}
 .aoScriptureActions{border-top:1px solid rgba(205,182,135,.16);padding-top:12px}
 .aoScriptureLibrary .aoScriptureActions button{padding:7px 10px;background:transparent;border-color:rgba(205,182,135,.32);font:500 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureBrowse,.aoScriptureSearch,.aoScriptureBookmarks,.aoScriptureRosary{padding:10px 0;border-bottom:1px solid rgba(205,182,135,.17);margin:0}
 .aoScriptureLibrary .aoScriptureBrowse summary,.aoScriptureLibrary .aoScriptureSearch summary,.aoScriptureLibrary .aoScriptureBookmarks summary,.aoScriptureLibrary .aoScriptureRosary summary{color:#cfc2ac;font:500 14px/1.5 var(--ao-font-ui,"EB Garamond",Georgia,serif);padding:7px 0}
 .aoScriptureNav{grid-template-columns:repeat(3,minmax(0,1fr));margin:12px 0}
 .aoScriptureContextCommentary{font:17px/1.72 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:#e2dac9;padding:15px 0 22px}
 .aoScriptureContextCommentary h3{font-size:20px;font-weight:400;line-height:1.3;color:#f0dfbc;margin:2px 0 11px}
 .aoScriptureContextCommentary .aoScriptureCommentaryParagraph{margin:18px 0}
 .aoScriptureCommentaryParagraph strong{font-weight:600;color:#e7d3a4}
 .aoScriptureContextCommentary .aoScriptureCommentaryDisclosure{font:13px/1.5 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#a9a08e;margin:8px 0}
 .aoScriptureContextCommentary a{display:inline-block;margin-top:14px;font:500 13px/1.5 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureCatenaPericope{border-top:1px solid rgba(205,182,135,.24);padding:14px 0 18px}
 .aoScriptureCatenaHeading{font:500 14px/1.5 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#dbcca9;margin:0 0 12px}
 .aoScriptureFather{border-bottom:1px solid rgba(205,182,135,.12);padding:8px 0}
 .aoScriptureLibrary .aoScriptureFather summary{color:#e6d5af;font:600 13px/1.5 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureFatherText{white-space:pre-wrap;font:17px/1.74 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:#e5e0d5;margin:9px 0 14px}
 .aoHomeScriptureLink{margin:12px 0}
 /* The contextual Bible reader is used on actual phones, often in church.
    Navigation, disclosure and source actions must have distinct touch territory. */
 .aoScriptureLibrary button,
 .aoScriptureLibrary select,
 .aoScriptureLibrary input{min-height:44px}
 .aoScriptureLibrary .aoScriptureActions button{min-height:44px}
 .aoScriptureLibrary .aoScriptureSegments button{min-height:44px}
 .aoScriptureLibrary :is(.aoScriptureBrowse,.aoScriptureSearch,.aoScriptureBookmarks,.aoScriptureRosary) > summary{
   display:flex;align-items:center;min-height:44px;box-sizing:border-box
 }
 .aoScriptureLibrary .aoScriptureFather summary{
   display:flex;align-items:center;min-height:44px
 }
 .aoScriptureLibrary .aoScriptureContextCommentary a{
   min-height:44px;align-items:center
 }
 /* Quiet, text-first edition chrome shared by Mass, Rosary, Formation and Atlas. */
 .aoScriptureHeader{gap:7px;align-items:center;position:sticky;top:0;z-index:3;background:#0e151d;padding:7px 0;border-bottom:1px solid rgba(205,182,135,.14)}
 .aoScriptureHeader h2{font:600 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);letter-spacing:.12em;text-transform:uppercase;color:#bbae96;margin:0 auto 0 0}
 .aoScriptureLibrary .aoScriptureEditionFlip{flex:0 1 auto;min-width:116px;min-height:44px;border:0;border-radius:6px;background:transparent;font:600 13px/1.2 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#dbc79d;padding:9px 6px;white-space:nowrap}
 .aoScriptureLibrary [data-scripture-close]{width:44px;height:44px;flex:0 0 44px;border:0;border-radius:50%;padding:0;background:transparent;color:#d6cbb6;font:300 30px/1 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureContextBar{padding:4px 0 0;margin:0}
 .aoScriptureContextTitle{margin:0 0 6px;font:500 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#b6a990}
 .aoScriptureContextControls{display:flex;gap:5px;padding:2px 0;border-bottom:1px solid rgba(205,182,135,.16)}
 .aoScriptureLibrary .aoScriptureContextControls button{flex:1;min-height:44px;border:0;border-bottom:1px solid transparent;border-radius:0;background:transparent;padding:10px 4px;font:500 13px/1.25 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#b5ad9d}
 .aoScriptureLibrary .aoScriptureContextControls button[aria-pressed="true"]{border:0;border-bottom:2px solid #b49b70;background:transparent;color:#eddec4}
 .aoScriptureReading{margin:0 0 7px;padding:8px 0 11px}
 .aoScriptureReading h3{font:400 clamp(21px,3.4vw,26px)/1.4 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);margin:6px 0 12px}
 .aoScriptureWitnessDetails{margin:9px 0 0;color:#a9a18e;border:0}
 .aoScriptureLibrary .aoScriptureWitnessDetails>summary{min-height:44px;display:flex;align-items:center;font:500 13px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:#b5aa94;cursor:pointer}
 .aoScriptureWitnessDetails p{margin:3px 0 8px}
 .aoScriptureLibrary .aoScriptureReferenceWarning>summary{min-height:44px;display:flex;align-items:center;color:#bdb196;font:500 13px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureLibrary .aoScriptureReferenceWarning>p{margin:0 0 10px}
 .aoScriptureActions{margin:7px 0 3px;padding-top:7px;gap:4px}
 .aoScriptureLibrary .aoScriptureActions button{min-height:44px;border:0;border-radius:6px;background:transparent;color:#c8b99c;padding:7px 9px;text-decoration:underline;text-decoration-color:rgba(197,168,119,.34);text-underline-offset:3px}
 .aoScriptureTools{border-top:1px solid rgba(205,182,135,.18);margin:12px 0 0;padding:0}
 .aoScriptureLibrary .aoScriptureTools>summary{min-height:48px;display:flex;align-items:center;padding:12px 2px;color:#d8c7a7;font:500 13px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif);cursor:pointer}
 .aoScriptureToolsBody{padding:2px 0 12px}
 .aoScriptureToolsBody>details{padding:3px 0;border-bottom:1px solid rgba(205,182,135,.12)}
 .aoScriptureBrowse,.aoScriptureSearch,.aoScriptureBookmarks,.aoScriptureRosary{padding:4px 0}
 .aoScriptureLibrary :is(.aoScriptureBrowse,.aoScriptureSearch,.aoScriptureBookmarks,.aoScriptureRosary)>summary{min-height:44px;padding:8px 0}
 @media(max-width:700px){.aoScriptureNav{grid-template-columns:repeat(2,minmax(0,1fr))}.aoScriptureLibrary{padding:16px;border:0;border-radius:0}.aoScriptureText{font-size:19px}.aoScriptureContextControls{gap:3px}#ao-scripture-overlay{padding:0 0 max(16px,env(safe-area-inset-bottom))}.aoScriptureHeader{position:sticky;top:0;z-index:2;background:#0e151d;padding-top:max(10px,env(safe-area-inset-top))}}
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
 .aoScriptureContextCapsule{display:inline-flex;vertical-align:middle;align-items:center;justify-content:center;min-height:30px;margin:4px 3px;padding:5px 11px;border-radius:999px;border:1px solid var(--liturgical-border,rgba(201,172,111,.48));background:var(--liturgical-soft,rgba(201,172,111,.055));color:var(--liturgical,#ceb680);font:600 max(12px,.75rem)/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif);letter-spacing:.005em;cursor:pointer}
 .aoScriptureContextCapsule:focus-visible{outline:2px solid var(--liturgical,#ceb680);outline-offset:3px}
 .aoP435930ScriptureOrigin{display:flex;flex-wrap:wrap;align-items:center;gap:5px 10px;margin:9px 0 13px}
 .aoP435930ScriptureOrigin small{color:var(--muted,rgba(228,223,213,.70));font:500 max(12px,.75rem)/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif);max-width:38rem}
 .aoMassScriptureStudy{display:grid;gap:3px;margin:8px 0 0;padding-top:8px;border-top:1px solid rgba(206,182,128,.2)}
 .aoMassScriptureStudy[hidden],.aoMassScriptureStudy [hidden]{display:none!important}
 .aoMassScriptureStudyStatus{display:block;padding:3px 7px;color:#c9c3b5;font:500 13px/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 .aoScriptureContextError{display:inline-block;margin:6px;color:var(--ao-text-primary,#ece6d6);font:13px/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
 @media(prefers-reduced-motion:reduce){.aoScriptureContextCapsule{transition:none!important}}
 `;
 (doc.head||doc.documentElement).append(css);return true;
}
