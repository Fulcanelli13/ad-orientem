/* Scoped presentation, not a new Calendar layout. */
const STYLE_ID="ao-my-customs-prayers-style";
export function installMyCustomsStyle(doc){
 if(doc.getElementById(STYLE_ID))return;
 const el=doc.createElement("style");el.id=STYLE_ID;
 el.textContent=[
 "#ao-my-customs-prayers{position:fixed;inset:0;z-index:24000;width:100%;height:100%;max-width:none;max-height:none;margin:0;padding:0;border:0;box-sizing:border-box;overflow-y:auto;background:#080c12;color:#e7dfd2;font-family:Georgia,'EB Garamond',serif}",
 "#ao-my-customs-prayers::backdrop{background:rgba(0,0,0,.8)}",
 "#ao-my-customs-prayers *{box-sizing:border-box}",
 "#ao-my-customs-prayers .myc-wrap{max-width:760px;margin:auto;padding:22px 22px 75px}",
 "#ao-my-customs-prayers .myc-top{display:flex;justify-content:space-between;gap:15px;align-items:start;border-bottom:1px solid #504331;padding-bottom:18px}",
 "#ao-my-customs-prayers h1{font-size:clamp(25px,4vw,36px);font-weight:400;margin:5px 0}",
 "#ao-my-customs-prayers h2{font-size:22px;font-weight:400;margin:23px 0 12px;color:#e9dac0}",
 "#ao-my-customs-prayers h3{font-size:19px;font-weight:400;margin:5px 0}",
 "#ao-my-customs-prayers p{font-size:14px;line-height:1.55;color:#c4bbae;overflow-wrap:anywhere}",
 "#ao-my-customs-prayers .myc-eyebrow{color:#cbb48c;font-size:11px;letter-spacing:.12em;text-transform:uppercase}",
 "#ao-my-customs-prayers .myc-info{border-left:2px solid #746244;padding-left:11px;margin:17px 0;font-size:12px;color:#aea496}",
 "#ao-my-customs-prayers .myc-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px}",
 "#ao-my-customs-prayers label{display:flex;flex-direction:column;gap:7px;font-size:13px;color:#d2c29e}",
 "#ao-my-customs-prayers label.myc-wide{grid-column:1/-1}",
 "#ao-my-customs-prayers input,#ao-my-customs-prayers select,#ao-my-customs-prayers textarea{width:100%;padding:10px;background:#151c24;border:1px solid #5b574d;border-radius:5px;color:#eee7d7;font:inherit;font-size:15px;min-height:43px}",
 "#ao-my-customs-prayers textarea{resize:vertical;min-height:98px}",
 "#ao-my-customs-prayers .myc-actions{display:flex;gap:12px;margin:16px 0}",
 "#ao-my-customs-prayers button{font:inherit;cursor:pointer;min-height:43px;padding:9px 13px;border:1px solid #6b5c45;border-radius:5px;background:#17202a;color:#e4d5be}",
 "#ao-my-customs-prayers button.myc-save{color:#151a1f;background:#dcc89e;border-color:#dcc89e}",
 "#ao-my-customs-prayers button:focus-visible,#ao-my-customs-prayers input:focus-visible,#ao-my-customs-prayers select:focus-visible,#ao-my-customs-prayers textarea:focus-visible{outline:2px solid #d7be8d;outline-offset:2px}",
 "#ao-my-customs-prayers [hidden]{display:none!important}",
 "#ao-my-customs-prayers .myc-entry{border-top:1px solid #3e392f;padding:15px 0}",
 "#ao-my-customs-prayers .myc-entry small{color:#c5ad82}",
 "#ao-my-customs-prayers .myc-entry p{white-space:pre-wrap;margin:5px 0}",
 "#ao-my-customs-prayers .myc-entry button{background:transparent;border:0;text-decoration:underline;padding:6px 3px;margin-right:10px;color:#ddc49a;min-height:36px}",
 "#ao-my-customs-prayers .myc-entry a{color:#ddc49a;overflow-wrap:anywhere}",
 "#ao-my-customs-prayers .myc-error{color:#f0aaa5}",
 "@media(max-width:540px){#ao-my-customs-prayers .myc-grid{grid-template-columns:1fr}#ao-my-customs-prayers .myc-wrap{padding:14px 14px 60px}}"
 ].join("\n");
 doc.head.append(el);
}
