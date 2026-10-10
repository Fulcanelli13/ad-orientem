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

/* Explore editorial layout: restrained map chrome, distinct content hierarchy. */
.aoHeritageSurface .aoFindHeader{display:grid;grid-template-columns:42px minmax(0,1fr) auto 42px;align-items:center;gap:10px;padding:12px 14px 9px;border-bottom:1px solid #bda47520}
.aoHeritageSurface .aoFindHeader>div{min-width:0}
.aoHeritageSurface .aoFindHeader small{font-size:9px;letter-spacing:.11em}
.aoHeritageSurface .aoFindHeader h1{font-weight:500;letter-spacing:-.02em}
.aoHeritageSurface .aoHeritageCount{min-width:40px;border:0;border-left:1px solid #d9c59a33;border-radius:0;background:none;padding:4px 8px;text-align:center;font:600 15px/1.1 var(--ao-font-display,Georgia,serif)}
.aoHeritageSurface .aoHeritageCount small{display:block;font:500 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:0;color:#b1a18a}
.aoHeritageSurface .aoHeritageTools{padding:10px 12px 7px;gap:7px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{background:#101925;border-color:#d9c59a44;border-radius:11px;min-height:48px;padding-left:40px}
.aoHeritageSurface .aoHeritageTools .aoFindSearch:before{left:14px;top:9px}
.aoHeritageSurface .aoHeritageNearby,.aoHeritageSurface .aoHeritageMore summary{background:#15202b;border:1px solid #d9c59a33;border-radius:11px;min-height:48px}
.aoHeritageSurface .aoHeritageMore>div{background:#101823;border-color:#d9c59a55;box-shadow:0 16px 45px #000c}
.aoHeritageSurface .aoHeritageSecondary button{background:#17212c;border:1px solid #d9c59a20;min-height:45px;font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritageSecondary .aoHeritageMassShortcut{display:flex;justify-content:space-between;align-items:center;border-color:#d9c59a66;background:#30291f;color:#f0ddbc;font-weight:650}
.aoHeritageSurface .aoHeritageCategories{padding:3px 12px 11px;gap:6px}
.aoHeritageSurface .aoHeritageCategories button{border-radius:10px;border:1px solid #d9c59a2e;min-height:48px;padding:8px 13px;background:#101721;font-size:12px}
.aoHeritageSurface .aoHeritageCategories button.active{background:#302a20;border-color:#c5a974;color:#f6e8ce}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{padding:0 6px 6px;min-height:230px}
.aoHeritageSurface .aoHeritageBody .aoFindMap{border-radius:10px;background:#0e1923}
.aoHeritageMapHint{border-radius:9px;background:#090e16dc;bottom:18px;left:18px;font-size:11px;box-shadow:none}
.aoHeritageSearchResults{background:#0d1721f5;border-radius:13px}
.aoHeritageSearchResults button{min-height:58px;padding:11px}
.aoHeritageSearchResults strong{font-size:15px}
.aoHeritageSurface .aoFindSheetBackdrop{background:#0004}
.aoHeritageSurface .aoHeritagePreview{box-sizing:border-box;max-height:min(56dvh,470px);overflow-y:auto;overscroll-behavior:contain;background:linear-gradient(145deg,#19242d,#0e151e 90%);border:1px solid #d9c59a44;border-top:2px solid #ba9d63;padding:9px 21px max(20px,env(safe-area-inset-bottom));box-shadow:0 -12px 35px #000a}
.aoHeritageSurface .aoHeritageSheetHandle{margin:0 auto 12px}
.aoHeritageCardHeading{display:flex;align-items:flex-start;justify-content:space-between;gap:14px}
.aoHeritageCardIdentity{display:flex;min-width:0;flex-direction:column;gap:5px}
.aoHeritageCardKicker{color:#c6a66f;font:700 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}
.aoHeritageCardLocation{color:#aaa08f;font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:55ch}
.aoHeritageCardClose{display:grid;flex:none;place-items:center;width:38px;height:38px;border:1px solid #d9c59a2a;border-radius:10px;color:#e9d8b7;background:#1c2832;font:26px/1 var(--ao-font-ui,system-ui,sans-serif)}
.aoHeritageSurface .aoHeritagePreview .aoHeritageCardTitle{font:500 clamp(22px,4.5vw,30px)/1.13 var(--ao-font-display,Georgia,serif);letter-spacing:-.02em;color:#f1e7d6;margin:9px 0 0;max-width:580px;text-wrap:balance}
.aoHeritageSurface .aoHeritageSynopsis,.aoHeritageSurface .aoHeritageCardEmpty{font:15px/1.5 var(--ao-font-body,Georgia,serif);color:#ded0bb;max-width:65ch;margin:11px 0 0;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.aoHeritageSurface .aoHeritagePlaceTags{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 0}
.aoHeritageSurface .aoHeritagePlaceTags span{background:#d9c59a0c;border-color:#d9c59a24;color:#cbb997}
.aoHeritageSurface .aoHeritagePreviewActions{margin-top:16px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:9px}
.aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{min-height:46px;border-radius:9px;padding:10px 13px;font-size:12px}
.aoHeritageSurface .aoHeritagePreviewActions button:first-child{background:#ccaf7e;color:#0b1420;border-color:#ccaf7e}
.aoHeritageSurface .aoHeritagePreviewActions a{background:#202b34;color:#f0ddbc}
.aoHeritageSurface .aoHeritagePrecision{margin:10px 0 0;font-size:10px;color:#ab9e86}
@media(min-width:760px){.aoHeritageSurface .aoHeritagePreview{max-width:540px;max-height:min(63dvh,520px);margin:0 0 25px 25px;border-radius:14px}.aoHeritageSurface .aoFindSheetBackdrop{align-items:flex-end;justify-content:flex-start}}
@media(max-width:520px){
 .aoHeritageSurface .aoFindHeader{grid-template-columns:38px minmax(0,1fr) auto 38px;gap:5px;padding:9px}
 .aoHeritageSurface .aoFindHeader button{width:38px;height:38px}
 .aoHeritageSurface .aoFindHeader h1{font-size:20px}
 .aoHeritageSurface .aoHeritageCount{min-width:28px;padding:3px 5px;font-size:13px}
 .aoHeritageSurface .aoHeritageCount small{display:none}
 .aoHeritageSurface .aoHeritageTools{padding:9px 8px 7px;gap:6px}
 .aoHeritageSurface .aoHeritageNearby{font-size:11px;padding:8px}
 .aoHeritageSurface .aoHeritageMore summary{font-size:11px;padding:0 9px}
 .aoHeritageSurface .aoHeritageCategories{padding:3px 8px 9px}
 .aoHeritageSurface .aoHeritageCategories button{min-height:48px;padding:8px 11px;font-size:11px}
 .aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{padding:0 3px 3px}
 .aoHeritageSurface .aoHeritagePreview{max-height:min(51dvh,430px);border-radius:16px 16px 0 0;padding:8px 16px max(18px,env(safe-area-inset-bottom))}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageCardTitle{font-size:23px}
 .aoHeritageSurface .aoHeritageSynopsis{font-size:14px}
 .aoHeritageSearchResults{left:10px;width:calc(100% - 20px);bottom:10px;max-height:39dvh}
 .aoHeritageMapHint{left:14px;bottom:16px;max-width:205px}
}

/* Record readers retain source-rich detail, but their discovery controls use
   the same hierarchy as the map instead of a dense six-column tab dashboard. */
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs{display:flex;grid-template-columns:none;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;gap:7px;padding:11px 14px 6px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs::-webkit-scrollbar{display:none}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs button{display:inline-flex;align-items:center;justify-content:center;gap:7px;flex:none;min-height:42px;min-width:0;border-radius:10px;padding:10px 14px;font-size:12px;font-weight:550;white-space:nowrap}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs button small{display:none}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs .aoExploreReturnMap{grid-column:auto;background:#25251f;border-color:#c6aa7866;color:#e8d5b3;font-weight:700}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs button.active{background:#cbb78e;border-color:#cbb78e;color:#101923}
.aoExploreSurface:not(.aoHeritageSurface) .aoFindList{gap:9px;padding:0 14px 32px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard{display:flex;flex-direction:column;align-items:stretch;gap:0;min-width:0;border:1px solid #d9c59a2a;background:#0f1721;border-radius:12px;padding:16px;text-align:left;box-shadow:none}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard .aoFindCardTop small{color:#c3aa7c;letter-spacing:.1em;font-size:10px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard>strong{font:500 20px/1.19 var(--ao-font-display,Georgia,serif);letter-spacing:-.01em;color:#f1e6d1;margin:8px 0 4px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard .aoExploreCardLocation{font:500 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#a99e8d;margin:3px 0 0}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard p{font:14px/1.45 var(--ao-font-body,Georgia,serif);color:#d1c5b0;margin:11px 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard .aoExploreCardOpen{display:flex;justify-content:space-between;gap:8px;margin-top:auto;padding-top:12px;border-top:1px solid #d9c59a20;font:650 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.02em;color:#d1b888}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}
@media(max-width:520px){.aoExploreSurface:not(.aoHeritageSurface) .aoExploreLensTabs{display:flex;grid-template-columns:none;padding:9px 9px 6px}.aoExploreSurface:not(.aoHeritageSurface) .aoFindList{padding:0 9px 28px}.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCard{padding:14px}}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreCardRecognition{font:650 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);font-style:normal;letter-spacing:0;color:#d6bd88;border:1px solid #d9c59a33;border-radius:6px;padding:4px 6px}

/* Keep R53 destination controls subordinate to the map rather than another dashboard. */
.aoHeritageSurface .aoExploreMainDestinations{padding:7px 12px 5px;gap:6px}
.aoHeritageSurface .aoExploreMainDestinations>*{min-height:46px;border-radius:10px;font-weight:600;font-size:11px}
.aoHeritageSurface .aoExploreMainDestinations>.active{background:#c6ae7f;color:#0b121b}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreSectionNav{margin:0 14px 8px;gap:12px}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreSectionNav>span{font-size:11px;letter-spacing:.06em}
.aoExploreSurface:not(.aoHeritageSurface) .aoExploreSectionSwitcher>summary{border-radius:10px;background:#17212b}
@media(max-width:520px){.aoHeritageSurface .aoExploreMainDestinations{padding:5px 9px 4px}.aoHeritageSurface .aoExploreMainDestinations>*{min-height:46px;font-size:11px;padding:8px 5px}}

/* The short Place preview is a non-modal map card. The detailed reader alone
   remains modal. Pins and controls outside the card must remain clickable. */
.aoHeritageSurface .aoHeritageCardLayer{pointer-events:none;background:transparent;align-items:flex-end}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{pointer-events:auto;overscroll-behavior:contain}
.aoHeritageSurface .aoHeritageCardClose{min-width:44px;width:44px;height:44px;min-height:44px;cursor:pointer}
.aoHeritageSurface .aoHeritageWorldReset{position:absolute;top:12px;left:16px;z-index:3;min-height:44px;max-width:48vw;display:inline-flex;align-items:center;gap:9px;padding:8px 13px;border-radius:10px;background:#0b151ee8;color:#efdfbf;border:1px solid #d5ba855c;box-shadow:0 4px 17px #0008;backdrop-filter:blur(12px);font:650 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoHeritageSurface .aoHeritageWorldReset:before{content:"";width:13px;height:13px;flex:none;border:1.5px solid #d6b77d;border-radius:50%;background:radial-gradient(circle at center,#d6b77d 0 2px,transparent 2px)}
.aoHeritageSurface .aoHeritageWorldReset:focus-visible{outline:2px solid #e7c887;outline-offset:2px}
.aoHeritageSurface .aoHeritageWorldReset:active{background:#302c23}
.aoHeritageSurface .aoHeritagePreviewActions{min-width:0}
.aoHeritageSurface .aoHeritagePreviewActions button{min-width:0}
.aoHeritageSurface .aoHeritagePreviewActions a{min-width:0}
@media(max-width:520px){
 .aoHeritageSurface .aoHeritageWorldReset{top:9px;left:11px;padding:8px 11px;font-size:11px}
 .aoHeritageSurface .aoHeritagePreviewActions{grid-template-columns:minmax(0,1fr) auto;gap:7px}
 .aoHeritageSurface .aoHeritagePreviewActions button,.aoHeritageSurface .aoHeritagePreviewActions a{padding-inline:11px}
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview{margin:0;width:100%;max-width:none}
}
@media(max-width:355px){
 .aoHeritageSurface .aoHeritageTools .aoFindSearch{min-width:78px}
 .aoHeritageSurface .aoHeritageTools .aoFindSearch input{font-size:16px;padding-right:5px;text-overflow:ellipsis}
 .aoHeritageSurface .aoHeritageNearby{font-size:10px;padding-inline:7px}
 .aoHeritageSurface .aoHeritageMore summary{padding-inline:7px;font-size:10px}
 .aoHeritageSurface .aoHeritagePreviewActions{grid-template-columns:minmax(0,1fr)}
 .aoHeritageSurface .aoHeritagePreviewActions a{justify-content:center}
}

/* R54 individual-record previews share map click-through; the full record
   reader and list-view previews retain normal modal focus semantics. */
.aoExploreSurface .aoExploreQuickPreviewLayer{pointer-events:none;background:transparent}
.aoExploreSurface .aoExploreQuickPreviewLayer .aoExploreQuickPreview{pointer-events:auto;overscroll-behavior:contain}
.aoExploreSurface .aoExploreQuickPreviewLayer .aoExploreQuickPreview header button{min-width:44px;min-height:44px}
`;