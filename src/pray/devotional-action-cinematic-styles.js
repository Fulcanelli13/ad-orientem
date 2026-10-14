// Native Ad Orientem dark devotional cinematic. No synthetic priest motion,
// miracles, gamification, flashing or repeated artwork.
// Portal to document.body: sheet-local absolute layers cannot cover the global
// bottom ribbon or the independently stacked semantic/priest rails.
export const DEVOTIONAL_ACTION_CINEMATIC_CSS=String.raw`
#aoPray435930 .aoP435930Sheet{position:relative}
body.aoP435930Open > .aoDevotionalActionCinematic{
  position:fixed;inset:0;z-index:2147483640;display:grid;place-items:safe center;
  min-height:100dvh;overflow:auto;overscroll-behavior:contain;isolation:isolate;
  background:radial-gradient(ellipse 74% 54% at 50% 42%,#17202b 0%,#0a1018 54%,#080c12 100%);
  color:#f0e9db;padding:max(30px,env(safe-area-inset-top)) 18px max(24px,env(safe-area-inset-bottom));
  animation:aoDevotionalActionEnter .66s ease-out both
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionInner{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:clamp(12px,2.1dvh,22px);width:min(100%,510px);max-width:100%;text-align:center
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionKicker{
  font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.20em;
  color:#ae9c7e;text-transform:uppercase
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionIcon{
  display:block;width:clamp(134px,34vw,225px);height:clamp(134px,34vw,225px);
  flex:none;mask-position:center;mask-repeat:no-repeat;mask-size:contain;
  -webkit-mask-position:center;-webkit-mask-repeat:no-repeat;-webkit-mask-size:contain;
  background:#e0d0ac;filter:drop-shadow(0 0 13px rgba(207,186,142,.16));
  animation:aoDevotionalActionSettle .92s cubic-bezier(.22,.76,.2,1) both
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionIcon[hidden]{display:none}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionLatin{
  font:italic 500 clamp(25px,6vw,39px)/1.24 var(--font-liturgical,Georgia,serif);
  color:#f4ecdd;letter-spacing:.012em;margin:0;text-wrap:balance
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionTitle{
  font:400 clamp(23px,5.3vw,33px)/1.3 var(--font-display,Georgia,serif);
  color:#e5d7ba;margin:0;text-wrap:balance
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionContinue{
  margin:18px 0 0;min-width:175px;min-height:49px;padding:11px 22px;
  border-radius:999px;border:1px solid rgba(208,187,147,.35);
  color:#eee6d6;background:rgba(208,187,147,.09);
  font:500 14px/1.2 system-ui,sans-serif;cursor:pointer
}
body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionContinue:focus-visible{
  outline:2px solid #d8c49d;outline-offset:4px
}
@keyframes aoDevotionalActionEnter{from{opacity:0}to{opacity:1}}
@keyframes aoDevotionalActionSettle{
 from{opacity:.62;transform:translateY(14px) scale(.93)}
 to{opacity:1;transform:none}
}
@media(prefers-reduced-motion:reduce){
 body.aoP435930Open > .aoDevotionalActionCinematic,
 body.aoP435930Open > .aoDevotionalActionCinematic .aoDevotionalActionIcon{animation:none!important;transition:none!important}
}
`;
function ensure(doc=globalThis.document){
  if(!doc||doc.getElementById("ao-devotional-action-cinematic-style"))return;
  const el=doc.createElement("style");
  el.id="ao-devotional-action-cinematic-style";
  el.textContent=DEVOTIONAL_ACTION_CINEMATIC_CSS;
  (doc.head||doc.documentElement).append(el);
}
if(typeof document!=="undefined")ensure(document);
