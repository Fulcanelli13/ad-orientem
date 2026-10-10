// Scoped to the old pre-Mass backdrop; the native R17 reader is unaffected.
if(typeof document!=="undefined"&&!document.getElementById("ao-full-mass-preflight-styles")){
  const el=document.createElement("style");el.id="ao-full-mass-preflight-styles";
  el.textContent=[
  "#ao-mass-flow-v1 .aoFullMassPreflight{padding:15px 14px;margin:14px 0;border:1px solid var(--liturgical-border,rgba(202,180,144,.27));border-radius:12px;background:var(--liturgical-soft,rgba(211,188,143,.045));color:var(--text,#ece4d5);font:inherit;min-width:0}",
  "#ao-mass-flow-v1 .aoFullMassPreflight h3{font:500 clamp(1.04rem,2.5vw,1.3rem)/1.3 Georgia,serif;margin:0 0 12px;color:var(--paper,#eadcc8)}",
  "#ao-mass-flow-v1 .aoFullMassPreflight [data-full-mass-celebration]{font-weight:600;font-size:.9rem;margin:0 0 8px;color:var(--liturgical,#d4b98b);overflow-wrap:anywhere}",
  "#ao-mass-flow-v1 .aoFullMassPreflight [data-full-mass-resolver],#ao-mass-flow-v1 .aoFullMassPreflight [data-full-mass-note]{font-size:.76rem;line-height:1.5;color:var(--muted,#aaa69d);margin:9px 0 14px}",
  "#ao-mass-flow-v1 .aoFullMassCategories{display:flex;gap:5px;flex-wrap:wrap;margin:12px 0}",
  "#ao-mass-flow-v1 .aoFullMassCategories button{min-height:44px;flex:1 1 auto;white-space:nowrap;padding:8px 10px;border:1px solid rgba(207,184,145,.28);border-radius:8px;color:var(--text,#ece4d5);background:transparent;font:500 .78rem/1.25 system-ui,sans-serif}",
  "#ao-mass-flow-v1 .aoFullMassCategories button[aria-current=true]{background:rgba(207,184,145,.12);border-color:rgba(207,184,145,.6);color:var(--liturgical,#d4b98b)}",
  "#ao-mass-flow-v1 [data-full-mass-category-error]{color:#efafa5;font-size:.78rem;line-height:1.45;margin:8px 0}",
  "#ao-mass-flow-v1 .aoFullMassPreflight fieldset{border:0;padding:0;margin:12px 0 0;min-width:0}",
  "#ao-mass-flow-v1 .aoFullMassPreflight legend{font-size:.84rem;font-weight:600;margin-bottom:9px;padding:0}",
  "#ao-mass-flow-v1 .aoFullMassForms{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}",
  "#ao-mass-flow-v1 .aoFullMassChoice{min-height:49px;display:flex;align-items:center;gap:9px;padding:9px;border:1px solid rgba(207,184,145,.25);border-radius:9px;background:rgba(7,11,17,.24);color:inherit;font-size:.82rem;line-height:1.3;cursor:pointer;min-width:0;overflow-wrap:anywhere}",
  "#ao-mass-flow-v1 .aoFullMassChoice:has(input:checked){border-color:rgba(211,182,133,.8);background:rgba(211,182,133,.1)}",
  "#ao-mass-flow-v1 .aoFullMassChoice input{flex:0 0 auto;width:19px;height:19px;accent-color:var(--liturgical,#c7ac80);margin:0}",
  "#ao-mass-flow-v1 .aoFullMassChoice:focus-within{outline:2px solid var(--liturgical,#d2b28d);outline-offset:2px}",
  "#ao-mass-flow-v1 .aoFullMassChoice:has(input:disabled){opacity:.42;cursor:not-allowed}",
  "@media(max-width:370px){#ao-mass-flow-v1 .aoFullMassForms{grid-template-columns:1fr}}",
  ].join("\n");
  document.head.appendChild(el);
}
