// Scoped to the pre-Mass panel. LIVE reader remains unchanged.
if(typeof document!=="undefined"&&!document.getElementById("ao-local-oration-styles")){
 const style=document.createElement("style");style.id="ao-local-oration-styles";
 style.textContent=[
 "#ao-mass-flow-v1 .aoObservedLocalOrations{margin:12px 0 8px;min-width:0;border-top:1px solid var(--liturgical-border,rgba(202,180,144,.25));font:inherit}",
 "#ao-mass-flow-v1 .aoObservedLocalOrations[hidden]{display:none!important}",
 "#ao-mass-flow-v1 .aoObservedLocalOrations summary{cursor:pointer;min-height:44px;padding:12px 0;color:var(--liturgical,#d4b98b);font:600 .84rem/1.45 system-ui,sans-serif}",
 "#ao-mass-flow-v1 .aoObservedLocalOrations p{margin:4px 0 11px;color:var(--muted,#b6b2aa);font:.77rem/1.5 system-ui,sans-serif}",
 "#ao-mass-flow-v1 [data-local-oration-groups]{display:grid;gap:2px;margin:7px 0}",
 "#ao-mass-flow-v1 .aoLocalOrationChoice,#ao-mass-flow-v1 .aoLocalOrationConfirm{display:flex;align-items:center;gap:11px;min-height:44px;padding:8px 3px;color:var(--text,#ece4d5);font:.82rem/1.4 system-ui,sans-serif}",
 "#ao-mass-flow-v1 .aoLocalOrationChoice input,#ao-mass-flow-v1 .aoLocalOrationConfirm input{width:20px;height:20px;flex:none;margin:0;accent-color:var(--liturgical,#d4b98b)}",
 "#ao-mass-flow-v1 .aoLocalOrationConfirm{border-top:1px solid var(--liturgical-border,rgba(202,180,144,.25));padding-top:12px;margin-top:8px}",
 "#ao-mass-flow-v1 .aoLocalOrationConfirm:has(input:disabled){opacity:.52}",
 "#ao-mass-flow-v1 .aoObservedLocalOrations [data-local-oration-feedback]{margin:8px 0 10px}",
 ].join("\n");
 document.head.append(style);
}
