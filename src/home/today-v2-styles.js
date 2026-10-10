export const TODAY_V2_CSS=`
.homeScreen.td2{
 --td-bg:var(--ao-bg-canvas,#080c12);
 --td-card:var(--ao-surface-1,#101821);
 --td-surface:var(--ao-surface-2,#0c141c);
 --td-text:var(--ao-text-primary,#e9e9e7);
 --td-muted:var(--ao-text-muted,#a9afb7);
 --td-rule:var(--ao-rule,rgba(225,230,233,.13));
 --td-accent:var(--ao-liturgical-accent,#929ba8);
 --td-accent-text:var(--ao-liturgical-accent-text,var(--ao-liturgical-accent,#d6dbe0));
 width:min(760px,100%);margin:auto;padding:0 0 95px;overflow:hidden;
 background:var(--td-bg);color:var(--td-text);font-family:var(--ao-font-body,Georgia,serif)
}
.td2 *{box-sizing:border-box}.td2 button{cursor:pointer;touch-action:manipulation}
.td2 button:focus-visible,.td2 summary:focus-visible{outline:2px solid var(--td-accent-text);outline-offset:2px}
.td2 .td2-top{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;min-height:56px;padding:3px 12px;border-bottom:1px solid var(--td-rule)}
.td2 .td2-top>span{text-align:center;font:400 19px/1.2 var(--ao-font-display,Georgia,serif);letter-spacing:.045em}
.td2 .td2-top button{width:44px;height:44px;border:0;background:transparent;color:var(--td-accent-text);font-size:23px}
.td2 .td2-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--td-rule);padding:0 10px}
.td2 .td2-tabs button{border:0;border-bottom:2px solid transparent;background:transparent;color:var(--td-muted);min-height:47px;padding:9px 2px;font:700 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.06em}
.td2 .td2-tabs button[aria-current=page]{color:var(--td-text);border-bottom-color:var(--td-accent)}
.td2 .td2-date{min-height:50px;display:grid;place-items:center;text-align:center;padding:7px 12px;color:var(--td-text);font:600 13px/1.4 var(--ao-font-ui,system-ui,sans-serif);border-bottom:1px solid var(--td-rule)}
.td2 .td2-hero{background:var(--td-card);border-bottom:1px solid var(--td-rule)}
.td2 .td2-art{height:clamp(245px,58vw,380px);position:relative;overflow:hidden;background:radial-gradient(ellipse at 50% 40%,color-mix(in srgb,var(--td-accent) 13%,#080c12),var(--td-bg) 73%)}
.td2 .td2-source-art{position:absolute;inset:0;overflow:hidden}
.td2 .td2-source-art img{display:block!important;width:100%!important;height:100%!important;max-width:none!important;max-height:none!important;object-fit:cover!important;object-position:center 33%}
.td2 .td2-source-art :is(figcaption,p,h2,h3){display:none}
.td2 .td2-art-empty{position:absolute;inset:0;display:grid;place-items:center;font:normal clamp(130px,33vw,235px) var(--ao-font-display,Georgia,serif);color:var(--td-accent);opacity:.26}
.td2 .td2-art-scrim{position:absolute;inset:0;background:linear-gradient(180deg,rgba(8,12,18,.15),transparent 33%,rgba(8,12,18,.23) 57%,rgba(8,12,18,.96));pointer-events:none}
.td2 .td2-art-kicker{position:absolute;top:18px;left:18px;right:18px;color:#f1f1ef;font:700 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;text-shadow:0 2px 9px #000}
.td2 .td2-art-heading{position:absolute;bottom:17px;left:14px;right:14px;text-align:center;pointer-events:none}
.td2 .td2-art-heading h1{margin:0 auto;max-width:520px;font:400 clamp(30px,5vw,41px)/1.05 var(--ao-font-display,Georgia,serif);color:#f6f4f0;text-shadow:0 2px 13px #000;overflow-wrap:anywhere}
.td2 .td2-hero-actions{text-align:center;padding:16px 18px 17px;background:var(--td-bg)}
.td2 .td2-meta{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:7px 13px;font:500 13px/1.3 var(--ao-font-body,Georgia,serif);color:var(--td-muted)}
.td2 .td2-meta span{display:inline-flex;align-items:center;gap:6px}
.td2 .td2-colour-dot{height:10px;width:10px;background:var(--td-accent);border-radius:50%;box-shadow:0 0 0 2px var(--td-rule)}
.td2 .td2-small{font:500 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:var(--td-muted);margin:7px 0 0}
.td2 .td2-primary{width:100%;min-height:56px;display:flex;gap:14px;align-items:center;justify-content:center;color:var(--td-text);border:1px solid var(--td-accent);border-radius:10px;box-shadow:inset 3px 0 var(--td-accent);background:var(--td-card);font:700 14px var(--ao-font-ui,system-ui,sans-serif);margin-top:15px;padding:12px}
.td2 .td2-primary span{font-size:21px;color:var(--td-accent-text)}.td2 .td2-primary:hover{background:color-mix(in srgb,var(--td-accent) 9%,var(--td-card))}
.td2 .td2-mass-utilities{display:flex;justify-content:center;gap:25px;margin-top:6px}
.td2 .td2-mass-utilities button{min-height:44px;padding:6px 0;color:var(--td-accent-text);background:transparent;border:0;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}
.td2 .td2-context{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);border-bottom:1px solid var(--td-rule);background:var(--td-card)}
.td2 .td2-context button{display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:6px;text-align:left;width:100%;min-height:84px;padding:12px 17px;background:transparent;border:0;color:var(--td-text)}
.td2 .td2-context button+button{border-left:1px solid var(--td-rule)}
.td2 .td2-context small,.td2 .td2-section-head small,.td2 .td2-feature small{font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase;color:var(--td-muted)}
.td2 .td2-context strong{font:400 17px/1.15 var(--ao-font-display,Georgia,serif)}
.td2 .td2-context span{font:500 11px var(--ao-font-ui,system-ui,sans-serif);color:var(--td-muted)}
.td2 .td2-body{padding:0 19px 40px}
.td2 .td2-zone{padding:23px 0;border-bottom:1px solid var(--td-rule)}
.td2 .td2-section-head{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;margin-bottom:14px}
.td2 .td2-section-head h2{margin:5px 0 0;font:400 27px/1.08 var(--ao-font-display,Georgia,serif)}
.td2 .td2-textlink{color:var(--td-accent-text);background:transparent;border:0;padding:8px 0;min-height:44px;font:650 12px var(--ao-font-ui,system-ui,sans-serif);white-space:nowrap}
.td2 .td2-feature{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;padding:14px;background:var(--td-card);border:1px solid var(--td-rule);border-radius:10px}
.td2 .td2-feature strong{display:block;font:400 20px/1.2 var(--ao-font-display,Georgia,serif);margin:5px 0}
.td2 .td2-feature span{display:block;font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--td-muted)}
.td2 .td2-feature button{min-height:44px;padding:8px 14px;background:var(--td-surface);color:var(--td-text);border:1px solid var(--td-accent);border-radius:8px;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}
.td2 .td2-shortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:10px}
.td2 .td2-shortcuts button{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;min-height:70px;border:1px solid var(--td-rule);border-radius:9px;background:var(--td-surface);color:var(--td-text);font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.td2 .td2-shortcuts span{font-size:19px;color:var(--td-accent-text)}
.td2 .td2-row{display:flex;justify-content:space-between;align-items:center;text-align:left;gap:14px;width:100%;min-height:72px;padding:13px 0;border:0;border-bottom:1px solid var(--td-rule);background:transparent;color:var(--td-text)}
.td2 .td2-row strong{font:400 19px/1.15 var(--ao-font-display,Georgia,serif)}
.td2 .td2-row small{display:block;color:var(--td-muted);margin-top:5px;font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.td2 .td2-arrow{font:400 23px Georgia,serif;color:var(--td-accent-text)}
.td2 .td2-upcoming{display:grid}
.td2 .td2-upcoming button{width:100%;min-height:71px;display:grid;grid-template-columns:55px minmax(0,1fr) 14px;gap:11px;align-items:center;text-align:left;border:0;border-bottom:1px solid var(--td-rule);background:transparent;color:var(--td-text);padding:10px 0}
.td2 .td2-upcoming strong{display:block;font:400 18px/1.18 var(--ao-font-display,Georgia,serif)}
.td2 .td2-upcoming small{display:block;color:var(--td-muted);font:500 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);margin-top:3px}
.td2 .td2-daynum{font:400 20px/1.1 var(--ao-font-display,Georgia,serif);text-align:center}
.td2 .td2-daynum small{text-transform:uppercase;font-weight:700}
.td2 .td2-art-provenance{padding:10px 0;font:500 12px var(--ao-font-ui,system-ui,sans-serif);color:var(--td-muted);border-bottom:1px solid var(--td-rule)}
.td2 .td2-art-provenance summary{display:flex;align-items:center;min-height:44px;cursor:pointer}
.td2 .td2-art-provenance img{max-height:150px;max-width:100%}
.td2 .td2-warnings{padding:0 15px}.td2 .td2-warnings .statusCard{margin:10px 0}
.td2 .td2-explore{margin-top:13px}
@media(min-width:760px){.td2 .td2-art{height:410px}.td2 .td2-body{padding-inline:26px}}
@media(max-width:390px){.td2 .td2-art{height:247px}.td2 .td2-art-heading h1{font-size:30px}.td2 .td2-context button{padding:11px 12px}.td2 .td2-body{padding-inline:15px}.td2 .td2-feature{padding:11px}.td2 .td2-shortcuts button{font-size:11px}}
@media(prefers-reduced-motion:reduce){.td2 *{scroll-behavior:auto!important;transition:none!important}}
`;