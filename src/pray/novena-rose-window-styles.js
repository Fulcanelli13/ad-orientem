/** Rose Window: optional display on Holy Ghost novena detail; never alters source-owned reader. */
export const NOVENA_ROSE_WINDOW_CSS=String.raw`
#aoPray435930 .aoN1RoseWindow{padding:16px 8px 9px;margin:14px 0 12px;text-align:center;background:radial-gradient(ellipse at 50% 45%,rgba(96,55,39,.32),transparent 67%);border-top:1px solid rgba(193,151,91,.23);border-bottom:1px solid rgba(193,151,91,.18)}
#aoPray435930 .aoN1RoseKicker{display:block;font:600 10px/1.3 system-ui,sans-serif;letter-spacing:.18em;color:#bc9865}
#aoPray435930 .aoN1RoseSvg{width:min(100%,330px);height:auto;display:block;margin:6px auto;overflow:visible;filter:drop-shadow(0 10px 24px #0008)}
#aoPray435930 .aoN1RoseRotor{transform-origin:170px 170px;transform:rotate(var(--ao-n1-rose-rotation));transition:transform .62s cubic-bezier(.22,.77,.24,1)}
#aoPray435930 .aoN1RosePetal{cursor:pointer;outline:none}
#aoPray435930 .aoN1RosePetal .aoN1RoseGlass{transition:filter .28s,opacity .28s;filter:brightness(.73) saturate(.86)}
#aoPray435930 .aoN1RosePetal[aria-pressed="true"] .aoN1RoseGlass{filter:brightness(1.42) saturate(1.26)}
#aoPray435930 .aoN1RoseLead{fill:none;stroke:#171018;stroke-width:4}
#aoPray435930 .aoN1RosePetal[aria-pressed="true"] .aoN1RoseLead{stroke:#f0ce84;stroke-width:2.8}
#aoPray435930 .aoN1RosePetal:focus-visible .aoN1RoseLead{stroke:#fff6c8;stroke-width:5}
#aoPray435930 .aoN1RoseNumber{fill:#fff1d6;font:700 17px Georgia,serif;paint-order:stroke;stroke:#18131a;stroke-width:3px;pointer-events:none;text-anchor:middle;dominant-baseline:central;transform-box:fill-box;transform-origin:center;transform:rotate(var(--ao-n1-rose-counter));}
#aoPray435930 .aoN1RoseCaption{display:grid;justify-items:center;gap:4px;margin:4px 0;color:#d8bd85}
#aoPray435930 .aoN1RoseCaption span{font:600 11px/1.4 system-ui,sans-serif;letter-spacing:.11em;text-transform:uppercase}
#aoPray435930 .aoN1RoseCaption strong{font:500 1.35rem/1.1 Georgia,serif;color:#ebd9bb}
#aoPray435930 .aoN1RoseHint{font:italic 14px/1.4 Georgia,serif;color:#b7a38b;margin:9px auto 3px;max-width:315px}
#aoPray435930 .aoN1RoseQuickDays{border:0;padding:0 4px 12px;margin:0}
#aoPray435930 .aoN1RoseQuickDays>summary{cursor:pointer;font:500 13px/1.4 system-ui;color:#c7ac83;padding:8px}
@media(max-width:360px){#aoPray435930 .aoN1RoseSvg{width:min(100%,295px)}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoN1RoseRotor,#aoPray435930 .aoN1RoseGlass{transition:none!important}}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-novena-rose-window-v1")){
 const el=document.createElement("style");el.id="ao-novena-rose-window-v1";el.textContent=NOVENA_ROSE_WINDOW_CSS;(document.head||document.documentElement).append(el);
}
