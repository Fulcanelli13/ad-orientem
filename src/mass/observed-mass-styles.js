// Source picker follows the dark liturgical surface without turning the
// Mass preparation screen into a second Calendar dashboard.
if(typeof document!=="undefined"&&!document.getElementById("ao-observed-mass-styles")){
 const style=document.createElement("style");
 style.id="ao-observed-mass-styles";
 style.textContent=[
  "#ao-mass-flow-v1 .aoObservedMassPicker{padding:10px 0;max-width:100%;color:var(--text,#ebe5d8)}",
  "#ao-mass-flow-v1 .aoObservedMassPicker>details{border:1px solid rgba(201,174,128,.27);border-radius:12px;background:rgba(8,12,18,.26);padding:10px 12px}",
  "#ao-mass-flow-v1 .aoObservedMassPicker summary{min-height:44px;display:list-item;cursor:pointer;font:500 15px/1.5 Georgia,serif;color:#e8dcc7;padding:9px 0}",
  "#ao-mass-flow-v1 .aoObservedMassPicker p{font:400 12px/1.55 system-ui,sans-serif;color:var(--muted,#b9b4ad);margin:8px 0 12px}",
  "#ao-mass-flow-v1 .aoObservedMassRow{display:flex;align-items:end;flex-wrap:wrap;gap:9px;margin:9px 0}",
  "#ao-mass-flow-v1 .aoObservedMassRow label{display:grid;gap:5px;flex:1;min-width:160px;font:500 11px/1.4 system-ui,sans-serif;color:#d1cabf}",
  "#ao-mass-flow-v1 .aoObservedMassPicker input,#ao-mass-flow-v1 .aoObservedMassPicker select{color:var(--text,#eae5dc);background:rgba(8,12,18,.88);border:1px solid rgba(201,174,128,.38);border-radius:7px;min-height:44px;padding:10px;max-width:100%;font:400 14px/1.4 system-ui,sans-serif}",
  "#ao-mass-flow-v1 .aoObservedMassPicker button{min-height:44px;max-width:100%;font:500 12px/1.45 system-ui,sans-serif;border-radius:8px;border:1px solid rgba(201,174,128,.4);padding:9px 12px;color:#ebe3d4;background:rgba(201,174,128,.09);cursor:pointer}",
  "#ao-mass-flow-v1 .aoObservedMassPicker button:disabled{opacity:.4;cursor:default}",
  "#ao-mass-flow-v1 .aoObservedMassPicker [data-observed-candidate]{color:#e5cfa2;font:500 13px/1.5 Georgia,serif;padding:10px 0;overflow-wrap:anywhere}",
  "#ao-mass-flow-v1 .aoObservedMassPicker [data-observed-sunday-label]{display:grid;gap:7px;margin:12px 0;font:500 12px/1.5 system-ui,sans-serif;color:#eee2cd}",
  "#ao-mass-flow-v1 .aoObservedMassPicker [hidden]{display:none!important}",
  "#ao-mass-flow-v1 .aoObservedMassPicker [data-observed-source-note]{border-top:1px solid rgba(201,174,128,.18);padding-top:10px;font-size:11px}",
  "#ao-mass-flow-v1 .aoObservedMassPicker[data-ao-observed-source-selected='true']>details{border-color:rgba(201,174,128,.55)}",
  "@media(max-width:400px){#ao-mass-flow-v1 .aoObservedMassPicker>details{padding:8px 10px}#ao-mass-flow-v1 .aoObservedMassPicker button{flex:1 1 auto}}",
 ].join("\n");
 document.head.append(style);
}
