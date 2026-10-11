// The source-owned ceremonial stage is deliberately smaller than the two
// persistent ribbons. It never covers the faithful/priest rail controls.
if(typeof document!=="undefined"&&!document.getElementById("ao-reader-ceremony-stage-styles")){
 const el=document.createElement("style");
 el.id="ao-reader-ceremony-stage-styles";
 el.textContent=[
  ".ao-reader-stage>.ao-reader-ceremony-stage{position:absolute;z-index:7;top:5px;left:50%;transform:translateX(-50%);width:max-content;max-width:min(74vw,470px);min-height:26px;padding:5px 12px;box-sizing:border-box;display:flex;align-items:center;justify-content:center;gap:7px;flex-wrap:wrap;text-align:center;pointer-events:none;border:1px solid color-mix(in srgb,var(--ao-mass-accent,#c8ac7c) 34%,transparent);border-radius:8px;background:rgba(9,13,19,.91);box-shadow:0 5px 14px rgba(0,0,0,.15);color:#e6e2d7;font-family:var(--ao-font-ui,system-ui,sans-serif)}",
  ".ao-reader-stage>.ao-reader-ceremony-stage[hidden]{display:none!important}",
  ".ao-reader-ceremony-name{font-size:10px;letter-spacing:.12em;line-height:1.4;font-weight:650;text-transform:uppercase;color:var(--ao-mass-accent,#d1b488)}",
  ".ao-reader-ceremony-detail{font-size:10px;line-height:1.4;color:#c8c6bf;max-width:100%;overflow-wrap:anywhere}",
  ".ao-reader-ceremony-detail[hidden]{display:none}",
  ".ao-reader-stage>.ao-reader-ceremony-stage[data-rite='REQUIEM'],.ao-reader-stage>.ao-reader-ceremony-stage[data-rite='REQUIEM_ABSOLUTION']{border-color:rgba(199,190,168,.28);background:rgba(8,10,13,.94)}",
  ".ao-reader-stage>.ao-reader-ceremony-stage[data-rite='REQUIEM'] .ao-reader-ceremony-name,.ao-reader-stage>.ao-reader-ceremony-stage[data-rite='REQUIEM_ABSOLUTION'] .ao-reader-ceremony-name{color:#d8d1c2}",
  ".ao-reader-stage>.ao-reader-ceremony-stage[data-exact-focus='PASSION_DEATH']{border-color:rgba(224,214,190,.55);background:rgba(3,5,9,.98);box-shadow:0 0 0 3px rgba(0,0,0,.2),0 12px 24px rgba(0,0,0,.36)}",
  ".ao-reader-stage>.ao-reader-ceremony-stage>span{animation:aoSourceStageArrival .28s ease-out both}",
  "@keyframes aoSourceStageArrival{from{opacity:.5;transform:translateY(3px)}to{opacity:1;transform:translateY(0)}}",
  "@media(max-width:480px){.ao-reader-stage>.ao-reader-ceremony-stage{top:2px;max-width:calc(100% - 106px);padding:4px 6px;gap:4px;min-height:23px}.ao-reader-ceremony-name{font-size:8px;letter-spacing:.08em}.ao-reader-ceremony-detail{font-size:8px}}",
  "@media(prefers-reduced-motion:reduce){.ao-reader-stage>.ao-reader-ceremony-stage>span{animation:none!important}}"
 ].join("\n");
 document.head.appendChild(el);
}
