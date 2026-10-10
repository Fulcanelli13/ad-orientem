// Design layer for the map-first Sacred Geography landing view.
// Uses the host's sacred dark palette; independent of source content.
export const HERITAGE_STYLE = String.raw`
.aoHeritageSurface{isolation:isolate}
.aoHeritageSurface .aoFindHeader{border-bottom:0;background:#080c12;gap:8px;padding:11px 14px 8px}
.aoHeritageSurface .aoFindHeader h1{font:600 clamp(20px,4vw,26px)/1.1 var(--ao-font-display,Georgia,serif);letter-spacing:-.025em}
.aoHeritageSurface .aoFindHeader small{color:#99866c;letter-spacing:.14em}
.aoHeritageSurface .aoFindHeader button{background:#131a22;border-color:#383226}
.aoHeritageSurface .aoHeritageCount{border:1px solid rgba(201,174,117,.24);border-radius:99px;color:#d8c29a;background:#171d24;padding:8px 10px;font:650 12px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:0}
.aoHeritageSurface .aoHeritageCategories{gap:7px;padding:6px 12px 10px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.aoHeritageSurface .aoHeritageCategories::-webkit-scrollbar{display:none}
.aoHeritageSurface .aoHeritageCategories button{min-height:39px;padding:7px 13px;font-weight:600;border-color:rgba(217,197,154,.12);background:transparent}
.aoHeritageSurface .aoHeritageCategories button.active{background:#292820;border-color:#b9a271;color:#f4e5c8}
.aoHeritageSurface .aoHeritageTools{gap:7px;padding:0 12px 10px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{background:#141c26;border:1px solid #3d382c;padding:10px 14px 10px 36px;min-height:46px;border-radius:12px;font:400 15px/1.3 var(--ao-font-ui,system-ui,sans-serif);outline-offset:2px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch{position:relative}
.aoHeritageSurface .aoHeritageTools .aoFindSearch:before{content:"⌕";position:absolute;left:12px;top:7px;font:25px/1 var(--ao-font-body,Georgia,serif);color:#d3be94;pointer-events:none}
.aoHeritageSurface .aoHeritageTools input:focus-visible,.aoHeritageSurface button:focus-visible,.aoHeritageSurface summary:focus-visible,.aoHeritageSurface a:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}
.aoHeritageSurface .aoHeritageNearby{flex:none;min-height:46px;border:1px solid #3d382c;background:#17202a;border-radius:12px;padding:8px 10px;color:#ead8b9;white-space:nowrap;font:600 12px var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoHeritageSurface .aoHeritageNearby[aria-busy=true]{opacity:.6}
.aoHeritageSurface .aoHeritageMore summary{min-height:46px;border-radius:12px;background:#17202a;border-color:#3d382c}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{padding:0 8px 8px;min-height:240px}
.aoHeritageSurface .aoHeritageBody .aoFindMap{border:1px solid rgba(217,197,154,.16);border-radius:15px}
.aoHeritageMapHint{pointer-events:none;position:absolute;left:23px;bottom:25px;z-index:2;max-width:min(70%,280px);padding:8px 11px;border:1px solid rgba(217,197,154,.14);border-radius:99px;background:rgba(8,12,18,.86);backdrop-filter:blur(12px);font:500 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#e2d2b4;box-shadow:0 6px 18px #0005}
.aoHeritageSearchResults{position:absolute;z-index:3;bottom:20px;left:16px;width:min(390px,calc(100% - 32px));max-height:min(46dvh,380px);overflow-y:auto;overscroll-behavior:contain;border:1px solid rgba(217,197,154,.29);background:rgba(11,17,24,.97);backdrop-filter:blur(18px);border-radius:16px;box-shadow:0 16px 44px #000a;padding:8px;box-sizing:border-box}
.aoHeritageSearchCount{font:600 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#d3c09c;letter-spacing:.03em;padding:7px 9px 9px}
.aoHeritageSearchResults button{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;min-height:48px;text-align:left;color:#eee4d1;background:none;border:0;border-top:1px solid rgba(217,197,154,.12);padding:9px;cursor:pointer}
.aoHeritageSearchResults button:active{background:#242b33}
.aoHeritageSearchResults button>span:first-child{min-width:0}
.aoHeritageSearchResults strong{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 14px/1.3 var(--ao-font-display,Georgia,serif)}
.aoHeritageSearchResults small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:3px;color:#a99e8a;font:11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSearchResults button>span:last-child{flex:none;color:#cfbb93;font-size:17px}
.aoHeritageSearchFoot{display:block;padding:8px;color:#a99e8a;font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageLocationStatus:not([hidden]){flex:none;margin:0 12px 8px;padding:8px 12px;border:1px solid #5f4e34;border-radius:9px;background:#181c23;color:#e5d3b1;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoFindSheetBackdrop{z-index:var(--ao-z-sheet,2147483000);background:rgba(0,0,0,.52)}
.aoHeritageSurface .aoFindSheet{padding-bottom:max(24px,env(safe-area-inset-bottom));background:linear-gradient(155deg,#17212a,#0c121b 54%);box-shadow:0 -10px 45px #0009}
.aoHeritageSurface .aoHeritagePreview{max-height:min(68dvh,570px);border-top:1px solid #ad9361;padding:8px 19px 21px}
.aoHeritageSheetHandle{height:4px;width:38px;background:#887c67;border-radius:99px;margin:3px auto 14px;opacity:.72}
.aoHeritageSurface .aoHeritagePreview header{align-items:start}
.aoHeritageSurface .aoHeritagePreview header small{color:#c8ae7c;font:650 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em}
.aoHeritageSurface .aoHeritagePreview h2{font:600 clamp(22px,4vw,29px)/1.12 var(--ao-font-display,Georgia,serif);color:#f2e9d7;letter-spacing:-.015em;max-width:580px}
.aoHeritageSurface .aoHeritagePreview header p{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#ac9e88}
.aoHeritageSynopsis{margin:17px 0 12px;color:#dfd1b8;font:15px/1.52 var(--ao-font-body,Georgia,serif)}
.aoHeritageSurface .aoHeritagePlaceTags{gap:5px;margin:11px 0}
.aoHeritageSurface .aoHeritagePlaceTags span{background:transparent;border-color:rgba(217,197,154,.22);color:#d8c7a8;font-size:10px;padding:5px 8px}
.aoHeritagePrecision{margin:7px 0;font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#aa9880}
.aoHeritageSurface .aoHeritageCaution{margin:9px 0;color:#b7aa95;font-size:11px}
.aoHeritageSurface .aoHeritagePreviewActions{margin-top:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px}
.aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{border-radius:10px;min-height:47px;padding:10px 14px}
.aoHeritageSurface .aoHeritagePreviewActions button{display:flex;justify-content:space-between;gap:14px}
.aoHeritageSurface .aoHeritagePreviewActions a{background:#182029}
.aoExplorePlaceSheet .aoPlaceAccordion{border-top:1px solid rgba(217,197,154,.17);margin:0;padding:0}
.aoExplorePlaceSheet .aoPlaceAccordion summary{cursor:pointer;display:flex;justify-content:space-between;align-items:center;min-height:50px;gap:12px;color:#edddbe;font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);list-style:none}
.aoExplorePlaceSheet .aoPlaceAccordion summary::-webkit-details-marker{display:none}
.aoExplorePlaceSheet .aoPlaceAccordion summary:after{content:"+";font:20px var(--ao-font-ui,system-ui,sans-serif);color:#bda780}
.aoExplorePlaceSheet .aoPlaceAccordion[open] summary:after{content:"−"}
.aoExplorePlaceSheet .aoPlaceAccordion .aoExplorePlaceRows{padding:3px 0 14px}
.aoExplorePlaceSheet .aoHeritageOverview{font:15px/1.52 var(--ao-font-body,Georgia,serif);color:#ddd0b8;margin:16px 0}
.aoExplorePlaceSheet .aoHeritageMeta{color:#a99d87;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoExplorePlaceSheet .aoFindSources details summary{cursor:pointer;min-height:44px;color:#ddcaad}
@media(max-width:520px){
  .aoHeritageSurface .aoFindHeader{padding:9px 8px 8px;grid-template-columns:40px minmax(0,1fr) 40px auto}
  .aoHeritageSurface .aoFindHeader button{width:40px;height:40px}
  .aoHeritageSurface .aoFindHeader h1{font-size:20px}
  .aoHeritageSurface .aoHeritageCategories{padding:5px 9px 9px}
  .aoHeritageSurface .aoHeritageCategories button{min-height:38px;padding:8px 10px}
  .aoHeritageSurface .aoHeritageTools{padding:0 8px 8px;gap:6px}
  .aoHeritageSurface .aoHeritageNearby{padding:7px 9px;font-size:11px}
  .aoHeritageSurface .aoHeritageMore summary{padding:0 10px}
  .aoHeritageMapHint{bottom:22px;left:17px}
  .aoHeritageSearchResults{bottom:16px;left:12px;width:calc(100% - 24px);max-height:42dvh}
  .aoHeritageSurface .aoHeritagePreview{padding:7px 16px 20px}
}
@media(prefers-reduced-motion:reduce){.aoHeritageSurface *, .aoHeritageSurface *:before, .aoHeritageSurface *:after{scroll-behavior:auto!important;transition:none!important}}
`;